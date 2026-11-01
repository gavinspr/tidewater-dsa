/**
 * Submission-flow limits and constants. Single source of truth shared by the
 * client editor, the submit API, and the admin tool. See docs/submission-flow.md.
 */

/** Max submissions a single user may create per UTC day. Hidden from the user. */
export const MAX_SUBMISSIONS_PER_DAY = 10

/** Image upload constraints. */
export const MAX_IMAGES_PER_SUBMISSION = 5
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB
export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const
export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME)[number]

/** Body payload caps (enforced server-side before write). */
export const MAX_TITLE_LENGTH = 160
export const MAX_BODY_BLOCKS = 400
export const MAX_BODY_BYTES = 256 * 1024 // 256 KB of Portable Text JSON

/**
 * Portable Text allow-list. Anything outside these is stripped server-side.
 * Keep in sync with the site's astro-portabletext render so the preview is honest.
 */
export const ALLOWED_BLOCK_STYLES = [
  "normal",
  "h2",
  "h3",
  "h4",
  "blockquote",
] as const
export const ALLOWED_MARKS = ["strong", "em", "underline"] as const
export const ALLOWED_MARK_DEFS = ["link"] as const
export const ALLOWED_LIST_ITEMS = ["bullet", "number"] as const

/** Friendly, user-facing message shown when the daily limit is hit (req: hidden limit). */
export const OVER_LIMIT_MESSAGE =
  "You've reached today's submission limit. Please try again tomorrow, or reach out to an organizer if you need this raised."
