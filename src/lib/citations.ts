/**
 * Citation formatter: APA 7, Chicago author-date and BibTeX.
 * A faithful port of the prototype's cite() (design/Main.dc.html); the tests in
 * tests/unit/citations.test.ts run the prototype's own code and compare outputs.
 * The one intentional difference is BibTeX key de-duplication (see bibtexKeys).
 */
import type { Publication } from "./schemas"

export type CiteStyle = "apa" | "chicago" | "bibtex"

export const CITE_STYLES: { id: CiteStyle; label: string }[] = [
  { id: "apa", label: "APA 7" },
  { id: "chicago", label: "Chicago" },
  { id: "bibtex", label: "BibTeX" },
]

const doiLink = (p: Publication) => (p.doi ? `https://doi.org/${p.doi}` : "")
const yearOrStatus = (p: Publication) => p.year ?? (p.type === "review" ? "under review" : "in preparation")

function apaAuthors(list: string[]): string {
  if (list.length === 1) return list[0]!
  return `${list.slice(0, -1).join(", ")}, & ${list[list.length - 1]}`
}

/** "Khan, M. A." → "M. A. Khan" (Chicago names every author after the first this way). */
function flip(name: string): string {
  const i = name.indexOf(", ")
  return i < 0 ? name : `${name.slice(i + 2)} ${name.slice(0, i)}`
}

function chicagoAuthors(list: string[]): string {
  const out = list.map((n, i) => (i === 0 ? n : flip(n)))
  if (out.length === 1) return out[0]!
  if (out.length === 2) return `${out[0]}, and ${out[1]}`
  return `${out.slice(0, -1).join(", ")}, and ${out[out.length - 1]}`
}

export function apa(p: Publication): string {
  const head = `${apaAuthors(p.authors)} (${yearOrStatus(p)}). ${p.title}`
  const doi = doiLink(p)
  switch (p.type) {
    case "journal":
      return `${head}. ${p.venue}, ${p.volume}${p.issue ? `(${p.issue})` : ""}, ${p.pages ?? p.article}. ${doi}`
    case "conference":
      return `${head}. In ${p.venue} (pp. ${p.pages}). ${p.publisher}. ${doi}`
    case "talk":
      return `${head} [Paper presentation]. ${p.venue}, ${p.place}.${doi ? ` ${doi}` : ""}`
    case "review":
      return `${head} [Manuscript submitted for publication].`
    case "prep":
      return `${head} [Manuscript in preparation].`
  }
}

export function chicago(p: Publication): string {
  const yr = yearOrStatus(p)
  const names = chicagoAuthors(p.authors)
  // Fix over the prototype: a sole author ("Khan, M. A.") already ends with a
  // period, and the prototype appended another ("Khan, M. A.. 2027.").
  const sep = names.endsWith(".") ? " " : ". "
  const head = `${names}${sep}${p.year ?? yr.charAt(0).toUpperCase() + yr.slice(1)}. “${p.title}.”`
  const doi = doiLink(p)
  switch (p.type) {
    case "journal":
      return `${head} ${p.venue} ${p.volume}${p.issue ? ` (${p.issue})` : ""}: ${p.pages ?? p.article}. ${doi}.`
    case "conference":
      return `${head} In ${p.venue}, ${p.pages}. ${p.publisher}. ${doi}.`
    case "talk":
      return `${head} Paper presented at the ${p.venue}, ${p.place}, ${p.dates}.`
    case "review":
      return `${head} Manuscript under review.`
    case "prep":
      return `${head} Manuscript in preparation.`
  }
}

/** The prototype's key: first author's surname + year (or "nd") + first word of 4+ letters. */
export function baseBibtexKey(p: Publication): string {
  const first = (p.authors[0] ?? "").split(",")[0]!.toLowerCase().replace(/[^a-z]/g, "")
  const word = p.title.toLowerCase().match(/[a-z]{4,}/)?.[0] ?? "work"
  return `${first}${p.year ?? "nd"}${word}`
}

/**
 * Unique keys across the whole list. The prototype gives two entries the same
 * key (the 2025 flood paper and its presentation: both `chowdhury2025flood`),
 * which breaks a combined .bib file. Later duplicates get b, c, … suffixes.
 */
export function bibtexKeys(all: Publication[]): Map<string, string> {
  const seen = new Map<string, number>()
  const keys = new Map<string, string>()
  for (const p of all) {
    const base = baseBibtexKey(p)
    const n = seen.get(base) ?? 0
    seen.set(base, n + 1)
    keys.set(p.id, n === 0 ? base : base + String.fromCharCode(97 + n))
  }
  return keys
}

export function bibtex(p: Publication, key: string = baseBibtexKey(p)): string {
  const type = p.type === "journal" ? "article" : p.type === "conference" || p.type === "talk" ? "inproceedings" : "unpublished"
  const f: [string, string][] = [
    ["author", p.authors.join(" and ")],
    ["title", p.title.replace(/’/g, "'")],
  ]
  if (p.type === "journal") f.push(["journal", p.venue ?? ""], ["volume", p.volume ?? ""])
  if (p.issue) f.push(["number", p.issue])
  const pages = p.pages ?? p.article
  if (pages) f.push(["pages", pages.replace("–", "--")])
  if (p.type === "conference" || p.type === "talk") f.push(["booktitle", p.venue ?? ""])
  if (p.publisher && p.type !== "review") f.push(["publisher", p.publisher])
  if (p.type === "review" || p.type === "prep")
    f.push(["note", p.type === "review" ? "Manuscript under review" : "Manuscript in preparation"])
  if (p.year) f.push(["year", p.year])
  if (p.doi) f.push(["doi", p.doi])
  return `@${type}{${key},\n${f.map(([k, v]) => `  ${k} = {${v}}`).join(",\n")}\n}`
}

export function cite(p: Publication, style: CiteStyle, key?: string): string {
  if (style === "apa") return apa(p)
  if (style === "chicago") return chicago(p)
  return bibtex(p, key)
}

/** A complete .bib file for a list of publications, with unique keys. */
export function bibFile(all: Publication[], only?: Publication[]): string {
  const keys = bibtexKeys(all)
  return (only ?? all).map((p) => bibtex(p, keys.get(p.id))).join("\n\n") + "\n"
}
