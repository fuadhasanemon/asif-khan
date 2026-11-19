"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M3 8.5l3.2 3L13 4.5" />
  </svg>
)

/**
 * Sonner, restyled to the site: Ledger toast, Paper text, brass check, square
 * corners, Public Sans. Bottom-centre so it never covers the back-to-top button.
 * Styles live in shell.css (`.toast`).
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="bottom-center"
      duration={2400}
      visibleToasts={2}
      gap={8}
      offset={24}
      mobileOffset={16}
      icons={{ success: <Check /> }}
      toastOptions={{ unstyled: true, classNames: { toast: "toast", icon: "toast-icon", title: "toast-title" } }}
      containerAriaLabel="Notifications"
      {...props}
    />
  )
}

export { Toaster }
