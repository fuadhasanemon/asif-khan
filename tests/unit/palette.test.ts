import { describe, expect, it } from "vitest"

import { paletteFilter } from "@/components/site/CommandMenu"

describe("command palette filter", () => {
  it("requires every word, in the label or the keywords", () => {
    expect(paletteFilter("copy email address", "copy email")).toBeGreaterThan(0)
    expect(paletteFilter("p7 Beyond EPS: Bangladesh–South Korea labor cooperation", "copy email", ["Habib, M. T."])).toBe(0)
  })
  it("ranks label prefixes over label matches over keyword-only matches", () => {
    const prefix = paletteFilter("section Experience", "exp")
    const label = paletteFilter("p1 Sentiment analysis datasets", "datasets")
    const keyword = paletteFilter("p2 DistilRoBiLSTMFuse", "papia", ["Papia, S. K."])
    expect(prefix).toBeGreaterThan(label)
    expect(label).toBeGreaterThan(keyword)
    expect(keyword).toBeGreaterThan(0)
  })
  it("matches venues through keywords, case-insensitively", () => {
    expect(paletteFilter("p11 Water insecurity after resettlement", "climate and development", ["Climate and Development (Taylor & Francis)"])).toBe(0.5)
  })
  it("shows everything for an empty query", () => {
    expect(paletteFilter("anything", "  ")).toBe(1)
  })
})
