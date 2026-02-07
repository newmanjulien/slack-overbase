import type { KnownBlock, PlainTextOption } from "@slack/types";
import type { HomeBaseState } from "../types.js";

export const buildHomeBaseBlocks = (state: HomeBaseState): KnownBlock[] => {
  const sectionOptions: PlainTextOption[] = [
    { text: { type: "plain_text", text: "Welcome" }, value: "welcome" },
    { text: { type: "plain_text", text: "Templates" }, value: "templates" },
    { text: { type: "plain_text", text: "Recurring" }, value: "recurring" },
    { text: { type: "plain_text", text: "Datasources" }, value: "datasources" },
    { text: { type: "plain_text", text: "Settings" }, value: "settings" },
  ];
  const selectedSection =
    sectionOptions.find((option) => option.value === state.homeSection) || sectionOptions[0];

  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: state.userName ? `Hi ${state.userName}!` : "Hi there!",
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
