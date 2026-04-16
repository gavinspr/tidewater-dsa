import { defineQuery } from "groq"

export const HOME_PAGE_QUERY = defineQuery(`{
"home": *[_type == "homePage" && _id == "homePage"][0] {
    heroHeadline,
    heroSubheadline,
    heroImage,
    heroCtaText,
    heroCtaLink,
    heroCtaPosition,
    body,
    bodyImage,
    eventsImage,
    noEventsHeadline,
    noEventsBody,
    noRsvpMessage,
  },
 "events": *[_type == "event" && date >= now()] | order(date asc) [0...5] {
    _id,
    title,
    date,
    endDate,
    location,
    address,
    isVirtual,
    summary,
    rsvpLink
  }
}`)
