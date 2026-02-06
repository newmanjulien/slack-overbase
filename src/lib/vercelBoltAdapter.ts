import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Request, Response } from "express";

export const handleBoltRequest = (
  receiver: { app: (req: Request, res: Response) => unknown },
  req: VercelRequest,
  res: VercelResponse,
) => {
  return receiver.app(req as unknown as Request, res as unknown as Response);
};
