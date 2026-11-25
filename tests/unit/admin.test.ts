import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }) }))

import { blankFrom, humanize, slugify } from "@/components/admin/JsonForm"
import { safePublicPdfPath } from "@/lib/admin/load"
import { adminEnabled, checkPassword, createSessionToken, verifySessionToken } from "@/lib/admin/session"
import { storageMode } from "@/lib/admin/storage"

describe("admin sessions", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_PASSWORD", "correct horse battery")
    vi.stubEnv("ADMIN_SECRET", "")
  })
  afterEach(() => vi.unstubAllEnvs())

  it("is off without a password of 8+ characters", () => {
    vi.stubEnv("ADMIN_PASSWORD", "short")
    expect(adminEnabled()).toBe(false)
    expect(checkPassword("short")).toBe(false)
  })
  it("checks the password", () => {
    expect(checkPassword("correct horse battery")).toBe(true)
    expect(checkPassword("correct horse batter")).toBe(false)
    expect(checkPassword("")).toBe(false)
  })
  it("accepts its own token, rejects tampered and expired ones", () => {
    const now = Date.now()
    const token = createSessionToken(now)
    expect(verifySessionToken(token, now + 1000)).toBe(true)
    expect(verifySessionToken(token, now + 9 * 3600_000)).toBe(false)
    const [payload, sig] = token.split(".")
    const forged = Buffer.from(JSON.stringify({ exp: now + 99 * 3600_000 })).toString("base64url")
    expect(verifySessionToken(`${forged}.${sig}`, now)).toBe(false)
    expect(verifySessionToken(`${payload}.x${sig!.slice(1)}`, now)).toBe(false)
    expect(verifySessionToken(undefined, now)).toBe(false)
  })
  it("invalidates sessions when the password changes", () => {
    const token = createSessionToken()
    vi.stubEnv("ADMIN_PASSWORD", "a different password")
    expect(verifySessionToken(token)).toBe(false)
  })
})

describe("admin storage mode", () => {
  afterEach(() => vi.unstubAllEnvs())
  it("uses GitHub only with a token and an owner/repo", () => {
    vi.stubEnv("NODE_ENV", "production")
    vi.stubEnv("GITHUB_TOKEN", "t")
    vi.stubEnv("GITHUB_REPO", "owner/repo")
    expect(storageMode()).toBe("github")
    vi.stubEnv("GITHUB_REPO", "not a repo")
    expect(storageMode()).toBe("none")
    vi.stubEnv("ADMIN_LOCAL_WRITE", "1")
    expect(storageMode()).toBe("local")
  })
})

describe("admin helpers", () => {
  it("only accepts plain PDF paths for the CV", () => {
    expect(safePublicPdfPath("/files/Md-Asif-Khan-CV.pdf")).toBe("/files/Md-Asif-Khan-CV.pdf")
    expect(safePublicPdfPath("/../../etc/passwd.pdf")).toBeNull()
    expect(safePublicPdfPath("/files/cv.exe")).toBeNull()
    expect(safePublicPdfPath("files/cv.pdf")).toBeNull()
    expect(safePublicPdfPath(42)).toBeNull()
  })
  it("makes slugs the way the content does", () => {
    expect(slugify("Genocide, numbers, and memory: The death toll and the apology demand")).toBe("genocide-numbers-and-memory-the-death-toll")
    expect(slugify("China’s Belt and Road")).toBe("chinas-belt-and-road")
  })
  it("builds blank items with the same shape", () => {
    expect(blankFrom({ title: "x", year: null, authors: ["a"], n: 3, on: true, nested: { a: "b" } })).toEqual({
      title: "",
      year: null,
      authors: [],
      n: 0,
      on: false,
      nested: { a: "" },
    })
  })
  it("labels fields readably", () => {
    expect(humanize("heroStatement")).toBe("Hero statement")
    expect(humanize("cvPath")).toBe("CV path")
    expect(humanize("doi")).toBe("DOI")
  })
})
