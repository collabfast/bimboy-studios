---
name: Creator profile ownership & collab-link access model
description: How bimboy-studios authorizes creator-profile mutations and CollabFast link reads (claim-on-first-edit + creator-only gate)
---

# Creator ownership & CollabFast access

`creators.ownerUserId` (nullable text) authorizes all creator-profile mutations.

## Claim-on-first-edit (must stay atomic)
An unowned creator (ownerUserId NULL) is claimed by the first authenticated user
to mutate it; thereafter only the owner may mutate. This applies to **every**
mutation endpoint (PATCH profile, POST refresh-followers), not just PATCH.

**Why:** there is no user↔creator account link yet (that is a separate follow-up).
Claim-on-first-edit is the interim ownership mechanism.

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
