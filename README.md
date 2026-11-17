# intechscomputers

## Find & Found

Lost & found, property and real estate, safety alerts and help nearby — on a satellite map. One codebase, four ways to use it:

| Where | How people get it |
|---|---|
| **Web** | Open the website link (GitHub Pages). Shows up on Google once indexed. |
| **Android** | Download `FindFound-Android.apk` from **Releases** and install it — or install the website from Chrome (⋮ → *Install app*). |
| **Windows** | Download `FindFound-Setup-….exe` (installer) or `FindFound-Portable-….exe` from **Releases** — or install the website from Edge/Chrome. |
| **iPhone / iPad** | Open the website in Safari → Share → *Add to Home Screen*. (An App Store version needs an Apple Developer account.) |

Every push to this repository rebuilds all of them automatically (**Actions** tab), and publishes a new release.

## One-time setup
1. **Settings → Pages → Source: GitHub Actions.** The website appears at `https://rodgergaspel.github.io/intechscomputers/`.
2. **Database:** follow `GO-LIVE.md` steps 1–6 (Firebase, free), then paste your config into `www/config.js` here on GitHub (pencil icon → *Commit*). Everything rebuilds with saving switched on.
3. In Firebase → Authentication → Settings → *Authorized domains*, add `rodgergaspel.github.io`.
4. Google Search Console (search.google.com/search-console) → add your site link → submit `sitemap.xml` so Google lists it sooner.

`www/` is the app. `electron/` is the Windows wrapper, `capacitor.config.json` the Android wrapper, `.github/workflows/build.yml` builds everything.
