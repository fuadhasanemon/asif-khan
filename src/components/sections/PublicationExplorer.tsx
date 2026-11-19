import { useEffect, type Ref } from "react"
import { AnimatePresence } from "motion/react"

import { requestScrollRefresh } from "@/lib/motion"

import type { PubTypeT } from "@/lib/schemas"
import { CompositionBar, type Segment } from "@/components/viz/CompositionBar"

import { PublicationRow, type PublicationListItem } from "./PublicationList"

export type ExplorerLabels = { searchLabel: string; searchPlaceholder: string }

type Props = {
  items: PublicationListItem[]
  segments: Segment[]
  labels: ExplorerLabels
  filter: PubTypeT | "all"
  query: string
  onPick?: (type: PubTypeT) => void
  onQuery?: (q: string) => void
  onReset?: () => void
  headingLevel?: 2 | 3
  searchRef?: Ref<HTMLInputElement>
}

export function filterItems(items: PublicationListItem[], filter: PubTypeT | "all", query: string) {
  const q = query.trim().toLowerCase()
  return items.filter((p) => (filter === "all" || p.type === filter) && (!q || p.search.includes(q)))
}

/**
 * Publication explorer (prototype `#publications` tools + list), stateless.
 * The same view serves the home section and the /publications page.
 */
export function PublicationExplorerView({
  items,
  segments,
  labels,
  filter,
  query,
  onPick,
  onQuery,
  onReset,
  headingLevel,
  searchRef,
}: Props) {
  const visible = filterItems(items, filter, query)
  const canReset = filter !== "all" || query.trim() !== ""
  // The list height changes with the filter; keep later scroll triggers aligned.
  useEffect(() => requestScrollRefresh(400), [visible.length])
  return (
    <>
      <div className="pub-tools" data-reveal="">
        <div>
          <div className="compo-top">
            <p className="pub-count" aria-live="polite">
              Showing {visible.length} of {items.length}
            </p>
            {canReset ? (
              <button type="button" className="reset" onClick={onReset}>
                Show all
              </button>
            ) : null}
          </div>
          <CompositionBar segments={segments} filter={filter} onPick={onPick} />
        </div>
        <div className="search">
          <label htmlFor="pub-q" className="search-l">
            {labels.searchLabel}
          </label>
          <input
            id="pub-q"
            ref={searchRef}
            type="search"
            placeholder={labels.searchPlaceholder}
            autoComplete="off"
            {...(onQuery ? { value: query, onChange: (e) => onQuery(e.target.value) } : { defaultValue: query })}
          />
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="empty">
          <p>No publications match “{query}” in this view.</p>
          <button type="button" className="btn btn-ink" onClick={onReset}>
            Clear search and filter
          </button>
        </div>
      ) : null}
      <ol className="pubs">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((p) => (
            <PublicationRow key={p.id} p={p} headingLevel={headingLevel} />
          ))}
        </AnimatePresence>
      </ol>
    </>
  )
}
