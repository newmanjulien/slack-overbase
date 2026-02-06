import type { InstallationStore } from "@slack/bolt";
import express from "express";
import fs from "fs";
import path from "path";
import { sendCanvasToUser } from "./service.js";
import { persistCanvasAnswer } from "../../data/canvas.js";
import { getConfig } from "../../lib/config.js";

const resolveDemoPath = (...segments: string[]) =>
  path.join(process.cwd(), "src", "features", "canvas", "demo", ...segments);

export const registerCanvasAdminRoutes = (payload: {
  receiver: { app: express.Application };
  installationStore: InstallationStore;
  logger: { error: (meta: unknown, msg?: string) => void; warn: (meta: unknown, msg?: string) => void };
}) => {
  const { receiver, installationStore, logger } = payload;
  const buildInstallationQuery = (teamId: string) => ({
    teamId,
    isEnterpriseInstall: false,
    enterpriseId: undefined,
  });

  receiver.app.post(
    "/admin/send-canvas",
    express.json({ limit: "1mb" }),
    async (req, res) => {
      try {
        const { ADMIN_API_KEY } = getConfig();
        const providedKey =
          req.get("x-admin-key") ||
          req.get("authorization")?.replace("Bearer ", "");

        if (!providedKey || providedKey !== ADMIN_API_KEY) {
          return res.status(401).json({ ok: false, error: "unauthorized" });
        }

        const body = req.body || {};
        const userId = body.userId;
        const teamId = body.teamId || null;
        const canvasInput = body.canvas || {};

        if (!userId) {
          return res.status(400).json({ ok: false, error: "missing_user_id" });
        }
        if (!teamId) {
          return res.status(400).json({ ok: false, error: "missing_team_id" });
        }
        if (!canvasInput?.title) {
          return res.status(400).json({ ok: false, error: "missing_canvas_title" });
        }
        if (!canvasInput?.attachmentPath) {
          return res.status(400).json({
            ok: false,
            error: "missing_canvas_attachment",
            message: "Canvas attachmentPath is required to post a canvas.",
          });
        }

        const installation = await installationStore.fetchInstallation(buildInstallationQuery(teamId));
        const token = installation?.bot?.token;
        if (!token) {
          return res.status(500).json({ ok: false, error: "missing_bot_token" });
        }

        const result = await sendCanvasToUser({
          token,
          userId,
          teamId,
          canvas: canvasInput,
        });

        try {
          await persistCanvasAnswer(userId, { teamId }, {
            canvasId: result.canvasId,
            questionText: body.questionText,
            markdown: canvasInput.markdown,
            sentAt: Date.now(),
          });
        } catch (error) {
          logger.warn({ error }, "Canvas persistence failed");
        }

        return res.json({ ...result, ok: true });
      } catch (error) {
        logger.error({ error }, "Admin send canvas failed");
        return res.status(500).json({ ok: false, error: "server_error" });
      }
    },
  );

  receiver.app.post(
    "/admin/send-dummy-canvas",
    express.json({ limit: "1mb" }),
    async (req, res) => {
      try {
        const { ADMIN_API_KEY } = getConfig();
        const providedKey =
          req.get("x-admin-key") ||
          req.get("authorization")?.replace("Bearer ", "");

        if (!providedKey || providedKey !== ADMIN_API_KEY) {
          return res.status(401).json({ ok: false, error: "unauthorized" });
        }

        const body = req.body || {};
        const userId = body.userId;
        const teamId = body.teamId || null;

        if (!userId) {
          return res.status(400).json({ ok: false, error: "missing_user_id" });
        }
        if (!teamId) {
          return res.status(400).json({ ok: false, error: "missing_team_id" });
        }

        const installation = await installationStore.fetchInstallation(buildInstallationQuery(teamId));
        const token = installation?.bot?.token;
        if (!token) {
          return res.status(500).json({ ok: false, error: "missing_bot_token" });
        }

        const dummyMarkdownPath = resolveDemoPath("dummy.md");
        const dummyAttachmentPath = resolveDemoPath("lorem-ipsum.csv");

        const markdown = fs.readFileSync(dummyMarkdownPath, "utf8");

        const result = await sendCanvasToUser({
          token,
          userId,
          teamId,
          canvas: {
            title: "Lorem Ipsum",
            markdown,
            attachmentPath: dummyAttachmentPath,
          },
        });

        try {
          await persistCanvasAnswer(userId, { teamId }, {
            canvasId: result.canvasId,
            questionText: "lorem ipsum canvas",
            markdown,
            sentAt: Date.now(),
          });
        } catch (error) {
          logger.warn({ error }, "Canvas persistence failed");
        }

        return res.json({ ...result, ok: true });
      } catch (error) {
        logger.error({ error }, "Admin send dummy canvas failed");
        return res.status(500).json({ ok: false, error: "server_error" });
      }
    },
  );
};
