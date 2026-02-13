# Responder app design

## Purpose
The responder app (App B) lives in a single internal Slack workspace. It receives messages from App A via Convex, posts them into per‑user channels, and relays human replies (text + files) back to App A. There is no LLM and no canvases.

## Constraints
- App A is installed in many customer workspaces; App B only in one internal workspace.
- Convex is the integration point for all cross‑app state.
- Files are streamed; Convex does not store file bytes.
- App A requires `RESPONDER_BOT_TOKEN` for cross‑workspace file transfers.

## Data contracts (shared)
- Shared contract: `shared/relay/types.ts`
- Relay file payload fields:
  - `sourceFileId`, `sourceWorkspace`, `filename`, `mimeType`, `size`
- Every relay payload includes `relayKey` for idempotency.

## Convex surfaces used by App B
- `api.relay.messages.enqueueRelay`
- `api.relay.channels.getChannelByTeamUser`
- `api.relay.channels.setChannelForTeamUser`
- `api.relay.dispatch.dispatchOutbound`
- `api.relay.installations.getUserAppBotToken`

## Endpoints (App B)
### POST /relay/inbound
Called by a Convex action when a relay message is ready to post into the responder workspace.

Payload:
- `relayKey`, `teamId`, `userId`, `text?`, `files?`, `messageId?`

Behavior:
- Lookup channel by `teamId + userId`.
- If missing, create channel and store mapping.
- Post text and files into the channel.
- If Slack returns 429/5xx, return 503 so Convex retries.
- On success, return 200.

## Slack behaviors (App B)
### Channel creation
- Channel name format: `ob-<teamId>-<userId>` with a short hash suffix if needed.
- Channel purpose/topic includes the routing key `teamId:userId`.

### Message handler
- Listen to messages in responder channels.
- Ignore bot’s own messages.
- Build outbound relay payload:
  - `text` from message
  - `files` (if any) with `sourceFileId`, `sourceWorkspace=responder`
- Call `enqueueOutbound` + `dispatchOutbound`.

### File handling
- On file shares, send `sourceFileId` + `sourceWorkspace`.
- The destination app downloads from the source workspace using the source bot token, then re‑uploads via Slack’s external upload flow.

## Retry + rate limiting
- Inbound relay posting respects Slack 429 with backoff. Return 503 to trigger Convex retry.
- Outbound dispatch uses `relayKey` to dedupe.

## Security
- All relay webhooks require a shared secret header.
 

## Observability
- Use `GET /relay/admin` (protected by `ADMIN_API_KEY`) to inspect recent relay failures and stuck messages.

## Open questions
- Do we want to store a minimal audit record for outbound failures in App B (in addition to Convex)?
