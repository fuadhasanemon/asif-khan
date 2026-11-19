/**
 * Copy text, trying the async Clipboard API first, then the legacy
 * execCommand path (works in some embedded/insecure contexts where the
 * async API is blocked). Resolves to false when both are unavailable.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.setAttribute("readonly", "")
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    ta.style.pointerEvents = "none"
    document.body.appendChild(ta)
    const active = document.activeElement as HTMLElement | null
    ta.select()
    const ok = document.execCommand("copy")
    ta.remove()
    active?.focus({ preventScroll: true })
    return ok
  } catch {
    return false
  }
}
