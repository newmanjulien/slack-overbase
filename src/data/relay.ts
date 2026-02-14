import { getConvexClient } from "../lib/convexClient.js";
import { api } from "../../convex/_generated/api.js";
import { requireTeamContext, TeamContext } from "../lib/teamContext.js";
import type { RelayFile } from "@newmanjulien/overbase-contracts";

export const enqueueInboundRelay = async (
  userId: string,
  teamContext: TeamContext,
  payload: {
    relayKey: string;
    text?: string;
    files?: RelayFile[];
    externalId?: string;
  },
) => {
  requireTeamContext(teamContext);
  const client = getConvexClient();
  return client.mutation(api.relay.messages.enqueueRelay, {
    relayKey: payload.relayKey,
    direction: "inbound",
    teamId: teamContext.teamId,
    userId,
    text: payload.text,
    files: payload.files,
    externalId: payload.externalId,
  });
};

export const markRelaySent = async (id: string) => {
  const client = getConvexClient();
  return client.mutation(api.relay.messages.markDelivered, {
    id: id as unknown as import("../../convex/_generated/dataModel.js").Id<"relay_messages">,
  });
};

export const markRelayFailed = async (
  id: string,
  payload: { errorCode: string; errorMessage?: string },
) => {
  const client = getConvexClient();
  return client.mutation(api.relay.messages.markFailed, {
    id: id as unknown as import("../../convex/_generated/dataModel.js").Id<"relay_messages">,
    errorCode: payload.errorCode,
    errorMessage: payload.errorMessage,
  });
};

export const dispatchInboundRelay = async (payload: {
  relayKey: string;
  teamId: string;
  userId: string;
  text?: string;
  files?: RelayFile[];
  messageId?: string;
}) => {
  const client = getConvexClient();
  return client.action(api.relay.dispatch.dispatchInbound, payload);
};
