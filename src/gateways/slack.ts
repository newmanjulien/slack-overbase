import type {
  BlockAction,
  BlockElementAction,
  ButtonAction,
  CheckboxesAction,
  EnvelopedEvent,
  KnownEventFromType,
  MultiUsersSelectAction,
  OverflowAction,
  StaticSelectAction,
} from "@slack/bolt";
import type { GenericMessageEvent } from "@slack/types";

export type MessageEvent = KnownEventFromType<"message">;
export type MessageEnvelope = EnvelopedEvent<MessageEvent>;

export const isDirectUserMessage = (message: MessageEvent): message is GenericMessageEvent => {
  return (
    message.type === "message" &&
    (message.subtype === undefined || message.subtype === "file_share") &&
    message.channel_type === "im" &&
    typeof message.user === "string"
  );
};

export const isUserMessage = (message: MessageEvent): message is GenericMessageEvent => {
  return (
    message.type === "message" &&
    (message.subtype === undefined || message.subtype === "file_share") &&
    typeof message.user === "string"
  );
};

export const getEventId = (body: MessageEnvelope, message: MessageEvent): string => {
  return body.event_id || message.ts;
};

export const getEventTimeMs = (body: MessageEnvelope): number | null => {
  return typeof body.event_time === "number" ? body.event_time * 1000 : null;
};

export const firstAction = <T extends BlockElementAction>(
  body: BlockAction<T>,
): T | undefined => body.actions[0];

export const isStaticSelectAction = (
  action: BlockElementAction | undefined,
): action is StaticSelectAction => action?.type === "static_select";

export const isMultiUsersSelectAction = (
  action: BlockElementAction | undefined,
): action is MultiUsersSelectAction => action?.type === "multi_users_select";

export const isCheckboxesAction = (
  action: BlockElementAction | undefined,
): action is CheckboxesAction => action?.type === "checkboxes";

export const isOverflowAction = (
  action: BlockElementAction | undefined,
): action is OverflowAction => action?.type === "overflow";

export const isButtonAction = (
  action: BlockElementAction | undefined,
): action is ButtonAction => action?.type === "button";
