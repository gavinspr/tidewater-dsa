import { defineField, defineType } from "sanity"

export const homePageType = defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  groups: [
    { name: "hero", title: "Hero Section" },
    { name: "content", title: "Page Content" },
    { name: "events", title: "Events Section" },
  ],
  fields: [
    // Hero Section
    defineField({
      name: "heroHeadline",
      title: "Headline",
      type: "string",
      description: "The main heading overlaid on the hero image",
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
        "Full-width background image (recommended 1920×800 or wider)",
      options: { hotspot: true },
      group: "hero",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroCtaText",
      title: "Button Text",
      type: "string",
      description: "Text for the call-to-action button (leave empty to hide)",
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
    defineField({
      name: "heroCtaPosition",
      title: "Button Position",
      type: "string",
      description: "Where the text and CTA appear on the hero image",
      group: "hero",
      options: {
        list: [
          { title: "Center", value: "center" },
          { title: "Bottom Left", value: "bottom-left" },
          { title: "Bottom Right", value: "bottom-right" },
        ],
        layout: "radio",
      },
      initialValue: "center",
    }),

    // Content
    defineField({
      name: "body",
      title: "Page Content",
      type: "array",
      group: "content",
      description:
        "Main content below the hero (e.g. chapter info, priorities, calls to action, etc.)",
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
    defineField({
      name: "bodyImage",
      title: "Body Section Image",
      type: "image",
      description: "Image displayed alongside the rich text body content",
      options: { hotspot: true },
      group: "content",
    }),

    // Events Section
    defineField({
      name: "eventsImage",
      title: "Events Section Image",
      type: "image",
      description:
        "Image displayed alongside the events list (e.g. a chapter action photo)",
      options: { hotspot: true },
      group: "events",
    }),
    defineField({
      name: "noEventsHeadline",
      title: "No Events Headline",
      type: "string",
      description: "Shown when there are no upcoming events",
      group: "events",
      initialValue: "We're planning our next move.",
    }),
    defineField({
      name: "noEventsBody",
      title: "No Events Description",
      type: "text",
      rows: 2,
      description: "Supporting text when there are no upcoming events",
      group: "events",
      initialValue:
        "No events are scheduled right now, but we're always organizing. Join our mailing list below to be the first to know when something's coming up.",
    }),
    defineField({
      name: "noRsvpMessage",
      title: "No RSVP Message",
      type: "string",
      description: "Shown on non-Action Network events that don't require RSVP",
      group: "events",
      initialValue: "No RSVP required — just show up!",
    }),
  ],
})
