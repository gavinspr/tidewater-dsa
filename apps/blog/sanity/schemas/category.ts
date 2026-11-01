import { defineField, defineType } from "sanity"
import { TagIcon } from "@sanity/icons"
import { isUniqueSlugForType } from "./isUniqueSlug"

/**
 * Blog post categories. Admin-managed: organizers can add, rename, and remove
 * categories in the Studio without a code change. Posts reference one category,
 * which drives the chip + filter row on the Dispatches index.
 */
export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description:
        "Short topic label shown as a chip and in the filter row, e.g. 'Labor' or 'Housing'.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        isUnique: isUniqueSlugForType("category"),
      },
      validation: (Rule) => Rule.required(),
      description: "Used to filter the Dispatches index, e.g. /blog?category=labor.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      description: "Optional. A sentence describing what belongs in this category.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
})
