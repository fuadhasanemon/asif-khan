import type { Metadata } from "next"

import { personLd } from "@/lib/structured-data"
import { JsonLd } from "@/components/site/JsonLd"
import { About } from "@/components/sections/About"
import { Experience } from "@/components/sections/Experience"
import { Hero } from "@/components/sections/Hero"
import { Methods } from "@/components/sections/Methods"
import { Publications } from "@/components/sections/Publications"
import { Recognition } from "@/components/sections/Recognition"
import { Research } from "@/components/sections/Research"
import { sections } from "@/lib/content"
import type { HomeSectionIdT } from "@/lib/schemas"

/** Section order comes from content/sections.json (homeOrder), editable in the admin panel. */
const HOME_SECTIONS: Record<HomeSectionIdT, () => React.JSX.Element> = {
  publications: Publications,
  research: Research,
  about: About,
  experience: Experience,
  skills: Methods,
  recognition: Recognition,
}

export const metadata: Metadata = { alternates: { canonical: "/" } }

/** Home: the hero, then every section in the configured order. Contact and the footer come from the (site) layout. */
export default function HomePage() {
  return (
    <>
      <JsonLd data={personLd()} />
      <Hero />
      {sections.homeOrder.map((id) => {
        const Section = HOME_SECTIONS[id]
        return <Section key={id} />
      })}
    </>
  )
}
