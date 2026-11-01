/**
 * Access Cloudflare runtime bindings/secrets from an Astro context.
 *
 * Secrets and bindings live on `locals.runtime.env` in production (Cloudflare Worker).
 * This helper centralizes that access and the local-dev fallback so routes don't each
 * reimplement the pattern in src/pages/api/google-calendar-events.ts.
 */
import type { APIContext } from "astro"

/** Returns the Cloudflare env bag, or an empty object when unavailable (e.g. some dev paths). */
export function getRuntimeEnv(
  locals: APIContext["locals"]
): Partial<CloudflareEnv> {
  return (locals?.runtime?.env ?? {}) as Partial<CloudflareEnv>
}

/**
 * Read a single value, preferring the Cloudflare runtime env and falling back to
 * build-time `import.meta.env` (useful in local dev). Prefer runtime for secrets.
 */
export function readEnv(
  locals: APIContext["locals"],
  key: keyof CloudflareEnv
): string | undefined {
  const runtime = getRuntimeEnv(locals)[key]
  if (typeof runtime === "string") return runtime
  const build = (import.meta.env as Record<string, unknown>)[key as string]
  return typeof build === "string" ? build : undefined
}
