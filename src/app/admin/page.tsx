import Link from "next/link"
import { connection } from "next/server"
import { Suspense } from "react"

import { FILES } from "@/lib/admin/files"
import { adminEnabled, isSignedIn } from "@/lib/admin/session"
import { storageLabel, storageMode } from "@/lib/admin/storage"
import { CvUpload, LoginForm, LogoutButton } from "@/components/admin/AdminForms"

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="admin-muted">Loading…</p>}>
      <AdminHome />
    </Suspense>
  )
}

async function AdminHome() {
  // Request time: the password and storage settings are runtime environment, not build-time.
  await connection()
  if (!adminEnabled()) {
    return (
      <section className="admin-card">
        <h1 className="admin-h1">The admin panel is off</h1>
        <p>
          Set an <code>ADMIN_PASSWORD</code> environment variable (at least 8 characters) and restart or redeploy the site.
          See <code>ADMIN.md</code> in the project for the full setup.
        </p>
      </section>
    )
  }
  if (!(await isSignedIn())) return <LoginForm />

  const mode = storageMode()
  return (
    <>
      <div className="admin-head">
        <h1 className="admin-h1">Edit the site</h1>
        <LogoutButton />
      </div>
      <p className={`admin-note${mode === "none" ? " is-warn" : ""}`}>{storageLabel()}</p>
      <ul className="admin-files">
        {FILES.map((f) => (
          <li key={f.key}>
            <Link href={`/admin/edit/${f.key}`} className="admin-file">
              <span className="admin-file-t">{f.title}</span>
              <span className="admin-file-d">{f.description}</span>
            </Link>
          </li>
        ))}
      </ul>
      <CvUpload />
    </>
  )
}
