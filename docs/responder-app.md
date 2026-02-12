# Responder app design

## Purpose
The responder app (App B) lives in a single internal Slack workspace. It receives messages from App A via Convex, posts them into per‑user channels, and relays human replies (text + files) back to App A. There is no LLM and no canvases.

## Constraints
- App A is installed in many customer workspaces; App B only in one internal workspace.
- Convex is the integration point for all cross‑app state.
- Files are streamed; Convex does not store file bytes.
- File proxy URLs are signed and use one‑time tokens.

## Data contracts (shared)
- Shared contract: `shared/relay/contract.ts`
- Relay file payload fields:
  - `teamId`, `fileId`, `expiresAt`, `filename`, `mimeType`, `size`, `token`, `proxyUrl`

## Convex surfaces used by App B
- `api.responder.relay.enqueueOutbound`
- `api.responder.relayChannels.getChannelByTeamUser`
- `api.responder.relayChannels.setChannelForTeamUser`
- `api.responder.dispatch.dispatchOutbound`

## Endpoints (App B)
### POST /relay/inbound
Called by a Convex action when a relay message is ready to post into the responder workspace.

Payload:
- `teamId`, `userId`, `text?`, `files?`, `messageId?`

Behavior:
- Lookup channel by `teamId + userId`.
- If missing, create channel and store mapping.
- Post text and files into the channel.
- If Slack returns 429/5xx, return 503 so Convex retries.
- On success, return 200.

### GET /relay/file
Proxy for outbound files (App B → App A).

Behavior:
- Verify signature and one‑time token via Convex.
- Stream file from Slack to caller.
- Claim token before streaming, finalize on success, release on failure.

## Slack behaviors (App B)
### Channel creation
- Channel name format: `ob-<teamId>-<userId>` with a short hash suffix if needed.
- Channel purpose/topic includes the routing key `teamId:userId`.

### Message handler
- Listen to messages in responder channels.
- Ignore bot’s own messages.
- Build outbound relay payload:
  - `text` from message
  - `files` (if any) with `proxyUrl`, `size`, `filename`, `mimeType`
- Call `enqueueOutbound` + `dispatchOutbound`.

### File handling
- On file shares, fetch metadata via `files.info`.
- If file is restricted/unavailable, log and skip.
- Create a proxy URL using `shared/relay/contract.ts` + one‑time token.

## Retry + rate limiting
- Inbound relay posting respects Slack 429 with backoff. Return 503 to trigger Convex retry.
- Outbound dispatch uses Convex idempotency (`externalId`) to avoid duplicates.

## Security
- All relay webhooks require a shared secret header.
- Proxy URLs are signed + one‑time token with expiry.

## Observability
- Log every relay post and outbound enqueue.
- Include messageId and teamId:userId in logs.

## Open questions
- How long should proxy token TTL be for outbound (App B → App A)?
- Do we want to store a minimal audit record for outbound failures in App B (in addition to Convex)?
