import { Elysia } from "elysia";
import { apiV1 } from "./interfaces/http/routes";
import { env } from "./config/env";

export function createApp() {
  const app = new Elysia();
  app.get("/health", () => ({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));
  app.use(apiV1());
  return app;
}

if (import.meta.main) {
  const server = createApp().listen(env.PORT);
  console.log(
    `🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`,
  );

  const close = () => {
    server.stop();
    process.exit(0);
  };
  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}
