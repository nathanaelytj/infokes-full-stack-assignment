// Data and helpers for the Explorer. No external tree/explorer libraries used.
import { computed, ref } from "vue";
function useBackendUrl() {
  const config = useRuntimeConfig();
  return config.public.backendUrl as string;
}

export type ExplorerItemType = "folder" | "file";

export interface ExplorerItem {
  id: string; // UUID from backend
  name: string;
  type: ExplorerItemType;
  parentId: string | null; // UUID or null
}

const itemsRef = ref<ExplorerItem[]>([]);

async function loadFromBackend() {
  if (process.server) return; // avoid SSR fetch to prevent hydration mismatch
  const base = useBackendUrl();
  const { data, error } = await useFetch<{ data: ExplorerItem[] }>(
    `${base}/api/v1/items`,
    { key: "items:list", server: false },
  );
  if (error.value) return;
  itemsRef.value = data.value?.data ?? [];
}

export function useExplorerData() {
  const items = itemsRef;
  if (items.value.length === 0) void loadFromBackend();

  const byId = (id: string | null | undefined) =>
    id == null ? undefined : items.value.find((i) => i.id === id);

  const childrenOf = (parentId: string | null) =>
    items.value.filter((i) => i.parentId === parentId);

  const hasChildren = (id: string) =>
    items.value.some((i) => i.parentId === id);

  // Folder-only helpers for the tree view
  const folderChildrenOf = (parentId: string | null) =>
    items.value.filter((i) => i.parentId === parentId && i.type === "folder");

  const hasFolderChildren = (id: string) =>
    items.value.some((i) => i.parentId === id && i.type === "folder");

  // Only folders should appear at the tree root
  const roots = computed(() => folderChildrenOf(null));

  const pathToRoot = (id: string | null | undefined): string[] => {
    const path: string[] = [];
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
    folderChildrenOf,
    hasChildren,
    hasFolderChildren,
    pathToRoot,
    reload: loadFromBackend,
  };
}
