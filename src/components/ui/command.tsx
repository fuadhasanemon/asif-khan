"use client"

import type { ComponentProps, ReactNode } from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Dialog as DialogPrimitive } from "radix-ui"

/**
 * shadcn/ui Command, restyled to the site (Ledger/Paper, square corners,
 * Public Sans, Newsreader titles). Same primitives as upstream: cmdk inside a
 * Radix Dialog (focus trap, Esc, aria-modal). Styles: `.cmdk-*` in shell.css.
 */
export function CommandDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="cmdk-overlay" />
        <DialogPrimitive.Content className="cmdk-dialog">
          <DialogPrimitive.Title className="sr">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr">{description}</DialogPrimitive.Description>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export function Command(props: ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive className="cmdk" {...props} />
}

export function CommandInput(props: ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="cmdk-input-wrap">
      <svg className="cmdk-input-icon" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="9" cy="9" r="6" />
        <path d="M13.5 13.5L18 18" />
      </svg>
      <CommandPrimitive.Input className="cmdk-input" {...props} />
    </div>
  )
}

export function CommandList(props: ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List className="cmdk-list" {...props} />
}

export function CommandEmpty(props: ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className="cmdk-empty" {...props} />
}

export function CommandGroup(props: ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group className="cmdk-group" {...props} />
}

export function CommandItem(props: ComponentProps<typeof CommandPrimitive.Item>) {
  return <CommandPrimitive.Item className="cmdk-item" {...props} />
}

export function CommandFooter({ children }: { children: ReactNode }) {
  return <div className="cmdk-footer">{children}</div>
}
