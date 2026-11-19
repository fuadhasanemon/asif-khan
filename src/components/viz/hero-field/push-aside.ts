import type { Container, Engine, Particle } from "@tsparticles/engine"
import { ExternalInteractorBase, ensureInteractivityPluginLoaded, type IInteractivityData } from "@tsparticles/plugin-interactivity"

import { formation, formedness, layoutFor, stageAt, targetFor } from "./formation"

/** Pointer push (CLAUDE_CODE_PROMPT.md §5): up to 14 px aside within 140 px, velocity untouched. */
export const PUSH_RADIUS = 140
export const PUSH_MAX = 14
export const PUSH_MODE = "pushAside"

/** Link styling in the free field (spec) and in formation (a ledger grid of neighbour links). */
const FIELD_LINK = { distance: 132, opacity: 0.22 }
const FORMED_LINK = { distancePerCell: 1.35, opacity: 0.55 }

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * External interactor that displaces particles at draw time only.
 * tsParticles draws particles and builds links from `getPosition()`, which is
 * `position + offset`; this sets `offset` each frame and never touches
 * `position` or `velocity`. Two layers:
 *  1. the scroll scene (formation.ts): the drawn point moves toward the
 *     counted / classified / admitted formations;
 *  2. the pointer push, applied on top, so a visitor can disturb either.
 */
class PushAside extends ExternalInteractorBase {
  maxDistance = PUSH_RADIUS

  constructor(container: Container) {
    super(container)
  }

  clear() {}
  init() {}
  reset() {}

  isEnabled(): boolean {
    // Always on: the scene must also run (and settle back) without a pointer.
    return true
  }

  interact(data: IInteractivityData) {
    const container = this.container as Container
    const ratio = container.retina.pixelRatio
    const { width, height } = container.canvas.size
    const particles: Particle[] = container.particles.filter(() => true)
    const progress = formation.progress
    const events = this.container.actualOptions.interactivity?.events
    const pushOn = !!events?.onHover.enable
    const mouse = pushOn ? data.mouse.position : undefined
    const radius = PUSH_RADIUS * ratio
    const max = PUSH_MAX * ratio

    const layout = progress > 0 ? layoutFor(particles.length, width, height, particles.map((p) => p.group === "seal")) : null
    const formed = progress > 0 ? formedness(progress) : 0
    // Neighbour-link length follows the current formation's spacing (counted grid → tighter groups).
    const stage = stageAt(progress)
    const cellNow = layout
      ? stage.to >= 2
        ? lerp(stage.from >= 2 ? layout.groupCell : layout.cell, layout.groupCell, stage.from >= 2 ? 1 : stage.t)
        : layout.cell
      : 0
    const linkDistance = lerp(FIELD_LINK.distance * ratio, cellNow * FORMED_LINK.distancePerCell, formed)
    const linkOpacity = lerp(FIELD_LINK.opacity, FORMED_LINK.opacity, formed)

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]!
      const { offset, position } = p
      const target = layout ? targetFor(i, progress, layout, position) : null
      const drawnX = target ? target.x : position.x
      const drawnY = target ? target.y : position.y

      let px = 0
      let py = 0
      if (mouse) {
        const dx = drawnX - mouse.x
        const dy = drawnY - mouse.y
        const d = Math.hypot(dx, dy)
        if (d < radius && d > 0.1) {
          const f = (1 - d / radius) * max
          px = (dx / d) * f
          py = (dy / d) * f
        }
      }
      offset.x = drawnX - position.x + px
      offset.y = drawnY - position.y + py

      // Links: long and faint in the free field; short neighbour links in formation.
      // `linksDistance` is added to the retina props by the links plugin and read every frame.
      ;(p.retina as { linksDistance?: number }).linksDistance = linkDistance
      const links = p.options.links as { opacity?: number } | undefined
      if (links) links.opacity = linkOpacity
    }
  }
}

export async function loadPushAside(engine: Engine): Promise<void> {
  await engine.pluginManager.register((e) => {
    ensureInteractivityPluginLoaded(e)
    // addInteractor is attached to the plugin manager by the interactivity plugin.
    const pm = e.pluginManager as unknown as {
      addInteractor?: (name: string, init: (c: Container) => Promise<PushAside>) => void
    }
    pm.addInteractor?.("externalPushAside", (container) => Promise.resolve(new PushAside(container)))
  })
}
