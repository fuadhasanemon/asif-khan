"use client"

import Link from "next/link"

import { useActiveSection } from "@/hooks/useActiveSection"

export type NavItem = { id: string; href: string; label: string }

/** Desktop section links with scroll spy (`aria-current` + `.is-active`). */
export function NavLinks({ items }: { items: NavItem[] }) {
  const active = useActiveSection()
  return (
    <nav aria-label="Sections" className="navlinks">
      {items.map((n) => {
        const on = n.id === active
        return (
          <Link key={n.id} href={n.href} className={on ? "is-active" : undefined} aria-current={on ? "true" : undefined}>
            {n.label}
          </Link>
        )
      })}
    </nav>
  )
}
