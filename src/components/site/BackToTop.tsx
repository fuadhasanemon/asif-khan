"use client"

import { useEffect, useState } from "react"

/** Shown once the page is scrolled past the hero (prototype: scrollY > 720). */
const THRESHOLD = 720

/**
 * Floating back-to-top button. Scrolls to the top and moves focus to <main>
 * so keyboard users continue from the start of the page, not the bottom.
 */
export function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        setShow(window.scrollY > THRESHOLD)
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  if (!show) return null

  function toTop(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    // Instant, as in the prototype's goTo('top'). (A native smooth scroll can be
    // cut short by ScrollTrigger.refresh(), which restores the scroll position.)
    window.scrollTo(0, 0)
    document.getElementById("main")?.focus({ preventScroll: true })
  }

  return (
    <a href="#main" className="totop" aria-label="Back to top" onClick={toTop}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M10 16V4M4.5 9.5L10 4l5.5 5.5" />
      </svg>
    </a>
  )
}
