// @vitest-environment jsdom
// MAESTRO-Studio — Test isReplayView

import { describe, it, expect, afterEach } from "vitest"
import { isReplayView } from "../store/isReplayView"

describe("isReplayView", () => {
  const originalLocation = window.location

  afterEach(() => {
    // Ripristina location originale
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    })
  })

  it("restituisce true per URL con ?vista=replay", () => {
    Object.defineProperty(window, "location", {
      value: { href: "https://studio.maestro.app/?vista=replay#room-1" },
      writable: true,
    })
    expect(isReplayView()).toBe(true)
  })

  it("restituisce false per URL senza vista=replay", () => {
    Object.defineProperty(window, "location", {
      value: { href: "https://studio.maestro.app/#room-1" },
      writable: true,
    })
    expect(isReplayView()).toBe(false)
  })

  it("restituisce false per vista=recap", () => {
    Object.defineProperty(window, "location", {
      value: { href: "https://studio.maestro.app/?vista=recap#room-1" },
      writable: true,
    })
    expect(isReplayView()).toBe(false)
  })

  it("restituisce false per vista=studente", () => {
    Object.defineProperty(window, "location", {
      value: { href: "https://studio.maestro.app/?vista=studente#room-1" },
      writable: true,
    })
    expect(isReplayView()).toBe(false)
  })

  it("restituisce false quando window non è definito", () => {
    const win = globalThis.window
    ;(globalThis as any).window = undefined
    expect(isReplayView()).toBe(false)
    ;(globalThis as any).window = win
  })
})
