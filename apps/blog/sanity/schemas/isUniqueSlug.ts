import type { SlugIsUniqueValidator } from "sanity"
import { SANITY_API_VERSION } from "@/lib/sanity-config"

/**
 * Build a slug uniqueness validator scoped to a single document type.
 *
 * Generalizes the per-type validator originally inlined in page.ts so post,
 * category, and newsletterIssue can share one implementation. Excludes the current
 * document (both its published and draft ids) from the conflict check.
 */
export const isUniqueSlugForType =
  (type: string): SlugIsUniqueValidator =>
  async (slug, context) => {
    const { document, getClient } = context
    const id = document?._id
    if (!id) return true

    const client = getClient({ apiVersion: SANITY_API_VERSION })
    const publishedId = id.replace(/^drafts\./, "")
    const draftId = `drafts.${publishedId}`

    const conflictCount = await client.fetch<number>(
      `count(*[
        _type == $type
        && slug.current == $slug
        && !(_id in [$publishedId, $draftId])
      ])`,
      { type, slug, publishedId, draftId }
    )
    return conflictCount === 0
  }
