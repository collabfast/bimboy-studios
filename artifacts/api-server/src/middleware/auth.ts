import type { Request, Response, NextFunction, RequestHandler } from "express";
import { jwtVerify } from "jose";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

const SECRET = process.env["SUPABASE_JWT_SECRET"];
if (!SECRET) {
  throw new Error("SUPABASE_JWT_SECRET is required for auth middleware");
}
const SECRET_BYTES = new TextEncoder().encode(SECRET);

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const m = /^Bearer\s+(.+)$/i.exec(header);
  return m ? m[1] : null;
}

async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET_BYTES, {
    algorithms: ["HS256"],
  });
  const sub = typeof payload.sub === "string" ? payload.sub : null;
  if (!sub) throw new Error("Token missing sub claim");
  const email = typeof payload["email"] === "string" ? (payload["email"] as string) : undefined;
  return { sub, email };
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

// re-export Express types so other modules can opt-in without importing twice
export type { Request, Response, NextFunction };
