// Frontend smoke test: visit the app and assert main UI renders.
// Also ignore Vite HMR websocket 5173 errors which sometimes surface in Cypress.

describe("Frontend UI", () => {
  beforeEach(() => {
    // Ignore Vite HMR websocket errors (WS 5173) that can appear in CI/dev when HMR is not reachable
    cy.on("uncaught:exception", (err) => {
      const msg = err?.message ?? "";
      if (msg.includes("WebSocket") || msg.includes("5173") || msg.includes("vite")) {
        return false; // prevent test failure
      }
      return true;
    });
  });

  it("renders main layout and core components", () => {
    cy.visit("/");

    // Header title
    cy.contains("h1", "Windows Explorer").should("be.visible");

    // Search input
    cy.get('[data-testid="search-input"]').should("exist").and("be.visible");

    // Right panel heading
    cy.contains("h2", "Contents:").should("be.visible");

    // Placeholder text when nothing selected
    cy.contains("Select a folder").should("be.visible");
  });
});
