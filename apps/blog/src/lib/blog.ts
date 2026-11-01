/** Shared blog/dispatch helpers. */

/** Format an ISO date as e.g. "Feb 9, 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Deterministically pick a poster colorway from a seed (e.g. category slug) so
 * placeholder covers vary but stay stable per category.
 */
export function posterVariant(seed: string | null | undefined): "ink" | "red" {
  if (!seed) return "ink"
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return Math.abs(hash) % 3 === 0 ? "red" : "ink"
}
