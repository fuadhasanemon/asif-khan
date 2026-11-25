"use server"

import { redirect } from "next/navigation"

import { fileSpec, type FileKey } from "@/lib/admin/files"
import { checkPassword, endSession, isSignedIn, startSession } from "@/lib/admin/session"
import { loadAllContent, safePublicPdfPath } from "@/lib/admin/load"
import { storageMode, writeRepoFile } from "@/lib/admin/storage"
import { validateContent } from "@/lib/schemas"

export type LoginState = { error?: string }

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const pw = String(form.get("password") ?? "")
  if (!checkPassword(pw)) return { error: "That password is not right." }
  await startSession()
  redirect("/admin")
}

export async function logout() {
  await endSession()
  redirect("/admin")
}

export type SaveResult = { ok: true; message: string } | { ok: false; errors: string[] }

/**
 * Validate the edited file together with every other content file (the same
 * rules the build runs), then save it. Nothing is written if validation fails.
 */
export async function saveContentFile(key: FileKey, value: unknown): Promise<SaveResult> {
  if (!(await isSignedIn())) return { ok: false, errors: ["Your session ended. Sign in again."] }
  const spec = fileSpec(key)
  if (!spec) return { ok: false, errors: [`Unknown file “${key}”.`] }
  if (storageMode() === "none") return { ok: false, errors: ["Saving is not configured on this deployment (see the admin home)."] }

  const raw = await loadAllContent()
  raw[key] = value
  const result = validateContent(raw)
  if (!result.ok) {
    const mine = result.errors.filter((e) => e.startsWith(`content/${spec.file}`))
    return { ok: false, errors: mine.length ? mine : result.errors }
  }

  try {
    await writeRepoFile("content", spec.file, JSON.stringify(value, null, 2) + "\n", `Update ${spec.title.toLowerCase()} (admin panel)`)
  } catch (e) {
    return { ok: false, errors: [(e as Error).message] }
  }
  return {
    ok: true,
    message:
      storageMode() === "github"
        ? "Saved. The live site updates after the next deploy, usually about a minute."
        : "Saved to the project files. Reload the site to see the change.",
  }
}

export type UploadState = { ok?: boolean; message?: string }

/** Replace the CV PDF served at site.contact.cvPath. */
export async function uploadCv(_prev: UploadState, form: FormData): Promise<UploadState> {
  if (!(await isSignedIn())) return { ok: false, message: "Your session ended. Sign in again." }
  const file = form.get("cv")
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose a PDF file first." }
  if (file.type !== "application/pdf") return { ok: false, message: "The CV must be a PDF." }
  if (file.size > 8 * 1024 * 1024) return { ok: false, message: "The PDF is larger than 8 MB." }
  const bytes = Buffer.from(await file.arrayBuffer())
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") return { ok: false, message: "That file is not a valid PDF." }

  const raw = await loadAllContent()
  const cvPath = safePublicPdfPath((raw.site as { contact?: { cvPath?: unknown } }).contact?.cvPath)
  if (!cvPath) return { ok: false, message: "The CV path in Profile and contact must look like /files/name.pdf." }
  try {
    await writeRepoFile("public", cvPath.slice(1), bytes, "Update CV (admin panel)")
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
  return { ok: true, message: `CV uploaded to ${cvPath}.` }
}
