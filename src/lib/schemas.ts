/**
 * Zod schemas for every file in content/. Shapes mirror the JSON exactly;
 * cross-file rules (ids that must resolve, names that must match) live in
 * `validateContent()` at the bottom. Only relative imports here: this module is
 * also loaded by next.config.ts for build-time validation.
 */
import { z } from "zod"

export const ME = "Khan, M. A."

const text = z.string().trim().min(1)
const nullableText = text.nullable()
/** "Surname, I. I." — the APA-style form every author entry uses. */
const authorName = z.string().regex(/^[^,]+, (?:[A-Z]\.(?: |-)?)+$/u, "Author must look like “Surname, I. I.”")

/* ---------- site.json ---------- */
export const ProfileSchema = z.object({ label: text, href: text })
export const SiteSchema = z.object({
  name: text,
  shortName: text,
  domain: z.url(),
  role: text,
  heroStatement: text,
  heroSub: text,
  announcement: z.object({ label: text, text: text, linkText: text, href: text }),
  about: z.object({ lead: text, paragraphs: z.array(text).min(1) }),
  education: z.array(z.object({ year: z.string().regex(/^\d{4}$/), degree: text, institution: text, note: text })).min(1),
  skills: z.object({ software: z.array(text).min(1), languages: text, teaching: text }),
  awards: z.array(z.object({ title: text, meta: text.optional() })),
  certifications: z.array(z.object({ title: text, meta: text.optional() })),
  contact: z.object({
    statement: text,
    email: z.email(),
    location: text,
    cvPath: z.string().startsWith("/"),
    profiles: z.array(ProfileSchema),
  }),
})

/* ---------- record.json ---------- */
export const RecordSchema = z.array(
  z.object({ value: z.number().nonnegative(), decimals: z.number().int().min(0).max(4), label: text }),
)

/* ---------- research.json ---------- */
export const ThreadId = z.enum(["count", "mig", "ai"])
export const ResearchSchema = z.object({
  threads: z.array(z.object({ id: ThreadId, name: text, short: text, count: text })).length(3),
  areas: z.record(z.string(), z.object({ name: text, thread: ThreadId.optional() })),
})

/* ---------- experience.json ---------- */
export const RoleSchema = z
  .object({
    id: text,
    title: text,
    shortLabel: text,
    organization: text,
    dates: text,
    start: z.number().min(2017).max(2027),
    end: z.number().min(2017).max(2027),
    ongoing: z.boolean(),
    kind: z.enum(["Leadership", "Teaching", "Service", "Research"]),
    note: nullableText,
    points: z.array(text).min(1),
  })
  .refine((r) => r.end > r.start, { message: "end must be after start" })
export const ExperienceSchema = z.array(RoleSchema).min(1)

/* ---------- methods.json ---------- */
export const MethodsSchema = z.object({
  projects: z.array(z.object({ id: text, short: text, where: text })).min(1),
  methods: z.array(
    z
      .object({
        id: text,
        name: text,
        projects: z.array(text),
        uses: z.array(z.object({ title: text, ctx: text })),
        needsProject: z.boolean(),
      })
      .refine((m) => m.needsProject === (m.projects.length === 0 && m.uses.length === 0), {
        message: "needsProject must be true exactly when a method has no projects and no uses",
      }),
  ),
})

/* ---------- publication-kinds.json ---------- */
export const PubType = z.enum(["journal", "conference", "talk", "review", "prep"])
export const KindsSchema = z.record(PubType, text)

/* ---------- publications.json ---------- */
const PublicationBase = z.object({
  id: z.string().regex(/^p\d+$/),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: PubType,
  year: z.string().regex(/^\d{4}$/).nullable(),
  authors: z.array(authorName).min(1),
  title: text,
  venue: nullableText,
  volume: nullableText,
  issue: nullableText,
  pages: nullableText,
  article: nullableText,
  publisher: nullableText,
  place: nullableText,
  dates: nullableText,
  doi: z.string().regex(/^10\.\d{4,9}\/\S+$/).nullable(),
  status: z.enum(["Accepted", "Under review", "In preparation"]).nullable(),
  area: text,
  methods: z.array(text),
  related: z.array(z.string().regex(/^p\d+$/)),
  abstract: nullableText,
})

