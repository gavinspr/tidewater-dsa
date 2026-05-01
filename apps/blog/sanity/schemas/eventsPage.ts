import { defineField, defineType } from "sanity"

export const eventsPageType = defineType({
  name: "eventsPage",
  title: "Events Page",
  type: "document",
  groups: [
    { name: "content", title: "Page Content", default: true },
    { name: "calendar", title: "Calendar Section" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      group: "content",
      initialValue: "Events",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "noFeaturedEventsMessage",
      title: "Empty state for Featured Events",
      type: "string",
      group: "calendar",
      description:
        "Shown in the Featured Events section when the visible month has no featured events. Use {month} as a placeholder.",
      initialValue:
        "No featured events in {month}. Use the arrows above the calendar to look ahead.",
      validation: (Rule) => Rule.max(200),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Events Page" }),
  },
})
