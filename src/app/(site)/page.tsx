import { site } from "@/lib/content"

/** Step 1 shell. Sections land in step 3. */
export default function HomePage() {
  return (
    <section id="top" className="hero on-ledger">
      <div className="wrap hero-inner">
        <p className="hero-kicker">{site.role}</p>
        <h1 className="hero-name">{site.name}</h1>
        <p className="hero-statement">{site.heroStatement}</p>
      </div>
    </section>
  )
}
