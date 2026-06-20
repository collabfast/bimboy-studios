---
name: Artifact path routing
description: Why public/webhook endpoints in this monorepo must live under an artifact's declared service paths
---

In this pnpm multi-artifact monorepo, the platform proxy routes requests to artifacts by the `paths` declared in each artifact's `.replit-artifact/artifact.toml` `[[services]]` block. This applies in BOTH dev preview and production.

- `bimboy-studios` (web) owns `/`.
- `api-server` owns `/api` only.

**Rule:** Any server endpoint that must be reachable from outside (e.g. a third-party webhook) has to sit under the owning artifact's declared path prefix. A route mounted at the Express root like `/webhooks/didit` is NOT reachable through the proxy — `/`-prefixed paths route to the web artifact, so it 404s. The Didit webhook had to be moved to `/api/webhooks/didit`.

**Why:** The proxy preserves the full path when forwarding (the api-server defines its own routes including the `/api` prefix, e.g. `/api/healthz`), so the public URL and the in-app route are identical.

**How to apply:** When adding any externally-hit endpoint to api-server, prefix it with `/api`. Verify through the proxy with `curl https://$REPLIT_DEV_DOMAIN/api/<path>` (a root-level path will 404). Production URL is the published deployment domain + the same `/api/...` path.
