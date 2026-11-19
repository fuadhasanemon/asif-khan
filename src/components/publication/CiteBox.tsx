"use client"

import { useState } from "react"

import type { CiteStyle } from "@/lib/citations"
import { CopyButton } from "@/components/site/CopyButton"

type Props = {
  citations: Record<CiteStyle, string>
  styles: { id: CiteStyle; label: string }[]
  bibHref: string
  bibFilename: string
}

/** "Cite this work": APA 7 / Chicago / BibTeX switcher, copy, and .bib download. */
export function CiteBox({ citations, styles, bibHref, bibFilename }: Props) {
  const [style, setStyle] = useState<CiteStyle>("apa")
  const text = citations[style]
  return (
    <>
      <div className="cite-tabs" role="group" aria-label="Citation style">
        {styles.map((s) => {
          const on = s.id === style
          return (
            <button
              key={s.id}
              type="button"
              className={`f-btn${on ? " is-on" : ""}`}
              aria-pressed={on}
              aria-controls="cite-text"
              onClick={() => setStyle(s.id)}
            >
              {s.label}
            </button>
          )
        })}
      </div>
      <div className="cite-box">
        <pre id="cite-text" key={style} className={`cite-text${style === "bibtex" ? " is-code" : ""}`}>
          {text}
        </pre>
        <div className="cite-actions">
          <CopyButton
            className="copy-btn"
            doneClassName="is-done"
            text={text}
            label="Copy citation"
            doneLabel="Citation copied"
            failLabel="Copy blocked; select the text"
          />
          <a className="copy-btn cite-dl" href={bibHref} download={bibFilename}>
            Download .bib
          </a>
        </div>
      </div>
    </>
  )
}
