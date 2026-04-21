import { defineField, defineType } from "sanity"

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "cta", title: "Call-To-Action" },
    { name: "signup", title: "Signup Section" },
  ],
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site Title",
      type: "string",
      description:
        "The global name of the website. Used for SEO, browser tabs, and as a text fallback if no logo is uploaded.",
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

    // Navbar Section
    defineField({
      name: "mainNav",
      title: "Main Navigation",
      description: "Select the pages to appear in the top menu",
      type: "array",
      of: [
        { type: "reference", to: [{ type: "page" }, { type: "eventsPage" }] },
      ],
    }),
    defineField({
      name: "callToActionText",
      title: "Header Call-To-Action Button Text",
      type: "string",
      description:
        "The text shown on the button in the navbar (e.g. 'Join Us', 'Donate')",
      group: "cta",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "callToActionLink",
      title: "Header Call-To-Action Button Link",
      type: "url",
      description:
        "Where the navbar button links to (e.g. a signup form, donation link)",
      group: "cta",
      validation: (Rule) =>
        Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
    }),

    // Footer Section
    defineField({
      name: "socialLinks",
      title: "Social Media Links",
      type: "array",
      description:
        "Add links to your social media profiles. These appear in the site footer.",
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

    // Signup Section
    defineField({
      name: "signupLink",
      title: "Action Network Newsletter Signup URL",
      description:
        "The direct link to your Action Network form (e.g., https://actionnetwork.org/forms/your-form-name)",
      type: "url",
      group: "signup",
      validation: (Rule) =>
        Rule.uri({ allowRelative: false, scheme: ["https"] }),
    }),
    defineField({
      name: "signupHeadline",
      title: "Signup Headline",
      type: "string",
      description: "Heading shown above the email signup form on every page",
      group: "signup",
      initialValue: "Stay Updated",
    }),
    defineField({
      name: "signupDescription",
      title: "Signup Description",
      type: "text",
      rows: 2,
      description: "Supporting text below the signup headline",
      group: "signup",
      initialValue:
        "Get the latest on meetings, events, and actions in the 757 — straight to your inbox.",
    }),
    defineField({
      name: "signupImage",
      title: "Signup Section Image",
      type: "image",
      description:
        "Image displayed next to the signup form (e.g. a group photo of members)",
      options: { hotspot: true },
      group: "signup",
    }),
  ],
})
