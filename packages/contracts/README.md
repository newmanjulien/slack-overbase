# @newmanjulien/overbase-contracts

Shared contract types for:
- The main Slack app (slack-overbase)
- The portal app (slack-portal)
- The responder app (slack-responder)

Source of truth

- Types are derived from Convex functions in the Slack app repo.
- Do not hand-edit DTO shapes in the portal or responder apps.

Build

- Run `npm --prefix packages/contracts run build` from the Slack app repo.
- This copies `convex/_generated`, `convex/portal`, `convex/relay`, `convex/slack`, and `convex/crons.ts`
  into this package and emits `dist/*.js` and `dist/*.d.ts`.

Why this exists (plain English)

- The portal app runs outside the Slack app and should not include Convex source.
- The responder app needs Convex API typings for relay.
- This package gives both apps a small, stable contract without pulling in Convex runtime internals.
- Convex stays the source of truth because these types are derived from Convex.

Publish

- Publish this package to GitHub Packages.
- The portal and responder apps should depend on the published version in production.
