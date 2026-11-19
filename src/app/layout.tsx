import type { Metadata, Viewport } from "next"
import { Newsreader, Public_Sans } from "next/font/google"

import { motionBootScript } from "@/lib/motion-boot"
import { site } from "@/lib/content"
import { Toaster } from "@/components/ui/sonner"
import { MotionProvider } from "@/components/motion/MotionProvider"
import { MotionRuntime } from "@/components/motion/MotionRuntime"
import "./globals.css"

const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-newsreader",
})

const publicSans = Public_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-public-sans",
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
      className={`${newsreader.variable} ${publicSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <MotionRuntime />
        <Toaster />
      </body>
    </html>
  )
}
