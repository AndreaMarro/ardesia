// @vitest-environment jsdom
// MAESTRO-Studio — Test isRecapView

import { describe, it, expect, afterEach } from "vitest"
import { isRecapView } from "../store/isRecapView"

describe("isRecapView", () => {
  const originalLocation = window.location

  afterEach(() => {
    // Ripristina location originale
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    })
  })

  it("restituisce true per URL con ?vista=recap", () => {
    Object.defineProperty(window, "location", {
      value: { href: "https://studio.maestro.app/?vista=recap#room-1" },
      writable: true,
    })
    expect(isRecapView()).toBe(true)
  })

  it("restituisce false per URL senza vista=recap", () => {
    Object.defineProperty(window, "location", {
      value: { href: "https://studio.maestro.app/#room-1" },
      writable: true,
    })
    expect(isRecapView()).toBe(false)
  })

  it("restituisce false per vista=studente", () => {
    Object.defineProperty(window, "location", {
      value: { href: "https://studio.maestro.app/?vista=studente#room-1" },
      writable: true,
    })
    expect(isRecapView()).toBe(false)
  })

  it("restituisce false quando window non è definito", () => {
    const win = globalThis.window
    ;(globalThis as any).window = undefined
    expect(isRecapView()).toBe(false)
    ;(globalThis as any).window = win
  })
})
