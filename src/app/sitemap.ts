import type { MetadataRoute } from "next"

import { absoluteUrl, publications } from "@/lib/content"

/** Home, the publication index, and every publication page. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/publications"), changeFrequency: "monthly", priority: 0.8 },
    ...publications.map((p) => ({
      url: absoluteUrl(p.href),
      changeFrequency: "yearly" as const,
      priority: p.type === "journal" || p.type === "conference" ? 0.7 : 0.5,
    })),
  ]
}
