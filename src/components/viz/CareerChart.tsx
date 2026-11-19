import type { Role } from "@/lib/schemas"

export const AXIS_START = 2017
export const AXIS_END = 2027
const SPAN = AXIS_END - AXIS_START
const pct = (year: number) => ((year - AXIS_START) / SPAN) * 100

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
 */
export function CareerChart({ roles, open, hot, onSelect, onHover }: Props) {
  const years = Array.from({ length: SPAN + 1 }, (_, i) => AXIS_START + i)
  return (
    <figure className="chart" data-reveal="" aria-labelledby="chart-caption">
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
      <ul className="chart-rows">
        {roles.map((r, i) => {
          const isOpen = open === r.id
          const width = Math.max(1.2, (r.end - r.start) * (100 / SPAN))
          return (
            <li key={r.id} className={`chart-row${hot === r.id ? " is-hot" : ""}`}>
              <span className="chart-label">{r.shortLabel}</span>
              <span className="chart-track">
                <button
                  type="button"
                  className={`chart-bar${isOpen ? " is-open" : ""}${r.ongoing ? " is-ongoing" : ""}`}
                  style={
                    {
                      left: `${pct(r.start).toFixed(2)}%`,
                      width: `${width.toFixed(2)}%`,
                    } as React.CSSProperties
                  }
                  aria-label={`${r.title}, ${r.organization}, ${r.dates}`}
                  aria-pressed={isOpen}
                  aria-controls={isOpen ? `role-${r.id}` : undefined}
                  data-delay={(0.1 + i * 0.08).toFixed(2)}
                  onClick={onSelect ? () => onSelect(r.id) : undefined}
                  onMouseEnter={onHover ? () => onHover(r.id) : undefined}
                  onMouseLeave={onHover ? () => onHover(null) : undefined}
                  onFocus={onHover ? () => onHover(r.id) : undefined}
                  onBlur={onHover ? () => onHover(null) : undefined}
                >
                  <span className="chart-fill" aria-hidden="true" />
                </button>
              </span>
            </li>
          )
        })}
      </ul>
    </figure>
  )
}
