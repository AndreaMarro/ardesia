// @vitest-environment jsdom
// MAESTRO-Studio — PL-1: applyTheme/resetTheme. Scrive SOLO gli 11 token
// plastici; neutro-default = zero override inline (fail-closed: DOM di oggi).

import { describe, it, expect, beforeEach } from "vitest"
import { applyTheme, resetTheme } from "../design/applyTheme"
import { deriveTheme, NEUTRAL_THEME, PLASTIC_VARS } from "../design/deriveTheme"
import type { StyleProfile } from "../design/styleProfile"

function profile(overrides: Partial<StyleProfile> = {}): StyleProfile {
  return {
    v: 1,
    teacher_id: "doc-ts",
    lessons_analyzed: 5,
    exercise_density: 0,
    question_density: 0,
    registro: 0,
    concept_granularity: 0,
    prereq_explicitness: 0,
    tics: [],
    ...overrides,
  }
}

describe("PL-1 applyTheme — fail-closed sul DOM", () => {
  beforeEach(() => {
    resetTheme()
  })

  it("FAIL-CLOSED: tema da profilo null → ZERO override inline (DOM identico a oggi)", () => {
    applyTheme(deriveTheme(null))
    expect(document.documentElement.style.length).toBe(0)
    for (const v of PLASTIC_VARS) {
      expect(document.documentElement.style.getPropertyValue(v)).toBe("")
    }
  })

  it("FAIL-CLOSED: anche un profilo VALIDO tutto-default → ZERO override inline", () => {
    applyTheme(deriveTheme(profile()))
    expect(document.documentElement.style.length).toBe(0)
  })

  it("tema terracotta: tutti gli 11 token scritti, NIENT'ALTRO", () => {
    const t = deriveTheme(profile({ exercise_density: 0.8, registro: 0.9 }))
    applyTheme(t)
    const style = document.documentElement.style
    expect(style.getPropertyValue("--m-accent")).toBe("#c2410c")
    expect(style.getPropertyValue("--m-accent-wash")).toBe("rgba(194,65,12,.06)")
    expect(style.getPropertyValue("--m-heading-font")).toBe("var(--m-font-display)")
    expect(style.getPropertyValue("--m-track")).toBe("2.52px")
    // esattamente 11 proprietà inline: una in più = sconfinamento
    expect(style.length).toBe(PLASTIC_VARS.length)
    const set = new Set(Array.from({ length: style.length }, (_, i) => style.item(i)))
    expect([...set].sort()).toEqual([...PLASTIC_VARS].sort())
  })

  it("SEMAFORI INTOCCABILI: --m-rec/--m-verified mai scritti, in nessuno stato", () => {
    applyTheme(deriveTheme(profile({ exercise_density: 0.9 })))
    for (const sem of ["--m-rec", "--m-rec-wash", "--m-verified", "--m-verified-wash", "--m-warn", "--m-error"]) {
      expect(document.documentElement.style.getPropertyValue(sem)).toBe("")
    }
    applyTheme(NEUTRAL_THEME)
    for (const sem of ["--m-rec", "--m-verified"]) {
      expect(document.documentElement.style.getPropertyValue(sem)).toBe("")
    }
  })

  it("SWITCH: terracotta → neutro-default rimuove OGNI override (torna tokens.css)", () => {
    applyTheme(deriveTheme(profile({ exercise_density: 0.8 })))
    expect(document.documentElement.style.length).toBe(PLASTIC_VARS.length)
    applyTheme(NEUTRAL_THEME)
    expect(document.documentElement.style.length).toBe(0)
  })

  it("SWITCH: terracotta → salvia sovrascrive senza residui della famiglia precedente", () => {
    applyTheme(deriveTheme(profile({ exercise_density: 0.8 })))
    applyTheme(deriveTheme(profile({ question_density: 0.8 })))
    const style = document.documentElement.style
    expect(style.getPropertyValue("--m-accent")).toBe("#0f766e")
    expect(style.getPropertyValue("--m-accent-deep")).toBe("#134e4a")
    expect(style.length).toBe(PLASTIC_VARS.length)
  })

  it("famiglia neutra ma tipografia NON default → il tema VIENE applicato (non è il neutro-default)", () => {
    const t = deriveTheme(profile({ registro: 0.9, exercise_density: 0.1 }))
    expect(t.family).toBe("neutral")
    applyTheme(t)
    const style = document.documentElement.style
    expect(style.getPropertyValue("--m-heading-font")).toBe("var(--m-font-display)")
    expect(style.getPropertyValue("--m-accent")).toBe("var(--m-blue)")
  })

  it("resetTheme rimuove gli override anche su un root custom", () => {
    const el = document.createElement("div")
    applyTheme(deriveTheme(profile({ exercise_density: 0.9 })), el)
    expect(el.style.getPropertyValue("--m-accent")).toBe("#c2410c")
    resetTheme(el)
    expect(el.style.length).toBe(0)
    // il documentElement non è stato toccato da questo giro
    expect(document.documentElement.style.length).toBe(0)
  })
})
