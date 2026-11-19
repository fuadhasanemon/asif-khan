import { describe, expect, it } from "vitest"

import publicationsJson from "@content/publications.json"
import { apa, baseBibtexKey, bibFile, bibtex, bibtexKeys, chicago, cite } from "@/lib/citations"
import { PublicationsSchema, type Publication } from "@/lib/schemas"

import { proto, protoPub } from "./prototype"

const pubs = PublicationsSchema.parse(publicationsJson)
const byId = (id: string) => pubs.find((p) => p.id === id)!

describe("parity with the prototype's cite()", () => {
  for (const p of pubs) {
    it(`${p.id} (${p.type}) — APA, Chicago and BibTeX match`, () => {
      const pp = protoPub(p.id)
      expect(apa(p)).toBe(proto.cite(pp, "apa"))
      // Only intentional difference: the prototype's double period after a sole author.
      const protoChicago = proto.cite(pp, "chicago")
      const expected = p.authors.length === 1 ? protoChicago.replace(/^(Khan, M\. A\.)\. /, "$1 ") : protoChicago
      expect(chicago(p)).toBe(expected)
      expect(bibtex(p)).toBe(proto.cite(pp, "bibtex"))
    })
  }
})

/* Readable fixtures: one representative per publication type, per style. */
describe("APA 7", () => {
  it("journal article with volume, issue and pages", () => {
    expect(apa(byId("p0"))).toBe(
      "Habib, M. T., Al Afand, S. M. S., & Khan, M. A. (2026). An appraisal of the economic imperatives of China’s Belt and Road Initiative: Lessons from Africa. Bangladesh Institute of International and Strategic Studies Journal (BIISS Journal), 47(3), 389–413. https://doi.org/10.56888/biiss-journal.v47i3.a1006",
    )
  })
  it("journal article with an article number", () => {
    expect(apa(byId("p1"))).toBe(
      "Khan, M. A., Papia, S. K., Ali, K. M. Y., Khan, H. A., Rahman, M., & Islam, M. N. (2026). Sentiment analysis datasets: A review of trends, challenges, and future opportunities. PeerJ Computer Science, 12, e3806. https://doi.org/10.7717/peerj-cs.3806",
    )
  })
  it("conference paper", () => {
    expect(apa(byId("p5"))).toBe(
      "Chowdhury, S. T., Rahman, M., Khan, M. A., & Sarwar, H. (2025). Flood prediction in Bangladesh: A comparative study of machine learning models. In 2025 IEEE International Conference on Quantum Photonics, Artificial Intelligence, and Networking (QPAIN) (pp. 1–6). IEEE. https://doi.org/10.1109/QPAIN66474.2025.11172165",
    )
  })
  it("presentation without and with a DOI", () => {
    expect(apa(byId("p6"))).toBe(
      "Khan, M. A. (2027). Genocide, numbers, and memory: The death toll and the apology demand in Bangladesh–Pakistan relations since 1971 [Paper presentation]. Midwest Political Science Association (MPSA) 84th Annual Conference, Chicago, IL.",
    )
    expect(apa(byId("p9")).endsWith("[Paper presentation]. QPAIN 2025, Saidpur, Bangladesh. https://doi.org/10.1109/QPAIN66474.2025.11172165")).toBe(true)
  })
  it("manuscript under review", () => {
    expect(apa(byId("p10"))).toBe(
      "Habib, M. T., & Khan, M. A. (under review). Strategic intelligence and smaller states: An agenda for the post-July 2024 uprising in Bangladesh [Manuscript submitted for publication].",
    )
  })
  it("manuscript in preparation", () => {
    expect(apa(byId("p14"))).toBe(
      "Khan, M. A. (in preparation). Speed, verification, and accountability: Human oversight beyond formal authority in federal AI workflows [Manuscript in preparation].",
    )
  })
})

