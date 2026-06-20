import { createHmac, timingSafeEqual } from "node:crypto";

// Didit ID/age (KYC) verification integration.
//
// Two surfaces are used:
//   1. Server creates a verification session (POST /v3/session/) and redirects
//      the creator to the returned hosted `url`.
//   2. Didit POSTs a signed webhook on every status change. The webhook — not
//      the browser callback — is the authoritative source of truth.
//
// No PII / document data is ever fetched or persisted here; we only ever read
// the terminal status and keep the session id for traceability.

const DIDIT_BASE = "https://verification.didit.me";

// Our internal id-verification states (mirrors the OpenAPI enum + DB default).
export type IdVerificationStatus =
  | "not_started"
  | "pending"
  | "in_review"
  | "approved"
  | "declined";

export function getDiditConfig(): {
  apiKey: string;
  workflowId: string;
  webhookSecret: string;
} | null {
  const apiKey = process.env["DIDIT_API_KEY"];
  const workflowId = process.env["DIDIT_WORKFLOW_ID"];
  const webhookSecret = process.env["DIDIT_WEBHOOK_SECRET"];
  if (!apiKey || !workflowId || !webhookSecret) return null;
  return { apiKey, workflowId, webhookSecret };
}

export class DiditNotConfiguredError extends Error {
  constructor() {
    super(
      "Didit is not configured. Set DIDIT_API_KEY, DIDIT_WORKFLOW_ID and DIDIT_WEBHOOK_SECRET.",
    );
    this.name = "DiditNotConfiguredError";
  }
}

export type CreatedSession = { sessionId: string; url: string };

// Create a hosted verification session for `vendorData` (we pass the creator
// id). `callback` is where Didit returns the user's browser after the flow; the
// real result still arrives via the signed webhook.
export async function createSession(args: {
  vendorData: string;
  callbackUrl: string;
}): Promise<CreatedSession> {
  const config = getDiditConfig();
  if (!config) throw new DiditNotConfiguredError();

  const res = await fetch(`${DIDIT_BASE}/v3/session/`, {
    method: "POST",
    headers: {
      "x-api-key": config.apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      workflow_id: config.workflowId,
      vendor_data: args.vendorData,
      callback: args.callbackUrl,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Didit session creation failed (${res.status}): ${text.slice(0, 300)}`,
    );
  }

  const data = (await res.json()) as {
    session_id?: string;
    url?: string;
  };
  if (!data.session_id || !data.url) {
    throw new Error("Didit session response missing session_id or url");
  }
  return { sessionId: data.session_id, url: data.url };
}

// Map a Didit status string to our internal enum. Returns null for statuses we
// don't want to act on (e.g. "In Progress"), so the webhook handler leaves the
// stored status unchanged.
export function mapDiditStatus(raw: unknown): IdVerificationStatus | null {
  if (typeof raw !== "string") return null;
  switch (raw.trim().toLowerCase()) {
    case "approved":
      return "approved";
    case "declined":
      return "declined";
    case "in review":
      return "in_review";
    // Terminal-but-incomplete states: let the creator start over.
    case "abandoned":
    case "expired":
    case "kyc expired":
      return "not_started";
    default:
      return null;
  }
}

const MAX_SKEW_SECONDS = 300;

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function hmacHex(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

// Verify a Didit webhook. Didit sends several signature headers; we accept the
// "Simple" canonical signature (immune to JSON re-encoding) and, when the raw
// body is available, the raw-body signature. The timestamp guards replay.
export function verifyWebhook(args: {
  rawBody: string;
  parsedBody: Record<string, unknown>;
  signatureSimple?: string | undefined;
  signatureRaw?: string | undefined;
  timestamp?: string | undefined;
  secret: string;
}): boolean {
  const { rawBody, parsedBody, signatureSimple, signatureRaw, timestamp, secret } =
    args;

  if (!timestamp) return false;
  const incoming = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(incoming)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - incoming) > MAX_SKEW_SECONDS) return false;

  // Primary: HMAC over the exact raw request body bytes. This is Didit's
  // documented signing method (X-Signature) and is immune to canonical-format
  // ambiguity.
  if (signatureRaw && rawBody) {
    if (safeEqualHex(hmacHex(secret, rawBody), signatureRaw)) return true;
  }

  // Secondary: the "Simple" canonical signature, which signs the
  // "timestamp:session_id:status:webhook_type" string. The timestamp here is
  // the validated X-Timestamp header value (not the body field), matching what
  // Didit signs.
  if (signatureSimple) {
    const canonical = [
      timestamp,
      parsedBody["session_id"] ?? "",
      parsedBody["status"] ?? "",
      parsedBody["webhook_type"] ?? "",
    ].join(":");
    if (safeEqualHex(hmacHex(secret, canonical), signatureSimple)) return true;
  }

  return false;
}
