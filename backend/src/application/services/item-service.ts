import type { CreateItemDTO, Item, UpdateItemDTO } from "../../domain/item";
import type { IItemRepository } from "../ports/item-repository";

export class ItemService {
  constructor(private readonly repo: IItemRepository) {}

  async get(id: string): Promise<Item | null> {
    return this.repo.findById(id);
  }

  async listChildren(parentId: string | null): Promise<Item[]> {
    return this.repo.listChildren(parentId);
  }

  async listTree(): Promise<Item[]> {
    return this.repo.listTree();
  }

  async create(data: CreateItemDTO): Promise<Item> {
    // S: single responsibility here, validation left for controller or zod
    return this.repo.create(data);
  }

  async update(id: string, data: UpdateItemDTO): Promise<Item> {
    return this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
