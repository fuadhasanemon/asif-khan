import { sections, site } from "@/lib/content"

import { SectionHead } from "./SectionHead"

type Item = { title: string; meta?: string }

function AwardList({ items }: { items: Item[] }) {
  return (
    <ul className="aw-list">
      {items.map((a) => (
        <li key={a.title}>
          <span className="aw-t">{a.title}</span>
          {a.meta ? <span className="aw-m">{a.meta}</span> : null}
        </li>
      ))}
    </ul>
  )
}

/** Grants, awards, and training (prototype `#recognition`). */
export function Recognition() {
  const s = sections.recognition
  return (
    <section id="recognition" className="section" aria-labelledby="recognition-h">
      <div className="wrap">
        <SectionHead id="recognition" title={s.title} />
        <div className="aw-grid">
          <div data-reveal="">
            <h3 className="small-h">{s.awardsHeading}</h3>
            <AwardList items={site.awards} />
          </div>
          <div data-reveal="">
            <h3 className="small-h">{s.certificationsHeading}</h3>
            <AwardList items={site.certifications} />
          </div>
        </div>
      </div>
    </section>
  )
}
