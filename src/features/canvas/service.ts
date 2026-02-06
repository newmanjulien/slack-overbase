import { WebClient } from "@slack/web-api";
import fs from "fs";

export const sendCanvasToUser = async (payload: {
  token: string;
  userId: string;
  teamId: string;
  canvas: { title: string; markdown?: string; attachmentPath?: string };
}) => {
  const client = new WebClient(payload.token);
  const dm = await client.conversations.open({ users: payload.userId });
  const channel = dm.channel?.id || payload.userId;

  const text = `*${payload.canvas.title}*\n${payload.canvas.markdown || ""}`;
  await client.chat.postMessage({ channel, text });

  let fileId: string | undefined;
  if (payload.canvas.attachmentPath) {
    const fileStream = fs.createReadStream(payload.canvas.attachmentPath);
    const upload = await client.files.upload({
      channels: channel,
      file: fileStream,
      filename: payload.canvas.attachmentPath.split("/").pop(),
    });
    fileId = upload.file?.id as string | undefined;
  }

  return {
    ok: true,
    canvasId: `${payload.teamId}:${Date.now()}`,
    fileId,
  };
};
