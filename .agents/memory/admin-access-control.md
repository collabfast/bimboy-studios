---
name: admin access control
description: How admin-only API routes are gated in the api-server (there is no DB role system).
---

# Admin access control

The api-server has **no role/isAdmin column or DB-backed role system**. Admin-only
routes are gated by `ensureAdmin` middleware (`artifacts/api-server/src/middleware/auth.ts`),
which checks the verified `req.userEmail` against an `ADMIN_EMAILS` allowlist
(comma-separated env var).

**Rule:** chain `requireAuth` *then* `ensureAdmin` — `ensureAdmin` relies on
`req.userEmail` being set by `requireAuth` from a verified Supabase JWT.

**Why:** the existing `/admin/*` web pages are client-only placeholders with no
real authorization. Any endpoint that exposes cross-creator data or moderation
controls (e.g. scene-application review) must add its own gate; don't assume the
admin UI is protected.

**Fail-closed:** when `ADMIN_EMAILS` is unset/empty, `isAdminEmail` returns false
for everyone, so admin endpoints 403. The frontend should detect 403 via the
thrown error's `.status` (note: `ApiError` is NOT re-exported from
`@workspace/api-client-react`'s barrel — check `error?.status === 403` instead of
`instanceof ApiError`).
