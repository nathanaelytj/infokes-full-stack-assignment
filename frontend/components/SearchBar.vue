<template>
  <div class="flex items-center gap-2">
    <UInput
      v-model="local"
      placeholder="Search files & folders..."
      icon="i-heroicons-magnifying-glass-20-solid"
      class="w-full"
      data-testid="search-input"
    >
      <template #trailing>
        <UButton
          v-if="local"
          color="neutral"
          variant="ghost"
          icon="i-heroicons-x-mark"
          aria-label="Clear search"
          data-testid="clear-search"
          @click="onClear"
        />
      </template>
    </UInput>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ (e: "update:modelValue", v: string): void }>();

const local = ref(props.modelValue);

watch(
  () => props.modelValue,
  (v) => {
    if (v !== local.value) local.value = v;
  },
);

watch(local, (v) => emit("update:modelValue", v));

function onClear() {
  local.value = "";
}
</script>
