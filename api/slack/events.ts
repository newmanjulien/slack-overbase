import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createBoltApp } from "../../src/app/createBoltApp";
import { handleBoltRequest } from "../../src/lib/vercelBoltAdapter";

const { receiver } = createBoltApp();

export default (req: VercelRequest, res: VercelResponse) => {
  const query = req.url && req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  req.url = `/slack/events${query}`;
  return handleBoltRequest(receiver, req, res);
};

export const config = {
  api: {
    bodyParser: false,
  },
};
