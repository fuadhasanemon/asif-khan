import Link from "next/link"

import { CITE_STYLES, cite } from "@/lib/citations"
import { content, kinds, publications, research, type PublicationView } from "@/lib/content"
import { kindMeta, prevNext, relatedFor } from "@/lib/publication"

import { CiteBox } from "./CiteBox"

/** Abstract, "Where it fits", "Cite this work", related work (prototype `.dt-body`). */
export function PublicationBody({ p }: { p: PublicationView }) {
  const area = research.areas[p.area]
  const related = relatedFor(p, content.publications)
  const citations = {
    apa: cite(p, "apa"),
    chicago: cite(p, "chicago"),
    bibtex: cite(p, "bibtex", p.bibtexKey),
  }

  return (
    <div className="dt-body">
      <section className="dt-sec" aria-labelledby="abs-h">
        <h2 id="abs-h" className="dt-h">
          Abstract
        </h2>
        <div className="dt-content">
          {p.abstract ? <p className="dt-abstract">{p.abstract}</p> : <p className="ph-box">{p.abstractPlaceholder}</p>}
        </div>
      </section>

      <section className="dt-sec" aria-labelledby="fit-h">
        <h2 id="fit-h" className="dt-h">
          Where it fits
        </h2>
        <div className="dt-content fit-grid">
          <div>
            <h3 className="small-h">Research line</h3>
            <p className="fit-v">{area?.name}</p>
            {area?.thread ? (
              <Link className="link-btn" href={`/#research?thread=${area.thread}`}>
                Explore this research line
              </Link>
            ) : null}
          </div>
          <div>
            <h3 className="small-h">Methods</h3>
            {p.methods.length ? (
              <ul className="chips">
                {p.methods.map((m) => (
                  <li className="chip" key={m}>
                    {m}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ph-inline">[Add the methods used in this paper]</p>
            )}
          </div>
          <div>
            <h3 className="small-h">Your role</h3>
            <p className="fit-v">{p.authorship}</p>
          </div>
        </div>
      </section>

      <section className="dt-sec" aria-labelledby="cite-h">
        <h2 id="cite-h" className="dt-h">
          Cite this work
        </h2>
        <div className="dt-content">
          <CiteBox
            citations={citations}
            styles={CITE_STYLES}
            bibHref={`${p.href}/bib`}
            bibFilename={`${p.bibtexKey}.bib`}
          />
        </div>
      </section>

      {related.length ? (
        <section className="dt-sec" aria-labelledby="rel-h">
          <h2 id="rel-h" className="dt-h">
            Related work
          </h2>
          <ul className="dt-content rel">
            {related.map(({ pub, why }) => (
              <li key={pub.id}>
                <Link className="rel-a" href={`/publications/${pub.slug}`}>
                  <span className="rel-k">{why}</span>
                  <span className="rel-t">{pub.title}</span>
                  <span className="rel-m">{kindMeta(pub, kinds)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

/** Previous / next across the full list, wrapping around (prototype `.pager`). */
export function Pager({ p }: { p: PublicationView }) {
  const { prev, next } = prevNext(p, publications)
  return (
    <nav className="pager" aria-label="More publications">
      <Link className="pg" href={`/publications/${prev.slug}`} rel="prev">
        <span className="pg-k">Previous</span>
        <span className="pg-t">{prev.title}</span>
      </Link>
      <Link className="pg pg-next" href={`/publications/${next.slug}`} rel="next">
        <span className="pg-k">Next</span>
        <span className="pg-t">{next.title}</span>
      </Link>
    </nav>
  )
}
