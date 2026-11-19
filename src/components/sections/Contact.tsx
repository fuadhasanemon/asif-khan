import Link from "next/link"
import site from "@content/site.json"
import sections from "@content/sections.json"

import { CopyButton } from "@/components/site/CopyButton"
import { CurrentYear } from "@/components/site/CurrentYear"

const isTodo = (href: string) => href.trim().toUpperCase().startsWith("TODO")

/** Contact block on Ledger with the site footer (prototype `#contact`). */
export function Contact() {
  const { contact } = site
  const labels = sections.contact
  // TODO profile links are hidden in production and listed in a build-time warning.
  const profiles = contact.profiles.filter((p) => !isTodo(p.href) || process.env.NODE_ENV !== "production")

  return (
    <section id="contact" className="contact on-ledger">
      <div className="wrap">
        <p className="contact-statement" data-reveal="">
          {contact.statement}
        </p>
        <div className="contact-grid">
          <div>
            <h3 className="c-h">{labels.emailHeading}</h3>
            <a className="c-email" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
            <div className="c-actions">
              <CopyButton
                className="btn btn-outline-light c-copy"
                text={contact.email}
                label="Copy email"
                doneLabel="Email copied"
                failLabel="Copy blocked; select the address"
              />
            </div>
          </div>
          <div>
            <h3 className="c-h">{labels.profilesHeading}</h3>
            <ul className="c-links">
              {profiles.map((p) =>
                isTodo(p.href) ? (
                  <li key={p.label}>
                    <span className="c-todo" title={p.href}>
                      {p.label} (link to add)
                    </span>
                  </li>
                ) : (
                  <li key={p.label}>
                    <a href={p.href}>{p.label}</a>
                  </li>
                ),
              )}
            </ul>
          </div>
          <div>
            <h3 className="c-h">{labels.locationHeading}</h3>
            <p className="c-p">{contact.location}</p>
            <a className="btn btn-brass c-cv" href={contact.cvPath}>
              Download CV
            </a>
          </div>
        </div>
        <footer className="foot">
          <span>
            © <CurrentYear /> {site.name}
          </span>
          <Link href="/#top">Back to top</Link>
        </footer>
      </div>
    </section>
  )
}
