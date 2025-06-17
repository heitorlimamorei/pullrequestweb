import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { FirebaseService } from "./services/resources/firebase";
import { UserService } from "./services/user.service";
import { userHandlers } from "./handlers/user.handler";

const HOST = Bun.env.HOST ?? "0.0.0.0";
const PORT = Number.parseInt(Bun.env.PORT ?? "3000", 10);

const app = new Hono();

app.get("/api/hello", (c) => c.json({ message: "Hello from Bun + Hono! 🎉" }));

app.get("/assets/*", serveStatic({ root: "./public" }));

app.get(
  "/*.{js,css,html,png,jpg,jpeg,gif,svg,ico}",
  serveStatic({ root: "./public" })
);

app.get("*", serveStatic({ root: "./public" }));

const firebaseResource = new FirebaseService();
const usersService = new UserService(firebaseResource);
const usersHandlers = userHandlers(usersService);

app.route("/users", usersHandlers);

Bun.serve({
  hostname: HOST,
  port: PORT,
  fetch: app.fetch,
});

console.log(`🚀  Server running at http://${HOST}:${PORT}`);
