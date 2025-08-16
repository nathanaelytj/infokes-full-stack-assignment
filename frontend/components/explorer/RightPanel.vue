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
          <UIcon name="i-heroicons-folder" class="w-12 h-12 text-blue-500" />
          <span class="mt-2 text-sm">Select a folder</span>
        </div>
      </template>
      <template v-else-if="children.length === 0">
        <div
          class="col-span-full flex flex-col items-center justify-center p-8 text-gray-500"
        >
          <UIcon
            name="i-heroicons-information-circle"
            class="w-16 h-16 text-gray-400"
          />
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
          <UIcon
            v-if="child.type === 'folder'"
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

const props = defineProps<{ selectedId: string | null }>();
const emit = defineEmits<{ (e: "open", id: string | null): void }>();

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

function onItemClick(id: string) {
  const item = byId(id);
  if (item?.type === "folder") emit("open", id);
}
</script>
