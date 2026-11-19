import { describe, expect, it } from "vitest"

import { PubType, ThreadId } from "@/lib/schemas"
import { PUB_TYPES, THREAD_IDS, buildHash, buildQuery, parseHash, parseThread, parseType } from "@/lib/url-state"

describe("parseHash", () => {
  it("reads a bare section id", () => {
    const s = parseHash("#about")
    expect(s.id).toBe("about")
    expect([...s.params]).toEqual([])
  })
  it("reads section state after the id", () => {
    const s = parseHash("#publications?type=journal&q=peerj")
    expect(s.id).toBe("publications")
    expect(s.params.get("type")).toBe("journal")
    expect(s.params.get("q")).toBe("peerj")
  })
  it("decodes spaces and unicode in queries", () => {
    expect(parseHash("#publications?q=south%20korea").params.get("q")).toBe("south korea")
    expect(parseHash("#publications?q=Bangladesh%E2%80%93Pakistan").params.get("q")).toBe("Bangladesh–Pakistan")
  })
  it("handles an empty hash", () => {
    expect(parseHash("").id).toBe("")
  })
})

describe("buildHash / buildQuery", () => {
  it("drops empty values", () => {
    expect(buildHash("publications", { type: null, q: "" })).toBe("#publications")
    expect(buildQuery({ type: undefined })).toBe("")
  })
  it("round-trips", () => {
    const h = buildHash("publications", { type: "talk", q: "south korea" })
    expect(h).toBe("#publications?type=talk&q=south+korea")
    const s = parseHash(h)
    expect(s.params.get("q")).toBe("south korea")
    expect(buildQuery({ type: "review", q: "climate" })).toBe("?type=review&q=climate")
  })
})

describe("validation of URL values", () => {
  it("client lists match the schema enums", () => {
    expect([...THREAD_IDS]).toEqual(ThreadId.options)
    expect([...PUB_TYPES]).toEqual(PubType.options)
  })
  it("accepts only known threads", () => {
    expect(parseThread("mig")).toBe("mig")
    expect(parseThread("nope")).toBeNull()
    expect(parseThread(null)).toBeNull()
  })
  it("falls back to all for unknown types", () => {
    expect(parseType("journal")).toBe("journal")
    expect(parseType("<script>")).toBe("all")
    expect(parseType(null)).toBe("all")
  })
})
