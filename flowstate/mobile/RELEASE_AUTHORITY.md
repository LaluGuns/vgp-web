# Flow Android Release Authority

This folder is the Android release authority for Flow.

## Architecture

- Package: `com.virzyguns.flow`
- UI: Capacitor hybrid using the same Flow React pages, components, and `app/globals.css` as the web app.
- Do not port or recreate the UI in Jetpack Compose, React Native, Flutter, or another design system.
- Native Android code exists only for platform capabilities such as Google Play Billing, Media3/background audio, notifications/timer integration, secure/native device behavior, and Desk Mode keep-screen-on.

## Visual contract

- Portrait must preserve the shared Flow web visual language and mobile component behavior.
- Short landscape is intentional Android Desk Mode, not the desktop web layout.
- Desk Mode recomposes the existing Tasks, Focus Timer, and Atmosphere surfaces into a compact three-column layout.
- Manual Skip must never count as a completed focus session or Pomodoro credit.
- Do not remove safe-area, VisualViewport, keyboard, route-scroll, Android back-button, or landscape hardening in `mobile/src`.

## Generated Android project

`mobile/native/android` is the maintained native overlay source.

`mobile/android` is the generated Capacitor Android project after the overlay is applied.

Do not hand-edit generated Android files as the primary fix when the same fix belongs in `mobile/native/android` or `mobile/scripts/apply-android-native.mjs`.

CI must regenerate Android from zero and compare it against the committed `mobile/android`. CI must fail on drift. CI must not silently commit or repair release authority.

## Exact-commit CI

Both Flow mobile workflows must check out `${{ github.sha }}`, not the moving branch head. A green run therefore belongs to the commit that triggered it.

The release workflows are read-only. A CI run must never mutate the authority branch, refresh a lockfile by committing it, or push generated Android output.

## Mandatory source verification

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

Release CI additionally requires:

- debug and release assembly
- debug and release JVM unit tests
- debug and release lint
- release AAB generation
- generated Android equality with the committed authority
- no server-secret identifiers in packaged Android source
- no native `.so` libraries unless explicit 16 KB page-size verification is added first

## Codex source archive

The CI source archive must contain:

- `mobile/BUILD_AUTHORITY.json` with the exact branch and commit
- `mobile/SOURCE_MANIFEST_SHA256.txt` with SHA-256 for every tracked Flow authority file
- `CODEX_ANDROID_BUILD_HANDOFF.md` with the exact signed-build rules

The Windows signed-build script verifies the packaged source manifest before dependency installation or Android generation. A byte mismatch must fail closed.

## Signing authority

The only signed release command is:

```powershell
powershell -ExecutionPolicy Bypass -File .\mobile\scripts\build-android-release.ps1
```

The script must not create a new signing identity implicitly. If this is genuinely the first Flow Play signing setup, and there is no existing Flow upload key or certificate to preserve, key creation requires the explicit switch:

```powershell
powershell -ExecutionPolicy Bypass -File .\mobile\scripts\build-android-release.ps1 -CreateUploadKeyIfMissing
```

If Google Play already provides the expected upload-certificate SHA-256, enforce it:

```powershell
powershell -ExecutionPolicy Bypass -File .\mobile\scripts\build-android-release.ps1 -ExpectedUploadCertSha256 "<PLAY_SHA256>"
```

The private upload key stays under `%LOCALAPPDATA%\Flow\release-credentials`. It must never be stored in GitHub, Drive, a build artifact, or chat.

The signed release script requires Windows, Node.js 24.x, and JDK 21. It performs a clean dependency install, source/regression/typecheck/build/audit gates, native overlay and Capacitor sync, release verification, signed release APK and AAB builds, debug and release unit tests, release lint, strict AAB signature verification, upload-certificate fingerprinting, and a native-library guard.

A successful signed run writes only release outputs under `artifacts\android-release`:

- signed AAB
- signed APK
- `SHA256SUMS.txt`
- `FLOW_ANDROID_SIGNING_CERT.txt`
- `FLOW_UPLOAD_CERTIFICATE.pem`
- `FLOW_ANDROID_BUILD_RECEIPT.json`

`FLOW_ANDROID_BUILD_RECEIPT.json` records source provenance, toolchain versions, hashes, certificate fingerprints, and passed build gates. It must keep `internalTestingPassed` as `false` until the later Play runtime gate is actually completed.

## Release boundary

Source/build authority is not production readiness.

Do not mark Flow Android production-ready until the signed AAB is uploaded to Google Play Internal Testing and installed from Play on a real device. The later runtime gate includes portrait and Desk Mode landscape, authentication, real Play product pricing, PURCHASED/PENDING/restore behavior, backend verification, background audio, lock-screen controls, notification permission and delivery, lifecycle/process recreation, and crash/ANR checks.

Internal Testing is intentionally deferred until the source and Codex build authority are frozen.
