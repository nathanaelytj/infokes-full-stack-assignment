import { ref, watch } from "vue";
import { useExplorerData } from "./useExplorerData";

export function useExplorerState() {
  const { byId } = useExplorerData();

  const selectedId = ref<number | null>(null);

  function updateUI(newId: number | null) {
    const item = byId(newId ?? undefined);
    if (item && item.type === "file") {
      selectedId.value = item.parentId;
    } else {
      selectedId.value = newId;
    }
  }

  // Ensure selected always a folder or null
  watch(selectedId, (id) => {
    const item = byId(id ?? undefined);
    if (item && item.type === "file") {
      selectedId.value = item.parentId;
    }
  });

  return { selectedId, updateUI };
}
