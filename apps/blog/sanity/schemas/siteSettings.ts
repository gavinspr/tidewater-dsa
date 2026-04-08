import { defineField, defineType } from "sanity"

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site Title",
      type: "string",
    }),
    defineField({
      name: "logo",
      title: "Site Logo",
      type: "image",
      description:
        "Upload the main navigation logo (transparent PNG or SVG preferred)",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "mainNav",
      title: "Main Navigation",
      description: "Select the pages to appear in the top menu",
      type: "array",
      of: [{ type: "reference", to: [{ type: "page" }] }],
    }),
    defineField({
      name: "newsletterUrl",
      title: "Newsletter Action URL",
      type: "url",
    }),
    defineField({
      name: "socialLinks",
      title: "Social Media Links",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "platform",
              type: "string",
              title: "Platform (e.g., Instagram, X)",
            },
            { name: "url", type: "url", title: "URL" },
          ],
        },
      ],
    }),
    defineField({
      name: "heroImage",
      title: "Homepage Hero Background",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
})
