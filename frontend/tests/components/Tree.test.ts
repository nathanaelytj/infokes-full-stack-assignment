import { render, screen, within, fireEvent } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import Tree from "~/components/explorer/Tree.vue";

const roots = [
  { id: 1, name: "root1", type: "folder", parentId: null },
  { id: 2, name: "root2", type: "folder", parentId: null },
];

vi.mock("~/composables/useExplorerData", () => ({
  useExplorerData: () => ({ roots }),
}));

// stub UIcon globally
const global = {
  stubs: {
    UIcon: {
      template: "<i data-ui-icon></i>",
    },
    // Custom stub to render a list item and forward clicks as `select`
    TreeItem: {
      props: ["item", "selectedId"],
      template:
        '<li role="listitem"><button @click="$emit(\'select\', item.id)">{{ item.name }}</button></li>',
    },
  },
};

describe("Tree", () => {
  it("renders roots and emits select on item select", async () => {
    const onSelect = vi.fn();
    render(Tree, {
      props: { selectedId: null },
      global,
      attrs: { onSelect },
    });

    // Ensure two root TreeItem instances are rendered
    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items.length).toBe(2);

    // Click first root -> should bubble select from Tree
    const first = items[0] as HTMLElement;
    const firstBtn = within(first).getByRole("button", { name: /root1/i });
    await fireEvent.click(firstBtn);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
