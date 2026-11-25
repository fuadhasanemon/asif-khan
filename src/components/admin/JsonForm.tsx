"use client"

import { useId, useState } from "react"

import { FIELD_HELP, NULLABLE_FIELDS, choicesFor, type FileKey } from "@/lib/admin/files"

type Json = string | number | boolean | null | Json[] | { [k: string]: Json }
export type Ctx = { file: FileKey; areas: string[] }

/** "heroStatement" → "Hero statement" */
const ACRONYMS: Record<string, string> = { cv: "CV", doi: "DOI", url: "URL", id: "ID" }
export const humanize = (key: string) => {
  const s = key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b(cv|doi|url|id)\b/g, (w) => ACRONYMS[w]!)
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Fields edited in a multi-line box. */
const LONG = new Set(["abstract", "body", "note", "statement", "lead", "heroStatement", "heroSub", "intro", "text", "ctx", "languages", "teaching"])

/** Item templates for arrays that may be empty in the data. */
const EMPTY_ARRAY_ITEMS: Record<string, Json> = { uses: { title: "", ctx: "" } }

/** "Genocide, numbers, and memory: …" → "genocide-numbers-and-memory-the-death-toll" */
export function slugify(title: string, words = 7): string {
  return title
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .split("-")
    .filter(Boolean)
    .slice(0, words)
    .join("-")
}

/** A blank value with the same shape as `sample` (for "Add item"). */
export function blankFrom(sample: Json): Json {
  if (Array.isArray(sample)) return []
  if (sample === null) return null
  if (typeof sample === "object") return Object.fromEntries(Object.entries(sample).map(([k, v]) => [k, blankFrom(v)]))
  if (typeof sample === "number") return 0
  if (typeof sample === "boolean") return false
  return ""
}

/** Title for a list card, from the item's most descriptive field. */
function summary(item: Json, index: number): string {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const o = item as Record<string, Json>
    const main = [o.title, o.name, o.label, o.degree, o.shortLabel, o.heading].find((v) => typeof v === "string" && v)
    const id = typeof o.id === "string" ? o.id : null
    if (main) return id ? `${id}: ${main}` : String(main)
    if (id) return id
  }
  if (typeof item === "string" && item) return item.length > 80 ? `${item.slice(0, 80)}…` : item
  return `Item ${index + 1}`
}

/** Next free publication id ("p18"). */
function nextPubId(items: Json[]): string {
  const nums = items.map((it) => Number(String((it as { id?: string })?.id ?? "").replace(/^p/, ""))).filter((n) => Number.isFinite(n))
  return `p${(nums.length ? Math.max(...nums) : -1) + 1}`
}

type FieldProps = {
  name: string
  value: Json
  onChange: (v: Json) => void
  ctx: Ctx
  /** The object this field belongs to (for "slug from title"). */
  parent?: Record<string, Json>
  depth: number
}

export function Field({ name, value, onChange, ctx, parent, depth }: FieldProps) {
  if (Array.isArray(value)) return <ArrayField name={name} value={value} onChange={onChange} ctx={ctx} depth={depth} />
  if (value !== null && typeof value === "object") {
    return (
      <fieldset className={`admin-fieldset depth-${Math.min(depth, 3)}`}>
        <legend className="admin-legend">{humanize(name)}</legend>
        <ObjectFields value={value} onChange={onChange} ctx={ctx} depth={depth + 1} />
      </fieldset>
    )
  }
  return <Scalar name={name} value={value} onChange={onChange} ctx={ctx} parent={parent} />
}

export function ObjectFields({
  value,
  onChange,
  ctx,
  depth,
}: {
  value: Record<string, Json>
  onChange: (v: Json) => void
  ctx: Ctx
  depth: number
}) {
  return (
    <div className="admin-fields">
      {Object.entries(value).map(([k, v]) => (
        <Field key={k} name={k} value={v} parent={value} depth={depth} ctx={ctx} onChange={(nv) => onChange({ ...value, [k]: nv })} />
      ))}
    </div>
  )
}

