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
