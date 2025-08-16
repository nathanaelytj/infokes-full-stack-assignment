import { ref, watch } from "vue";
import type { ExplorerItem } from "./useExplorerData";

function useBackendUrl() {
  const config = useRuntimeConfig();
  return config.public.backendUrl as string;
}

export function useExplorerSearch(limit = 20) {
  const base = useBackendUrl();

  const query = ref("");
  const loading = ref(false);
  const results = ref<ExplorerItem[]>([]);
  const nextCursor = ref<string | null>(null);
  const touched = ref(false);

  let timer: ReturnType<typeof setTimeout> | null = null;

  async function runSearch(cursor?: string | null) {
    const q = query.value.trim();
    if (q.length < 2) {
      // reset when query too short
      results.value = [];
      nextCursor.value = null;
      loading.value = false;
      return;
    }

    loading.value = true;
    const params = new URLSearchParams({ q, limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    const { data, error } = await useFetch<{
      data: ExplorerItem[];
      nextCursor: string | null;
    }>(`${base}/api/v1/items/search?${params.toString()}`, {
      key: `items:search:${q}:${cursor ?? ""}`,
      server: false,
    });

    if (!error.value) {
      const payload = data.value;
      // If cursor provided, append; else replace
      if (cursor) {
        results.value = results.value.concat(payload?.data ?? []);
      } else {
        results.value = payload?.data ?? [];
      }
      nextCursor.value = payload?.nextCursor ?? null;
    }
    loading.value = false;
  }

  function setQuery(v: string) {
    query.value = v;
    touched.value = true;
  }

  async function loadMore() {
    if (!nextCursor.value || loading.value) return;
    await runSearch(nextCursor.value);
  }

  function clear() {
    query.value = "";
    results.value = [];
    nextCursor.value = null;
    touched.value = false;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function hide() {
    // Keep query text, but hide results and stop any pending search
    results.value = [];
    nextCursor.value = null;
    touched.value = false;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  watch(
    () => query.value,
    () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        runSearch(null);
      }, 300);
    },
  );

  return {
    query,
    loading,
    results,
    nextCursor,
    touched,
    setQuery,
    loadMore,
    clear,
    hide,
  };
}
