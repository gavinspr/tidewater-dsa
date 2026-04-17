# Blog

The public-facing website for Tidewater DSA, the Hampton Roads chapter of the Democratic Socialists of America. Built with Astro and server-rendered on Cloudflare Workers, with content managed through an embedded Sanity Studio at `/admin`.

## Tech stack

- **[Astro](https://astro.build)** — site framework, server-rendered with the Cloudflare adapter
- **[Sanity](https://www.sanity.io)** — headless CMS, embedded Studio at `/admin`, with Presentation tool for visual editing
- **[Tailwind CSS v4](https://tailwindcss.com)** — styling
- **[@tidewater-dsa/ui](../../packages/ui)** — shared shadcn/ui components
- **[Cloudflare Workers](https://workers.cloudflare.com)** — hosting

## Structure

```
apps/blog/
├── sanity/
│   ├── schemas/           # Document and object type definitions
│   └── queries/           # Shared GROQ queries
├── src/
│   ├── components/        # App-specific Astro and React components
│   ├── layouts/           # Astro layouts (main.astro)
│   ├── lib/               # Helpers — loadQuery, formatters, icon mapping
│   └── pages/             # File-based routes
├── astro.config.mjs
└── sanity.config.ts       # Embedded Studio config with Presentation tool
```

## Environmental Setup

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env

See the comments in `.env.example` for where to get each value. You'll need:

- A Sanity viewer token (each dev generates their own)
- An Action Network API key (shared across the team — ask an admin)
```

To generate a read token, go to `sanity.io/manage` → your project → API → Tokens → Add API Token → set permissions to **Viewer**.

### Environment variable prefixes

Astro only exposes environment variables to client-side code if they are prefixed with `PUBLIC_`. Variables without the prefix are server-only — they exist during SSR but are never sent to the browser.

The Sanity project ID, dataset, and visual editing flag all need the `PUBLIC_` prefix because the embedded Studio runs as a client-side React app in the browser and needs access to these values. The SANITY_API_READ_TOKEN does NOT have the prefix because it's a secret that should only be used server-side in `loadQuery` — it must never be exposed to the client.

### CORS

The Sanity project must allow your deployment URLs as CORS origins. Go to `sanity.io/manage` → API → CORS origins and add:

- `http://localhost:4321` (local development)
- Your production domain
- Any preview domains

Make sure **Allow credentials** is checked for each origin.

## Running the app

From the repo root:

```bash
npm run dev --workspace=blog
```

Or run everything in the monorepo with `npm run dev` from the root.

The site runs at `http://localhost:4321`. The embedded Sanity Studio is at `http://localhost:4321/admin`, and the Presentation tool (visual editing) is at `http://localhost:4321/admin/presentation`.

## Content management

Content is managed through the embedded Sanity Studio at `/admin`. The document types currently defined:

- **Site Settings** (singleton) — site title, logo, navigation, social links, newsletter URL
- **Homepage** (singleton) — hero, CTA, section headings, donate card content
- **Static Page** — for routes like `/about-us`, `/events`, etc.
- **Blog Post** — long-form content with Portable Text

Singletons (Site Settings, Homepage) cannot be deleted or duplicated, and only one document of each type can exist. This is configured in `sanity.config.ts` so editors can't accidentally create a second homepage.

### Visual editing

The Presentation tool at `/admin/presentation` lets editors see the live site in an iframe and click on text to edit it directly. Toggle the **Edit** switch in the top-left of the preview to switch between editing mode (click to edit) and browse mode (click to navigate).

To make a new piece of content visually editable, add a field to the appropriate Sanity schema and reference it in the Astro template through the `loadQuery` helper in `src/lib/load-query.ts`. Hardcoded strings in templates will not be editable — content must come from a Sanity query for the stega encoding to work.

### Adding new editable text

1. Add a field to the relevant schema in `sanity/schemas/`
2. Add or update the GROQ query in `sanity/queries/`
3. Use `loadQuery` in your `.astro` page to fetch the data
4. Render the value in JSX, with a fallback for when the field is empty

Example:

```astro
---
import { loadQuery } from "@/lib/load-query"
import { HOME_PAGE_QUERY } from "../../sanity/queries"

const { data } = await loadQuery({ query: HOME_PAGE_QUERY })
---
<h1>{data?.home?.heroHeadline || "A Better World is Possible"}</h1>
```

### Type generation

TypeScript types for Sanity schemas and GROQ query results are generated automatically using Sanity TypeGen. The generated file lives at `sanity/types.ts` and should be committed to the repo.

Regenerate types after changing any schema or query:

```bash
npm run typegen
```

This runs two steps under the hood: `sanity schema extract` (writes a `schema.json` from your schema definitions) followed by `sanity typegen generate` (reads the schema and your `defineQuery` calls to produce typed results). The `schema.json` is gitignored — only `sanity/types.ts` is committed.

Generated type names follow the pattern `<QUERY_NAME>_RESULT`. For example, `HOME_PAGE_QUERY` produces `HOME_PAGE_QUERY_RESULT`, `SETTINGS_QUERY` produces `SETTINGS_QUERY_RESULT`, and so on. Import them alongside your queries:

```ts
import { HOME_PAGE_QUERY } from "@/sanity/queries"
import type { HOME_PAGE_QUERY_RESULT } from "@/sanity/types"
```

TypeGen configuration lives in `sanity.cli.ts` under the `typegen` key.

## Adding routes

Astro uses file-based routing. Any `.astro` file in `src/pages/` becomes a route. Dynamic routes use bracket syntax — `src/pages/[slug].astro` matches `/anything`, with the matched segment available as `Astro.params.slug`.

For content-driven pages, query Sanity in the frontmatter using `loadQuery` and render the data. Check `src/pages/index.astro` and `src/pages/[slug].astro` for patterns to copy.

## Deployment

The app deploys to Cloudflare Workers via the `@astrojs/cloudflare` adapter. On push to the main branch, Cloudflare's build pipeline runs `npm run build` and deploys the worker bundle plus static assets.

### Why Cloudflare Workers

The Cloudflare adapter gives us SSR with effectively zero hosting cost — the free tier covers 100,000 requests per day, far more than a chapter site will ever need. SSR is required because the Sanity Presentation tool needs server rendering to display draft content with stega-encoded overlays.

### Environment variables

Set these in the Cloudflare dashboard:

- `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` — `false` for production, `true` for preview branches only
- `SANITY_API_READ_TOKEN` — only needed when visual editing is enabled

Visual editing should generally be disabled in production, since it fetches draft content and adds overhead. Enable it only on a preview environment where editors can review changes before publishing.