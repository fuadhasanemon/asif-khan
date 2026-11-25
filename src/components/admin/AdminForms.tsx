"use client"

import { useActionState } from "react"

import { login, logout, uploadCv, type LoginState, type UploadState } from "@/app/admin/actions"

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {})
  return (
    <form action={action} className="admin-card admin-login">
      <h1 className="admin-h1">Sign in</h1>
      <label htmlFor="admin-pw" className="admin-label">
        Password
      </label>
      <input id="admin-pw" name="password" type="password" autoComplete="current-password" required className="admin-input" />
      {state.error ? (
        <p className="admin-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-ink" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  )
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="admin-link">
        Sign out
      </button>
    </form>
  )
}

export function CvUpload() {
  const [state, action, pending] = useActionState<UploadState, FormData>(uploadCv, {})
  return (
    <form action={action} className="admin-card">
      <h2 className="admin-h2">CV</h2>
      <p className="admin-muted">Upload a PDF to replace the CV behind every “Download CV” button.</p>
      <div className="admin-row">
        <label htmlFor="admin-cv" className="sr">
          CV PDF
        </label>
        <input id="admin-cv" name="cv" type="file" accept="application/pdf" required className="admin-file-input" />
        <button type="submit" className="btn btn-line" disabled={pending}>
          {pending ? "Uploading…" : "Upload CV"}
        </button>
      </div>
      {state.message ? (
        <p className={state.ok ? "admin-ok" : "admin-error"} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  )
}
