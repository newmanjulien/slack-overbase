import { getConvexClient } from "../lib/convexClient.js";
import { api } from "../../convex/_generated/api.js";
import { requireTeamContext, TeamContext } from "../lib/teamContext.js";
export type RelayFile = {
  size: number;
  expiresAt?: number;
  filename?: string;
  mimeType?: string;
  proxyUrl?: string;
  sourceFileId?: string;
  sourceWorkspace?: string;
};

export const enqueueInboundRelay = async (
  userId: string,
  teamContext: TeamContext,
  payload: {
    text?: string;
    files?: RelayFile[];
    externalId?: string;
  },
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  return client.mutation(api.responder.relay.enqueueInbound, {
    teamId: teamContext.teamId,
    userId,
    text: payload.text,
    files: payload.files,
    externalId: payload.externalId,
  });
};

export const markRelaySent = async (id: string) => {
  const client = getConvexClient();
  return client.mutation(api.responder.relay.markSent, {
    id: id as unknown as import("../../convex/_generated/dataModel.js").Id<"relay_messages">,
  });
};

export const markRelayFailed = async (id: string, error: string) => {
  const client = getConvexClient();
  return client.mutation(api.responder.relay.markFailed, {
    id: id as unknown as import("../../convex/_generated/dataModel.js").Id<"relay_messages">,
    error,
  });
};

export const dispatchInboundRelay = async (payload: {
  teamId: string;
  userId: string;
  text?: string;
  files?: RelayFile[];
  messageId?: string;
}) => {
  const client = getConvexClient();
  return client.action(api.responder.dispatch.dispatchInbound, payload);
};
