import Link from "next/link"

import type { Sections, Thread, ThreadIdT } from "@/lib/schemas"
import { ThreadDiagram } from "@/components/viz/ThreadDiagrams"

export type ResearchWork = { title: string; meta: string; href: string | null }
export type ResearchStage = Omit<Sections["research"]["stages"]["count"], "works"> & { works: ResearchWork[] }

type Props = {
  threads: Thread[]
  stages: Record<ThreadIdT, ResearchStage>
  active: ThreadIdT
  onPick?: (id: ThreadIdT) => void
}

/**
 * Research explorer view (prototype `.rmap`): thread buttons and the stage.
 * Stateless; the server renders it with the default thread and the client
 * wrapper (interaction step) owns `active`.
 */
export function ResearchExplorerView({ threads, stages, active, onPick }: Props) {
  const stage = stages[active]
  return (
    <div className="rmap" data-reveal="">
      <div className="rtabs" role="group" aria-label="Research lines">
        {threads.map((t) => {
          const on = t.id === active
          return (
            <button
              key={t.id}
              type="button"
              className={`rtab${on ? " is-on" : ""}`}
              aria-pressed={on}
              aria-controls="research-stage"
              onClick={onPick ? () => onPick(t.id) : undefined}
            >
              <span className="rtab-name">{t.name}</span>
              <span className="rtab-line">{t.short}</span>
              <span className="rtab-n">{t.count}</span>
            </button>
          )
        })}
      </div>
      <div className="rstage" id="research-stage" aria-live="polite">
        <div className="stage" key={active}>
          <div className="stage-art">
            <ThreadDiagram thread={active} label={stage.diagramLabel} />
          </div>
          <h3>{stage.heading}</h3>
          <p>{stage.body}</p>
          <ul className="works">
            {stage.works.map((w) => (
              <li className="work" key={w.title}>
                {w.href ? (
                  <Link className="work-title wt-link" href={w.href}>
                    {w.title}
                  </Link>
                ) : (
                  <span className="work-title">{w.title}</span>
                )}
                <span className="work-meta">{w.meta}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