describe("Chicago author-date", () => {
  it("journal article: first author inverted, others in natural order", () => {
    expect(chicago(byId("p0"))).toBe(
      "Habib, M. T., S. M. S. Al Afand, and M. A. Khan. 2026. “An appraisal of the economic imperatives of China’s Belt and Road Initiative: Lessons from Africa.” Bangladesh Institute of International and Strategic Studies Journal (BIISS Journal) 47 (3): 389–413. https://doi.org/10.56888/biiss-journal.v47i3.a1006.",
    )
  })
  it("conference paper", () => {
    expect(chicago(byId("p3"))).toBe(
      "Das, S., T. C. Ghos, M. A. Khan, P. Chandra, J. Bino, and U. Venkateswara. 2026. “A global survey of AI in smart transportation systems for smart cities.” In 2026 IEEE 2nd International Conference on Quantum Photonics, Artificial Intelligence & Networking (QPAIN), 1–6. IEEE. https://doi.org/10.1109/QPAIN69676.2026.11546181.",
    )
  })
  it("presentation", () => {
    expect(chicago(byId("p7"))).toBe(
      "Habib, M. T., M. A. Khan, and M. D. Islam. 2027. “Beyond EPS: Bangladesh–South Korea labor cooperation under demographic pressure through migration diplomacy, corridor reliability, and institutional upgrading.” Paper presented at the Midwest Political Science Association (MPSA) 84th Annual Conference, Chicago, IL, April 1–4, 2027.",
    )
  })
  it("two authors use “, and”; status replaces the year", () => {
    expect(chicago(byId("p10"))).toBe(
      "Habib, M. T., and M. A. Khan. Under review. “Strategic intelligence and smaller states: An agenda for the post-July 2024 uprising in Bangladesh.” Manuscript under review.",
    )
  })
  it("sole author: no double period (fixed vs prototype)", () => {
    expect(chicago(byId("p6"))).toMatch(/^Khan, M\. A\. 2027\. “Genocide/)
  })
  it("manuscript in preparation", () => {
    expect(chicago(byId("p15"))).toBe(
      "Khan, M. A. In preparation. “Genocide, numbers, and memory: The death toll and the apology demand in Bangladesh–Pakistan relations since 1971.” Manuscript in preparation.",
    )
  })
})

describe("BibTeX", () => {
  it("journal article", () => {
    expect(bibtex(byId("p1"))).toBe(
      [
        "@article{khan2026sentiment,",
        "  author = {Khan, M. A. and Papia, S. K. and Ali, K. M. Y. and Khan, H. A. and Rahman, M. and Islam, M. N.},",
        "  title = {Sentiment analysis datasets: A review of trends, challenges, and future opportunities},",
        "  journal = {PeerJ Computer Science},",
        "  volume = {12},",
        "  pages = {e3806},",
        "  publisher = {PeerJ},",
        "  year = {2026},",
        "  doi = {10.7717/peerj-cs.3806}",
        "}",
      ].join("\n"),
    )
  })
  it("journal article: pages en dash becomes --, curly apostrophe straightened", () => {
    const b = bibtex(byId("p0"))
    expect(b).toContain("  pages = {389--413},")
    expect(b).toContain("China's Belt")
    expect(b).toContain("  number = {3},")
  })
  it("conference paper and presentation are @inproceedings with booktitle", () => {
    expect(bibtex(byId("p4"))).toMatch(/^@inproceedings\{das2026survey,/)
    expect(bibtex(byId("p4"))).toContain("  booktitle = {2026 IEEE 2nd International Conference")
    expect(bibtex(byId("p8"))).toMatch(/^@inproceedings\{banavath2026optimized,/)
  })
  it("under review: @unpublished with a note and no publisher or year", () => {
    const b = bibtex(byId("p11"))
    expect(b).toMatch(/^@unpublished\{abedinndwater,/)
    expect(b).toContain("  note = {Manuscript under review}")
    expect(b).not.toContain("publisher")
    expect(b).not.toContain("year")
  })
  it("in preparation: @unpublished with a note", () => {
    expect(bibtex(byId("p17"))).toBe(
      [
        "@unpublished{khanndclimate,",
        "  author = {Khan, M. A. and Abedin, R. and Akter, H.},",
        "  title = {Climate justice after displacement: Assessment of housing security, livelihood recovery, and access to basic services for displaced people living along coastlines of Bangladesh},",
        "  note = {Manuscript in preparation}",
        "}",
      ].join("\n"),
    )
  })
})

describe("BibTeX keys", () => {
  it("base key follows the prototype rule", () => {
    expect(baseBibtexKey(byId("p2"))).toBe("papia2024distilrobilstmfuse")
  })
  it("keys are unique across the full list; the later duplicate gets a suffix", () => {
    const keys = bibtexKeys(pubs)
    expect(new Set(keys.values()).size).toBe(pubs.length)
    expect(keys.get("p5")).toBe("chowdhury2025flood")
    expect(keys.get("p9")).toBe("chowdhury2025floodb")
  })
  it("combined .bib contains every entry once, with unique keys", () => {
    const file = bibFile(pubs)
    expect(file.match(/^@/gm)).toHaveLength(pubs.length)
    expect(file).toContain("@inproceedings{chowdhury2025floodb,")
  })
  it("a single-entry .bib uses the de-duplicated key", () => {
    expect(bibFile(pubs, [byId("p9")])).toMatch(/^@inproceedings\{chowdhury2025floodb,/)
  })
})

describe("cite() dispatch", () => {
  it("routes each style", () => {
    const p: Publication = byId("p2")
    expect(cite(p, "apa")).toBe(apa(p))
    expect(cite(p, "chicago")).toBe(chicago(p))
    expect(cite(p, "bibtex", "custom")).toMatch(/^@article\{custom,/)
  })
})
