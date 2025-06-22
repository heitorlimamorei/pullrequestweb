export type ChatType = {
  id: string;
  userId: string;
  name: string;
};

export type NewChatType = {
  userId: string;
  name: string;
};

export type ChatSettingsType = {
  id: string;
  userId: string;
  template: string;
  basePrompt: string;
  analysisPrompt: string;
  descriptionPrompt: string;
};

export type NewChatSettingsType = {
  userId: string;
  template: string;
  basePrompt: string;
  analysisPrompt: string;
  descriptionPrompt: string;
};
