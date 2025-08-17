// Import commands.js using ES2015 syntax:
import "./commands";

// Hide fetch/XHR logs for cleaner output (Cypress >= v10) by injecting CSS
try {
  const app = window.top as Window | null;
  if (app && !app.document.head.querySelector("[data-hide-command-log-request]")) {
    const style = app.document.createElement("style");
    style.setAttribute("data-hide-command-log-request", "");
    style.innerHTML = `
      .command-name-request,
      .command-name-xhr,
      .command-name-fetch { display: none !important; }
    `;
    app.document.head.appendChild(style);
  }
} catch {
  // Accessing window.top can fail due to cross-origin;
}

// Ignore Vite/Nuxt dev-server websocket noise that can surface as unhandled rejections
// Example: "WebSocket closed without opened." from /_nuxt/@vite/client
Cypress.on("uncaught:exception", (err) => {
  const message = err?.message ?? "";
  const stack = err?.stack ?? "";

  const isViteWsNoise =
    message.includes("WebSocket closed") ||
    message.includes("WebSocket is not open") ||
    stack.includes("/_nuxt/@vite/client") ||
    stack.includes("vite/client") ||
    (/WebSocket/i.test(message) && /vite/i.test(stack));

  if (isViteWsNoise) {
    // returning false here prevents Cypress from failing the test
    return false;
  }

  // Let other unexpected errors fail the test
  return undefined as any;
});
