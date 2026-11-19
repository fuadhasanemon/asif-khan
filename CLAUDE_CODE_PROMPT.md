# Build brief: asifkhan.net portfolio

Paste the prompt below into Claude Code from the root of an empty project folder that contains this handoff package (`CLAUDE_CODE_PROMPT.md`, `content/`, `design/`, and the HTML you exported from the design canvas, in `design/export/`).

---

## The prompt

You are building the production version of my academic portfolio website, asifkhan.net. A finished, reviewed design already exists. Your job is to turn it into a fast, accessible, production-quality Next.js site that matches the design closely and makes it fully dynamic. Do not redesign it. Where you think something could be more professional, propose it in a short list before changing it.

### 0. Read before writing any code

1. `design/Main.dc.html`: the full home page as a working prototype. Its `<style>` block is the design system in CSS, and its `<script>` holds the interaction logic: particle field, scroll spy, reveal-on-scroll, count-up, research explorer, career chart, methods matrix, publication filter, search, citation formatter and detail-page routing. Treat it as the specification for behaviour, spacing, colour and type.
2. `design/Publication.dc.html`: the publication details page (same file family, opened on one paper).
3. `design/Mobile.dc.html` and `design/PublicationMobile.dc.html`: the same pages at 390 px. The CSS block after `@media (max-width: 760px)` in Main is the mobile layout.
4. `design/export/`: my HTML export from the canvas, if present, for visual reference.
5. `content/*.json`: all site content, already extracted. This is the only source of truth for text, data and links.

Then write `PLAN.md` with your component map, routes, animation ownership table (section 4) and the order you will build in. Stop and show me the plan before building.

### 1. Stack

- Next.js 15 (App Router) with TypeScript in strict mode, `src/` directory, React Server Components by default and client components only where interaction needs them.
- Tailwind CSS v4 with the design tokens below as CSS variables and Tailwind theme values.
- shadcn/ui for accessible primitives: Button, Tabs/ToggleGroup, Accordion or Collapsible, Input, Sheet (mobile menu), Tooltip, Command (⌘K palette), Sonner (toasts for "Citation copied"). Restyle every one of them to the design. No default shadcn look may remain.
- GSAP with ScrollTrigger (through `@gsap/react` and `useGSAP`) for scroll-linked and timeline animation.
- Framer Motion (the `motion` package) for state-driven UI animation: tab and filter changes, accordion height, list reordering, page transitions and shared layout.
- tsParticles (`@tsparticles/react` with `@tsparticles/slim`), the maintained successor to particles.js, for the hero particle field.
- Three.js (via `@react-three/fiber`) only as an optional alternative hero renderer (section 5). Do not ship both renderers on the same page.
- Fonts with `next/font/google`: Newsreader (variable, with the opsz axis and italics) and Public Sans (variable). Self-hosted, `display: swap`.
- Content: typed loaders over `content/*.json` with Zod schemas, validated at build time. Publication pages are statically generated.
- Deployment target: Vercel. Add `sitemap.ts`, `robots.ts`, metadata, Open Graph images and JSON-LD.

### 2. Design tokens (copy exactly)

Colours:
- Ledger `#12312C`: hero, nav, contact, selected states
- Paper `#F3F4F0`: page ground
- Graphite `#1E2422`: body text
- Docket blue `#2A52BE`, hover `#1C3A8F`: links, focus ring on light backgrounds
- Seal brass `#C9A44C`, hover `#DDBB66`, light `#E2C779`: brass is used on Ledger backgrounds only, plus the progress line, open nodes and the heading rules
- Rule `#CDD2CB`, soft rule `#DCE0D8`
- Muted text `#4A5450`, `#3A433F`, `#545D59`
- Card `#FBFBF8`, tint `#E8EBE4`, hover tint `#E6E9E2`
- Status tags: Accepted `#DCEBE4`/`#17463A`; Under review `#E2E8F7`/`#22408F`; In preparation `#F1E9D2`/`#5E4A12`; placeholder `#F5ECD2`/`#7A4E00`

Type:
- Newsreader for the display name (128 px, line-height 0.92, weight 380, opsz 72), section titles (60 px), statements, paper titles and numbers.
- Public Sans for body text (17 px, line-height 1.7, measure about 640 px) and all interface text.
- Sentence case throughout. No all-caps labels, no letter-spaced eyebrows, no arrows appended to button text. Use monospace only for BibTeX.

Layout:
- Content width 1240 px. Side padding 56 px, then 40 px below 1100 px, then 22 px below 760 px.
- Sections are 136 px apart (84 px on mobile), separated by 1 px Rule lines.
- Radius: buttons 3 px, chips and tags fully round, everything else square.
- Touch targets of at least 44 px. Visible focus rings: Docket blue on Paper, `#E2C779` on Ledger.

