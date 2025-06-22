function useChatSettings() {
  const store = window.useState();

  const saveChatSettings = (payload) => {
    store.setState("chatSettings", payload);
  };

  const getCachedChatSettings = () => {
    return store.getState("chatSettings");
  };

  const setupDefaultSettings = async (userId) => {
    const initialChatSettings = window.getPromptSettigs();

    const payload = {
      id: window.generateUUID(),
      userId: userId,
      template: initialChatSettings?.template,
      basePrompt: initialChatSettings?.base_prompt,
      analysisPrompt: initialChatSettings?.analysis_prompt,
      descriptionPrompt: initialChatSettings?.description_prompt,
    };

    const resp = await fetch("http://localhost:3000/chatSettings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (resp.ok) saveChatSettings(payload);
  };

  const readBasePrompt = (settings) => {
    return `${settings.basePrompt} ${settings.analysisPrompt} ${settings.descriptionPrompt} ${settings.template}`;
  };

  const getPromptSettigs = async (userId, type) => {
    const cachedSettings = getCachedChatSettings();

    if (cachedSettings) {
      return type == "JSON" ? cachedSettings : readBasePrompt(cachedSettings);
    }

    const resp = await fetch(
      "http://localhost:3000/chatSettings?userId=" + userId,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!resp.ok) return null;

    const settings = await resp.json();

    saveChatSettings(settings);

    return type == "JSON" ? settings : readBasePrompt(settings);
  };

  const updateChatSettings = async (payload) => {
    const cachedSettings = {
      ...getCachedChatSettings(),
      ...payload,
    };

    await fetch("http://localhost:3000/chatSettings/" + cachedSettings.id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    saveChatSettings(cachedSettings);
  };

  return {
    setupDefaultSettings,
    getPromptSettigs,
    updateChatSettings,
  };
}

window.useChatSettings = useChatSettings;
