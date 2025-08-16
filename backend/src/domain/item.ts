export type ItemType = "folder" | "file";

export interface Item {
  id: string;
  name: string;
  parentId: string | null;
  type: ItemType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateItemDTO {
  name: string;
  parentId: string | null;
  type: ItemType;
}

export interface UpdateItemDTO {
  name?: string;
  parentId?: string | null;
}
