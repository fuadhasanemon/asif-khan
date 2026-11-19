// Screenshot helper for visual QA.
// Usage: node scripts/shoot.mjs <url> <outDir> [widths] [--menu] [--sections] [--reduced] [--nojs]
import { chromium } from "@playwright/test"

const [url, out, widthsArg = "1440,390"] = process.argv.slice(2)
const flag = (f) => process.argv.includes(f)
const SECTIONS = ["top", "about", "research", "experience", "skills", "publications", "recognition", "contact"]

const browser = await chromium.launch()
for (const w of widthsArg.split(",").map(Number)) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 900 },
    reducedMotion: flag("--reduced") ? "reduce" : "no-preference",
    javaScriptEnabled: !flag("--nojs"),
  })
  const page = await ctx.newPage()
  const errors = []
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
  page.on("pageerror", (e) => errors.push(String(e)))
  await page.goto(url, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1700) // past the motion failsafe and CSS entrances

  if (flag("--sections")) {
    for (const id of SECTIONS) {
      const el = page.locator(`#${id}`)
      if (!(await el.count())) continue
      await el.scrollIntoViewIfNeeded()
      await page.waitForTimeout(250)
      await el.screenshot({ path: `${out}/${w}-${id}.png` })
    }
  } else {
    await page.screenshot({ path: `${out}/full-${w}.png`, fullPage: true })
  }

  if (flag("--menu") && w <= 760) {
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.getByRole("button", { name: "Open menu" }).click()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${out}/menu-${w}.png` })
    await page.keyboard.press("Escape")
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  const h1 = await page.locator("h1").count()
  console.log(`${w}px: errors=${JSON.stringify(errors)} h-overflow=${overflow}px h1=${h1}`)
  await ctx.close()
}
await browser.close()
