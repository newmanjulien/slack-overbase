import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createBoltApp } from "../../src/app/createBoltApp";

const { receiver } = createBoltApp();

export default (req: VercelRequest, res: VercelResponse) => {
  const query = req.url && req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  req.url = `/slack/events${query}`;
  return receiver.app(req as any, res as any);
};

export const config = {
  api: {
    bodyParser: false,
  },
};
