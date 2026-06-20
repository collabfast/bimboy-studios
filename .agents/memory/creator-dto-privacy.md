---
name: Creator DTO privacy boundary
description: Why creator contact email must never be on the public Creator DTO
---

The shared `toCreatorDto()` (artifacts/api-server/src/lib/feed-items.ts) feeds
**public** endpoints — `GET /creators`, `GET /creators/:handle`, and the creator
objects embedded in feed/library responses. Anything added there is world-readable.

**Rule:** Private creator PII (contact email, verification state, owner identity,
tokens) must NOT go on the `Creator` schema / `toCreatorDto`. Expose it only via
owner-authenticated routes that check `ownerUserId === req.userId` (e.g.
`GET /creators/:handle/email`).

**Why:** Email/emailVerified were briefly added to the public DTO and leaked every
creator's contact email to all visitors. Caught in code review.

**How to apply:** Before adding a field to the `Creator` OpenAPI schema or
`toCreatorDto`, ask "is this OK for anonymous visitors to see?" If not, make a
separate owner-only endpoint + DTO.
