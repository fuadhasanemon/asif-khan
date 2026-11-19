"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { copyText } from "@/lib/clipboard"

type Props = {
  text: string
  label: string
  doneLabel: string
  failLabel: string
  className?: string
  /** Extra class while in the copied state (prototype `.copy-btn.is-done`). */
  doneClassName?: string
}

/**
 * Copy-to-clipboard button.
 * - Success: a Sonner toast (announced politely) plus the prototype's inline
 *   label change ("Citation copied").
 * - Clipboard blocked: the inline fallback label ("Copy blocked; select the
 *   text"), announced through a status region.
 */
export function CopyButton({ text, label, doneLabel, failLabel, className, doneClassName }: Props) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    const ok = await copyText(text)
    setState(ok ? "done" : "fail")
    if (ok) toast.success(doneLabel)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState("idle"), ok ? 2200 : 4000)
  }

  return (
    <button
      type="button"
      className={[className, state === "done" ? doneClassName : null].filter(Boolean).join(" ") || undefined}
      onClick={copy}
    >
      {state === "done" ? doneLabel : state === "fail" ? failLabel : label}
      <span className="sr" role="status">
        {state === "fail" ? failLabel : ""}
      </span>
    </button>
  )
}
