import type { ReactNode } from "react"

/** Section title row with the brass rule (prototype `.sec-head`). */
export function SectionHead({ id, title, intro }: { id: string; title: string; intro?: ReactNode }) {
  return (
    <div className="sec-head" data-reveal="">
      <h2 className="h2" id={`${id}-h`}>
        {title}
      </h2>
      {intro ? <p className="sec-intro">{intro}</p> : null}
    </div>
  )
}
