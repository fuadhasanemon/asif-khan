/**
 * schema.org JSON-LD: `Person` on the home page, `ScholarlyArticle` on each
 * publication page. Built only from content/*.json.
 */
import { absoluteUrl, profiles, site, type PublicationView } from "./content"
import { ME } from "./schemas"

const ORCID = profiles.find((p) => p.label === "ORCID" && !p.todo)?.href

/** "Khan, M. A." → "M. A. Khan" */
export const displayName = (apaName: string) => {
  const i = apaName.indexOf(", ")
  return i < 0 ? apaName : `${apaName.slice(i + 2)} ${apaName.slice(0, i)}`
}

/** Institution part of "Western Illinois University, USA". */
const institution = (s: string) => s.replace(/,\s*[^,]+$/, "")

/** "Waukegan, Illinois, USA" → locality / region / country, taken verbatim from content. */
function postalAddress(location: string) {
  const [locality, region, country] = location.split(",").map((s) => s.trim())
  return { "@type": "PostalAddress", addressLocality: locality, addressRegion: region, addressCountry: country }
}

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${site.domain}/#person`,
    name: site.name,
    url: site.domain,
    jobTitle: site.role,
    description: site.heroStatement,
    email: `mailto:${site.contact.email}`,
    address: postalAddress(site.contact.location),
    alumniOf: site.education.map((e) => ({ "@type": "CollegeOrUniversity", name: institution(e.institution) })),
    sameAs: profiles.filter((p) => !p.todo).map((p) => p.href),
  }
}

export function scholarlyArticleLd(p: PublicationView) {
  const url = absoluteUrl(p.href)
  const authors = p.authors.map((a) =>
    a === ME
      ? { "@type": "Person", "@id": `${site.domain}/#person`, name: site.name, ...(ORCID ? { sameAs: ORCID } : {}) }
      : { "@type": "Person", name: displayName(a) },
  )

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "@id": url,
    url,
    headline: p.title,
    name: p.title,
    author: authors,
    genre: p.kindLabel,
    mainEntityOfPage: url,
  }
  if (p.year) ld.datePublished = p.year
  if (p.status) ld.creativeWorkStatus = p.status
  if (p.abstract) ld.abstract = p.abstract
  if (p.publisher) ld.publisher = { "@type": "Organization", name: p.publisher }
  if (p.doi) {
    ld.identifier = { "@type": "PropertyValue", propertyID: "DOI", value: p.doi }
    ld.sameAs = p.url
  }
  if (p.pages) ld.pagination = p.pages

  if (p.type === "journal") {
    const periodical = { "@type": "Periodical", name: p.venue }
    const volume = { "@type": "PublicationVolume", volumeNumber: p.volume, isPartOf: periodical }
    ld.isPartOf = p.issue ? { "@type": "PublicationIssue", issueNumber: p.issue, isPartOf: volume } : volume
  } else if (p.type === "conference") {
    ld.isPartOf = { "@type": "Book", name: p.venue }
  } else if (p.type === "talk") {
    ld.publication = { "@type": "PublicationEvent", name: p.venue, location: { "@type": "Place", name: p.place } }
  }
  return ld
}
