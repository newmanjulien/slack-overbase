import type { KnownBlock, PlainTextOption } from "@slack/types";
import { HOME_SECTIONS, type HomeSection } from "../home.js";
import type { HomeBaseState } from "../types.js";

const SECTION_LABELS: Record<HomeSection, string> = {
  welcome: "Welcome",
  templates: "Templates",
  recurring: "Recurring",
  datasources: "Datasources",
  settings: "Settings",
};

export const buildHomeBaseBlocks = (state: HomeBaseState): KnownBlock[] => {
  const sectionOptions: PlainTextOption[] = HOME_SECTIONS.map((section) => ({
    text: { type: "plain_text", text: SECTION_LABELS[section] },
    value: section,
  }));
  const selectedSection =
    sectionOptions.find((option) => option.value === state.homeSection) || sectionOptions[0];
  const greetingName = state.userName ?? "there";

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*👋 Hi, ${greetingName}*\nI'm your personal analyst. I can get reliable answers to any question`,
      },
      accessory: {
        type: "static_select",
        action_id: "home_section_select",
        options: sectionOptions,
        initial_option: selectedSection,
        placeholder: { type: "plain_text", text: "Select section" },
      },
    },
    { type: "divider" },
  ];
};
