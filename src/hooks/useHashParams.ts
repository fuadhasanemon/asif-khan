"use client"

import { useEffect, useEffectEvent } from "react"

import { parseHash } from "@/lib/url-state"

/**
 * Applies "#<sectionId>?key=value" state on mount (first load or arriving from
 * another page) and on every hashchange. When the fragment carries state, the
 * browser cannot match it to an element id, so this also scrolls the section
 * into view, after Next.js has finished its own navigation scroll.
 *
 * Pass `null` to disable (e.g. when the same component keeps its state in the query string).
 */
export function useHashParams(sectionId: string | null, apply: (params: URLSearchParams) => void) {
  const onParams = useEffectEvent(apply)

  useEffect(() => {
    if (!sectionId) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const run = () => {
      const { id, params } = parseHash(window.location.hash)
      if (id !== sectionId) return
      onParams(params)
      if (params.size > 0) {
        clearTimeout(timer)
        timer = setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ block: "start" }), 60)
      }
    }
    run()
    window.addEventListener("hashchange", run)
    return () => {
      window.removeEventListener("hashchange", run)
      clearTimeout(timer)
    }
  }, [sectionId])
}
