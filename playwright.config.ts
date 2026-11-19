import { defineConfig, devices } from "@playwright/test"

const PORT = Number(process.env.E2E_PORT ?? 3100)

/** Smoke tests run against the production build (`pnpm build` first). */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }, testIgnore: /(mobile|motion)\.spec/ },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } }, testMatch: /mobile\.spec/ },
    // Timing-sensitive (the 1.5 s motion claim window): runs after the others, without CPU contention.
    {
      name: "motion",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
      testMatch: /motion\.spec/,
      dependencies: ["desktop", "mobile"],
      fullyParallel: false,
    },
  ],
  webServer: {
    command: `pnpm start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
