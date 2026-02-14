# Architecture

This system is three runtimes backed by one database. Convex lives only in the Slack app repo and is the source of truth.

## Mental model

- Slack app (A) owns Convex and all data shapes.
- Portal (web) is a UI client that only consumes Convex.
- Responder (B) is a relay worker in an internal Slack workspace.
- All shared types are published from the Slack app repo.

Flow:

Slack app (A) <-> Convex <-> Portal (web)
Slack app (A) <-> Convex actions <-> Responder (B) <-> internal Slack workspace

## Repos and responsibilities

### Slack app (slack-overbase)

Owns the backend.

Key folders:
- `convex/`: schema + functions for Slack, portal, and relay.
- `src/data/`: data access layer (Convex reads/writes).
- `src/features/`: reusable product modules.
- `src/features/portal-links/`: portal link plumbing.
- `src/home/`: Slack Home surface.
- `packages/contracts/`: shared contract package source.

### Portal (slack-portal)

UI client only.

Key folders:
- `src/data/`: Convex access (all reads/writes go here).
- `src/features/`: feature logic and server actions.
- `src/lib/`: infrastructure helpers (Convex client, session, errors).

### Responder (slack-responder)

Relay worker in a single internal Slack workspace.

Key folders:
- `src/data/`: Convex access (relay enqueue/dispatch + channel mappings).
- `src/routes/`: relay webhooks.
- `src/handlers/`: Slack event handlers.

## Contracts

Shared types are published as `@newmanjulien/overbase-contracts` from the Slack app repo.

Contracts include:
- Convex API typings (portal + relay + slack)
- Portal path allowlist
- Relay envelope types

Build/publish from the Slack app repo:

- `npm --prefix packages/contracts run build`
- `npm --prefix packages/contracts publish`

The portal and responder depend on the published package. No direct sharing of Convex source.

## Portal auth flow

1. Slack app builds a signed link to `/portal-link`.
2. `/portal-link` validates the signature, mints a one-time code in Convex, then redirects to the portal.
3. Portal consumes the code at `/auth/consume`, sets `ob_session`, and redirects to the requested page.

Every portal click must go through `/portal-link` so a new code is minted each time.

## Relay flow

Inbound (user DM -> responder channel):

1. Slack app receives a DM and enqueues a relay message in Convex.
2. Convex action calls responder `/relay/inbound`.
3. Responder posts into a per-user channel and writes the mapping in Convex.

Outbound (responder channel -> user DM):

1. Responder listens to messages in those channels and enqueues outbound relay.
2. Convex action calls Slack app `/relay/outbound`.
3. Slack app DMs the user and marks delivery.

## DX rules of thumb

- Convex changes happen only in `slack-overbase/convex`.
- If a type is shared, it belongs in `packages/contracts`.
- All portal Convex calls live in `slack-portal/src/data`.
- All responder Convex calls live in `slack-responder/src/data`.
- Never generate portal links directly in Slack views. Always use `/portal-link`.
