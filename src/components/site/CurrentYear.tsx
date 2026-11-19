"use client"

import { useSyncExternalStore } from "react"

const BUILD_YEAR = process.env.NEXT_PUBLIC_BUILD_YEAR ?? ""
const subscribe = () => () => {}

/**
 * The current year. The prerendered HTML carries the build year (injected by
 * next.config); after hydration the browser's clock wins, so a static build
 * never shows a stale year.
 */
export function CurrentYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => String(new Date().getFullYear()),
    () => BUILD_YEAR,
  )
  return <>{year}</>
}
