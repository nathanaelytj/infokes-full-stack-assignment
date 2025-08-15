// Flat config for ESLint v9, Vue 3, and TypeScript
import globals from "globals";
import vue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // Ignore generated/output folders
  {
    ignores: [".nuxt/**", "node_modules/**", "dist/**", ".output/**"],
  },
  // Base language options for all files
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  // TypeScript recommended rules (apply first)
  ...tseslint.configs.recommended,
  // Vue 3 recommended (flat) config — sets vue-eslint-parser for .vue files (must come after TS so it wins for .vue)
  ...vue.configs["flat/recommended"],
  // Ensure <script lang="ts"> inside .vue uses TypeScript parser through vue-eslint-parser
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        // Let vue-eslint-parser hand off <script> blocks to TS parser
        parser: tseslint.parser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  // Project rules: Prettier and minor Vue tweaks
  {
    files: ["**/*.{js,jsx,ts,tsx,vue}"],
    plugins: { prettier },
    rules: {
      "prettier/prettier": "warn",
    },
  },
  {
    files: ["**/*.vue"],
    rules: {
      // Allow single-word component names like index.vue
      "vue/multi-word-component-names": "off",
    },
  },
  // Test files: relax some TS strict rules
  {
    files: [
      "tests/**/*.{ts,tsx,js,jsx}",
      "**/*.test.{ts,tsx,js,jsx}",
      "**/__tests__/**/*.{ts,tsx,js,jsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Disable stylistic conflicts with Prettier
  eslintConfigPrettier,
];
