/**
 * Content files the admin panel can edit, with the hints its form editor
 * needs: friendly titles, which empty fields mean "none" (null), and fields
 * that should be picked from a list.
 */
import type { RawContent } from "../schemas"

export type FileKey = keyof RawContent

export type FileSpec = {
  key: FileKey
  file: string
  title: string
  description: string
}

export const FILES: FileSpec[] = [
  { key: "publications", file: "publications.json", title: "Publications", description: "Papers, presentations and manuscripts. Each has its own page." },
  { key: "site", file: "site.json", title: "Profile and contact", description: "Name, hero text, about, education, skills, awards, contact and profile links." },
  { key: "sections", file: "sections.json", title: "Sections and order", description: "Home section order, section titles and intros, and the research line stages." },
  { key: "research", file: "research.json", title: "Research lines", description: "The three research lines and the research areas papers belong to." },
  { key: "experience", file: "experience.json", title: "Experience", description: "Roles on the career chart and timeline." },
  { key: "methods", file: "methods.json", title: "Methods", description: "The methods × projects matrix." },
  { key: "record", file: "record.json", title: "The record, counted", description: "The numbers in the About section." },
  { key: "kinds", file: "publication-kinds.json", title: "Publication type labels", description: "How each publication type is named on its page." },
]

export const fileSpec = (key: string) => FILES.find((f) => f.key === key)

/** Fields where an empty value means "none" and is saved as null. */
export const NULLABLE_FIELDS = new Set([
  "year",
  "venue",
  "volume",
  "issue",
  "pages",
  "article",
  "publisher",
  "place",
  "dates",
  "doi",
  "status",
  "abstract",
  "note",
  "publication",
])

export const PUB_TYPES = ["journal", "conference", "talk", "review", "prep"]
export const PUB_STATUSES = ["Accepted", "Under review", "In preparation"]
export const ROLE_KINDS = ["Leadership", "Teaching", "Service", "Research"]
export const THREADS = ["count", "mig", "ai"]
export const HOME_SECTIONS = ["publications", "research", "about", "experience", "skills", "recognition"]

/** Choice lists by field name (per file); `areas` is filled in from research.json at runtime. */
export function choicesFor(file: FileKey, field: string, areas: string[]): string[] | null {
  if (file === "publications") {
    if (field === "type") return PUB_TYPES
    if (field === "status") return PUB_STATUSES
    if (field === "area") return areas
  }
  if (file === "experience" && field === "kind") return ROLE_KINDS
  if (file === "research" && (field === "id" || field === "thread")) return THREADS
  if (file === "sections" && field === "homeOrder") return HOME_SECTIONS
  return null
}

/** Short help shown under specific fields. */
export const FIELD_HELP: Record<string, string> = {
  abstract: "Leave empty to show the placeholder box.",
  slug: "The page address: /publications/<slug>. Lowercase words joined by hyphens; must be unique.",
  id: "Internal id. Must be unique (publications use p0, p1, …).",
  related: "Ids of related publications, e.g. p15.",
  methods: "Method names exactly as listed in Methods.",
  doi: "Without https://doi.org/, e.g. 10.7717/peerj-cs.3806",
  href: "Full URL. Links starting with TODO are hidden on the live site.",
  homeOrder: "The order of sections on the home page (the nav follows it).",
  start: "Year as a decimal: 2025.25 is April 2025.",
  end: "Year as a decimal: 2025.9 is late November 2025.",
  authors: "One author per line, as “Surname, I. I.”. Your name must be exactly “Khan, M. A.”.",
  publication: "Id of the publication this links to (e.g. p15), or empty for no link.",
}
