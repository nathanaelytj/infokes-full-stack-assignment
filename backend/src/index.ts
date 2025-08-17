import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { apiV1 } from "./interfaces/http/routes";
import { env } from "./config/env";

export function createApp() {
  const app = new Elysia();
  app.use(
    cors({
      origin: (requestOrigin: string | Request | undefined) => {
        // requestOrigin can be a string or a Request-like object depending on runtime
        let originStr: string | undefined;
        if (typeof requestOrigin === "string") originStr = requestOrigin;
        else if (
          requestOrigin &&
          typeof requestOrigin === "object" &&
          "headers" in requestOrigin
        ) {
          const reqLike = requestOrigin as Request;
          // try headers.get('origin') then fallback to url
          try {
            const hdrs = reqLike.headers as Headers;
            if (typeof hdrs.get === "function") {
              originStr = hdrs.get("origin") ?? undefined;
            }
          } catch {
            // ignore
          }
          if (!originStr && typeof (reqLike as Request).url === "string")
            originStr = (reqLike as Request).url;
        } else originStr = undefined;

        if (!originStr) return false;
        try {
          const { hostname } = new URL(originStr);
          // Allow any subdomain of localhost or docker.localhost
          return (
            hostname === "localhost" ||
            hostname.endsWith(".localhost") ||
            (hostname === "frontend" && new URL(originStr).port === "3000") ||
            (hostname.endsWith(".frontend") &&
              new URL(originStr).port === "3000")
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
