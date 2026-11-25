/**
 * Open Graph cards (1200×630) in the site's type and colours, rendered at
 * build time with next/og. Satori needs static TTF/OTF/WOFF files, so the
 * font comes from Fontsource's static WOFF build of JetBrains Mono (SIL OFL),
 * the site's heading face. SF Mono, used for paragraphs on Apple devices,
 * cannot be embedded, so cards use JetBrains Mono throughout.
 */
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { cacheLife } from "next/cache"
import { ImageResponse } from "next/og"

export const OG_SIZE = { width: 1200, height: 630 }

const C = {
  ledger: "#12312C",
  paper: "#F3F4F0",
  brass: "#C9A44C",
  brassLight: "#E2C779",
  muted: "#BACAC4",
  rule: "rgba(243,244,240,0.16)",
}

const fontFile = async (pkg: string, file: string): Promise<ArrayBuffer> => {
  const buf = await readFile(join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file))
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

/**
 * Font bytes, cached: under Cache Components an uncached async file read would
 * stop the cards from being prerendered at build time.
 */
async function fontData() {
  "use cache"
  cacheLife("max") // font files never change between builds
  return Promise.all([
    fontFile("jetbrains-mono", "jetbrains-mono-latin-400-normal.woff"),
    fontFile("jetbrains-mono", "jetbrains-mono-latin-500-normal.woff"),
    fontFile("jetbrains-mono", "jetbrains-mono-latin-600-normal.woff"),
  ])
}

async function fonts() {
  const [regular, medium, semibold] = await fontData()
  return [
    { name: "JetBrains Mono", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "JetBrains Mono", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "JetBrains Mono", data: semibold, weight: 600 as const, style: "normal" as const },
  ]
}

/** Title size steps down for long titles so every card keeps a calm layout. */
function titleSize(title: string) {
  if (title.length > 150) return 34
  if (title.length > 110) return 38
  if (title.length > 70) return 44
  return 52
}

function Frame({ domain, children }: { domain: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: C.ledger,
        color: C.paper,
        padding: "64px 72px",
        fontFamily: "JetBrains Mono",
      }}
    >
      {children}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 22,
          borderTop: `1px solid ${C.rule}`,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 24,
          color: C.muted,
        }}
      >
        <span>{domain}</span>
        <span style={{ width: 64, height: 3, background: C.brass, alignSelf: "center" }} />
      </div>
    </div>
  )
}

export async function personCard(input: { name: string; role: string; statement: string; domain: string }) {
  return new ImageResponse(
    (
      <Frame domain={input.domain}>
        <div style={{ fontSize: 28, color: C.brassLight, marginBottom: 20 }}>{input.role}</div>
        <div style={{ fontFamily: "JetBrains Mono", fontWeight: 500, fontSize: 96, lineHeight: 1, letterSpacing: "-0.05em", marginBottom: 34 }}>
          {input.name}
        </div>
        <div style={{ fontFamily: "JetBrains Mono", fontWeight: 500, fontSize: 32, lineHeight: 1.4, maxWidth: 960 }}>{input.statement}</div>
      </Frame>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  )
}

export async function publicationCard(input: {
  kind: string
  status: string | null
  year: string | null
  title: string
  authorsPre: string
  authorsPost: string
  me: string
  venue: string | null
  domain: string
}) {
  // Only "Accepted" adds to the kind label ("Manuscript under review · Under review" would repeat itself).
  const status = input.status === "Accepted" ? input.status : null
  const meta = [input.kind, status, input.year].filter(Boolean).join("  ·  ")
  // Satori trims whitespace at the edges of flex children; keep the separators visible.
  const nb = (t: string) => t.replace(/^ | $/g, " ")
  return new ImageResponse(
    (
      <Frame domain={input.domain}>
        <div style={{ display: "flex", fontSize: 24, color: C.brassLight, marginBottom: 26 }}>{meta}</div>
        <div
          style={{
            fontFamily: "JetBrains Mono",
            fontWeight: 500,
            fontSize: titleSize(input.title),
            lineHeight: 1.12,
            letterSpacing: "-0.01em",
            maxWidth: 1040,
            marginBottom: 28,
          }}
        >
          {input.title}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", fontSize: 24, lineHeight: 1.45, color: C.muted, maxWidth: 1040 }}>
          <span>{nb(input.authorsPre)}</span>
          <span style={{ color: C.paper, fontWeight: 600 }}>{input.me}</span>
          <span>{nb(input.authorsPost)}</span>
        </div>
        {input.venue ? (
          <div style={{ display: "flex", fontSize: 22, lineHeight: 1.45, color: C.muted, marginTop: 6, maxWidth: 1040 }}>{input.venue}</div>
        ) : null}
      </Frame>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  )
}
