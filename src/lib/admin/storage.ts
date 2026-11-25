/**
 * Where admin edits are saved. Server-only.
 *
 * - GitHub mode (GITHUB_TOKEN + GITHUB_REPO set): each save is a commit to the
 *   repository; Vercel (or any Git-connected host) redeploys the site.
 * - Local mode (`next dev`, or ADMIN_LOCAL_WRITE=1): files are written to
 *   content/ and public/ on disk.
 * - Otherwise saving is disabled and the panel says how to configure it.
 */
import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

export type StorageMode = "github" | "local" | "none"

const repo = () => process.env.GITHUB_REPO ?? ""
const branch = () => process.env.GITHUB_BRANCH || "main"
const token = () => process.env.GITHUB_TOKEN ?? ""

export function storageMode(): StorageMode {
  if (token() && /^[\w.-]+\/[\w.-]+$/.test(repo())) return "github"
  if (process.env.NODE_ENV === "development" || process.env.ADMIN_LOCAL_WRITE === "1") return "local"
  return "none"
}

export function storageLabel(): string {
  const mode = storageMode()
  if (mode === "github") return `Saves commit to ${repo()} (${branch()}); the live site updates after the next deploy, usually about a minute.`
  if (mode === "local") return "Saves write to the files in this project (local mode). Reload the site to see changes."
  return "Saving is off: set GITHUB_TOKEN and GITHUB_REPO (or run locally with pnpm dev)."
}

const gh = (path: string, init?: RequestInit) =>
  fetch(`https://api.github.com/repos/${repo()}/contents/${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  })

async function githubSha(path: string): Promise<string | undefined> {
  const res = await gh(`${path}?ref=${encodeURIComponent(branch())}`)
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error(`GitHub read failed (${res.status}) for ${path}`)
  return ((await res.json()) as { sha: string }).sha
}

/** Repository folders the admin may touch. Disk paths are built from these literals so the build traces only them. */
export type RepoDir = "content" | "public"

const diskPath = (dir: RepoDir, rel: string) =>
  dir === "content" ? join(process.cwd(), "content", rel) : join(process.cwd(), "public", rel)

/** Read a repository file as text (GitHub in GitHub mode, the disk otherwise). */
export async function readRepoFile(dir: RepoDir, rel: string): Promise<string> {
  const path = `${dir}/${rel}`
  if (storageMode() === "github") {
    const res = await gh(`${path}?ref=${encodeURIComponent(branch())}`, { headers: { Accept: "application/vnd.github.raw+json" } })
    if (!res.ok) throw new Error(`GitHub read failed (${res.status}) for ${path}`)
    return res.text()
  }
  return readFile(diskPath(dir, rel), "utf8")
}

/** Write a repository file (a commit in GitHub mode). */
export async function writeRepoFile(dir: RepoDir, rel: string, content: Buffer | string, message: string): Promise<void> {
  const path = `${dir}/${rel}`
  const mode = storageMode()
  const bytes = typeof content === "string" ? Buffer.from(content, "utf8") : content
  if (mode === "github") {
    const sha = await githubSha(path)
    const res = await gh(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, content: bytes.toString("base64"), branch: branch(), ...(sha ? { sha } : {}) }),
    })
    if (!res.ok) throw new Error(`GitHub save failed (${res.status}): ${(await res.text()).slice(0, 200)}`)
    return
  }
  if (mode === "local") {
    await writeFile(diskPath(dir, rel), bytes)
    return
  }
  throw new Error(storageLabel())
}
