import { buildWelcomeBlocks } from "./welcome";
import { buildTemplatesBlocks } from "./templates";
import { buildRecurringBlocks } from "./recurring";
import { buildDatasourcesBlocks } from "./datasources";
import { buildSettingsBlocks } from "./settings";
import type { KnownBlock, PlainTextOption } from "@slack/types";
import type { Id } from "../../convex/_generated/dataModel";

export type HomeViewState = {
  homeTab: string;
  templateSection?: string;
  allowlist: string[];
  recommendations: { pastQuestions: boolean; similarExecs: boolean };
  userName?: string;
  templates: Array<{ templateId: string; title: string; summary: string }>;
  recurring: Array<{
    id: Id<"recurringQuestions">;
    title: string;
    question: string;
    frequencyLabel: string;
  }>;
  portalLinks: { connectorsUrl?: string; peopleUrl?: string; paymentsUrl?: string };
};

export const buildHomeView = (state: HomeViewState): KnownBlock[] => {
  const tabOptions: PlainTextOption[] = [
    { text: { type: "plain_text", text: "Welcome" }, value: "welcome" },
    { text: { type: "plain_text", text: "Templates" }, value: "templates" },
    { text: { type: "plain_text", text: "Recurring" }, value: "recurring" },
    { text: { type: "plain_text", text: "Datasources" }, value: "datasources" },
    { text: { type: "plain_text", text: "Settings" }, value: "settings" },
  ];
  const selectedTab = tabOptions.find((option) => option.value === state.homeTab) || tabOptions[0];

  const baseBlocks: KnownBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: state.userName ? `Hi ${state.userName}!` : "Hi there!",
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "static_select",
          action_id: "home_tab_select",
          options: tabOptions,
          initial_option: selectedTab,
          placeholder: { type: "plain_text", text: "Select tab" },
        },
      ],
    },
    { type: "divider" },
  ];

  if (state.homeTab === "templates") {
    return [...baseBlocks, ...buildTemplatesBlocks(state.templates)];
  }

  if (state.homeTab === "recurring") {
    return [...baseBlocks, ...buildRecurringBlocks(state.recurring)];
  }

  if (state.homeTab === "datasources") {
    return [...baseBlocks, ...buildDatasourcesBlocks(state.allowlist, state.portalLinks)];
  }

  if (state.homeTab === "settings") {
    return [...baseBlocks, ...buildSettingsBlocks(state.recommendations, state.portalLinks)];
  }

  return [...baseBlocks, ...buildWelcomeBlocks()];
};
