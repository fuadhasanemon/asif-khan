import type { Metadata } from "next"
import Link from "next/link"

import { SiteHeader } from "@/components/site/SiteHeader"
import { Contact } from "@/components/sections/Contact"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
}

/** 404 in the site's style: the Ledger header, a section-style head, and ways back. */
export default function NotFound() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section className="section first page-top nf" aria-labelledby="nf-h">
          <div className="wrap">
            <div className="sec-head">
              <span className="sec-rule" aria-hidden="true" />
              <h1 className="h2" id="nf-h">
                Page not found
              </h1>
              <p className="sec-intro">The address may be mistyped, or the page may have moved. These will get you back on track.</p>
            </div>
            <ul className="nf-links">
              <li>
                <Link href="/" className="nf-link">
                  <span className="nf-t">Home</span>
                  <span className="nf-m">Research, experience, methods and publications</span>
                </Link>
              </li>
              <li>
                <Link href="/publications" className="nf-link">
                  <span className="nf-t">All publications</span>
                  <span className="nf-m">Search by title, coauthor or venue</span>
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="nf-link">
                  <span className="nf-t">Contact</span>
                  <span className="nf-m">Questions about a paper or a possible collaboration</span>
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Contact />
    </>
  )
}
