# Slack app with a seperate portal

A TypeScript Slack app built on Bolt with Convex as the backing store. The app answers DMs with an LLM, provides an App Home UI (templates, recurring questions, datasources, settings), supports admin canvas routes, and generates portal links

There's a portal for users. It's a seperate Next.js app that uses the same Convex backend. All the Cokonvex code for both projects is in this project in the `convex/` directory

## Local setup

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`

## Notes

- This app is a single service for simplicity. Business logic lives in `src/features/` and data access lives in `src/data/`.
- Convex is used only for persistence and queries (as a database); logic stays in the app.
- `npm run build` compiles only `src` so `tsc` does not type-check `convex/` (Convex has its own toolchain/types).
- Build uses esbuild globs (`src/index.ts` plus `src/**/*.ts`) to emit a full `dist/` tree; keep the quoted glob so nested files are included.
- Use `npm run build:verify` to sanity-check required build outputs (`dist/index.js` and `dist/features/`).

## Data layer conventions

- Convex is the source of truth for allowed values. Use `v.union` for enums and `v.null()` where the UI can clear a field.
- `src/data/*` should expose stable DTOs (no `undefined` in public shapes). Normalize optional fields to `null` on read.
- Map Convex records once inside the data layer; keep UI code unaware of Convex shapes.
- Use explicit union types for user-selectable options (cadence, delivery, categories, etc.). Do not accept free-form strings unless that is the product requirement.
- Be consistent about return shapes:
  - If a mutation returns a record, always map and return the DTO.
  - If a mutation is fire-and-forget, return `void` or the raw response consistently within that module.
- Only expose Convex `Id<...>` types to the UI when the UI genuinely needs them (Home sections do).

## To do

- Add persistent state store
