import { Analytics } from "@vercel/analytics/next"

/**
 * Vercel Analytics, off unless NEXT_PUBLIC_ANALYTICS=vercel at build time.
 * When off, nothing renders and no analytics script is requested.
 */
export function SiteAnalytics() {
  return process.env.NEXT_PUBLIC_ANALYTICS === "vercel" ? <Analytics /> : null
}
