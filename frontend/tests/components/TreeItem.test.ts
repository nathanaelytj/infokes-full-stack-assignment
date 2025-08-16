import { render, screen, fireEvent } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import TreeItem from "~/components/explorer/TreeItem.vue";

const dataset = [
  { id: 1, name: "root", type: "folder", parentId: null },
  { id: 2, name: "child-folder", type: "folder", parentId: 1 },
  { id: 3, name: "doc.md", type: "file", parentId: 2 },
] as const;

vi.mock("~/composables/useExplorerData", () => {
  function folderChildrenOf(id: number) {
    return dataset.filter((d) => d.parentId === id && d.type === "folder");
  }
  function hasFolderChildren(id: number) {
    return folderChildrenOf(id).length > 0;
  }
  function pathToRoot(id: number | null) {
    if (id == null) return [] as number[];
    const path: number[] = [];
    let cur = dataset.find((d) => d.id === id);
    while (cur && cur.parentId != null) {
      path.unshift(cur.parentId);
      cur = dataset.find((d) => d.id === cur?.parentId);
    }
    return path;
  }
  return {
    useExplorerData: () => ({
      folderChildrenOf,
      hasFolderChildren,
      pathToRoot,
    }),
  };
});

const global = {
  stubs: {
    UIcon: { template: "<i data-ui-icon></i>" },
  },
};

describe("TreeItem", () => {
  it("renders folder icon and emits select on row click", async () => {
    const emitSelect = vi.fn();
    const { container } = render(TreeItem, {
      props: { item: dataset[0] as any, selectedId: null },
      global,
      attrs: { onSelect: emitSelect },
    });

    // Folder chevron should exist because it has kid folder (stubbed UIcon)
    const chevrons = container.querySelectorAll(
      '[data-ui-icon][name="i-heroicons-chevron-right-20-solid"]',
    );
    expect(chevrons.length).toBeGreaterThanOrEqual(1);

    // Click the folder line -> emit select with its id
    const row = screen.getByText(/root/i).closest("div");
    await fireEvent.click(row!);
    expect(emitSelect).toHaveBeenCalledWith(1);
  });

  it("propagates select from child items", async () => {
    const emitSelect = vi.fn();
    render(TreeItem, {
      props: { item: dataset[0] as any, selectedId: null },
      global: {
        stubs: {
          ...global.stubs,
          TreeItem: {
            props: ["item", "selectedId"],
            template:
              '<li role="listitem"><button @click="$emit(\'select\', 3)">child</button></li>',
          },
        },
      },
      attrs: { onSelect: emitSelect },
    });

    const btn = screen.getByRole("button", { name: /child/i });
    await fireEvent.click(btn);
    expect(emitSelect).toHaveBeenCalledWith(3);
  });
});
