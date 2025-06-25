function getModels() {
  return [
    {
      id: "gpt-4o-2024-11-20",
      label: "GPT-4o",
      provider: "openai",
    },
     {
      id: "gpt-4.1-2025-04-14",
      label: "GPT-4.1",
      provider: "openai",
    },
    {
      id: "gpt-4o-mini-2024-07-18",
      label: "GPT-4o mini",
      provider: "openai",
    },
    {
      id: "grok-1.5",
      label: "Grok-1.5",
      provider: "xai",
    },
    {
      id: "grok-3",
      label: "Grok-3",
      provider: "xai",
    },
    {
      id: "deepseek-chat",
      label: "DeepSeek Chat",
      provider: "deepseek",
    }
  ];
}

window.getModels = getModels;
