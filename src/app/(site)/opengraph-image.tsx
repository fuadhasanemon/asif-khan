import { site } from "@/lib/content"
import { OG_SIZE, personCard } from "@/lib/og"

export const alt = `${site.name}, ${site.role.toLowerCase()}`
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return personCard({
    name: site.name,
    role: site.role,
    statement: site.heroStatement,
    domain: new URL(site.domain).host,
  })
}
