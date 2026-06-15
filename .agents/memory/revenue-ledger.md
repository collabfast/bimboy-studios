---
name: Revenue ledger invariant
description: The accounting rules and atomicity guarantee behind the earnings ledger.
---

The `earnings` table is an immutable ledger: every successful purchase fans out into
one row per participating creator (`kind=creator`) plus one platform row
(`kind=platform`). The rows for a purchase MUST sum exactly to the purchase amount.

**Split rules** (`artifacts/api-server/src/lib/revenue.ts` `computeRevenueSplit`):
- creator post: platform takes 20%; remaining 80% split among participants weighted by
  `video_participants.splitBps` (equal default).
- studio post: platform takes 33%; remainder split the same way.
- Any rounding remainder is assigned to the platform row, so the ledger always
  reconciles to the charge.

**Atomicity rule:** the purchase insert, the earnings fan-out, and the purchase
`video_event` are written inside one `db.transaction`. Never log-and-continue on a
ledger failure — a purchase must never exist without its split rows.

**Why:** earnings/payouts/rankings are all derived by summing ledger rows, so a missing
or non-reconciling row silently corrupts every downstream payout number.

**tsc gotcha:** typing a shared executor as
`Parameters<Parameters<typeof db.transaction>[0]>[0]` makes tsc hang for minutes on
Drizzle's huge types. Inline the ledger logic into the transaction closure instead of
extracting a helper that needs that type.
