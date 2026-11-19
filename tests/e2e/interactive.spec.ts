import { expect, test } from "@playwright/test"

import { gotoReady } from "./ready"

test.describe("hero scroll scene (desktop)", () => {
  test("pins without shifting the page and walks through the three beats", async ({ page }) => {
    await gotoReady(page, "/")
    await expect(page.locator("html")).toHaveAttribute("data-scene-pinned", "")
    const aboutTop = () => page.evaluate(() => document.getElementById("about")!.getBoundingClientRect().top + window.scrollY)
    const before = await aboutTop()
    const vh = await page.evaluate(() => window.innerHeight)
    const caption = (i: number) => page.locator(".scene-caption [data-beat]").nth(i)

    await page.evaluate((y) => window.scrollTo(0, y), vh * 0.3)
    await expect.poll(() => caption(0).evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.9)
    await expect(page.locator("#hero-name")).toBeInViewport() // hero is held in place

    await page.evaluate((y) => window.scrollTo(0, y), vh * 0.98)
    await expect.poll(() => caption(2).evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.9)
    await expect.poll(() => page.locator("[data-gate]").evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.9)

    // The pin swapped in equal spacing: About did not move.
    expect(Math.abs((await aboutTop()) - before)).toBeLessThan(2)
  })
})

test.describe("career chart year guide", () => {
  test("follows the pointer, flags the month, and dims inactive roles", async ({ page }) => {
    await gotoReady(page, "/")
    const chart = page.locator("#experience .chart")
    await chart.scrollIntoViewIfNeeded()
    const track = page.locator(".chart-track").first()
    const box = (await track.boundingBox())!
    // 2025.5 on a 2017–2027 axis is 85% across.
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height / 2)
    await expect(page.locator(".chart-flag")).toContainText("Jul 2025")
    // Jul 2025: BSA, TA, RPED and department service; the Neurodiversity (Sep) and
    // Autismazing (ended May) internships are outside, as is Dhaka (2017–2023).
    await expect(page.locator(".chart-flag")).toContainText("4 roles")
    await expect(page.locator(".chart-row.is-off")).toHaveCount(3)
    await page.mouse.move(box.x + box.width * 0.85, box.y - 200)
    await expect(page.locator(".chart-flag")).toHaveCount(0)
  })

  test("keyboard: focusing a bar moves the guide to that role's start", async ({ page }) => {
    await gotoReady(page, "/")
    await page.getByRole("button", { name: /^Student leadership, University of Dhaka/ }).focus()
    await expect(page.locator(".chart-flag")).toContainText("Jan 2017")
  })
})

test.describe("methods crosshair", () => {
  test("a method lights its projects; a project lights its methods", async ({ page }) => {
    await gotoReady(page, "/")
    await page.locator("#skills .matrix-box").scrollIntoViewIfNeeded()
    await page.getByRole("button", { name: /^Survey design and analysis/ }).hover()
    await expect(page.locator("th.mx-col.is-col")).toHaveCount(1)
    await expect(page.locator("th.mx-col.is-col")).toContainText("Autism in Focus survey")
    await expect(page.locator(".dot.is-x")).toHaveCount(1)

    // Hover the Autism column header's cells: three methods used it.
    await page.locator("tr.mx-row").nth(1).locator("td").first().hover()
    await expect(page.locator("tr.mx-row.is-x")).toHaveCount(1) // row + column crossing
    await page.locator("thead").hover()
  })
})

test.describe("responsive research diagrams", () => {
  test("counting: the reference line follows the pointer and short counts recede", async ({ page }) => {
    await gotoReady(page, "/")
    const svg = page.locator("#research-stage svg")
    await svg.scrollIntoViewIfNeeded()
    const box = (await svg.boundingBox())!
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2)
    await expect(page.locator("#research-stage .a-bar.d-dim").first()).toBeAttached()
    const dimmed = await page.locator("#research-stage .a-bar.d-dim").count()
    expect(dimmed).toBeGreaterThanOrEqual(3)
  })

  test("AI: holding the pointer on the checkpoint pauses the cases", async ({ page }) => {
    await gotoReady(page, "/")
    await page.getByRole("button", { name: /AI, GovTech/ }).click()
    // Wait until the cross-fade has swapped in the AI stage (the old one is briefly still exiting).
    await expect(page.locator("#research-stage h3")).toHaveText("AI, GovTech, and public administration")
    await expect(page.locator("#research-stage svg")).toHaveCount(1)
    const svg = page.locator("#research-stage svg")
    const box = (await svg.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await expect(svg).toHaveClass(/is-held/)
  })
})
