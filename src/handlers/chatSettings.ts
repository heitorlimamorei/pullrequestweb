import { Hono } from "hono";
import type {
  ChatSettingsType,
  NewChatSettingsType,
} from "../types/chat.types";
import type { IChatSettingsService } from "../services/chatSettingsService.service";

export function chatSettingsHandlers(
  chatSettingsService: IChatSettingsService
) {
  const app = new Hono();

  // Criar configurações de chat
  app.post("/", async (c) => {
    try {
      const body = await c.req.json<NewChatSettingsType>();
      const settings = await chatSettingsService.create(body);
      return c.json(settings, 201);
    } catch (e: any) {
      return c.json({ error: e.message }, 400);
    }
  });

  // Buscar configurações de chat por userId
  app.get("/:userId", async (c) => {
    const userId = c.req.param("userId");
    try {
      const settings = await chatSettingsService.find(userId);
      return c.json(settings);
    } catch (e: any) {
      return c.json({ error: e.message }, 404);
    }
  });

  // Atualizar configurações de chat
  app.patch("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const payload = await c.req.json<Partial<ChatSettingsType>>();
      const current = await chatSettingsService.find(payload.userId ?? "");

      const updatedSettings: ChatSettingsType = {
        ...current,
        ...payload,
        id, // garantir que o id não seja sobrescrito
      };

      await chatSettingsService.update(updatedSettings);
      return c.json({ ok: true });
    } catch (e: any) {
      return c.json({ error: e.message }, 400);
    }
  });

  return app;
}
