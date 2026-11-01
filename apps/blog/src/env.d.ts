/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

/** Cloudflare Workers binding types. */
type KVNamespace = import("@cloudflare/workers-types").KVNamespace
type D1Database = import("@cloudflare/workers-types").D1Database
type R2Bucket = import("@cloudflare/workers-types").R2Bucket

/** Cloudflare runtime environment shape. Add bindings here as they're introduced. */
interface CloudflareEnv {
  GEOCODE_CACHE: KVNamespace
  GOOGLE_CALENDAR_ID?: string
  GOOGLE_CALENDAR_API_KEY?: string
  GOOGLE_SHEETS_API_KEY?: string
  MAPBOX_GEOCODER_TOKEN?: string
  ACTION_NETWORK_API_KEY?: string
  USE_MOCK_DATA?: string

  // --- Content submission flow (see docs/submission-flow.md) ---
  /** D1 database holding pending submissions, comments, archive, rate limits. */
  SUBMISSIONS_DB?: D1Database
  /** Private R2 bucket for pending submission images (public only after approval). */
  SUBMISSION_IMAGES?: R2Bucket

  /** Signing key for the session cookie (Web Crypto). */
  SESSION_SECRET?: string

  // Discord OAuth + bot (currently stubbed — see docs/submission-flow.md §10).
  DISCORD_CLIENT_ID?: string
  DISCORD_CLIENT_SECRET?: string
  DISCORD_BOT_TOKEN?: string
  DISCORD_GUILD_ID?: string
  DISCORD_OAUTH_REDIRECT_URI?: string
  DISCORD_ADMIN_WEBHOOK_URL?: string

  // Turnstile (bot protection).
  PUBLIC_TURNSTILE_SITE_KEY?: string
  TURNSTILE_SECRET_KEY?: string

  /** Only needed if approving outside the Studio session; the tool uses the admin's own session. */
  SANITY_WRITE_TOKEN?: string
}

/** The Astro.locals.runtime shape provided by @astrojs/cloudflare. */
type Runtime = import("@astrojs/cloudflare").Runtime<CloudflareEnv>

declare namespace App {
  type Locals = Runtime & {
    /** The verified member for the current request, set by middleware when authenticated. */
    member?: import("./lib/submissions/session").SessionMember
  }
}