### 3. Routes and components

```
/                                home: every section below
/publications                    full publication index (same explorer as on home, at a full-page size)
/publications/[slug]             publication details (statically generated from content/publications.json)
/cv                              redirects to /files/Md-Asif-Khan-CV.pdf (placeholder until I add the file)
```

Home sections, in order (ids must match, because the nav uses them):
1. `SiteHeader`: sticky Ledger bar; brand; section links with scroll spy (`aria-current`); "Download CV"; a 2 px brass reading-progress line along the bottom edge; on mobile, a menu button opening a shadcn Sheet.
2. `Hero` (`#top`): particle field, a masked rise of the name, statement, sub-line, two actions, an "Upcoming" strip and a scroll cue.
3. `About` (`#about`): lead paragraph, body paragraphs, and "The record, counted" ledger with count-up (`content/record.json`).
4. `Research` (`#research`): research explorer with three thread buttons and a stage with an animated SVG diagram per thread plus linked works, then an "Earlier work" note.
5. `Experience` (`#experience`): career chart (2017–2027 axis, one bar per role), an interactive timeline sharing hover and selection state with the chart, and an education aside.
6. `Methods` (`#skills`): methods × projects matrix with row selection, column hover and a detail panel; then software, languages and teaching.
7. `Publications` (`#publications`): a composition bar showing counts by type (click to filter), a search box, a live result count, an empty state, and a list with "View details" and "Copy citation".
8. `Recognition` (`#recognition`): grants and awards, certifications.
9. `Contact` (`#contact`): Ledger background, statement, email with "Copy email", profile links, CV button, footer.
10. `BackToTop`: floating button that appears after the hero.

Publication details page: breadcrumb; type and status tags; title; authors with my name highlighted; venue; actions (Read at the publisher, Copy citation, Copy link); "At a glance" facts including the authorship position computed from the author list; abstract (placeholder if null); "Where it fits" (research line with a deep link to `/#research?thread=…`, methods, my role); "Cite this work" with APA 7, Chicago author-date and BibTeX tabs, a copy button and a `.bib` download; related work; previous and next. Port the formatter logic from the prototype's `cite()` and `detailVals()` into `src/lib/citations.ts` with unit tests.

### 4. Animation ownership (avoid two libraries fighting over one element)

| Concern | Library |
|---|---|
| Hero entrance timeline (name mask, lines, actions, scroll cue) | GSAP timeline |
| Section heading brass rules, reveal-on-scroll, ledger count-up, chart bar growth, matrix dots, composition-bar growth, research SVG path drawing | GSAP + ScrollTrigger (`once: true`) |
| Reading-progress line | GSAP ScrollTrigger `scrub` on `scaleX` |
| Research thread switch (stage cross-fade), timeline accordion, publication filter and search reordering, cite-style tab swap, Sheet menu, route transition into a publication page | Framer Motion (`AnimatePresence`, `layout`) |
| Continuous loops (dots on the migration routes, cases passing the checkpoint, checkpoint pulse) | CSS keyframes or SVG SMIL, as in the prototype |
| Hero particle field | tsParticles |

Rules:
- Every motion has a purpose and plays once, except the small research-diagram loops and the particles.
- Wrap all of it in a single `useReducedMotion` / `prefers-reduced-motion` check. With reduced motion, show the end state immediately, stop the loops, and render the particles as one still frame.
- Never hide content before JavaScript runs. Reveal styles apply only after hydration, using a `data-motion-ready` attribute on `<html>`.
- Clean up every ScrollTrigger on unmount (`useGSAP` scope). Refresh ScrollTrigger after fonts load and on route changes.

### 5. Hero particle field spec

- Particle count is about the hero area divided by 14,000, with a minimum of 18 and a maximum of 110 (fewer on mobile).
- Placement is biased to the right (x = width × random^0.55), so the area behind the text stays calm.
- Drift speed is about 0.11 px per frame. Particles link within 132 px; link opacity is at most 0.22 and fades with distance; links are `rgba(190,205,199)`.
- Dots are `rgba(214,222,218,.55)` at a radius of 0.9–2.2. Every ninth particle is a brass "seal" (`rgba(201,164,76,.9)`, slightly larger).
- The pointer pushes nearby particles up to 14 px aside within a 140 px radius, without changing their velocity. Do not use click effects.
- Pause when the hero is off-screen or the tab is hidden. Load the hero lazily (`next/dynamic`, `ssr: false`) behind a static gradient-free Ledger background, so the LCP element is the name, not the canvas.
- Optional `HeroField.three.tsx`: the same look rendered with an R3F `Points` and `LineSegments` and a subtle depth parallax. Select it with an environment flag. Default to tsParticles. Ship it only if it holds 60 fps on a mid-range laptop and does not hurt LCP.