/** Fields each publication type needs for its venue line, facts and citations. */
const REQUIRED: Record<z.infer<typeof PubType>, (keyof z.infer<typeof PublicationBase>)[]> = {
  journal: ["year", "venue", "volume", "publisher", "doi"],
  conference: ["year", "venue", "pages", "publisher", "doi"],
  talk: ["year", "venue", "place", "dates"],
  review: ["venue", "status"],
  prep: ["status"],
}

export const PublicationSchema = PublicationBase.superRefine((p, ctx) => {
  for (const key of REQUIRED[p.type]) {
    if (p[key] == null) ctx.addIssue({ code: "custom", path: [key], message: `${p.type} needs “${key}”` })
  }
  if (p.type === "journal" && !p.pages && !p.article)
    ctx.addIssue({ code: "custom", path: ["pages"], message: "journal needs pages or an article number" })
  if ((p.type === "review" || p.type === "prep") && p.year)
    ctx.addIssue({ code: "custom", path: ["year"], message: `${p.type} items have no year` })
  if (p.type === "prep" && p.venue)
    ctx.addIssue({ code: "custom", path: ["venue"], message: "manuscripts in preparation have no venue" })
  const mine = p.authors.filter((a) => a === ME).length
  if (mine !== 1) ctx.addIssue({ code: "custom", path: ["authors"], message: `“${ME}” must appear exactly once` })
  if (new Set(p.authors).size !== p.authors.length)
    ctx.addIssue({ code: "custom", path: ["authors"], message: "duplicate author" })
  if (p.related.includes(p.id)) ctx.addIssue({ code: "custom", path: ["related"], message: "a paper cannot relate to itself" })
})
export const PublicationsSchema = z.array(PublicationSchema).min(1)

/* ---------- sections.json ---------- */
const Head = { title: text }
const StageSchema = z.object({
  heading: text,
  body: text,
  diagramLabel: text,
  works: z.array(z.object({ title: text, meta: text, publication: z.string().regex(/^p\d+$/).nullable() })).min(1),
})
export const SectionsSchema = z.object({
  nav: z.array(z.object({ id: text, label: text })).min(1),
  about: z.object({ ...Head, recordHeading: text }),
  research: z.object({
    ...Head,
    intro: text,
    stages: z.object({ count: StageSchema, mig: StageSchema, ai: StageSchema }),
    earlier: z.object({ heading: text, body: text }),
  }),
  experience: z.object({ ...Head, intro: text, educationHeading: text }),
  skills: z.object({
    ...Head,
    intro: text,
    matrixCaption: text,
    panelKicker: text,
    softwareHeading: text,
    languagesHeading: text,
    teachingHeading: text,
  }),
  publications: z.object({
    ...Head,
    intro: text,
    searchLabel: text,
    searchPlaceholder: text,
    filterLabels: z.array(z.object({ type: PubType, label: text })).length(5),
  }),
  recognition: z.object({ ...Head, awardsHeading: text, certificationsHeading: text }),
  contact: z.object({ emailHeading: text, profilesHeading: text, locationHeading: text }),
})

/* ---------- types ---------- */
export type Site = z.infer<typeof SiteSchema>
export type RecordItem = z.infer<typeof RecordSchema>[number]
export type Research = z.infer<typeof ResearchSchema>
export type Thread = Research["threads"][number]
export type ThreadIdT = z.infer<typeof ThreadId>
export type Role = z.infer<typeof RoleSchema>
export type Methods = z.infer<typeof MethodsSchema>
export type PubTypeT = z.infer<typeof PubType>
export type Kinds = Record<PubTypeT, string>
export type Publication = z.infer<typeof PublicationSchema>
export type Sections = z.infer<typeof SectionsSchema>

export type RawContent = {
  site: unknown
  record: unknown
  research: unknown
  experience: unknown
  methods: unknown
  kinds: unknown
  publications: unknown
  sections: unknown
}

export type Content = {
  site: Site
  record: z.infer<typeof RecordSchema>
  research: Research
  experience: Role[]
  methods: Methods
  kinds: Kinds
  publications: Publication[]
  sections: Sections
}

