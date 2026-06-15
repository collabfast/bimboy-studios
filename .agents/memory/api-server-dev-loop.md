---
name: api-server dev loop
description: How the api-server runs in dev and how to smoke-test it correctly.
---

The `@workspace/api-server` dev workflow runs `build && start` — it esbuild-bundles
to `dist/` on startup and runs the bundle, NOT a live-reload watcher.

**Rule:** after editing api-server source, restart the workflow
(`artifacts/api-server: API Server`) before smoke-testing, or you'll hit the stale
bundle. A symptom of testing a stale build is an error stack trace pointing at a
line number that no longer matches your edited file.

**Where it listens:** port **8080** (from `PORT`), and routes are mounted under the
`/api` prefix. So smoke-test with `curl http://localhost:8080/api/...`, not port 5000
and not the bare path.

**Auth for tests:** mint an HS256 JWT signed with `SUPABASE_JWT_SECRET` (present in the
bash shell env, NOT in the code_execution sandbox). Use `psql "$DATABASE_URL"` for DB
checks; `pg`/`process.env.DATABASE_URL` are not available in the sandbox.
