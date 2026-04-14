import { defineQuery } from "groq"

export const HOME_PAGE_QUERY = defineQuery(`{
  "settings": *[_type == "siteSettings"][0],
  "home": *[_type == "homePage" && _id == "homePage"][0] {
    heroHeadline,
    heroSubheadline,
    heroImage,
    heroCtaText,
    heroCtaLink,
    body
  }
}`)
