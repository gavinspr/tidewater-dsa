# Content Submission Flow — Handoff / Restart Brief

**Purpose of this file:** the original Claude Code chat where this feature was designed and
built (July 2026) was lost when old transcripts were automatically deleted. This brief
reconstructs everything that was decided, built and left open, so a **new chat can pick up
exactly where we left off**. Paste or point the new chat at this file first.

Sources used to rebuild it (2026-10-31): the spec [`docs/submission-flow.md`](./submission-flow.md),
every source file the work produced, the git stash it was saved in, Claude's saved memory notes
from the original sessions, and a fresh audit of the current code. Anything said in the
original chat but not recorded in one of those is gone. Where this brief draws a new
conclusion (not something from July), it is marked **[new 2026-10-31]**.

> **Read order for the new chat:** this file → `docs/submission-flow.md` (the authoritative
> spec) → the files listed in §6.

---

## 1. Project context

- **Repo:** `tidewater-dsa`, an npm-workspaces + Turborepo monorepo. Main app is
  `apps/blog`; shared UI is `packages/ui` (`@tidewater-dsa/ui`).
- **Stack:** Astro 5 (`output: "server"`) on **Cloudflare Workers** (`@astrojs/cloudflare`),
  React 19 islands, Tailwind 4, **Sanity v5** with the Studio embedded at **`/admin`**,
  `astro-portabletext` for rendering rich text.
