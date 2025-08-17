/// <reference types="cypress" />

// This test covers:
// - Loading items into tree
// - Opening a folder from tree
// - Searching a folder and navigating to it
// - Collapsing the tree back to parent when clicking an already-selected folder

describe("Explorer interactions (with backend stubs)", () => {
  function stubBackend() {
    cy.fixture("items.json").then((items) => {
      cy.intercept({ method: "GET", url: "**/api/v1/items*" }, items).as("getItems");
    });

    cy.intercept({ method: "GET", url: "**/api/v1/items/search*" }, (req) => {
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
    // Ensure frontend points to backend service on a different host
    // Nuxt reads BACKEND_URL from runtime config; point it to backend:3000
    stubBackend();
    cy.visit("/", {
      onBeforeLoad(win) {
        // Force Nuxt runtime to use backend:3000 so intercepts work reliably
        const w: any = win as any;
        w.__NUXT__ = w.__NUXT__ || {};
        w.__NUXT__.config = w.__NUXT__.config || { public: {} };
        w.__NUXT__.config.public = {
          ...(w.__NUXT__.config.public || {}),
          backendUrl: "http://backend:3000",
        };
      },
    });
    cy.wait("@getItems", { timeout: 15000 });
  });

  it("opens folder from tree, searches, and collapses", () => {
    // Open Root A by clicking its chevron then item
    cy.contains("li[data-type=folder] div", "Root A").as("rootA");

    // Click the tree row to select and expand Root A
    cy.get("@rootA").click();

    // Click on child A1 to select/open it (in tree selection updates right panel)
    cy.contains("li[data-type=folder] div", "A1").click();

    // Right panel should show contents for A1 (either empty or with doc)
    cy.contains("h2", "Contents:").should("contain", "A1");

    // Search for A1 using search bar
    cy.get('[data-testid="search-input"]').type("A1");
    cy.get("body").then(() => cy.wait(350)); // debounce wait

    // Should show Search Results section and include A1
    cy.contains("h2", "Search Results");
    cy.contains("h2", "Search Results")
      .parent()
      .within(() => {
        cy.contains("A1").click(); // navigate to folder from results
      });

    // After navigating from results, search results should hide
    cy.contains("Search Results").should("not.exist");

    // Tree item A1 is selected; clicking it again collapses to its parent
    cy.contains("li[data-type=folder] div", "A1").click();

    // Expect selection to move to Root A (parent)
    // 1) Tree highlight moves to Root A
    cy.get('li[data-id="root-a"] > div').should("have.class", "bg-gray-300");
    // 2) Right panel header shows Root A
    cy.contains("h2", "Contents:", { timeout: 10000 }).should("contain", "Root A");
  });
});
