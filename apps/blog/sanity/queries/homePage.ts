import { defineQuery } from "groq"

export const HOME_PAGE_QUERY = defineQuery(`{
  "events": *[_type == "event" && date >= now()] | order(date asc) {
    _id,
    title,
    date,
    location,
    description,
    rsvpLink
  },
  "settings": *[_type == "siteSettings"][0],
  "home": *[_type == "homePage" && _id == "homePage"][0]
}`)
