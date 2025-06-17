function useChatUI(r) {
  const router = window.useRouter();

  const renderFeedbackForm = (container) => {
    const form = $(`
                <div id="feedback-form" class="flex flex-col items-start space-y-2 p-4 bg-white border rounded shadow">
                    <p class="text-sm text-gray-700">Gostou da descrição gerada pelo assistente? Sinta-se livre para pedir alterações.</p>
                    <div class="flex space-x-2">
                        <button id="send-feedback" class="bg-blue-600 text-white px-3 py-1 rounded text-sm">Enviar</button>
                        <button id="cancel-feedback" class="bg-gray-300 text-black px-3 py-1 rounded text-sm">Cancelar</button>
                    </div>
                </div>
            `);
    container.append(form);
  };

  const render = () => {
    const container = $("#chat-messages");
    const messages = r.getMessages();
    container.empty();

    messages.forEach((msg) => {
      if (msg.shouldDisplay) {
        const messageClass =
          msg.role === "user"
            ? "bg-blue-100 self-end text-right"
            : "bg-gray-200 self-start text-left";

        let content = msg.content;
        const prLinkRegex = /Link do PR:\s*(https?:\/\/\S+)/;
        if (prLinkRegex.test(content)) {
          content = content.replace(prLinkRegex, (match, url) => {
            return `Link do PR: <a href="${url}" class="text-blue-500 underline" target="_blank">${url}</a>`;
          });
        }

        const message = $(`
                    <div id="message-${msg.id}" class="rounded-lg px-4 py-2 ${messageClass} max-w-[80%]">
                        <p class="text-sm">${content}</p>
                    </div>
                `);
        container.append(message);
      }
    });

    if (messages.at(-1)?.role === "assistant") {
      renderFeedbackForm(container);
    }

    container.scrollTop(container[0].scrollHeight);
  };

  const renderChatList = async () => {
    const chats = await r.getChats();

    const chatId = r.getChatId();

    const chatList = $("#chat-list");

    chatList.empty();

    chats.forEach((chat) => {
      const chatItem = $(`
                    <li class="px-3 py-2 rounded cursor-pointer hover:bg-gray-100 ${
                      chat.id === chatId ? "selected" : ""
                    }" data-id="${chat.id}">
                        <span class="truncate block">${chat.name}</span>
                    </li>
                `);

      chatItem.on("click", function () {
        router.push("chat.html?chatid=" + chat.id);
      });

      chatList.append(chatItem);
    });
  };

  return {
    render,
    renderFeedbackForm,
    renderChatList,
  };
}

window.useChatUI = useChatUI;
