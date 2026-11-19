import { expect, test } from "@playwright/test"

test.describe("command palette", () => {
  test("Ctrl+K opens it; search by coauthor jumps to a publication", async ({ page }) => {
    await page.goto("/")
    await page.locator("body").press("Control+k")
    const dialog = page.getByRole("dialog", { name: "Command menu" })
    await expect(dialog).toBeVisible()
    const input = dialog.getByRole("combobox")
    await expect(input).toBeFocused()
    await input.fill("papia")
    const options = dialog.getByRole("option")
    await expect(options.first()).toContainText(/Sentiment analysis datasets|DistilRoBiLSTMFuse/)
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/\/publications\/(sentiment-analysis-datasets|distilrobilstmfuse)/)
    await expect(dialog).toBeHidden()
  })

  test("search by venue, jump to a section, and close with Esc", async ({ page }) => {
    await page.goto("/publications")
    await page.locator("body").press("Control+k")
    const dialog = page.getByRole("dialog", { name: "Command menu" })
    const input = dialog.getByRole("combobox")
    await input.fill("Climate and Development")
    await expect(dialog.getByRole("option").first()).toContainText("Water insecurity after resettlement")
    await input.fill("experience")
    await expect(dialog.getByRole("option").first()).toHaveText("Experience")
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/\/#experience$/)
    await page.locator("body").press("Control+k")
    await expect(dialog).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
  })

  test("copy email action shows a toast", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.goto("/")
    await page.locator("body").press("Control+k")
    const dialog = page.getByRole("dialog", { name: "Command menu" })
    await dialog.getByRole("combobox").fill("copy email")
    await page.keyboard.press("Enter")
    await expect(page.locator(".toast")).toHaveText(/Email copied/)
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("asifkhan.wiu@gmail.com")
  })
})

test.describe("404, sitemap, robots", () => {
  test("unknown page: status 404, site header, one h1, ways back", async ({ page }) => {
    const res = await page.goto("/no-such-page")
    expect(res?.status()).toBe(404)
    await expect(page.locator("h1")).toHaveText("Page not found")
    await expect(page.locator("h1")).toHaveCount(1)
    await expect(page.getByRole("link", { name: /All publications/ })).toHaveAttribute("href", "/publications")
    await expect(page.locator(".nav")).toBeVisible()
  })

  test("sitemap lists home, the index and all 18 publications; robots points to it", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text()
    expect(sitemap.match(/<loc>/g)).toHaveLength(20)
    expect(sitemap).toContain("<loc>https://asifkhan.net/publications/an-appraisal-of-the-economic-imperatives-of</loc>")
    const robots = await (await request.get("/robots.txt")).text()
    expect(robots).toContain("Sitemap: https://asifkhan.net/sitemap.xml")
  })

  test("publication pages and home carry an Open Graph image", async ({ request }) => {
    for (const path of ["/", "/publications/an-appraisal-of-the-economic-imperatives-of"]) {
      const html = await (await request.get(path)).text()
      const og = html.match(/property="og:image" content="([^"]+)"/)?.[1]
      expect(og).toBeTruthy()
      const img = await request.get(new URL(og!).pathname + new URL(og!).search)
      expect(img.status()).toBe(200)
      expect(img.headers()["content-type"]).toBe("image/png")
    }
  })
})

test.describe("print stylesheet", () => {
  test("publication page prints without chrome, with the citation and the page URL", async ({ page }) => {
    await page.goto("/publications/an-appraisal-of-the-economic-imperatives-of")
    await page.emulateMedia({ media: "print" })
    await expect(page.locator(".nav")).toBeHidden()
    await expect(page.locator("#contact")).toBeHidden()
    await expect(page.locator(".dt-actions")).toBeHidden()
    await expect(page.locator(".pager")).toBeHidden()
    await expect(page.locator("#cite-text")).toBeVisible()
    await expect(page.locator(".print-only")).toHaveText("https://asifkhan.net/publications/an-appraisal-of-the-economic-imperatives-of")
  })
})
