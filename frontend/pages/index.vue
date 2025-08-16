<template>
  <div class="p-6 min-h-screen bg-gray-100 flex flex-col">
    <header class="mb-4 space-y-3">
      <h1 class="text-3xl font-bold text-gray-800 text-center">
        Windows Explorer
      </h1>
      <div class="max-w-3xl mx-auto">
        <SearchBar v-model="search.queryStr" />
        <div
          v-if="search.touched && search.queryStr.trim().length >= 2"
          class="mt-2 text-sm text-gray-600"
        >
          <span v-if="search.loading">Searching…</span>
          <span v-else>{{ search.results.length }} result(s)</span>
        </div>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden bg-white rounded-xl shadow-lg">
      <aside
        class="w-1/3 md:w-1/4 lg:w-1/5 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto"
      >
        <ExplorerTree :selected-id="selectedId" @select="onSelectFromTree" />
      </aside>
      <main class="flex-1 p-6 overflow-y-auto">
        <template v-if="search.touched && search.queryStr.trim().length >= 2">
          <section>
            <h2 class="font-semibold text-gray-700 mb-3">Search Results</h2>
            <div
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              <div
                v-for="item in search.results"
                :key="item.id"
                class="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-xl shadow-sm cursor-pointer"
                @click="onResultClick(item)"
              >
                <UIcon
                  v-if="item.type === 'folder'"
                  name="i-heroicons-folder"
                  class="w-12 h-12 text-blue-500"
                />
                <UIcon
                  v-else
                  name="i-heroicons-document"
                  class="w-12 h-12 text-gray-500"
                />
                <span
                  class="mt-2 text-sm text-gray-600 text-center truncate w-full"
                  :title="item.name"
                  >{{ item.name }}</span
                >
              </div>
            </div>
            <div
              v-if="search.nextCursor && !search.loading"
              class="mt-4 flex justify-center"
            >
              <UButton color="primary" variant="soft" @click="search.loadMore()"
                >Load more</UButton
              >
            </div>
            <div v-if="search.loading" class="mt-4 flex justify-center">
              <ULoader size="lg" />
            </div>
          </section>
        </template>
        <template v-else>
          <RightPanel :selected-id="selectedId" @open="onOpenFromRight" />
        </template>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: "Windows Explorer" });
import ExplorerTree from "~/components/explorer/Tree.vue";
import RightPanel from "~/components/explorer/RightPanel.vue";
import SearchBar from "~/components/SearchBar.vue";
import { useExplorerData } from "~/composables/useExplorerData";
import { useExplorerState } from "~/composables/useExplorerState";
import { useExplorerSearch } from "~/composables/useExplorerSearch";

const { byId } = useExplorerData();
const { selectedId, updateUI } = useExplorerState();
const searchCtl = useExplorerSearch(24);
const search = reactive({
  get queryStr() {
    return searchCtl.query.value;
  },
  set queryStr(v: string) {
    searchCtl.setQuery(v);
  },
  get loading() {
    return searchCtl.loading.value;
  },
  get results() {
    return searchCtl.results.value;
  },
  get nextCursor() {
    return searchCtl.nextCursor.value;
  },
  get touched() {
    return searchCtl.touched.value;
  },
  loadMore: () => searchCtl.loadMore(),
});

function onSelectFromTree(id: string | null) {
  const item = byId(id ?? undefined);
  const isSelected = selectedId.value === id;
  // Hide search results (retain text) when a folder is selected from the tree
  searchCtl.hide();
  if (item?.type === "folder" && isSelected) {
    // collapse to parent
    const parent = byId(item.parentId ?? undefined);
    updateUI(parent ? parent.id : null);
  } else {
    updateUI(id);
  }
}

function onOpenFromRight(id: string | null) {
  // Hide search results when navigating via right panel
  searchCtl.hide();
  updateUI(id);
}

onMounted(() => {
  updateUI(null);
});

function onResultClick(item: {
  id: string;
  type: "folder" | "file";
  parentId: string | null;
}) {
  // When clicking a search result:
  // - if folder: navigate to it
  // - if file: open its parent folder
  // Hide search upon navigating to a folder from results
  searchCtl.hide();
  updateUI(item.type === "folder" ? item.id : item.parentId);
}
</script>
