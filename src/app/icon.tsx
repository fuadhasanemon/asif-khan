import { siteIcon } from "@/lib/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

/** Browser-tab favicon (PNG). A matching favicon.ico sits next to this file for older clients. */
export default function Icon() {
  return siteIcon(32, { rounded: true })
}
