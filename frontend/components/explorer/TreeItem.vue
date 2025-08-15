<template>
  <li :data-id="item.id" :data-type="item.type">
    <div
      class="flex items-center gap-2 p-2 rounded-md cursor-pointer select-none transition-colors hover:bg-gray-200"
      :class="{ 'bg-gray-300': isActive }"
      @click.stop="onClickItem"
    >
      <span
        v-if="isFolder && hasKids"
        class="inline-flex items-center justify-center"
        @click.stop="toggle"
      >
        <svg
          class="size-4 text-gray-500 transition-transform"
          :class="{ 'rotate-90': open }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </span>
      <span v-else class="inline-block size-4" />

      <span class="inline-flex">
        <svg
          v-if="isFolder"
          class="size-5 text-blue-500"
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
          class="size-5 text-gray-500"
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
      </span>

      <span class="truncate">{{ item.name }}</span>
    </div>

    <div
      v-if="isFolder && hasKids"
      class="w-full overflow-hidden transition-[max-height] duration-300 ease-out"
      :style="{ maxHeight: open ? '500px' : '0' }"
    >
      <ul class="pl-6">
        <TreeItem
          v-for="child in children"
          :key="child.id"
          :item="child"
          :selected-id="selectedId"
          @select="emit('select', $event)"
        />
      </ul>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  useExplorerData,
  type ExplorerItem,
} from "~/composables/useExplorerData";

const props = defineProps<{ item: ExplorerItem; selectedId: number | null }>();
const emit = defineEmits<{ (e: "select", id: number | null): void }>();

const { childrenOf, hasChildren, pathToRoot } = useExplorerData();

const isFolder = computed(() => props.item.type === "folder");
const hasKids = computed(() => hasChildren(props.item.id));
const children = computed(() => childrenOf(props.item.id));
const isActive = computed(() => props.item.id === props.selectedId);
const open = ref(false);

watch(
  () => props.selectedId,
  (id) => {
    const path = pathToRoot(id ?? null);
    open.value = isFolder.value && path.includes(props.item.id);
  },
  { immediate: true },
);

function onClickItem() {
  emit("select", props.item.id);
}

function toggle() {
  // If already open and is active, collapse to parent (handled in page logic)
  open.value = !open.value;
  emit("select", props.item.id);
}
</script>
