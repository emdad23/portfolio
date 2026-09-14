# TASKS

Working task list. Each task records the root cause found in the code, the planned fix, and the files involved. Check items off as they land. Verify everything with `npm run build` (type-check) plus a manual pass at the widths listed in [CLAUDE.md](CLAUDE.md#responsive--scaling-non-negotiable) — there is no test suite.

---

## 1. Wire up Mailpit and verify the contact form actually sends

**Status:** done (2026-09-12)

**Root cause / context.** The contact form persists fine but mail delivery cannot be tested locally at all right now. [src/lib/resend.ts](src/lib/resend.ts) uses the Resend **HTTP API**, and [src/app/api/contact/route.ts:23](src/app/api/contact/route.ts#L23) skips sending entirely unless `RESEND_API_KEY` is set to a real key. Mailpit is an **SMTP** server (`:1025` SMTP, `:8025` web UI) — the Resend SDK cannot talk to it, so there is no code path that reaches Mailpit today.

**Plan.**
- [x] Add `nodemailer` (+ `@types/nodemailer`) and a transport in [src/lib/mailer.ts](src/lib/mailer.ts) that picks the driver from env: **SMTP when `SMTP_HOST` is set** (local/Mailpit), Resend otherwise (production). Keep `buildContactEmailHtml` as the single source of the email body — both drivers use it.
- [x] Refactor [route.ts](src/app/api/contact/route.ts) to call one `sendContactEmail()` helper instead of inlining the Resend call and the placeholder-key check. Mail failure must **not** fail the request — `sendContactEmail()` never throws, returns `{ sent, driver, reason }`, and the route `console.warn`s and still answers `{ success: true }`.
- [x] Add to `.env.example` (and document in CLAUDE.md § Environment): `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, optional `SMTP_USER` / `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO` (shared by both drivers; `RESEND_FROM_EMAIL` / `RESEND_TO_EMAIL` kept as fallbacks), plus the container-vs-host hostname note.
- [x] **Decision:** Mailpit is a service in [docker-dev/docker-compose.yml](docker-dev/docker-compose.yml) so a fresh clone works with nothing else installed; the app container gets `SMTP_HOST=mailpit`. The author's machine already runs `mailpit.exe` on 1025/8025 (shared with another project), which is what host-side `npm run dev` (`SMTP_HOST=localhost`) hits — the bundled service's published ports can be shifted with `MAILPIT_SMTP_PORT` / `MAILPIT_UI_PORT`, or the service skipped, to avoid the clash.
- [x] **Tested end to end** against the running Mailpit (Docker/WSL are not installed on this machine, so the host binary + host Postgres on 5433 were used): `POST /api/contact` for both tracks → 200 `{"success":true}`, both `ContactSubmission` rows read back from the DB, both messages visible in Mailpit with the right `Subject: [Portfolio] …`, `Reply-To: <sender>`, and 💼 / 🎓 type label. Failure paths checked too: dead SMTP port → `{sent:false,…,"ECONNREFUSED"}` and no throw; no transport configured → `driver: "none"`, no throw.

**Also fixed while in here (pre-existing, was blocking `npm run build`):**
- The Resend client was constructed at module scope, but `new Resend(undefined)` **throws** — any deployment without `RESEND_API_KEY` would have 500'd the whole contact route at import time, guard or no guard. It is now lazy (`getResend()` in [src/lib/resend.ts](src/lib/resend.ts)).
- `npm run build` already failed on `main`'s lockfile: `@prisma/adapter-pg` nests `@types/pg` 8.11 whose `ClientBase` is incompatible with the 8.20 types `pg` resolves, so `new PrismaPg(pool)` failed to type-check in both [prisma/seed.ts](prisma/seed.ts) and [src/lib/prisma.ts](src/lib/prisma.ts). Deduped with an `overrides` entry in [package.json](package.json); the build is green again.

---

## 2. "Hire Me" / "Junior Dev" buttons must preselect the matching tab

**Status:** done (2026-09-14)

**Root cause.** [Contact.tsx:7](src/components/sections/Contact.tsx#L7) holds `type` in local state hardcoded to `"hiring"`, and every CTA is a plain `href="#contact"` anchor. Scrolling to the section is all that happens — nothing tells the form which track the visitor came from. Affected CTAs:

| Button | File | Should select |
| --- | --- | --- |
| `Hire Me →` (navbar) | [Nav.tsx:42](src/components/layout/Nav.tsx#L42) | hiring |
| `Hire Me →` (hero) | [Hero.tsx:37](src/components/sections/Hero.tsx#L37) | hiring |
| `🎓 Junior Dev? Let's Talk` (hero) | [Hero.tsx:42](src/components/sections/Hero.tsx#L42) | junior |
| `Let's Discuss a Role →` | [ForYou.tsx:27](src/components/sections/ForYou.tsx#L27) | hiring |
| `Book a Free Chat →` | [ForYou.tsx:45](src/components/sections/ForYou.tsx#L45) | junior |
| `🎓 Book Mentorship Chat` (⌘K palette) | [nav.ts:47](src/data/nav.ts#L47) | junior |

**Plan.**
- [x] Mark each CTA with `data-contact-type="hiring" | "junior"` and have `Contact` register **one** document-level click listener for `a[data-contact-type]` that sets the state. This keeps [ForYou.tsx](src/components/sections/ForYou.tsx) a server component and avoids prop-drilling through the whole page — consistent with the server/client split rule in CLAUDE.md.
- [x] Also honour a `?type=junior` query param on load so cross-page links (e.g. `/#contact` from a blog post) can target a track. Read from `window.location` in an effect rather than `useSearchParams`, so `/` stays statically prerendered without a Suspense boundary.
- [x] Add the `type` to the ⌘K palette items so "Book Mentorship Chat" lands on the junior tab. `CommandItem.contactType` → `requestContactType()` dispatches a window event, since the palette scrolls programmatically instead of clicking a link.
- [x] Give the selected tab `aria-pressed` / proper button semantics while in there, and make sure focus moves somewhere sensible after the jump (accessibility, not just visual selection). The toggle is a labelled `role="group"` with `aria-pressed` and a `focus-visible` ring. After a CTA jump, focus lands on the chosen tab (`preventScroll`, and deliberately not an input, which would pop the mobile keyboard).
- [x] The track list lives in one zod-free module, [src/lib/contactType.ts](src/lib/contactType.ts), and `contactSchema` uses `z.enum(CONTACT_TYPES)` from it.
- [x] **Tested** in headless Chrome at 1280px and 390px (touch). Each tagged CTA, clicked while the form is on the *opposite* track, selects the right tab, focuses it, and lands on `#contact`. The palette item selects junior, `?type=junior` preselects on load, `?type=bogus` falls back to hiring, and an untagged `#contact` link (footer) leaves the track alone. No page errors.

**Gotcha hit while verifying:** running `npm run build` while `npm run dev` is up overwrites the shared `.next` with a production build. The dev server then 404s its CSS/JS and the homepage renders unstyled. Stop dev, `rm -rf .next`, restart.

---

## 3. Replace the off-theme blue button hovers

**Status:** done (2026-09-14)

**Root cause.** The palette is monochrome (black / gray / white) with `accent: #2563EB` intended as a *typographic* accent — it is used correctly on the hero `FlipWords` ([Hero.tsx:26](src/components/sections/Hero.tsx#L26)) and blog prose links. But `hover:bg-accent` was also applied to solid buttons, so they flip to saturated blue on hover, which reads as a different design system:

- [Nav.tsx:42](src/components/layout/Nav.tsx#L42) — `Hire Me →`
- [Hero.tsx:37](src/components/sections/Hero.tsx#L37) — `Hire Me →`
- [Contact.tsx:106](src/components/sections/Contact.tsx#L106) — `Send Message →`
- [blog/[slug]/page.tsx:39](src/app/blog/[slug]/page.tsx#L39) — `Get in touch →`

**Plan.**
- [x] Black buttons: hover stays monochrome — `hover:bg-black-3` plus an offset hard shadow, `hover:shadow-[3px_3px_0_#444]` (`2px` on the small nav button). `#444` rather than `#0A0A0A` because a black shadow under a black button just reads as a bigger button. No translate lift: all but the blog CTA sit inside `MagneticButton`, which already moves them (task 4). The submit button drops the shadow when `disabled`.
- [x] Keep `accent` for text/links only. Recorded in CLAUDE.md § Styling, along with the hover recipe.
- [x] Swept for other `hover:bg-accent` / hardcoded `#2563EB`. Found one more: [ForYou.tsx:27](src/components/sections/ForYou.tsx#L27) `Let's Discuss a Role →` (white button on the black card) went blue with white text on hover — now `hover:bg-gray` + the same `#444` offset shadow. The only remaining `#2563EB` is the cursor hover colour in [CustomCursor.tsx:58](src/components/layout/CustomCursor.tsx#L58), left for task 5, which reworks that component.
- [x] Every touched button also got a `focus-visible` ring (`ring-black ring-offset-2`; `ring-white ring-offset-black` on the dark card), since hover-only feedback fails keyboard users.

---

## 4. Magnetic buttons travel too far and escape their container

**Status:** done (2026-09-14)

**Root cause.** [MagneticButton.tsx:18-23](src/components/ui/MagneticButton.tsx#L18-L23) computes the offset from `getBoundingClientRect()` of the element **that is itself already translated**, so the measured centre chases the cursor and the offset compounds instead of converging. The displacement is also unbounded — `strength * (distance from centre)` with no cap — so a fast flick near the edge throws the button well outside its parent (visible on the hero CTA row and the nav).

**Plan.**
- [x] Measure against the untranslated rect. It subtracts the **spring** values (`springX`/`springY`), not the raw `x`/`y` targets, because the spring is what is actually rendered into the transform.
- [x] **Clamp** each axis to a new `max` prop (default `6`px), and lower the default `strength` from `0.22` to `0.15`.
- [x] Reset on `pointerleave`, `pointercancel` and `mouseleave`. Tracking moved to `onPointerMove`, which ignores `pointerType === "touch"`.
- [x] Disabled for touch/coarse pointers (`(hover: hover) and (pointer: fine)` via a new [useMediaQuery](src/hooks/useMediaQuery.ts) hook, `false` during SSR and hydration) and under framer's `useReducedMotion()`. If either flips while the button is displaced, it snaps back to 0. `useMediaQuery` is there for task 6 to reuse, since [TiltCard](src/components/ui/TiltCard.tsx) has the same unguarded mouse handling.
- [x] Clipping: at max throw, none of the 7 instances (nav ⌘K + Hire Me, both hero CTAs, both ForYou CTAs, contact submit) crosses its nearest `overflow-hidden` ancestor. The tightest is the ForYou cards (40px padding).
- [x] **Tested** in headless Chrome against the dev server. At 1280px, for every instance: a sweep to the far corner caps at 6px (the underdamped spring briefly overshoots to ~6.01), jiggling in place converges to the same value (`1.5px` for an 11px offset, no drift), and a one-step jump off the button snaps back to 0. With `reducedMotion: "reduce"` the button doesn't move. At 390px with touch emulation, the fine-pointer query is false and a tap leaves the offset at 0. No page errors. Type-checked with `tsc --noEmit`, not `npm run build`, because dev was running (see the task 2 gotcha).

---

## 5. Custom cursor is invisible on dark sections

**Status:** done (2026-09-14)

**Root cause.** [CustomCursor.tsx:58](src/components/layout/CustomCursor.tsx#L58) paints the dot `#0A0A0A` with a `rgba(10,10,10,0.25)` ring — the same black as the dark surfaces. So the cursor disappears over every dark block: the **"For Companies & Teams"** card in [ForYou.tsx:14](src/components/sections/ForYou.tsx#L14), the hero "Currently Available" bento tile, the ticker strip, hovered contact rows, and the footer. The hover state also flips to blue `#2563EB`, the same off-theme blue as task 3.

**Plan.**
- [x] Make the cursor contrast-aware rather than fixed-colour: the dot is `bg-white mix-blend-difference`, and the ring is a white border (40% at rest, 70% on hover) with the same blend. Blending works because both elements are direct children of `<body>`, so they blend against the root stacking context. The nav's `backdrop-blur`, the particle canvas, `MagneticButton` transforms and the ⌘K overlay are all painted *beneath* them in that context, so none of them isolate. That constraint is noted in the component.
- [x] **Blind spot found: mid-gray.** Difference against 50% gray leaves it at 50% gray (127 → 128), and the ⌘K scrim (`rgba(0,0,0,0.5)` over white) is exactly that, so the cursor vanished there. The scrim now carries `data-cursor-surface="scrim"`. While the pointer is on that element itself (not the panel stacked on it), the cursor drops the blend and renders plain white with a 70% ring. Scrims are always ≤50% luminance, so white is always visible. Other pages can reuse the attribute for any future overlay.
- [x] Drop the blue hover colour as part of the same change (task 3 consistency). No `#2563EB` / `rgba(37,99,235,…)` is left in `src/` outside the Tailwind `accent` token.
- [x] Re-check the black ForYou card specifically, including its white `Let's Discuss a Role →` button, at the hover-grown ring size. With the pointer just inside the button's left edge, the 48px ring straddles both: it reads light over the card and dark over the button.
- [x] Confirm the cursor is still fully suppressed below 960px, where `body { cursor: auto }` takes over ([globals.css:20](src/app/globals.css#L20)).
- [x] Also: the cursor stays at `opacity: 0` until the first `mousemove` (it used to park a dot at the top-left corner on load), and hides again when the pointer leaves the window.
- [x] **Tested** in headless Chrome at 1280px against the dev server. Each surface was screenshotted with the cursor shown and with it hidden, comparing luminance at the dot centre and on the ring stroke (0–255):

  | Surface | Dot | Ring |
  | --- | --- | --- |
  | Hero white background | 255 → 0 | 255 → 154 |
  | Hero "Currently Available" tile, ticker, ForYou card, footer | 10 → 245 | 10 → 103 |
  | Hovered contact row (black) | 10 → 245 | 10 → 174 |
  | ForYou white button, hover ring straddling the card | 244 → 11 (button) | 10 → 174 (card side) |
  | Nav (`backdrop-blur`) over a link | 181 → 74 | 255 → 77 |
  | ⌘K scrim, before the fix | 127 → 128 ✗ | 127 → 127 ✗ |
  | ⌘K scrim, after | 127 → 255 | 127 → 216 |
  | ⌘K white panel | 255 → 0 | 255 → 154 |

  At 959px and 390px both cursor elements are `display: none` and `body` is `cursor: auto`. At 960px they are `block` and `cursor: none`. No page errors. Type-checked with `tsc --noEmit` (dev was running).

  Known limit: when the pointer sits on the panel's edge, the part of the ring that hangs over the scrim is still blended and faint there. The dot, which is on the panel, stays fully visible.

---

## 6. Full responsiveness pass

**Status:** not started

Audit and fix against the rules in [CLAUDE.md § Responsive & scaling](CLAUDE.md#responsive--scaling-non-negotiable). Known issues found while reading the code:

- [ ] **No mobile navigation.** [Nav.tsx:20](src/components/layout/Nav.tsx#L20) hides the section links *and* the ⌘K button below 960px with nothing in their place — under 960px there is no way to navigate the one-page scroll. Needs a real menu (or an equivalent affordance).
- [ ] **Hero bento column is dropped.** [Hero.tsx:59](src/components/sections/Hero.tsx#L59) is `hidden md2:block`, so mobile loses the 11+ years / 1M+ users / availability content entirely. Give it a mobile layout instead of hiding it.
- [ ] **Single breakpoint jump.** Every grid goes 1 column → N at `md2` only, leaving 640–959px sparse: [Stats.tsx:14](src/components/sections/Stats.tsx#L14) (1→4), [WhatIDo.tsx:12](src/components/sections/WhatIDo.tsx#L12) (1→3), [BlogPreview.tsx:20](src/components/sections/BlogPreview.tsx#L20) (1→3), [Projects.tsx:15](src/components/sections/Projects.tsx#L15) (1→2). Add `sm:`/`md:` steps.
- [ ] **No max-width container.** Sections use `px-[5%]` alone, so content stretches to the full 2560px on ultrawide. Add a max-width wrapper and a minimum side gutter (`px-5 md2:px-[5%]`).
- [ ] **`min-h-screen` on the hero** ([Hero.tsx:9](src/components/sections/Hero.tsx#L9)) overflows behind mobile browser chrome → `min-h-[100svh]`.
- [ ] **Fixed px letter-spacing against fluid type**: `tracking-[-3px]` on the hero `h1` and `tracking-[-1.5px]` / `-2px` on section headings are crushing at the small end of their `clamp()`. Convert to `em`.
- [ ] **Contact form cramps.** `grid-cols-2` for Name/Email ([Contact.tsx:84](src/components/sections/Contact.tsx#L84)) is too tight at 360px; the two type-toggle buttons need to wrap and hit the 44px touch target; and the stacked `gap-20` ([Contact.tsx:35](src/components/sections/Contact.tsx#L35)) is an 80px hole on mobile.
- [ ] **Touch targets.** Nav/hero/palette buttons sized with `py-[0.35rem]`–`py-[0.42rem]` land well under 44px.
- [ ] **Reduced motion is not respected** anywhere: framer-motion entrances ([ScrollReveal](src/components/ui/ScrollReveal.tsx)), the tilt/magnetic/particle effects, and the CSS ticker + marquee keyframes in [globals.css](src/app/globals.css).
- [ ] **`overflow-x: hidden` on `body`** ([globals.css:16](src/app/globals.css#L16)) is masking rather than fixing — check for real horizontal overflow at 360px with it disabled.
- [ ] Also pass over [Footer.tsx](src/components/layout/Footer.tsx), [Timeline.tsx](src/components/sections/Timeline.tsx) (the `200px_1fr` sidebar), [blog/page.tsx](src/app/blog/page.tsx) and [blog/[slug]/page.tsx](src/app/blog/[slug]/page.tsx), and verify focus-visible rings exist now that hover is desktop-only.

---

## Admin panel (tasks 7–11): shared context

Skills ([src/data/skills.ts](src/data/skills.ts)) and the career timeline ([src/data/timeline.ts](src/data/timeline.ts)) are hard-coded, so every change needs a code edit and a deploy. "11+ years" is typed by hand in 7 places: Hero ×2, [Stats.tsx:5](src/components/sections/Stats.tsx#L5), [Ticker.tsx:2](src/components/sections/Ticker.tsx#L2), ForYou ×2, the Timeline heading, and the [layout.tsx](src/app/layout.tsx) metadata. It is already stale.

Goal: a login-protected admin at a secret URL for adding, editing and deleting skills and experience. The public site reads both from Postgres, and years of experience is calculated from the dates.

**Decisions** (apply to all five tasks):
- **Auth:** an `AdminUser` table with a bcrypt hash, created by a CLI script. The session is a signed httpOnly JWT cookie (jose).
- **Hidden URL:** a secret prefix from `ADMIN_PATH`. Middleware rewrites it to the internal `/admin` routes, and `/admin` itself returns 404. If `ADMIN_PATH` is unset, the admin is fully disabled.
- **Years:** each entry runs from its start month through its end month, and the end month counts in full. A Present entry runs to today. Overlapping or touching ranges are merged, then summed. **Career breaks (gaps with no entry) are not counted.** Shown as `floor(years)` + "+".
  - A break inside one role is modelled by splitting that entry in two.
  - Worked example with today's data: May 2013 → Nov 2019 (6y 7m) plus Aug 2020 → today (6y 1.5m) = 12y 8.5m, shown as **12+**. The 8-month break is excluded.
- **Dates on every entry:** each entry has real dates, plus an optional `periodLabel` that replaces the date text (e.g. "Early Career").
- **Excluded entries:** `countsTowardExperience` (default true) keeps an entry on the timeline but out of the years sum. **Early Career is excluded** (user decision, 2026-09-14), so its placeholder dates only affect where it sits on the timeline. The site shows **12+**.

---

## 7. Admin data layer: schema, migration, seed, admin script

**Status:** done (2026-09-14)

**7.1 Dependencies & env**
- [x] `npm i jose bcryptjs` (jose 6.2, bcryptjs 3.0). Both ship their own types, so no `@types/bcryptjs`.
- [x] Add a `# ─── Admin` block to [.env.example](.env.example):
  - `AUTH_SECRET`: at least 32 chars, e.g. `openssl rand -base64 32`.
  - `ADMIN_PATH`: a secret segment. If unset, the admin is disabled. It must be set at build time too, because middleware reads it.

**7.2 Schema + migration**
- [x] `AdminUser`: `email @unique`, `passwordHash`, timestamps.
- [x] `Skill`: `name`, `icon?`, `row` (1 or 2), `sortOrder`, timestamps, `@@index([row, sortOrder])`.
- [x] `Experience`: `role`, `company`, `companyLink?`, `startDate`, `endDate?` (null means Present), `periodLabel?`, `description @db.Text`, `metrics Json @default("[]")`, `projects Json @default("[]")`, timestamps, `@@index([startDate])`. Dates are stored as the 1st of the month (UTC), and the whole end month counts.
- [x] Migrations applied host-side with `npx prisma migrate dev` against Postgres on 5433, because there's no Docker on this machine. They were first combined into one, then split one per model in 7.6. **Prisma 7's `migrate dev` no longer runs `generate`**, so `npx prisma generate` has to follow it.

**7.3 Seed the existing content**
- [x] Skills: split `"⚡ PHP"` into icon and name, keeping the row and the order (13 in row 1, 12 in row 2).
- [x] Timeline: each period string became literal dates via a `month("2022-11")` helper.
- [x] Early Career gets placeholder dates, Jan 2011 → Apr 2013, with `periodLabel: "Early Career"` and a comment in the seed. **Emdad must correct these in the admin**, because they change the total.
- [x] Seed each table only when it is empty, so a reseed never overwrites admin edits. Blog posts keep their existing upsert.

**7.4 Admin user script**
- [x] [scripts/create-admin.ts](scripts/create-admin.ts) + `npm run admin:create -- you@example.com`. It upserts an `AdminUser` with a bcrypt hash (12 rounds), which doubles as a password reset.
  - The password is prompted twice with input hidden, so it stays out of shell history, or read from `ADMIN_PASSWORD` when scripted.
  - The email is lower-cased, and passwords must be at least 10 characters.
  - It builds its own PrismaClient the way [seed.ts](prisma/seed.ts) does.

**7.5 Verify**
- [x] Seeded directly with `npm run db:seed` rather than `./portfolio fresh`: the new tables were empty, and a reset would have wiped the dev DB's contact submissions. Result: 25 skills and 6 experience entries, dates and metrics as expected. A second run prints "not empty, skipped" for both tables.
- [x] `admin:create`:
  - A short password and an invalid email are both rejected.
  - The first run creates the user and the second resets the password.
  - The row holds a `$2b$12$` hash that matches the new password and not the old one.
  - The throwaway user was then deleted, so **no admin exists yet**.
- [x] `tsc --noEmit` is clean, and the dev server is still 200 after the client regeneration.

**Also fixed while in here:** `npm run db:seed` was broken on the Windows host. It ran `node node_modules/.bin/tsx`, which is a shell shim there, not JS. It is now `tsx --env-file=.env prisma/seed.ts`, the same form as `admin:create`.

**7.6 Restructure: one file per model, migration and seeder**

One file for every table's schema, migration and seed didn't scale, so each concern gets one file per model (the Laravel layout):

| Concern | Location |
| --- | --- |
| Table definition | `prisma/schema/<model>.prisma`, with generator + datasource in `schema.prisma`. `prisma.config.ts` points `schema` at the folder |
| Migration | `prisma/migrations/…_add_<model>/`, one per model |
| Seeder | `prisma/seeds/<table>.ts`, each exporting `seedX(prisma)`. `prisma/seed.ts` only runs them in order |
| Model module (queries) | `src/models/<model>.ts`. Pages, actions and the dashboard call these, never `prisma.<model>` directly |

- [x] Removed the combined migration `20260914133804_add_admin_skills_experience`.
- [x] `git mv` the schema into `prisma/schema/schema.prisma` (the generator `output` becomes `../../src/generated/prisma`). Split out `blog-post.prisma` and `contact-submission.prisma`.
- [x] Seeders: `seeds/blog-posts.ts`, `seeds/skills.ts`, `seeds/experiences.ts`. A seed error now exits non-zero instead of printing and exiting 0.
- [x] Model modules:
  - `src/models/admin-user.ts`: `findAdminByEmail`, `findAdminById`.
  - `src/models/skill.ts`: list/count/create/update/delete, plus `getSkillMarqueeRows()`.
  - `src/models/experience.ts`: list/find/count/create/update/delete, typed `metrics`/`projects` JSON, and `ExperienceInput`.
  - `tsc` is clean. The JSON shapes are `type` aliases, not `interface`s, because Prisma's `InputJsonValue` needs the implicit index signature.
- [x] `npx prisma migrate reset --force` dropped the local `portfolio_dev` DB back to `init`, with the user's explicit consent. Prisma 7 refuses this command from an AI agent unless `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` carries the user's consent message.
- [x] Added one model at a time, each followed by `migrate dev`:
  - `admin-user.prisma` → `20260914135711_add_admin_user`
  - `skill.prisma` → `20260914135733_add_skill`
  - `experience.prisma` → `20260914135817_add_experience`

  Then `prisma generate`.
- [x] Verified:
  - `migrate status` reports 4 migrations and "up to date", and `migrate diff` against the schema folder exits 0 (no drift).
  - `npm run db:seed` gives 6 posts, 25 skills and 6 experiences, and a second run skips both content tables.
  - `tsc` is clean, and the dev server returns 200.
  - Prisma rewrote `migration_lock.toml` with LF line endings only; that change was reverted.

---

## 8. Admin auth & hidden URL

**Status:** not started · **Depends on:** 7

**8.1 Session helpers**
- [ ] `src/lib/auth/session.ts` (Edge-safe, no Prisma import): `signSession(adminId)` and `verifySession(token)` using jose HS256 with a 7-day expiry.
  - Cookie `admin_session`: httpOnly, `sameSite: lax`, `secure` in production, `path: /`.
- [ ] `src/lib/auth/admin.ts` (server only):
  - `adminHref(path)`.
  - `requireAdmin()`: verifies the cookie and checks the admin still exists, redirecting to login otherwise. **Every server action calls it**, so security never rests on middleware alone.

**8.2 Login / logout**
- [ ] `loginSchema` in [validations.ts](src/lib/validations.ts).
- [ ] `actions/auth.ts`, the login action:
  - In-memory rate limit of 5 failures per IP per 15 min.
  - A dummy bcrypt compare when the email is unknown, so timing gives nothing away.
  - One generic error message.
  - On success, set the cookie and redirect to the dashboard.
- [ ] `logoutAction` clears the cookie and redirects to login.
- [ ] `src/app/admin/login/page.tsx` + a `LoginForm` client component using `useFormState`. It follows the house style: inputs `text-base` below `md2`, 44px targets, `cursor-none`, focus rings.

**8.3 Middleware**
- [ ] `src/middleware.ts`, with a matcher that excludes `_next`, static files and `api`:
  - `/admin*` renders the normal 404.
  - `/${ADMIN_PATH}*` with no valid session redirects to `/${ADMIN_PATH}/login`.
  - `/${ADMIN_PATH}/login` with a valid session redirects to the dashboard.
  - Otherwise, rewrite to `/admin*` and set `X-Robots-Tag: noindex, nofollow`.
- [ ] Admin layouts export `robots: { index: false, follow: false }`. The path never appears in the nav, sitemap or robots.txt.

**8.4 Docs**
- [ ] [CLAUDE.md](CLAUDE.md) § Environment / Architecture: `AUTH_SECRET`, `ADMIN_PATH` (it must be set at build time too), the middleware rewrite, and the rule that every admin server action calls `requireAdmin()`. This was moved here from 11.4.

**8.5 Verify**
- [ ] `/admin` and `/admin/login` return 404.
- [ ] A logged-out `/<ADMIN_PATH>/anything` redirects to login.
- [ ] A wrong password shows the generic error, and the 6th attempt is throttled.
- [ ] A good login lands on the dashboard, and logout works.
- [ ] A tampered or expired cookie redirects to login.
- [ ] The response carries the `X-Robots-Tag` header.
- [ ] With `ADMIN_PATH` unset, everything returns 404.

---

## 9. Admin UI: shell, dashboard, skills manager

**Status:** not started · **Depends on:** 8

**9.1 Panel shell**
- [ ] `src/app/admin/(panel)/layout.tsx`: calls `requireAdmin()` and renders nav links for Dashboard / Skills / Experience / Log out.
  - Hrefs are built server-side with `adminHref` and passed as props.
  - The nav follows the container rules (`px-5 md2:px-[5%]`, `max-w-[1200px]`) and becomes a wrapping link row on phones.

**9.2 Dashboard**
- [ ] `(panel)/page.tsx`: the computed years (from task 11.1, a placeholder until then), skill count and experience count.

**9.3 Skills manager**
- [ ] `skillSchema` in [validations.ts](src/lib/validations.ts): `name` required, `icon` optional, `row` 1 or 2, `sortOrder` an integer.
- [ ] `actions/skills.ts`: `createSkill`, `updateSkill` and `deleteSkill`. Each runs `requireAdmin()`, then Zod, then Prisma, then `revalidatePath("/")` and the skills admin path.
- [ ] `(panel)/skills/page.tsx` + a `SkillsManager` client component:
  - Skills grouped by row, with an add form (icon, name, row).
  - Inline edit, including sort order, and delete with confirm.
  - Validation errors show inline.

**9.4 Verify**
- [ ] Add, edit and delete round-trips persist.
- [ ] Calling `deleteSkill` without the cookie doesn't mutate.
- [ ] Check at 360 / 768 / 1440 px.

---

## 10. Admin UI: experience manager

**Status:** not started · **Depends on:** 8 (the shell comes from 9.1)

**10.1 Validation & actions**
- [ ] `experienceSchema` in [validations.ts](src/lib/validations.ts):
  - `role`, `company` and `description` are required, and `companyLink` must be a URL if given.
  - Start is a `YYYY-MM` month; end is a month or Present, and must not be before the start.
  - `periodLabel` is optional.
  - `countsTowardExperience` is a boolean, default true.
  - `metrics[]` entries: `{ label, type: default|green|amber }`.
  - `projects[]` entries: `{ name, icon, tags[] }`.
- [ ] `actions/experience.ts`: `createExperience`, `updateExperience` and `deleteExperience`. Each runs `requireAdmin()`, then Zod, then Prisma, then revalidates `/` and the admin path.

**10.2 List page**
- [ ] `(panel)/experience/page.tsx`: entries ordered by `startDate desc`, showing role, company and the formatted period, with Edit and Delete (with confirm).

**10.3 Create / edit form**
- [ ] `(panel)/experience/new/page.tsx` and `(panel)/experience/[id]/page.tsx` share an `ExperienceForm` client component:
  - `type="month"` start and end inputs, and a Present checkbox that disables the end input.
  - An optional period label.
  - A "Count toward years of experience" checkbox, checked by default.
  - Repeatable metric rows (label + type select) with add/remove.
  - Repeatable project rows (name, icon, comma-separated tags) with add/remove.
  - The form stacks to one column on phones.
- [ ] An unknown `[id]` returns `notFound()`.

**10.4 Verify**
- [ ] Create, edit and delete round-trips work, including the metrics and projects arrays.
- [ ] An end date before the start date is rejected with an inline error.
- [ ] Toggling Present persists `endDate = null`.
- [ ] Calling an action without the cookie doesn't mutate.
- [ ] Check at 360 / 768 / 1440 px.

---

## 11. Public site reads skills & experience from DB, computed years

**Status:** done (2026-09-14). Two checks are deferred: the extra widths and zoom (see 11.4), and revalidation in production, which moves to tasks 9/10.

**Follow-up (2026-09-14): exclude Early Career from the sum.** The user asked for it, so the figures below that say 15+ are now **12+**.
- [x] `countsTowardExperience Boolean @default(true)` on `Experience`, in its own migration `20260914174600_experience_counts_toward_experience`.
- [x] `calculateYearsOfExperience` drops entries with `countsTowardExperience === false` before merging.
- [x] `ExperienceInput` gains the field. The Early Career seeder sets it to `false`, and the existing local row was updated directly, because the seeder skips a non-empty table.
- [x] Tests are now 13 of 13, adding: Early Career flagged false gives 12, the flag set to true behaves like unset (6), and only excluded entries gives 0. `tsc` is clean.
- [x] A fresh Prisma client over the live DB computes **12**.
- [x] **The dev server kept rendering 15+.**
  - Cause: [src/lib/prisma.ts](src/lib/prisma.ts) cached the client on `globalThis` across hot reloads. The instance built before `prisma generate` (dev had been up since before the migration) never selected the new column, so `countsTowardExperience` was `undefined` and treated as counted.
  - Fix: the cache is reused only while `cached instanceof PrismaClient`. A regenerate plus hot reload loads a new class, so the stale client is disconnected and replaced. No restart is needed after schema changes.
  - Verified without restarting dev: `/` shows **12+** in the hero, bento, ticker, stats, Timeline heading, both ForYou mentions, and the meta/OG descriptions. `/blog` returns 200 and `tsc` is clean.
  - Documented in CLAUDE.md § Architecture.

**11.1 Pure helpers**: [src/lib/experience.ts](src/lib/experience.ts) (Prisma-free, so client components can import its types)
- [x] `formatPeriod(e)` returns `periodLabel`, or `"Nov 2022 — Present"` when no label is set. It formats in UTC, because dates are stored as the 1st of the month at 00:00 UTC.
- [x] `formatYearRange(e)` returns `"2022 — Present"`, a single year when an entry starts and ends in the same year, or the label if set.
- [x] `calculateYearsOfExperience(entries, now = new Date())`:
  - Each entry spans its start month through the end of its end month (or `now`). Future spans are dropped.
  - Spans are sorted and merged where they overlap or touch.
  - The merged spans are summed and floored to whole years.
  - **Bug caught by the tests:** the first version divided milliseconds by 365.2425 days, so exactly 5 calendar years (1826 days) floored to 4. It now sums calendar months, with only the final partial month as a fraction.
- [x] Tested with a tsx script, 10 of 10 passing at `now` = 14 Sep 2026:

  | Case | Result |
  | --- | --- |
  | Worked example without Early Career | 12 |
  | Worked example with the Early Career placeholder | 15 |
  | Touching months (Jan–Jun + Jun–Nov) | 0: 11 months, not 12 |
  | Identical overlapping entries (2015–2019 twice) | 5 |
  | A single Present entry from Sep 2020 | 6 |
  | 2y + 2y with a 2-year break | 4: counting from the earliest start would give 6 |
  | Exactly Jan–Dec | 1 |
  | Jan–Nov | 0 |
  | No entries | 0 |
  | Future start | 0 |

  `formatPeriod` and `formatYearRange` outputs were checked too.

**11.2 Queries**: the model modules from 7.6, not a separate `content.ts`
- [x] `getTimeline()` in [src/models/experience.ts](src/models/experience.ts), wrapped in React `cache()` and shared by the page and `generateMetadata`.
  - Returns `{ entries: TimelineEntry[], yearsOfExperience }`.
  - Entries are plain strings (`period`, `yearRange`) plus the metric and project arrays, so no `Date` reaches client props.
  - The planned separate `years: string[]` list became a `yearRange` field on each entry instead.
- [x] `getSkillMarqueeRows()` in [src/models/skill.ts](src/models/skill.ts) is now `cache()`d and returns `{ 1: string[], 2: string[] }` (`"⚡ PHP"`).
- [x] The metric and project types moved out of the model into `src/lib/experience.ts`.

**11.3 Wire up the sections**
- [x] [page.tsx](src/app/page.tsx) runs `Promise.all([getRecentPosts(), getSkillMarqueeRows(), getTimeline()])`.
- [x] `Skills({ row1, row2 })`: `MarqueeRow` is unchanged, and an empty row renders nothing.
- [x] `Timeline({ entries, yearsOfExperience })`:
  - The heading shows the computed years.
  - The Jump-to list uses each entry's `yearRange`, keyed by `id`.
  - Metrics and projects render only when non-empty; empty arrays are what the DB returns now, where the old data used `undefined`.
- [x] `Hero` (the text and the bento tile), `Stats`, `Ticker` and `ForYou` (both mentions) take `yearsOfExperience`.
- [x] `generateMetadata()` in page.tsx sets the description and OG description with the computed years. The [layout.tsx](src/app/layout.tsx) description is generic.
- [x] **`export const revalidate = 86400`** on the home page. It is statically rendered and the years are computed against "now", so without this the figure would freeze at build time.
- [x] Deleted `src/data/skills.ts` and `src/data/timeline.ts`.

**11.4 Docs & verify**
- [x] [CLAUDE.md](CLAUDE.md) now covers:
  - The one-file-per-model/migration/seeder/query layout, and the five models.
  - Prisma 7's `migrate dev` no longer generating the client.
  - Skills, experience and blog posts coming from the DB.
  - The computed-years rules and "never hard-code a years figure".
  - `admin:create`.
  - The admin path and auth env are documented in task 8, since they don't exist yet.
- [x] `tsc --noEmit` is clean, and `src/` has no leftover `11+`, `11 years`, `data/skills`, `data/timeline`, `skillsRow` or `timelineYears`.
- [x] Rendered `/` from the dev server:
  - 15+ appears in the hero text, the bento tile, the ticker, stats, the Timeline heading, both ForYou mentions, and the meta and OG descriptions.
  - All 6 period badges and Jump-to ranges (including "Early Career") are there, and all 25 skills.
- [x] **DB → page round trip:**
  - Setting the current role's end to Aug 2025 turned every figure into 14+ and the badge into "Nov 2022 — Aug 2025". A test skill appeared in row 2.
  - Reverting restored 15+ and "Present".
  - In production the edit needs `revalidatePath("/")`, which the admin actions add in tasks 9/10.
- [x] Screenshots via Chrome over DevTools at 1280×900 and 360×800: hero/bento/ticker, Timeline, Skills and ForYou all render the DB content correctly.
- [ ] Not yet checked at 768 / 960 / 1440 / 2560 or at 1280 with 150% zoom. The change only swaps text and numbers inside existing markup (15 is the same width as 11). Re-check after the task 6 responsive pass lands.

**Noticed, not part of this task:** the hero's rotating FlipWords line renders blank, and there's no nav below 960px. Both are task 6 items, already fixed in the uncommitted responsive pass.

---

## Suggested order

Task 1 is independent (backend + env). Tasks 3 and 5 overlap on the blue/contrast question — do them together. Task 4 is self-contained. Task 2 touches the same files as 3, so land 3 first. Task 6 is last, since it will re-touch the nav, hero, and contact form that tasks 2–5 modify.

Admin panel: **7 → 11 → 8 → 9 → 10**.
- Task 11 comes right after 7, so the public site switches to the DB (with the correct years) before any UI exists.
- Tasks 9 and 10 both need 8.
- Task 11 touches the same section components as task 6 (Hero, Stats, Ticker, ForYou, Timeline, Skills), but only their data and props, so either order works.
