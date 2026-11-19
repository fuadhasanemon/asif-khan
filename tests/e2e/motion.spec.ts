import { expect, test, type Page } from "@playwright/test"

test.describe.configure({ mode: "serial" })

const opacityOf = (page: Page, sel: string) =>
  page.locator(sel).first().evaluate((el) => Number(getComputedStyle(el).opacity))

/**
 * True when the particle canvas visibly draws something. tsParticles v4 renders
 * through an OffscreenCanvas, so pixels cannot be read from the page; compare
 * screenshots of the field with and without the canvas instead.
 */
async function fieldDraws(page: Page): Promise<boolean> {
  const hero = page.locator("#top")
  const withField = await hero.screenshot({ animations: "allow" })
  await page.locator(".particles").evaluate((el) => ((el as HTMLElement).style.display = "none"))
  const without = await hero.screenshot({ animations: "allow" })
  await page.locator(".particles").evaluate((el) => ((el as HTMLElement).style.display = ""))
  return !withField.equals(without)
}

test.describe("motion on (default)", () => {
  test("flag is claimed, sections reveal on scroll, numbers count up, chart bars grow", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(1800) // past the failsafe
    await expect(page.locator("html")).toHaveAttribute("data-motion-ready", "")
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-fallback", "")
    await expect(page.locator("#hero-name")).toBeVisible()

    // Below the fold and not yet revealed
    await expect(page.locator("#experience .chart")).not.toHaveAttribute("data-shown", "")
    expect(await opacityOf(page, "#experience .chart")).toBe(0)

    await page.locator("#about .record").scrollIntoViewIfNeeded()
    await expect(page.locator(".rec-num").first()).toHaveText("4.00", { timeout: 4000 })
    await expect(page.locator(".rec-num").nth(3)).toHaveText("96")

    await page.locator("#experience .chart").scrollIntoViewIfNeeded()
    await expect(page.locator("#experience .chart")).toHaveAttribute("data-shown", "")
    await expect.poll(() => opacityOf(page, "#experience .chart"), { timeout: 3000 }).toBe(1)
    await expect
      .poll(() => page.locator(".chart-fill").last().evaluate((el) => getComputedStyle(el).transform), { timeout: 3000 })
      .toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/)
  })

  test("particle field loads behind the hero and draws", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("#hero-field canvas")).toBeAttached({ timeout: 6000 })
    await page.waitForTimeout(2800) // past the field's 2.4 s fade-in
    expect(await fieldDraws(page)).toBe(true)
    // The canvas never intercepts the pointer.
    expect(await page.locator(".particles").evaluate((el) => getComputedStyle(el).pointerEvents)).toBe("none")
  })

  test("reading-progress line tracks scroll", async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect
      .poll(() => page.locator("[data-progress]").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a))
      .toBeGreaterThan(0.98)
  })
})

test.describe("JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false })
  test("nothing is hidden and the default state renders", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-ready", "")
    for (const sel of ["#about .record", "#experience .chart", "#skills .matrix-box", "#publications .pub-tools", "#recognition .aw-grid > div"])
      expect(await opacityOf(page, sel)).toBe(1)
    await expect(page.locator(".rec-num").first()).toHaveText("4.00")
    await expect(page.locator(".pub-count")).toHaveText("Showing 18 of 18")
  })
})

test.describe("reduced motion", () => {
  test("end states immediately, loops replaced by still frames, particles still", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/")
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-ready", "")
    expect(await opacityOf(page, "#experience .chart")).toBe(1)
    await expect(page.locator(".rec-num").first()).toHaveText("4.00")

    // AI diagram: animated cases swapped for the still pair.
    await page.getByRole("button", { name: /AI, GovTech/ }).click()
    await expect(page.locator("#research-stage .loop-only")).toBeHidden()
    await expect(page.locator("#research-stage .still-only")).toBeVisible()

    // Particles render a still field. Let fonts and layout settle first: a hero
    // resize re-lays the field (as in the prototype), which would differ between shots.
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(page.locator("#hero-field canvas")).toBeAttached({ timeout: 6000 })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(1200)
    expect(await fieldDraws(page)).toBe(true)
    // The field settles into identical consecutive frames (nothing moves).
    await expect
      .poll(
        async () => {
          const a = await page.locator(".particles").screenshot({ animations: "allow" })
          await page.waitForTimeout(700)
          const b = await page.locator(".particles").screenshot({ animations: "allow" })
          return a.equals(b)
        },
        { timeout: 8000 },
      )
      .toBe(true)

    // …and the still frame survives a resize (a stopped loop would leave a blank canvas).
    await page.setViewportSize({ width: 1180, height: 900 })
    await page.waitForTimeout(1500)
    expect(await fieldDraws(page)).toBe(true)
  })
})

test.describe("failsafe", () => {
  test("if the app JS never runs, the 1.5 s failsafe reveals everything", async ({ page }) => {
    await page.route(/\/_next\/static\/chunks\/.*\.js/, (route) => route.abort())
    await page.goto("/")
    // The inline script ran and armed the flag…
    await expect(page.locator("html")).toHaveAttribute("data-motion-fallback", "", { timeout: 3000 })
    // …then released it, so content is visible.
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-ready", "")
    expect(await opacityOf(page, "#experience .chart")).toBe(1)
    expect(await opacityOf(page, "#about .record")).toBe(1)
  })
})
