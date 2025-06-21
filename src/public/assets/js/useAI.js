function useAI() {
  const store = window.useState();
  const models = window.getModels();
  const router = window.useRouter();

  const apikeys = store.getState("apiKeys") || {};

  const availableModels = models.filter((m) => apikeys[m.provider]);

  if (availableModels.length == 0) {
    router.push("settings.html");
  }

  const getCurrentModel = () => {
    let currentModelId = store.getState("current-ai-model");

    if (!availableModels.find((c) => c.id == currentModelId)) {
      currentModelId = availableModels[0];
      store.setState("current-ai-model", availableModels[0]);
    }

    const model = availableModels.find((c) => c.id == currentModelId);

    return model;
  };

  const providersMap = {
    openai: window.createOpenAIConnector(
      apikeys["openai"],
       getCurrentModel,
      "https://api.openai.com/v1/chat/completions"
    ),
    xai: window.createOpenAIConnector(
      apikeys["xai"],
      getCurrentModel,
      "https://api.x.ai/v1/chat/completions"
    ),
    deepseek: window.createOpenAIConnector(
      apikeys["deepseek"],
      getCurrentModel,
      "https://api.deepseek.com/chat/completions"
    ),
  };

  const getConnector = () => {
    const currentModel = getCurrentModel();

    return currentModel ? providersMap[currentModel.provider] : null;
  };

  const setModel = (model) => {
    store.setState("current-ai-model", model);
  };

  return {
    models: availableModels,
    getConnector,
    setModel,
  };
}

window.useAI = useAI;
