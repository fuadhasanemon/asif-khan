import { navItems, publications, site } from "@/lib/content"
import { ME } from "@/lib/schemas"
import { BackToTop } from "@/components/site/BackToTop"
import { CommandMenu } from "@/components/site/CommandMenu"
import { SiteHeader } from "@/components/site/SiteHeader"
import { Contact } from "@/components/sections/Contact"

export default function SiteLayout({ children }: LayoutProps<"/">) {
  const palettePublications = publications.map((p) => ({
    id: p.id,
    title: p.title,
    href: p.href,
    meta: [p.kindLabel, p.year ?? p.status].filter(Boolean).join(", "),
    keywords: [...p.authors.filter((a) => a !== ME), p.venueLine, p.kindLabel],
  }))
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Contact />
      <BackToTop />
      <CommandMenu
        sections={navItems}
        publications={palettePublications}
        email={site.contact.email}
        cvPath={site.contact.cvPath}
      />
    </>
  )
}
