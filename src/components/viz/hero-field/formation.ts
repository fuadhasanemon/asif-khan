/**
 * The hero's scroll scene: the particle field acts out the site's statement,
 * "how states count, classify, and admit people".
 *
 *   field ──► counted (a ledger grid) ──► classified (three groups) ──► admitted
 *                                                         (brass seals cross the line)
 *
 * `formation.progress` (0–1) is written by the pinned ScrollTrigger in
 * HeroScene and read every frame by the push-aside interactor, which moves
 * each particle's drawn position (its offset) toward the formation. Velocity
 * and real positions are never touched, so the field resumes drifting when
 * the scene is scrolled back.
 *
 * Geometry is in canvas pixels and shared with the DOM overlay (caption and
 * gate line) through the REGION/GATE fractions below.
 */

/**
 * `x0`: where the scene region starts, as a fraction of the hero width. HeroScene
 * measures it on every refresh so the formations never crowd the name.
 */
export const formation = { progress: 0, x0: 0.68 }

/** Scene region, as fractions of the hero: the right side, clear of the name and statement (x0 is a minimum). */
export const REGION = { x0: 0.68, x1: 0.95, y0: 0.2, y1: 0.76 }
/** Minimum gap between the end of the name and the scene, in CSS px. */
export const NAME_GAP = 56
/** The "admitted" gate, as a fraction across the region. */
export const GATE_AT = 0.72

/** Scroll progress windows for each move (holds in between). */
const MOVES = [
  { from: 0.06, to: 0.3 }, // field → counted
  { from: 0.38, to: 0.62 }, // counted → classified
  { from: 0.7, to: 0.92 }, // classified → admitted
] as const

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

export type Point = { x: number; y: number }
/** `cell`: spacing in the counted grid; `groupCell`: tighter spacing used once classified. */
type Layout = { counted: Point[]; classified: Point[]; admitted: Point[]; cell: number; groupCell: number }

/**
 * Which two states the field is between, and how far (eased).
 * Stage 0 is the free field (no target).
 */
export function stageAt(progress: number): { from: 0 | 1 | 2 | 3; to: 0 | 1 | 2 | 3; t: number } {
  for (let i = MOVES.length - 1; i >= 0; i--) {
    const m = MOVES[i]!
    if (progress >= m.from) {
      const t = easeInOut(clamp01((progress - m.from) / (m.to - m.from)))
      return { from: i as 0 | 1 | 2, to: (i + 1) as 1 | 2 | 3, t }
    }
  }
  return { from: 0, to: 0, t: 0 }
}

/** How "formed" the field is, for link styling: 0 in the free field, 1 once counted. */
export const formedness = (progress: number) => easeInOut(clamp01((progress - MOVES[0].from) / (MOVES[0].to - MOVES[0].from)))

let cache: { key: string; layout: Layout } | null = null

/**
 * Formation targets for `n` particles in a `w`×`h` canvas. `isSeal[i]` marks
 * the brass seals, which are the ones admitted past the gate.
 */
export function layoutFor(n: number, w: number, h: number, isSeal: boolean[]): Layout {
  const key = `${n}:${Math.round(w)}:${Math.round(h)}:${formation.x0}:${isSeal.map((s) => (s ? 1 : 0)).join("")}`
  if (cache?.key === key) return cache.layout

  const x0 = w * formation.x0
  const x1 = w * REGION.x1
  const y0 = h * REGION.y0
  const y1 = h * REGION.y1
  const rw = x1 - x0
  const rh = y1 - y0

  // tsParticles creates the seal group first; interleave seals one in nine so
  // the ledger and the groups read like the field (slot[i] = particle i's place).
  const seals = isSeal.flatMap((s, i) => (s ? [i] : []))
  const others = isSeal.flatMap((s, i) => (s ? [] : [i]))
  const order: number[] = []
  for (let j = 0; j < n; j++) order.push((j % 9 === 0 && seals.length ? seals.shift() : others.shift() ?? seals.shift())!)
  const slot: number[] = []
  order.forEach((particle, j) => (slot[particle] = j))

  // Counted: one ledger grid, row by row.
  const cols = Math.max(6, Math.round(Math.sqrt((n * rw) / rh)))
  const rows = Math.ceil(n / cols)
  const cell = Math.min(rw / cols, rh / rows)
  const gx = x0 + (rw - cell * (cols - 1)) / 2
  const gy = y0 + (rh - cell * (rows - 1)) / 2
  const counted = Array.from({ length: n }, (_, i) => {
    const j = slot[i]!
    return { x: gx + (j % cols) * cell, y: gy + Math.floor(j / cols) * cell }
  })

  // Classified: three groups side by side, each its own small, tighter grid.
  const groups = 3
  const groupCell = cell * 0.7
  const gap = groupCell * 2.2
  const blockCols = Math.max(2, Math.floor((rw - gap * (groups - 1)) / groups / groupCell) + 1)
  const blockW = groupCell * (blockCols - 1)
  const perGroup = Math.ceil(n / groups)
  const blockRows = Math.ceil(perGroup / blockCols)
  const by = y0 + (rh - groupCell * (blockRows - 1)) / 2
  const totalW = groups * blockW + (groups - 1) * gap
  const bx0 = x0 + (rw - totalW) / 2
  const classifiedAt = (g: number, k: number, left: number, width: number, colsIn: number) => ({
    x: left + g * (width + gap) + (k % colsIn) * groupCell,
    y: by + Math.floor(k / colsIn) * groupCell,
  })
  const counters = [0, 0, 0]
  const classified: Point[] = []
  for (const i of order) {
    const g = slot[i]! % groups
    classified[i] = classifiedAt(g, counters[g]!++, bx0, blockW, blockCols)
  }

  // Admitted: the groups close up left of the gate; the brass seals line up past it.
  const gateX = x0 + rw * GATE_AT
  const leftW = gateX - x0 - gap
  const aCols = Math.max(2, Math.floor((leftW - gap * (groups - 1)) / groups / groupCell) + 1)
  const aBlockW = groupCell * (aCols - 1)
  const aRows = Math.ceil(perGroup / aCols)
  const ay = y0 + (rh - groupCell * (aRows - 1)) / 2
  const sealCount = isSeal.filter(Boolean).length
  const sealGap = Math.min(groupCell * 1.6, rh / Math.max(1, sealCount))
  const sealX = gateX + (x1 - gateX) / 2
  const sy0 = y0 + (rh - sealGap * (sealCount - 1)) / 2
  const aCounters = [0, 0, 0]
  let sealIndex = 0
  const admitted: Point[] = []
  for (const i of order) admitted[i] = admittedAt(i)
  function admittedAt(i: number): Point {
    if (isSeal[i]) return { x: sealX, y: sy0 + sealGap * sealIndex++ }
    const g = slot[i]! % groups
    const k = aCounters[g]!++
    return { x: x0 + g * (aBlockW + gap) + (k % aCols) * groupCell, y: ay + Math.floor(k / aCols) * groupCell }
  }

  const layout = { counted, classified, admitted, cell, groupCell }
  cache = { key, layout }
  return layout
}

/** The drawn point for particle i at the current progress, or null in the free field. */
export function targetFor(i: number, progress: number, layout: Layout, free: Point): Point | null {
  const { from, to, t } = stageAt(progress)
  if (to === 0) return null
  const pick = (s: 0 | 1 | 2 | 3): Point =>
    s === 0 ? free : s === 1 ? layout.counted[i]! : s === 2 ? layout.classified[i]! : layout.admitted[i]!
  const a = pick(from)
  const b = pick(to)
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}
