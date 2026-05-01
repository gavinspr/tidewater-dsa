import { defineField, defineType } from "sanity"
import { defineRichTextBody } from "./richTextFields"

export const resourcesPageType = defineType({
  name: "resourcesPage",
  title: "Resources Page",
  type: "document",
  groups: [
    { name: "member", title: "Member Resources", default: true },
    { name: "community", title: "Community Resources" },
    { name: "data", title: "Data Source" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      group: "member",
      initialValue: "Resources",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "memberHeadline",
      title: "Member Section Headline",
      type: "string",
      group: "member",
      initialValue: "Member Resources",
      validation: (Rule) => Rule.required(),
    }),
    defineRichTextBody({
      title: "Member Resources Content",
      description:
        "Rich text that appears above the Community Resources directory (e.g. Member Resources, Code of Conduct, Bylaws).",
      group: "member",
    }),

    // Community Resources Section
    defineField({
      name: "communityHeadline",
      title: "Community Section Headline",
      type: "string",
      group: "community",
      initialValue: "Community Resources",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "communityIntro",
      title: "Community Section Intro",
      type: "text",
      group: "community",
      rows: 3,
      description: "Short description shown above the resource directory.",
      initialValue:
        "A directory of mutual aid, shelter, food, health, and support resources across the 757. Search, filter, and download to share.",
    }),
    defineField({
      name: "disclaimerText",
      title: "Disclaimer Text",
      type: "string",
      group: "community",
      description:
        "Disclaimer shown below the filters before the resources list.",
      initialValue:
        "Resources change. Please verify details directly with each organization before visiting.",
    }),
    defineField({
      name: "printFooterText",
      title: "Print Footer Text",
      type: "string",
      group: "community",
      description:
        "Shown at the bottom of the printed / downloaded version of this directory.",
      initialValue:
        "Resources compiled by Tidewater DSA. Verify details before visiting. Data may change — visit our website for the latest.",
    }),

    // Data source
    defineField({
      name: "googleSheetId",
      title: "Google Sheet ID",
      type: "string",
      group: "data",
      description:
        "The long ID from the sheet URL: docs.google.com/spreadsheets/d/THIS_PART/edit. The sheet must be shared as 'Anyone with the link, Viewer'.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "googleSheetRange",
      title: "Sheet Range (A1 notation)",
      type: "string",
      group: "data",
      description:
        "A1-notation range, e.g. 'Program Form Responses!A:X'. Defaults to 'A:X' if left blank.",
      initialValue: "Program Form Responses!A:X",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Resources Page" }),
  },
})
