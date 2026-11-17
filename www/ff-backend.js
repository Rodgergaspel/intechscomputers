/* Find & Found — connects the site to your Firebase project.
   It gives the page the same small "claude.use(...)" interface it uses inside Claude,
   backed by Firebase Auth (Google sign-in), Cloud Firestore and, optionally, Cloud Storage. */
(function () {
  'use strict';
  var CFG = window.FF_FIREBASE_CONFIG || {};
  var ready = !!(CFG.apiKey && CFG.projectId && window.firebase && firebase.initializeApp);
  function none() { return Promise.resolve(null); }
  window.FFAuth = { configured: ready, signIn: function () {}, signOut: function () {}, user: null };
  if (!ready) { window.claude = { use: none }; return; }

  firebase.initializeApp(CFG);
  var auth = firebase.auth(), fs = firebase.firestore();
  var storage = CFG.enablePhotos && firebase.storage ? firebase.storage() : null;

  var authReady = new Promise(function (resolve) {
    var done = false;
    auth.onAuthStateChanged(function (u) {
      window.FFAuth.user = u;
      if (u) fs.doc('profiles/' + u.uid).set({ name: u.displayName || '', updatedAt: Date.now() }, { merge: true }).catch(function () {});
      if (!done) { done = true; resolve(u); }
    });
  });
  // Installed Android/Windows apps run inside a web view, where Google blocks its sign-in page,
  // so they sign people in as a private guest account automatically.
  var inApp = !!(window.Capacitor || /Electron|FindFoundApp/.test(navigator.userAgent || ''));
  window.FFAuth.inApp = inApp;
  authReady.then(function (u) { if (!u && inApp) auth.signInAnonymously().then(function () { location.reload(); }).catch(function () {}); });
  window.FFAuth.signIn = function () {
    if (inApp) return auth.signInAnonymously().then(function () { location.reload(); });
    var p = new firebase.auth.GoogleAuthProvider();
    return auth.signInWithPopup(p).then(function () { location.reload(); }, function (e) {
      if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return auth.signInWithRedirect(p);
      throw e;
    });
  };
  window.FFAuth.signOut = function () { return auth.signOut().then(function () { location.reload(); }); };

  // ---- error codes the page understands ----
  function mapErr(e) {
    var c = e && e.code || '';
    var code = c === 'permission-denied' || c === 'unauthenticated' || c === 'invalid-argument' || c === 'not-found' ? 'invalid_argument'
      : c === 'resource-exhausted' ? 'resource_exhausted' : 'unavailable';
    return { code: code, message: (e && e.message) || 'Request failed' };
  }
  function wrapP(p) { return p.catch(function (e) { throw mapErr(e); }); }

  // ---- snapshots ----
  function docSnap(s) { return { id: s.id, exists: s.exists, data: function () { return s.exists ? s.data() : undefined; }, metadata: { fromCache: s.metadata.fromCache, hasPendingWrites: s.metadata.hasPendingWrites } }; }
  function querySnap(q) {
    var docs = q.docs.map(docSnap);
    return { docs: docs, size: docs.length, empty: docs.length === 0, docChanges: function () { return q.docChanges().map(function (c) { return { type: c.type, doc: docSnap(c.doc), oldIndex: c.oldIndex, newIndex: c.newIndex }; }); }, metadata: { fromCache: q.metadata.fromCache, hasPendingWrites: q.metadata.hasPendingWrites } };
  }

  // ---- references ----
  function docRef(r) {
    return {
      id: r.id, path: r.path,
      get: function () { return wrapP(r.get()).then(docSnap); },
      set: function (d) { return wrapP(r.set(d)); },
      update: function (d) { return wrapP(r.update(d)); },
      'delete': function () { return wrapP(r.delete()); },
      onSnapshot: function (next, err) { return r.onSnapshot(function (s) { next(docSnap(s)); }, function (e) { if (err) err(mapErr(e)); }); },
      collection: function (p) { return colRef(r.collection(p)); }
    };
  }
  function query(q) {
    return {
      where: function (f, op, v) { return query(q.where(f, op, v)); },
      orderBy: function (f, dir) { return query(q.orderBy(f, dir || 'asc')); },
      limit: function (n) { return query(q.limit(n)); },
      get: function () { return wrapP(q.get()).then(querySnap); },
      onSnapshot: function (next, err) { return q.onSnapshot(function (s) { next(querySnap(s)); }, function (e) { if (err) err(mapErr(e)); }); }
    };
  }
  function colRef(c) {
    var o = query(c);
    o.path = c.path;
    o.doc = function (id) { return docRef(id ? c.doc(id) : c.doc()); };
    o.add = function (d) { return wrapP(c.add(d)).then(docRef); };
    return o;
  }
  var DB = { doc: function (p) { return docRef(fs.doc(p)); }, collection: function (p) { return colRef(fs.collection(p)); } };

  // ---- who is viewing ----
  var adminP = null;
  function isAdmin() {
    if (!adminP) adminP = authReady.then(function (u) { if (!u) return false; return fs.doc('admins/' + u.uid).get().then(function (s) { return s.exists; }, function () { return false; }); });
    return adminP;
  }
  var nameCache = {};
  var USER = {
    id: function () { return authReady.then(function (u) { return u ? u.uid : null; }); },
    isOwner: isAdmin, canEdit: isAdmin,
    can: function () { return Promise.resolve(null); },
    name: function () { return authReady.then(function (u) { return u && u.displayName || ''; }); },
    me: function () { return Promise.all([authReady, isAdmin()]).then(function (r) { var u = r[0]; return { id: u ? u.uid : null, name: u && u.displayName || '', avatarUrl: u && u.photoURL || '', color: '#1650C8', email: null, isOwner: r[1], canEdit: r[1] }; }); },
    profiles: function (ids) {
      ids = [].concat(ids || []).filter(function (x, i, a) { return x && a.indexOf(x) === i; });
      return Promise.all(ids.map(function (id) {
        if (nameCache[id] !== undefined) return Promise.resolve();
        return fs.doc('profiles/' + id).get().then(function (s) { nameCache[id] = s.exists && s.data().name || ''; }, function () { nameCache[id] = ''; });
      })).then(function () {
        var out = {}; ids.forEach(function (id) { out[id] = { id: id, name: nameCache[id] || '', avatarUrl: '', color: '#1650C8', email: null, isMe: !!(auth.currentUser && auth.currentUser.uid === id) }; });
        return out;
      });
    },
    search: function () { return Promise.resolve([]); }
  };

  // ---- photos (optional, needs Cloud Storage) ----
  var ASSETS = {
    upload: function (file) {
      var u = auth.currentUser; if (!u) return Promise.reject({ code: 'not_granted', message: 'Sign in first' });
      var path = 'uploads/' + u.uid + '/' + Date.now() + '-' + String(file.name || 'photo').replace(/[^\w.\-]+/g, '_');
      var ref = storage.ref(path);
      return ref.put(file, { contentType: file.type || 'image/jpeg' }).then(function () { return ref.getDownloadURL(); }).then(function (url) { return { id: url, url: url, sizeBytes: file.size, contentType: file.type }; });
    }
  };

  window.claude = {
    use: function (name) {
      if (name === 'db') return Promise.resolve(DB);
      if (name === 'user') return Promise.resolve(USER);
      if (name === 'assets') return authReady.then(function (u) { return storage && u ? ASSETS : null; });
      return none();
    }
  };
})();