export type ValidationResult =
  | { ok: true; content: Content; warnings: string[] }
  | { ok: false; errors: string[]; warnings: string[] }

const isTodo = (href: string) => /^\s*todo\b/i.test(href)

/** Parse every file, then check the references between files. */
export function validateContent(raw: RawContent): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  function parse<T>(file: string, schema: z.ZodType<T>, value: unknown): T | undefined {
    const r = schema.safeParse(value)
    if (r.success) return r.data
    for (const issue of r.error.issues) errors.push(`content/${file}: ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    return undefined
  }

  const site = parse("site.json", SiteSchema, raw.site)
  const record = parse("record.json", RecordSchema, raw.record)
  const research = parse("research.json", ResearchSchema, raw.research)
  const experience = parse("experience.json", ExperienceSchema, raw.experience)
  const methods = parse("methods.json", MethodsSchema, raw.methods)
  const kinds = parse("publication-kinds.json", KindsSchema, raw.kinds) as Kinds | undefined
  const publications = parse("publications.json", PublicationsSchema, raw.publications)
  const sections = parse("sections.json", SectionsSchema, raw.sections)

  const dupes = (file: string, label: string, values: string[]) => {
    const seen = new Set<string>()
    for (const v of values) {
      if (seen.has(v)) errors.push(`content/${file}: duplicate ${label} “${v}”`)
      seen.add(v)
    }
  }

  if (kinds) for (const t of PubType.options) if (!kinds[t]) errors.push(`content/publication-kinds.json: missing “${t}”`)
  if (experience) dupes("experience.json", "id", experience.map((r) => r.id))
  if (methods) {
    dupes("methods.json", "project id", methods.projects.map((p) => p.id))
    dupes("methods.json", "method id", methods.methods.map((m) => m.id))
    const projectIds = new Set(methods.projects.map((p) => p.id))
    for (const m of methods.methods)
      for (const pid of m.projects)
        if (!projectIds.has(pid)) errors.push(`content/methods.json: method “${m.id}” uses unknown project “${pid}”`)
  }
  if (research) {
    for (const t of research.threads)
      if (research.areas[t.id]?.thread !== t.id)
        errors.push(`content/research.json: thread “${t.id}” needs a matching area with thread “${t.id}”`)
  }

  if (publications) {
    dupes("publications.json", "id", publications.map((p) => p.id))
    dupes("publications.json", "slug", publications.map((p) => p.slug))
    const ids = new Set(publications.map((p) => p.id))
    const methodNames = new Set(methods?.methods.map((m) => m.name) ?? [])
    for (const p of publications) {
      for (const r of p.related) if (!ids.has(r)) errors.push(`content/publications.json: ${p.id} relates to unknown “${r}”`)
      if (research && !research.areas[p.area]) errors.push(`content/publications.json: ${p.id} has unknown area “${p.area}”`)
      if (methods)
        for (const m of p.methods)
          if (!methodNames.has(m)) errors.push(`content/publications.json: ${p.id} lists method “${m}”, which is not in methods.json`)
      if (p.abstract === null) warnings.push(`${p.id}: abstract not provided (placeholder shown)`)
    }
    if (sections) {
      for (const [thread, stage] of Object.entries(sections.research.stages))
        for (const w of stage.works)
          if (w.publication && !ids.has(w.publication))
            errors.push(`content/sections.json: research.stages.${thread} links unknown publication “${w.publication}”`)
    }
  }

  if (sections) {
    const types = sections.publications.filterLabels.map((f) => f.type)
    if (new Set(types).size !== PubType.options.length)
      errors.push("content/sections.json: publications.filterLabels must list each publication type once")
  }

  if (site) for (const p of site.contact.profiles) if (isTodo(p.href)) warnings.push(`Profile link “${p.label}” is still TODO and is hidden in production`)

  if (errors.length || !site || !record || !research || !experience || !methods || !kinds || !publications || !sections)
    return { ok: false, errors, warnings }
  return { ok: true, content: { site, record, research, experience, methods, kinds, publications, sections }, warnings }
}

export { isTodo }
