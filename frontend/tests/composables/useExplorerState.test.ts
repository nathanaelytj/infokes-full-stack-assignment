import { describe, it, expect, vi } from "vitest";
import { nextTick } from "vue";

// Mock dataset
const data = [
  { id: 1, name: "root", type: "folder", parentId: null },
  { id: 2, name: "sub", type: "folder", parentId: 1 },
  { id: 3, name: "file.txt", type: "file", parentId: 2 },
] as const;

vi.mock("~/composables/useExplorerData", () => {
  function byId(id?: number) {
    if (id == null) return undefined;
    return data.find((d) => d.id === id);
  }
  return {
    useExplorerData: () => ({ byId }),
  };
});

import { useExplorerState } from "~/composables/useExplorerState";

describe("useExplorerState", () => {
  it("sets selectedId to folder when selecting a folder", () => {
    const { selectedId, updateUI } = useExplorerState();
    expect(selectedId.value).toBeNull();

    updateUI(1); // folder
    expect(selectedId.value).toBe(1);
  });

  it("coerces file selection to its parent folder using updateUI", () => {
    const { selectedId, updateUI } = useExplorerState();

    updateUI(3); // file -> parent 2
    expect(selectedId.value).toBe(2);
  });

  it("watches direct mutations and coerces file -> parent folder", async () => {
    const { selectedId } = useExplorerState();

    // simulate external set to a file id
    selectedId.value = 3;
    await nextTick();

    expect(selectedId.value).toBe(2);
  });
});
