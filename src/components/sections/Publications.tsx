import { apa } from "@/lib/citations"
import { publications, sections } from "@/lib/content"
import { searchText } from "@/lib/publication"
import type { Segment } from "@/components/viz/CompositionBar"

import { PublicationExplorerView } from "./PublicationExplorer"
import type { PublicationListItem } from "./PublicationList"
import { SectionHead } from "./SectionHead"

export function publicationListItems(): PublicationListItem[] {
  return publications.map((p) => ({
    id: p.id,
    type: p.type,
    year: p.year ?? "",
    title: p.title,
    href: p.href,
    authorsPre: p.authorsPre,
    authorsPost: p.authorsPost,
    venueLine: p.venueLine,
    status: p.status,
    statusClass: p.statusClass,
    doi: p.doi,
    url: p.url,
    apa: apa(p),
    search: searchText(p),
  }))
}

export function publicationSegments(): Segment[] {
  return sections.publications.filterLabels.map((f) => ({
    type: f.type,
    label: f.label,
    n: publications.filter((p) => p.type === f.type).length,
  }))
}

/** Publications (prototype `#publications`). */
export function Publications() {
  const s = sections.publications
  return (
    <section id="publications" className="section" aria-labelledby="publications-h">
      <div className="wrap">
        <SectionHead id="publications" title={s.title} intro={s.intro} />
        <PublicationExplorerView
          items={publicationListItems()}
          segments={publicationSegments()}
          labels={{ searchLabel: s.searchLabel, searchPlaceholder: s.searchPlaceholder }}
          filter="all"
          query=""
        />
      </div>
    </section>
  )
}
