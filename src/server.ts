import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { FirebaseService } from "./resources/firebase";
import { UserService } from "./services/user.service";
import { userHandlers } from "./handlers/user.handler";
import { ChatServices } from "./services/chat.service";
import { chatHandlers } from "./handlers/chat.handler";
import ChatSettingsService from "./services/chatSettingsService.service";
import { chatSettingsHandlers } from "./handlers/chatSettings";

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
const chatServices = new ChatServices(firebaseResource);
const chatSettinsSercice = new ChatSettingsService(firebaseResource);

const chatsHandlers = chatHandlers(chatServices);
const usersHandlers = userHandlers(usersService);
const chatSettings = chatSettingsHandlers(chatSettinsSercice);

app.route("/users", usersHandlers);
app.route("/chats", chatsHandlers);
app.route("/chat-settings", chatSettings);

Bun.serve({
  hostname: HOST,
  port: PORT,
  fetch: app.fetch,
});

console.log(`🚀  Server running at http://${HOST}:${PORT}`);
