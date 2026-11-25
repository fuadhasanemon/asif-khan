import { expect, test } from "@playwright/test"

test.describe("admin panel", () => {
  test("rejects a wrong password, signs in, lists content, opens an editor", async ({ page }) => {
    await page.goto("/admin")
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
    await page.getByLabel("Password").fill("not-the-password")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.locator(".admin-error")).toHaveText("That password is not right.")

    await page.getByLabel("Password").fill("e2e-admin-password")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByRole("heading", { name: "Edit the site" })).toBeVisible()
    await expect(page.getByRole("link", { name: /Publications/ })).toBeVisible()
    // The test server has no storage configured: the panel says so and Save stays off.
    await expect(page.locator(".admin-note")).toContainText("Saving is off")

    await page.getByRole("link", { name: /Sections and order/ }).click()
    await expect(page.getByRole("heading", { name: "Sections and order" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Save" })).toBeDisabled()
  })

  test("editor pages require a session", async ({ page }) => {
    await page.goto("/admin/edit/publications")
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible()
  })

  test("is not indexed", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text()
    expect(robots).toContain("Disallow: /admin")
  })
})
