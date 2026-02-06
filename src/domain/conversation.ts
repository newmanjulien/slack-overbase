export type ConversationMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};
