# Slack Overbase

A TypeScript Slack app built on Bolt with Convex as the backing store. The app answers DMs with an LLM, provides an App Home UI (templates, recurring questions, datasources, settings), supports admin canvas routes, and generates portal links.

## Local setup

1) Copy `.env.example` to `.env` and fill in values.
2) Install dependencies: `npm install`
3) Start dev server: `npm run dev`

## Notes
- This app is a single service for simplicity. Business logic lives in `src/features/` and data access lives in `src/data/`.
- Convex is used only for persistence and queries; logic stays in the app.
