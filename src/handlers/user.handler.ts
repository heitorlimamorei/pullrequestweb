import { Hono } from "hono";
import type { UserService } from "../services/user.service";
import type { LoginPaylod, NewUserType } from "../types/user.types";

export function userHandlers(userService: UserService) {
  const app = new Hono();

  app.post("/", async (c) => {
    const body = await c.req.json<NewUserType>();
    try {
      const id = await userService.create(body);
      return c.json({ id }, 201);
    } catch (e: any) {
      return c.json({ error: e.message }, 400);
    }
  });

  app.get("/:id", async (c) => {
    try {
      const user = await userService.find(c.req.param("id"));
      return c.json(user);
    } catch (e: any) {
      return c.json({ error: e.message }, 404);
    }
  });

  app.get("", async (c) => {
    const email = c.req.query("email");
    if (!email) {
      return c.json({ error: "Missing email param" }, 400);
    }
    try {
      const user = await userService.findByEmail(email);
      return c.json(user);
    } catch (e: any) {
      return c.json({ error: e.message }, 404);
    }
  });

  app.patch("/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    try {
      await userService.update(id, body);
      return c.json({ ok: true });
    } catch (e: any) {
      return c.json({ error: e.message }, 400);
    }
  });

  app.delete("/:id", async (c) => {
    try {
      const user = await userService.delete(c.req.param("id"));
      return c.json(user);
    } catch (e: any) {
      return c.json({ error: e.message }, 404);
    }
  });

  app.post("login", async (c) => {
    try {
      const payload = await c.req.json<LoginPaylod>();

      const user = await userService.login(payload.email, payload.password);

      return c.json(user);
    } catch (e: any) {
      return c.json({ error: e.message }, 400);
    }
  });

  return app;
}
