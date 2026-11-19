import Link from "next/link"

import type { PublicationView } from "@/lib/content"
import { authorList, facts } from "@/lib/publication"
import { CopyButton } from "@/components/site/CopyButton"

/** Breadcrumb, tags, title, authors, venue, actions and "At a glance" (prototype `.dt-head`). */
export function PublicationHeader({ p, apa, canonical }: { p: PublicationView; apa: string; canonical: string }) {
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/publications">Publications</Link>
        <span className="crumb-sep" aria-hidden="true">
          /
        </span>
        <span aria-current="page">{p.kindLabel}</span>
      </nav>

      <div className="dt-head">
        <div className="dt-main">
          <div className="dt-tags">
            <span className={`kind-tag kind-${p.type}`}>{p.kindLabel}</span>
            {p.status ? <span className={`status ${p.statusClass}`}>{p.status}</span> : null}
            {p.year ? <span className="dt-year">{p.year}</span> : null}
          </div>
          <h1 id="dt-title" className="dt-title">
            {p.title}
          </h1>
          <p className="dt-authors">
            {authorList(p).map((a) => (
              <span key={a.name}>
                {a.isMe ? <span className="me">{a.name}</span> : a.name}
                {a.sep}
              </span>
            ))}
          </p>
          <p className="dt-venue">{p.venueLine}</p>
          <div className="dt-actions">
            {p.url ? (
              <a className="btn btn-ink" href={p.url}>
                Read at the publisher
              </a>
            ) : null}
            <CopyButton
              className="btn btn-line"
              text={apa}
              label="Copy citation"
              doneLabel="Citation copied"
              failLabel="Copy blocked; select the text"
            />
            <CopyButton
              className="btn btn-line"
              text={canonical}
              label="Copy link"
              doneLabel="Link copied"
              failLabel="Copy blocked here"
            />
          </div>
        </div>

        <aside className="glance" aria-labelledby="glance-h">
          <h2 id="glance-h" className="glance-h">
            At a glance
          </h2>
          <dl className="facts">
            {facts(p).map((f) => (
              <div className="fact" key={f.k}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
            {p.doi && p.url ? (
              <div className="fact">
                <dt>DOI</dt>
                <dd>
                  <a href={p.url}>{p.doi}</a>
                </dd>
              </div>
            ) : null}
          </dl>
        </aside>
      </div>
    </>
  )
}
