import { defineField, defineType } from "sanity"

export const eventsPageType = defineType({
  name: "eventsPage",
  title: "Events Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      initialValue: "Events",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Introductory Content",
      type: "array",
      of: [{ type: "block" }],
      description: "Optional text to display above the calendar.",
    }),
    defineField({
      name: "noFeaturedEventsMessage",
      title: "Empty state for Featured Events",
      type: "string",
      description:
        "Shown in the Featured Events section when the visible month has no featured events. Use {month} as a placeholder for the month name (e.g. 'No featured events in {month}. Check another month!').",
      initialValue:
        "No featured events in {month}. Use the arrows above the calendar to look ahead.",
      validation: (Rule) => Rule.max(200),
    }),
  ],
})
