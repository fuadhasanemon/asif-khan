import { connection } from "next/server"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"

import { FILES, fileSpec, type FileKey } from "@/lib/admin/files"
import { loadAllContent } from "@/lib/admin/load"
import { isSignedIn } from "@/lib/admin/session"
import { storageLabel, storageMode } from "@/lib/admin/storage"
import { ContentEditor } from "@/components/admin/ContentEditor"

export function generateStaticParams() {
  return FILES.map((f) => ({ file: f.key }))
}

export default function EditPage({ params }: PageProps<"/admin/edit/[file]">) {
  return (
    <Suspense fallback={<p className="admin-muted">Loading…</p>}>
      <Editor params={params} />
    </Suspense>
  )
}

async function Editor({ params }: Pick<PageProps<"/admin/edit/[file]">, "params">) {
  // Request-time only: the session check reads the clock and cookies.
  await connection()
  const { file } = await params
  const spec = fileSpec(file)
  if (!spec) notFound()
  if (!(await isSignedIn())) redirect("/admin")

  const all = await loadAllContent()
  const areas = Object.keys((all.research as { areas?: Record<string, unknown> }).areas ?? {})
  return (
    <ContentEditor
      fileKey={spec.key as FileKey}
      title={spec.title}
      description={spec.description}
      initial={all[spec.key]}
      areas={areas}
      canSave={storageMode() !== "none"}
      storage={storageLabel()}
    />
  )
}
