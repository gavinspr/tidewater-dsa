import { defineQuery } from "groq"

export const HOME_PAGE_QUERY = defineQuery(`
  *[_type == "homePage" && _id == "homePage"][0] {
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
    noRsvpMessage
  }
`)
