import { Router, type IRouter, raw } from "express";
import { db, creatorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getDiditConfig, mapDiditStatus, verifyWebhook } from "../lib/didit";

// Didit signed webhook. Mounted at the ROOT (not under /api) with a raw body
// parser so the HMAC can be verified against the exact bytes Didit signed. This
// is the AUTHORITATIVE source of a creator's id-verification status — the
// browser callback is only a UI hint.
const router: IRouter = Router();

router.post(
  "/api/webhooks/didit",
  raw({ type: "*/*" }),
  async (req, res) => {
    const config = getDiditConfig();
    if (!config) {
      // Not configured — accept-and-ignore so Didit doesn't endlessly retry,
      // but log it so misconfiguration is visible.
      req.log?.warn("Didit webhook received but Didit is not configured");
      res.status(200).json({ ok: true });
      return;
    }

    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : typeof req.body === "string"
        ? req.body
        : "";

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      res.status(400).json({ error: "Invalid JSON" });
      return;
    }

    const header = (name: string): string | undefined => {
      const v = req.headers[name.toLowerCase()];
      return Array.isArray(v) ? v[0] : v;
    };

    const ok = verifyWebhook({
      rawBody,
      parsedBody: parsed,
      signatureSimple: header("x-signature-simple"),
      signatureRaw: header("x-signature"),
      timestamp: header("x-timestamp"),
      secret: config.webhookSecret,
    });
    if (!ok) {
      req.log?.warn("Didit webhook signature verification failed");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    const status = mapDiditStatus(parsed["status"]);
    const vendorData =
      typeof parsed["vendor_data"] === "string"
        ? (parsed["vendor_data"] as string)
        : null;

    // Nothing actionable (e.g. an intermediate "In Progress" event) — ack it.
    if (!status || !vendorData) {
      res.status(200).json({ ok: true });
      return;
    }

    // vendor_data is the creator id we set when creating the session.
    const result = await db
      .update(creatorsTable)
      .set({ idVerificationStatus: status })
      .where(eq(creatorsTable.id, vendorData))
      .returning({ id: creatorsTable.id });

    if (result.length === 0) {
      req.log?.warn(
        { vendorData },
        "Didit webhook: no creator matched vendor_data",
      );
    }

    res.status(200).json({ ok: true });
  },
);

export default router;
