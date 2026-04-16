import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { visionTool } from "@sanity/vision"
import { presentationTool } from "sanity/presentation"
import { defineLocations } from "sanity/presentation"
import { schemaTypes } from "./sanity/schemas"

const projectId =
  typeof process !== "undefined" && process.env.PUBLIC_SANITY_PROJECT_ID
    ? process.env.PUBLIC_SANITY_PROJECT_ID
    : import.meta.env.PUBLIC_SANITY_PROJECT_ID

const dataset =
  typeof process !== "undefined" && process.env.PUBLIC_SANITY_DATASET
    ? process.env.PUBLIC_SANITY_DATASET
    : import.meta.env.PUBLIC_SANITY_DATASET

export default defineConfig({
  name: "tidewater-dsa",
  title: "Tidewater DSA",
  projectId: projectId,
  dataset: dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content Management")
          .items([
            S.listItem()
              .title("Global Settings")
              .id("siteSettings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),
            S.listItem()
              .title("Homepage")
              .id("homePage")
              .child(
                S.document().schemaType("homePage").documentId("homePage")
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (listItem) =>
                !["siteSettings", "homePage"].includes(
                  listItem.getId() as string
                )
            ),
          ]),
    }),
    presentationTool({
      previewUrl: location.origin,
      resolve: {
        locations: {
          homePage: defineLocations({
            message: "This document is used on the homepage",
            tone: "caution",
            locations: [{ title: "Homepage", href: "/" }],
          }),
          siteSettings: defineLocations({
            message: "These settings are used on every page",
            tone: "caution",
            locations: [
              { title: "View global changes (via Homepage)", href: "/" },
            ],
          }),
          page: defineLocations({
            select: {
              title: "title",
              slug: "slug.current",
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || "Untitled",
                  href: `/${doc?.slug}`,
                },
              ],
            }),
          }),
          post: defineLocations({
            select: {
              title: "title",
              slug: "slug.current",
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || "Untitled",
                  href: `/posts/${doc?.slug}`,
                },
              ],
            }),
          }),
        },
      },
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
  document: {
    actions: (input, context) => {
      if (["siteSettings", "homePage"].includes(context.schemaType)) {
        return input.filter(
          (a) => a.action !== "delete" && a.action !== "duplicate"
        )
      }
      return input
    },
    newDocumentOptions: (input) => {
      return input.filter(
        (creationOption) =>
          !["siteSettings", "homePage"].includes(creationOption.templateId)
      )
    },
  },
})
