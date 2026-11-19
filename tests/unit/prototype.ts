/**
 * Test harness: evaluates the prototype's logic class from design/Main.dc.html
 * so ported functions can be compared against the original implementation.
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

type ProtoPub = {
  id: string
  t: string
  year: string
  au: string[]
  title: string
  venueName?: string
  vol?: string
  issue?: string
  pages?: string
  art?: string
  publisher?: string
  place?: string
  when?: string
  doi?: string
  status?: string
  area: string
  methods?: string[]
  related?: string[]
  pre: string
  post: string
  venue: string
}

type ProtoData = {
  pubs: ProtoPub[]
  kinds: Record<string, string>
  areas: Record<string, { name: string; thread?: string }>
  roles: unknown[]
  methods: unknown[]
  projects: unknown[]
  threads: unknown[]
  record: unknown[]
  nav: unknown[]
}

type DetailVals = {
  kindLabel: string
  venueLine: string
  facts: { k: string; v: string }[]
  role: string
  abstractPh: string
  areaName: string
  areaIsThread: boolean
  authors: { name: string; cls: string; sep: string }[]
  related: { why: string; title: string; meta: string }[]
  prev: { title: string }
  next: { title: string }
  citeText: string
}

type ProtoInstance = {
  state: Record<string, unknown>
  data(): ProtoData
  cite(p: ProtoPub, style: string): string
  detailVals(d: ProtoData): DetailVals
}

const file = fileURLToPath(new URL("../../design/Main.dc.html", import.meta.url))
const html = readFileSync(file, "utf8")
const start = html.indexOf(">", html.indexOf("data-dc-script")) + 1
const src = html.slice(start, html.indexOf("</script>", start))

class DCLogic {
  props: Record<string, unknown>
  state: Record<string, unknown> = {}
  constructor(props: Record<string, unknown>) {
    this.props = props
  }
  setState() {}
}

const Component = new Function("DCLogic", `${src}\nreturn Component;`)(DCLogic) as new (
  props: Record<string, unknown>,
) => ProtoInstance

export const proto = new Component({ startPub: "none", particles: false })
export const protoData = proto.data()

export function protoDetail(id: string, citeStyle = "apa"): DetailVals {
  proto.state = { ...proto.state, pub: id, citeStyle, copied: null }
  return proto.detailVals(protoData)
}

export function protoPub(id: string): ProtoPub {
  const p = protoData.pubs.find((x) => x.id === id)
  if (!p) throw new Error(`prototype has no ${id}`)
  return p
}
