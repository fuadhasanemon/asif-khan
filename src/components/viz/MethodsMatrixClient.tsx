"use client"

import { useState } from "react"

import { MethodsMatrixView, type MethodsViewProps } from "./MethodsMatrix"

type Props = Omit<MethodsViewProps, "selected" | "hotCol" | "hotRow" | "onSelect" | "onHoverCol" | "onHoverRow"> & {
  initial: string
}

/** Methods matrix state: selected row, plus the crosshair (hovered method row or project column). */
export function MethodsMatrix({ initial, ...rest }: Props) {
  const [selected, setSelected] = useState(initial)
  const [hotCol, setHotCol] = useState<string | null>(null)
  const [hotRow, setHotRow] = useState<string | null>(null)
  return (
    <MethodsMatrixView
      {...rest}
      selected={selected}
      hotCol={hotCol}
      hotRow={hotRow}
      onSelect={setSelected}
      onHoverCol={setHotCol}
      onHoverRow={setHotRow}
    />
  )
}
