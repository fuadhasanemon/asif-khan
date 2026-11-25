import { expect, test } from "@playwright/test"

import { gotoReady } from "./ready"

test.describe("home page", () => {
  test("renders every section, one h1, no console errors", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(String(e)))
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
    await gotoReady(page, "/")
    for (const id of ["top", "about", "research", "experience", "skills", "publications", "recognition", "contact"])
      await expect(page.locator(`#${id}`)).toBeAttached()
    await expect(page.locator("h1")).toHaveCount(1)
    await expect(page.locator("h1")).toHaveText("Md. Asif Khan")
    expect(errors).toEqual([])
  })

  test("research: switching threads updates the stage and the URL", async ({ page }) => {
    await gotoReady(page, "/")
    const tabs = page.getByRole("group", { name: "Research lines" })
    const mig = tabs.getByRole("button", { name: /Migration policy/ })
    await mig.click()
    await expect(mig).toHaveAttribute("aria-pressed", "true")
    await expect(page.locator("#research-stage h3")).toHaveText("Migration policy and the limits of state authority")
    await expect(page).toHaveURL(/#research\?thread=mig$/)
    // keyboard: Space activates a thread button
    const ai = tabs.getByRole("button", { name: /AI, GovTech/ })
    await ai.focus()
    await page.keyboard.press("Space")
    await expect(page.locator("#research-stage h3")).toHaveText("AI, GovTech, and public administration")
  })

  test("research: /#research?thread=ai deep link selects the thread and scrolls to it", async ({ page }) => {
    await gotoReady(page, "/#research?thread=ai")
    await expect(page.locator("#research-stage h3")).toHaveText("AI, GovTech, and public administration")
    await expect(page.locator("#research")).toBeInViewport()
  })

  test("experience: chart bar selects a role; timeline row toggles it; hover is shared", async ({ page }) => {
    await gotoReady(page, "/")
    const bar = page.getByRole("button", { name: /^Research Intern, Autismazing/ })
    await bar.click()
    await expect(bar).toHaveAttribute("aria-pressed", "true")
    const row = page.locator(".tl-btn", { hasText: "Autismazing" })
    await expect(row).toHaveAttribute("aria-expanded", "true")
    await expect(page.locator("#role-aut")).toBeVisible()
    await expect(page.locator("#role-ta")).toBeHidden()
    await row.click()
    await expect(row).toHaveAttribute("aria-expanded", "false")
    await page.locator(".tl-btn", { hasText: "General Secretary" }).hover()
    await expect(page.locator(".chart-row").first()).toHaveClass(/is-hot/)
  })

  test("methods: selecting a row updates the live panel, including CV-only methods", async ({ page }) => {
    await gotoReady(page, "/")
    await page.getByRole("button", { name: /^Comparative case study/ }).click()
    await expect(page.locator("#method-panel .m-title")).toHaveText("Comparative case study")
    await expect(page.locator("#method-panel")).toContainText("Supervised by Dr. Julia Albarracín")
    await page.getByRole("button", { name: /^Process tracing/ }).press("Enter")
    await expect(page.locator("#method-panel .m-cv-only")).toHaveText(/Listed on the CV/)
    await expect(page.locator("main")).not.toContainText("[Add")
  })

  test("back to top appears after the hero and returns focus to main", async ({ page }) => {
    await gotoReady(page, "/")
    await expect(page.getByRole("link", { name: "Back to top" }).last()).toBeAttached()
    await page.evaluate(() => window.scrollTo(0, 2000))
    const btn = page.locator(".totop")
    await expect(btn).toBeVisible()
    await btn.click()
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10)
    await expect(page.locator("#main")).toBeFocused()
  })

  test("scroll spy marks the current section; Recognition maps to Publications", async ({ page }) => {
    await gotoReady(page, "/")
    const nav = page.getByRole("navigation", { name: "Sections" }).first()
    await page.locator("#experience").evaluate((el) => el.scrollIntoView())
    await expect(nav.getByRole("link", { name: "Experience" })).toHaveAttribute("aria-current", "true")
    await page.locator("#recognition").evaluate((el) => el.scrollIntoView())
    await expect(nav.getByRole("link", { name: "Publications" })).toHaveAttribute("aria-current", "true")
  })
})
