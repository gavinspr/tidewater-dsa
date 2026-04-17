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
      description: "Page content.",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (Rule) =>
                      Rule.uri({
                        allowRelative: true,
                        scheme: ["http", "https", "mailto"],
                      }),
                  },
                  {
                    name: "blank",
                    type: "boolean",
                    title: "Open in new tab",
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alt text",
              description: "Describe the image for accessibility",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "caption",
              type: "string",
              title: "Caption",
              description: "Optional text displayed below the image",
            },
            {
              name: "displaySize",
              title: "Display Size",
              type: "string",
              options: {
                list: [
                  { title: "Small", value: "sm" },
                  { title: "Medium", value: "md" },
                  { title: "Large", value: "lg" },
                  { title: "Full Width", value: "full" },
                ],
                layout: "radio",
              },
              initialValue: "md",
            },
          ],
        },
      ],
    }),
  ],
})
