// Find & Found desktop app (Windows). Opens the live website when it is set in site.json,
// otherwise the copy of the app bundled inside the installer.
const { app, BrowserWindow, shell, protocol, net, session } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const SITE = (require('./site.json').url || '').trim();
const WWW = path.join(__dirname, '..', 'www');

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 360, minHeight: 560,
    title: 'Find & Found', backgroundColor: '#EEF2F8',
    icon: path.join(WWW, 'icon-512.png'),
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  win.setMenuBarVisibility(false);
  win.webContents.setUserAgent(win.webContents.getUserAgent() + ' FindFoundApp');
  // links to Google Maps, WhatsApp etc. open in the normal browser
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => {
    const ok = url.startsWith('app://') || (SITE && url.startsWith(SITE));
    if (!ok) { e.preventDefault(); shell.openExternal(url); }
  });
  const local = () => win.loadURL('app://findfound/index.html');
  if (SITE) win.loadURL(SITE).catch(local); else local();
}

app.whenReady().then(() => {
  protocol.handle('app', (req) => {
    const p = decodeURIComponent(new URL(req.url).pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.normalize(path.join(WWW, p));
    if (!file.startsWith(WWW)) return new Response('Not found', { status: 404 });
    return net.fetch(pathToFileURL(file).toString());
  });
  // allow the location and camera prompts the app asks for
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(['geolocation', 'media', 'clipboard-sanitized-write', 'fullscreen'].includes(perm)));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
