import { bibFile } from "@/lib/citations"
import { content, site } from "@/lib/content"

/** Every publication in one BibTeX file (unique keys), prerendered at build time. */
export async function GET() {
  return new Response(bibFile(content.publications), {
    headers: {
      "Content-Type": "application/x-bibtex; charset=utf-8",
      "Content-Disposition": `attachment; filename="${site.name.replace(/[^A-Za-z0-9]+/g, "-").replace(/-$/, "")}-publications.bib"`,
    },
  })
}
