import { defineField, defineType } from "sanity"

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [{ name: "cta", title: "Call-To-Action" }],
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
              validation: (Rule) => Rule.required(),
            },
            {
              name: "url",
              type: "url",
              title: "URL",
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
    }),
    defineField({
      name: "socialIconStyle",
      title: "Social Icon Style",
      type: "string",
      description: "How social media icons appear across the site",
      options: {
        list: [
          { title: "Outline — colored icons on white", value: "outline" },
          {
            title: "Filled — white icons on colored background",
            value: "filled",
          },
        ],
        layout: "radio",
      },
      initialValue: "outline",
    }),
    defineField({
      name: "callToActionText",
      title: "Header Call-To-Action Button Text",
      type: "string",
      description: "The text shown on the button (e.g. 'Join Us', 'Donate')",
      group: "cta",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "callToActionLink",
      title: "Header Call-To-Action Button Link",
      type: "url",
      description:
        "Where the button links to (e.g. a signup form, donation link)",
      group: "cta",
      validation: (Rule) =>
        Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
    }),
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
      description:
        "Public email shown in the footer (e.g. tidewaterdsa@gmail.com)",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "contactEmailSubject",
      title: "Contact Email Subject Line",
      type: "string",
      description:
        "Pre-filled subject when someone clicks the email link (optional)",
    }),
  ],
})
