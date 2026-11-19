"use client"

import { useRef } from "react"

import { REVEAL_START, ScrollTrigger, gsap, motionReady, registerGsap, useGSAP } from "@/lib/motion"

registerGsap()

const fmt = (v: number, decimals: number) => (decimals ? v.toFixed(decimals) : String(Math.round(v)))

/**
 * A ledger number that counts up from zero when its record list enters view
 * (prototype: 1.4 s, ease-out cubic). Server-renders the final value; the
 * DOM is only touched after this component has hydrated, so React never sees
 * a text mismatch. Without motion it simply shows the final value.
 */
export function CountUp({ value, decimals, className }: { value: number; decimals: number; className?: string }) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    const el = ref.current
    if (!el || !motionReady()) return
    const container = el.closest("[data-count]") ?? el
    if (container.hasAttribute("data-shown")) return
    el.textContent = fmt(0, decimals) // hidden by the reveal state until it scrolls in
    const state = { v: 0 }
    ScrollTrigger.create({
      trigger: container,
      start: REVEAL_START,
      once: true,
      onEnter: () =>
        gsap.to(state, {
          v: value,
          duration: 1.4,
          ease: "power2.out", // 1 - (1 - p)^3
          onUpdate: () => {
            el.textContent = fmt(state.v, decimals)
          },
          onComplete: () => {
            el.textContent = fmt(value, decimals)
          },
        }),
    })
  })

  return (
    <dt ref={ref as React.Ref<HTMLElement>} className={className}>
      {fmt(value, decimals)}
    </dt>
  )
}
