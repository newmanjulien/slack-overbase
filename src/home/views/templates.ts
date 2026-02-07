import type { KnownBlock } from "@slack/types";
import type { HomeSectionDataMap } from "../types.js";

export const buildTemplatesBlocks = (
  templates: HomeSectionDataMap["templates"]["templates"],
): KnownBlock[] => {
  if (templates.length === 0) {
    return [
      {
        type: "section",
        text: { type: "mrkdwn", text: "No templates yet." },
      },
    ];
  }

  const blocks: KnownBlock[] = [];
  for (const template of templates) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${template.title}*\n${template.summary}`,
      },
      accessory: {
        type: "button",
        text: { type: "plain_text", text: "Edit" },
        action_id: "template_edit",
        value: template.templateId,
      },
    });
    blocks.push({ type: "divider" });
  }
  return blocks;
};
