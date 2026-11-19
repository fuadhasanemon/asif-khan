"use client"

import { useLayoutEffect, useRef } from "react"

import { animateDiagram } from "@/lib/motion"
import type { ThreadIdT } from "@/lib/schemas"

/**
 * Research-line diagrams, ported from the prototype SVGs.
 * - `.a-bar`, `.a-draw`, `.a-fade`: one-shot entrance (GSAP in the motion step).
 * - `.loop-only` groups hold the continuous loops (SMIL / CSS keyframes);
 *   moving dots stay hidden until their motion begins (the prototype showed
 *   them at the SVG origin for the first 1.4 s);
 *   `.still-only` groups hold the static stand-ins. A CSS media query swaps
 *   them under prefers-reduced-motion, so no JavaScript is involved.
 */
export function ThreadDiagram({ thread, label, animate = false }: { thread: ThreadIdT; label: string; animate?: boolean }) {
  const ref = useRef<SVGSVGElement>(null)
  // After a thread switch, play the entrance as the new diagram mounts (before paint).
  // The first diagram on the page is animated by the reveal layer instead.
  useLayoutEffect(() => {
    if (!animate) return
    const tl = animateDiagram(ref.current)
    return () => {
      tl?.kill()
    }
  }, [animate])
  return (
    <svg ref={ref} viewBox="0 0 520 240" role="img" aria-label={label}>
      {thread === "count" ? <CountArt /> : thread === "mig" ? <MigrationArt /> : <AiArt />}
    </svg>
  )
}

function CountArt() {
  return (
    <>
      <line x1="40" y1="20" x2="40" y2="220" stroke="#1E2422" strokeWidth="1.5" />
      <rect className="a-bar" x="40" y="36" width="330" height="18" fill="#12312C" style={{ animationDelay: ".1s" }} />
      <rect className="a-bar" x="40" y="72" width="214" height="18" fill="#12312C" opacity="0.55" style={{ animationDelay: ".25s" }} />
      <rect className="a-bar" x="40" y="108" width="430" height="18" fill="#2A52BE" style={{ animationDelay: ".4s" }} />
      <rect className="a-bar" x="40" y="144" width="138" height="18" fill="#12312C" opacity="0.35" style={{ animationDelay: ".55s" }} />
      <rect className="a-bar" x="40" y="180" width="286" height="18" fill="#C9A44C" style={{ animationDelay: ".7s" }} />
      <line className="a-fade" x1="290" y1="20" x2="290" y2="220" stroke="#1E2422" strokeWidth="1" strokeDasharray="4 5" />
    </>
  )
}

const DIRECT = "M100 120 L 420 120"
const UPPER = "M100 120 C 180 30, 340 30, 420 120"
const LOWER = "M100 120 C 180 210, 340 210, 420 120"

function MigrationArt() {
  return (
    <>
      <path className="a-draw" pathLength={1} d={UPPER} fill="none" stroke="#12312C" strokeWidth="1.5" opacity="0.45" />
      <path className="a-draw" pathLength={1} d={DIRECT} fill="none" stroke="#2A52BE" strokeWidth="3" style={{ animationDelay: ".2s" }} />
      <path className="a-draw" pathLength={1} d={LOWER} fill="none" stroke="#12312C" strokeWidth="1.5" opacity="0.45" style={{ animationDelay: ".4s" }} />
      <line x1="260" y1="30" x2="260" y2="104" stroke="#1E2422" strokeWidth="4" />
      <line x1="260" y1="136" x2="260" y2="212" stroke="#1E2422" strokeWidth="4" />
      <circle cx="80" cy="120" r="22" fill="#F3F4F0" stroke="#12312C" strokeWidth="2" />
      <circle cx="440" cy="120" r="22" fill="#F3F4F0" stroke="#12312C" strokeWidth="2" />
      <g className="loop-only">
        <circle r="5" fill="#C9A44C" visibility="hidden">
          <set attributeName="visibility" to="visible" begin="1.4s" />
          <animateMotion dur="4.5s" begin="1.4s" repeatCount="indefinite" path={DIRECT} />
        </circle>
        <circle r="5" fill="#C9A44C" visibility="hidden">
          <set attributeName="visibility" to="visible" begin="3.6s" />
          <animateMotion dur="4.5s" begin="3.6s" repeatCount="indefinite" path={DIRECT} />
        </circle>
        <circle r="4" fill="#12312C" opacity="0.6" visibility="hidden">
          <set attributeName="visibility" to="visible" begin="1.6s" />
          <animateMotion dur="5s" begin="1.6s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0.47;0.47" keyTimes="0;0.6;1" path={UPPER} />
        </circle>
        <circle r="4" fill="#12312C" opacity="0.6" visibility="hidden">
          <set attributeName="visibility" to="visible" begin="2.4s" />
          <animateMotion dur="5s" begin="2.4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0.47;0.47" keyTimes="0;0.6;1" path={LOWER} />
        </circle>
      </g>
    </>
  )
}

function AiArt() {
  return (
    <>
      <line x1="20" y1="120" x2="500" y2="120" stroke="#1E2422" strokeWidth="1.5" />
      <g className="loop-only">
        <rect className="a-flow" x="20" y="108" width="24" height="24" style={{ animationDelay: "0s" }} />
        <rect className="a-flow" x="20" y="108" width="24" height="24" style={{ animationDelay: "-2.5s" }} />
        <rect className="a-flow" x="20" y="108" width="24" height="24" style={{ animationDelay: "-5s" }} />
      </g>
      <g className="still-only">
        <rect x="60" y="108" width="24" height="24" fill="#12312C" />
        <rect x="400" y="108" width="24" height="24" fill="#C9A44C" />
      </g>
      <circle className="a-pulse" cx="260" cy="120" r="56" fill="#E8EBE4" stroke="#2A52BE" strokeWidth="2.5" />
      <circle cx="260" cy="104" r="11" fill="none" stroke="#2A52BE" strokeWidth="2.5" />
      <path d="M238 142 C 243 124, 277 124, 282 142" fill="none" stroke="#2A52BE" strokeWidth="2.5" />
    </>
  )
}
