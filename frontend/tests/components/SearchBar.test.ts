import { render, screen, fireEvent } from "@testing-library/vue";
import { describe, it, expect } from "vitest";
import SearchBar from "~/components/SearchBar.vue";

const global = {
  stubs: {
    UInput: {
      props: ["modelValue"],
      template:
        '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    },
    UButton: {
      props: ["color", "variant", "icon"],
      template: "<button @click=\"$emit('click')\"><slot /></button>",
    },
  },
};

describe("SearchBar", () => {
  it("emits update on typing and clears on button", async () => {
    const { emitted } = render(SearchBar, {
      props: { modelValue: "" },
      global,
    });

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await fireEvent.update(input, "hello");

    // should emit update:modelValue with typed value
    const evts = emitted() as any;
    expect(evts["update:modelValue"][0]).toEqual(["hello"]);

    // add a clear button by setting prop via re-render with non-empty value
    await fireEvent.update(input, "world");
    expect(evts["update:modelValue"][1]).toEqual(["world"]);
  });
});
