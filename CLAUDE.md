# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio site for Emdad Ullah — Next.js 14 App Router, TypeScript, Tailwind, Prisma 7 + PostgreSQL, nodemailer/SMTP or Resend for contact email. The README is untouched `create-next-app` boilerplate; ignore it.

## Development

Development runs in Docker (`docker-dev/`): a Next.js dev container, Postgres 16 (host port **5433** → container 5432), and Mailpit (host **1025** SMTP / **8025** web inbox). Two equivalent front-ends exist for the same compose file:

- `Makefile` — `make up | down | logs | sh | migrate | seed | studio | clean` (uses project name `portfolio-dev`).
- `./portfolio` — bash wrapper with a superset: `up` (build + `npm install` + `migrate deploy`), `fresh` (migrate reset + seed), `migrate <name>` (creates a migration), `build`, `bash`, plus a fallthrough that execs any command in the app container. Note `portfolio dev` hardcodes an absolute nvm node path from the author's machine and only works there; use `npm run dev` or the container instead.

Common flows:

```bash
make up                      # start app (localhost:3000) + db + mailpit (localhost:8025), detached
./portfolio migrate add_foo  # create + apply a migration inside the container
./portfolio fresh            # reset db and reseed
make studio                  # Prisma Studio from the host against port 5433
npm run db:seed              # seed (host-side; needs a local .env)
```

There is **no test suite and no ESLint config** — `eslint` is not even a dependency, so `npm run lint` will drop into Next's interactive setup prompt. Verify changes with `./portfolio build` (or `npm run build`), which type-checks the whole project.

## Environment

Copy `.env.example` → `.env`. `DATABASE_URL` is required by both the Prisma client and `prisma.config.ts`. The compose file injects `DATABASE_URL` for the container (host `postgres`), so a host-side `.env` should point at `localhost:5433` for Studio/seed.

**Mail is driver-selected in [src/lib/mailer.ts](src/lib/mailer.ts)**, and every send goes through the single `sendContactEmail()` entry point:

| Condition | Driver |
| --- | --- |
| `SMTP_HOST` set | **SMTP** (nodemailer) — Mailpit in dev |
| else a real `RESEND_API_KEY` (starts `re_`, not a `your_key` placeholder) | **Resend** HTTP API — production |
| neither | none — submission is persisted, nothing is sent |

Mailpit is a **service in the compose file** so a fresh clone works with nothing else installed: the app container gets `SMTP_HOST=mailpit` injected, and the ports are published so a host-side `npm run dev` can use `SMTP_HOST=localhost` and read the same inbox on <http://localhost:8025>. If a Mailpit is already running on the host (the author's machine runs `mailpit.exe` on 1025/8025, shared with another project), the bundled one will clash — skip that service, or shift its published ports with `MAILPIT_SMTP_PORT` / `MAILPIT_UI_PORT`. `host.docker.internal` is only needed for reaching a host Mailpit from inside the container.

Env vars: `SMTP_HOST`, `SMTP_PORT` (1025), `SMTP_SECURE` (false), optional `SMTP_USER` / `SMTP_PASS`, plus `MAIL_FROM` / `MAIL_TO` shared by both drivers (`RESEND_FROM_EMAIL` / `RESEND_TO_EMAIL` remain as fallbacks).

`sendContactEmail()` never throws and the route never fails on it — the `ContactSubmission` row is written first, so a mail error is logged with `console.warn` and the caller still gets `{ success: true }`. The Resend client is built lazily (`getResend()`) because its constructor throws when no API key is present.

## Architecture

**Prisma client is generated, not imported from `@prisma/client`.** `prisma/schema.prisma` sets `output = "../src/generated/prisma"`, which is gitignored. Import from `@/generated/prisma/client`; after cloning or changing the schema you must run `prisma generate` (a migrate/seed command does it implicitly). The client uses the driver-adapter path (`PrismaPg` over a `pg.Pool`) — see [src/lib/prisma.ts](src/lib/prisma.ts), which also caches the client on `globalThis` outside production. `prisma/seed.ts` constructs its own client the same way rather than importing the singleton.

**Two models only**: `BlogPost` (slug-addressed, `published` flag gating every query) and `ContactSubmission`.

**Server/client split.** Nearly every page is a server component that queries Prisma directly ([src/app/page.tsx](src/app/page.tsx), [src/app/blog/[slug]/page.tsx](src/app/blog/[slug]/page.tsx)). The API routes under `src/app/api/` exist for external/client consumption and duplicate those queries — changing what "published" means, or the post select shape, means touching both. Interactive chrome (Nav + CommandPalette) is isolated in [src/components/HomeClient.tsx](src/components/HomeClient.tsx) so the home page itself can stay a server component; follow that pattern rather than making a page a client component.

**Home page is one long scroll** of section components from `src/components/sections/`, each rendering an `id` anchor (`hero`, `timeline`, `what`, `skills`, `projects`, `blog`, `for-you`, `contact`). Those ids are the contract for `useActiveSection`, the nav links, and the ⌘K command palette — all defined in [src/data/nav.ts](src/data/nav.ts). Add a section → add its id in all three places.

**Content lives in `src/data/`** as typed TypeScript arrays (projects, skills, timeline, whatIDo), each exporting its own interface. Blog posts are the exception: they come from the database.

**Contact flow**: [Contact.tsx](src/components/sections/Contact.tsx) POSTs to [/api/contact](src/app/api/contact/route.ts) → `contactSchema` (Zod, in [src/lib/validations.ts](src/lib/validations.ts)) → DB row → Resend email built by `buildContactEmailHtml`. The `type` field (`"hiring" | "junior"`) drives the site's two audience tracks and is enumerated in the schema, the Zod validator, and the email template.

