import { inlineText } from "@/lib/inline-text"
import { publicationById, research, sections } from "@/lib/content"
import type { ThreadIdT } from "@/lib/schemas"

import type { ResearchStage } from "./ResearchExplorer"
import { ResearchExplorer } from "./ResearchExplorerClient"
import { SectionHead } from "./SectionHead"

/** Stage data with publication links resolved to detail-page URLs. */
export function researchStages(): Record<ThreadIdT, ResearchStage> {
  const s = sections.research.stages
  const resolve = (stage: (typeof s)["count"]): ResearchStage => ({
    ...stage,
    works: stage.works.map((w) => ({
      title: w.title,
      meta: w.meta,
      href: w.publication ? (publicationById.get(w.publication)?.href ?? null) : null,
    })),
  })
  return { count: resolve(s.count), mig: resolve(s.mig), ai: resolve(s.ai) }
}

/** Research (prototype `#research`). */
export function Research() {
  const r = sections.research
  return (
    <section id="research" className="section" aria-labelledby="research-h">
      <div className="wrap">
        <SectionHead id="research" title={r.title} intro={r.intro} />
        <ResearchExplorer threads={research.threads} stages={researchStages()} initial="count" />
        <div className="earlier" data-reveal="">
          <h3>{r.earlier.heading}</h3>
          <p>{inlineText(r.earlier.body)}</p>
        </div>
      </div>
    </section>
  )
}
