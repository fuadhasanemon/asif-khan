/** Server-only content loading for the admin panel (not a server action). */
import "server-only"

import type { RawContent } from "../schemas"
import { FILES } from "./files"
import { readRepoFile } from "./storage"

/** All content files as parsed JSON (from GitHub in GitHub mode, otherwise from disk). */
export async function loadAllContent(): Promise<RawContent> {
  const entries = await Promise.all(FILES.map(async (f) => [f.key, JSON.parse(await readRepoFile("content", f.file))] as const))
  return Object.fromEntries(entries) as RawContent
}

/** A CV path from content, accepted only as a plain /…/name.pdf path inside public/. */
export function safePublicPdfPath(path: unknown): string | null {
  return typeof path === "string" && /^\/[\w\-./]+\.pdf$/.test(path) && !path.includes("..") ? path : null
}
