/**
 * Factory to create an OpenAI HTTP connector with built-in message management.
 *
 * @param {string} apiKey - Your OpenAI API key.
 * @param {string} [defaultModel="gpt-3.5-turbo"] - The default model to use.
 * @returns {Object} - A connector with methods to manage messages and send requests.
 */
function createOpenAIConnector(apiKey, defaultModel = "gpt-3.5-turbo") {
  return {
    apiKey,
    model: defaultModel,
    messages: [],

    /**
     * Set a different model for subsequent requests.
     * @param {string} newModel
     */
    setModel(newModel) {
      this.model = newModel;
    },

    /**
     * Add a chat message to the queue.
     * @param {string} role - "user", "assistant", or "system".
     * @param {string} content - The message content.
     */
    addMessage(role, content) {
      this.messages.push({ role, content });
    },

    /**
     * Clear all queued messages.
     */
    clearMessages() {
      this.messages = [];
    },

    async send(msgId, callback, messages) {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          stream: true,
          messages: messages ? messages : this.messages,
        }),
      });
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let sep;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const raw = buffer.slice(0, sep).trim();
          buffer = buffer.slice(sep + 2);

          raw.split("\n").forEach((line) => {
            const m = line.match(/^data:\s*(.*)$/);
            if (!m) return;

            const payload = m[1];
            if (payload === "[DONE]") return;

            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta;
            if (delta?.content) {
              callback(msgId, delta.content);
            }
          });
        }
      }
    },
  };
}

window.createOpenAIConnector = createOpenAIConnector;
