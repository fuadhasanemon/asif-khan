// Lists elements that overflow the viewport or clip their own text, per width.
// Usage: node scripts/overflow-audit.mjs <url> [widths] [--text-spacing]
// --text-spacing applies the WCAG 1.4.12 overrides (line height 1.5, paragraph
// spacing 2em, letter spacing .12em, word spacing .16em) before checking.
import { chromium } from "@playwright/test"
const args = process.argv.slice(2)
const spacing = args.includes("--text-spacing")
const [url, widthsArg = "1440,1280,1024,768,390,360"] = args.filter((a) => !a.startsWith("--"))
const browser = await chromium.launch()
for (const w of widthsArg.split(",").map(Number)) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" })
  await page.goto(url, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
  if (spacing)
    await page.addStyleTag({
      content: "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}",
    })
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
