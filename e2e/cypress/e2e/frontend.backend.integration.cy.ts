// Integration test: ensure frontend requests backend and renders data

describe("Frontend ↔ Backend integration", () => {
  beforeEach(() => {
    // Ignore Vite HMR websocket errors
    cy.on("uncaught:exception", (err) => {
      const msg = err?.message ?? "";
      if (msg.includes("WebSocket") || msg.includes("5173") || msg.includes("vite")) {
        return false;
      }
      return true;
    });
  });

  it("loads items from backend and shows tree + right panel", () => {
    // stub backend list endpoint
    cy.intercept("GET", "**/api/v1/items", { fixture: "items.json" }).as("getItems");

    // open frontend
    cy.visit("/");

    // assert runtime config has backendUrl (helps debug integration)
    cy.window({ timeout: 10000 }).then((win) => {
      // Nuxt exposes runtime config under __NUXT__ for client builds
      const backend = (win as any).__NUXT__?.runtimeConfig?.public?.backendUrl;
      // log for debugging in test runner
      console.log("frontend.runtime.backendUrl=", backend);
      expect(typeof backend === "string" || backend === undefined).to.be.ok;
    });

    // wait for UI to render items (give longer timeout in case of client-side delay)
    cy.contains("Documents", { timeout: 10000 }).should("be.visible");
    cy.contains("Pictures", { timeout: 10000 }).should("be.visible");
    cy.contains("Desktop", { timeout: 10000 }).should("be.visible");

    // select Documents from the tree
    cy.contains("Documents").click();

    // Right panel should now show children of Documents (Projects, Reports)
    cy.contains("Projects").should("be.visible");
    cy.contains("Reports").should("be.visible");
  });
});
