---
name: Creator profile ownership & collab-link access model
description: How bimboy-studios authorizes creator-profile mutations and CollabFast link reads (claim-on-first-edit + creator-only gate)
---

# Creator ownership & CollabFast access

`creators.ownerUserId` (nullable text) authorizes all creator-profile mutations.

## Claim-on-first-edit (must stay atomic) — PROFILE mutations only
An unowned creator (ownerUserId NULL) is claimed by the first authenticated user
to mutate it; thereafter only the owner may mutate. This applies to the
**profile** mutation endpoints (PATCH profile, POST refresh-followers).

**Why:** claim-on-first-edit is the realistic account→creator linking mechanism
(there is no admin-assigns-creator flow). It is the onboarding path by which a
user becomes the owner.

## Money endpoints (earnings/payouts) — strict ownership, NO claim
GET earnings, GET payouts, POST payouts authorize on `ownerUserId === sub` and
return 403 otherwise. They must NOT claim an unowned creator — money movement
must never establish ownership. A user claims via profile first, then money
endpoints recognize them.

## Dashboard sources its creator selector from owned creators
`GET /me/creators` (authed) returns creators owned by the caller. The dashboard
(profile + earnings pages) drives its selector from this, not the global
`/creators` operator list. Fallback: when the user owns none, profile page shows
the full list so they can claim-on-first-edit; earnings page shows a "claim
first" empty state (no point listing creators whose earnings would 403).

**How to apply:** the claim must be race-safe. Do the authorization in the SQL
UPDATE WHERE clause, not only on a prior read:
`WHERE id = :id AND (owner_user_id IS NULL OR owner_user_id = :userId)`, set
`owner_user_id = :userId` in the same UPDATE when claiming, and treat 0 rows
returned as 403. A read-then-update without this guard lets two concurrent
first-edits both pass the NULL check and overwrite each other's claim.

## CollabFast link is creator-only, never public
`collabFastUrl` must NOT appear in any public Creator DTO (it was leaked there
once and rejected in review). Read it only via authenticated
`GET /creators/{handle}/collab` (returns CollabLink), gated on the viewer owning
≥1 creator (a "creator/pornstar"); fans get 403.

**Why:** CollabFast links are a creator-to-creator collaboration affordance, not
fan-facing. A localStorage "viewer mode" toggle is NOT an acceptable gate — it is
trivially bypassable; the gate must be server-side.
