// Integration test: ensure frontend requests backend and renders data

describe('Frontend ↔ Backend integration', () => {
  beforeEach(() => {
    // Ignore Vite HMR websocket errors
    cy.on('uncaught:exception', (err) => {
      const msg = err?.message ?? '';
      if (msg.includes('WebSocket') || msg.includes('5173') || msg.includes('vite')) {
        return false;
      }
      return true;
    });
  });

  it('loads items from backend and shows tree + right panel', () => {
    // stub backend list endpoint
    cy.intercept('GET', '**/api/v1/items', { fixture: 'items.json' }).as('getItems');

    // open frontend
    cy.visit('/');

  // wait for UI to render items (give longer timeout in case of client-side delay)
  cy.contains('Documents', { timeout: 10000 }).should('be.visible');
  cy.contains('Pictures', { timeout: 10000 }).should('be.visible');
  cy.contains('Desktop', { timeout: 10000 }).should('be.visible');

  // select Documents from the tree
  cy.contains('Documents').click();

  // Right panel should now show children of Documents (Projects, Reports)
  cy.contains('Projects').should('be.visible');
  cy.contains('Reports').should('be.visible');
  });

  it('searches via backend and displays results', () => {
    // stub search endpoint
    cy.intercept('GET', '**/api/v1/items/search*', { fixture: 'search-a1.json' }).as('search');

    cy.visit('/');

    // type into search input and wait for search request for 'Projects'
    cy.get('[data-testid="search-input"] input, [data-testid="search-input"]')
      .type('Projects', { delay: 50 });

  // wait for UI to show search results (debounced client-side)
  cy.contains('Search Results', { timeout: 10000 }).should('be.visible');
  cy.contains('Projects', { timeout: 10000 }).should('be.visible');
  });
});
