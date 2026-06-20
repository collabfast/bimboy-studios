---
name: Bimboy account URL convention & X connect
description: Public creator URL format and the X (Twitter) connect signup flow for bimboy-studios
---

## Public creator URL convention
A creator's public/shareable page URL is `www.bimboy.com/<handle>/` (root-level
slug, trailing slash). Build it only through `artifacts/bimboy-studios/src/lib/links.ts`
(`accountUrl` / `accountUrlLabel` / `accountPath`) — do not hand-format the domain
elsewhere, so the format stays consistent across signup preview, creator hero, and
dashboard profile.

**Why:** the product wants a clean root-level vanity URL, not `/c/<handle>`.
**How to apply:** `/c/:handle` is still the in-app working route; `/:slug` is the
root-level fallback. When showing the *public* link, use the links.ts helpers
(domain form). When navigating inside the SPA, use the wouter routes.

## X (Twitter) connect on signup
Signup offers "Connect X (Twitter)" via `supabase.auth.signInWithOAuth({ provider:
"twitter", options: { redirectTo: <BASE_URL>signup } })`. On return, the connected
profile is read from `user.user_metadata` (probe `user_name` / `preferred_username`
/ `nickname` for the @handle, `full_name` / `name` for the display name). These
prefill display name + account name (handle), and the username is sent as `xHandle`
on `POST /creators` (which strips a leading `@`).

**Why:** lets creators onboard with their existing X identity and seeds the X
follower-count feature.
**Gotcha:** this requires the **Twitter provider to be enabled in the Supabase
project** (dashboard → Authentication → Providers). Until then the connect button
surfaces an error; the email path still works. The slug previewed at signup can
differ from the final handle when the server uniquifies a collision — the canonical
link is shown on the dashboard profile after creation.
