// Cypress E2E tests for backend API endpoints
// Uses Cypress.env('API_BASE') if provided, otherwise defaults to http://backend:3000/api/v1

const API_BASE = Cypress.env('API_BASE') || 'http://backend:3000/api/v1';

describe('Backend API - /api/v1', () => {
  it('GET /health returns ok', () => {
    cy.request(`${API_BASE}/health`).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'ok');
    });
  });

  it('GET /items returns an array', () => {
    cy.request(`${API_BASE}/items`).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array');
    });
  });

  it('GET /items/children returns an array', () => {
    cy.request(`${API_BASE}/items/children`).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array');
    });
  });

  it('GET /items/search with q returns array (basic smoke)', () => {
    cy.request(`${API_BASE}/items/search?q=a&limit=10`).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data).to.be.an('array');
    });
  });

  it('GET /items/:id returns 404 for non-existent id', () => {
    cy.request({
      url: `${API_BASE}/items/00000000-0000-0000-0000-000000000000`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(404);
    });
  });

  it('GET /items/search requires q param', () => {
    cy.request({
      url: `${API_BASE}/items/search`,
      failOnStatusCode: false,
    }).then((res) => {
  // Elysia validation returns 422 when required query param is missing
  expect(res.status).to.equal(422);
  expect(res.body).to.have.property('summary');
    });
  });
});
