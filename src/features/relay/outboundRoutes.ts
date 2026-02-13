import type { InstallationStore } from "@slack/bolt";
import type { WebClient } from "@slack/web-api";
import { WebClient as SlackWebClient } from "@slack/web-api";
import express from "express";
import { getConfig } from "../../lib/config.js";
import { markRelayFailed, markRelaySent } from "../../data/relay.js";
import { addMessage, updateLastMessageAt } from "../../data/conversations.js";
import { getRateLimiter } from "../../lib/rateLimit.js";
import { retryWithBackoff, sleep } from "../../lib/retry.js";

type RelayFile = {
  filename?: string;
  mimeType?: string;
  size?: number;
  proxyUrl?: string;
  sourceFileId?: string;
  sourceWorkspace?: string;
  expiresAt?: number;
};

type OutboundPayload = {
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

const uploadFiles = async (client: WebClient, channel: string, files: RelayFile[]) => {
  for (const file of files) {
    if (typeof file.expiresAt === "number" && Date.now() > file.expiresAt) {
      throw new Error("Proxy URL expired");
    }
    if (!file.proxyUrl) {
      throw new Error("Missing proxy URL");
    }
    const proxyUrl = file.proxyUrl;
    const size = typeof file.size === "number" ? file.size : null;
    if (!size || size <= 0) {
      throw new Error("Missing file size");
    }

    const download = await retryWithBackoff(
      async () => {
        const response = await fetch(proxyUrl);
        if (!response.ok || !response.body) {
          const error = new Error(`Proxy fetch failed: ${response.status}`);
          (error as { status?: number }).status = response.status;
          throw error;
        }
        return response;
      },
      {
        attempts: 3,
        baseDelayMs: 500,
        maxDelayMs: 4000,
        jitter: 0.2,
        isRetryable: (err) => {
          const status = (err as { status?: number }).status;
          return status === 429 || (status !== undefined && status >= 500);
        },
        getRetryAfterMs: () => null,
      },
    );

    const uploadInfo = await retryWithBackoff(
      () =>
        client.files.getUploadURLExternal({
          filename: file.filename || "file",
          length: size,
        }),
      {
        attempts: 3,
        baseDelayMs: 500,
        maxDelayMs: 4000,
        jitter: 0.2,
        isRetryable: isSlackRetryable,
        getRetryAfterMs: getSlackRetryAfterMs,
      },
    );

    const uploadUrl = uploadInfo.upload_url as string | undefined;
    const fileId = uploadInfo.file_id as string | undefined;
    if (!uploadUrl || !fileId) {
      throw new Error("Missing upload URL");
    }

    const uploadResponse = await retryWithBackoff(
      async () => {
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "content-type": file.mimeType || "application/octet-stream",
            "content-length": String(size),
          },
          body: download.body,
        });
        if (!response.ok) {
          const error = new Error(`Upload failed: ${response.status}`);
          (error as { status?: number }).status = response.status;
          throw error;
        }
        return response;
      },
      {
        attempts: 3,
        baseDelayMs: 500,
        maxDelayMs: 4000,
        jitter: 0.2,
        isRetryable: (err) => {
          const status = (err as { status?: number }).status;
          return status === 429 || (status !== undefined && status >= 500);
        },
        getRetryAfterMs: () => null,
      },
    );

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    await retryWithBackoff(
      () =>
        client.files.completeUploadExternal({
          files: [{ id: fileId, title: file.filename || "file" }],
          channel_id: channel,
        }),
      {
        attempts: 3,
        baseDelayMs: 500,
        maxDelayMs: 4000,
        jitter: 0.2,
        isRetryable: isSlackRetryable,
        getRetryAfterMs: getSlackRetryAfterMs,
      },
    );
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
        const teamId = body.teamId;
        const userId = body.userId;

        if (!teamId || !userId) {
          return res.status(400).json({ ok: false, error: "missing_team_or_user" });
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
          await uploadFiles(client, channel, body.files);
          await updateLastMessageAt(userId, { teamId }, Date.now());
        }

        if (body.messageId) {
          await markRelaySent(body.messageId);
        }

        return res.json({ ok: true });
      } catch (error) {
        if (messageId) {
          const details = error instanceof Error ? error.message : "unknown_error";
          await markRelayFailed(messageId, `${failureCode}:${details}`);
        }
        logger.error({ error }, "Relay outbound delivery failed");
        return res.status(500).json({ ok: false, error: "server_error" });
      }
    },
  );
};
