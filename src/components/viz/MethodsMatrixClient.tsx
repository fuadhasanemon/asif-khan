"use client"

import { useState } from "react"

import { MethodsMatrixView, type MethodsViewProps } from "./MethodsMatrix"

type Props = Omit<MethodsViewProps, "selected" | "hotCol" | "onSelect" | "onHoverCol"> & { initial: string }

/** Methods matrix state: selected row and hovered project column. */
export function MethodsMatrix({ initial, ...rest }: Props) {
  const [selected, setSelected] = useState(initial)
  const [hotCol, setHotCol] = useState<string | null>(null)
  return <MethodsMatrixView {...rest} selected={selected} hotCol={hotCol} onSelect={setSelected} onHoverCol={setHotCol} />
}
