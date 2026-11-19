import Link from "next/link"
import { sections, site } from "@/lib/content"

import { MobileMenu } from "./MobileMenu"
import { NavLinks } from "./NavLinks"

/**
 * Sticky Ledger bar (prototype `.nav`). Scroll spy lives in NavLinks;
 * the reading-progress scrub is wired in the motion step.
 */
export function SiteHeader() {
  const nav = sections.nav.map((n) => ({ href: `/#${n.id}`, label: n.label, id: n.id }))

  return (
    <header className="nav on-ledger">
      <div className="wrap navrow">
        <Link href="/#top" className="brand">
          {site.name}
        </Link>
        <NavLinks items={nav} />
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
