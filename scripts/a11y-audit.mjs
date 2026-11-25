// WCAG 2.1 A/AA check with axe-core on the main pages, at desktop and phone widths.
// Usage: node scripts/a11y-audit.mjs <baseUrl>
import AxeBuilder from "@axe-core/playwright"
import { chromium } from "@playwright/test"

const base = process.argv[2] ?? "http://localhost:3100"
const paths = ["/", "/publications", "/publications/sentiment-analysis-datasets-a-review-of-trends", "/admin", "/no-such-page"]
const browser = await chromium.launch()
let total = 0
for (const width of [1440, 390]) {
  for (const reducedMotion of ["reduce", "no-preference"]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion })
    const page = await context.newPage()
    for (const path of paths) {
      await page.goto(base + path, { waitUntil: "networkidle" })
      await page.evaluate(() => document.fonts.ready)
      // Let entrance animations finish so colour contrast is measured on the settled page.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 120))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(1500)
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()
      total += violations.length
      const head = `${width}px ${reducedMotion} ${path}`
      if (!violations.length) console.log(`${head}: ok`)
      for (const v of violations) {
        console.log(`${head}: [${v.impact}] ${v.id}: ${v.help}`)
        for (const n of v.nodes.slice(0, 4)) console.log(`    ${n.target.join(" ")}  ${n.failureSummary?.split("\n")[1]?.trim() ?? ""}`)
      }
    }
    await context.close()
  }
}
await browser.close()
process.exit(total ? 1 : 0)
