// Usage: node scripts/shoot.mjs <url> <outDir> [widths comma-separated] [--menu]
import { chromium } from "@playwright/test"
const [url, out, widthsArg = "1440,390"] = process.argv.slice(2)
const menu = process.argv.includes("--menu")
const browser = await chromium.launch()
for (const w of widthsArg.split(",").map(Number)) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } })
  const errors = []
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
  page.on("pageerror", (e) => errors.push(String(e)))
  await page.goto(url, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1700) // past the motion failsafe
  await page.screenshot({ path: `${out}/full-${w}.png`, fullPage: true })
  if (menu && w <= 760) {
    await page.getByRole("button", { name: "Open menu" }).click()
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${out}/menu-${w}.png` })
    const focused = await page.evaluate(() => document.activeElement?.textContent?.trim())
    await page.keyboard.press("Escape")
    await page.waitForTimeout(200)
    const stillOpen = await page.locator(".sheet-menu").count()
    console.log(`menu@${w}: first focus="${focused}", open after Esc=${stillOpen}`)
  }
  const fonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family))
  console.log(`${w}px: errors=${JSON.stringify(errors)} fonts=${[...new Set(fonts)].join(", ")}`)
  await page.close()
}
await browser.close()
