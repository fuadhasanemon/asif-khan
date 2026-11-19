"use client"

import { useRef } from "react"

import { GATE_AT, NAME_GAP, REGION, formation } from "@/components/viz/hero-field/formation"
import { ScrollTrigger, gsap, motionReady, registerGsap, useGSAP } from "@/lib/motion"

registerGsap()

/** One-word captions for the three beats, from the statement "count, classify, and admit". */
const BEATS = ["Counted", "Classified", "Admitted"] as const

/** Wide desktop (the 1240 px content width), motion allowed: the only conditions under which the hero pins. Narrower, the region beside the name is too tight. */
const SCENE_MEDIA = "(min-width: 1240px) and (prefers-reduced-motion: no-preference)"

/**
 * The hero's signature scroll scene (desktop only). Pins the hero for one
 * screen of scroll (reserved in CSS by `.scene-spacer`, see Hero) and drives `formation.progress`, which the particle field
 * reads every frame; scrubs the caption and the "admitted" gate line in step.
 * On mobile, with reduced motion, or without JS, nothing pins and the hero is
 * exactly as before.
 */
export function HeroScene() {
  const overlay = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(SCENE_MEDIA, () => {
        if (!motionReady()) return
        const hero = document.getElementById("top")
        const root = overlay.current
        if (!hero || !root) return

        // Start the scene region clear of the name (re-measured on every refresh).
        const measure = () => {
          const name = document.getElementById("hero-name")?.querySelector(".mask:last-child")
          const h = hero.getBoundingClientRect()
          const right = name ? name.getBoundingClientRect().right - h.left : 0
          formation.x0 = Math.min(0.8, Math.max(REGION.x0, (right + NAME_GAP) / h.width))
          root.style.setProperty("--x0", String(formation.x0))
        }
        measure()

        const captions = root.querySelectorAll<HTMLElement>("[data-beat]")
        const gate = root.querySelector<HTMLElement>("[data-gate]")
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: hero,
            // Flush under the sticky header when the hero fits the viewport;
            // otherwise once its bottom (the "Upcoming" strip) is in view.
            start: () => {
              const header = document.querySelector<HTMLElement>(".nav")?.offsetHeight ?? 0
              return hero.offsetHeight + header <= window.innerHeight ? `top ${header}px` : "bottom bottom"
            },
            end: "+=100%",
            pin: true,
            scrub: 0.6,
            refreshPriority: 1, // measure the pin before every trigger below it
            invalidateOnRefresh: true,
            onRefresh: measure,
          },
          onUpdate: () => {
            formation.progress = tl.progress()
          },
        })
        // Timeline time == scroll progress (0–1), matching formation.ts windows.
        tl.set({}, {}, 1)
        tl.fromTo(captions[0]!, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.1 }, 0.2)
          .to(captions[0]!, { opacity: 0, y: -8, duration: 0.06 }, 0.38)
          .fromTo(captions[1]!, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.1 }, 0.52)
          .to(captions[1]!, { opacity: 0, y: -8, duration: 0.06 }, 0.7)
          .fromTo(captions[2]!, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.1 }, 0.84)
        if (gate) tl.fromTo(gate, { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.12 }, 0.66)

        // Swap the CSS-reserved spacer for GSAP's own pin spacing (both exactly
        // one viewport) in the same frame, then re-measure every trigger.
        // Nothing below the hero moves.
        const html = document.documentElement
        html.setAttribute("data-scene-pinned", "")
        ScrollTrigger.refresh()

        return () => {
          formation.progress = 0
          formation.x0 = REGION.x0
          html.removeAttribute("data-scene-pinned")
        }
      })
      return () => mm.revert()
    },
    { scope: overlay },
  )

  return (
    <div ref={overlay} className="scene" aria-hidden="true" style={{ "--x0": REGION.x0 } as React.CSSProperties}>
      <span
        className="scene-gate"
        data-gate=""
        style={{
          // --x0 is set by measure(); the gate sits GATE_AT across the region.
          left: `calc((var(--x0) + (${REGION.x1} - var(--x0)) * ${GATE_AT}) * 100%)`,
          top: `${(REGION.y0 - 0.04) * 100}%`,
          height: `${(REGION.y1 - REGION.y0 + 0.08) * 100}%`,
        }}
      />
      <span className="scene-caption" style={{ left: "calc(var(--x0) * 100%)", top: `${(REGION.y1 + 0.06) * 100}%` }}>
        {BEATS.map((b) => (
          <span key={b} data-beat="">
            {b}
          </span>
        ))}
      </span>
    </div>
  )
}
