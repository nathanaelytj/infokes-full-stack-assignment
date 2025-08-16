// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },
});
