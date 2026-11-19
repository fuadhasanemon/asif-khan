import Link from "next/link"
import type { Ref } from "react"
import { m } from "motion/react"

import type { PubTypeT } from "@/lib/schemas"
import { CopyButton } from "@/components/site/CopyButton"

/** Serializable list row (safe to pass to client components). */
export type PublicationListItem = {
  id: string
  type: PubTypeT
  year: string
  title: string
  href: string
  authorsPre: string
  authorsPost: string
  venueLine: string
  status: string | null
  statusClass: string
  doi: string | null
  url: string | null
  apa: string
  search: string
}

/** One publication row (prototype `.pub`). */
export function PublicationRow({
  p,
  headingLevel = 3,
  ref,
}: {
  p: PublicationListItem
  headingLevel?: 2 | 3
  /** Forwarded so AnimatePresence (popLayout) can measure the row. */
  ref?: Ref<HTMLLIElement>
}) {
  const H = headingLevel === 2 ? "h2" : "h3"
  return (
    <m.li ref={ref} className="pub" layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <span className="pub-year">{p.year}</span>
      <div>
        <H className="pub-title">
          <Link href={p.href}>{p.title}</Link>
        </H>
        <p className="pub-authors">
          {p.authorsPre}
          <strong>Khan, M. A.</strong>
          {p.authorsPost}
        </p>
        <p className="pub-venue">{p.venueLine}</p>
        <div className="pub-foot">
          {p.status ? <span className={`status ${p.statusClass}`}>{p.status}</span> : null}
          {p.doi && p.url ? (
            <a className="doi" href={p.url}>
              doi.org/{p.doi}
            </a>
          ) : null}
          <Link className="details-link" href={p.href} aria-label={`View details: ${p.title}`}>
            View details
          </Link>
          <CopyButton
            className="copy-btn"
            text={p.apa}
            label="Copy citation"
            doneLabel="Citation copied"
            failLabel="Copy blocked here; select the text instead"
            doneClassName="is-done"
          />
        </div>
      </div>
    </m.li>
  )
}
