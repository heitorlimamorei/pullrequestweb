import { Hono } from "hono";
import type { ChatServices } from "../services/chat.service";
import type { NewChatType } from "../types/chat.types";
import type { NewMessageType } from "../types/message.types";

export function chatHandlers(chatService: ChatServices) {
  const app = new Hono();

  // Criar novo chat com mensagens
  app.post("/", async (c) => {
    try {
      const body = await c.req.json<{
        chat: NewChatType;
        messages: NewMessageType[];
      }>();
      const id = await chatService.create(body.chat, body.messages);
      return c.json({ id }, 201);
    } catch (e: any) {
      return c.json({ error: e.message }, 400);
    }
  });

  // Buscar todos os chats de um usuário
  app.get("/", async (c) => {
    const userId = c.req.query("userId");
    if (!userId) {
      return c.json({ error: "Missing userId param" }, 400);
    }

    try {
      const chats = await chatService.findMany(userId);
      return c.json(chats);
    } catch (e: any) {
      return c.json({ error: e.message }, 400);
    }
  });

  // Buscar mensagens de um chat
  app.get("/:chatId/messages", async (c) => {
    const chatId = c.req.param("chatId");

    try {
      const messages = await chatService.findMessages(chatId);
      return c.json(messages);
    } catch (e: any) {
      return c.json({ error: e.message }, 404);
    }
  });

  // Seed de mensagens (caso precise em outra rota separada)
  app.post("/:chatId/messages", async (c) => {
    const chatId = c.req.param("chatId");    
    try {
      const messages = await c.req.json<NewMessageType[]>();
      await chatService.seedMessages(messages, chatId);
      return c.json({ ok: true });
    } catch (e: any) {
      return c.json({ error: e.message }, 400);
    }
  });

  // Excluir um chat
  app.delete("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      await chatService.delete(id);
      return c.json({ ok: true });
    } catch (e: any) {
      return c.json({ error: e.message }, 404);
    }
  });

  return app;
}
