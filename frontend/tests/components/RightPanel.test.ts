import { render, screen, fireEvent } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import RightPanel from "~/components/explorer/RightPanel.vue";

const dataset = [
  { id: "1", name: "root", type: "folder", parentId: null },
  { id: "2", name: "child-folder", type: "folder", parentId: "1" },
  { id: "3", name: "doc.md", type: "file", parentId: "1" },
] as const;

vi.mock("~/composables/useExplorerData", () => {
  function byId(id?: string) {
    if (id == null) return undefined;
    return dataset.find((d) => d.id === id);
  }
  function childrenOf(id: string) {
    return dataset.filter((d) => d.parentId === id);
  }
  return { useExplorerData: () => ({ byId, childrenOf }) };
});

const global = {
  stubs: {
    UIcon: { template: "<i data-ui-icon></i>" },
  },
};

describe("RightPanel", () => {
  it("shows empty state when no folder selected", () => {
  render(RightPanel, { props: { selectedId: null }, global });
    expect(screen.getByText(/select a folder/i)).toBeTruthy();
  });

  it("lists children for selected folder and emits open when clicking a folder", async () => {
    const onOpen = vi.fn();
  render(RightPanel, { props: { selectedId: "1" }, global, attrs: { onOpen } });

    // Should render entries for child-folder and doc.md
    expect(screen.getByText(/child-folder/i)).toBeTruthy();
    expect(screen.getByText(/doc.md/i)).toBeTruthy();

    // Click folder tile should emit open with its id (2)
  const folderLabel = screen.getByText(/child-folder/i);
  const folderTile = folderLabel.closest('[data-id="2"]') as HTMLElement;
    await fireEvent.click(folderTile);
  expect(onOpen).toHaveBeenCalledWith("2");
  });
});
