---
name: Orval zod param collision
description: Why an OpenAPI op must not mix path + query params in this project's codegen.
---

Orval generates a Zod schema named `<Op>Params` for BOTH path params (as a const) and
query params (as a type). If a single operation declares BOTH a path param AND a query
param, the two generated `<Op>Params` identifiers collide and codegen output fails to
compile.

**How to apply:** give each operation only one param style. Example fix: `/videos/stats`
takes `videoId` as a **query** param instead of a path param. Request body params are
fine — they reference the body schema by its `$ref` name, so they don't collide.

Codegen command: `pnpm --filter @workspace/api-spec run codegen`.
