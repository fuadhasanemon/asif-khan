import type { Container, Engine } from "@tsparticles/engine"
import { ExternalInteractorBase, ensureInteractivityPluginLoaded, type IInteractivityData } from "@tsparticles/plugin-interactivity"

/** Pointer push (CLAUDE_CODE_PROMPT.md §5): up to 14 px aside within 140 px, velocity untouched. */
export const PUSH_RADIUS = 140
export const PUSH_MAX = 14
export const PUSH_MODE = "pushAside"

/**
 * External interactor that displaces particles at draw time only.
 * tsParticles draws particles and builds links from `getPosition()`, which is
 * `position + offset`; this sets `offset` from the pointer each frame and
 * never touches `position` or `velocity`, matching the prototype's
 * `x += dx / d * f` applied only to the drawn position.
 */
class PushAside extends ExternalInteractorBase {
  maxDistance = PUSH_RADIUS

  constructor(container: Container) {
    super(container)
  }

  clear() {}
  init() {}
  reset() {}

  isEnabled(data: IInteractivityData): boolean {
    const events = this.container.actualOptions.interactivity?.events
    const mode = events?.onHover.mode
    return !!events?.onHover.enable && (Array.isArray(mode) ? mode.includes(PUSH_MODE) : mode === PUSH_MODE) && !!data
  }

  interact(data: IInteractivityData) {
    const container = this.container as Container
    const ratio = container.retina.pixelRatio
    const radius = PUSH_RADIUS * ratio
    const max = PUSH_MAX * ratio
    const mouse = data.mouse.position
    for (const p of container.particles.filter(() => true)) {
      const { offset } = p
      if (!mouse) {
        offset.x = 0
        offset.y = 0
        continue
      }
      const dx = p.position.x - mouse.x
      const dy = p.position.y - mouse.y
      const d = Math.hypot(dx, dy)
      if (d < radius && d > 0.1) {
        const f = (1 - d / radius) * max
        offset.x = (dx / d) * f
        offset.y = (dy / d) * f
      } else {
        offset.x = 0
        offset.y = 0
      }
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
