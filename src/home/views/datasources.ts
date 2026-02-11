import type { KnownBlock } from "@slack/types";
import type { HomeSectionDataMap } from "../types.js";

const buildAllowlistElement = (
  allowlist: HomeSectionDataMap["datasources"]["allowlist"],
) => {
  const baseElement = {
    type: "multi_users_select" as const,
    action_id: "allowlist_select",
    placeholder: {
      type: "plain_text" as const,
      text: "Add people in Slack",
    },
  };

  return allowlist.length > 0
    ? { ...baseElement, initial_users: allowlist }
    : baseElement;
};

export const buildDatasourcesBlocks = (
  allowlist: HomeSectionDataMap["datasources"]["allowlist"],
  portalLinks: HomeSectionDataMap["datasources"]["portalLinks"],
): KnownBlock[] => {
  const allowlistElement = buildAllowlistElement(allowlist);

  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Connectors",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "I can analyze any of your internal datasources. Easily and quickly set up connectors without needing to migrate, clean up or change any data",
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          action_id: "manage_connectors",
          text: {
            type: "plain_text",
            text: "Manage connectors",
          },
          url: portalLinks.connectorsUrl || "https://example.com/connectors",
        },
      ],
    },
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "People",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "I can also ask people on your team for information they know and which isn't in any database. I do that by reaching out to them and asking. I will only reach out to people you choose",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: " ",
      },
    },
    {
      type: "section",
      block_id: "allowlist_block",
      text: {
        type: "mrkdwn",
        text: "*People in Slack*\nAdd people in this Slack workspace so I can DM them here",
      },
      accessory: allowlistElement,
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: " ",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*People not in Slack*\nAdd anyone and I'll connect with them by email, text message, etc.",
      },
      accessory: {
        type: "button",
        action_id: "manage_people_portal",
        text: {
          type: "plain_text",
          text: "Add people not in Slack",
        },
        url: portalLinks.peopleUrl || "https://google.com/",
      },
    },
  ];
};
