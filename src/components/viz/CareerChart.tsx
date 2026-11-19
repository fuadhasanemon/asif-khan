"use client"

import { useRef, useState, type PointerEvent } from "react"

import type { Role } from "@/lib/schemas"

export const AXIS_START = 2017
export const AXIS_END = 2027
const SPAN = AXIS_END - AXIS_START
const pct = (year: number) => ((year - AXIS_START) / SPAN) * 100
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** 2025.25 → "Apr 2025" (role dates in experience.json are fractional years). */
export function monthLabel(year: number): string {
  const y = Math.floor(year)
  const m = Math.min(11, Math.max(0, Math.floor((year - y) * 12 + 1e-6)))
  return `${MONTHS[m]} ${y}`
}

export const activeAt = (roles: Role[], at: number) => roles.filter((r) => r.start <= at && at <= r.end)

type Props = {
  roles: Role[]
  open: string | null
  hot: string | null
  onSelect?: (id: string) => void
  onHover?: (id: string | null) => void
}

/**
 * Career chart (prototype `.chart`): 2017–2027 axis, one bar per role.
 * Bars are buttons sharing selection/hover state with the timeline.
 *
 * Year guide: a vertical line follows the pointer across the tracks and
 * flags the month and how many roles were active then; active rows stay
 * strong, the rest recede. Focusing a bar moves the guide to that role's
 * start, so keyboard users get the same view of what overlapped.
 */
export function CareerChart({ roles, open, hot, onSelect, onHover }: Props) {
  const years = Array.from({ length: SPAN + 1 }, (_, i) => AXIS_START + i)
  const rowsRef = useRef<HTMLUListElement>(null)
  const [at, setAt] = useState<number | null>(null)

  function track(e: PointerEvent<HTMLUListElement>) {
    const t = rowsRef.current?.querySelector(".chart-track")?.getBoundingClientRect()
    if (!t || t.width === 0) return
    const f = (e.clientX - t.left) / t.width
    setAt(f < 0 || f > 1 ? null : AXIS_START + f * SPAN)
  }

  const active = at === null ? null : new Set(activeAt(roles, at).map((r) => r.id))

  return (
    <figure className={`chart${at !== null ? " has-guide" : ""}`} data-reveal="" aria-labelledby="chart-caption">
      <figcaption id="chart-caption" className="sr">
        Roles on a timeline from {AXIS_START} to {AXIS_END}. Select a bar to open that role below.
      </figcaption>
      <div className="chart-axis" aria-hidden="true">
        {years.map((y, i) => (
          <span key={y} className={`tick${i % 2 ? " tick-odd" : ""}`} style={{ left: `${pct(y)}%` }}>
            {y}
          </span>
        ))}
      </div>
      <div className="chart-body">
        <ul className="chart-rows" ref={rowsRef} onPointerMove={track} onPointerLeave={() => setAt(null)}>
          {roles.map((r, i) => {
            const isOpen = open === r.id
            const width = Math.max(1.2, (r.end - r.start) * (100 / SPAN))
            const state = active ? (active.has(r.id) ? " is-at" : " is-off") : ""
            return (
              <li key={r.id} className={`chart-row${hot === r.id ? " is-hot" : ""}${state}`}>
                <span className="chart-label">{r.shortLabel}</span>
                <span className="chart-track">
                  <button
                    type="button"
                    className={`chart-bar${isOpen ? " is-open" : ""}${r.ongoing ? " is-ongoing" : ""}`}
                    style={{ left: `${pct(r.start).toFixed(2)}%`, width: `${width.toFixed(2)}%` }}
                    aria-label={`${r.title}, ${r.organization}, ${r.dates}`}
                    aria-pressed={isOpen}
                    aria-controls={isOpen ? `role-${r.id}` : undefined}
                    data-delay={(0.1 + i * 0.08).toFixed(2)}
                    onClick={onSelect ? () => onSelect(r.id) : undefined}
                    onMouseEnter={onHover ? () => onHover(r.id) : undefined}
                    onMouseLeave={onHover ? () => onHover(null) : undefined}
                    onFocus={() => {
                      onHover?.(r.id)
                      setAt(r.start)
                    }}
                    onBlur={() => {
                      onHover?.(null)
                      setAt(null)
                    }}
                  >
                    <span className="chart-fill" aria-hidden="true" />
                  </button>
                </span>
              </li>
            )
          })}
        </ul>
        {at !== null ? (
          <div className="chart-guide-layer" aria-hidden="true">
            <span className="chart-guide" style={{ left: `${pct(at)}%` }}>
              <span className="chart-flag">
                {monthLabel(at)}
                <span className="chart-flag-n">
                  {active!.size} {active!.size === 1 ? "role" : "roles"}
                </span>
              </span>
            </span>
          </div>
        ) : null}
      </div>
    </figure>
  )
}
