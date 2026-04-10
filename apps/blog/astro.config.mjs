import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import sanity from "@sanity/astro"
import cloudflare from "@astrojs/cloudflare"


export default defineConfig({
  adapter: cloudflare(),
  output: "server",
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        "react/compiler-runtime",
        "lodash/isObject.js",
        "lodash/groupBy.js",
        "lodash/keyBy.js",
        "lodash/partition.js",
        "lodash/sortedIndex.js",
      ],
    },
  },
  integrations: [
    react(),
    sanity({
      projectId: "r8316tsu",
      dataset: "production",
      useCdn: false,
      apiVersion: "2026-04-10",
      studioBasePath: "/admin",
      stega: {
        studioUrl: "/admin",
      },
    }),
  ],
})