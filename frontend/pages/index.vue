<template>
  <div class="p-6 min-h-screen bg-gray-100 flex flex-col">
    <header class="text-center mb-4">
      <h1 class="text-3xl font-bold text-gray-800">Windows Explorer</h1>
    </header>

    <div class="flex-1 flex overflow-hidden bg-white rounded-xl shadow-lg">
      <aside
        class="w-1/3 md:w-1/4 lg:w-1/5 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto"
      >
        <ExplorerTree :selected-id="selectedId" @select="onSelectFromTree" />
      </aside>
      <main class="flex-1 p-6 overflow-y-auto">
        <RightPanel :selected-id="selectedId" @open="onOpenFromRight" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: "Windows Explorer" });
import ExplorerTree from "~/components/explorer/Tree.vue";
import RightPanel from "~/components/explorer/RightPanel.vue";
import { useExplorerData } from "~/composables/useExplorerData";
import { useExplorerState } from "~/composables/useExplorerState";

const { byId } = useExplorerData();
const { selectedId, updateUI } = useExplorerState();

function onSelectFromTree(id: number | null) {
  const item = byId(id ?? undefined);
  const isSelected = selectedId.value === id;
  if (item?.type === "folder" && isSelected) {
    // collapse to parent
    const parent = byId(item.parentId ?? undefined);
    updateUI(parent ? parent.id : null);
  } else {
    updateUI(id);
  }
}

function onOpenFromRight(id: number | null) {
  updateUI(id);
}

onMounted(() => {
  updateUI(null);
});
</script>
