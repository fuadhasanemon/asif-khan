import { experience, sections, site } from "@/lib/content"

import { ExperienceView } from "./ExperienceView"
import { SectionHead } from "./SectionHead"

/** Role open by default, as in the prototype (Teaching Support Assistant). */
export const DEFAULT_ROLE = "ta"

export function EducationAside() {
  return (
    <aside className="edu" aria-labelledby="edu-h" data-reveal="">
      <h3 id="edu-h" className="edu-h">
        {sections.experience.educationHeading}
      </h3>
      {site.education.map((e) => (
        <div className="edu-item" key={e.degree}>
          <p className="edu-year">{e.year}</p>
          <p className="edu-deg">{e.degree}</p>
          <p className="edu-inst">{e.institution}</p>
          <p className="edu-note">{e.note}</p>
        </div>
      ))}
    </aside>
  )
}

/** Experience (prototype `#experience`). */
export function Experience() {
  const s = sections.experience
  return (
    <section id="experience" className="section" aria-labelledby="experience-h">
      <div className="wrap">
        <SectionHead id="experience" title={s.title} intro={s.intro} />
        <ExperienceView roles={experience} open={DEFAULT_ROLE} hot={null} aside={<EducationAside />} />
      </div>
    </section>
  )
}
