"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

const HeroField = dynamic(() => import("./HeroField"), { ssr: false })

type Field = { width: number; height: number; reduced: boolean }

/**
 * Loads the particle field after the page is idle, behind the static Ledger
 * background, so the hero name stays the LCP element and the particle code
 * never competes with hydration. The particle count comes from the hero's
 * size at that moment (area / 14 000, clamped 18–110).
 */
export function HeroFieldLoader() {
  const ref = useRef<HTMLDivElement>(null)
  const [field, setField] = useState<Field | null>(null)

  useEffect(() => {
    const go = () => {
      const el = ref.current
      if (!el) return
      const { width, height } = el.getBoundingClientRect()
      setField({ width, height, reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches })
    }
    // Load at idle, or on the first scroll, whichever comes first: the hero's
    // scroll scene needs the field as soon as the visitor starts scrolling.
    let done = false
    const once = () => {
      if (done) return
      done = true
      go()
    }
    window.addEventListener("scroll", once, { passive: true, once: true })
    let cancel: () => void
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(once, { timeout: 2500 })
      cancel = () => window.cancelIdleCallback(id)
    } else {
      const t = setTimeout(once, 1200)
      cancel = () => clearTimeout(t)
    }
    return () => {
      cancel()
      window.removeEventListener("scroll", once)
    }
  }, [])

  return (
    <div ref={ref} className="particles" aria-hidden="true">
      {field ? <HeroField {...field} /> : null}
    </div>
  )
}
