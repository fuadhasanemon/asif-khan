import { methods, sections, site } from "@/lib/content"
import { MethodsMatrix } from "@/components/viz/MethodsMatrixClient"

import { SectionHead } from "./SectionHead"

/** Method selected by default, as in the prototype. */
export const DEFAULT_METHOD = "survey"

/** Methods and skills (prototype `#skills`). */
export function Methods() {
  const s = sections.skills
  return (
    <section id="skills" className="section" aria-labelledby="skills-h">
      <div className="wrap">
        <SectionHead id="skills" title={s.title} intro={s.intro} />
        <MethodsMatrix data={methods} caption={s.matrixCaption} panelKicker={s.panelKicker} initial={DEFAULT_METHOD} />
        <div className="tool-grid">
          <div>
            <h3 className="small-h">{s.softwareHeading}</h3>
            <p className="tool-line">{site.skills.software.join(", ")}</p>
          </div>
          <div>
            <h3 className="small-h">{s.languagesHeading}</h3>
            <p className="tool-line">{site.skills.languages}</p>
          </div>
          <div>
            <h3 className="small-h">{s.teachingHeading}</h3>
            <p className="tool-line">{site.skills.teaching}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
