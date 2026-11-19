/**
 * Derived publication values, ported from the prototype (design/Main.dc.html):
 * VENUE(), the pre/post author split in data(), and detailVals().
 * Pure functions over the JSON shape; no React, no I/O.
 */
import { ME, type Kinds, type Publication } from "./schemas"

/** Prototype `p.pre` / `p.post`: the author list split around my name. */
export function authorParts(p: Publication): { pre: string; post: string } {
  const k = p.authors.indexOf(ME)
  const n = p.authors.length
  const pre = p.authors.slice(0, k).join(", ") + (k > 0 ? (k === n - 1 ? ", & " : ", ") : "")
  const rest = p.authors.slice(k + 1)
  const last = rest[rest.length - 1]
  const post = rest.length
    ? rest.length === 1
      ? `, & ${rest[0]}`
      : `, ${rest.slice(0, -1).join(", ")}, & ${last}`
    : ""
  return { pre, post }
}

/** Detail-page author list with separators and the highlight flag. */
export function authorList(p: Publication): { name: string; isMe: boolean; sep: string }[] {
  const n = p.authors.length
  return p.authors.map((name, i) => ({
    name,
    isMe: name === ME,
    sep: i < n - 2 ? ", " : i === n - 2 ? ", & " : "",
  }))
}

/** Prototype VENUE(): the one-line venue shown under each title. */
export function venueLine(p: Publication): string {
  switch (p.type) {
    case "journal":
      return `${p.venue}, ${p.volume}${p.issue ? `(${p.issue})` : ""}, ${p.pages ?? p.article}`
    case "conference":
      return `${p.venue}, ${p.pages}`
    case "talk":
      return `${p.venue}, ${p.place}, ${p.dates}`
    case "review":
      return `${p.venue}${p.publisher ? ` (${p.publisher})` : ""}`
    case "prep":
      return "Manuscript in preparation"
  }
}

const ORDINAL = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth"]
const CARDINAL = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"]

/** "Sole author" or "Third of six authors", computed from the author list. */
export function authorship(p: Publication): string {
  const n = p.authors.length
  const k = p.authors.indexOf(ME)
  if (n === 1) return "Sole author"
  const ord = ORDINAL[k] ?? `Author ${k + 1}`
  const cnt = CARDINAL[n] ?? String(n)
  return `${ord} of ${cnt} authors`
}

export type Fact = { k: string; v: string }

/** "At a glance" facts (prototype detailVals → facts). DOI is rendered separately as a link. */
export function facts(p: Publication): Fact[] {
  const out: Fact[] = []
  if (p.type === "journal")
    out.push(
      { k: "Journal", v: p.venue ?? "" },
      { k: "Volume and issue", v: `Volume ${p.volume}${p.issue ? `, issue ${p.issue}` : ""}` },
      { k: p.pages ? "Pages" : "Article", v: p.pages ?? p.article ?? "" },
    )
  if (p.type === "conference") out.push({ k: "Proceedings", v: p.venue ?? "" }, { k: "Pages", v: p.pages ?? "" })
  if (p.type === "talk")
    out.push({ k: "Conference", v: p.venue ?? "" }, { k: "Place", v: p.place ?? "" }, { k: "Dates", v: p.dates ?? "" })
  if (p.type === "review") out.push({ k: "Submitted to", v: p.venue ?? "" })
  out.push({ k: "Year", v: p.year ?? p.status ?? "" })
  if (p.publisher) out.push({ k: "Publisher", v: p.publisher })
  out.push({ k: "Authorship", v: authorship(p) })
  return out
}

/** Placeholder wording per type when `abstract` is null (prototype abstractPh). */
export function abstractPlaceholder(p: Publication): string {
  if (p.type === "review" || p.type === "prep") return "[Optional: a short summary you are comfortable sharing before publication]"
  if (p.type === "talk") return "[Paste the abstract submitted to the conference]"
  return "[Paste the abstract from the published version]"
}

export type Related = { pub: Publication; why: string }

/** Explicit `related` first (labelled by type), then same research line, up to three. */
export function relatedFor(p: Publication, all: Publication[]): Related[] {
  const rel: Related[] = []
  for (const rid of p.related) {
    const r = all.find((x) => x.id === rid)
    if (!r) continue
    const why =
      r.type === "talk"
        ? "Also presented as"
        : r.type === "prep"
          ? "Manuscript version"
          : r.type === "conference"
            ? "Published in proceedings"
            : "Related manuscript"
    rel.push({ pub: r, why })
  }
  for (const x of all) {
    if (rel.length >= 3 || x.id === p.id || x.area !== p.area || x.title === p.title) continue
    if (rel.some((y) => y.pub.id === x.id || y.pub.title === x.title)) continue
    rel.push({ pub: x, why: "Same research line" })
  }
  return rel
}

/** Previous and next in list order, wrapping around. */
export function prevNext(p: Publication, all: Publication[]): { prev: Publication; next: Publication } {
  const i = Math.max(0, all.findIndex((x) => x.id === p.id))
  const n = all.length
  return { prev: all[(i - 1 + n) % n]!, next: all[(i + 1) % n]! }
}

/** "Journal article, 2026" style meta used in related-work rows. */
export function kindMeta(p: Publication, kinds: Kinds): string {
  return kinds[p.type] + (p.year ? `, ${p.year}` : "")
}

export function statusClass(status: Publication["status"]): string {
  if (status === "Accepted") return "st-accepted"
  if (status === "Under review") return "st-review"
  if (status === "In preparation") return "st-prep"
  return ""
}

export const doiUrl = (doi: string) => `https://doi.org/${doi}`

/** Lower-cased text the publication search matches against (title, coauthors, venue). */
export function searchText(p: Publication): string {
  const { pre, post } = authorParts(p)
  return `${p.title} ${pre} ${post} ${venueLine(p)}`.toLowerCase()
}

export function matchesQuery(p: Publication, query: string): boolean {
  const q = query.trim().toLowerCase()
  return !q || searchText(p).includes(q)
}
