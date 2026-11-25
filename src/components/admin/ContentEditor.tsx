"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"

import { saveContentFile } from "@/app/admin/actions"
import type { FileKey } from "@/lib/admin/files"

import { Field, ObjectFields } from "./JsonForm"

type Json = Parameters<typeof Field>[0]["value"]

type Props = {
  fileKey: FileKey
  title: string
  description: string
  initial: unknown
  areas: string[]
  canSave: boolean
  storage: string
}

/** "content/publications.json: 3.authors: …" → "Item 4 › authors: …" */
function friendly(error: string): string {
  const m = error.match(/^content\/[\w-]+\.json: (.*)$/)
  const rest = m ? m[1]! : error
  return rest.replace(/^([\w.]+):/, (path: string) =>
    path
      .slice(0, -1)
      .split(".")
      .map((p) => (/^\d+$/.test(p) ? `Item ${Number(p) + 1}` : p))
      .join(" › ")
      .concat(":"),
  )
}

export function ContentEditor({ fileKey, title, description, initial, areas, canSave, storage }: Props) {
  const [value, setValue] = useState<Json>(initial as Json)
  const [saved, setSaved] = useState(JSON.stringify(initial))
  const [status, setStatus] = useState<{ ok: boolean; lines: string[] } | null>(null)
  const [pending, start] = useTransition()
  const dirty = JSON.stringify(value) !== saved
  const ctx = { file: fileKey, areas }

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  function save() {
    start(async () => {
      const res = await saveContentFile(fileKey, value)
      if (res.ok) {
        setSaved(JSON.stringify(value))
        setStatus({ ok: true, lines: [res.message] })
      } else {
        setStatus({ ok: false, lines: res.errors.map(friendly) })
      }
      window.scrollTo({ top: 0 })
    })
  }

  return (
    <div className="admin-editor">
      <p className="admin-crumbs">
        <Link href="/admin">All content</Link> / {title}
      </p>
      <h1 className="admin-h1">{title}</h1>
      <p className="admin-muted">{description}</p>
      <p className="admin-note">{storage}</p>

      {status ? (
        <div className={status.ok ? "admin-ok-box" : "admin-error-box"} role={status.ok ? "status" : "alert"}>
          {status.ok ? null : <p className="admin-error-title">Nothing was saved. Fix these and save again:</p>}
          <ul>
            {status.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="admin-form">
        {Array.isArray(value) ? (
          <Field name={title} value={value} onChange={setValue} ctx={ctx} depth={0} />
        ) : value && typeof value === "object" ? (
          <ObjectFields value={value as Record<string, Json>} onChange={setValue} ctx={ctx} depth={0} />
        ) : null}
      </div>

      <div className="admin-savebar">
        <span className="admin-muted">{dirty ? "Unsaved changes" : "All changes saved"}</span>
        <button type="button" className="btn btn-line" disabled={!dirty || pending} onClick={() => setValue(JSON.parse(saved) as Json)}>
          Discard changes
        </button>
        <button type="button" className="btn btn-brass" disabled={!dirty || pending || !canSave} onClick={save}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  )
}
