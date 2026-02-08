import type { ModalView } from "@slack/types";

type TemplateModalPayload = {
  templateId: string;
  title: string;
  body: string;
};

export const buildViewTemplateModal = (template: TemplateModalPayload): ModalView => ({
  type: "modal",
  callback_id: "view_template_modal",
  private_metadata: template.templateId,
  title: { type: "plain_text", text: "Template" },
  submit: { type: "plain_text", text: "Ask this question" },
  close: { type: "plain_text", text: "Close" },
  blocks: [
    {
      type: "header",
      text: { type: "plain_text", text: template.title },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: ":pencil2: Edit", emoji: true },
          action_id: "edit_view_template",
          value: template.templateId,
        },
      ],
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `\`\`\`\n${template.body}\n\`\`\`` },
    },
  ],
});

export const buildEditTemplateModal = (template: TemplateModalPayload): ModalView => ({
  type: "modal",
  callback_id: "edit_view_template_modal",
  private_metadata: template.templateId,
  title: { type: "plain_text", text: "Edit template" },
  submit: { type: "plain_text", text: "Update template" },
  close: { type: "plain_text", text: "Cancel" },
  blocks: [
    {
      type: "input",
      block_id: "template_body",
      label: { type: "plain_text", text: "Template text" },
      element: {
        type: "plain_text_input",
        action_id: "template_body_input",
        multiline: true,
        initial_value: template.body,
      },
    },
  ],
});
