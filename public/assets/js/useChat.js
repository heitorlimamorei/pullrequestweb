const sortByCreatedAtDesc = (items) => {
  return items.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateA - dateB;
  });
};

function useChat() {
  const store = window.useState();
  const authStore = window.useAuth();
  const router = window.useRouter();
  const chatSettings = window.useChatSettings();

  const NewMessage = (role, content, shouldDisplay) => {
    const id = window.generateUUID();
    return { id, role, content, shouldDisplay, createdAt: new Date() };
  };

  const getChatId = () => {
    return store.getState("chat-id") || "";
  };

  const getMessages = () => {
    return store.getState("chat-messages") || [];
  };

  const chatUI = window.useChatUI({ getMessages });

  const setMessages = (messages) => {
    store.setState("chat-messages", messages);
    chatUI.render();
  };

  const saveMessages = async () => {
    const chatId = getChatId();

    const currentMessages = sortByCreatedAtDesc(getMessages());

    const updateResp = await fetch(`/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentMessages.filter((c) => c.shouldDisplay)),
    });

    if (!updateResp.ok)
      throw new Error("Client Error: cannot save the new messages");
  };

  const addContextMessage = (role, content) => {
    const message = NewMessage(role, content, false);

    setMessages([...getMessages(), message]);

    return message.id;
  };

  const addMessage = (role, content) => {
    const message = NewMessage(role, content, true);

    setMessages([...getMessages(), message]);

    chatUI.render();

    return message.id;
  };

  const clear = () => {
    setMessages([]);
    chatUI.render();
  };

  const updateMessage = (id, chunck) => {
    const messages = getMessages();

    const message = messages.find((c) => c.id == id);

    if (!message) {
      throw new Error("Client error: cannot update a undefined message");
    }

    message.content = message.content + chunck;

    setMessages(
      messages.map((c) => {
        if (c.id == id) {
          return message;
        }

        return c;
      })
    );
  };

  const prepareChat = async (commitsData, repo) => {
    const session = authStore.getSession();

    clear();

    const prompt = `Gerar uma descrição de pull request a partir das seguintes mensagens de commit:\n\n${commitsData.join(
      "\n"
    )}`;

    const basePrompt = await chatSettings.getPromptSettigs(
      session.userId,
      "string"
    );

    addContextMessage("system", basePrompt);
    addContextMessage("user", prompt);

    const assistantRespId = addMessage("assistant", " ");

    const now = new Date();
    const formattedDate = now.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const name = `${repo} - ${formattedDate}`;

    const createResp = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat: {
          userId: session.userId,
          name,
        },
        messages: [
          ...getMessages().map((m) => ({
            content: m.content,
            role: m.role,
            shouldDisplay: m.id,
          })),
        ],
      }),
    });

    if (!createResp.ok) {
      throw new Error("Client error: cannot create a new chat");
    }

    const { id } = await createResp.json();

    store.setState("chat-id", id);

    return assistantRespId;
  };

  const getChats = async () => {
    const session = authStore.getSession();
    const userId = session.userId;

    const resp = await fetch("/api/chats?userId=" + userId);

    if (!resp.ok) {
      throw new Error("Client Error: cannot retrive the saveds chats");
    }

    const chats = await resp.json();

    return chats || [];
  };

  const getSavedMessages = async (chatId) => {
    const messagesRep = await fetch(`/api/chats/${chatId}/messages`);

    if (!messagesRep.ok) {
      throw new Error("Client Error: cannot retrive the requested messags");
    }

    return (await messagesRep.json()) || [];
  };

  const loadChat = async (inputId) => {
    const prevChatId = getChatId();

    if (!inputId && prevChatId.length == 0) {
      const chats = await getChats();

      if (chats.length == 0) {
        router.push("pullrequest.html");
        return;
      }

      router.push("chat.html?chatid=" + chats[0].id);
      return;
    }

    if (inputId && prevChatId != inputId) {
      const savedMessges = await getSavedMessages(inputId);
      setMessages(savedMessges);
      store.setState("chat-id", inputId);
    }

    chatUI.render();
  };

  return {
    hydrate: setMessages,
    getMessages,
    addMessage,
    clear,
    updateMessage,
    prepareChat,
    getChats,
    loadChat,
    saveMessages,
    getChatId,
  };
}
