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

## Suggested order

Task 1 is independent (backend + env). Tasks 3 and 5 overlap on the blue/contrast question — do them together. Task 4 is self-contained. Task 2 touches the same files as 3, so land 3 first. Task 6 is last, since it will re-touch the nav, hero, and contact form that tasks 2–5 modify.
