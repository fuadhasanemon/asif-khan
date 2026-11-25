// Lists elements that overflow the viewport or clip their own text, per width.
// Usage: node scripts/overflow-audit.mjs <url> [widths]
import { chromium } from "@playwright/test"
const [url, widthsArg = "1440,1280,1024,768,390,360"] = process.argv.slice(2)
const browser = await chromium.launch()
for (const w of widthsArg.split(",").map(Number)) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" })
  await page.goto(url, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
  const issues = await page.evaluate(() => {
    const out = []
    const vw = document.documentElement.clientWidth
    const scrollers = (el) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const o = getComputedStyle(p).overflowX
        if (o === "auto" || o === "scroll") return true
      }
      return false
    }
    for (const el of document.querySelectorAll("body *")) {
      if (el.closest("[aria-hidden=true], canvas, svg, .sr, .skip-link, .particles, .scene")) continue
      const cs = getComputedStyle(el)
      if (cs.display === "none" || cs.visibility === "hidden" || cs.position === "fixed") continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const label = `${el.tagName.toLowerCase()}.${[...el.classList].join(".")} "${(el.textContent || "").trim().slice(0, 40)}"`
      if (!scrollers(el) && (r.right > vw + 1 || r.left < -1)) out.push(`offscreen ${Math.round(r.left)}..${Math.round(r.right)} ${label}`)
      if (cs.overflowX === "hidden" && el.scrollWidth > el.clientWidth + 1 && el.children.length === 0)
        out.push(`clipped-text ${el.scrollWidth}>${el.clientWidth} ${label}`)
    }
    return [...new Set(out)].slice(0, 25)
  })
  console.log(`${w}px: ${issues.length ? "\n  " + issues.join("\n  ") : "ok"}`)
  await page.close()
}
await browser.close()
