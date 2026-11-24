# Intechs Computers Hub

## Ready now - Windows
Extract the ZIP, then double-click **Intechs_Computers.exe**. Keep its small launcher window open while using the app. No installation of Node is necessary. It runs locally in your modern browser (Edge app window where available). This launcher is unsigned; Windows may require normal publisher verification. Do not disable security protections.

## Android and iOS source build
This contains the shared web app and Capacitor configuration. Install Node and dependencies with `npm install`. On a machine configured with Android Studio/SDK, run `npm run android:setup` once, then `npm run android:sync` and `npm run android:open`. Build and sign APK/AAB in Android Studio. On a Mac configured with Xcode, run `npm run ios:setup` once, then `npm run ios:sync` and `npm run ios:open`. Configure signing and archive in Xcode for TestFlight/App Store.

## macOS DMG and full Windows installer
On macOS use `npm install` and `npm run mac` to build a DMG. On Windows use `npm install` and `npm run windows` to build an NSIS installer. Platform signing/notarization requires the owner's signing credentials. No APK, IPA or DMG binary was generated in this Windows-only environment.

## Web app
The `www` directory contains the static app. An HTTPS web host allows browser installation as a progressive web app. All business records currently remain local to each app or browser; live stock, shared users, payment processing and cross-device data synchronization require a server integration before production use. The customer-shopping links lead to the official live Intechs website. Do not use the local app as your only source of business records; back up regularly.

