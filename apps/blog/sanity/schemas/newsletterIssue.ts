import { defineField, defineType } from "sanity"
import { EnvelopeIcon } from "@sanity/icons"
import { defineRichTextBody } from "./richTextFields"
import { isUniqueSlugForType } from "./isUniqueSlug"

/**
 * A single issue of the chapter newsletter ("The Tide").
 *
 * Modeled as its own document type (separate from posts) so issues can be numbered
 * and browsed in an archive. If we later decide the newsletter is just another post
 * category, this can fold into `post` — kept intentionally self-contained for now.
 */
export const newsletterIssueType = defineType({
  name: "newsletterIssue",
  title: "Newsletter Issue",
  type: "document",
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: "issueNumber",
      title: "Issue Number",
      type: "number",
      description: "Sequential issue number, shown as '№ 08'.",
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The issue's headline, e.g. 'The Ports Are Ours'.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        isUnique: isUniqueSlugForType("newsletterIssue"),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description: "One or two sentences shown on the newsletter archive cards.",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Describe the image for accessibility.",
        }),
      ],
    }),
    defineField({
      name: "externalUrl",
      title: "External Version URL",
      type: "url",
      description:
        "Optional. Link to a hosted version (e.g. an Action Network email). If set, the archive can link out instead of rendering the body on-site.",
      validation: (Rule) =>
        Rule.uri({ scheme: ["http", "https"] }),
    }),
    defineRichTextBody({
      title: "Body",
      description: "The web-readable version of this issue.",
      allowImages: true,
      allowQuotes: true,
    }),
  ],
  orderings: [
    {
      title: "Issue number, newest first",
      name: "issueDesc",
      by: [{ field: "issueNumber", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", issueNumber: "issueNumber", media: "coverImage" },
    prepare: ({ title, issueNumber, media }) => ({
      title: title || "Untitled issue",
      subtitle: issueNumber ? `№ ${issueNumber}` : "No issue number",
      media,
    }),
  },
})
