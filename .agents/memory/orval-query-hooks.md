---
name: Orval generated query hook typing
description: Why passing options.query to generated useGetX hooks can fail tsc even when LSP is clean
---

# Orval query hooks require an explicit queryKey when you pass `options.query`

When calling a generated react-query hook (e.g. `useGetVideoStats`,
`useListConsentDocuments`, `useGetCreatorEarnings`, `useListCreatorPayouts`) and
you pass the second `options` arg with a `query: {...}` object, the generated
`UseQueryOptions` type makes `queryKey` **required**. Passing only
`{ query: { enabled, retry } }` compiles fine in the Replit LSP but FAILS
`tsc -p tsconfig.json --noEmit` with TS2741 "Property 'queryKey' is missing".

**Why:** the LSP and the project's `tsc` config disagree here, so LSP-clean is
NOT a substitute for running the package's `typecheck` script before declaring done.

**How to apply:** inject the matching generated key helper inside `query`, e.g.
`query: { enabled, retry: false, queryKey: getGetCreatorEarningsQueryKey(handle) }`.
Key helpers are exported alongside the hooks (getGetVideoStatsQueryKey(params),
getListConsentDocumentsQueryKey(videoId), getGetCreatorEarningsQueryKey(handle),
getListCreatorPayoutsQueryKey(handle)). Alternatively refactor to
`getXxxQueryOptions(...)` + `useQuery`. Hooks that take only path/query *params*
(no options.query) are unaffected.

Also: `pnpm --filter @workspace/bimboy-studios run build` needs `PORT` and
`BASE_PATH` env vars at vite.config load time (workflow provides them); a bare
`build` from the shell errors on missing PORT/BASE_PATH — not a real build break.
