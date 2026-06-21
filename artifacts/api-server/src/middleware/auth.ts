import type { Request, Response, NextFunction, RequestHandler } from "express";
import {
  jwtVerify,
  createRemoteJWKSet,
  decodeProtectedHeader,
  decodeJwt,
  type JWTPayload,
} from "jose";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

// Legacy HS256 verification uses the project's shared JWT secret. Newer Supabase
// projects sign tokens with asymmetric keys (ES256/RS256) served from a JWKS
// endpoint, so the secret may be absent — we only require it for HS* tokens.
const SECRET = process.env["SUPABASE_JWT_SECRET"];
const SECRET_BYTES = SECRET ? new TextEncoder().encode(SECRET) : null;

// Base Supabase URL, used to build the expected issuer and JWKS URL so we never
// fetch keys from an issuer we don't trust.
const SUPABASE_URL = (
  process.env["VITE_SUPABASE_URL"] ||
  process.env["SUPABASE_URL"] ||
  ""
).replace(/\/$/, "");
const EXPECTED_ISSUER = SUPABASE_URL ? `${SUPABASE_URL}/auth/v1` : null;

const ASYMMETRIC_ALGS = ["ES256", "RS256"];

// Cache one remote JWKS per issuer; createRemoteJWKSet handles its own caching
// and key rotation internally.
const jwksByIssuer = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(issuer: string) {
  let jwks = jwksByIssuer.get(issuer);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
    jwksByIssuer.set(issuer, jwks);
  }
  return jwks;
}

// Only trust issuers that match the configured Supabase project, or — if the URL
// isn't configured — any *.supabase.co auth issuer.
function resolveTrustedIssuer(token: string): string {
  if (EXPECTED_ISSUER) return EXPECTED_ISSUER;
  const claims = decodeJwt(token);
  const iss = typeof claims.iss === "string" ? claims.iss : "";
  let host: string;
  try {
    host = new URL(iss).host;
  } catch {
    throw new Error("Token has an invalid issuer");
  }
  if (!host.endsWith(".supabase.co")) {
    throw new Error("Token issuer is not a trusted Supabase project");
  }
  return iss.replace(/\/$/, "");
}

async function verifyToken(token: string) {
  const header = decodeProtectedHeader(token);
  const alg = typeof header.alg === "string" ? header.alg : "";

  let payload: JWTPayload;
  if (alg.startsWith("HS")) {
    if (!SECRET_BYTES) {
      throw new Error("SUPABASE_JWT_SECRET is not configured for HS256 tokens");
    }
    ({ payload } = await jwtVerify(token, SECRET_BYTES, {
      algorithms: ["HS256"],
    }));
  } else if (ASYMMETRIC_ALGS.includes(alg)) {
    const issuer = resolveTrustedIssuer(token);
    ({ payload } = await jwtVerify(token, getJwks(issuer), {
      algorithms: ASYMMETRIC_ALGS,
      issuer,
    }));
  } else {
    throw new Error(`Unsupported token algorithm: ${alg || "none"}`);
  }

  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!sub) throw new Error("Token missing sub claim");
  const email =
    typeof payload["email"] === "string" ? (payload["email"] as string) : undefined;
  return { sub, email };
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const m = /^Bearer\s+(.+)$/i.exec(header);
  return m ? m[1] : null;
}

export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const { sub, email } = await verifyToken(token);
    req.userId = sub;
    req.userEmail = email;
  } catch {
    // Ignore invalid tokens on optional routes.
  }
  next();
};

export const requireAuth: RequestHandler = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    const { sub, email } = await verifyToken(token);
    req.userId = sub;
    req.userEmail = email;
    next();
  } catch (err) {
    req.log?.warn({ err: (err as Error).message }, "JWT verification failed");
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Admin allowlist — a comma-separated list of email addresses in the
// ADMIN_EMAILS env var. Fail-closed: when unset, nobody is an admin.
const ADMIN_EMAILS = new Set(
  (process.env["ADMIN_EMAILS"] || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.toLowerCase());
}

// Gate for admin-only routes. Chain *after* requireAuth so req.userEmail is set
// from a verified token, then check it against the allowlist.
export const ensureAdmin: RequestHandler = (req, res, next) => {
  if (!isAdminEmail(req.userEmail)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
};

// re-export Express types so other modules can opt-in without importing twice
export type { Request, Response, NextFunction };
