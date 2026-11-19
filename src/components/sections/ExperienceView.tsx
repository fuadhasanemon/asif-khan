import type { ReactNode } from "react"
import { AnimatePresence, m } from "motion/react"

import { requestScrollRefresh } from "@/lib/motion"

import type { Role } from "@/lib/schemas"
import { CareerChart } from "@/components/viz/CareerChart"

type Props = {
  roles: Role[]
  open: string | null
  hot: string | null
  onToggle?: (id: string) => void
  onSelect?: (id: string) => void
  onHover?: (id: string | null) => void
  aside: ReactNode
}

/**
 * Career chart + interactive timeline (prototype `#experience`), stateless.
 * Chart bar = select a role; timeline row = toggle it; hover is shared.
 */
export function ExperienceView({ roles, open, hot, onToggle, onSelect, onHover, aside }: Props) {
  return (
    <>
      <CareerChart roles={roles} open={open} hot={hot} onSelect={onSelect} onHover={onHover} />
      <div className="xp-grid">
        <ol className="tl">
          {roles.map((r) => {
            const isOpen = open === r.id
            return (
              <li key={r.id} className={`tl-item${hot === r.id ? " is-hot" : ""}`}>
                <span className={`tl-node${isOpen ? " is-open" : ""}`} aria-hidden="true" />
                <button
                  type="button"
                  className="tl-btn"
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? `role-${r.id}` : undefined}
                  onClick={onToggle ? () => onToggle(r.id) : undefined}
                  onMouseEnter={onHover ? () => onHover(r.id) : undefined}
                  onMouseLeave={onHover ? () => onHover(null) : undefined}
                >
                  <span className="tl-date">{r.dates}</span>
                  <span className="tl-main">
                    <span className="tl-role">{r.title}</span>
                    <span className="tl-org">{r.organization}</span>
                  </span>
                  <span className="tl-kind">{r.kind}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <m.div
                      key="detail"
                      id={`role-${r.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}
                      onAnimationComplete={() => requestScrollRefresh()}
                    >
                      <div className="tl-detail">
                        {r.note ? <p className="tl-note">{r.note}</p> : null}
                        <ul>
                          {r.points.map((pt) => (
                            <li key={pt.slice(0, 40)}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    </m.div>
                  ) : null}
                </AnimatePresence>
              </li>
            )
          })}
        </ol>
        {aside}
      </div>
    </>
  )
}
