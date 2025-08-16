// Flat ESLint v9 config for backend (TypeScript + Node + Vitest)
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // Ignore generated/output folders
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      ".output/**",
      "public/**",
    ],
  },

  // Base language options for all JS/TS files
  {
    files: ["**/*.{ts,js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Type-aware linting for TS files (leverages TS project service; reads tsconfig.json)
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
  },

  // Tests: enable Vitest globals and relax strictness a bit
  {
    files: [
      "tests/**/*.{ts,js}",
      "**/*.test.{ts,js}",
      "**/__tests__/**/*.{ts,js}",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...(globals.vitest ?? {}),
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Prettier as a formatting rule (warn-only) and disable stylistic conflicts
  {
    files: ["**/*.{ts,js,mjs,cjs}"],
    plugins: { prettier },
    rules: {
      "prettier/prettier": "warn",
    },
  },
  eslintConfigPrettier,
];
