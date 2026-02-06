import type { GenericMessageEvent, MessageEvent } from "@slack/types";

export const isDirectUserMessage = (
  message: MessageEvent,
): message is GenericMessageEvent => {
  if (message.type !== "message") return false;
  if ("subtype" in message && message.subtype) return false;
  if (message.channel_type !== "im") return false;
  return typeof (message as GenericMessageEvent).user === "string";
};

export const getEventMeta = (
  body: unknown,
  fallbackEventId?: string,
): { eventId?: string; eventTime?: number } => {
  if (!body || typeof body !== "object") {
    return { eventId: fallbackEventId };
  }
  const maybe = body as { event_id?: unknown; event_time?: unknown };
  return {
    eventId: typeof maybe.event_id === "string" ? maybe.event_id : fallbackEventId,
    eventTime: typeof maybe.event_time === "number" ? maybe.event_time : undefined,
  };
};
