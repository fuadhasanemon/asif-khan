"use client"

import { useEffect } from "react"

/**
 * Marks the hero entrance as played when the hero unmounts (leaving the home
 * page), so the CSS entrance does not replay on a client-side return.
 * Setting it on unmount, not mount, never interrupts the first entrance.
 */
export function HeroPlayedFlag() {
  useEffect(() => () => document.documentElement.setAttribute("data-hero-played", ""), [])
  return null
}