- **Branches:** work happens on `staging`; PRs go to `main`.
- **Pre-commit hook** (`.husky/pre-commit`): Sanity typegen (fails if `sanity/types.ts`
  changes and isn't staged) → lint → typecheck. Typecheck was added during this work because
  a type error had slipped through when the hook only ran lint (now committed in `437b88c`).
- **Secrets pattern:** read from the Cloudflare runtime env (`locals.runtime.env`), falling
  back to `import.meta.env` in local dev. Originally modelled on
  `src/pages/api/google-calendar-events.ts`, now centralised in `src/lib/runtime-env.ts`.
- **Existing custom Studio tool to copy:** `sanity/tools/customize-events/CustomizeEventsTool.tsx`
  (registered in `sanity.config.ts` via the `tools` callback, inserted after Presentation).

### User's working preferences (from the original sessions)

- Priorities for this feature, in order: **cost → safety → UX**. Everything must fit
  **Sanity free tier + Cloudflare free tier**.
- **Nothing gets committed** until the whole flow works locally **and** real resource
  IDs/env values are in place. Build and verify locally phase by phase.
- Build one phase at a time and verify each one (typecheck, lint, dev-server checks) before
  moving to the next.

---

## 2. What the feature is

Vetted community members (members of the chapter's **Discord server**) can submit full
rich-text (Portable Text) blog content **without a Sanity account**, preview it, and track
it. Chapter admins review it **inside Sanity Studio**: comment, request changes, approve or
reject. Approval publishes it as a live `post` on the Astro site.

---

## 3. Locked decisions and why

| Area | Decision | Reasoning |
|---|---|---|
| Where pending submissions live | **Cloudflare D1**, *not* Sanity | Unapproved content never touches the public Sanity dataset, so drafts are safe by design. Only approved posts count against Sanity's ~10k-document cap. Purging is trivial. |
| Images | Allowed; stored in a **private R2 bucket**; public only after approval | Human approval is the moderation gate. R2 has zero egress cost. |
| Auth | **Discord OAuth + guild-membership check** | Members already use Discord, so there are no new accounts. The guild check is the strongest abuse barrier. Built behind an `IdentityProvider` interface so **Element/Matrix** can replace or join it later. |
| Notifications | **Discord only** in v1 (admin webhook + bot DMs) | Free, and the OAuth step already gives us Discord user IDs. **Email (Resend) is deferred.** |
| Admin review UI | **Custom Sanity Studio tool** (modelled on `CustomizeEventsTool`) | Admins stay in one place. Approve runs under the admin's **own Sanity session**, so no Sanity write token is stored on the Worker. |
| Editor | **`@portabletext/editor`** | Produces native Portable Text without a Sanity account. |
| Rate limit | **10 submissions/user/day**, invisible to users, admin-clearable | Over the limit, users get a friendly message plus HTTP 429. Admins can reset a user's counter. |
| Image limits | **5 per submission, 5 MB each, jpg/png/webp** | Limits storage use and the abuse surface. |
| After approval | **Delete the D1 row and R2 images**; keep a slim `submission_archive` row | Sanity becomes the single source of truth for published content and D1 stays tiny. The archive row (no body, no images) supports "My submissions" history and auditing. |
| Session | Stateless, **HMAC-signed cookie** (Web Crypto, `SESSION_SECRET`), 7-day TTL | No session store needed. Runs in both Workers and the Node dev server. |

Alternatives that were rejected or deferred: pending drafts stored in Sanity (rejected,
because of draft exposure and the document cap); Sanity accounts for members (rejected);
email notifications (deferred); Element/Matrix login (abstracted, not built).

---

## 4. Architecture (summary; full diagram in spec §3)

```
Member → /auth/discord/login → Discord OAuth → /auth/discord/callback
        (guild check; sets signed session cookie)
      → /submit  (guarded by src/middleware.ts) — compose + preview   [Phase 3]
      → POST /api/submissions — validate, sanitize, rate-limit,
        Turnstile, D1 write, R2 upload, Discord notify                  [Phase 4]

Admin (Sanity Studio /admin) → "Submissions" tool                      [Phase 5]
      → reads D1 via auth-guarded Worker API (trusts admin's Sanity session)
      → Approve: create `post` + upload images as Sanity assets
                 → delete D1 row + R2 objects, insert archive row
      → Request changes (comment thread) / Reject

Member → "My submissions" dashboard, thread, resubmit                   [Phase 6]
Cron → purge old rejected archive rows + orphaned R2 objects            [Phase 7]
```

**Lifecycle:** submit → `pending` → (`changes_requested` ↔ resubmit, `revision++`) →
approve (row moves to archive as `approved`, post created) or reject (archived as
`rejected`, images deleted by cron). Details in spec §5.

**Security layers** (spec §6): guild gate → Turnstile → hidden daily rate limit → payload
size caps → server-side Portable Text allow-list sanitization → image magic-byte and size
checks with private storage → Cloudflare rate-limiting rule as a backstop → secrets only
from the runtime env.

---

## 5. Status

| Phase | State |
|---|---|
| **1 — Foundations** | ✅ Done |
| **2 — Auth (Discord OAuth + guild gate + session + middleware)** | ✅ Done. Locally verified **with Discord stubbed**: `/submit` redirects to login, and login/callback return a graceful **503 "not configured"** because no credentials exist yet. The live OAuth round-trip has **never been run**. |
| **3 — Compose + preview** | ⏭ **Resume here** |
| 4 — Submit API | Not started |
| 5 — Admin review tool | Not started |
| 6 — Submitter dashboard | Not started |
| 7 — Retention cron | Not started |

### Git state (as of 2026-10-31)

- **Nothing is committed.** On 2026-07-08 the Phase 1–2 work was stashed as
  `stash@{0}` "submission-flow phases 1-2 (WIP, detour for blog design)" so the blog redesign
  could be built. On **2026-10-31 it was re-applied** with `git stash apply` (clean, no
  conflicts). **The stash still exists as a backup.** Drop it (`git stash drop stash@{0}`)
  once the work is committed.
- The working tree now holds **two uncommitted features**: the submission flow (Phases 1–2)
  and the blog/"Dispatches" feature (see §7).
- **[new 2026-10-31]** After re-applying: `astro check` reports **0 errors**, but `eslint`
  reports **1 error**, which would block the pre-commit hook:
  `src/lib/runtime-env.ts:27` uses `unknown` (rule `@typescript-eslint/no-restricted-types`).
  Fix it before committing, e.g. type the cast as `Record<string, string | undefined>`.

---

## 6. File inventory (everything the submission flow added or changed)

All paths are under `apps/blog/` unless noted.

**Docs**
- `docs/submission-flow.md` (repo root): the authoritative spec, including the Discord app
  setup walkthrough (§10), env vars (§11), `wrangler` resource-creation commands, and the
  roadmap (§12).

**Phase 1 — Foundations**
- `migrations/0001_init_submissions.sql`: D1 schema with tables `submissions` (active only:
  `pending`/`changes_requested`; `body_pt` is Portable Text JSON), `submission_images`
  (`r2_key`), `submission_comments` (`author_type` admin|user), `submission_archive` (slim and
  permanent), and `rate_limits` (`discord_user_id`, UTC `day` → `count`). Timestamps are epoch
  ms; IDs are UUID strings.
- `wrangler.jsonc`: D1 binding `SUBMISSIONS_DB` and R2 binding `SUBMISSION_IMAGES` for the
  default env and `staging`. **The `database_id`s are placeholders** (`REPLACE_WITH_D1_ID`,
  `REPLACE_WITH_STAGING_D1_ID`). Miniflare works locally with them, but real IDs are needed to
  deploy.
- `src/env.d.ts`: `CloudflareEnv` gains the D1/R2 bindings and every new secret. `App.Locals`
  gains `member?: SessionMember`.
- `.env.example`: new vars `SESSION_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`,
  `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, `DISCORD_OAUTH_REDIRECT_URI`,
  `DISCORD_ADMIN_WEBHOOK_URL`, `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`,
  `SANITY_WRITE_TOKEN` (normally unused).
- `src/lib/runtime-env.ts`: `getRuntimeEnv(locals)` and `readEnv(locals, key)` (runtime first,
  then `import.meta.env` fallback).
- `src/lib/submissions/config.ts`: limits and allow-lists: `MAX_SUBMISSIONS_PER_DAY=10`,
  `MAX_IMAGES_PER_SUBMISSION=5`, `MAX_IMAGE_BYTES=5MB`, `ALLOWED_IMAGE_MIME`,
  `MAX_TITLE_LENGTH=160`, `MAX_BODY_BLOCKS=400`, `MAX_BODY_BYTES=256KB`, the Portable Text
  allow-lists, and `OVER_LIMIT_MESSAGE`.
- `src/lib/submissions/identity.ts`: `MemberIdentity` and the `IdentityProvider` interface
  (`getAuthorizationUrl`, `verifyCallback`).
- `src/types/submissions.ts`: TS mirrors of the D1 rows (`Submission`, `SubmissionImage`,
  `SubmissionComment`, `SubmissionArchiveEntry`, status unions). Re-exported from
  `src/types/index.ts`.

**Phase 2 — Auth**
- `src/lib/submissions/discord.ts`: the Discord provider. Uses scopes
  `identify guilds.members.read`, exchanges the code, then calls
  `GET /users/@me/guilds/{guild}/member` (200 means member; roles are captured for future
  role-gating). `getDiscordConfig()` returns `null` when the env is incomplete, and
  `authUnavailableResponse()` turns that into a 503.
- `src/lib/submissions/session.ts`: a compact `payloadB64.sigB64` token signed with
  HMAC-SHA256 and verified with a constant-time comparison. Also contains the cookie helpers
  (`tdsa_session`, `tdsa_oauth_state` with a 10-minute TTL, `tdsa_return_to`),
  `generateState()`, and `sanitizeReturnTo()` (allows only local `/path` values, which blocks
  open redirects).
- `src/middleware.ts`: reads the session on every request and sets `locals.member`. Protects
  the `/submit` prefix by redirecting to `/auth/discord/login?returnTo=…`.
- `src/pages/auth/discord/login.ts`: sets the CSRF state cookie and the returnTo cookie, then
  redirects to Discord.
- `src/pages/auth/discord/callback.ts`: checks state, verifies membership, signs the
  session, and redirects to returnTo or `/submit`. Non-members are sent to `/auth/denied`.
- `src/pages/auth/logout.ts`: GET or POST; clears the session cookie.
- `src/pages/auth/denied.astro`: the "You're not in the server" page.
- `src/pages/submit.astro`: a **placeholder**. It shows "Signed in as X" and a sign-out
  button. Phase 3 replaces it.

---

## 7. The blog detour (built July 9–10, uncommitted; the target of approved submissions)

The spec left the `post` content model and taxonomy open (spec §4.3, §8, §13), so we
paused to design and build the blog first. Two design mockups were made: the "Dispatches"
blog index and the post page, both in a **labor-press** visual style. Then it was
implemented:

- **Schemas:** `category` (admin-managed taxonomy), `newsletterIssue` ("**The Tide**", a
  **separate document type** for now that might later become a post category), and an
  expanded `post` titled **"Dispatch (Blog Post)"** with: `title`, `slug`, `category` (ref,
  **required**), `dek` (standfirst, **required**, ≤280 chars), `coverImage` (+`alt`, `caption`,
  `credit`), `body` (rich text with images and quotes), `author` (plain string, **required**,
  no account needed), `authorRole`, `publishedAt`, `featured`, and `tags`. A shared
  slug-uniqueness helper lives in `sanity/schemas/isUniqueSlug.ts`.
- **Queries:** `sanity/queries/{posts,categories,newsletter}.ts`.
- **Front end:** `src/components/blog/{PosterPlaceholder,Cover,CategoryChip,PostCard}.astro`,
  `src/lib/{blog,reading-time}.ts`, and the pages `/blog`, `/blog/[slug]`, `/newsletter` and
  `/newsletter/[slug]`. The Presentation-tool location for posts moved from `/posts/` to
  `/blog/`. Routes use `/blog` while the display name is "Dispatches", so the name can change
  without breaking URLs.
- **Verified at the time:** typegen, `astro check` with 0 errors, eslint with 0 errors, dev
  routes returning 200, correct 404s, and the Studio loading. **Real content was never
  seeded** (only a read token was available), so only the empty states have been seen.
- **Admin TODO:** nav is CMS-driven, so an admin must add "Dispatches" (`blog`) and "The Tide"
  (`newsletter`) in `siteSettings`.

---

## 8. Gaps and drift to fix in the next phases [new 2026-10-31]

These came from comparing the July submission code with the blog code built afterwards.
Resolve them early in Phase 3 and 4, because they affect the editor, the D1 schema and the
approval mapping.

1. **The Portable Text allow-list doesn't match the site schema.**
   `config.ts` allows styles `normal/h2/h3/h4/blockquote`, marks `strong/em/underline`, and
   lists `bullet/number`. The real post body (`sanity/schemas/richTextFields.ts`) allows only
   `normal/h2/h3/blockquote`, `strong/em`, `link` (`href` + `blank`), an **`image`** block
   (`alt` **required**, `caption`, `displaySize` sm/md/lg/full), and a **`quote`** object
   (`text`, ≤160 chars). The site renderer is `src/components/rich-text/RichText.astro`. Make
   `config.ts` match the Sanity schema exactly so the preview is accurate and nothing is lost
   on approval. Decide whether lists are wanted; if so, add them to the Sanity schema too.
2. **The submission data model is missing fields that `post` now requires.** `post` requires
   `category`, `dek` and `author`, and has an optional `authorRole`, `coverImage` (with
   alt/caption/credit) and `tags`. The D1 `submissions` table has only `title`, `body_pt` and
   `category` (text). Either collect these fields on the submit form, or let admins fill them
   in during review. Probably a mix: member supplies title, dek, body, suggested category,
   author display name and an optional cover; admin confirms category and author. Because
   **nothing has been deployed or applied remotely**, it's fine to edit `0001` directly
   (reset local D1 state) instead of adding `0002`.
3. **Spec §4.3 is out of date.** It lists a provisional `submittedBy` and
   `sourceSubmissionId` on `post`, and neither exists. Decide whether to add
   `sourceSubmissionId` (provenance, probably read-only/hidden) or rely on
   `submission_archive.published_post_id`. `author` already covers display credit.
4. **Which content types can be submitted?** The spec left "newsletter vs post" open. The
   blog build made the newsletter a separate `newsletterIssue` type. The working assumption
   is that **submissions become `post` (Dispatch) documents only**. Confirm this with the user.
5. **Category in D1 is free text,** but `post.category` is a Sanity reference. The submit
   form should offer the live category list (from `categoriesQuery`) and store the category
   `_id` or slug.
6. **Session revocation:** guild membership is checked only at login. Someone who leaves or
   is banned keeps a valid session for up to 7 days. Consider re-checking membership on
   submit (Phase 4), or shortening the TTL.
7. **Not yet installed:** `@portabletext/editor` and the Turnstile client and server pieces.
8. **The spec's header is stale** ("Last updated 2026-07-08", Phases 1–2 marked done). Update
   the status, §4.3 and §13 as the items above are resolved. The spec says "JWT"; the actual
   implementation is a JWT-like HMAC token, which is fine.
9. **The lint error** in `src/lib/runtime-env.ts:27` (see §5).

---

## 9. Next steps, in order

1. Fix the lint error, then confirm `npm run lint` and `npm run typecheck` are clean.
2. **Phase 3 — Compose + preview on `/submit`:**
   - `npm i @portabletext/editor -w blog` and build a React island editor whose schema
     **exactly matches** `defineRichTextBody({ allowImages: true, allowQuotes: true })`.
   - Form fields: title (≤160), dek (≤280), suggested category (live list), author display
     name (defaulting to the Discord username) plus optional role, optional cover image, body.
   - Inline images: client-side checks (type/size/count) and a **required alt**. Real
     validation happens server-side in Phase 4.
   - Preview: render the draft with the **same** `RichText.astro` / `astro-portabletext`
     components, and the post-page layout if practical, so it looks exactly like the published
     post.
   - Save the draft locally (localStorage) so work isn't lost before submit.
3. **Phase 4:** `POST /api/submissions`. Steps: verify the session (optionally re-check guild
   membership), Turnstile, rate limit (D1 `rate_limits`; 429 + `OVER_LIMIT_MESSAGE`), payload
   caps, sanitize Portable Text against the allow-list, image magic bytes, write to D1, upload
   to R2 at `pending/{submissionId}/{imageId}.{ext}`, Discord admin webhook, submitter DM.
4. **Phase 5:** the Studio "Submissions" tool with a pending-count badge, an auth-guarded
   Worker API that verifies the admin's Sanity session, previews with signed R2 URLs, and
   Approve / Request changes / Reject. Approve creates the `post` with the admin's client,
   uploads images as assets, purges D1/R2, and writes the archive row. Also an admin
   "clear rate limit" action.
5. **Phase 6:** the "My submissions" dashboard, comment thread and resubmit flow.
6. **Phase 7:** a Cron Trigger that purges old rejected archive rows and orphaned R2 objects.
7. **Before any commit or deploy:** create the Discord app (spec §10), fill in real secrets,
   create the D1 databases and R2 buckets and paste their IDs into `wrangler.jsonc`
   (spec §11), apply migrations, and run the live OAuth round-trip end to end.

---

## 10. Original design docs

- **Spec:** [`docs/submission-flow.md`](./submission-flow.md) (full text is also reproduced on
  the claude.ai version of this brief: https://claude.ai/artifact/NyP2TjbcETiPXnAM1AS1nb).
- **Blog mockups (July):** "Dispatches" index https://claude.ai/artifact/NQ2oPNNDP1hq2vwPPnwTJH
  and single post https://claude.ai/artifact/EzcyokSKhmrVPopdsy7g77. Design system: DSA red
  `#ec1f27`, DSA black `#231f20`, paper `#f6f4ee`; Manifold DSA display (uppercase, heavy),
  Inter body, JetBrains Mono for eyebrows and bylines; 2px ink rules, square corners;
  halftone poster placeholders when a post has no cover.
- **Submission-related parts of the post mockup:** a "Written by a chapter member … Submit a
  draft →" note at the end of submitted posts (links to `/submit`; check whether the built page
  has it, which needs a way to identify submitted posts — see §8 item 3); a byline with author +
  working group; a body with H2/H3, links, **bullet list**, blockquote, pull quote and inline
  figure. The bullet list supports adding lists to the Sanity body schema (§8 item 1).
- **Related: Deploy Runbook (Aug 22)** https://claude.ai/artifact/8KstuFdksbqkU4wF6KUWKB.
  It describes a noindex `src/middleware.ts` and `lib/errors.ts` under `apps/website` that
  exist on no branch here. If those land later, merge the noindex logic into the submission
  flow's `src/middleware.ts` rather than replacing it.
- `wrangler.jsonc` names a staging R2 bucket `tidewater-submission-images-staging` that the
  spec's §11 create commands don't include.

## 11. Starter prompt for the new chat

> We're resuming the member content-submission feature for the Tidewater DSA site. Read
> `docs/submission-flow-handoff.md` first, then `docs/submission-flow.md`, then the files
> listed in the handoff §6. Phases 1–2 (foundations + Discord auth) are done and uncommitted
> in the working tree, alongside the uncommitted blog/Dispatches feature. Start by fixing the
> lint error in `src/lib/runtime-env.ts`, then walk me through resolving the gaps in handoff §8
> (allow-list mismatch, submission fields vs. the `post` schema, submit target type) before we
> build Phase 3 (compose + preview on `/submit`). Don't commit anything until I say so.
