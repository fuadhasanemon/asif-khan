# PLAN — asifkhan.net production build

Status: **approved 2026-11-19; step 1 done.**

## 0. Decisions and versions (recorded after approval)

### Versions installed (latest stable on 2026-11-19, no step-down needed)

| Package | Version | Compatibility check |
|---|---|---|
| next / create-next-app | 16.4.6 | — |
| react / react-dom | 19.3.0 | — |
| tailwindcss / @tailwindcss/turbopack | 4.3.3 | shadcn init detected v4 |
| shadcn (CLI) | 4.23.0, base `radix`, style `radix-nova` | init + `add` ran clean against Next 16 |
| radix-ui / cmdk / sonner | 1.8.1 / 1.1.1 / 2.0.8 | via shadcn |
| gsap / @gsap/react | 3.15.1 / 2.1.2 | peer `gsap ^3.12.5`, `react >=17` |
| motion | 14.14.0 | peer `react ^18 \|\| ^19` |
| @tsparticles/react, /slim, /engine | 4.6.0 | peer `react >=16.8` |
| zod | 4.6.7 | — |
| vitest / @playwright/test | 5.1.1 / 1.65.1 | vitest needs `@types/node ^22` → bumped |

`pnpm peers check` reports no issues. The `@tsparticles/engine` install script only scans for legacy packages, so it's denied in `pnpm-workspace.yaml` (`allowBuilds`). `cn` is shadcn's own class-merge package (repo `shadcn-ui/cn`), which replaces clsx + tailwind-merge.

### Next 16 specifics that affect the plan
- **Cache Components is on** (the scaffold default; it keeps everything prerendered). `new Date()` isn't allowed during prerender, even in client components. The footer year therefore uses `useSyncExternalStore`: the server snapshot is the build year from `next.config` `env`, and the client snapshot is the real clock.
- In dev, Strict Mode remounts `<html>` and strips attributes set by the pre-paint script. The client motion layer (step 6) re-applies `data-motion-ready` in a `useLayoutEffect`. This doesn't happen in production.
- `typecheck` runs `next typegen && tsc --noEmit`, so the `LayoutProps`/`PageProps` route types exist.

### Approved answers
1. Added `content/sections.json` with the prototype copy verbatim, plus US spelling. Its Zod schema comes in step 2.
2. The pre-paint `data-motion-ready` script has a **1.5 s** failsafe (`src/lib/motion-boot.ts`).
3. I'm using the latest stable Next (16.4.6), not 15.
4. Three.js is skipped. It's an optional post-QA step, and `three`/`@react-three/fiber` aren't installed.
5. Slugs come from JSON, the mobile menu is a top Sheet, and particles try a custom tsParticles push effect first.

### Copy changes applied
| File | Before | After |
|---|---|---|
| research.json `threads[mig].short` | Labour migration, admission… | Labor migration, admission… |
| experience.json `aut.points[1]` | Analysed … partner organisations | Analyzed … partner organizations |
| experience.json `aut.note` | Capstone: Autism in Focus Survey, a mixed-method analysis for Autismazing. | Capstone: Autism in Focus Survey: Mixed-Method Analysis, for Autismazing. |
| record.json `[3].label` | …data I analysed | …data I analyzed |
| methods.json `text.uses[0].title` | DistilRoBiLSTMFuse: A hybrid deep learning… | DistilRoBiLSTMFuse: An efficient hybrid deep learning… |
| sections.json `research.stages.mig.body` (from prototype) | How states organise labour migration… | How states organize labor migration… |

`methods.json` already said "Mixed-methods analysis", so no change was needed there. I found no other British spellings in the content or the prototype copy. Paper titles are untouched.

