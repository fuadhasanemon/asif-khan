import { siteIcon } from "@/lib/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

/** Home-screen icon for iOS (square; iOS rounds the corners itself). */
export default function AppleIcon() {
  return siteIcon(180, { rounded: false })
}
