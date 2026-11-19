import type { Methods } from "@/lib/schemas"

export type MethodsViewProps = {
  data: Methods
  caption: string
  panelKicker: string
  selected: string
  hotCol: string | null
  onSelect?: (id: string) => void
  onHoverCol?: (id: string | null) => void
}

export const PLACEHOLDER_USE = {
  title: "[Add the project or paper where you used this method]",
  ctx: "On the CV, but not yet linked to a project",
}

const countText = (n: number) => (n ? (n === 1 ? "1 project" : `${n} projects`) : "To link")

/**
 * Methods × projects matrix with row selection, column hover and the detail
 * panel (prototype `#skills`). Stateless.
 */
export function MethodsMatrixView({ data, caption, panelKicker, selected, hotCol, onSelect, onHoverCol }: MethodsViewProps) {
  const method = data.methods.find((m) => m.id === selected) ?? data.methods[0]!
  const uses = method.needsProject ? [{ ...PLACEHOLDER_USE, ph: true }] : method.uses.map((u) => ({ ...u, ph: false }))

  return (
    <>
      <div className="matrix-box" data-reveal="">
        <table className="matrix">
          <caption className="sr">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="mx-corner">
                Method
              </th>
              {data.projects.map((pj) => (
                <th scope="col" key={pj.id} className={`mx-col${hotCol === pj.id ? " is-col" : ""}`}>
                  <span className="mx-pj">{pj.short}</span>
                  <span className="mx-yr">{pj.where}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.methods.map((m, mi) => {
              const on = m.id === method.id
              return (
                <tr key={m.id} className={`mx-row${on ? " is-on" : ""}`}>
                  <th scope="row">
                    <button
                      type="button"
                      className="mx-m"
                      aria-pressed={on}
                      aria-controls="method-panel"
                      onClick={onSelect ? () => onSelect(m.id) : undefined}
                    >
                      <span>{m.name}</span>
                      <span className="mx-n">{countText(m.projects.length)}</span>
                    </button>
                  </th>
                  {data.projects.map((pj, pi) => {
                    const used = m.projects.includes(pj.id)
                    return (
                      <td
                        key={pj.id}
                        className={`mx-cell${hotCol === pj.id ? " is-col" : ""}`}
                        onMouseEnter={onHoverCol ? () => onHoverCol(pj.id) : undefined}
                        onMouseLeave={onHoverCol ? () => onHoverCol(null) : undefined}
                      >
                        {used ? (
                          <span
                            className="dot"
                            role="img"
                            aria-label={`${m.name} used in ${pj.short}`}
                            style={{ "--d": `${(0.2 + mi * 0.05 + pi * 0.03).toFixed(2)}s` } as React.CSSProperties}
                          />
                        ) : null}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="m-panel" id="method-panel" aria-live="polite">
        <div>
          <p className="m-kicker">{panelKicker}</p>
          <h3 className="m-title">{method.name}</h3>
        </div>
        <ul className="m-uses">
          {uses.map((u) => (
            <li key={u.title} className={`m-use${u.ph ? " is-ph" : ""}`}>
              <span className="m-use-title">{u.title}</span>
              <span className="m-use-ctx">{u.ctx}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
