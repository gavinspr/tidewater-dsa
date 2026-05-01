import { defineQuery } from "groq"

export const EVENTS_PAGE_QUERY = defineQuery(`{
  "page": *[_type == "eventsPage" && _id == "eventsPage"][0] {
    _id,
    title,
    noFeaturedEventsMessage
  },
}`)
