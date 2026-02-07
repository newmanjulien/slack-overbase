/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as portal_assets from "../portal/assets.js";
import type * as portal_auth from "../portal/auth.js";
import type * as slack_canvas from "../slack/canvas.js";
import type * as slack_conversations from "../slack/conversations.js";
import type * as slack_events from "../slack/events.js";
import type * as slack_installations from "../slack/installations.js";
import type * as slack_preferences from "../slack/preferences.js";
import type * as slack_recurring from "../slack/recurring.js";
import type * as slack_templates from "../slack/templates.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "portal/assets": typeof portal_assets;
  "portal/auth": typeof portal_auth;
  "slack/canvas": typeof slack_canvas;
  "slack/conversations": typeof slack_conversations;
  "slack/events": typeof slack_events;
  "slack/installations": typeof slack_installations;
  "slack/preferences": typeof slack_preferences;
  "slack/recurring": typeof slack_recurring;
  "slack/templates": typeof slack_templates;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
