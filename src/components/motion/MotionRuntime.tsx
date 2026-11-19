"use client"

import { usePathname } from "next/navigation"
import { useLayoutEffect } from "react"

import {
  REVEAL_START,
  claimMotion,
  ScrollTrigger,
  animateDiagram,
  gsap,
  markShown,
  motionReady,
  registerGsap,
  useGSAP,
} from "@/lib/motion"

registerGsap()
claimMotion()

const delayOf = (el: Element, fallback = 0) => Number((el as HTMLElement).dataset.delay ?? fallback)

/** Extra entrance work for specific revealed containers. */
function revealExtras(el: Element) {
  if (el.classList.contains("sec-head")) {
    gsap.fromTo(el.querySelector(".sec-rule"), { scaleX: 0 }, { scaleX: 1, duration: 1, delay: 0.2, ease: "site", clearProps: "transform" })
  }
  if (el.classList.contains("chart")) {
    el.querySelectorAll(".chart-bar").forEach((bar) => {
      gsap.fromTo(
        bar.querySelector(".chart-fill"),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, delay: delayOf(bar), ease: "site", clearProps: "transform" },
      )
    })
  }
  if (el.classList.contains("matrix-box")) {
    el.querySelectorAll(".dot").forEach((dot) => {
      gsap.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.35, delay: delayOf(dot), ease: "pop", clearProps: "transform" })
    })
  }
  if (el.classList.contains("pub-tools")) {
    el.querySelectorAll(".seg-bar").forEach((bar) => {
      gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.9, delay: delayOf(bar), ease: "site", clearProps: "transform" })
    })
  }
  if (el.classList.contains("rmap")) {
    animateDiagram(el.querySelector<SVGSVGElement>(".stage-art svg"))
  }
}

/**
 * Site-wide GSAP layer: claims the motion flag, runs scroll reveals and the
 * reading-progress scrub, and keeps ScrollTrigger in sync with fonts and routes.
 *
 * It never writes text that React rendered (that can run before a section has
 * hydrated and trigger a hydration text mismatch, React #418). It only sets
 * inline styles, SVG geometry during the diagram entrance, and the data-shown
 * marker. Count-ups live in CountUp, which runs after its own hydration.
 */
export function MotionRuntime() {
  const pathname = usePathname()

  // In development, Strict Mode's remount strips <html> attributes; re-apply the
  // flag if the pre-paint script armed it and the failsafe has not released it.
  useLayoutEffect(() => {
    const html = document.documentElement
    if (window.__motionArmed && !html.hasAttribute("data-motion-fallback")) html.setAttribute("data-motion-ready", "")
    claimMotion()
  }, [])

  useGSAP(
    () => {
      // Reading progress: position feedback, so it tracks scroll even with reduced motion.
      const bar = document.querySelector("[data-progress]")
      if (bar) {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true, invalidateOnRefresh: true } },
        )
      }

      if (!motionReady()) return


      ScrollTrigger.batch("[data-reveal]:not([data-shown])", {
        start: REVEAL_START,
        once: true,
        onEnter: (batch) => {
          batch.forEach((el, i) => {
            markShown(el)
            gsap.fromTo(
              el,
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.7, delay: i * 0.08, ease: "site", clearProps: "opacity,transform" },
            )
            revealExtras(el)
          })
        },
      })
    },
    { dependencies: [pathname], revertOnUpdate: true },
  )

  // Positions depend on web-font metrics and on the page; refresh when either settles.
  useLayoutEffect(() => {
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh()
    })
    return () => {
      cancelled = true
    }
  }, [pathname])

  return null
}
