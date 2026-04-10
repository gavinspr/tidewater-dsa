import { defineCliConfig } from "sanity/cli"

export default defineCliConfig({
  api: {
    projectId: "r8316tsu",
    dataset: "production",
  },
  typegen: {
    path: "./sanity/queries/**/*.ts",
    generates: "./sanity/types.ts",
    schema: "./sanity/schema.json",
  },
})