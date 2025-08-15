<template>
  <div>
    <div class="mb-4">
      <h2 class="font-semibold text-gray-700">
        Contents:
        <span class="font-normal text-gray-500">{{ currentFolderName }}</span>
      </h2>
    </div>
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
      <template v-if="!selectedFolder">
        <div
          class="col-span-full flex flex-col items-center justify-center p-6 text-gray-500"
        >
          <svg
            class="w-12 h-12 text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <span class="mt-2 text-sm">Select a folder</span>
        </div>
      </template>
      <template v-else-if="children.length === 0">
        <div
          class="col-span-full flex flex-col items-center justify-center p-8 text-gray-500"
        >
          <svg
            class="w-16 h-16 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="mt-2">This folder is empty.</p>
        </div>
      </template>
      <template v-else>
        <div
          v-for="child in children"
          :key="child.id"
          class="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-xl shadow-sm cursor-pointer"
          :data-id="child.id"
          :data-type="child.type"
          @click="onItemClick(child.id)"
        >
          <svg
            v-if="child.type === 'folder'"
            class="w-12 h-12 text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <svg
            v-else
            class="w-12 h-12 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span
            class="mt-2 text-sm text-gray-600 text-center truncate w-full"
            :title="child.name"
            >{{ child.name }}</span
          >
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useExplorerData } from "~/composables/useExplorerData";

const props = defineProps<{ selectedId: number | null }>();
const emit = defineEmits<{ (e: "open", id: number | null): void }>();

const { byId, childrenOf } = useExplorerData();

const selectedFolder = computed(() =>
  props.selectedId ? byId(props.selectedId) : undefined,
);
const currentFolderName = computed(
  () => selectedFolder.value?.name ?? "None selected",
);
const children = computed(() =>
  props.selectedId == null ? [] : childrenOf(props.selectedId),
);

function onItemClick(id: number) {
  const item = byId(id);
  if (item?.type === "folder") emit("open", id);
}
</script>
