import type { NextConfig } from "next"

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
