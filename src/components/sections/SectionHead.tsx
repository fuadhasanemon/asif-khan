import type { ReactNode } from "react"

/** Section title row with the brass rule (prototype `.sec-head`). */
export function SectionHead({
  id,
  title,
  intro,
  level = 2,
}: {
  id: string
  title: string
  intro?: ReactNode
  /** 1 when the section title is the page title (e.g. /publications). */
  level?: 1 | 2
}) {
  const H = level === 1 ? "h1" : "h2"
  return (
    <div className="sec-head" data-reveal="">
      <H className="h2" id={`${id}-h`}>
        {title}
      </H>
      {intro ? <p className="sec-intro">{intro}</p> : null}
    </div>
  )
}
