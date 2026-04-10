import { defineQuery } from "groq"

export const PAGE_BY_SLUG_QUERY = defineQuery(`{
  "page": *[_type == "page" && slug.current == $slug][0],
  "settings": *[_type == "siteSettings"][0]
}`)