function Scalar({ name, value, onChange, ctx, parent }: Omit<FieldProps, "depth">) {
  const id = useId()
  const nullable = NULLABLE_FIELDS.has(name)
  const help = FIELD_HELP[name]
  const choices = choicesFor(ctx.file, name, ctx.areas)
  const label = (
    <label htmlFor={id} className="admin-label">
      {humanize(name)}
    </label>
  )
  const helpEl = help ? <p className="admin-help">{help}</p> : null
  const fromText = (s: string): Json => (nullable && s.trim() === "" ? null : s)

  if (typeof value === "boolean") {
    return (
      <div className="admin-field admin-check">
        <input id={id} type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        {label}
        {helpEl}
      </div>
    )
  }
  if (typeof value === "number") {
    return (
      <div className="admin-field">
        {label}
        <input
          id={id}
          className="admin-input admin-num"
          type="number"
          step="any"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
        {helpEl}
      </div>
    )
  }

  // Objects and arrays never reach Scalar; what is left is a string or null.
  const text = typeof value === "string" ? value : ""
  if (choices) {
    return (
      <div className="admin-field">
        {label}
        <select id={id} className="admin-input" value={text} onChange={(e) => onChange(fromText(e.target.value))}>
          {nullable || !choices.includes(text) ? <option value="">{nullable ? "(none)" : "Choose…"}</option> : null}
          {choices.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {helpEl}
      </div>
    )
  }

  const long = LONG.has(name) || text.length > 70
  const canSlug = name === "slug" && ctx.file === "publications" && typeof parent?.title === "string"
  return (
    <div className="admin-field">
      {label}
      {long ? (
        <textarea id={id} className="admin-input" rows={Math.min(8, Math.max(3, Math.ceil(text.length / 70)))} value={text} onChange={(e) => onChange(fromText(e.target.value))} />
      ) : (
        <div className="admin-row">
          <input id={id} className="admin-input" type="text" value={text} placeholder={nullable ? "(empty)" : undefined} onChange={(e) => onChange(fromText(e.target.value))} />
          {canSlug ? (
            <button type="button" className="admin-link" onClick={() => onChange(slugify(String(parent!.title)))}>
              From title
            </button>
          ) : null}
        </div>
      )}
      {helpEl}
    </div>
  )
}

function ArrayField({ name, value, onChange, ctx, depth }: Omit<FieldProps, "parent"> & { value: Json[] }) {
  const [confirming, setConfirming] = useState<number | null>(null)
  const choices = choicesFor(ctx.file, name, ctx.areas)
  const isRoot = depth === 0
  const objects = value.length > 0 && value.every((v) => v !== null && typeof v === "object" && !Array.isArray(v))

  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[i], next[j]] = [next[j]!, next[i]!]
    onChange(next)
  }
  const remove = (i: number) => {
    setConfirming(null)
    onChange(value.filter((_, k) => k !== i))
  }
  const add = () => {
    let item: Json = value.length ? blankFrom(value[0]!) : (EMPTY_ARRAY_ITEMS[name] ?? "")
    if (ctx.file === "publications" && isRoot && item && typeof item === "object" && !Array.isArray(item)) {
      item = { ...item, id: nextPubId(value), type: "prep", status: "In preparation", authors: ["Khan, M. A."] }
    }
    onChange([...value, item])
  }

  const controls = (i: number) => (
    <span className="admin-item-tools">
      <button type="button" className="admin-tool" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move item ${i + 1} up`}>
        Up
      </button>
      <button type="button" className="admin-tool" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Move item ${i + 1} down`}>
        Down
      </button>
      {confirming === i ? (
        <button type="button" className="admin-tool is-danger" onClick={() => remove(i)}>
          Confirm remove
        </button>
      ) : (
        <button type="button" className="admin-tool" onClick={() => setConfirming(i)} aria-label={`Remove item ${i + 1}`}>
          Remove
        </button>
      )}
    </span>
  )

  const body = (
    <>
      <ol className={`admin-list${objects ? " is-cards" : ""}`}>
        {value.map((item, i) => (
          <li key={i} className="admin-item">
            {objects ? (
              <details className="admin-card-item" open={value.length <= 3}>
                <summary className="admin-summary">
                  <span className="admin-summary-t">{summary(item, i)}</span>
                  {controls(i)}
                </summary>
                <ObjectFields
                  value={item as Record<string, Json>}
                  ctx={ctx}
                  depth={depth + 1}
                  onChange={(nv) => onChange(value.map((v, k) => (k === i ? nv : v)))}
                />
              </details>
            ) : (
              <div className="admin-row admin-scalar-item">
                <div className="admin-grow">
                  <Field
                    name={choices ? name : `${humanize(name)} ${i + 1}`}
                    value={item}
                    ctx={ctx}
                    depth={depth + 1}
                    onChange={(nv) => onChange(value.map((v, k) => (k === i ? nv : v)))}
                  />
                </div>
                {controls(i)}
              </div>
            )}
          </li>
        ))}
      </ol>
      <button type="button" className="btn btn-line admin-add" onClick={add}>
        Add {objects || EMPTY_ARRAY_ITEMS[name] ? "item" : "line"}
      </button>
    </>
  )

  if (isRoot) return body
  return (
    <fieldset className={`admin-fieldset depth-${Math.min(depth, 3)}`}>
      <legend className="admin-legend">{humanize(name)}</legend>
      {FIELD_HELP[name] ? <p className="admin-help">{FIELD_HELP[name]}</p> : null}
      {body}
    </fieldset>
  )
}
