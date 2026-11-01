import { defineQuery } from "groq"

/** All categories, alphabetical — drives the filter row on the Dispatches index. */
export const CATEGORIES_QUERY = defineQuery(`{
  "categories": *[_type == "category" && defined(slug.current)] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    description
  }
}`)
