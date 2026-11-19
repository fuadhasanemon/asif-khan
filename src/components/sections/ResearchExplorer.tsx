import Link from "next/link"
import { AnimatePresence, m, useReducedMotion } from "motion/react"

import type { Sections, Thread, ThreadIdT } from "@/lib/schemas"
import { ThreadDiagram } from "@/components/viz/ThreadDiagrams"

export type ResearchWork = { title: string; meta: string; href: string | null }
export type ResearchStage = Omit<Sections["research"]["stages"]["count"], "works"> & { works: ResearchWork[] }

type Props = {
  threads: Thread[]
  stages: Record<ThreadIdT, ResearchStage>
  active: ThreadIdT
  onPick?: (id: ThreadIdT) => void
  /** True once the user has switched threads: new diagrams then play their entrance on mount. */
  animateDiagrams?: boolean
}

const workVariants = { hidden: { opacity: 0, y: 12 }, shown: { opacity: 1, y: 0 } }

/**
 * Research explorer view (prototype `.rmap`): thread buttons and the stage.
 * Stateless; ResearchExplorer (client) owns `active`. The stage cross-fades
 * with Framer Motion (prototype: stagein .6 s, works staggered from .25 s).
 */
export function ResearchExplorerView({ threads, stages, active, onPick, animateDiagrams = false }: Props) {
  const stage = stages[active]
  const reduce = useReducedMotion()
  const stageVariants = {
    hidden: { opacity: 0, y: 12 },
    shown: { opacity: 1, y: 0 },
    exit: { opacity: 0, transition: { duration: reduce ? 0 : 0.18 } },
  }
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
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            className="stage"
            key={active}
            variants={stageVariants}
            initial="hidden"
            animate="shown"
            exit="exit"
            transition={reduce ? { duration: 0 } : { staggerChildren: 0.1, delayChildren: 0.25 }}
          >
            <div className="stage-art">
            <ThreadDiagram thread={active} label={stage.diagramLabel} animate={animateDiagrams} />
          </div>
          <h3>{stage.heading}</h3>
          <p>{stage.body}</p>
          <ul className="works">
            {stage.works.map((w) => (
              <m.li className="work" key={w.title} variants={workVariants}>
                {w.href ? (
                  <Link className="work-title wt-link" href={w.href}>
                    {w.title}
                  </Link>
                ) : (
                  <span className="work-title">{w.title}</span>
                )}
                <span className="work-meta">{w.meta}</span>
              </m.li>
            ))}
          </ul>
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
