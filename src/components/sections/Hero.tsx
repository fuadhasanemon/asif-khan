import Link from "next/link"

import { site } from "@/lib/content"
import { HeroPlayedFlag } from "@/components/motion/HeroPlayedFlag"
import { HeroScene } from "@/components/motion/HeroScene"
import { MotionToggle } from "@/components/motion/MotionToggle"
import { HeroFieldLoader } from "@/components/viz/hero-field/HeroFieldLoader"

/**
 * Hero (prototype `#top`). Server-rendered, so the name is the LCP element.
 *
 * The entrance uses the prototype's own CSS keyframes (`.mask-in` name rise,
 * `.rise` lines with delays .1/.42/.6/.6/.85 s), not GSAP: it starts at first
 * paint without waiting for JavaScript, so LCP never depends on the JS bundle,
 * and it still ends fully visible with JS off. Reduced motion disables it via
 * the prototype's media query. The particle field loads when the page is idle.
 */
export function Hero() {
  const [first, ...rest] = splitName(site.name)
  const { announcement } = site

  return (
    <>
    <section id="top" className="hero on-ledger" aria-labelledby="hero-name">
      <HeroFieldLoader />
      <HeroScene />
      <HeroPlayedFlag />
      <div className="wrap hero-inner">
        <p className="hero-kicker rise d1">
          {site.role}
        </p>
        <h1 className="hero-name" id="hero-name">
          <span className="mask">
            <span className="mask-in">
              {first}
            </span>
          </span>{" "}
          <span className="mask">
            <span className="mask-in m2">
              {rest.join(" ")}
            </span>
          </span>
        </h1>
        <p className="hero-statement rise d3">
          {site.heroStatement}
        </p>
        <p className="hero-sub rise d4">
          {site.heroSub}
        </p>
        <div className="hero-actions rise d4">
          <Link className="btn btn-brass" href="/#research">
            Explore research
          </Link>
          <a className="btn btn-outline-light" href={site.contact.cvPath}>
            Download CV
          </a>
        </div>
      </div>
      <div className="wrap hero-foot rise d5">
        <span className="hf-label">{announcement.label}</span>
        <span>
          {announcement.text} <Link href={announcement.href}>{announcement.linkText}</Link>
        </span>
        <MotionToggle className="on-dark" />
        <Link href="/#about" className="scroll-cue">
          <span>Scroll</span>
          <span className="cue-line" aria-hidden="true" />
        </Link>
      </div>
    </section>
    {/* Scroll distance for the pinned scene, reserved from first paint (see motion.css). */}
    <div className="scene-spacer" aria-hidden="true" />
    </>
  )
}

/** "Md. Asif Khan" → ["Md. Asif", "Khan"]: the prototype masks the surname as its own line. */
function splitName(name: string): string[] {
  const parts = name.split(" ")
  const last = parts.pop() ?? ""
  return [parts.join(" "), last]
}
