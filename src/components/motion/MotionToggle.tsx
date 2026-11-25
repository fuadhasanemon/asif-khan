"use client"

import { useSyncExternalStore } from "react"

/**
 * "Pause motion" control (WCAG 2.1, 2.2.2 Pause, Stop, Hide).
 *
 * The hero particles, the scroll cue and the research-diagram flows move on
 * their own for longer than five seconds; this stops them. The choice is kept
 * in localStorage and applied before first paint by the boot script
 * (`html[data-motion-paused]`), so it holds across pages and visits. Only the
 * looping animations pause; one-off entrances still finish so nothing is left
 * hidden.
 */
export const MOTION_PAUSED_KEY = "motion-paused"
const ATTR = "data-motion-paused"
const EVENT = "motionpausechange"

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  window.addEventListener("storage", cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener("storage", cb)
  }
}

const read = () => document.documentElement.hasAttribute(ATTR)

/** True while looping motion is paused (false on the server). */
export function useMotionPaused() {
  return useSyncExternalStore(subscribe, read, () => false)
}

export function setMotionPaused(paused: boolean) {
  document.documentElement.toggleAttribute(ATTR, paused)
  try {
    if (paused) localStorage.setItem(MOTION_PAUSED_KEY, "1")
    else localStorage.removeItem(MOTION_PAUSED_KEY)
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  window.dispatchEvent(new Event(EVENT))
}

export function MotionToggle({ className = "" }: { className?: string }) {
  const paused = useMotionPaused()
  return (
    <button type="button" className={`motion-toggle ${className}`} aria-pressed={paused} onClick={() => setMotionPaused(!paused)}>
      {/* Drawn in CSS: two bars while playing, a play triangle while paused. */}
      <span className="mt-icon" aria-hidden="true" />
      Pause motion
    </button>
  )
}
