# VGP Web — working rules

This file replaces the old `ANTIGRAVITY_*`, `CHATGPT_HANDOFF_*`, and
`*_HANDOFF_PROMPT*` documents. Those were snapshots of one-off tasks, they
contradicted each other, and following them caused two production
regressions on 2026-07-23. They are archived at
`C:\vgp-archive\2026-07-23-handoff-cleanup\`. **Do not resurrect them.**

## This repo holds two separate apps

| Path | Vercel project | Serves |
|---|---|---|
| repo root | `vgp-web` | `www.virzyguns.com`, `virzyguns.com` |
| `flowstate/` | `flowstate` | `flow.virzyguns.com` |

They are independent Next apps. The root `tsconfig.json` excludes
`flowstate/`. The `flowstate` project has **Root Directory = `flowstate`**,
so its deploy is still run from the repo root, not from inside `flowstate/`.

Team scope for every CLI call: `team_vZ1cAICvozAQbmxhCCoEDCFl`

## Deploying

`main` is the only source of truth. Always branch from it.

```
git fetch origin
git log origin/main..HEAD          # must contain only what you intend
git worktree add --detach C:\tmp\<name> <sha>
cd C:\tmp\<name>
vercel link --yes --project <vgp-web|flowstate> --scope team_vZ1cAICvozAQbmxhCCoEDCFl
vercel deploy --prod --yes --scope team_vZ1cAICvozAQbmxhCCoEDCFl
```

Rules that exist because breaking them cost real outages:

1. **Push before you deploy, never after.** On 2026-07-23 two commits were
   live in production while existing on no branch anywhere. A deploy from
   another branch erased them.
2. **Never deploy a branch that is behind `origin/main`.** Vercel does not
   merge — it rebuilds whatever the branch contains, so an older branch
   silently reverts everything newer. This is exactly how the licence PDF
   fix, the npm-audit fix, and `.gitattributes` were lost.
3. **Never `vercel promote` a Preview to production, in either project.**
   Both projects keep secrets scoped Production-only
   (`CREATOR_LICENSE_ENABLED`, `CREATOR_DOWNLOAD_SECRET`,
   `NEXT_PUBLIC_POSTHOG_KEY`, `DATABASE_URL`, …). A Preview build bakes
   Preview env, so promoting ships production with the Creator Licence
   disabled and analytics dead. Always rebuild with `--prod`.
4. **Deploy from a clean worktree, never from `F:\VGP WEB`.** The working
   tree carries untracked private material. `.vercelignore` is a safety net,
   not a licence to deploy from a dirty tree.
5. **One agent at a time.** Two sessions deploying this repo will revert each
   other. If another session may be active, do not deploy.
6. `vercel build --prod` fails on Windows (`EPERM: symlink`). Let Vercel
   build server-side.

## Gates before any production deploy

Root (`vgp-web`): `npx tsc --noEmit` and `npx eslint <changed files>`.
Ignore errors under `.next/` — those are stale generated types, not source.

Flow (`flowstate/`): `npm run typecheck`, `npm run lint`, `npm test`
(expect 60/60 + i18n parity 11 locales x 429 keys), `npm audit --omit=dev`
(expect 0). After deploying Flow, always re-run the SEO contract:

```
node scripts/release/runtime-seo-crawl.mjs --base-url https://flow.virzyguns.com --concurrency 8 --timeout-ms 30000
```

Expected: **160 pages, 160 sitemap entries, 223 internal targets.** Anything
less means the sitemap collapsed — roll back rather than debug in production.

## Never touch

- `legal-intake/`, `flowstate/scripts/legal/`, `**/output/legal-private/` —
  executed legal evidence and the Creator Licence tooling.
- Anything matching `*signature*`. A founder signature already leaked into
  git history once and had to be purged.
- Never `git add -A` in this repo; stage explicit paths only.

## Verifying the two things that keep breaking

**JSON-LD** — `next/script` silently drops inline JSON-LD because the CSP is
nonce-based and `next/script` does not carry the nonce. Schemas live in
`lib/seo/structured-data.ts` and are emitted from `app/layout.tsx` as plain
`<script nonce={nonce}>`. Never verify by reading the component; fetch the
page and count `application/ld+json` blocks. Expected on `www`: **3 blocks,
no duplicate `@type`, `sameAs` length 7 including the Spotify artist URL.**

**WebGL theme whiteout** — the cleanup in
`flowstate/components/scenes/webgl-background.tsx` must NOT call
`WEBGL_lose_context.loseContext()`. The canvas survives theme switches, so a
forced context loss is never restored and the canvas paints solid white on
the next switch back to glass. Deleting buffer/program/shaders is enough.
The `!isGlass` early return must also stay.

## Creator Licence invariants

Canonical attribution, exact string, never translated:

```
Music: Flow Creator Music by Chill Music Division / Virzy Guns Production - https://flow.virzyguns.com/creator-music
```

Eligible catalog is exactly 174 tracks (City Pop 49, Cyberpunk Jazz 43, Neo
Synthwave 82; Lofi excluded). Legal `.md`/`.csv` under `docs/legal/**` are
pinned `eol=lf` via `.gitattributes` — their SHA-256 is stored on every grant,
so a CRLF rewrite breaks fingerprint tests. If a legal test fails on Windows,
suspect line endings before suspecting data.

Unauthenticated grant requests must fail closed: valid origin →
`401 login_required`, foreign origin → `403 invalid_origin`. Private paths
(`/output/legal-private/`, `/legal-intake/`, raw `/tracks/**.mp3`) must 404.
