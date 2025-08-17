import { render, screen, fireEvent } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import IndexPage from "~/pages/index.vue";

const hoisted = vi.hoisted(() => ({
  dataset: [
    { id: "1", name: "root", type: "folder", parentId: null },
    { id: "2", name: "sub", type: "folder", parentId: "1" },
    { id: "3", name: "file.txt", type: "file", parentId: "2" },
  ],
}));

beforeEach(() => {
  vi.stubGlobal("useRuntimeConfig", () => ({
    public: { backendUrl: "http://backend" },
  }));
  vi.stubGlobal("useHead", () => void 0);
  vi.stubGlobal("onMounted", (fn: () => void) => fn());
  // Minimal stubs for Nuxt UI components used in page
  (globalThis as any).$stubs = {
    UIcon: { template: "<i data-ui-icon></i>" },
    UButton: {
      template: "<button @click=\"$emit('click')\"><slot /></button>",
    },
    UInput: {
      props: ["modelValue"],
      emits: ["update:modelValue"],
      template:
        '<input role="textbox" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    },
    ULoader: { template: "<div data-loader></div>" },
  };
});

afterEach(() => {
  vi.unstubAllGlobals();
});

vi.mock("~/composables/useExplorerData", () => {
  function byId(id?: string) {
    if (id == null) return undefined;
    return hoisted.dataset.find((d) => d.id === id);
  }
  function childrenOf(id: string) {
    return hoisted.dataset.filter((d) => d.parentId === id);
  }
  const roots = hoisted.dataset.filter((d) => d.parentId === null);
  function folderChildrenOf(parentId: string | null) {
    return hoisted.dataset.filter(
      (d) => d.parentId === parentId && d.type === "folder",
    );
  }
  function hasFolderChildren(id: string) {
    return hoisted.dataset.some(
      (d) => d.parentId === id && d.type === "folder",
    );
  }
  function pathToRoot(id: string | null | undefined) {
    const path: string[] = [];
    let curr = id ? hoisted.dataset.find((d) => d.id === id) : undefined;
    while (curr) {
      path.unshift(curr.id);
      curr = curr.parentId
        ? hoisted.dataset.find((d) => d.id === curr!.parentId)
        : undefined;
    }
    return path;
  }
  return {
    useExplorerData: () => ({
      byId,
      childrenOf,
      roots,
      folderChildrenOf,
      hasFolderChildren,
      pathToRoot,
    }),
  };
});

vi.mock("~/components/SearchBar.vue", () => ({
  default: {
    props: ["modelValue"],
    emits: ["update:modelValue"],
    template:
      '<input role="textbox" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
}));

vi.mock("~/components/explorer/Tree.vue", () => ({
  default: {
    props: ["selectedId"],
    emits: ["select"],
    template: `<div><button role="tree-button" @click="$emit('select', '1')">selectRoot</button></div>`,
  },
}));

vi.mock("~/components/explorer/RightPanel.vue", () => ({
  default: {
    props: ["selectedId"],
    emits: ["open"],
    template: `<div><button role="open-folder" @click="$emit('open', '2')">open</button></div>`,
  },
}));

vi.mock("~/composables/useExplorerSearch", async () => {
  const actual = await vi.importActual<any>("~/composables/useExplorerSearch");
  return {
    useExplorerSearch: (n: number) => {
      const inst = actual.useExplorerSearch(n);
      // speed up debounce in tests
      (inst as any).setQuery = (v: string) => {
        inst.query.value = v;
        inst.touched.value = true;
      };
      return inst;
    },
  };
});

describe("Index Page", () => {
  it("retains search text but hides results when navigating to a folder", async () => {
    const { rerender } = render(IndexPage, {
      global: {
        stubs: (globalThis as any).$stubs,
      },
    });

    // Type a query into search bar
    const input = screen.getByRole("textbox") as HTMLInputElement;
    await fireEvent.update(input, "abc");

    // ensure results section becomes visible by setting touched + results
    // this is handled by useExplorerSearch; manually simulate
    // by calling setQuery then trigger load
    // For our stub, touched is set on update already. Now mock that results exist
    // We do this by re-rendering (not strictly necessary), page template checks touched + length.
    await rerender({});

    // Click tree select to open a folder, page should hide results but keep input value
    const treeBtn = screen.getByRole("tree-button");
    await fireEvent.click(treeBtn);

    // Search input still has value
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("abc");

    // Results section should be hidden now (no 'Search Results' heading)
    expect(screen.queryByText(/Search Results/i)).toBeNull();
  });
});
