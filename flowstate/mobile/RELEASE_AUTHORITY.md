# Flow Android Release Authority

This folder is the Android release authority for Flow.

## Architecture

- Package: `com.virzyguns.flow`
- UI: Capacitor hybrid using the same Flow React pages, components, and `app/globals.css` as the web app.
- Do not port or recreate the UI in Jetpack Compose, React Native, Flutter, or another design system.
- Native Android code exists only for platform capabilities such as Google Play Billing, Media3/background audio, notifications/timer integration, secure/native device behavior, and Desk Mode keep-screen-on.

## Visual contract

- Portrait must preserve the shared Flow web visual language and mobile component behavior.
- Short landscape is an intentional Android Desk Mode, not the desktop web layout.
- Desk Mode recomposes the existing shared Tasks, Focus Timer, and Atmosphere surfaces into a compact three-column layout.
- Manual Skip must never count as a completed focus session or Pomodoro credit.
- Do not remove the safe-area, VisualViewport, keyboard, route-scroll, Android back-button, or landscape hardening in `mobile/src`.

## Generated Android project

`mobile/native/android` is the maintained native overlay source.
`mobile/android` is the generated Capacitor Android project after the overlay is applied.

Do not hand-edit generated Android files as the primary fix when the same fix belongs in `mobile/native/android` or `mobile/scripts/apply-android-native.mjs`.

## Mandatory verification

From `flowstate`:

```powershell
npm ci
npm run mobile:verify
npm run mobile:test
npm run mobile:typecheck
npm run mobile:build
npm audit --omit=dev --audit-level=high
npm run mobile:apply:android
npx cap sync android
npm run mobile:verify:android-release
```

For the final signed Windows release build:

```powershell
powershell -ExecutionPolicy Bypass -File .\mobile\scripts\build-android-release.ps1
```

That script is the signing authority. It keeps the private upload key outside the repo/Drive, runs the mandatory source and regression gates, reapplies the native overlay, builds the release bundle, runs release lint/unit tests, and verifies the AAB signature with `jarsigner -verify -strict -certs`.

## Release gate

Do not call the app production-ready until the signed AAB has been uploaded to Google Play Internal Testing and installed from Play on a real device, with portrait and landscape Desk Mode, authentication, real Play pricing/purchase/PENDING/restore, background audio, lock-screen controls, notifications, lifecycle, and crash/ANR smoke tests passing.
