// Data and helpers for the Explorer. No external tree/explorer libraries used.
import { computed, ref } from "vue";

export type ExplorerItemType = "folder" | "file";

export interface ExplorerItem {
  id: number;
  name: string;
  type: ExplorerItemType;
  parentId: number | null;
}

const itemsRef = ref<ExplorerItem[]>([
  { id: 1, name: "Documents", type: "folder", parentId: null },
  { id: 2, name: "Work", type: "folder", parentId: 1 },
  { id: 3, name: "Personal", type: "folder", parentId: 1 },
  { id: 4, name: "Reports", type: "folder", parentId: 2 },
  { id: 5, name: "Photos", type: "folder", parentId: 3 },
  { id: 6, name: "Q3-Report.pdf", type: "file", parentId: 4 },
  { id: 7, name: "Q4-Report.docx", type: "file", parentId: 4 },
  { id: 8, name: "My-Project", type: "folder", parentId: null },
  { id: 9, name: "src", type: "folder", parentId: 8 },
  { id: 10, name: "assets", type: "folder", parentId: 8 },
  { id: 11, name: "Videos", type: "folder", parentId: null },
]);

export function useExplorerData() {
  const items = itemsRef;

  const byId = (id: number | null | undefined) =>
    id == null ? undefined : items.value.find((i) => i.id === id);

  const childrenOf = (parentId: number | null) =>
    items.value.filter((i) => i.parentId === parentId);

  const hasChildren = (id: number) =>
    items.value.some((i) => i.parentId === id);

  const roots = computed(() => childrenOf(null));

  const pathToRoot = (id: number | null | undefined): number[] => {
    const path: number[] = [];
    let curr = byId(id);
    while (curr) {
      path.unshift(curr.id);
      curr = byId(curr.parentId ?? undefined);
    }
    return path;
  };

  return {
    items,
    roots,
    byId,
    childrenOf,
    hasChildren,
    pathToRoot,
  };
}
