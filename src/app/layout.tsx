import type { Metadata, Viewport } from "next"
import { JetBrains_Mono } from "next/font/google"

import { motionBootScript } from "@/lib/motion-boot"
import { site } from "@/lib/content"
import { Toaster } from "@/components/ui/sonner"
import { MotionProvider } from "@/components/motion/MotionProvider"
import { MotionRuntime } from "@/components/motion/MotionRuntime"
import { SiteAnalytics } from "@/components/site/SiteAnalytics"
import "./globals.css"

/**
 * Headings: JetBrains Mono (self-hosted). Paragraphs: SF Mono where the system
 * has it (Apple platforms; Apple's licence does not allow serving it as a web
 * font), falling back to the same JetBrains Mono so no second font downloads.
 * See --font-serif / --font-sans in globals.css.
 */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-jetbrains",
})

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.heroStatement,
}

export const viewport: Viewport = {
  themeColor: "#12312C",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={jetbrains.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <MotionRuntime />
        <Toaster />
        <SiteAnalytics />
      </body>
    </html>
  )
}
