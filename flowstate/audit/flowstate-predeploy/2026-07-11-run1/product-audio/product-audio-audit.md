# Flowstate product and audio reliability audit

**Scope:** Read-only source/configuration audit plus safe local checks. No account, checkout, payment provider, Worker, Supabase, or production domain was used. Findings marked **manual** need the owner's disposable account or a deployed Test Mode integration.

## Result: No-Go

This track has one P0 and two P1 release blockers. The signed-audio and Pro-entitlement claims are not ready to validate as a release flow.

| ID | Severity | Affected flow | Finding |
| --- | --- | --- | --- |
| PA-01 | P0 | Landing previews and music/ambient delivery | The audio deploy contract is contradictory: excluding audio prevents public leakage but breaks landing previews; shipping the standalone bytes bypasses signed delivery. |
| PA-02 | P1 | Free/Pro entitlement and checkout value | The current app/Worker configuration force-unlocks Pro; premium ambient is client-only, and the catalog has no premium tracks. |
| PA-03 | P1 | Insights persistence | An offline outbox can write one person's session to the next account used in that browser. |
| PA-04 | P2 | Keyboard player control | `P` can put the player UI into “playing” with no selected track and no audio. |
| PA-05 | P2 | Playback recovery | Audio-signing/loading failures are console-only; the user gets no actionable error or retry state. |
| PA-06 | P2 | Restored ambient mix | Persisted ambient channels are restarted from an effect, outside a user gesture; Safari/iOS autoplay recovery is unproven and may remain silent. |
| PA-07 | P3 | Pomodoro continuity | A reset does not clear the persisted completed-session counter, so long-break cadence survives a reset/reload. |

## Findings

### PA-01 — P0 — audio deploy contract has two mutually failing paths

- **Evidence:** `.vercelignore:1-6` explicitly excludes `public/tracks/**/*.mp3|wav` and `public/sounds/**/*.mp3|wav`, which is the intended Vercel protection. The release audit separately found 308 audio files in a compiled standalone artifact. `app/page.tsx:28-47,79-101` hard-codes three `/tracks/...mp3` URLs and calls `new Audio(url)` directly; it never uses `resolveAudioUrl`. `app/api/dev-audio/route.ts:23-26` is correctly hard-disabled in production.
- **Reproduction A — honor the Vercel ignore:** Deploy with the stated ignore rules, click a landing soundtrack preview, and its direct `/tracks/...mp3` request must 404 because the byte was not uploaded.
- **Reproduction B — ship standalone/public bytes:** Deploy an artifact which includes those 308 files, then request a known raw `/tracks/...mp3` or `/sounds/...mp3` path directly. The request bypasses the Worker’s HMAC/expiry/entitlement contract.
- **Impact:** One release route creates a broken primary landing interaction; the other defeats the product's signed-delivery control. Local source inventory alone does **not** prove a Vercel deployment exposes audio, so there is no production-download claim here.
- **Required retest:** Make the landing previews use a deliberate signed-preview/Web Audio path that is compatible with the Worker's opaque response; keep raw audio absent from the Vercel build artifact. Before release, inspect the actual Vercel artifact, click all three previews, verify raw paths 404, verify a valid signed stream plays, and verify an expired signed stream returns 403.

### PA-02 — P1 — Pro delivery is not a working release contract

- **Evidence:** The audited local configuration has `NEXT_PUBLIC_AUDIO_WORKER_URL` empty and `NEXT_PUBLIC_PREMIUM_PROMO=1`; `hooks/use-entitlement.ts:17-21` force-sets every visitor to Pro in that mode. `worker/wrangler.toml:15-17` also sets `PREMIUM_PROMO = "1"`.
- **Evidence:** `worker/src/index.js:242-250` explicitly treats every `/sounds/...` item as `{ isPremium: false }`, while `components/mixer/ambient-mixer.tsx` declares five ambience items as `isPremium: true`. The bundled `public/tracks/catalog.json` has 295 entries and all are `isPremium: false`.
- **Reproduction:** With the promo flags as audited, load the app unauthenticated: `useEntitlement` sets `isPremium=true`. After flags are disabled, request a premium-labelled ambient key from the Worker’s URL endpoint without a bearer token; static code predicts a signed URL because ambience is never entitlement-gated.
- **Impact:** Checkout cannot demonstrate exclusive paid audio. The front-end lock is cosmetic and an unauthenticated caller can bypass premium-labelled ambience through the Worker. The empty Worker URL is observed only in local development configuration; Vercel configuration still needs separate artifact/environment proof.
- **Required retest:** Remove the public-audio bypass first. Disable both promo flags together, decide which tracks/sounds are genuinely Pro in the canonical R2 catalog, enforce that same map in the Worker, and test free versus Pro with a fresh browser storage state.

### PA-03 — P1 — session outbox can cross account boundaries

