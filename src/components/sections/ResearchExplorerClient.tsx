"use client"

import { useState } from "react"

import type { Thread, ThreadIdT } from "@/lib/schemas"
import { buildHash, parseThread, replaceUrl } from "@/lib/url-state"
import { useHashParams } from "@/hooks/useHashParams"

import { ResearchExplorerView, type ResearchStage } from "./ResearchExplorer"

type Props = { threads: Thread[]; stages: Record<ThreadIdT, ResearchStage>; initial: ThreadIdT }

/** Research explorer state: the selected thread, deep-linkable as /#research?thread=mig. */
export function ResearchExplorer({ threads, stages, initial }: Props) {
  const [active, setActive] = useState<ThreadIdT>(initial)

  useHashParams("research", (params) => {
    const t = parseThread(params.get("thread"))
    if (t) setActive(t)
  })

  function pick(id: ThreadIdT) {
    setActive(id)
    replaceUrl(buildHash("research", { thread: id }))
  }

  return <ResearchExplorerView threads={threads} stages={stages} active={active} onPick={pick} />
}
