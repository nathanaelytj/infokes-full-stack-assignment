/// <reference types="cypress" />

// This test covers:
// - Loading items into tree
// - Opening a folder from tree
// - Searching a folder and navigating to it
// - Collapsing the tree back to parent when clicking an already-selected folder

describe("Explorer interactions", () => {
  function stubBackend() {
    cy.fixture("items.json").then((items) => {
      cy.intercept("GET", /\/api\/v1\/items(\?.*)?$/, items).as("getItems");
    });

    cy.intercept("GET", /\/api\/v1\/items\/search.*/, (req) => {
      const url = new URL(req.url);
      const q = url.searchParams.get("q") || "";
      if (q.toLowerCase().includes("a1")) {
        req.reply({ fixture: "search-a1.json" });
      } else {
        req.reply({ body: { data: [], nextCursor: null } });
      }
    }).as("searchItems");
  }

  beforeEach(() => {
    // Ensure frontend points to our baseUrl
    // Nuxt reads BACKEND_URL from env; we proxy to same origin
    stubBackend();
    cy.visit("/", {
      onBeforeLoad(win) {
        // Override runtime config if exposed on window to keep same-origin
        (win as any).__NUXT__ = (win as any).__NUXT__ || {};
      },
    });
    cy.wait("@getItems");
  });

  it("opens folder from tree, searches, and collapses", () => {
    // Open Root A by clicking its chevron then item
    cy.contains("li[data-type=folder] div", "Root A").as("rootA");

    // Chevron is the first icon; click it to expand
    cy.get("@rootA").within(() => {
      cy.get(".i-heroicons-chevron-right-20-solid").click({ force: true });
    });

    // Click on child A1 to select/open it (in tree selection updates right panel)
    cy.contains("li[data-type=folder] div", "A1").click();

    // Right panel should show contents for A1 (either empty or with doc)
    cy.contains("Contents:");
    cy.contains("A1");

    // Search for A1 using search bar
    cy.get('[data-testid="search-input"] input').type("A1");
    cy.get("body").then(() => cy.wait(350)); // debounce wait

    // Should show Search Results section and include A1
    cy.contains("Search Results");
    cy.contains("A1").click(); // navigate to folder from results

    // After navigating from results, search results should hide
    cy.contains("Search Results").should("not.exist");

    // Tree item A1 is selected; clicking it again collapses to its parent
    cy.contains("li[data-type=folder] div", "A1").click();

    // Expect selection to move to Root A (parent) — check right panel header
    cy.contains("Contents:")
      .parent()
      .within(() => {
        cy.contains("Root A");
      });
  });
});
