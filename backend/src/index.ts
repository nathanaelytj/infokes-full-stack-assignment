import { Elysia } from "elysia";

export function createApp() {
  return new Elysia().get("/", () => "Hello Elysia");
}

if (import.meta.main) {
  const app = createApp().listen(3000);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}
