---
name: release-operator
description: Prepare and verify a production release for the root VGP Next.js app under the repository's AGENTS.md safety rules. Use when the user explicitly asks to release, deploy, ship, or verify Founder OS changes on the vgp-web Vercel project.
---

# Release Operator

1. Read the current repository `AGENTS.md` completely. Keep `flowstate/` out of
   scope and use Vercel project `vgp-web` with the mandated team scope.
2. Fetch `origin`, branch from current `origin/main`, and inspect every intended
   commit and changed path. Preserve dirty shared-tree work.
3. Run root typecheck, ESLint on every changed source file, focused security and
   contract tests, migration checks, plugin validation, and `git diff --check`.
4. Confirm migrations are additive and backward compatible. Confirm the MCP
   allowlist still has no approval, execution, send, publish, upload, reply, DM,
   OAuth, or disconnect capability.
5. Push the reviewed branch before deployment. Deploy only from a clean detached
   worktree at the pushed commit. Never use `vercel promote`.
6. Permit only one deployment owner. Stop if another session may be deploying.
7. After deployment, verify production alias, authenticated dashboard, public
   legal routes, read-only provider health, bridge reads, one safe DRAFT if
   needed, and relevant 4xx/5xx logs. Do not perform an external action.
8. Record exact commit, deployment, test outputs, live evidence, and remaining
   manual work. Build success alone is not completion.

Do not deploy merely because this skill triggered; require explicit user release
authority. Never stage broadly with `git add -A`, deploy a branch behind
`origin/main`, deploy from the shared dirty worktree, expose secrets, or touch
protected legal/private material.
