import type { CreateItemDTO, Item, UpdateItemDTO } from "../../domain/item";

export type ItemSearchParams = {
  q: string;
  parentId?: string | null;
  type?: Item["type"];
  limit: number;
  cursor?: string | null;
};

export type ItemSearchResult = {
  items: Item[];
  nextCursor: string | null;
};

export interface IItemRepository {
  findById(id: string): Promise<Item | null>;
  listChildren(parentId: string | null): Promise<Item[]>;
  listTree(): Promise<Item[]>; // flat list, build tree at client if needed
  create(data: CreateItemDTO): Promise<Item>;
  update(id: string, data: UpdateItemDTO): Promise<Item>;
  delete(id: string): Promise<void>;
  search(params: ItemSearchParams): Promise<ItemSearchResult>;
}
