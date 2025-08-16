import { Elysia, t } from "elysia";
import { z } from "zod";
import { ItemService } from "../../application/services/item-service";
import { PrismaItemRepository } from "../../infra/repositories/prisma-item-repo";

const createSchema = z.object({
  name: z.string().min(1),
  parentId: z.uuid().nullable().optional().default(null),
  type: z.enum(["folder", "file"]),
});
const updateSchema = z.object({
  name: z.string().min(1).optional(),
  parentId: z.uuid().nullable().optional(),
});

export function apiV1() {
  const repo = new PrismaItemRepository();
  const svc = new ItemService(repo);

  const app = new Elysia({ prefix: "/api/v1" });

  app.get("/health", () => ({ status: "ok" }));

  app.get("/items", async () => {
    const items = await svc.listTree();
    return { data: items };
  });

  app.get(
    "/items/:id",
    async ({ params, set }) => {
      const it = await svc.get(params.id);
      if (!it) {
        set.status = 404;
        return { message: "Not found" };
      }
      return { data: it };
    },
    {
      params: t.Object({ id: t.String({ format: "uuid" }) }),
    },
  );

  app.get(
    "/items/children",
    async ({ query }) => {
      const parentId = query.parentId ?? null;
      const items = await svc.listChildren(parentId);
      return { data: items };
    },
    {
      query: t.Object({
        parentId: t.Optional(t.Union([t.String({ format: "uuid" }), t.Null()])),
      }),
    },
  );

  app.post("/items", async ({ body, set }) => {
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { errors: parsed.error.flatten() };
    }
    const created = await svc.create(parsed.data);
    return { data: created };
  });

  app.patch(
    "/items/:id",
    async ({ params, body, set }) => {
      const p = updateSchema.safeParse(body);
      if (!p.success) {
        set.status = 400;
        return { errors: p.error.flatten() };
      }
      const updated = await svc.update(params.id, p.data);
      return { data: updated };
    },
    {
      params: t.Object({ id: t.String({ format: "uuid" }) }),
    },
  );

  app.delete(
    "/items/:id",
    async ({ params }) => {
      await svc.delete(params.id);
      return new Response(null, { status: 204 });
    },
    {
      params: t.Object({ id: t.String({ format: "uuid" }) }),
    },
  );

  return app;
}