### Engineering notes from step 1
- `src/styles/site.css` is a script-generated 1:1 port of the prototype `<style>` (class names kept, token hexes → `var(--color-*)`, `.reveal-ready` hide rules removed until step 6). `src/styles/shell.css` holds rules that aren't in the prototype.
- The prototype's `.dark` class was renamed to `.on-ledger`, because it collided with Tailwind's `dark:` variant used inside shadcn components. Tailwind's `dark` variant is disabled, since the site has no dark theme.
- The prototype's `html{scroll-behavior:smooth}` never matched (it was scoped under `.root`). Smooth anchor scrolling is now real, but only with `prefers-reduced-motion: no-preference`.
- I added a skip link ("Skip to content"), visible only on keyboard focus, for the accessibility bar.

### Step 2: content layer and citations
- **Schemas** (`src/lib/schemas.ts`): one per file, plus `validateContent()` for cross-file rules:
  - `related` ids exist, and areas and method names resolve.
  - Works in `sections.json` link real publications, and each filter type appears exactly once.
  - Every thread has a matching area.
  - `needsProject` agrees with the projects and uses.
  - Each publication type's required fields are present (for example, a journal needs volume and pages or an article number, and manuscripts have no year).
  - `Khan, M. A.` appears exactly once per author list, and author names use the "Surname, I. I." form.
- **Two validation points:**
  - `next.config.ts` calls `checkContent()` (fs read), so errors fail `next build`/`next dev` before rendering, and warnings print (TODO profiles, missing abstracts). I checked this by breaking a `related` id: the build stopped with `content/publications.json: p5 relates to unknown “p99”`.
  - `src/lib/content.ts` validates the bundled JSON again at module load and exposes typed, enriched `PublicationView`s.
- **Port fidelity:** `tests/unit/prototype.ts` evaluates the prototype's own `Component` class from `design/Main.dc.html`. The tests compare `cite()`, `VENUE`, the author split and `detailVals()` (facts, authorship, placeholder, related, prev/next) for all 18 papers. They also confirm `publications.json` matches the prototype data field by field.
- **Deviations from the prototype (both are bugs in its output):**
  1. **Chicago, sole author:** the prototype printed "Khan, M. A.. 2027." with a double period. Fixed. This is the only difference the parity test allows.
  2. **BibTeX keys:** the prototype gives p5 (proceedings) and p9 (presentation) the same key, `chowdhury2025flood`, which breaks a combined `.bib`. Keys are now unique across the list, so later duplicates get `b`, `c`…; p9 becomes `chowdhury2025floodb`. All other keys are unchanged.

### Step 4: publication pages
- **Detail pages:** `/publications/[slug]` prerenders all 18 pages from the JSON slugs. Each page has:
  - breadcrumb, tags, title, authors (with `Khan, M. A.` highlighted), venue, and the actions (Read at the publisher, Copy citation, Copy link)
  - At a glance with the computed authorship, and the abstract placeholder
  - Where it fits, with deep links to `/#research?thread=…` (wired in step 5)
  - Cite this work (APA 7 / Chicago / BibTeX switcher, copy, `.bib` download), related work, and previous/next
- **Breadcrumb target:** "Publications" links to `/publications` (the URL parent) instead of the home anchor the prototype used. It looks the same.
- **`.bib` downloads:**
  - Each paper has one at `/publications/<slug>/bib` (filename = BibTeX key), linked as "Download .bib" next to "Copy citation" in the cite box.
  - All papers come as one file at `/publications.bib`, linked as "Download all as BibTeX (.bib)" under the list on `/publications`.
  - Both are prerendered.
- **Metadata:**
  - The title template is "Title · Md. Asif Khan".
  - Descriptions come from content (the abstract when present, otherwise kind, year and venue).
  - Each page has a canonical URL and Open Graph `article` data.
  - Journal articles and conference papers also carry Google Scholar's `citation_*` meta tags. Presentations and manuscripts don't.
- **JSON-LD:**
  - Each paper gets a `ScholarlyArticle`: the authors (my entry linked to the home page `Person` and to ORCID), DOI, publisher, the journal/volume/issue chain, the proceedings, or a `PublicationEvent` for talks, and the status for manuscripts.
  - The home page gets a `Person` with alumniOf, the address from `contact.location`, and sameAs (non-TODO profiles only).