- **Evidence:** `lib/optimizer/persist.ts:124-154` stores an outbox entry without an owner ID. Later, `flushSessionOutbox` obtains whichever user is currently authenticated (`:76-78`) and inserts each queued row with that user's ID (`:87-89`).
- **Reproduction:** Account A completes a qualifying focus session while offline so it remains in local storage; A signs out; account B signs in on the same browser and reconnects. The queued session is inserted for B.
- **Impact:** Focus history and context-bookmark content can be attributed to the wrong account on a shared device or account switch. This is both data integrity and privacy harm.
- **Required retest:** Store the authenticated owner ID with each entry and only flush matching entries; discard or explicitly prompt on an account mismatch. Repeat the offline → sign-out → different-user → reconnect scenario and verify zero session is written to B.

### PA-04 — P2 — `P` shortcut creates a false playing state

- **Evidence:** `hooks/use-keyboard-shortcuts.ts:139-140` calls `player.resume()` when `P` is pressed and the player is not playing. `lib/stores/player-store.ts:76-77` makes `resume()` set only `isPlaying: true`. `components/audio/audio-driver.tsx:80-82` returns early when no current track exists, so no engine load/play follows.
- **Reproduction:** Open a fresh app state with no selected track, focus a non-text element, then press `P`. The store/UI becomes playing but no track/audio exists.
- **Impact:** Misleading play state and animated player UI; the advertised shortcut fails on its first use.
- **Required retest:** Make `P` select a valid free default track (the same policy as Space/the visible Play button), or leave the state unchanged and show a clear “select a track” response.

### PA-05 — P2 — failed audio has no user recovery path

- **Evidence:** On signing failure `components/audio/audio-driver.tsx:60-63` only logs the error and pauses the store. Ambient resolution similarly logs errors in `components/mixer/ambient-mixer.tsx:135-141`. There is no error state, retry action, or message rendered by either player surface.
- **Reproduction:** After Worker deployment, temporarily test a valid user against a missing catalog key or an expired/tampered signed URL once. The user-facing control silently stops while the error is only available in developer tools.
- **Impact:** A normal network hiccup is indistinguishable from a broken player and creates false support reports.
- **Required retest:** Expose a concise player/mixer error state with retry; test 403 expiry, network interruption, and a one-time Worker 5xx.

### PA-06 — P2 — persisted ambience needs browser autoplay validation

- **Evidence:** Mixer selections are persisted in `lib/stores/mixer-store.ts`, and `components/mixer/ambient-mixer.tsx:127-154` resolves/restarts them from an effect after render. The audio context can be created/resumed by `lib/audio/audio-engine.ts:12-26`, but this reload path is not synchronously inside a user gesture.
- **Reproduction (manual):** Activate two ambience channels, refresh, then wait without clicking audio controls. Repeat on Safari iOS and Safari desktop; check whether both loops become audible. Click a sound tile once and compare.
- **Impact:** A user can return to a visually active saved mix that is actually silent, especially on autoplay-restricted browsers.
- **Required retest:** Treat the restored mix as pending until an explicit user gesture unlocks audio, or provide an obvious “Resume ambience” action. Test Chrome, Safari desktop, and iOS Safari.

### PA-07 — P3 — reset does not reset Pomodoro cycle count

- **Evidence:** `lib/stores/timer-store.ts:124-135` resets current timer fields but not `sessionsCompleted`; `:203-207` persists that counter across reloads. Long-break selection uses it at `:80-87`.
- **Reproduction:** Complete a focus block, press Reset, then complete the next block or reload. The next long/short break reflects the older cycle count.
- **Impact:** Lower-severity expectation mismatch: “reset” does not restart a Pomodoro cycle.
- **Required retest:** Product owner chooses either “reset timer only” (rename/clarify it) or reset the cycle count too; verify the chosen behavior across reload.

## Checks completed

- `npx.cmd tsc --noEmit` — **PASS**.
- Static catalog/config inventory completed without exposing secrets: 295 catalog tracks are free-labelled; local audio Worker URL is empty; local premium-promo flag is enabled. `.vercelignore` is present, so local public-audio inventory is treated as a deployment-artifact verification concern, not proof of a live Vercel exposure.
- Interactive browser validation was not completed in this track: the required local `agent-browser` executable is unavailable in the workspace, and no user account or deployed Worker is in scope.

## Manual post-deploy / Test Mode blockers

1. Owner logs into a disposable Free account, confirms paid music, premium ambience, and premium scenes remain locked after both promo flags are off.
2. Complete Lemon Squeezy **Test Mode** checkout; verify the signed webhook creates the expected subscription/profile entitlement, redirects to `/app`, and the account badge/content unlocks after a full refresh.
3. Owner logs into a Pro account; verify premium stream issuance/playback, a byte-range request, expiry 403, and free-account rejection. Do not use production credentials as audit data.
4. Test timer lifecycle: fresh start, pause/resume, background-tab return, phase completion, skip, reset, and a >60-second session persistence/Insights appearance.
5. Test audio recovery: loss/recovery of network, expired URL, rapid track switches, crossfade, saved ambient reload, and all keyboard controls including `P` before selecting a track.
