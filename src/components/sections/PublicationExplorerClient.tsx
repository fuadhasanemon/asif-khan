"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"

import type { PubTypeT } from "@/lib/schemas"
import { buildHash, buildQuery, parseType, replaceUrl } from "@/lib/url-state"
import { useHashParams } from "@/hooks/useHashParams"
import type { Segment } from "@/components/viz/CompositionBar"

import { PublicationExplorerView, type ExplorerLabels } from "./PublicationExplorer"
import type { PublicationListItem } from "./PublicationList"

type Props = {
  items: PublicationListItem[]
  segments: Segment[]
  labels: ExplorerLabels
  /** "hash": home section (/#publications?type=…&q=…). "query": /publications?type=…&q=… */
  urlMode: "hash" | "query"
  headingLevel?: 2 | 3
}

/** Filter + search state for the publication explorer, mirrored in the URL so views can be shared. */
export function PublicationExplorer({ items, segments, labels, urlMode, headingLevel }: Props) {
  const [filter, setFilter] = useState<PubTypeT | "all">("all")
  const [query, setQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  const applyParams = (params: URLSearchParams) => {
    setFilter(parseType(params.get("type")))
    setQuery(params.get("q") ?? "")
  }

  // Home: state lives in the fragment.
  useHashParams(urlMode === "hash" ? "publications" : null, applyParams)

  // /publications: state lives in the query string (read on load and on back/forward).
  const applyQuery = useEffectEvent(() => applyParams(new URLSearchParams(window.location.search)))
  useEffect(() => {
    if (urlMode !== "query") return
    const run = () => applyQuery()
    run()
    window.addEventListener("popstate", run)
    return () => window.removeEventListener("popstate", run)
  }, [urlMode])

  function sync(nextFilter: PubTypeT | "all", nextQuery: string) {
    const params = { type: nextFilter === "all" ? null : nextFilter, q: nextQuery.trim() || null }
    replaceUrl(urlMode === "hash" ? buildHash("publications", params) : `${window.location.pathname}${buildQuery(params)}`)
  }

  function pick(type: PubTypeT) {
    const next = filter === type ? "all" : type
    setFilter(next)
    sync(next, query)
  }

  function search(q: string) {
    setQuery(q)
    sync(filter, q)
  }

  function reset() {
    setFilter("all")
    setQuery("")
    sync("all", "")
    // The button that had focus disappears; keep the user in the explorer.
    searchRef.current?.focus()
  }

  return (
    <PublicationExplorerView
      items={items}
      segments={segments}
      labels={labels}
      filter={filter}
      query={query}
      onPick={pick}
      onQuery={search}
      onReset={reset}
      headingLevel={headingLevel}
      searchRef={searchRef}
    />
  )
}
