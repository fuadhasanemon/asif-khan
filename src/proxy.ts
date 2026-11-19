import { NextResponse, type NextRequest } from "next/server"

import publications from "@content/publications.json"

/**
 * Real 404 status for unknown publication slugs.
 *
 * With Cache Components, `dynamicParams = false` is unavailable and unknown
 * params render at request time behind a streamed shell, so `notFound()` can
 * only send a soft 404 (status 200 + noindex). This proxy runs only on
 * /publications/<slug>(/bib) and rewrites unknown slugs to a path with no
 * route, which Next answers with the not-found page and status 404.
 * Known slugs pass straight through to the prerendered pages.
 */
const SLUGS = new Set(publications.map((p) => p.slug))

export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2] ?? ""
  if (SLUGS.has(decodeURIComponent(slug))) return NextResponse.next()
  return NextResponse.rewrite(new URL("/_unknown-publication", request.url))
}

export const config = {
  matcher: ["/publications/:slug", "/publications/:slug/bib"],
}
