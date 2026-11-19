import Link from "next/link"

import { site } from "@/lib/content"

/**
 * Hero (prototype `#top`). Server-rendered, so the name is the LCP element.
 * The particle field and the GSAP entrance timeline mount in later steps;
 * `data-hero-*` hooks mark what the timeline animates.
 */
export function Hero() {
  const [first, ...rest] = splitName(site.name)
  const { announcement } = site

  return (
    <section id="top" className="hero on-ledger" aria-labelledby="hero-name">
      <div className="wrap hero-inner">
        <p className="hero-kicker" data-hero-line="">
          {site.role}
        </p>
        <h1 className="hero-name" id="hero-name">
          <span className="mask">
            <span className="mask-in" data-hero-mask="">
              {first}
            </span>
          </span>{" "}
          <span className="mask">
            <span className="mask-in m2" data-hero-mask="">
              {rest.join(" ")}
            </span>
          </span>
        </h1>
        <p className="hero-statement" data-hero-line="">
          {site.heroStatement}
        </p>
        <p className="hero-sub" data-hero-line="">
          {site.heroSub}
        </p>
        <div className="hero-actions" data-hero-line="">
          <Link className="btn btn-brass" href="/#research">
            Explore research
          </Link>
          <a className="btn btn-outline-light" href={site.contact.cvPath}>
            Download CV
          </a>
        </div>
      </div>
      <div className="wrap hero-foot" data-hero-line="">
        <span className="hf-label">{announcement.label}</span>
        <span>
          {announcement.text} <Link href={announcement.href}>{announcement.linkText}</Link>
        </span>
        <Link href="/#about" className="scroll-cue">
          <span>Scroll</span>
          <span className="cue-line" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

/** "Md. Asif Khan" → ["Md. Asif", "Khan"]: the prototype masks the surname as its own line. */
function splitName(name: string): string[] {
  const parts = name.split(" ")
  const last = parts.pop() ?? ""
  return [parts.join(" "), last]
}
