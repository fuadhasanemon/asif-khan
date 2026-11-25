/**
 * Build-time content check, called from next.config.ts (runs for `next build`
 * and `next dev`). Reads content/*.json from disk, validates, throws on errors
 * and prints warnings (TODO profile links, missing abstracts).
 * Node-only; relative imports only.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { validateContent, type RawContent } from "./schemas"

const FILES: Record<keyof RawContent, string> = {
  site: "site.json",
  record: "record.json",
  research: "research.json",
  experience: "experience.json",
  methods: "methods.json",
  kinds: "publication-kinds.json",
  publications: "publications.json",
  sections: "sections.json",
}

export function readRawContent(dir: string): RawContent {
  const out = {} as Record<keyof RawContent, unknown>
  for (const [key, file] of Object.entries(FILES) as [keyof RawContent, string][]) {
    try {
      out[key] = JSON.parse(readFileSync(join(dir, file), "utf8"))
    } catch (e) {
      throw new Error(`content/${file}: cannot read or parse (${(e as Error).message})`)
    }
  }
  return out as RawContent
}

export function checkContent(dir: string, log: Pick<Console, "warn"> = console): void {
  const result = validateContent(readRawContent(dir))
  const abstracts = result.warnings.filter((w) => w.includes("abstract not provided"))
  const other = result.warnings.filter((w) => !w.includes("abstract not provided"))
  for (const w of other) log.warn(`⚠ content: ${w}`)
  if (abstracts.length) log.warn(`⚠ content: ${abstracts.length} publication(s) have no abstract yet; the abstract section is hidden`)
  if (!result.ok) {
    throw new Error(`Content validation failed:\n  - ${result.errors.join("\n  - ")}`)
  }
}
