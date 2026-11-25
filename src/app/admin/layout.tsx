import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

/** Admin panel shell (no site header or contact block). */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="admin">
      <header className="admin-bar">
        <Link href="/admin" className="admin-brand">
          Site admin
        </Link>
        <Link href="/" className="admin-view">
          View site
        </Link>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  )
}
