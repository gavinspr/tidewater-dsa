import { defineField, defineType } from "sanity"
import { DocumentTextIcon } from "@sanity/icons"
import { defineRichTextBody } from "./richTextFields"
import { isUniqueSlugForType } from "./isUniqueSlug"

/**
 * A blog post ("Dispatch"). Approved member submissions become documents of this
 * type; admins can also author them directly. Field shape follows the Dispatches
 * layout mockups (see docs / artifacts): category chip, standfirst, cover with
 * credit, byline, and a rich body supporting pull quotes and inline images.
 */
export const postType = defineType({
  name: "post",
  title: "Dispatch (Blog Post)",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "meta", title: "Byline & Meta" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      group: "content",
      options: {
        source: "title",
        maxLength: 96,
        isUnique: isUniqueSlugForType("post"),
      },
      validation: (Rule) => Rule.required(),
      description: "Defines the URL, e.g. /blog/tenant-union-ocean-view.",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      group: "content",
      description: "The primary topic. Manage categories under Categories.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "dek",
      title: "Summary / Standfirst",
      type: "text",
      rows: 3,
      group: "content",
      description:
        "One or two sentences shown under the headline and on index cards.",
      validation: (Rule) => Rule.required().max(280),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      group: "content",
      options: { hotspot: true },
      description:
        "Optional. If omitted, the index and header show a poster-style placeholder.",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Describe the image for accessibility.",
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
        }),
        defineField({
          name: "credit",
          title: "Credit",
          type: "string",
          description: "Photographer or source credit.",
        }),
      ],
    }),
    defineRichTextBody({
      title: "Body",
      group: "content",
      description:
        "The article. Use pull quotes and inline images sparingly for emphasis.",
      allowImages: true,
      allowQuotes: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      group: "meta",
      description: "Display name shown in the byline (no account required).",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "authorRole",
      title: "Author Role / Working Group",
      type: "string",
      group: "meta",
      description: "Optional, e.g. 'Labor Working Group'.",
    }),
    defineField({
      name: "publishedAt",
      title: "Published Date",
      type: "datetime",
      group: "meta",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "featured",
      title: "Feature as lead story",
      type: "boolean",
      group: "meta",
      initialValue: false,
      description:
        "When on, this post can appear as the large lead story at the top of the Dispatches index.",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      group: "meta",
      description: "Optional secondary tags shown in the 'Filed under' row.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      author: "author",
      category: "category.title",
      media: "coverImage",
      featured: "featured",
    },
    prepare: ({ title, author, category, media, featured }) => ({
      title: `${featured ? "★ " : ""}${title ?? "Untitled"}`,
      subtitle: [category, author].filter(Boolean).join(" · ") || undefined,
      media,
    }),
  },
})
