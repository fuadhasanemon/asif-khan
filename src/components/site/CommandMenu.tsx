"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { copyText } from "@/lib/clipboard"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export type PaletteSection = { id: string; label: string }
export type PalettePublication = { id: string; title: string; href: string; meta: string; keywords: string[] }

type Props = {
  sections: PaletteSection[]
  publications: PalettePublication[]
  email: string
  cvPath: string
}

/**
 * Word matching instead of cmdk's default fuzzy scorer, which matched scattered
 * letters across long titles ("copy email" found paper titles first). Every
 * query word must appear in the item's label or keywords; label matches rank
 * above keyword-only matches, and label prefixes rank highest.
 */
export function paletteFilter(value: string, search: string, keywords: string[] = []): number {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return 1
  const label = value.toLowerCase()
  const all = `${label} ${keywords.join(" ").toLowerCase()}`
  if (!words.every((w) => all.includes(w))) return 0
  if (words.every((w) => label.includes(w))) return label.replace(/^(p\d+|section) /, "").startsWith(words[0]!) ? 1 : 0.8
  return 0.5
}

/** Start a file download (CV, .bib) without a client-side navigation. */
function download(href: string) {
  const a = document.createElement("a")
  a.href = href
  a.download = ""
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** Opens on ⌘K (macOS) or Ctrl+K, and on a `command-menu:open` window event. */
export const OPEN_EVENT = "command-menu:open"

/**
 * Command palette (shadcn Command): jump to a section, search publications by
 * title, coauthor or venue, copy the email address, download the CV or all
 * citations.
 */
export function CommandMenu({ sections, publications, email, cvPath }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener("keydown", onKey)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener(OPEN_EVENT, onOpen)
    }
  }, [])

  function run(action: () => void) {
    setOpen(false)
    action()
  }

  async function copyEmail() {
    const ok = await copyText(email)
    if (ok) toast.success("Email copied")
    else toast(`Copy blocked here. The address is ${email}`)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command menu"
      description="Jump to a section, find a publication by title, coauthor or venue, or run an action."
    >
      <Command loop filter={paletteFilter}>
        <CommandInput placeholder="Jump to a section or search publications" />
        <CommandList>
          <CommandEmpty>Nothing matches. Try a title word, a coauthor or a venue.</CommandEmpty>
          <CommandGroup heading="Sections">
            {sections.map((s) => (
              <CommandItem key={s.id} value={`section ${s.label}`} onSelect={() => run(() => router.push(`/#${s.id}`))}>
                <span className="cmdk-title">{s.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Publications">
            {publications.map((p) => (
              <CommandItem key={p.id} value={`${p.id} ${p.title}`} keywords={p.keywords} onSelect={() => run(() => router.push(p.href))}>
                <span className="cmdk-pub">
                  <span className="cmdk-pub-title">{p.title}</span>
                  <span className="cmdk-meta">{p.meta}</span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem value="copy email address" keywords={[email]} onSelect={() => run(copyEmail)}>
              <span className="cmdk-title">Copy email</span>
              <span className="cmdk-meta">{email}</span>
            </CommandItem>
            <CommandItem value="download cv" keywords={["resume", "curriculum vitae"]} onSelect={() => run(() => download(cvPath))}>
              <span className="cmdk-title">Download CV</span>
            </CommandItem>
            <CommandItem value="download all citations bibtex" keywords={["bib", "bibtex", "citations"]} onSelect={() => run(() => download("/publications.bib"))}>
              <span className="cmdk-title">Download all citations (.bib)</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter>
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> to move
          </span>
          <span>
            <kbd>Enter</kbd> to open
          </span>
          <span>
            <kbd>Esc</kbd> to close
          </span>
        </CommandFooter>
      </Command>
    </CommandDialog>
  )
}
