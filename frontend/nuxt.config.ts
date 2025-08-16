// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/tailwind.css"],
  runtimeConfig: {
    public: {
      backendUrl: process.env.BACKEND_URL || "http://localhost:3000",
      hmrHost: process.env.HMR_HOST || undefined,
      hmrClientPort: process.env.HMR_CLIENT_PORT || undefined,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      hmr: {
        protocol: "ws",
        host: process.env.HMR_HOST || undefined,
        // If you proxy 5173 behind 80/443, set clientPort accordingly
        clientPort: process.env.HMR_CLIENT_PORT
          ? Number(process.env.HMR_CLIENT_PORT)
          : undefined,
        // Let Nuxt set path; proxies often rewrite it already
      },
    },
  },
});
