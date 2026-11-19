"use client"

import { useEffect, useRef, useState } from "react"

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
 * Copy-to-clipboard button with the prototype's inline states:
 * "Copy email" → "Email copied", or a fallback hint when the clipboard is blocked.
 * Sonner toasts are layered on in the interaction step.
 */
export function CopyButton({ text, label, doneLabel, failLabel, className, doneClassName }: Props) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    let ok = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        ok = true
      }
    } catch {
      ok = false
    }
    setState(ok ? "done" : "fail")
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState("idle"), 2200)
  }

  return (
    <button
      type="button"
      className={[className, state === "done" ? doneClassName : null].filter(Boolean).join(" ") || undefined}
      onClick={copy}
    >
      <span aria-live="polite">{state === "done" ? doneLabel : state === "fail" ? failLabel : label}</span>
    </button>
  )
}
