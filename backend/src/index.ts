import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { apiV1 } from "./interfaces/http/routes";
import { env } from "./config/env";

export function createApp() {
  const app = new Elysia();
  app.use(
    cors({
      origin: (requestOrigin) => {
        // requestOrigin can be a string or a Request-like object depending on runtime
        const originStr =
          typeof requestOrigin === "string"
            ? requestOrigin
            : requestOrigin &&
              typeof requestOrigin === "object" &&
              "headers" in requestOrigin
            ? (requestOrigin as any).headers?.get?.("origin") ?? (requestOrigin as any).url
            : undefined;

        if (!originStr) return false;
        try {
          const { hostname } = new URL(originStr);
          // Allow any subdomain of localhost or docker.localhost
          return (
            hostname === "localhost" ||
            hostname.endsWith(".localhost")
          );
        } catch {
          return false;
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "X-Requested-With",
      ],
    }),
  );
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
