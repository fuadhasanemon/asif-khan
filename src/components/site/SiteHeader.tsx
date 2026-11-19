import Link from "next/link"
import { sections, site } from "@/lib/content"

import { MobileMenu } from "./MobileMenu"

/**
 * Sticky Ledger bar (prototype `.nav`). Scroll spy, `aria-current` and the
 * reading-progress scrub are wired in the interaction and motion steps.
 */
export function SiteHeader() {
  const nav = sections.nav.map((n) => ({ href: `/#${n.id}`, label: n.label, id: n.id }))

  return (
    <header className="nav on-ledger">
      <div className="wrap navrow">
        <Link href="/#top" className="brand">
          {site.name}
        </Link>
        <nav aria-label="Sections" className="navlinks">
          {nav.map((n) => (
            <Link key={n.id} href={n.href} data-nav-id={n.id}>
              {n.label}
            </Link>
          ))}
        </nav>
        <a className="btn btn-outline-light nav-cv" href={site.contact.cvPath}>
          Download CV
        </a>
        <MobileMenu brand={site.name} items={nav} cvPath={site.contact.cvPath} />
      </div>
      <div className="progress" aria-hidden="true">
        <span data-progress style={{ transform: "scaleX(0)" }} />
      </div>
    </header>
  )
}
