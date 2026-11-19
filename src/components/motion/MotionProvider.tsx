"use client"

import type { ReactNode } from "react"
import { LazyMotion, MotionConfig, domMax, useReducedMotion } from "motion/react"

/** The prototype's standard curve, cubic-bezier(.2,.7,.2,1). */
export const SITE_EASE = [0.2, 0.7, 0.2, 1] as const

/**
 * Framer Motion setup: lazy features (components use `m.*`), the site's
 * default transition, and zero-duration transitions under reduced motion so
 * state changes land on their end state immediately.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig
        reducedMotion="user"
        transition={reduce ? { duration: 0 } : { duration: 0.45, ease: SITE_EASE }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
