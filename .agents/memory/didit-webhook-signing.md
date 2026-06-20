---
name: Didit webhook signing
description: How to verify Didit (didit.me) verification webhooks correctly
---

Didit sends several signature headers on its v3 webhooks. Two verification paths:

1. **Raw-body HMAC (preferred):** `X-Signature` = HMAC-SHA256(secret, exact raw request body bytes). This is Didit's documented method and is immune to JSON re-encoding. The route MUST capture the raw body (mount `express.raw` BEFORE `express.json`) for this to work.
2. **"Simple" canonical:** `X-Signature-Simple` = HMAC-SHA256(secret, `"<timestamp>:<session_id>:<status>:<webhook_type>"`). The `<timestamp>` is the **`X-Timestamp` header value**, NOT the body's `timestamp` field. Using the body field breaks legitimate verifications.

**Why:** A code review caught the canonical being built from `parsedBody["timestamp"]`; that silently fails the simple-signature check and (without the raw fallback) would leave creators stuck never reaching `approved`.

**How to apply:** Verify raw-body sig first, simple sig second. Always enforce a timestamp skew window (±300s from `X-Timestamp`) to block replay. The webhook body's `vendor_data` carries the app's own id (we set it to the creator id at session creation) — use it to map the decision back to the row.
