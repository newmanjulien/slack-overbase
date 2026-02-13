# Convex Responder functions

This folder defines Convex functions used by the responder Slack app (App B).
It owns the cross-workspace relay pipeline between the main Slack app, the responder app, and the portal.

What goes here:
- Convex queries/mutations for message relay and responder channel mapping.
- Safety helpers (idempotency, dispatch locks, rate limits) for the relay pipeline.

What does NOT go here:
- Main Slack app functions (those live in /convex/slack).
- Portal functions (those live in /convex/portal).
- Slack Web API calls or event handlers (those live in the app code).

Context:
- The responder app runs in a single workspace.
- The main Slack app runs across many workspaces.
- Both share the same Convex database and the relay tables in convex/schema.ts.

Notes:
- Relay enqueue mutations accept optional lock and rate-limit arguments.
- If provided, they can reject enqueues with "locked" or "rate_limited" responses.
- Files are relayed via short-lived proxy URLs (no Convex file storage).
- Proxy URLs include one-time tokens stored in relay_file_tokens.
- Tokens are claimed before streaming and finalized after a successful stream.
- The relay file signature contract lives in shared/relay/contract.ts.
