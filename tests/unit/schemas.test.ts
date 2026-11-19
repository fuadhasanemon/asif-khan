import { describe, expect, it } from "vitest"

import { readRawContent } from "@/lib/content-check"
import { MethodsSchema, PublicationSchema, SectionsSchema, validateContent, type RawContent } from "@/lib/schemas"

const dir = new URL("../../content", import.meta.url)
const fresh = (): RawContent => structuredClone(readRawContent(decodeURIComponent(dir.pathname.replace(/^\/([A-Za-z]:)/, "$1"))))

/* eslint-disable @typescript-eslint/no-explicit-any -- tests mutate raw JSON */
function errorsAfter(mutate: (c: any) => void): string[] {
  const raw = fresh() as any
  mutate(raw)
  const r = validateContent(raw)
  return r.ok ? [] : r.errors
}

describe("the real content", () => {
  it("validates with no errors", () => {
    const r = validateContent(fresh())
    if (!r.ok) throw new Error(r.errors.join("\n"))
    expect(r.ok).toBe(true)
  })
  it("warns about each TODO profile link", () => {
    const r = validateContent(fresh())
    const todos = r.warnings.filter((w) => w.includes("TODO"))
    expect(todos).toHaveLength(3)
    expect(todos.join(" ")).toMatch(/Google Scholar.*ResearchGate.*LinkedIn/)
  })
})

describe("publications.json rules", () => {
  it("requires my name exactly once", () => {
    const e = errorsAfter((c) => (c.publications[0].authors = ["Habib, M. T."]))
    expect(e.join()).toMatch(/must appear exactly once/)
  })
  it("rejects an author in the wrong format", () => {
    expect(errorsAfter((c) => c.publications[0].authors.push("Jane Smith")).join()).toMatch(/Surname, I\. I\./)
  })
  it("requires journal fields", () => {
    expect(errorsAfter((c) => (c.publications[0].volume = null)).join()).toMatch(/journal needs “volume”/)
    expect(
      errorsAfter((c) => {
        c.publications[1].article = null
        c.publications[1].pages = null
      }).join(),
    ).toMatch(/pages or an article number/)
  })
  it("requires talk place and dates", () => {
    expect(errorsAfter((c) => (c.publications[6].place = null)).join()).toMatch(/talk needs “place”/)
  })
  it("forbids a year on manuscripts", () => {
    expect(errorsAfter((c) => (c.publications[14].year = "2026")).join()).toMatch(/no year/)
  })
  it("rejects unknown related ids, areas, and methods", () => {
    expect(errorsAfter((c) => (c.publications[0].related = ["p99"])).join()).toMatch(/unknown “p99”/)
    expect(errorsAfter((c) => (c.publications[0].area = "nope")).join()).toMatch(/unknown area/)
    expect(errorsAfter((c) => (c.publications[0].methods = ["Astrology"])).join()).toMatch(/not in methods\.json/)
  })
  it("rejects duplicate ids and slugs", () => {
    expect(errorsAfter((c) => (c.publications[1].slug = c.publications[0].slug)).join()).toMatch(/duplicate slug/)
    expect(errorsAfter((c) => (c.publications[1].id = "p0")).join()).toMatch(/duplicate id/)
  })
  it("rejects a malformed DOI and slug", () => {
    expect(PublicationSchema.safeParse((fresh().publications as any[])[0]).success).toBe(true)
    expect(errorsAfter((c) => (c.publications[0].doi = "doi.org/10.1")).length).toBeGreaterThan(0)
    expect(errorsAfter((c) => (c.publications[0].slug = "Has Spaces")).length).toBeGreaterThan(0)
  })
})

describe("cross-file rules", () => {
  it("methods: needsProject must agree with projects/uses", () => {
    const raw = fresh() as any
    raw.methods.methods[5].needsProject = false
    expect(MethodsSchema.safeParse(raw.methods).success).toBe(false)
  })
  it("methods: projects must exist", () => {
    expect(errorsAfter((c) => c.methods.methods[0].projects.push("ghost")).join()).toMatch(/unknown project “ghost”/)
  })
  it("sections: research works must link real publications", () => {
    expect(errorsAfter((c) => (c.sections.research.stages.count.works[0].publication = "p77")).join()).toMatch(
      /unknown publication “p77”/,
    )
  })
  it("sections: each filter type appears once", () => {
    expect(
      errorsAfter((c) => (c.sections.publications.filterLabels[1].type = "journal")).join(),
    ).toMatch(/each publication type once/)
  })
  it("sections: stages are required for all three threads", () => {
    const raw = fresh() as any
    delete raw.sections.research.stages.ai
    expect(SectionsSchema.safeParse(raw.sections).success).toBe(false)
  })
  it("research: every thread has a matching area", () => {
    expect(errorsAfter((c) => delete c.research.areas.mig).join()).toMatch(/thread “mig”/)
  })
  it("experience: end after start", () => {
    expect(errorsAfter((c) => (c.experience[0].end = 2020)).join()).toMatch(/end must be after start/)
  })
  it("site: email must be valid", () => {
    expect(errorsAfter((c) => (c.site.contact.email = "not-an-email")).length).toBeGreaterThan(0)
  })
})
