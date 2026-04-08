import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { visionTool } from "@sanity/vision"
import { schemaTypes } from "./sanity/schemas"

export default defineConfig({
  name: "tidewater-dsa",
  title: "Tidewater DSA",

  projectId: "r8316tsu",
  dataset: "production",

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content Management")
          .items([
            // Only allow for one siteSettings document to be created
            S.listItem()
              .title("Global Settings")
              .id("siteSettings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),

            S.divider(),

            ...S.documentTypeListItems().filter(
              (listItem) =>
                !["siteSettings"].includes(listItem.getId() as string)
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (input, context) => {
      if (context.schemaType === "siteSettings") {
        return input.filter(
          (a) => a.action !== "delete" && a.action !== "duplicate"
        )
      }
      return input
    },
    newDocumentOptions: (input, context) => {
      return input.filter(
        (creationOption) => creationOption.templateId !== "siteSettings"
      )
    },
  },
})
