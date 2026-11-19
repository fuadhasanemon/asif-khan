import type { Page } from "@playwright/test"

/**
 * Navigate and wait for the page's one post-hydration re-measure: on desktop
 * with motion, the hero scene pins and refreshes ScrollTrigger (which briefly
 * restores the scroll position). Elsewhere the scene does not apply.
 */
export async function gotoReady(page: Page, url: string) {
  await page.goto(url)
  await page.waitForFunction(() => {
    const html = document.documentElement
    const sceneApplies =
      html.hasAttribute("data-motion-ready") &&
      window.matchMedia("(min-width: 1240px) and (prefers-reduced-motion: no-preference)").matches &&
      !!document.getElementById("top")
    return !sceneApplies || html.hasAttribute("data-scene-pinned")
  })
}
