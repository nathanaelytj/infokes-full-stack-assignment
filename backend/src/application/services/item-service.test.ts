import { describe, it, expect, vi } from "vitest";
import type { IItemRepository, ItemSearchParams, ItemSearchResult } from "../ports/item-repository";
import type { Item } from "../../domain/item";
import { ItemService } from "./item-service";

function makeRepo(overrides: Partial<IItemRepository> = {}): IItemRepository {
  const base: IItemRepository = {
    async findById(id: string) {
      return ({ id, name: "n", parentId: null, type: "folder" } as unknown) as Item;
    },
    async listChildren(parentId: string | null) {
      return [
        { id: "a", name: "A", parentId, type: "folder" },
      ] as Item[];
    },
    async listTree() {
      return [
        { id: "a", name: "A", parentId: null, type: "folder" },
        { id: "b", name: "B", parentId: "a", type: "file" },
      ] as Item[];
    },
    async create(data) {
      return ({ id: "new", ...data } as unknown) as Item;
    },
    async update(id, data) {
      return ({ id, name: data.name ?? "n", parentId: data.parentId ?? null, type: "folder" } as unknown) as Item;
    },
    async delete() {
      return;
    },
    async search(params: ItemSearchParams): Promise<ItemSearchResult> {
      return { items: [], nextCursor: null };
    },
  };
  return { ...base, ...overrides } as IItemRepository;
}

describe("ItemService", () => {
  it("delegates listTree to repository", async () => {
    const repo = makeRepo({ listTree: vi.fn().mockResolvedValue([{ id: "x", name: "X", parentId: null, type: "folder" }]) });
    const svc = new ItemService(repo);
    const out = await svc.listTree();
    expect(out).toHaveLength(1);
    expect((repo.listTree as any)).toHaveBeenCalled();
  });

  it("creates and returns new item", async () => {
    const repo = makeRepo({ create: vi.fn().mockResolvedValue({ id: "id1", name: "Doc", parentId: null, type: "file" }) });
    const svc = new ItemService(repo);
    const created = await svc.create({ name: "Doc", parentId: null, type: "file" });
    expect(created).toMatchObject({ id: "id1", name: "Doc", type: "file" });
  });

  it("updates item via repository", async () => {
    const repo = makeRepo({ update: vi.fn().mockResolvedValue({ id: "id2", name: "New", parentId: null, type: "folder" }) });
    const svc = new ItemService(repo);
    const updated = await svc.update("id2", { name: "New" });
    expect(updated.name).toBe("New");
    expect((repo.update as any)).toHaveBeenCalledWith("id2", { name: "New" });
  });

  it("search passes through params", async () => {
    const repo = makeRepo({ search: vi.fn().mockResolvedValue({ items: [], nextCursor: null }) });
    const svc = new ItemService(repo);
    const res = await svc.search({ q: "abc", limit: 10 });
    expect(res).toEqual({ items: [], nextCursor: null });
    expect((repo.search as any)).toHaveBeenCalledWith({ q: "abc", limit: 10 });
  });
});
