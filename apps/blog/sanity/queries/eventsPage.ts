import { defineQuery } from "groq"

export const EVENTS_PAGE_QUERY = defineQuery(`{
  "page": *[_type == "eventsPage" && _id == "eventsPage"][0] {
    _id,
    title,
    body,
    noFeaturedEventsMessage
  },
  "settings": *[_type == "siteSettings"][0] {
    siteTitle
  }
}`)
