"use client"

import { useMemo } from "react"
import { Particles, ParticlesProvider } from "@tsparticles/react"
import type { Engine, ISourceOptions, Particle } from "@tsparticles/engine"
import { loadBasic } from "@tsparticles/basic"
import { loadInteractivityPlugin } from "@tsparticles/plugin-interactivity"
import { loadParticlesLinksInteraction } from "@tsparticles/interaction-particles-links"

import { PUSH_MODE, loadPushAside } from "./push-aside"

/** Spec (CLAUDE_CODE_PROMPT.md §5), mirrored from the prototype's canvas loop. */
const AREA_PER_PARTICLE = 14_000
const MIN_PARTICLES = 18
const MAX_PARTICLES = 110
const RIGHT_BIAS = 0.55 // x = width × random^0.55
const SEAL_EVERY = 9
const LINK_DISTANCE = 132

export function particleCount(width: number, height: number) {
  return Math.max(MIN_PARTICLES, Math.min(MAX_PARTICLES, Math.round((width * height) / AREA_PER_PARTICLE)))
}

/**
 * Only what the field uses: core shapes/movement, links, interactivity, the
 * push-aside interactor, and a listener that gives every new particle the
 * prototype's right-biased x. It runs for particles tsParticles (re)creates
 * itself too (e.g. after a canvas resize), so the layout never degrades.
 */
async function init(engine: Engine) {
  await loadBasic(engine)
  await loadInteractivityPlugin(engine)
  await loadParticlesLinksInteraction(engine)
  await loadPushAside(engine)
  engine.addEventListener("particleAdded", (event) => {
    const particle = (event?.data as { particle?: Particle } | undefined)?.particle
    const width = event?.container?.canvas.size.width
    if (particle && width) particle.position.x = width * Math.pow(Math.random(), RIGHT_BIAS)
  })
}

/** Field options. Everything is declarative so tsParticles can rebuild the field at any time. */
function fieldOptions(count: number, reduced: boolean): ISourceOptions {
  const seals = Math.ceil(count / SEAL_EVERY)
  return {
    fullScreen: { enable: false },
    background: { color: { value: "transparent" } },
    detectRetina: true,
    // Reduced motion: nothing moves and the pointer does nothing, so every frame
    // is the same still image. The loop keeps running (capped at 30 fps) because
    // a resize makes tsParticles rebuild the field onto a cleared canvas; a slow
    // or stopped loop would leave it visibly blank (measured: blank until the
    // next frame). As in the prototype, a resize re-lays the field.
    fpsLimit: reduced ? 30 : 60,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    particles: {
      number: { value: count - seals, density: { enable: false } },
      paint: { color: { value: "#d6deda" } },
      opacity: { value: 0.55 },
      size: { value: { min: 0.9, max: 2.2 } },
      shape: { type: "circle" },
      move: {
        enable: !reduced,
        speed: { min: 0.04, max: 0.15 }, // prototype: |v| ≲ 0.11 px/frame per axis
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
      },
      links: {
        enable: true,
        distance: LINK_DISTANCE,
        color: "#becdc7",
        opacity: 0.22, // fades with distance, as in the prototype
        width: 0.7,
      },
      groups: {
        // Every ninth particle is a brass "seal": brass at .9 opacity, radius + 0.8.
        seal: {
          number: { value: seals, density: { enable: false } },
          paint: { color: { value: "#c9a44c" } },
          opacity: { value: 0.9 },
          size: { value: { min: 1.7, max: 3.0 } },
        },
      },
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: { enable: !reduced, mode: PUSH_MODE },
        onClick: { enable: false },
        resize: { enable: true },
      },
    },
  }
}

export default function HeroField({ width, height, reduced }: { width: number; height: number; reduced: boolean }) {
  const count = particleCount(width, height)
  const options = useMemo(() => fieldOptions(count, reduced), [count, reduced])
  return (
    <ParticlesProvider init={init}>
      <Particles id="hero-field" className="particles-field" options={options} />
    </ParticlesProvider>
  )
}
