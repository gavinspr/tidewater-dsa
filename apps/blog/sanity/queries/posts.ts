import { defineQuery } from "groq"

/** All posts for the Dispatches index, newest first. Filtering by category is done in-page. */
export const POSTS_INDEX_QUERY = defineQuery(`{
  "posts": *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    dek,
    featured,
    publishedAt,
    author,
    authorRole,
    tags,
    coverImage,
    "category": category->{ title, "slug": slug.current }
  }
}`)

/** A single post plus up to three related posts sharing its category. */
export const POST_BY_SLUG_QUERY = defineQuery(`{
  "post": *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    dek,
    body,
    publishedAt,
    author,
    authorRole,
    tags,
    coverImage,
    "category": category->{ title, "slug": slug.current },
    "related": *[_type == "post" && slug.current != $slug && category._ref == ^.category._ref]
      | order(publishedAt desc)[0...3] {
        _id,
        title,
        "slug": slug.current,
        dek,
        publishedAt,
        author,
        coverImage,
        "category": category->{ title, "slug": slug.current }
      }
  }
}`)
