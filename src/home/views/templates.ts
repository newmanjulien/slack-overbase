import type { KnownBlock, PlainTextOption } from "@slack/types";
import type { HomeSectionDataMap } from "../types.js";

export const buildTemplatesBlocks = (
  templates: HomeSectionDataMap["templates"]["templates"],
  selectedSection: HomeSectionDataMap["templates"]["templateSection"],
  sectionOptions: HomeSectionDataMap["templates"]["sectionOptions"],
): KnownBlock[] => {
  const sectionOptionBlocks: PlainTextOption[] = sectionOptions.map((option) => ({
    text: { type: "plain_text", text: option.label },
    value: option.value,
  }));

  const selectedOption =
    sectionOptionBlocks.find((option) => option.value === selectedSection) ||
    sectionOptionBlocks[0];

  const normalizedTemplates = Array.isArray(templates) ? templates : [];
  const templatesForView =
    selectedSection === "all" ? normalizedTemplates : normalizedTemplates.slice(0, 6);

  const templateRows: KnownBlock[] = templatesForView.map((template) => ({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${template.title}* — ${template.summary}`,
    },
    accessory: {
      type: "button",
      text: { type: "plain_text", text: "View" },
      action_id: "view_template",
      value: template.templateId,
    },
  }));

  return [
    {
      type: "header",
      text: { type: "plain_text", text: "Templates" },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: "Use questions other revenue execs have asked" },
    },
    {
      type: "actions",
      elements: [
        {
          type: "static_select",
          action_id: "template_section",
          placeholder: { type: "plain_text", text: "Choose a section" },
          initial_option: selectedOption,
          options: sectionOptionBlocks,
        },
      ],
    },
    ...templateRows,
  ];
};