- **Real 404 for unknown slugs:** under Cache Components, `notFound()` on an unlisted param sends status 200 plus `noindex` (the shell has already streamed). `src/proxy.ts` runs only on `/publications/:slug` and `/publications/:slug/bib` and rewrites unknown slugs to a 404. Known slugs pass through untouched.
- **`/publications` page:** the same explorer as the home section, with an `h1` page title and `h2` rows.

### Step 5: interactions
- **Research explorer:** the thread buttons set state and write `#research?thread=<id>` (replaceState, no scroll). `useHashParams` applies the fragment on load, on `hashchange`, and when arriving from another page (e.g. "Explore this research line"), then scrolls to the section. That last step is needed because a fragment with a query no longer matches an element id.
- **Experience:** chart bars and timeline rows share `open` and `hot`. A bar selects its role, a row toggles it, and hover/focus highlights both.
- **Methods:** row selection (`aria-pressed`) drives the `aria-live` panel, and hovering a column highlights it.
- **Publications:**
  - The composition bar toggles a type filter. Search matches title, coauthors and venue, and the live count reads "Showing n of 18". The empty state and "Show all" are in place.
  - State is mirrored to `/#publications?type=…&q=…` on home and to `/publications?type=…&q=…` on the index page, where back/forward is also handled.
  - After a reset, focus moves to the search box, because the button that had focus disappears.
- **Scroll spy:** an IntersectionObserver band (`-45% 0 -50% 0`) sets `aria-current` and `.is-active` on both the desktop and mobile links. Recognition maps to Publications, as do `/publications/*` pages. The current id clears when its section leaves the band, which fixed Contact sticking after a route change (found by e2e).
- **Copy actions:** the clipboard API is tried first, then the legacy `execCommand`. Success shows a Sonner toast plus the prototype's inline label. When copying is blocked, the inline fallback label is announced via `role="status"`. Sonner is restyled (Ledger, brass check, bottom-centre, so it never covers Back to top), and `next-themes` was removed.
- **Back to top:** appears after `scrollY > 720`. It scrolls to the top (instantly under reduced motion) and moves focus to `<main>`.
- **Playwright** (`pnpm test:e2e`, against the production build): 19 tests at desktop 1440 and mobile 390. They cover the home sections, research threads and deep links, the chart↔timeline link, the methods panel, publication filter/search/empty state/deep links, `/publications` query state, copy citation (clipboard contents + toast), the blocked-clipboard fallback, the detail page (citation styles, link back into research), nav state after navigation, the 404 for unknown slugs, the mobile Sheet (focus trap, Esc, close on navigation), horizontal-scroll regions with no page overflow, and Back to top focus.

---

(Original plan below, as approved.)

