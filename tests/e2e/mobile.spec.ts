import { expect, test } from "@playwright/test"

test.describe("mobile menu", () => {
  test("opens as a sheet, traps focus, closes on Esc and on navigation", async ({ page }) => {
    await page.goto("/")
    const open = page.getByRole("button", { name: "Open menu" })
    await open.click()
    const dialog = page.getByRole("dialog", { name: "Menu" })
    await expect(dialog).toBeVisible()

    // Focus stays inside the sheet while tabbing through all of its controls and beyond.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab")
      expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true)
    }

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(open).toBeFocused()

    await open.click()
    await dialog.getByRole("link", { name: "Experience" }).click()
    await expect(dialog).toBeHidden()
    await expect(page.locator("#experience")).toBeInViewport()
  })

  test("research tabs and the methods matrix scroll sideways without page overflow", async ({ page }) => {
    await page.goto("/")
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    const scrolls = (sel: string) => page.locator(sel).evaluate((el) => el.scrollWidth > el.clientWidth)
    expect(await scrolls(".rtabs")).toBe(true)
    expect(await scrolls(".matrix-box")).toBe(true)
  })
})
