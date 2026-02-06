export const buildEditTemplateModal = (payload: {
  templateId: string;
  title: string;
  body: string;
}) => {
  return {
    type: "modal",
    callback_id: "template_edit",
    title: { type: "plain_text", text: "Edit template" },
    submit: { type: "plain_text", text: "Save" },
    close: { type: "plain_text", text: "Cancel" },
    private_metadata: JSON.stringify({ templateId: payload.templateId }),
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: `*${payload.title}*` },
      },
      {
        type: "input",
        block_id: "body",
        label: { type: "plain_text", text: "Body" },
        element: {
          type: "plain_text_input",
          action_id: "value",
          multiline: true,
          initial_value: payload.body,
        },
      },
    ],
  };
};
