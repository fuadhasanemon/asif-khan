import { record, sections, site } from "@/lib/content"

import { SectionHead } from "./SectionHead"

/** About (prototype `#about`): lead, body, and "The record, counted". */
export function About() {
  return (
    <section id="about" className="section first" aria-labelledby="about-h">
      <div className="wrap">
        <SectionHead id="about" title={sections.about.title} />
        <div className="about-grid">
          <div className="body">
            <p className="lead">{site.about.lead}</p>
            {site.about.paragraphs.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
          <aside className="record" aria-labelledby="record-h" data-reveal="" data-count="">
            <h3 id="record-h">{sections.about.recordHeading}</h3>
            <dl className="rec-list">
              {record.map((r) => (
                <div className="rec-row" key={r.label}>
                  {/* Final values are server-rendered; the count-up (step 6) animates toward them. */}
                  <dt className="rec-num" data-count-to={r.value} data-count-decimals={r.decimals}>
                    {r.value.toFixed(r.decimals)}
                  </dt>
                  <dd className="rec-label">{r.label}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  )
}
