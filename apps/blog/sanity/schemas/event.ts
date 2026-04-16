import { defineField, defineType } from "sanity"

export const eventType = defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({
      name: "rsvpLink",
      title: "Action Network URL",
      type: "url",
      description:
        "Paste the full Action Network URL (e.g. https://actionnetwork.org/events/your-event). The event details and RSVP form will be embedded automatically. Leave blank for non-Action Network events.",
      validation: (Rule) =>
        Rule.uri({ allowRelative: false, scheme: ["https"] }),
    }),
    defineField({
      name: "title",
      title: "Event Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Short Summary",
      type: "text",
      rows: 2,
      description: "Shown in the events list (1-2 sentences)",
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: "date",
      title: "Start Date & Time",
      type: "datetime",
      description: "Used for ordering and display in the events list",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "End Date & Time",
      type: "datetime",
      description: "Optional — leave blank for open-ended events",
    }),
    defineField({
      name: "address",
      title: "Address",
      type: "string",
      description: "Full street address (optional for virtual events)",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      description: "Venue name, or 'Virtual' for online events",
    }),
    defineField({
      name: "isVirtual",
      title: "Virtual Event",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Date (Upcoming First)",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      date: "date",
      location: "location",
    },
    prepare({ title, date, location }) {
      const d = date
        ? new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "No date"
      return {
        title,
        subtitle: `${d}${location ? ` · ${location}` : ""}`,
      }
    },
  },
})
