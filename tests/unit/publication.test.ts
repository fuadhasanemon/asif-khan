import { describe, expect, it } from "vitest"

import kindsJson from "@content/publication-kinds.json"
import publicationsJson from "@content/publications.json"
import researchJson from "@content/research.json"
import {
  abstractPlaceholder,
  authorList,
  authorParts,
  authorship,
  facts,
  kindMeta,
  matchesQuery,
  prevNext,
  relatedFor,
  statusClass,
  venueLine,
} from "@/lib/publication"
import { KindsSchema, PublicationsSchema, ResearchSchema, type Kinds } from "@/lib/schemas"

import { protoData, protoDetail, protoPub } from "./prototype"

const pubs = PublicationsSchema.parse(publicationsJson)
const kinds = KindsSchema.parse(kindsJson) as Kinds
const research = ResearchSchema.parse(researchJson)
const byId = (id: string) => pubs.find((p) => p.id === id)!

describe("content parity: publications.json matches the prototype's data", () => {
  it("same ids in the same order", () => {
    expect(pubs.map((p) => p.id)).toEqual(protoData.pubs.map((p) => p.id))
  })
  for (const p of pubs) {
    it(`${p.id}: fields match`, () => {
      const pp = protoPub(p.id)
      expect(p.type).toBe(pp.t)
      expect(p.title).toBe(pp.title)
      expect(p.authors).toEqual(pp.au)
      expect(p.year ?? "").toBe(pp.year)
      expect(p.venue ?? undefined).toBe(pp.venueName)
      expect(p.doi ?? undefined).toBe(pp.doi)
      expect(p.status ?? undefined).toBe(pp.status)
      expect(p.area).toBe(pp.area)
      expect(p.related).toEqual(pp.related ?? [])
      expect(p.methods).toEqual(pp.methods ?? [])
    })
  }
  it("kinds and research areas match", () => {
    expect(kinds).toEqual(protoData.kinds)
    expect(research.areas).toEqual(protoData.areas)
  })
})

describe("parity with the prototype's list and detail logic", () => {
  for (const p of pubs) {
    it(`${p.id}: venue line, author split, facts, authorship, placeholder, related, pager`, () => {
      const pp = protoPub(p.id)
      const d = protoDetail(p.id)
      expect(venueLine(p)).toBe(pp.venue)
      expect(authorParts(p)).toEqual({ pre: pp.pre, post: pp.post })
      expect(facts(p)).toEqual(d.facts)
      expect(authorship(p)).toBe(d.role)
      expect(abstractPlaceholder(p)).toBe(d.abstractPh)
      expect(authorList(p).map((a) => ({ name: a.name, cls: a.isMe ? "me" : "", sep: a.sep }))).toEqual(d.authors)
      expect(
        relatedFor(p, pubs).map((r) => ({ why: r.why, title: r.pub.title, meta: kindMeta(r.pub, kinds) })),
      ).toEqual(d.related.map((r) => ({ why: r.why, title: r.title, meta: r.meta })))
      const { prev, next } = prevNext(p, pubs)
      expect(prev.title).toBe(d.prev.title)
      expect(next.title).toBe(d.next.title)
    })
  }
})

describe("authorship position", () => {
  it("covers sole, first, middle and last positions", () => {
    expect(authorship(byId("p14"))).toBe("Sole author")
    expect(authorship(byId("p1"))).toBe("First of six authors")
    expect(authorship(byId("p3"))).toBe("Third of six authors")
    expect(authorship(byId("p0"))).toBe("Third of three authors")
    expect(authorship(byId("p13"))).toBe("Sixth of eight authors")
  })
})

describe("search and status helpers", () => {
  it("matches title, coauthor and venue, case-insensitively", () => {
    expect(matchesQuery(byId("p1"), "PEERJ")).toBe(true)
    expect(matchesQuery(byId("p1"), "papia")).toBe(true)
    expect(matchesQuery(byId("p1"), "datasets")).toBe(true)
    expect(matchesQuery(byId("p1"), "  ")).toBe(true)
    expect(matchesQuery(byId("p1"), "korea")).toBe(false)
  })
  it("maps statuses to the prototype's classes", () => {
    expect(statusClass("Accepted")).toBe("st-accepted")
    expect(statusClass("Under review")).toBe("st-review")
    expect(statusClass("In preparation")).toBe("st-prep")
    expect(statusClass(null)).toBe("")
  })
})
