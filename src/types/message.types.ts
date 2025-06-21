export type MessageType = {
  id: string;
  role: "user" | "system" | "assistant";
  content: string;
  shouldDisplay: boolean;
};

export type NewMessageType = {
  role: "user" | "system" | "assistant";
  content: string;
  shouldDisplay: boolean;
};
