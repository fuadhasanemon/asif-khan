import type { Metadata } from "next"

import { sections } from "@/lib/content"
import { PublicationExplorer } from "@/components/sections/PublicationExplorerClient"
import { publicationListItems, publicationSegments } from "@/components/sections/Publications"
import { SectionHead } from "@/components/sections/SectionHead"

export const metadata: Metadata = {
  title: sections.publications.title,
  description: sections.publications.intro,
  alternates: { canonical: "/publications" },
}

/** Full publication index: the home explorer at full-page size, plus the all-in-one .bib. */
export default function PublicationsPage() {
  const s = sections.publications
  return (
    <section id="publications" className="section first page-top" aria-labelledby="publications-h">
      <div className="wrap">
        <SectionHead id="publications" title={s.title} intro={s.intro} level={1} />
        <PublicationExplorer
          items={publicationListItems()}
          segments={publicationSegments()}
          labels={{ searchLabel: s.searchLabel, searchPlaceholder: s.searchPlaceholder }}
          urlMode="query"
          headingLevel={2}
        />
        <p className="bib-all">
          <a href="/publications.bib" download>
            Download all as BibTeX (.bib)
          </a>
        </p>
      </div>
    </section>
  )
}
