import Link from "next/link"
import { Fragment, type ReactNode } from "react"

/**
 * Renders the two inline marks used in content strings: *italic* and
 * [link text](/href). Everything else is plain text.
 */
export function inlineText(source: string): ReactNode {
  const out: ReactNode[] = []
  const re = /\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(source))) {
    if (m.index > last) out.push(<Fragment key={i++}>{source.slice(last, m.index)}</Fragment>)
    if (m[1] !== undefined) out.push(<i key={i++}>{m[1]}</i>)
    else {
      const href = m[3]!
      out.push(
        href.startsWith("/") ? (
          <Link key={i++} href={href}>
            {m[2]}
          </Link>
        ) : (
          <a key={i++} href={href}>
            {m[2]}
          </a>
        ),
      )
    }
    last = m.index + m[0].length
  }
  if (last < source.length) out.push(<Fragment key={i++}>{source.slice(last)}</Fragment>)
  return out
}
