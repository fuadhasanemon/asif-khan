"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const SECTION_IDS = ["top", "about", "research", "experience", "skills", "publications", "recognition", "contact"]

/** Prototype mapping: Recognition sits under "Publications" in the nav. */
const NAV_ALIAS: Record<string, string> = { recognition: "publications" }

/**
 * Scroll spy (prototype: IntersectionObserver with rootMargin -45% 0 -50% 0,
 * i.e. the section crossing a thin band just above the middle of the viewport).
 * On /publications pages the "Publications" item stays current, except when
 * the Contact block (shared by every page) is in that band.
 */
export function useActiveSection(): string | null {
  const pathname = usePathname()
  const onHome = pathname === "/"
  const [spied, setSpied] = useState<string | null>(null)

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = e.target.id
          if (!id) continue
          // Clear when the current section leaves the band (e.g. Contact passing
          // through during a route change, before the scroll resets).
          setSpied((cur) => (e.isIntersecting ? id : cur === id ? null : cur))
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => {
      io.disconnect()
      setSpied(null)
    }
  }, [pathname])

  if (!onHome) {
    if (spied === "contact") return "contact"
    return pathname.startsWith("/publications") ? "publications" : null
  }
  return spied ? (NAV_ALIAS[spied] ?? spied) : null
}