## Styling

Tailwind only — no CSS modules, and `globals.css` holds just the theme vars, keyframes, and a few escaped animation utilities. Palette and the extra `md2: 960px` breakpoint are in [tailwind.config.ts](tailwind.config.ts); use the named tokens (`black-2`, `border`, `muted`, `text2`, `accent`) rather than raw hex. Arbitrary-value classes (`text-[clamp(...)]`, `tracking-[-1.5px]`) are the house style for typography.

`body { cursor: none }` because [CustomCursor.tsx](src/components/layout/CustomCursor.tsx) draws its own cursor (disabled under 960px). Every interactive element therefore carries `cursor-none`; the cursor grows on `a, button, [data-cursor='hover'], .hover-cursor`. New clickable elements need `cursor-none` or the native cursor reappears.

Animation is framer-motion. Wrap entrance animations in the shared [ScrollReveal](src/components/ui/ScrollReveal.tsx) (`whileInView`, `once: true`) instead of hand-rolling viewport variants.

## Responsive & scaling (non-negotiable)

Every UI change must work across devices **and** across scales — zoom, OS text size, and viewport widths from a small phone to an ultrawide monitor. Treat a layout as unfinished until it does. Concretely:

**Breakpoints.** Write mobile-first: unprefixed classes are the phone layout, prefixed classes add complexity upward. `md2: 960px` is the project's primary phone/tablet → desktop split (it is the same threshold where [CustomCursor](src/components/layout/CustomCursor.tsx) and `body { cursor: none }` switch off, so keep them in sync). Tailwind's defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536) are available and should be used — most of this codebase currently jumps straight from one column to N at `md2`, which leaves 640–959px looking empty. Prefer a progression (`grid-cols-1 sm:grid-cols-2 md2:grid-cols-4`) over a single jump. Don't add new breakpoints to [tailwind.config.ts](tailwind.config.ts) unless a layout genuinely cannot be expressed with the existing ones.

**Check these widths before calling a change done:** 360, 390, 768, 960, 1280, 1440, 1920, 2560. Also check 1280 at 150% browser zoom and with a 200%-scaled root font — a layout built on fixed `px` heights breaks there while a `rem`-based one survives.

**Fluid over fixed.** Use `clamp()` for anything that must scale (`text-[clamp(2rem,3.5vw,2.75rem)]` is the house pattern) and keep letter-spacing in **`em`, not `px`**, so it tracks the font size: `tracking-[-0.03em]`, not `tracking-[-3px]` — a fixed `-3px` that looks right at 80px is crushing at 48px. Same for `leading-*`: unitless/ratio values, never fixed px. Size spacing in `rem`; reserve `px` for hairlines (borders, 1px rules) and `gap-px` grid seams.

**Containers and ultrawide.** `px-[5%]` is the section gutter, but a percentage gutter alone does not stop content from stretching to 2560px. Wrap section content in a max-width container (`max-w-[1200px] mx-auto` or wider where the design calls for it) so line lengths stay readable; body copy should cap around 65–75 characters (`max-w-[65ch]`). Percentage gutters also collapse on narrow screens — pair them with a floor (`px-5 md2:px-[5%]`) so there is never less than ~20px of side breathing room.

**Never drop content to hide a layout problem.** `hidden md2:block` is for decoration only. If an element carries information or navigation, it needs a mobile equivalent — the nav links and ⌘K button in [Nav.tsx](src/components/layout/Nav.tsx) and the Hero's right-hand card in [Hero.tsx](src/components/sections/Hero.tsx) are currently hidden below 960px with nothing in their place; don't repeat that pattern, and prefer fixing it when you touch those files.

**Touch and pointer.** Interactive elements need a ≥44×44px hit area on touch (pad the element, or add an inset pseudo-element — don't just enlarge the font). Hover and the custom cursor are desktop affordances: any state reachable only by `:hover` must also be reachable by tap and by keyboard focus, and every interactive element needs a visible `focus-visible` ring. Keep `cursor-none` on new clickables (see Styling above).

**Viewport units.** Use `min-h-[100svh]` / `dvh` rather than `min-h-screen` for full-height sections — `100vh` overflows behind mobile browser chrome. Never use `vw` for padding or font sizes without a `clamp()` bound.

**No horizontal scroll, ever.** `overflow-x: hidden` on `body` is a safety net that masks bugs, not a fix: verify the page doesn't scroll sideways at 360px with that rule mentally removed. Long unbreakable strings need `break-words` / `min-w-0` (a flex or grid child defaults to `min-width: auto` and will blow out its track). Tables, code blocks, and the marquee/ticker rows are the only things allowed to be wider than the viewport, each inside its own `overflow-hidden` or `overflow-x-auto` parent with `w-max` on the moving track — the pattern already in [Skills.tsx](src/components/sections/Skills.tsx) and [Ticker.tsx](src/components/sections/Ticker.tsx).

**Motion.** Respect `prefers-reduced-motion`: gate framer-motion entrances via `useReducedMotion()` and wrap the CSS marquee/ticker keyframes in [globals.css](src/app/globals.css) so they stop for users who ask for that. Animation is never the only way information appears.

**Images and media.** Always `next/image` with explicit `sizes` matching the responsive layout, and `aspect-[w/h]` plus `max-w-full` on media boxes so nothing reflows on load.

**Verification.** There is no test suite, so responsive changes are verified by inspection: run `npm run build` (or `./portfolio build`) to type-check, then view the page at the widths above — DevTools device toolbar plus one real zoom level is the minimum.
