import { defineField, defineType } from "sanity"

export const homePageType = defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  groups: [
    { name: "hero", title: "Hero Section" },
    { name: "newsletter", title: "Newsletter Section" },
    { name: "donate", title: "Donate Section" },
  ],
  fields: [
    // ── Hero Section ──
    defineField({
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      group: "hero",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroSubheadline",
      title: "Hero Subheadline",
      type: "text",
      rows: 3,
      group: "hero",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Background Image",
      type: "image",
      options: { hotspot: true },
      group: "hero",
    }),
    defineField({
      name: "heroCtaText",
      title: "Call-to-Action Button Text",
      type: "string",
      group: "hero",
    }),
    defineField({
      name: "heroCtaLink",
      title: "Call-to-Action Button Link",
      type: "url",
      description: "Where the button links to (e.g. a signup form)",
      group: "hero",
      validation: (Rule) =>
        Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
    }),

    // ── Events Section ──
    defineField({
      name: "eventsSectionTitle",
      title: "Events Section Title",
      type: "string",
      initialValue: "Upcoming Events",
    }),
    defineField({
      name: "noEventsMessage",
      title: "No Events Message",
      type: "string",
      description: "Shown when there are no upcoming events",
      initialValue: "No upcoming events scheduled right now. Check back soon!",
    }),

    // ── Newsletter Section ──
    defineField({
      name: "newsletterHeadline",
      title: "Newsletter Headline",
      type: "string",
      group: "newsletter",
      initialValue: "Stay Updated",
    }),
    defineField({
      name: "newsletterBody",
      title: "Newsletter Description",
      type: "text",
      rows: 2,
      group: "newsletter",
      initialValue:
        "Join our mailing list to hear about meetings, events, and actions going on in the 757.",
    }),

    // ── Donate Section ──
    defineField({
      name: "donateHeadline",
      title: "Donate Headline",
      type: "string",
      group: "donate",
      initialValue: "Support the Chapter",
    }),
    defineField({
      name: "donateBody",
      title: "Donate Description",
      type: "text",
      rows: 2,
      group: "donate",
      initialValue:
        "Financial support funds our mutual aid and local organizing efforts.",
    }),
    defineField({
      name: "donateButtonText",
      title: "Donate Button Text",
      type: "string",
      group: "donate",
      initialValue: "Donate to TDSA",
    }),
    defineField({
      name: "donateButtonLink",
      title: "Donate Button Link",
      type: "url",
      group: "donate",
      validation: (Rule) =>
        Rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
    }),
  ],
})
