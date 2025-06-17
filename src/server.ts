import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';

const HOST = Bun.env.HOST ?? '0.0.0.0';
const PORT = Number.parseInt(Bun.env.PORT ?? '3000', 10);

const app = new Hono();

app.get('/api/hello', (c) => c.json({ message: 'Hello from Bun + Hono! 🎉' }));

app.get('/assets/*', serveStatic({ root: './public' }));

app.get('/*.{js,css,html,png,jpg,jpeg,gif,svg,ico}', serveStatic({ root: './public' }));

app.get('*', serveStatic({ root: './public' }));

Bun.serve({
  hostname: HOST,
  port: PORT,
  fetch: app.fetch,
});

console.log(`🚀  Server running at http://${HOST}:${PORT}`);