### 6. Content rules (strict)

- Use only `content/*.json`. Never invent publications, abstracts, metrics, citation counts, dates, titles, coauthors or claims.
- `abstract: null` renders the placeholder box "[Paste the abstract from the published version]" (or the wording the prototype uses for each publication type).
- Methods with `needsProject: true` render the placeholder row "[Add the project or paper where you used this method]".
- Profile links whose `href` starts with `TODO` are hidden in production and listed in a build-time warning.
- My name in author lists is always `Khan, M. A.` and is highlighted.
- Keep all copy exactly as written. If something reads badly, list it for me instead of rewriting it.

### 7. Make it more professional (build these too)

1. ⌘K / Ctrl+K command palette (shadcn Command): jump to sections, search publications by title, coauthor or venue, copy email, download CV.
2. URL state: `/#publications?type=journal&q=peerj` style filters, so a filtered view can be shared; `/#research?thread=mig` deep-links a thread.
3. Publication pages: per-page metadata, an Open Graph image generated with `next/og` in the site's type and colours, JSON-LD `ScholarlyArticle` on each page and `Person` on the home page (name, alumniOf, sameAs ORCID), canonical URLs, and a `.bib` download for every paper and for all of them at once (`/publications.bib`).
4. Route transition from the list to a publication page using Framer Motion shared layout on the title.
5. Toasts (Sonner) confirming copy actions, with an inline fallback when the clipboard is blocked.
6. Print stylesheet for publication pages (clean citation, no nav).
7. Analytics hook left disabled (Vercel Analytics ready, behind an env flag).
8. A `404` page in the site's style.

### 8. Quality bar (verify before you say it is done)

- Lighthouse on the production build, desktop and mobile: Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100.
- LCP < 2.0 s, CLS < 0.05, no layout shift from fonts.
- Keyboard: every interactive element reachable, with visible focus; the research buttons, matrix rows, chart bars and filters work with Enter and Space; the Sheet traps focus and closes on Esc.
- Screen reader: one `h1` per page, logical headings, `aria-pressed` and `aria-expanded` states, `aria-live` on the publication count and the methods panel, text alternatives for the SVG diagrams and the chart.
- Responsive check at 1440, 1280, 1024, 768, 390 and 360 px. The research tabs and the methods matrix scroll horizontally on small screens, as in the prototype.
- Reduced-motion check with the OS setting on.
- Unit tests for the citation formatter (APA, Chicago and BibTeX for each publication type) and the Zod content schemas. Playwright smoke tests for the home page, filtering, search, the detail page, copy citation and the mobile menu.
- `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` all pass.
- Take screenshots of each section at desktop and mobile widths, compare them with the prototype, and fix the differences before reporting.

### 9. Project structure

```
src/
  app/(site)/page.tsx
  app/(site)/publications/page.tsx
  app/(site)/publications/[slug]/page.tsx
  app/(site)/publications/[slug]/opengraph-image.tsx
  app/publications.bib/route.ts
  app/sitemap.ts, robots.ts, not-found.tsx, layout.tsx
  components/site/  (SiteHeader, MobileMenu, CommandMenu, BackToTop, Footer)
  components/sections/  (Hero, About, Research, Experience, Methods, Publications, Recognition, Contact)
  components/viz/  (HeroField, CareerChart, MethodsMatrix, CompositionBar, ThreadDiagrams)
  components/publication/  (PublicationHeader, AtAGlance, CiteBox, RelatedWork, Pager)
  lib/  (content.ts, schemas.ts, citations.ts, slug.ts, motion.ts)
content/  (the JSON files, unchanged)
public/files/  (CV PDF goes here)
```

### 10. Working method

- Build in this order: tokens and layout shell, then content loaders and schemas, then static sections, then the publication pages, then interactions, then motion, then the professional extras, then QA.
- Commit after each step with a clear message.
- After each major step, show me a screenshot or summary before continuing to the next.
- When the prototype and this brief disagree, follow the prototype for visuals and this brief for engineering. List any conflict you find.

---

## Before you run it

1. Put the exported canvas HTML in `design/export/`.
2. Put your CV PDF at `public/files/Md-Asif-Khan-CV.pdf` once the project exists.
3. Fill in the `TODO` profile links in `content/site.json` and the `abstract` fields in `content/publications.json` when you have them. The site works without them.
