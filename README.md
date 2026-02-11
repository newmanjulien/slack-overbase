# Slack Overbase

A TypeScript Slack app built on Bolt with Convex as the backing store. The app answers DMs with an LLM, provides an App Home UI (templates, recurring questions, datasources, settings), supports admin canvas routes, and generates portal links.

## 2 apps and 1 database

This product has two frontends (Slack app on Render and the portal on Vercel) that both talk to one Convex database.
Convex is the system of record. We keep validation and data rules in Convex functions so both apps behave the same way.
The apps should stay thin: they render UI, handle HTTP, and call Convex.

## Notes

- This app is a single service for simplicity. Business logic lives in `src/features/` and data access lives in `src/data/`.
- `npm run build` compiles only `src` so `tsc` does not type-check `convex/` (Convex has its own toolchain/types).
- Build uses esbuild globs (`src/index.ts` plus `src/**/*.ts`) to emit a full `dist/` tree; keep the quoted glob so nested files are included.
- Use `npm run build:verify` to sanity-check required build outputs (`dist/index.js` and `dist/features/`).

## To do

- Add persistent state store
