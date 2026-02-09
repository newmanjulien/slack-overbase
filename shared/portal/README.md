# @overbase/portal

Shared contract types for the Slack app and the portal app.

Source of truth

- Types are derived from Convex functions in the Slack app repo.
- Do not hand-edit DTO shapes in the portal app.

Build

- Run `npm --prefix shared/portal run build` from the Slack app repo.
- This emits `dist/index.d.ts` with all types bundled for publishing.

Folders

- `src/` is the source of truth and imports Convex-generated types.
- `dist/` is the bundled output used for publishing and consumption.

Why this exists

- The portal app runs on Vercel and does not have the Convex runtime.
- The `convex/` folder is server code for Convex, not something the portal can import safely.
- The portal repo also does not have `convex/_generated` unless we ship it, which makes builds fragile.
- This package gives the portal a small, stable contract without pulling in Convex internals.
- Convex still stays the source of truth because these types are derived from Convex.
