import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Elysia } from "elysia";
import { apiV1 } from "./routes";

// Mock repository used inside routes by swapping the implementation module
vi.mock("../../infra/repositories/prisma-item-repo", () => {
  class FakeRepo {
    async listTree() {
      return [
        { id: "1", name: "root", parentId: null, type: "folder" },
        { id: "2", name: "doc.md", parentId: "1", type: "file" },
      ];
    }
    async findById(id: string) {
      if (id === "00000000-0000-0000-0000-000000000000") return null;
      return { id, name: "x", parentId: null, type: "folder" };
    }
    async listChildren(_parentId: string | null) {
      void _parentId;
      return [];
    }
    async create(data: any) {
      return { id: "new", ...data };
    }
    async update(id: string, data: any) {
      return {
        id,
        name: data.name ?? "n",
        parentId: data.parentId ?? null,
        type: "folder",
      };
    }
    async delete() {
      return;
    }
    async search({ q, limit: _limit }: any) {
      void _limit;
      return {
        items: [{ id: "s1", name: q, parentId: null, type: "file" }],
        nextCursor: null,
      };
    }
  }
  return { PrismaItemRepository: FakeRepo };
});

function makeApp() {
  const root = new Elysia();
  root.use(apiV1());
  return root;
}

async function json(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function makeReq(url: string, init?: RequestInit) {
  const headers = new Headers((init && (init.headers as any)) || {});
  if (!headers.has("Origin")) headers.set("Origin", "http://localhost");
  return new Request(url, { ...(init || {}), headers });
}

describe("apiV1 routes", () => {
  let app: Elysia;
  beforeEach(() => {
    app = makeApp();
  });
  afterEach(() => {
    // no-op
  });

  it("health ok", async () => {
    const res = await app.fetch(makeReq("http://localhost:3000/api/v1/health"));
    expect(res.status).toBe(200);
    expect(await json(res)).toMatchObject({ status: "ok" });
  });

  it("lists items tree", async () => {
    const res = await app.fetch(makeReq("http://localhost:3000/api/v1/items"));
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data[0]).toMatchObject({ id: "1" });
  });

  it("get by id not found -> 404", async () => {
    const res = await app.fetch(
      makeReq(
        "http://localhost:3000/api/v1/items/00000000-0000-0000-0000-000000000000",
      ),
    );
    expect(res.status).toBe(404);
  });

  it("search validates q", async () => {
    const res = await app.fetch(
      makeReq("http://localhost:3000/api/v1/items/search"),
    );
    expect(res.status).toBe(400);
  });

  it("search returns results", async () => {
    const res = await app.fetch(
      makeReq("http://localhost:3000/api/v1/items/search?q=test&limit=5"),
    );
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data[0]).toMatchObject({ name: "test" });
  });

  it("create validates and returns created", async () => {
    const req = makeReq("http://localhost:3000/api/v1/items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "New", parentId: null, type: "file" }),
    });
    const res = await app.fetch(req);
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.data).toMatchObject({ id: "new", name: "New", type: "file" });
  });

  it("delete returns 204", async () => {
    const res = await app.fetch(
      makeReq(
        "http://localhost:3000/api/v1/items/11111111-1111-1111-1111-111111111111",
        { method: "DELETE" },
      ),
    );
    expect(res.status).toBe(204);
  });
});
