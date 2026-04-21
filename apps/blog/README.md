# Blog

The public-facing website for Tidewater DSA, the Hampton Roads chapter of the Democratic Socialists of America. Built with Astro and server-rendered on Cloudflare Workers, with content managed through an embedded Sanity Studio at `/admin`.

## Tech stack

- **[Astro](https://astro.build)** — site framework, server-rendered with the Cloudflare adapter
- **[Sanity](https://www.sanity.io)** — headless CMS, embedded Studio at `/admin`, with Presentation tool for visual editing
- **[Google Calendar API](https://developers.google.com/calendar/api/v3/reference)** — source of truth for event data
- **[Tailwind CSS v4](https://tailwindcss.com)** — styling
- **[@tidewater-dsa/ui](../../packages/ui)** — shared shadcn/ui components
- **[Cloudflare Workers](https://workers.cloudflare.com)** — hosting

## Structure

```
apps/blog/
├── sanity/
│   ├── schemas/           # Document and object type definitions
│   ├── queries/           # Shared GROQ queries
│   ├── components/        # Custom Studio input components
│   └── tools/             # Custom Studio tools (Customize Events)
├── src/
│   ├── components/        # App-specific Astro and React components
│   │   └── calendar/      # Events page calendar components
│   ├── layouts/           # Astro layouts (main.astro)
│   ├── lib/               # Helpers — loadQuery, formatters, events, gCal
│   ├── pages/
│   │   └── api/           # Server endpoints (gCal-events, subscribe)
│   └── types/             # Shared domain types
├── astro.config.mjs
└── sanity.config.ts       # Embedded Studio config with Presentation tool
```

## Environmental Setup

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

See the comments in `.env.example` for where to get each value. You'll need:

- A Sanity viewer token (each dev generates their own)
- An Action Network API key (shared across the team — ask an admin)
- Google Calendar credentials (optional in dev, the app uses mock events when missing; required in production)

To generate a Sanity read token, go to `sanity.io/manage` → your project → API → Tokens → Add API Token → set permissions to **Viewer**.

### Environment variable prefixes

Astro only exposes environment variables to client-side code if they are prefixed with `PUBLIC_`. Variables without the prefix are server-only — they exist during SSR but are never sent to the browser.

The Sanity project ID, dataset, and visual editing flag all need the `PUBLIC_` prefix because the embedded Studio runs as a client-side React app in the browser and needs access to these values. The `SANITY_API_READ_TOKEN`, `ACTION_NETWORK_API_KEY`, and Google Calendar credentials do NOT have the prefix — they're server-only secrets that must never reach the browser.

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

- **Site Settings** (singleton) — site title, logo, navigation, social links, newsletter signup URL, contact info
- **Homepage** (singleton) — hero, CTA, section headings, events-section copy
- **Events Page** (singleton) — heading, intro, and empty-state message for the `/events` calendar page
- **Event Types** (singleton) — admin-defined taxonomy for categorizing events (e.g. "Training", "Action", "Meeting") with a color per type
- **Event Customization** — per-event editorial metadata (featured flag, event type, RSVP override, summary) joined to Google Calendar events by ID. Managed through the **Customize Events** tool rather than as standalone documents — see the Events section below.
- **Static Page** — for routes like `/about-us`, etc.
- **Blog Post** — long-form content with Portable Text

Singletons cannot be deleted or duplicated, and only one document of each type can exist. This is configured in `sanity.config.ts` so editors can't accidentally create a second homepage.

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
<h1>{data?.heroHeadline || "A Better World is Possible"}</h1>
```

### Type generation

TypeScript types for Sanity schemas and GROQ query results are generated automatically using Sanity TypeGen. The generated file lives at `sanity/types.ts` and should be committed to the repo.

Regenerate types after changing any schema or query:

```bash
npm run typegen
```

This runs two steps under the hood: `sanity schema extract` (writes a `schema.json` from your schema definitions) followed by `sanity typegen generate` (reads the schema and your `defineQuery` calls to produce typed results). The `schema.json` is gitignored — only `sanity/types.ts` is committed.

Generated type names follow the pattern `<QUERY_NAME>_RESULT`. For example, `HOME_PAGE_QUERY` produces `HOME_PAGE_QUERY_RESULT`, `SITE_SETTINGS_QUERY` produces `SITE_SETTINGS_QUERY_RESULT`, and so on. Import them alongside your queries:

```ts
import { HOME_PAGE_QUERY } from "@/sanity/queries"
import type { HOME_PAGE_QUERY_RESULT } from "@/sanity/types"
```

TypeGen configuration lives in `sanity.cli.ts` under the `typegen` key.

## Events

The events system is a hybrid model: Google Calendar is the source of truth for event data (title, time, location, description), and Sanity stores optional editorial metadata that augments gCal events. Events appear on `/events` (full calendar) and on the homepage (next five upcoming).

### Why a hybrid model

Event logistics — dates, times, locations — change frequently and are often updated by organizers who aren't website admins. Making Google Calendar the source of truth means organizers keep using the workflow they already have (Google Calendar's native app, invites, reminders) and the website stays in sync automatically. Sanity's role is editorial: "this event is featured," "this is a Training," "use this RSVP link."

### The Customize Events Studio tool

Sanity Studio has a custom **Customize Events** tool (in the top nav, after Presentation) that lists upcoming Google Calendar events. For each event, admins can:

- **Feature it** (star icon, one click) — adds it to the Featured Events row on the events page and homepage
- **Customize it** — creates a full editorial overlay with event type, RSVP link override, summary, working group, etc.
- **Filter** by status (customized / not customized / all) and time window (upcoming / past / all)

Customizations are stored as Sanity `event` documents linked to Google Calendar events by the gCal event ID. Admins shouldn't create `event` documents directly (the type is hidden from the main sidebar). Always use the Customize Events tool, which creates and links them automatically.

### Event types taxonomy

Event categories (Training, Action, 101/Intro, etc.) are managed in **Settings → Event Types**. Each type has:

- A display label (shown on calendar pills and filter chips)
- A slug (internal identifier, auto-filled from the label)
- A color (picked from a fixed palette of Tailwind-compatible colors)
- An optional internal description

Adding a new type in the taxonomy makes it immediately available in the Customize Events tool dropdown and as a filter chip on the events page. No code changes needed.

### Google Calendar setup

In production, the app needs a Google Cloud API key and the ID of a public Google Calendar:

1. Create or pick a Google Calendar and set its sharing to "Make available to public" (read-only access)
2. Grab the Calendar ID from its settings → "Integrate calendar" → Calendar ID (looks like an email)
3. In Google Cloud Console, create an API key with the Calendar API enabled, restricted to Calendar API scope
4. Put both in `.env` as `GOOGLE_CALENDAR_ID` and `GOOGLE_CALENDAR_API_KEY`

In development without credentials, the app serves mock event data from `src/lib/mocks/events.ts` — enough variety to exercise every UI state (featured, past, multi-day, all-day, virtual, etc.).

### Caching

The `/events` page and homepage send `Cache-Control: public, max-age=300, stale-while-revalidate=600` — 5-minute edge caching with 10-minute stale revalidation. Keeps gCal API calls to a sane volume without events going stale. If you need faster propagation for a specific update, edit the customization in Studio (no cache invalidation needed — the Sanity customization fetch is part of the same cached render) or wait ≤5 minutes.

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
- `GOOGLE_CALENDAR_ID` and `GOOGLE_CALENDAR_API_KEY` — required for the events feature
- `ACTION_NETWORK_API_KEY` — only needed if the `/api/subscribe` endpoint is in use

Visual editing should generally be disabled in production, since it fetches draft content and adds overhead. Enable it only on a preview environment where editors can review changes before publishing.