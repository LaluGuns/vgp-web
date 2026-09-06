# FINAL RELEASE REPORT

## DIRIXA RC13 Legal Release

Date: 2026-09-06

Authority: DIRIXA RC13

## Release checkpoint

- Android package: `com.virzyguns.dirixa`
- Android release authority: DIRIXA RC13
- Play Console checkpoint: production version 13, rollout 177/177, submission under review at the time of this legal release
- AdMob ad unit: `ca-app-pub-9018533091343425/9895483499`
- Legal implementation repository: `LaluGuns/vgp-web`
- Working branch: `fix/dirixa-legal-20260906`
- Pull request: `#49`
- Legal production merge commit: `691b7ad1163ab5c9179ea8d9a375c5d83dbf1b6c`

## Legal pages

- `https://www.virzyguns.com/privacy/dirixa`: HTTP 200 verified on production. Product-specific DIRIXA Privacy Policy is live.
- `https://www.virzyguns.com/terms/dirixa`: HTTP 200 verified on production. Product-specific DIRIXA Terms of Use are live.
- `https://www.virzyguns.com/terms`: HTTP 200 verified on production. The VGP root Terms of Use route is live and no longer returns 404.

## DIRIXA privacy coverage

The product-specific privacy policy reflects the RC13 behavior and covers:

- Local game progress and settings
- No required player account for core gameplay
- Google Mobile Ads / AdMob third-party processing
- Conditional consent and privacy controls where applicable
- Optional result sharing through the Android system share flow
- No camera, contacts, microphone, or precise-location requirement for core gameplay
- Retention and deletion behavior
- Third-party processing
- Privacy and deletion contact

The policy intentionally does not state that DIRIXA collects no data. Google Mobile Ads SDK documentation was checked during this release. Google's disclosure states that the SDK automatically collects and shares certain information including IP address, user product interactions, diagnostic information, and device and account identifiers for purposes including advertising, analytics, and fraud prevention. Consent/privacy wording is conditional because available controls can vary by region, device, consent state, configuration, and current Google requirements.

## DIRIXA terms coverage

The DIRIXA Terms of Use cover:

- License and eligibility
- Local progress and device data
- Gameplay updates and availability
- Optional result sharing
- Advertising and privacy
- Acceptable use
- Intellectual property
- Third-party services
- Disclaimer and liability
- Suspension and termination
- Governing terms and mandatory consumer rights
- Updates and contact

## Verification evidence

### Branch and merge

- Requested existing branch was used. The project was not recreated.
- Final pre-merge branch diff contained only the three requested legal implementation files:
  - `app/privacy/dirixa/page.tsx`
  - `app/terms/dirixa/page.tsx`
  - `app/terms/page.tsx`
- Pull request `#49` was merged to `main` with squash commit `691b7ad1163ab5c9179ea8d9a375c5d83dbf1b6c`.

### CI verification

A temporary one-shot GitHub Actions workflow was used for branch verification and removed before merge.

Verified PASS:

- Project dependency install using the repository-compatible install path
- `npm run lint`
- `npm run build`
- Next.js TypeScript validation performed during build

The repository's existing `package-lock.json` was not synchronized with `package.json`, so an initial `npm ci` attempt failed before linting. Verification was rerun with `npm install`, matching the install path used successfully by the project deployment. This was existing repository maintenance debt, not a DIRIXA legal regression.

### Production deployment

- Vercel production deployment: `dpl_CyKq5xXsXcVPti4yu8MDSDvJMFur`
- Source commit: `691b7ad1163ab5c9179ea8d9a375c5d83dbf1b6c`
- Deployment state: READY
- Production build output included `/privacy/dirixa`, `/terms/dirixa`, and `/terms`
- Production build completed successfully

### Public verification

Production readback confirmed:

- `/privacy/dirixa`: HTTP 200, correct DIRIXA Privacy Policy metadata and body content
- `/terms/dirixa`: HTTP 200, correct DIRIXA Terms of Use metadata and body content
- `/terms`: HTTP 200, correct VGP Terms of Use metadata and body content

## Play Console privacy URL

Required DIRIXA privacy URL:

`https://www.virzyguns.com/privacy/dirixa`

The Play Console privacy URL was not changed during this execution because no authenticated Google Play Console connector or browser session was available in the current tool environment. No claim is made that the Play Console field has been updated.

## Final legal status

DIRIXA RC13 legal pages are implemented, merged, deployed, and publicly verified. The only remaining external action is updating the Google Play Console privacy-policy field to the product-specific DIRIXA privacy URL when authenticated Play Console access is available.
