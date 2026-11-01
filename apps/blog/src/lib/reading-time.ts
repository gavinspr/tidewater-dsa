/**
 * Estimate reading time from Portable Text so posts don't need a manual field.
 */

interface TextBlockish {
  _type?: string
  children?: Array<{ text?: string }> | null
}

/** Flatten Portable Text block children into a single plain string. */
export function portableTextToPlainText(
  blocks: TextBlockish[] | null | undefined
): string {
  if (!blocks) return ""
  return blocks
    .map((block) =>
      block._type === "block" && Array.isArray(block.children)
        ? block.children.map((child) => child.text ?? "").join("")
        : ""
    )
    .join(" ")
}

/** Reading time in whole minutes (min 1), at ~225 words per minute. */
export function estimateReadingTime(
  blocks: TextBlockish[] | null | undefined,
  wordsPerMinute = 225
): number {
  const words = portableTextToPlainText(blocks)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / wordsPerMinute))
}
