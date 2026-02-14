# Convex Portal functions

This folder defines Convex functions (queries/mutations) for portal-related persistence.

What goes here:
- Convex queries/mutations that read/write portal-related data.
- Argument validation and DB access logic.

What does NOT go here:
- Portal app code (the Next.js project lives elsewhere).
- App-side orchestration or UI composition.
- Client-side wrappers (those live in /src/data or in the portal app if needed).

Context:
- The portal is a separate Next.js project that uses the same Convex database.
- This repo is the only place that hosts Convex functions; the portal app does not have a /convex folder.
- Contract types are published from `packages/contracts`.

Note:
- Portal functions only. Shared DB tables live in convex/schema.ts.
- Relay functions live in /convex/relay.