Status at writing: awaiting approval. Nothing had been built yet. Inputs I read: `design/Main.dc.html` (full style + script), the three variant files (they're the same file: Mobile and PublicationMobile are 390 px previews with the mobile CSS inlined, and Publication opens on `p0`), and all seven `content/*.json` files. `design/export/` is empty (it holds only `.keep`).

Environment: Node 22.13, pnpm 12.15, git 2.47. The folder isn't a git repo yet, so I'll run `git init` as the first step.

---

## 1. Project layout

The Next.js app goes at the root of this folder, next to `content/` and `design/`. Neither folder is changed.

```
src/
  app/
    layout.tsx                      fonts, <html data-motion-ready>, Toaster, CommandMenu, analytics flag
    globals.css                     Tailwind v4 @theme tokens + ported prototype CSS (component layer) + print
    not-found.tsx
    sitemap.ts, robots.ts
    publications.bib/route.ts       all entries, text/x-bibtex
    cv/route.ts                     308 → /files/Md-Asif-Khan-CV.pdf
    (site)/
      layout.tsx                    SiteHeader + children + Contact + BackToTop
      page.tsx                      home (RSC) + Person JSON-LD
      publications/page.tsx         full-page explorer
      publications/[slug]/page.tsx  generateStaticParams, generateMetadata, ScholarlyArticle JSON-LD
      publications/[slug]/opengraph-image.tsx
      publications/[slug]/bib/route.ts   per-paper .bib download
  components/
    site/        SiteHeader, NavLinks (spy), ReadingProgress, MobileMenu (Sheet), CommandMenu, BackToTop, Footer, CopyButton
    sections/    Hero, About, Research, Experience, Methods, Publications, Recognition, Contact, SectionHead
    viz/         HeroField (tsParticles, dynamic ssr:false), HeroField.three (optional, flag), CareerChart,
                 MethodsMatrix, CompositionBar, ThreadDiagrams (Count / Migration / Ai SVGs)
    publication/ PublicationHeader, AtAGlance, Abstract, WhereItFits, CiteBox, RelatedWork, Pager, AuthorList
    ui/          shadcn primitives (restyled): button, sheet, command, dialog, tooltip, input, sonner
  lib/
    schemas.ts     Zod: Site, Record, Research, Experience, Methods, Kinds, Publication (discriminated on type)
    content.ts     typed loaders (server-only), derived fields (authorsPre/Post, venueLine, authorship)
    citations.ts   apa / chicago / bibtex / venueLine / authorship / relatedFor (port of cite() + detailVals())
    slug.ts        slug lookup (slugs come from JSON, not computed — see conflicts §7)
    motion.ts      useMotionReady, useReducedMotionSafe, gsap registration, ScrollTrigger refresh helpers
    url-state.ts   parse/serialize "#publications?type=…&q=…" and "#research?thread=…"
    clipboard.ts   copy with toast + inline fallback state
  hooks/          useScrollSpy, useHashState
tests/
  unit/         citations.test.ts (APA/Chicago/BibTeX × 5 types), schemas.test.ts, url-state.test.ts
  e2e/          home, filter+search, detail, copy-citation, mobile-menu, keyboard (Playwright)
public/files/   CV goes here (placeholder README until the PDF is added)
```

Tooling: Vitest for unit tests, Playwright for e2e, ESLint (next config), `tsc --noEmit` as `typecheck`. The scripts are `lint`, `typecheck`, `test`, `test:e2e`, `build`.

## 2. Routes

| Route | Rendering | Notes |
|---|---|---|
| `/` | static RSC | Every section. Client islands only where interaction is needed |
| `/publications` | static | Same `PublicationExplorer` client component, full-page layout. URL state in `?type=&q=` |
| `/publications/[slug]` | SSG ×18 | Slugs from `publications.json`. `dynamicParams = false` |
| `/publications/[slug]/opengraph-image` | static at build | `next/og` with bundled Newsreader/Public Sans TTFs |
| `/publications/[slug]/bib` | static | `.bib` download (Content-Disposition) |
| `/publications.bib` | static | All 18 entries |
| `/cv` | redirect | `next.config` `redirects()` permanent → `/files/Md-Asif-Khan-CV.pdf` |
| `/sitemap.xml`, `/robots.txt` | static | Canonical base `https://asifkhan.net` from `site.json.domain` |

## 3. Component map (server vs client)

| Component | RSC / client | State / behaviour (from prototype) |
|---|---|---|
| SiteHeader | client (small) | scroll spy via IntersectionObserver `rootMargin -45% 0 -50% 0`; `recognition` and detail pages map to "Publications"; `aria-current` |
| ReadingProgress | client | GSAP scrub on `scaleX` |
| MobileMenu | client | shadcn Sheet, `side="top"`, below the 60 px bar, styled as the prototype's Newsreader 26 px list + brass CV button |
| Hero | RSC shell + `HeroEntrance` client + `HeroField` dynamic | name is static SSR text (LCP); canvas mounts later |
| About + RecordLedger | RSC + client count-up | 1.4 s ease-out cubic, `decimals` from JSON |
| ResearchExplorer | client | `thread` state ↔ `#research?thread=`; aria-pressed buttons; `aria-live` stage |
| Experience (CareerChart + Timeline) | one client parent | shared `open` (default `ta`) and `hot`; chart click = select, timeline click = toggle |
| MethodsMatrix + MethodPanel | client | `method` (default `survey`), `hotCol`; `aria-live` panel; `needsProject` placeholder row |
| PublicationExplorer | client | `filter`, `query`, live count "Showing n of 18", empty state, Show all, Copy citation (APA) |
| Recognition | RSC | — |
| Contact | RSC + CopyButton | profiles with `TODO` hrefs filtered in prod + build warning |
| BackToTop | client | appears when `scrollY > 720` |
| CommandMenu | client | ⌘K/Ctrl+K: sections, publications (title/coauthor/venue), copy email, download CV |
| Publication page | RSC + CiteBox / copy buttons as client | style tabs, copy, `.bib` link, prev/next wrap-around |

## 4. Animation ownership

| Concern | Library | Element(s) | Reduced motion |
|---|---|---|---|
| Hero entrance: name mask (two spans, 0.15 s / 0.3 s), kicker, statement, sub, actions, foot (delays .1/.42/.6/.6/.85 s) | GSAP timeline | `.mask-in`, `[data-hero-line]` | end state, no timeline |
| Section-head brass rule (scaleX, 1 s, delay .2) | GSAP + ScrollTrigger `once` | `.sec-head::before` → real `<span>` (GSAP can't target pseudo-elements) | scaleX 1 |
| Reveal-on-scroll (opacity/y 14 px, .7 s, threshold ≈ 12%) | GSAP + ScrollTrigger `once`, batched | `[data-reveal]` | visible |
| Ledger count-up | GSAP tween on a proxy object → text | `.rec-num` | final values |
| Career-chart bar growth (stagger .1 + i·.08) | GSAP + ST `once` | bar fill `<span>` (was `::after`) | full |
| Matrix dots pop (.35 s, back-out, .2 + mi·.05 + pi·.03) | GSAP + ST `once` | `.dot` | scale 1 |
| Composition-bar growth (.1 + i·.12) | GSAP + ST `once` | `.seg-bar` | full |
| Research SVG: bar growth, path drawing, fade | GSAP (re-runs per thread mount; ST `once` for first view) | `.a-bar`, `.a-draw`, `.a-fade` | end state |
| Reading-progress line | GSAP ST `scrub` | `.progress span` | still tracks scroll (it's position feedback, not decoration) — **confirm** |
| Thread stage cross-fade; works stagger | Framer Motion `AnimatePresence mode="wait"` | `.stage` wrapper | instant |
| Timeline accordion height | Framer Motion `AnimatePresence` + height auto | `.tl-detail` | instant |
| Publication filter/search reorder | Framer Motion `layout` + `AnimatePresence popLayout` | `<li class="pub">` | instant |
| Cite-style swap | Framer Motion fade (.35 s) | `.cite-text` | instant |
| Sheet open/close | Framer Motion (replaces Radix CSS anim) | Sheet content | instant |
| List → detail title | Framer Motion `layoutId="pub-title-{id}"` + template-level fade | title `h3`/`h1` | instant |
| Route-migration dots, cases through checkpoint, checkpoint pulse, scroll cue | SVG SMIL / CSS keyframes (verbatim from prototype) | `animateMotion`, `.a-flow`, `.a-pulse`, `.cue-line` | removed; static AI diagram variant shown |
| Hero particles | tsParticles (slim) | canvas | single still frame (`pauseOnBlur`, `pauseOnOutsideViewport`, no `move` when reduced) |

GSAP and Framer Motion never touch the same node. Where both apply to a region (for example the research stage, which reveals on scroll and cross-fades per thread), GSAP owns the outer `[data-reveal]` wrapper and Framer Motion owns the inner keyed stage.

Gating: `<html data-motion-ready>` is the only switch for the "hidden before reveal" CSS. All GSAP code runs inside `useGSAP({ scope })` and is cleaned up on unmount. `ScrollTrigger.refresh()` runs on `document.fonts.ready` and on pathname change. A single `useMotionPreference()` reads `prefers-reduced-motion` (Framer `useReducedMotion` + matchMedia for GSAP via `gsap.matchMedia()`).

## 5. Particle field

I'll build it on tsParticles with the `slim` bundle, set up as follows:
- Count `clamp(18, 110, round(area/14000))`.
- Biased initial placement: custom positions through `particles.load`, x = W·r^0.55.
- Speed ≈ 0.11, links at 132 px with opacity 0.22 and colour `rgb(190,205,199)`.
- Dots `rgba(214,222,218,.55)`, r 0.9–2.2. Every ninth dot is a brass seal: I'll use a second particle group (`manualParticles`) or a `groups` config with its own colour and a size +0.8.
- Pointer: tsParticles' `repulse` changes velocity, which the spec forbids. I'll write a small custom interactor (an `ExternalInteractorBase` plugin) that offsets draw position by up to 14 px inside 140 px without touching velocity, the same maths as the prototype.
- No click modes. Pause off-screen and when the tab is hidden.

**Fallback:** if tsParticles fights the per-particle placement or the draw-offset requirement, I'll port the prototype's ~90-line canvas loop as `HeroField` behind the same interface. It's smaller (no 40 KB dependency) and matches exactly. I'll report which one ships and why.

Three.js (`HeroField.three.tsx`, `NEXT_PUBLIC_HERO_RENDERER=three`): built last, only if time allows, and kept only if it passes the 60 fps / LCP check. Default stays tsParticles.

## 6. Build order (one commit per step, summary or screenshot after each major one)

1. **Scaffold.** `git init`; Next 15 + TS strict + Tailwind v4 + shadcn init; fonts (Newsreader opsz+ital, Public Sans) via `next/font`; tokens in `@theme`; port the prototype `<style>` into `globals.css` component layer (class names kept, so the 1:1 visual diff is easy); layout shell (header, contact/footer).
2. **Content.** Zod schemas, loaders, build-time validation (runs in `next.config` / a `prebuild` script so a bad JSON fails `pnpm build`); TODO-link warning; `citations.ts` port + Vitest tests.
3. **Static sections.** All home sections server-rendered in their default state (thread `count`, role `ta` open, method `survey`, filter all), matching the prototype with JS off.
4. **Publication pages.** `/publications/[slug]` with all blocks, `/publications`, `.bib` routes, metadata, JSON-LD.
5. **Interactions.** Research explorer, chart ↔ timeline, matrix, explorer filter/search, URL hash state, copy actions + Sonner + inline fallback, mobile Sheet, BackToTop, scroll spy.
6. **Motion.** GSAP timelines/ScrollTriggers, Framer transitions, particles, reduced-motion path.
7. **Extras.** ⌘K palette, OG images, sitemap/robots, print stylesheet, 404, analytics flag, optional Three hero.
8. **QA.** Playwright e2e; Lighthouse (desktop + mobile) on `pnpm build && pnpm start`; screenshots at 1440/1280/1024/768/390/360 compared against the prototype rendered in the same viewport; keyboard and reduced-motion passes; fix and re-measure.

For the visual comparison I'll render `design/Main.dc.html` in Chrome. It loads `./support.js`, which isn't in the package. If it won't render without it, I'll compare against the CSS and markup directly and tell you. **Exporting the canvas HTML into `design/export/` would help here.**

---

## 7. Conflicts and gaps found (please decide)

**A. Content that the prototype has but `content/*.json` doesn't.** The strict rule says JSON only, so this needs your call. The missing items:
- Section titles and intros: "Research", "Three lines of work…", "Experience", "Teaching, applied research…", "Methods and skills", "No proficiency scores…", "Publications", "Journal articles, conference proceedings…", "Grants, awards, and training".
- Per-thread stage copy: the h3, the paragraph, and the **works list**, including unlinked items like "Comparative immigration governance in the United States and Canada · Independent project, 2025", the UIUC Canvas project and the capstone, plus meta lines like "Accepted, MPSA 2027".
- The SVG `aria-label` texts.
- The "Earlier work in computational text analysis" box.
- The Contact headings ("Email", "Profiles", "Based in") and the © line.
- The type labels for the composition bar ("Journal articles", "Conference proceedings", "Presentations", "Under review", "In preparation"), which differ from `publication-kinds.json`.
- Nav items and labels ("Methods" → `#skills`).

**Proposal:** add `content/sections.json` and `content/research.json → threads[].stage` with this copy **verbatim from the prototype**, under the same schemas. Interface microcopy ("Copy citation", "Show all", "View details") stays in code. I won't change existing JSON values.

**B. Slugs.** The prototype computes slugs (first 7 words), but `publications.json` has explicit slugs that differ (`…-talk` suffixes for duplicate titles). The JSON slugs win, and "Copy link" uses them.

**C. Field names.** The prototype uses `t/au/art/when/venueName`, while the JSON uses `type/authors/article/dates/venue`. I'll port the logic onto the JSON names, and the tests will lock the output to what the prototype produces.

**D. Mobile menu.** The prototype drops an inline panel under the bar, but the brief says Sheet. I'll use a Sheet with `side="top"` styled to look identical, so you get focus-trap and Esc while the visuals match the prototype.

**E. "Never hide content before JS" vs the hero mask rise.** If the hidden start state is applied only after hydration, the name flashes visible, then hides, then rises. **Proposal:**
- A tiny inline `<head>` script sets `data-motion-ready` before first paint. It needs JS and skips when reduced motion is on.
- A 2.5 s failsafe removes it if hydration never happens.
- With JS off or reduced motion, nothing is ever hidden.
- I'll measure LCP both ways. If the masked name delays LCP, the name will start at its final position, and only the lines below will animate.

**F. Section-rule, chart-bar and composition animations use `::before`/`::after` in the prototype.** GSAP can't animate pseudo-elements, so they become real `aria-hidden` spans. The look doesn't change.

**G. Stack versions.** The brief pins Next.js 15. Today is Nov 2026, so 16 is likely current. I'll stay on 15 as the brief says unless you want the latest.

**H. Three.js hero.** It's optional and likely to hurt the bundle and LCP. I'd defer it to the very end and skip it unless you want it.

## 8. Copy I noticed (listed, not changed)

1. `methods.json` → Text classification use: "DistilRoBiLSTMFuse: **A hybrid** deep learning approach…". The actual paper title is "DistilRoBiLSTMFuse: **An efficient hybrid** deep learning approach…".
2. Mixed spelling. British forms ("Labour migration", "Analysed", "organisations") appear alongside US forms elsewhere, such as "labor cooperation" in a paper title and "program". The paper titles must stay as published; the rest is your choice.
3. `experience.json` → "**Created and administer** the department’s official digital media presence…" has a tense mismatch.
4. `experience.json` → Autismazing note says "a **mixed-method** analysis", but the methods list says "**Mixed-methods** analysis".
5. Record: "4 · Languages spoken fluently" counts Bengali (native) as fluent. That's fine, but it's worth confirming.
6. Footer "© 2026 Md. Asif Khan" is hard-coded in the prototype. Should it become the current year?
7. The prototype shows placeholder profile URLs (scholar.google.com etc.). Under your rule, the TODO links are **hidden**, so production shows only ORCID until you fill them in.
8. The hero sub says "immigration policy", while the research thread is "Migration policy…". That might be intentional.

## 9. Proposed "more professional" tweaks (not doing unless you approve)

1. Add `rel="noopener"` and a visually hidden "(opens publisher site)" note on DOI links. This is accessibility, and the visuals don't change.
2. `/publications` index: group by year with sticky year labels. The current design lists by type order, and I'd keep that by default.
3. Show the duplicate-title pairs (talk ↔ manuscript, proceedings ↔ presentation) as one row with a "Also presented as" sub-line on the list as well, not only on the detail page. It reduces visual repetition. **This is a visual change, so it needs your OK.**
4. Add `hreflang`/`lang` and `<link rel="me">` to ORCID for identity verification.

---

**Questions before I start:** (A) may I add the verbatim prototype copy as new JSON? (E) is the inline pre-paint motion flag OK? (G) should I stay on Next 15? (H) should I skip Three.js? Once you approve, I'll start at step 1.
