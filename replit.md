# [Project name]

_Replace the heading above with the project's name, and this line with one sentence describing what this app does for users._

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- DB schema (source of truth): `lib/db/src/schema/` (e.g. `creators.ts`)
- API contract (source of truth): `lib/api-spec/openapi.yaml` → Orval codegen → `@workspace/api-client-react` + `@workspace/api-zod`
- API server routes: `artifacts/api-server/src/routes/`; shared DTO mappers in `artifacts/api-server/src/lib/` (e.g. `feed-items.ts` `toCreatorDto` is PUBLIC)
- Web app: `artifacts/bimboy-studios/src/` (Vite + React + wouter)
- Email/verification: backend `artifacts/api-server/src/lib/resend.ts` + creator email routes in `routes/creators.ts`; frontend `pages/verify-email.tsx`

## Architecture decisions

- Creator contact email is private PII: it lives on the creator row but is exposed only via owner-authenticated `GET/POST /creators/:handle/email`, never on the public `Creator` DTO/`toCreatorDto`.
- Email verification uses a random token stored as a SHA-256 hash with a 24h expiry; the public `POST /email/verify` matches the hash and clears it on success.

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
