import type { InstallationStore } from "@slack/bolt";
import type { WebClient } from "@slack/web-api";
import { WebClient as SlackWebClient } from "@slack/web-api";
import express from "express";
import { getConfig } from "../../lib/config.js";
import { markRelayFailed, markRelaySent } from "../../data/relay.js";
import { addMessage, updateLastMessageAt } from "../../data/conversations.js";
import { getRateLimiter } from "../../lib/rateLimit.js";
import { retryWithBackoff, sleep } from "../../lib/retry.js";
import { transferSlackFile } from "./fileTransfer.js";
import { SOURCE_WORKSPACE_RESPONDER } from "@newmanjulien/overbase-contracts";

type RelayFile = {
  filename?: string;
  mimeType?: string;
  sourceFileId?: string;
  sourceWorkspace?: string;
};

type OutboundPayload = {
  relayKey: string;
  teamId: string;
  userId: string;
  text?: string;
  files?: RelayFile[];
  messageId?: string;
};

const openDmChannel = async (client: WebClient, userId: string) => {
  const dm = await client.conversations.open({ users: userId });
  return dm.channel?.id || userId;
};

const postText = async (client: WebClient, channel: string, text: string) => {
  await client.chat.postMessage({ channel, text });
};

const isSlackRetryable = (error: unknown) => {
  const err = error as { data?: { error?: string } };
  const code = err?.data?.error;
  return code === "ratelimited" || code === "timeout" || code === "internal_error";
};

const getSlackRetryAfterMs = (error: unknown) => {
  const err = error as { data?: { retry_after?: number } };
  const retryAfter = err?.data?.retry_after;
  if (typeof retryAfter === "number" && retryAfter > 0) {
    return retryAfter * 1000;
  }
  return null;
};

const uploadFiles = async (destinationToken: string, channel: string, files: RelayFile[]) => {
  const { RESPONDER_BOT_TOKEN } = getConfig();
  if (!RESPONDER_BOT_TOKEN) {
    throw new Error("Missing responder bot token");
  }
  for (const file of files) {
    if (!file.sourceFileId) {
      throw new Error("Missing source file id");
    }
    if (file.sourceWorkspace !== SOURCE_WORKSPACE_RESPONDER) {
      throw new Error("Unexpected source workspace");
    }
    await transferSlackFile({
      sourceToken: RESPONDER_BOT_TOKEN,
      destinationToken,
      sourceFileId: file.sourceFileId,
      destinationChannelId: channel,
    });
  }
};

export const registerRelayOutboundRoutes = (payload: {
  receiver: { app: express.Application };
  installationStore: InstallationStore;
  logger: { error: (meta: unknown, msg?: string) => void };
}) => {
  const { receiver, installationStore, logger } = payload;

  receiver.app.post(
    "/relay/outbound",
    express.json({ limit: "2mb" }),
    async (req, res) => {
      let messageId: string | undefined;
      let failureCode = "relay_delivery_failed";
      try {
        const { RELAY_WEBHOOK_SECRET } = getConfig();
        const providedKey =
          req.get("x-relay-key") ||
          req.get("authorization")?.replace("Bearer ", "");

        if (!RELAY_WEBHOOK_SECRET || !providedKey || providedKey !== RELAY_WEBHOOK_SECRET) {
          return res.status(401).json({ ok: false, error: "unauthorized" });
        }

        const body = (req.body || {}) as OutboundPayload;
        messageId = body.messageId;
        const relayKey = body.relayKey;
        const teamId = body.teamId;
        const userId = body.userId;

        if (!relayKey || !teamId || !userId) {
          return res.status(400).json({ ok: false, error: "missing_required_fields" });
        }

        const installation = await installationStore.fetchInstallation({
          teamId,
          isEnterpriseInstall: false,
          enterpriseId: undefined,
        });
        const token = installation?.bot?.token;
        if (!token) {
          return res.status(500).json({ ok: false, error: "missing_bot_token" });
        }

        const client = new SlackWebClient(token);
        const limiter = getRateLimiter(`relay:${teamId}`, {
          capacity: 5,
          refillPerMs: 5 / 1000,
        });
        const delay = limiter.take(1);
        if (delay > 0) {
          await sleep(delay);
        }

        const channel = await retryWithBackoff(
          () => openDmChannel(client, userId),
          {
            attempts: 3,
            baseDelayMs: 500,
            maxDelayMs: 4000,
            jitter: 0.2,
            isRetryable: isSlackRetryable,
            getRetryAfterMs: getSlackRetryAfterMs,
          },
        );

        if (body.text) {
          await retryWithBackoff(
            () => postText(client, channel, body.text || ""),
            {
              attempts: 3,
              baseDelayMs: 500,
              maxDelayMs: 4000,
              jitter: 0.2,
              isRetryable: isSlackRetryable,
              getRetryAfterMs: getSlackRetryAfterMs,
            },
          );
          await addMessage(userId, { teamId }, { role: "assistant", content: body.text });
          await updateLastMessageAt(userId, { teamId }, Date.now());
        }

        if (Array.isArray(body.files) && body.files.length > 0) {
          failureCode = "relay_file_upload_failed";
          await uploadFiles(token, channel, body.files);
          await updateLastMessageAt(userId, { teamId }, Date.now());
        }

        if (body.messageId) {
          await markRelaySent(body.messageId);
        }

        return res.json({ ok: true });
      } catch (error) {
        if (messageId) {
          const details = error instanceof Error ? error.message : "unknown_error";
          await markRelayFailed(messageId, {
            errorCode: failureCode,
            errorMessage: details,
          });
        }
        logger.error({ error }, "Relay outbound delivery failed");
        return res.status(500).json({ ok: false, error: "server_error" });
      }
    },
  );
};
