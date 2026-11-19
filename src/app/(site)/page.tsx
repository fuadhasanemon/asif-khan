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

export const metadata: Metadata = { alternates: { canonical: "/" } }

/** Home: every section in prototype order. Contact and the footer come from the (site) layout. */
export default function HomePage() {
  return (
    <>
      <JsonLd data={personLd()} />
      <Hero />
      <About />
      <Research />
      <Experience />
      <Methods />
      <Publications />
      <Recognition />
    </>
  )
}
