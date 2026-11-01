# Content Submission Flow — Spec

Status: **draft / building** · Owner: Tidewater DSA · Last updated: 2026-07-08

This document is the source of truth for the member content-submission feature. It is
written to be built against incrementally. Update it as decisions change.

---

## 1. Goal

Let vetted community members submit fully rich-text (Portable Text) blog/newsletter
content — **without a Sanity account** — preview it, and have chapter admins review,
comment on, approve, or reject it from inside the Sanity Studio. Approved content is
published to the live Astro site. The whole thing must run on **Sanity free tier** and
**Cloudflare free tier**, and must be safe against abuse.

Priorities, in order: **cost → safety → UX**.

---

## 2. Locked decisions

| Area | Decision | Why |
|---|---|---|
| Pending store | **Cloudflare D1** (not Sanity) | Pending content never enters the public Sanity dataset (draft security by construction); only approved posts count against the ~10k Sanity doc cap; trivial purge. |
| Images | **Allowed**, stored in **private R2**, public only after approval | Human approval is the moderation gate; nothing user-uploaded is public until an admin approves. |
| Notifications | **Discord only** (v1) | Free; we already hold Discord IDs from OAuth. Email (Resend) can be added later. |
| Auth | **Discord OAuth + guild-membership check** | Only members of the Discord server can reach `/submit`. Abstracted so Element/Matrix can replace it later. |
| Review UI | **Custom Sanity Tool** (like `CustomizeEventsTool`) | Keeps admins in one place; approve uses the admin's own Sanity session (no write token needed). |
| Editor | **`@portabletext/editor`** | Produces native Portable Text without a Sanity account. |
| Rate limit | **10 submissions / user / day**, hidden from user, admin-clearable | Friendly over-limit error only; admins can reset a user's counter. |
| Image limits | **5 images/submission, 5 MB each, jpg/png/webp** | Bounds storage + abuse surface. |

---

## 3. Architecture

```
                          ┌─────────────────────────────────────────────┐
                          │            Astro app (Cloudflare Worker)     │
   Member ── Discord ──▶  │  /auth/discord   → OAuth + guild check       │
   (browser)   OAuth      │  /submit         → guarded compose+preview   │
                          │  /api/submissions → validate/sanitize/store  │
                          └───────┬───────────────────────┬─────────────┘
                                  │ write                  │ images
                                  ▼                        ▼
                          ┌──────────────┐        ┌──────────────────┐
                          │  D1 (SQLite) │        │ R2 (PRIVATE)     │
                          │ submissions  │        │ pending images   │
                          └──────┬───────┘        └────────┬─────────┘
                                 │ read/act (admin session)         │
                          ┌──────▼───────────────────────────┐     │
                          │  Sanity Studio (/admin)           │     │
                          │  "Submissions" custom tool        │     │
                          │   approve / request-changes /     │     │
                          │   reject                          │     │
                          └──────┬────────────────────────────┘    │
                    approve →    │ create post + upload assets      │
                                 ▼        ◀─────────────────────────┘
                          ┌──────────────┐   purge D1 row + R2 images on approve
                          │   Sanity     │   (keep slim archive row)
                          │  post (live) │
                          └──────────────┘

  Notifications (Discord): submit → admin webhook + submitter DM;
                           decision → submitter DM.
  Cron: purge rejected > N days + orphaned R2 objects.
```

---

## 4. Data model

### 4.1 D1 (`SUBMISSIONS_DB`)

See `apps/blog/migrations/0001_init_submissions.sql` for the authoritative schema.

- **`submissions`** — active submissions only (pending / changes_requested). Heavy
  fields (`body_pt`) live here.
  - `id` (uuid), `discord_user_id`, `discord_username`, `email?`, `status`, `title`,
    `body_pt` (Portable Text JSON string), `category?`, `revision`, `created_at`,
    `updated_at`, `published_post_id?`.
- **`submission_images`** — one row per uploaded image; `r2_key` points into R2.
- **`submission_comments`** — the request-changes ↔ resubmit thread
  (`author_type` = admin|user).
- **`submission_archive`** — slim, permanent record kept after a submission leaves the
  active table (approved/rejected): `id`, `discord_user_id`, `title`, `status`,
  `published_post_id?`, `decided_at`. No body, no images. Powers "My submissions"
  history + audit without holding data.
- **`rate_limits`** — `(discord_user_id, day)` → `count`. Admin "clear limit" resets it.

### 4.2 R2 (`SUBMISSION_IMAGES`) — **private bucket**

- Key layout: `pending/{submissionId}/{imageId}.{ext}`.
- Never served publicly. Admins view via short-lived **signed URLs** minted by an
  auth-guarded worker route.
- On **approve**: image is fetched, uploaded to Sanity as an asset, then the R2 object
  is deleted. On **reject/expire**: object is deleted by the cron.

### 4.3 Sanity `post` (approval target — provisional)

