import type {
  AllMiddlewareArgs,
  BlockAction,
  BlockElementAction,
  SlackActionMiddlewareArgs,
  SlackCommandMiddlewareArgs,
  SlackEventMiddlewareArgs,
  SlackViewMiddlewareArgs,
  ViewSubmitAction,
} from "@slack/bolt";

export type HomeEventArgs<T extends string> = SlackEventMiddlewareArgs<T> & AllMiddlewareArgs;
export type HomeActionArgs<T extends BlockElementAction> =
  SlackActionMiddlewareArgs<BlockAction<T>> & AllMiddlewareArgs;
export type HomeViewArgs = SlackViewMiddlewareArgs<ViewSubmitAction> & AllMiddlewareArgs;
export type HomeCommandArgs = SlackCommandMiddlewareArgs & AllMiddlewareArgs;
