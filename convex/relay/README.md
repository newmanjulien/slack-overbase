# Relay (Convex Boundary)

This folder owns the cross‑app relay pipeline between the userApp and responderApp.
Both apps call only these Convex APIs for relay work.

## Responsibilities
- Relay message enqueue + idempotency (`relayKey`)
- Relay channel mapping
- Relay dispatch (webhooks between apps)
- Relay cleanup (TTL)
- Secure access to userApp bot tokens for responderApp

## Notes
- Files are transferred directly between Slack workspaces (no proxy URLs).
- Relay data is ephemeral and cleaned up on a schedule.