Extend `apps/blog/sanity/schemas/post.ts` with (final shape TBD once blog layout is
designed):

- `title`, `slug`, `body` (existing)
- `coverImage` (existing `mainImage`)
- `submittedBy` — display credit (Discord username; not an account)
- `category` — post vs newsletter + section (provisional)
- `sourceSubmissionId` — provenance back-reference

---

## 5. Lifecycle & purge rules

| Event | D1 | R2 | Sanity |
|---|---|---|---|
| Submit | insert `submissions` (pending) | upload pending images | — |
| Request changes | status → `changes_requested`, add comment | keep | — |
| Resubmit | update row, `revision++` | replace images | — |
| **Approve** | **delete active row**, insert `submission_archive` | upload to Sanity then **delete** R2 objects | **create `post`** (live) |
| Reject | delete active row, insert `submission_archive(status=rejected)` | delete on cron | — |
| Cron | purge `submission_archive` rejected > N days; delete orphaned R2 objects | — | — |

**Key rule:** once content is live in Sanity, the D1 submission is purged — only the
slim archive row remains. This keeps D1 tiny and Sanity as the single source of truth
for published content.

---

## 6. Security model

1. **Guild gate (strongest).** Only authenticated members of the configured Discord
   guild can reach `/submit` or the submit API. Session is a signed, HttpOnly, Secure
   cookie (JWT signed with `SESSION_SECRET` via Web Crypto).
2. **Turnstile** on the submit form (free CAPTCHA); verified server-side.
3. **Rate limit** — 10/user/day in D1, checked server-side. Over-limit → friendly
   error, HTTP 429. Hidden from the user otherwise. Admin can clear.
4. **Payload caps** — max title length, max Portable Text block count, max total body
   bytes. Reject oversized bodies before write.
5. **Portable Text sanitization** — server-side allow-list of block styles, marks,
   and mark defs (e.g. `normal/h2/h3/blockquote`, `strong/em/link`). Strip anything
   else. No arbitrary embeds/HTML.
6. **Image validation** — verify **magic bytes** (not just extension), enforce
   jpeg/png/webp, ≤5 MB, ≤5 per submission, cap dimensions. Stored **private**; EXIF
   strip + re-encode deferred to Sanity's asset pipeline at approval. Human approval =
   content moderation.
7. **Cloudflare rate-limiting rule** on the submit endpoint as a backstop.
8. **Secrets** come from the Cloudflare **runtime env** (`locals.runtime.env`), never
   build-time `import.meta.env`, never committed. (Follows the pattern already in
   `src/pages/api/google-calendar-events.ts`.)

---

## 7. Notifications (Discord, v1)

- **Admin alert on submit** — POST to `DISCORD_ADMIN_WEBHOOK_URL` (a webhook on a
  private admin channel). Includes title, submitter, link to the review tool.
- **Submitter confirmation on submit** — bot DM. We have the user's Discord ID from
  OAuth; the bot shares the guild, so it can open a DM
  (`POST /users/@me/channels` → `POST /channels/{id}/messages`).
- **Submitter decision notice** — bot DM on approve / request-changes / reject,
  including admin comments when present.
- **In-Studio alert** — the Submissions tool shows a pending count badge.

---

## 8. Admin review (Sanity tool)

A custom tool registered in `sanity.config.ts` (mirrors `CustomizeEventsTool`):

- Lists submissions from D1 via an auth-guarded worker API. The API trusts the admin's
  **Sanity session** (verified server-side), so no extra credentials.
- Renders the Portable Text preview + images (signed R2 URLs).
- Actions: **Approve** (creates the `post` using the admin's own Sanity client +
  uploads images as assets, then triggers D1/R2 purge), **Request changes** (comment
  back), **Reject**.
- Placement/organization of the post in the blog (req 5) is deferred until the blog
  layout is designed; for now approval creates a `post` with provisional category.

---

## 9. Free-tier budget

| Resource | Use | Free headroom |
|---|---|---|
| D1 | submissions, comments, rate limits | 5 GB; 5M reads / 100k writes per day |
| R2 | pending images (deleted on decision) | 10 GB storage, **zero egress** |
| Workers | app + API + cron | 100k requests/day |
| Cron Triggers | purge job | included |
| Turnstile | bot protection | free |
| Discord | webhook + bot DMs | free |
| Sanity | only **approved** posts + assets | ~10k docs, 5 GB assets |

The design keeps user-generated volume in Cloudflare (generous) and only lets vetted,
approved content reach Sanity (scarce).

---

## 10. Discord application setup (fill in later — currently stubbed)

The app is **stubbed**; complete these steps and populate the secrets in §11 when ready.

1. Go to <https://discord.com/developers/applications> → **New Application**. Name it
   e.g. "Tidewater DSA Submissions".
