"use client"

import Link from "next/link"
import { useState } from "react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { useActiveSection } from "@/hooks/useActiveSection"

type Item = { id: string; href: string; label: string }

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M3 7h16M3 15h16" />
  </svg>
)
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M5 5l12 12M17 5L5 17" />
  </svg>
)

/**
 * Mobile menu as a top-anchored Sheet (Radix Dialog: focus trap, Esc, aria-modal).
 * The sheet repeats the 60 px bar (brand + close) so it reads exactly like the
 * prototype's drop-down while keeping the close control inside the focus trap.
 * Built on the Radix primitive directly because the shadcn SheetContent's
 * default chrome (shadow, close button, slide classes) is all replaced here.
 */
export function MobileMenu({ brand, items, cvPath }: { brand: string; items: Item[]; cvPath: string }) {
  const [open, setOpen] = useState(false)
  const active = useActiveSection()
  const close = () => setOpen(false)

  return (
    <SheetPrimitive.Root open={open} onOpenChange={setOpen}>
      <SheetPrimitive.Trigger className="menu-btn" aria-label="Open menu">
        <MenuIcon />
      </SheetPrimitive.Trigger>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay className="sheet-overlay" />
        <SheetPrimitive.Content className="sheet-menu nav on-ledger" aria-describedby={undefined}>
          <SheetPrimitive.Title className="sr">Menu</SheetPrimitive.Title>
          <div className="wrap navrow">
            <Link href="/#top" className="brand" onClick={close}>
              {brand}
            </Link>
            <SheetPrimitive.Close className="menu-btn" aria-label="Close menu">
              <CloseIcon />
            </SheetPrimitive.Close>
          </div>
          <nav className="mobile-menu" aria-label="Sections">
            {items.map((n) => (
              <Link
                key={n.id}
                href={n.href}
                onClick={close}
                className={n.id === active ? "is-active" : undefined}
                aria-current={n.id === active ? "true" : undefined}
              >
                {n.label}
              </Link>
            ))}
            <a className="btn btn-brass mm-cv" href={cvPath}>
              Download CV
            </a>
          </nav>
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  )
}
