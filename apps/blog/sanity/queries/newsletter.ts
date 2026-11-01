import { defineQuery } from "groq"

/** All newsletter issues for the archive, highest issue number first. */
export const NEWSLETTER_INDEX_QUERY = defineQuery(`{
  "issues": *[_type == "newsletterIssue" && defined(slug.current)] | order(issueNumber desc) {
    _id,
    title,
    "slug": slug.current,
    issueNumber,
    publishedAt,
    summary,
    coverImage
  }
}`)

/** A single newsletter issue. */
export const NEWSLETTER_BY_SLUG_QUERY = defineQuery(`{
  "issue": *[_type == "newsletterIssue" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    issueNumber,
    publishedAt,
    summary,
    body,
    externalUrl,
    coverImage
  }
}`)
