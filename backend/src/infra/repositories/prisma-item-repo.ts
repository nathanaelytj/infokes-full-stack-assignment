import type { IItemRepository } from "../../application/ports/item-repository";
import type { CreateItemDTO, Item, UpdateItemDTO } from "../../domain/item";
import { prisma } from "../db/prisma";
import { cached, invalidate } from "../cache/redis";

const CACHE_KEYS = {
  tree: "items:tree",
  children: (pid: string | null) => `items:children:${pid ?? "root"}`,
  byId: (id: string) => `items:id:${id}`,
};

export class PrismaItemRepository implements IItemRepository {
  async findById(id: string): Promise<Item | null> {
    return cached(CACHE_KEYS.byId(id), 60, async () => {
      const it = await prisma.item.findUnique({ where: { id } });
      return it ? map(it) : null;
    });
  }

  async listChildren(parentId: string | null): Promise<Item[]> {
    return cached(CACHE_KEYS.children(parentId), 30, async () => {
      const rows = await prisma.item.findMany({
        where: { parentId: parentId ?? null },
        orderBy: { name: "asc" },
      });
      return rows.map(map);
    });
  }

  async listTree(): Promise<Item[]> {
    return cached(CACHE_KEYS.tree, 60, async () => {
      const rows = await prisma.item.findMany({
        orderBy: [{ parentId: "asc" }, { name: "asc" }],
      });
      return rows.map(map);
    });
  }

  async create(data: CreateItemDTO): Promise<Item> {
    const it = await prisma.item.create({
      data: {
        id: crypto.randomUUID(),
        name: data.name,
        parentId: data.parentId,
        type: data.type,
      },
    });
    await invalidate([
      CACHE_KEYS.tree,
      CACHE_KEYS.children(data.parentId ?? null),
    ]);
    return map(it);
  }

  async update(id: string, data: UpdateItemDTO): Promise<Item> {
    const it = await prisma.item.update({ where: { id }, data });
    await invalidate([
      CACHE_KEYS.tree,
      CACHE_KEYS.byId(id),
      CACHE_KEYS.children(it.parentId ?? null),
    ]);
    return map(it);
  }

  async delete(id: string): Promise<void> {
    const existing = await prisma.item.findUnique({ where: { id } });
    await prisma.item.delete({ where: { id } });
    await invalidate([
      CACHE_KEYS.tree,
      CACHE_KEYS.byId(id),
      CACHE_KEYS.children(existing?.parentId ?? null),
    ]);
  }
}

type Row = {
  id: string;
  name: string;
  parentId: string | null;
  type: Item["type"];
  createdAt: Date;
  updatedAt: Date;
};

function map(row: Row): Item {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parentId,
    type: row.type,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
