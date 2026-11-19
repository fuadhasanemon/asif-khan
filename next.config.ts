import { join } from "node:path"
import type { NextConfig } from "next"

import { checkContent } from "./src/lib/content-check"

// Validate content/*.json before anything renders: errors fail `next build` and
// `next dev`; TODO profile links and missing abstracts are printed as warnings.
checkContent(join(process.cwd(), "content"))

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()) },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [{ source: "/cv", destination: "/files/Md-Asif-Khan-CV.pdf", permanent: false }]
  },
}

export default nextConfig
