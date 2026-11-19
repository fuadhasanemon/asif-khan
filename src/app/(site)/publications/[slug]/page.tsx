import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { apa } from "@/lib/citations"
import { absoluteUrl, site, type PublicationView } from "@/lib/content"
import { allSlugs, getPublicationBySlug } from "@/lib/slug"
import { scholarlyArticleLd } from "@/lib/structured-data"
import { PublicationBody, Pager } from "@/components/publication/PublicationBody"
import { PublicationHeader } from "@/components/publication/PublicationHeader"
import { JsonLd } from "@/components/site/JsonLd"

/** All 18 pages are prerendered. (`dynamicParams` is not available with Cache Components; unknown slugs call notFound().) */
export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }))
}

function description(p: PublicationView): string {
  if (p.abstract) return p.abstract.length > 300 ? `${p.abstract.slice(0, 297).trimEnd()}…` : p.abstract
  return `${p.kindLabel}${p.year ? `, ${p.year}` : ""}. ${p.venueLine}.`
}

/** Highwire Press tags read by Google Scholar, for published work only. */
function scholarTags(p: PublicationView): Record<string, string | string[]> {
  if (p.type !== "journal" && p.type !== "conference") return {}
  const tags: Record<string, string | string[]> = {
    citation_title: p.title,
    citation_author: p.authors,
  }
  if (p.year) tags.citation_publication_date = p.year
  if (p.type === "journal" && p.venue) tags.citation_journal_title = p.venue
  if (p.type === "conference" && p.venue) tags.citation_conference_title = p.venue
  if (p.volume) tags.citation_volume = p.volume
  if (p.issue) tags.citation_issue = p.issue
  const [first, last] = (p.pages ?? "").split("–")
  if (first) tags.citation_firstpage = first
  if (last) tags.citation_lastpage = last
  if (p.publisher) tags.citation_publisher = p.publisher
  if (p.doi) tags.citation_doi = p.doi
  return tags
}

export async function generateMetadata({ params }: PageProps<"/publications/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const p = getPublicationBySlug(slug)
  if (!p) return {}
  const url = absoluteUrl(p.href)
  return {
    title: p.title,
    description: description(p),
    alternates: { canonical: p.href },
    openGraph: {
      type: "article",
      url,
      title: p.title,
      description: description(p),
      siteName: site.name,
      authors: [site.name],
    },
    other: scholarTags(p),
  }
}

export default async function PublicationPage({ params }: PageProps<"/publications/[slug]">) {
  const { slug } = await params
  const p = getPublicationBySlug(slug)
  if (!p) notFound()

  return (
    <article className="detail" id="publication" aria-labelledby="dt-title">
      <JsonLd data={scholarlyArticleLd(p)} />
      <div className="wrap">
        <PublicationHeader p={p} apa={apa(p)} canonical={absoluteUrl(p.href)} />
        <PublicationBody p={p} />
        <Pager p={p} />
      </div>
    </article>
  )
}
