/// <reference types="cypress" />

// Full end-to-end test that does NOT stub the backend API.
// Expects a running backend and frontend. Works with or without specific seeded names.
// Configure backend via CYPRESS_BACKEND_URL (defaults to http://backend:3000).

const backendUrl = (Cypress.env("BACKEND_URL") as string) || "http://backend:3000";

describe("Explorer fullstack (no stubs)", () => {
  before(() => {
    // Verify backend is reachable
    cy.request({ url: `${backendUrl}/api/v1/health`, failOnStatusCode: false }).then((res) => {
      expect(res.status, `Backend health at ${backendUrl}`).to.eq(200);
    });
  });

  beforeEach(() => {
    cy.visit("/", {
      onBeforeLoad(win) {
        const w: any = win as any;
        w.__NUXT__ = w.__NUXT__ || {};
        w.__NUXT__.config = w.__NUXT__.config || { public: {} };
        w.__NUXT__.config.public = {
          ...(w.__NUXT__.config.public || {}),
          backendUrl,
        };
      },
    });
  });

  it("navigates via tree and search against real API", () => {
    // Wait for at least one root folder row
    cy.get('li[data-type="folder"] > div', { timeout: 30000 })
      .should('exist')
      .first()
      .as('rootRow');

    // Capture the root name and select it
    cy.get('@rootRow')
      .invoke('text')
      .then((txt) => txt.trim())
      .as('rootName');

    cy.get('@rootRow').click();

    // Ensure right panel reflects the selected root
    cy.get('@rootName').then((rootName: any) => {
      cy.contains('h2', 'Contents:', { timeout: 10000 }).should('contain', rootName);
    });

    // Try to find a child folder under the selected root
    cy.get('@rootRow')
      .parent('li')
      .as('rootLI')
      .find('ul li[data-type="folder"] > div')
      .then(($kids) => {
        if ($kids.length > 0) {
          // Use the first child folder
          const $child = $kids.eq(0);
          const childName = ($child.text() || '').trim();

          // Select the child and verify right panel
          cy.wrap($child).click();
          cy.contains('h2', 'Contents:', { timeout: 10000 }).should('contain', childName);

          // Search by a substring of the child name (>= 2 chars)
          const q = childName.length >= 2 ? childName.slice(0, Math.min(5, childName.length)) : childName;
          if (q.length >= 2) {
            cy.get('[data-testid="search-input"]').should('be.visible').clear().type(q);
            cy.get('body').then(() => cy.wait(400));
            cy.contains('h2', 'Search Results', { timeout: 10000 })
              .parent()
              .within(() => {
                cy.contains(childName, { timeout: 10000 }).click();
              });
            cy.contains('Search Results').should('not.exist');
          }

          // Collapse child to parent (root)
          cy.contains('li[data-type=folder] div', childName, { timeout: 10000 }).click();
          cy.get('@rootName').then((rootName: any) => {
            cy.contains('h2', 'Contents:', { timeout: 10000 }).should('contain', rootName);
          });
        } else {
          // No children: just verify search navigates to the root via results
          cy.get('@rootName').then((rootName: any) => {
            const q = rootName.length >= 2 ? rootName.slice(0, Math.min(5, rootName.length)) : rootName;
            if (q.length >= 2) {
              cy.get('[data-testid="search-input"]').should('be.visible').clear().type(q);
              cy.get('body').then(() => cy.wait(400));
              cy.contains('h2', 'Search Results', { timeout: 10000 })
                .parent()
                .within(() => {
                  cy.contains(rootName, { timeout: 10000 }).click();
                });
              cy.contains('Search Results').should('not.exist');

              // Clicking the same root again collapses to None selected (no parent)
              cy.contains('li[data-type=folder] div', rootName, { timeout: 10000 }).click();
              cy.contains('h2', 'Contents:', { timeout: 10000 }).should('contain', 'None selected');
            }
          });
        }
      });
  });
});
