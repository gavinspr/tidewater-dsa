import { defineField, defineType } from "sanity"

const siteUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : import.meta.env.PUBLIC_SITE_URL || "https://your-domain.com"

export const pageType = defineType({
  name: "page",
  title: "Static Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: `This defines the URL. E.g., 'about-us' becomes ${siteUrl}/about-us`,
    }),
    defineField({
      name: "body",
      title: "Page Content",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
})
