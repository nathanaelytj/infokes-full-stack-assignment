// ESLint Flat Config for Cypress + TypeScript (E2E only)
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { ignores: ["node_modules/**", "cypress/screenshots/**", "cypress/videos/**", "**/*.d.ts"] },
  // JS files: use default parser (avoid TypeScript project service for mjs like eslint.config.mjs)
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        // Cypress globals
        cy: true,
        Cypress: true,
        describe: true,
        it: true,
        before: true,
        beforeEach: true,
        after: true,
        afterEach: true,
      },
    },
  },
  // TypeScript files (including Cypress .ts specs/support)
  {
    files: ["**/*.ts", "cypress/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        cy: true,
        Cypress: true,
        describe: true,
        it: true,
        before: true,
        beforeEach: true,
        after: true,
        afterEach: true,
      },
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        allowDefaultProject: true,
      },
    },
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-unused-vars": "off",
    },
  },
  {
    rules: {
      // Defer to Prettier for formatting
    },
  },
];
