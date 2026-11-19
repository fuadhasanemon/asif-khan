/**
 * Typed content for the app. JSON is bundled through static imports, validated
 * once at module load (so a bad file fails the build), and enriched with the
 * derived fields components need. Import from Server Components and pass plain
 * data down to Client Components as props.
 */
import siteJson from "@content/site.json"
import recordJson from "@content/record.json"
import researchJson from "@content/research.json"
import experienceJson from "@content/experience.json"
import methodsJson from "@content/methods.json"
import kindsJson from "@content/publication-kinds.json"
import publicationsJson from "@content/publications.json"
import sectionsJson from "@content/sections.json"

import { bibtexKeys } from "./citations"
import {
  abstractPlaceholder,
  authorParts,
  authorship,
  doiUrl,
  kindMeta,
  statusClass,
  venueLine,
} from "./publication"
import { isTodo, validateContent, type Content, type Publication } from "./schemas"

const result = validateContent({
  site: siteJson,
  record: recordJson,
  research: researchJson,
  experience: experienceJson,
  methods: methodsJson,
  kinds: kindsJson,
  publications: publicationsJson,
  sections: sectionsJson,
})
if (!result.ok) throw new Error(`Content validation failed:\n  - ${result.errors.join("\n  - ")}`)

export const content: Content = result.content
export const { site, record, research, experience, methods, kinds, sections } = content

/** Profile links, minus TODO placeholders in production. */
export const profiles = site.contact.profiles
  .filter((p) => !isTodo(p.href) || process.env.NODE_ENV !== "production")
  .map((p) => ({ ...p, todo: isTodo(p.href) }))

/** A publication plus everything the list, detail page and palette display. */
export type PublicationView = Publication & {
  kindLabel: string
  venueLine: string
  authorsPre: string
  authorsPost: string
  authorship: string
  statusClass: string
  url: string | null
  href: string
  bibtexKey: string
  abstractPlaceholder: string
}

const keys = bibtexKeys(content.publications)

export const publications: PublicationView[] = content.publications.map((p) => {
  const { pre, post } = authorParts(p)
  return {
    ...p,
    kindLabel: kinds[p.type],
    venueLine: venueLine(p),
    authorsPre: pre,
    authorsPost: post,
    authorship: authorship(p),
    statusClass: statusClass(p.status),
    url: p.doi ? doiUrl(p.doi) : null,
    href: `/publications/${p.slug}`,
    bibtexKey: keys.get(p.id)!,
    abstractPlaceholder: abstractPlaceholder(p),
  }
})

export const publicationById = new Map(publications.map((p) => [p.id, p]))
export const publicationBySlug = new Map(publications.map((p) => [p.slug, p]))

export function relatedMeta(p: Publication): string {
  return kindMeta(p, kinds)
}

export const absoluteUrl = (path: string) => new URL(path, site.domain).toString()
