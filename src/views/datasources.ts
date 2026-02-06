export const buildDatasourcesBlocks = (
  allowlist: string[],
  portalLinks: { connectorsUrl?: string; peopleUrl?: string; paymentsUrl?: string },
) => [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "Choose which people I can use as sources:",
    },
  },
  {
    type: "input",
    block_id: "allowlist",
    label: { type: "plain_text", text: "Allowlist" },
    element: {
      type: "multi_users_select",
      action_id: "allowlist_select",
      initial_users: allowlist,
      placeholder: { type: "plain_text", text: "Select people" },
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `Manage datasources in the portal:\n• <${portalLinks.connectorsUrl || ""}|Connectors>\n• <${portalLinks.peopleUrl || ""}|People>`,
    },
  },
];
