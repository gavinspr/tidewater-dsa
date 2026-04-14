import { defineField, defineType } from "sanity"

export const homePageType = defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  groups: [
    { name: "hero", title: "Hero Section" },
    { name: "content", title: "Page Content" },
  ],
  fields: [
    // ── Hero Section ──
    defineField({
      name: "heroHeadline",
      title: "Headline",
      type: "string",
      description: "The main heading displayed above the hero image",
      group: "hero",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroSubheadline",
      title: "Subheadline",
      type: "text",
      rows: 2,
      description: "A short supporting line below the headline",
      group: "hero",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      description:
        "Wide image displayed below the headline (recommended 1200×600 or wider)",
      options: { hotspot: true },
      group: "hero",
    }),
    defineField({
      name: "heroCtaText",
      title: "Button Text",
      type: "string",
      description:
        "Text for the call-to-action button below the headline (leave empty to hide)",
      group: "hero",
    }),
    defineField({
      name: "heroCtaLink",
      title: "Button Link",
      type: "url",
      description: "Where the button links to (e.g. a signup form, event page)",
      group: "hero",
      validation: (Rule) =>
        Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
    }),

    // ── Content ──
    defineField({
      name: "body",
      title: "Page Content",
      type: "array",
      group: "content",
      description:
        "Main content below the hero image — chapter info, priorities, calls to action, etc.",
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
          ],
        },
      ],
    }),
  ],
})
