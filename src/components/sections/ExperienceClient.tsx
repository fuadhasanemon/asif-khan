"use client"

import { useState, type ReactNode } from "react"

import type { Role } from "@/lib/schemas"

import { ExperienceView } from "./ExperienceView"

/**
 * Shared state for the career chart and the timeline (prototype behaviour):
 * a chart bar selects its role, a timeline row toggles it, hover/focus on
 * either highlights the same row in both.
 */
export function ExperienceExplorer({ roles, initialOpen, aside }: { roles: Role[]; initialOpen: string; aside: ReactNode }) {
  const [open, setOpen] = useState<string | null>(initialOpen)
  const [hot, setHot] = useState<string | null>(null)

  return (
    <ExperienceView
      roles={roles}
      open={open}
      hot={hot}
      onSelect={setOpen}
      onToggle={(id) => setOpen((cur) => (cur === id ? null : id))}
      onHover={setHot}
      aside={aside}
    />
  )
}
