import type { PubTypeT } from "@/lib/schemas"

export type Segment = { type: PubTypeT; label: string; n: number }

type Props = {
  segments: Segment[]
  filter: PubTypeT | "all"
  onPick?: (type: PubTypeT) => void
}

/** Composition bar: one segment per publication type, sized by count; click to filter. */
export function CompositionBar({ segments, filter, onPick }: Props) {
  return (
    <div className={`compo${filter !== "all" ? " has-pick" : ""}`} role="group" aria-label="Filter publications by type">
      {segments.map((sg, i) => {
        const on = filter === sg.type
        return (
          <button
            key={sg.type}
            type="button"
            className={`seg seg-${sg.type}${on ? " is-on" : ""}`}
            style={{ flexGrow: sg.n }}
            aria-pressed={on}
            onClick={onPick ? () => onPick(sg.type) : undefined}
          >
            <span className="seg-bar" style={{ "--d": `${(0.1 + i * 0.12).toFixed(2)}s` } as React.CSSProperties} />
            <span className="seg-n">{sg.n}</span>
            <span className="seg-label">{sg.label}</span>
          </button>
        )
      })}
    </div>
  )
}
