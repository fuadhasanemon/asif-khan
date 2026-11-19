import { bibFile } from "@/lib/citations"
import { content } from "@/lib/content"
import { allSlugs, getPublicationBySlug } from "@/lib/slug"

/** One .bib file per paper, prerendered at build time. */
export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }))
}

export async function GET(_req: Request, ctx: RouteContext<"/publications/[slug]/bib">) {
  const { slug } = await ctx.params
  const p = getPublicationBySlug(slug)
  if (!p) return new Response("Not found", { status: 404 })
  return new Response(bibFile(content.publications, [p]), {
    headers: {
      "Content-Type": "application/x-bibtex; charset=utf-8",
      "Content-Disposition": `attachment; filename="${p.bibtexKey}.bib"`,
    },
  })
}
