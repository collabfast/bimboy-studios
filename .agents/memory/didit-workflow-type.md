---
name: Didit workflow type must be KYC for onboarding
description: Why creator ID verification 502s if DIDIT_WORKFLOW_ID points at a biometric_authentication workflow
---

# Didit: use a KYC workflow for new-user onboarding, not Biometric Authentication

`createSession` (artifacts/api-server/src/lib/didit.ts) only sends
`{workflow_id, vendor_data, callback}`. That is correct for a KYC flow where the
user captures their ID + selfie *during* the hosted session.

**Symptom:** session creation 400s with
`{"portrait_image":"This field is required for performing face match for biometric authentication."}`,
and the route surfaces it as HTTP 502 "Could not start identity verification."

**Root cause:** `DIDIT_WORKFLOW_ID` was set to a `workflow_type: biometric_authentication`
workflow. Biometric auth re-verifies a *returning* user against a stored reference
portrait, so it demands `portrait_image` at session creation — which we don't have
for a brand-new creator.

**Fix:** point `DIDIT_WORKFLOW_ID` at a `workflow_type: kyc` workflow (OCR + LIVENESS
+ FACE_MATCH). "Free KYC" works at no cost; "KYC + AML" adds AML screening (paid).
No code change needed — it is a config/secret fix.

**How to apply:** to inspect available workflows, GET
`https://verification.didit.me/v3/workflows/` with header `x-api-key: $DIDIT_API_KEY`;
each result has `workflow_type` and `features`. Pick a `kyc` one for onboarding.
DIDIT_WORKFLOW_ID is stored as a secret, so it cannot be changed via setEnvVars —
use requestEnvVar (the uuid itself is not sensitive). Restart the api-server after.
