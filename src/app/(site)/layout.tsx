import { BackToTop } from "@/components/site/BackToTop"
import { SiteHeader } from "@/components/site/SiteHeader"
import { Contact } from "@/components/sections/Contact"

export default function SiteLayout({ children }: LayoutProps<"/">) {
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
    </>
  )
}
