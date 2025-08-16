<template>
  <div>
    <h2 class="font-semibold mb-3 text-gray-700">Folder Tree</h2>
    <ul class="[&>*+*]:mt-1">
      <TreeItem
        v-for="root in roots"
        :key="root.id"
        :item="root"
        :selected-id="selectedId"
        @select="onSelect"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useExplorerData } from "~/composables/useExplorerData";
import TreeItem from "./TreeItem.vue";

const { selectedId } = defineProps<{ selectedId: number | null }>();
const emit = defineEmits<{ (e: "select", id: number | null): void }>();

const { roots } = useExplorerData();

function onSelect(id: number | null) {
  emit("select", id);
}
</script>
