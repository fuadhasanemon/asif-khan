import { expect, test } from "@playwright/test"

const count = (page: import("@playwright/test").Page) => page.locator(".pub-count")

test.describe("publication explorer", () => {
  test("filter by type via the composition bar, toggle off, and share via the URL", async ({ page }) => {
    await page.goto("/")
    await expect(count(page)).toHaveText("Showing 18 of 18")
    const journals = page.getByRole("group", { name: "Filter publications by type" }).getByRole("button", { name: /Journal articles/ })
    await journals.click()
    await expect(journals).toHaveAttribute("aria-pressed", "true")
    await expect(count(page)).toHaveText("Showing 3 of 18")
    await expect(page).toHaveURL(/#publications\?type=journal$/)
    await journals.click()
    await expect(count(page)).toHaveText("Showing 18 of 18")
  })

  test("search matches title, coauthor and venue, with a live count", async ({ page }) => {
    await page.goto("/")
    const q = page.getByRole("searchbox", { name: "Search" })
    await q.fill("peerj")
    await expect(count(page)).toHaveText("Showing 2 of 18")
    await expect(page).toHaveURL(/#publications\?q=peerj$/)
    await q.fill("Tanchangya")
    await expect(count(page)).toHaveText("Showing 2 of 18")
  })

  test("empty state, then clearing moves focus back to the search box", async ({ page }) => {
    await page.goto("/")
    const q = page.getByRole("searchbox", { name: "Search" })
    await q.fill("zzzz-no-match")
    await expect(page.getByText("No publications match “zzzz-no-match” in this view.")).toBeVisible()
    await page.getByRole("button", { name: "Clear search and filter" }).click()
    await expect(count(page)).toHaveText("Showing 18 of 18")
    await expect(q).toBeFocused()
    await expect(q).toHaveValue("")
  })

  test("deep link /#publications?type=talk&q=flood restores the view", async ({ page }) => {
    await page.goto("/#publications?type=talk&q=flood")
    await expect(count(page)).toHaveText("Showing 1 of 18")
    await expect(page.getByRole("searchbox", { name: "Search" })).toHaveValue("flood")
    await expect(page.locator("#publications")).toBeInViewport()
  })

  test("/publications uses the query string", async ({ page }) => {
    await page.goto("/publications?type=review")
    await expect(count(page)).toHaveText("Showing 4 of 18")
    await page.getByRole("button", { name: /In preparation/ }).click()
    await expect(page).toHaveURL(/\/publications\?type=prep$/)
  })
})

test.describe("copy actions", () => {
  test("copy citation: toast + inline label, clipboard holds the APA citation", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.goto("/")
    const btn = page.locator(".pub").first().getByRole("button", { name: "Copy citation" })
    await btn.click()
    await expect(page.locator(".toast")).toHaveText(/Citation copied/)
    await expect(page.locator(".pub").first().locator(".copy-btn")).toHaveText(/Citation copied/)
    const clip = await page.evaluate(() => navigator.clipboard.readText())
    expect(clip).toMatch(/^Habib, M\. T\., Al Afand, S\. M\. S\., & Khan, M\. A\. \(2026\)\. An appraisal/)
  })

  test("clipboard blocked: inline fallback, no success toast", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("blocked")) } })
      document.execCommand = () => false
    })
    await page.goto("/")
    await page.getByRole("button", { name: "Copy email" }).click()
    await expect(page.getByRole("button", { name: /Copy blocked; select the address/ })).toBeVisible()
    await expect(page.locator(".toast")).toHaveCount(0)
  })
})

test.describe("publication details page", () => {
  test("renders, switches citation styles, and links back into the research explorer", async ({ page }) => {
    await page.goto("/publications/speed-verification-and-accountability-human-oversight-beyond")
    await expect(page.locator("h1")).toHaveText(/Speed, verification, and accountability/)
    await expect(page.locator(".dt-authors .me")).toHaveText("Khan, M. A.")
    await page.getByRole("button", { name: "BibTeX", exact: true }).click()
    await expect(page.locator("#cite-text")).toHaveText(/^@unpublished\{khanndspeed,/)
    await page.getByRole("link", { name: "Explore this research line" }).click()
    await expect(page).toHaveURL(/\/#research\?thread=ai$/)
    await expect(page.locator("#research-stage h3")).toHaveText("AI, GovTech, and public administration")
    await expect(page.locator("#research")).toBeInViewport()
  })

  test("navigating from the list keeps Publications current in the nav", async ({ page }) => {
    await page.goto("/")
    await page.locator(".pub-title a").first().click()
    await expect(page).toHaveURL(/\/publications\/an-appraisal/)
    await expect(page.getByRole("navigation", { name: "Sections" }).first().getByRole("link", { name: "Publications" })).toHaveAttribute(
      "aria-current",
      "true",
    )
  })

  test("unknown slug returns a real 404", async ({ request }) => {
    const res = await request.get("/publications/not-a-real-paper")
    expect(res.status()).toBe(404)
  })
})
