"use client"

/**
 * Shared motion setup (PLAN.md §4, animation ownership).
 *
 * GSAP owns one-shot entrances and scroll-linked work; Framer Motion owns
 * state-driven UI transitions. They never animate the same node.
 *
 * Every GSAP entrance is gated by `motionReady()`: the pre-paint script sets
 * html[data-motion-ready] only when JavaScript runs and reduced motion is
 * off, and the 1.5 s failsafe removes it if this layer never claims it.
 * Without the flag nothing starts hidden and nothing here animates.
 */
import { gsap } from "gsap"
import { CustomEase } from "gsap/CustomEase"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

let registered = false
export function registerGsap() {
  if (registered || typeof window === "undefined") return
  gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP)
  // The prototype's curves, so GSAP timing matches the CSS it replaces.
  CustomEase.create("site", ".2,.7,.2,1")
  CustomEase.create("mask", ".2,.75,.1,1")
  CustomEase.create("pop", ".3,1.6,.5,1")
  CustomEase.create("draw", ".4,0,.2,1")
  registered = true
}

declare global {
  interface Window {
    __motionClaimed?: boolean
    __motionArmed?: boolean
    __motionFailsafe?: ReturnType<typeof setTimeout>
  }
}

/**
 * Claim the pre-paint flag so the 1.5 s failsafe does not release it. Called
 * when the motion module is evaluated: the failsafe exists for the case where
 * JavaScript never runs, and module evaluation is the earliest proof that it does.
 */
export function claimMotion() {
  if (typeof window === "undefined") return
  if (document.documentElement.hasAttribute("data-motion-ready")) {
    window.__motionClaimed = true
    clearTimeout(window.__motionFailsafe)
  }
}

export const motionReady = () =>
  typeof document !== "undefined" && document.documentElement.hasAttribute("data-motion-ready")

/** Mark an element as revealed: removes its CSS "start hidden" state for good. */
export const markShown = (el: Element) => el.setAttribute("data-shown", "")

/** Reveal start: roughly the prototype's IntersectionObserver threshold of 0.12. */
export const REVEAL_START = "top 88%"

let refreshTimer: ReturnType<typeof setTimeout> | undefined
/** Debounced ScrollTrigger.refresh() after layout changes (filtering, accordions, route changes). */
export function requestScrollRefresh(delay = 150) {
  if (typeof window === "undefined") return
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), delay)
}

/**
 * Research diagram entrance (bars grow, routes draw, the dashed marker fades
 * in). Used on first reveal and on every thread switch. Animates attributes
 * and stroke offsets rather than SVG transforms, so no CSS transform can
 * fight GSAP's SVG transform handling.
 */
export function animateDiagram(svg: SVGSVGElement | null): gsap.core.Timeline | null {
  if (!svg || !motionReady()) return null
  const bars = svg.querySelectorAll<SVGRectElement>(".a-bar")
  const draws = svg.querySelectorAll<SVGPathElement>(".a-draw")
  const fades = svg.querySelectorAll<SVGElement>(".a-fade")
  const tl = gsap.timeline()
  bars.forEach((bar, i) => {
    const w = Number(bar.dataset.w ?? bar.getAttribute("width"))
    bar.dataset.w = String(w)
    tl.fromTo(bar, { attr: { width: 0 } }, { attr: { width: w }, duration: 1.2, ease: "site" }, 0.1 + i * 0.15)
  })
  draws.forEach((path, i) => {
    tl.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: "draw" }, i * 0.2)
  })
  if (fades.length) tl.fromTo(fades, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "none" }, 1.3)
  return tl
}


export { gsap, ScrollTrigger, useGSAP }
