# Find & Found — going live on web, Android and iPhone

This folder is the complete public app. One upload makes it work everywhere:
- **Web:** anyone opens your website link.
- **Android:** open the link in Chrome → menu ⋮ → **Install app**. It gets its own icon and opens full screen.
- **iPhone / iPad:** open the link in Safari → Share → **Add to Home Screen**.

## 1. Database and sign-in (Firebase, free tier)
1. Go to console.firebase.google.com → **Add project** → name it `findfound`.
2. **Build → Authentication → Get started** → turn on **Google** and **Anonymous** (the Android and Windows apps sign people in as private guests).
3. **Build → Firestore Database → Create database** (production mode).
4. **Firestore → Rules** → paste everything from `firestore.rules` → **Publish**.
5. **Project settings → Your apps → Web (</>)** → register → copy the `firebaseConfig` values into `config.js`.
6. To make yourself the admin (approve ads, set the theme and donation details): sign in once on your site, copy the ID shown at the bottom of the page, then in Firestore create collection `admins` with a document whose ID is that value (any field, e.g. `name: Rodgers`).

## 2. Put the folder online (pick one, all free)
- **GitHub Pages:** create repository `findfound`, upload all files in this folder, then Settings → Pages → Branch `main` → Save. Your link: `https://<your-username>.github.io/findfound/`.
- **Firebase Hosting:** `npm i -g firebase-tools`, `firebase login`, `firebase init hosting` (public folder = this folder), `firebase deploy`.
- **Netlify:** drag this folder onto app.netlify.com/drop.

Then in Firebase → Authentication → Settings → **Authorized domains**, add your site's domain.

## 3. Store listings (optional)
- **Google Play:** go to pwabuilder.com, enter your site link, choose **Android** → it builds a Play Store package from this app. Needs a Google Play developer account (one-time fee).
- **Apple App Store:** on pwabuilder.com choose **iOS**; the package is finished in Xcode on a Mac. Needs an Apple Developer account (yearly fee). Apple reviews apps and may ask for app-only features.

## What works where
| Feature | Claude page | Your website / installed app |
|---|---|---|
| Map, lost & found, property, alerts, help places, ratings, comments, photos, blur by hand, 30-s clips | ✓ | ✓ |
| AI Scan, AI face finding, AI fact check, automatic page translation | ✓ (uses Claude) | Off — needs an AI service you add later |
| Currency, dates, emergency numbers by country | ✓ | ✓ |

## Protecting the name
The footer says “© 2026 Find & Found™. All rights reserved.”. To make that enforceable, register the trademark (Kenya: KIPI, kipi.go.ke; other countries: WIPO Madrid system) and keep proof of creation dates. This is general information, not legal advice — a trademark agent can file it for you.
