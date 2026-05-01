/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

/** Cloudflare Workers KV binding type. */
type KVNamespace = import("@cloudflare/workers-types").KVNamespace

/** Cloudflare runtime environment shape. Add bindings here as they're introduced. */
interface CloudflareEnv {
  GEOCODE_CACHE: KVNamespace
}

/** The Astro.locals.runtime shape provided by @astrojs/cloudflare. */
type Runtime = import("@astrojs/cloudflare").Runtime<CloudflareEnv>

declare namespace App {
  type Locals = Runtime
}
