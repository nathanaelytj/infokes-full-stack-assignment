import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { useExplorerSearch } from "~/composables/useExplorerSearch";

// Stub Nuxt runtime config and fetch
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("useRuntimeConfig", () => ({
    public: { backendUrl: "http://backend" },
  }));
  const useFetchMock = vi.fn().mockImplementation(() => ({
    data: ref({ data: [], nextCursor: null }),
    error: ref(null),
  }));
  vi.stubGlobal("useFetch", useFetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useExplorerSearch", () => {
  it("debounces search and calls backend with bound params", async () => {
    const search = useExplorerSearch(10);

    // start with empty
    expect(search.touched.value).toBe(false);
    expect(search.results.value.length).toBe(0);

    // set query -> touched true; debounce before fetch
    search.setQuery("docs");
    expect(search.touched.value).toBe(true);

    // Before debounce, no call yet
    const useFetchSpy = (globalThis as any).useFetch as ReturnType<
      typeof vi.fn
    >;
    expect(useFetchSpy).toHaveBeenCalledTimes(0);

    // Run debounce timer
    await vi.advanceTimersByTimeAsync(300);

    // Now fetch called with expected URL
    expect(useFetchSpy).toHaveBeenCalledTimes(1);
    const call = useFetchSpy.mock.calls[0] as unknown as [
      string,
      { server: boolean },
    ];
    const [url, opts] = call;
    expect(String(url)).toMatch(
      /http:\/\/backend\/api\/v1\/items\/search\?q=docs&limit=10/,
    );
    expect(opts).toMatchObject({ server: false });
  });

  it("hide() keeps text but hides results and touched flag", async () => {
    const search = useExplorerSearch(5);
    search.setQuery("ab");
    await vi.advanceTimersByTimeAsync(300);

    search.hide();
    expect(search.query.value).toBe("ab");
    expect(search.touched.value).toBe(false);
    expect(search.results.value.length).toBe(0);
    expect(search.nextCursor.value).toBeNull();
  });
});
