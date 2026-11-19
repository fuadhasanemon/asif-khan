import { site } from "@/lib/content"
import { OG_SIZE, publicationCard } from "@/lib/og"
import { ME } from "@/lib/schemas"
import { allSlugs, getPublicationBySlug } from "@/lib/slug"

export const alt = `Publication title card from ${new URL(site.domain).host}`
export const size = OG_SIZE
export const contentType = "image/png"

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getPublicationBySlug(slug)
  if (!p) return new Response("Not found", { status: 404 })
  return publicationCard({
    kind: p.kindLabel,
    status: p.status,
    year: p.year,
    title: p.title,
    authorsPre: p.authorsPre,
    authorsPost: p.authorsPost,
    me: ME,
    venue: p.type === "prep" ? null : p.venueLine, // "Manuscript in preparation" would repeat the kind
    domain: new URL(site.domain).host,
  })
}