2. **OAuth2 → General:**
   - Copy **Client ID** → `DISCORD_CLIENT_ID`.
   - Reset/Copy **Client Secret** → `DISCORD_CLIENT_SECRET` (secret).
   - Add **Redirects**:
     - `http://localhost:4321/auth/discord/callback` (local dev)
     - `https://<staging-domain>/auth/discord/callback`
     - `https://<prod-domain>/auth/discord/callback`
     - Set `DISCORD_OAUTH_REDIRECT_URI` per environment.
3. **Scopes** used at login: `identify`, `guilds.members.read`. (No `email` unless you
   later want the user's Discord email.)
4. **Bot** (needed to DM submitters):
   - **Bot** tab → **Add Bot**. Copy the **token** → `DISCORD_BOT_TOKEN` (secret).
   - Under **Privileged Gateway Intents**, none are required for DMs via REST.
   - **OAuth2 → URL Generator**: scope `bot`, permissions minimal (no admin). Use the
     generated URL to **add the bot to your server**. The bot only needs to share the
     guild to DM members.
5. **Guild ID:** enable Developer Mode in Discord (User Settings → Advanced), right-click
   your server → **Copy Server ID** → `DISCORD_GUILD_ID`.
6. **Admin webhook:** in the private admin channel → Edit Channel → Integrations →
   **Webhooks → New Webhook** → Copy URL → `DISCORD_ADMIN_WEBHOOK_URL` (secret).
7. Membership check at callback:
   `GET https://discord.com/api/users/@me/guilds/{DISCORD_GUILD_ID}/member`
   with the user's OAuth bearer token — a 200 means they're in the server (and the
   response includes their roles, for future role-gating).

---

## 11. Environment variables & secrets

**Local dev:** add these to `apps/blog/.env` (gitignored; template in `.env.example`).
They're read via the `import.meta.env` fallback in `readEnv()`. **Production:** set each
with `wrangler secret put <NAME>` per env. D1/R2 are `wrangler.jsonc` bindings, not env
strings.

**Public (safe in `wrangler.jsonc` `vars` / `.env`):**
- `PUBLIC_TURNSTILE_SITE_KEY`

**Secrets (`.env` locally, `wrangler secret put <NAME>` in deployed envs — never
committed):**
- `SESSION_SECRET` — random 32+ byte string for signing session cookies
- `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
- `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`
- `DISCORD_OAUTH_REDIRECT_URI`
- `DISCORD_ADMIN_WEBHOOK_URL`
- `TURNSTILE_SECRET_KEY`
- `SANITY_WRITE_TOKEN` — *only if* we ever approve outside the Studio session; the
  in-Studio tool uses the admin's own session and does not need it.

**Bindings (in `wrangler.jsonc`):**
- `SUBMISSIONS_DB` (D1), `SUBMISSION_IMAGES` (R2).

### One-time resource creation (run when ready to deploy)

```bash
# from apps/blog
npx wrangler d1 create tidewater-submissions            # → copy database_id into wrangler.jsonc
npx wrangler d1 create tidewater-submissions-staging     # staging
npx wrangler r2 bucket create tidewater-submission-images
npx wrangler r2 bucket create tidewater-submission-images-preview   # local/preview

# apply migrations
npx wrangler d1 migrations apply SUBMISSIONS_DB --local   # local dev
npx wrangler d1 migrations apply SUBMISSIONS_DB --remote  # deployed
```

Local dev works with the placeholder `database_id` values (miniflare simulates D1
locally); **real IDs are required before deploying.**

---

## 12. Roadmap (submission-flow-first)

- **Phase 1 — Foundations** *(done)*: D1 schema + migrations, wrangler bindings,
  env typing, runtime-env helpers, `IdentityProvider` abstraction, `.env.example` vars.
- **Phase 2 — Auth** *(done)*: Discord OAuth routes (`/auth/discord/login`,
  `/auth/discord/callback`, `/auth/logout`) + guild-membership check + HMAC-signed
  session cookie (`src/lib/submissions/session.ts`) + `src/middleware.ts` guarding
  `/submit`. Gate + graceful "not configured" stub verified locally; awaits real
  Discord credentials to exercise the live OAuth round-trip.
- **Phase 3 — Compose + preview**: `@portabletext/editor` island + preview parity with
  `astro-portabletext`.
- **Phase 4 — Submit API**: validate, sanitize, rate-limit, Turnstile, D1 write, R2
  upload, Discord notifications.
- **Phase 5 — Review tool**: Sanity custom tool; approve → create post + upload assets +
  purge; request-changes/reject + comments.
- **Phase 6 — Submitter dashboard**: "My submissions" + thread + resubmit.
- **Phase 7 — Retention cron**: purge rejected + orphaned R2.

---

## 13. Open questions

- Final `post` content model + blog/newsletter taxonomy (blocks §8 placement logic).
- Whether newsletters are a distinct type or a `post` category.
- Email (Resend) as a second notification channel — deferred.
- Element/Matrix identity provider — abstracted for now, not implemented.
</content>
</invoke>
