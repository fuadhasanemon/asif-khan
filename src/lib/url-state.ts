/**
 * Shareable UI state in the URL.
 *
 * Home sections keep state in the fragment, after the section id:
 *   /#research?thread=mig
 *   /#publications?type=journal&q=peerj
 * Standalone pages use the query string (/publications?type=journal&q=peerj).
 *
 * A fragment like "#research?thread=mig" no longer matches an element id, so
 * the browser will not scroll to it on its own; `useHashParams` does that.
 */
import type { PubTypeT, ThreadIdT } from "./schemas"

// Plain lists (not the Zod enums) so client bundles do not pull in Zod.
// tests/unit/url-state.test.ts checks they match the schema enums.
export const THREAD_IDS: readonly ThreadIdT[] = ["count", "mig", "ai"]
export const PUB_TYPES: readonly PubTypeT[] = ["journal", "conference", "talk", "review", "prep"]

export type HashState = { id: string; params: URLSearchParams }

export function parseHash(hash: string): HashState {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash
  const q = raw.indexOf("?")
  const id = decodeURIComponent(q < 0 ? raw : raw.slice(0, q))
  const params = new URLSearchParams(q < 0 ? "" : raw.slice(q + 1))
  return { id, params }
}

/** "#publications" or "#publications?type=journal&q=peerj"; empty values are dropped. */
export function buildHash(id: string, params: Record<string, string | null | undefined> = {}): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v)
  const qs = sp.toString()
  return `#${id}${qs ? `?${qs}` : ""}`
}

export function buildQuery(params: Record<string, string | null | undefined>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v)
  const qs = sp.toString()
  return qs ? `?${qs}` : ""
}

export function parseThread(v: string | null): ThreadIdT | null {
  return THREAD_IDS.find((t) => t === v) ?? null
}

export function parseType(v: string | null): PubTypeT | "all" {
  return PUB_TYPES.find((t) => t === v) ?? "all"
}

/** Replace the current URL without scrolling or adding a history entry; keeps Next's history state. */
export function replaceUrl(url: string): void {
  if (typeof window === "undefined") return
  const next = new URL(url, window.location.href)
  if (next.href === window.location.href) return
  window.history.replaceState(window.history.state, "", next.pathname + next.search + next.hash)
}
