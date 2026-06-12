// MAESTRO-Studio — PL-1: deriveTheme (DESIGN-MAESTRO-v1 §4, formule esatte).
// Switch famiglia, isteresi Schmitt, fail-closed, invarianza tics, clamp.

import { describe, it, expect } from "vitest"
import {
  deriveTheme,
  NEUTRAL_THEME,
  PLASTIC_VARS,
  HYSTERESIS,
  type ThemeFamily,
} from "../design/deriveTheme"
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

describe("PL-1 deriveTheme — fail-closed e contratto output", () => {
  it("profilo null → NEUTRAL_THEME, identico ai default di tokens.css", () => {
    const t = deriveTheme(null)
    expect(t).toBe(NEUTRAL_THEME)
    expect(t.family).toBe("neutral")
    expect(t.variant).toBe("classico")
    expect(t.vars).toEqual({
      "--m-accent": "var(--m-blue)",
      "--m-accent-down": "var(--m-blue-down)",
      "--m-accent-deep": "var(--m-blue-deep)",
      "--m-accent-off": "var(--m-blue-off)",
      "--m-accent-wash": "var(--m-blue-wash)",
      "--m-accent-light": "var(--m-blue-light)",
      "--m-density": "1.00",
      "--m-track": "2.20px", // ≡ 2.2px di tokens.css, formato 2-decimali delle formule
      "--m-heading-font": "var(--m-font-ui)",
      "--m-rule-weight": "1px",
      "--m-h-scale": "1.00",
    })
  })

  it("l'output contiene ESATTAMENTE gli 11 token plastici — mai semafori o blu brand", () => {
    for (const t of [
      deriveTheme(null),
      deriveTheme(profile({ exercise_density: 0.9, registro: 1, concept_granularity: 1, prereq_explicitness: 1 })),
      deriveTheme(profile({ question_density: 0.9 })),
    ]) {
      expect(Object.keys(t.vars).sort()).toEqual([...PLASTIC_VARS].sort())
      for (const [k, v] of Object.entries(t.vars)) {
        expect(k).not.toMatch(/--m-(rec|verified|warn|error|blue)/)
        // mai i colori dei semafori come VALORE
        expect(v).not.toMatch(/#cf222e|#1a7f37|#9a6700|#b42318/i)
      }
    }
  })

  it("PURA: stesso input → stesso output, profilo non mutato", () => {
    const p = profile({ exercise_density: 0.8, registro: 0.7, tics: ["ecco"] })
    const before = JSON.stringify(p)
    expect(deriveTheme(p, "salvia")).toEqual(deriveTheme(p, "salvia"))
    expect(JSON.stringify(p)).toBe(before)
  })

  it("INVARIANZA TICS: profili che differiscono SOLO nei tics → tema identico", () => {
    const base = profile({ exercise_density: 0.7, registro: 0.9, concept_granularity: 0.5 })
    const conTics = { ...base, tics: ["diciamo", "un attimino", "praticamente"] }
    expect(deriveTheme(conTics)).toEqual(deriveTheme(base))
    expect(deriveTheme(conTics, "terracotta")).toEqual(deriveTheme(base, "terracotta"))
  })
})

describe("PL-1 deriveTheme — switch famiglia + isteresi Schmitt (§4)", () => {
  const ENTER = HYSTERESIS.ENTER // .65
  const STAY = HYSTERESIS.STAY // .55

  it(`terracotta ENTRA a P≥${ENTER}: P=.65 sì, P=.64 no`, () => {
    expect(deriveTheme(profile({ exercise_density: 0.65 })).family).toBe("terracotta")
    expect(deriveTheme(profile({ exercise_density: 0.65 })).variant).toBe("esercizio-first")
    expect(deriveTheme(profile({ exercise_density: 0.65 })).vars["--m-accent"]).toBe("#c2410c")
    expect(deriveTheme(profile({ exercise_density: 0.64 })).family).toBe("neutral")
  })

  it(`salvia ENTRA a D≥${ENTER} E D>P; a parità D=P vince terracotta`, () => {
    const salvia = deriveTheme(profile({ question_density: 0.7, exercise_density: 0.3 }))
    expect(salvia.family).toBe("salvia")
    expect(salvia.variant).toBe("socratico")
    expect(salvia.vars["--m-accent"]).toBe("#0f766e")
    // D alto ma NON > P → niente salvia; P≥.65 → terracotta
    expect(deriveTheme(profile({ question_density: 0.7, exercise_density: 0.7 })).family).toBe("terracotta")
    expect(deriveTheme(profile({ question_density: 0.71, exercise_density: 0.7 })).family).toBe("salvia")
  })

  it(`terracotta RESTA finché P>${STAY}: P=.56 resta, P=.55 esce (Schmitt, non soglia secca)`, () => {
    expect(deriveTheme(profile({ exercise_density: 0.56 }), "terracotta").family).toBe("terracotta")
    expect(deriveTheme(profile({ exercise_density: 0.55 }), "terracotta").family).toBe("neutral")
    // senza isteresi P=.56 NON basterebbe a entrare
    expect(deriveTheme(profile({ exercise_density: 0.56 }), "neutral").family).toBe("neutral")
  })

  it(`salvia RESTA finché D>${STAY}, anche se P sale (anti-sfarfallio)`, () => {
    expect(deriveTheme(profile({ question_density: 0.56, exercise_density: 0.9 }), "salvia").family).toBe("salvia")
    // sotto soglia bassa esce — e P=.9≥.65 fa entrare terracotta nello stesso tick
    expect(deriveTheme(profile({ question_density: 0.55, exercise_density: 0.9 }), "salvia").family).toBe("terracotta")
  })

  it("PRECEDENZA resta-vs-entra: prev=terracotta con P=.56 resta terracotta anche se D=.9 qualificherebbe salvia", () => {
    expect(deriveTheme(profile({ exercise_density: 0.56, question_density: 0.9 }), "terracotta").family).toBe("terracotta")
    // simmetrico: senza famiglia precedente, lo stesso profilo entra in salvia
    expect(deriveTheme(profile({ exercise_density: 0.56, question_density: 0.9 }), "neutral").family).toBe("salvia")
  })

  it("sequenza completa di SWITCH: neutro → entra → resta → torna neutro", () => {
    const steps: Array<[number, ThemeFamily]> = [
      [0.4, "neutral"], // sotto ENTER: niente
      [0.7, "terracotta"], // entra
      [0.6, "terracotta"], // resta (>.55) anche se sotto ENTER
      [0.5, "neutral"], // esce (≤.55)
      [0.6, "neutral"], // NON rientra: serve ENTER
    ]
    let fam: ThemeFamily = "neutral"
    for (const [P, expected] of steps) {
      fam = deriveTheme(profile({ exercise_density: P }), fam).family
      expect({ P, fam }).toEqual({ P, fam: expected })
    }
  })
})

describe("PL-1 deriveTheme — formule tipografiche (§4, clamp 2 decimali)", () => {
  it("registro F: track = 2.2px×(1+.16F) clamp [2.20,2.55] — F=.9→2.52px (esempio spec)", () => {
    expect(deriveTheme(profile({ registro: 0.9 })).vars["--m-track"]).toBe("2.52px")
    expect(deriveTheme(profile({ registro: 1 })).vars["--m-track"]).toBe("2.55px")
    expect(deriveTheme(profile({ registro: 0 })).vars["--m-track"]).toBe("2.20px")
  })

  it("registro F≥.60: serif Iowan + rule 1.5px; F=.59 resta UI + 1px", () => {
    const aulico = deriveTheme(profile({ registro: 0.6 }))
    expect(aulico.vars["--m-heading-font"]).toBe("var(--m-font-display)")
    expect(aulico.vars["--m-rule-weight"]).toBe("1.5px")
    const piano = deriveTheme(profile({ registro: 0.59 }))
    expect(piano.vars["--m-heading-font"]).toBe("var(--m-font-ui)")
    expect(piano.vars["--m-rule-weight"]).toBe("1px")
  })

  it("granularity G: density = 1+.10G clamp [1.00,1.10]", () => {
    expect(deriveTheme(profile({ concept_granularity: 1 })).vars["--m-density"]).toBe("1.10")
    expect(deriveTheme(profile({ concept_granularity: 0.5 })).vars["--m-density"]).toBe("1.05")
    expect(deriveTheme(profile({ concept_granularity: 0 })).vars["--m-density"]).toBe("1.00")
  })

  it("prereq R: h-scale = 1+.06R clamp [1.00,1.06]", () => {
    expect(deriveTheme(profile({ prereq_explicitness: 1 })).vars["--m-h-scale"]).toBe("1.06")
    expect(deriveTheme(profile({ prereq_explicitness: 0 })).vars["--m-h-scale"]).toBe("1.00")
    expect(deriveTheme(profile({ prereq_explicitness: 0.5 })).vars["--m-h-scale"]).toBe("1.03")
  })

  it("la tipografia si applica anche con famiglia accento neutra (righe §4 indipendenti)", () => {
    const t = deriveTheme(profile({ registro: 0.9, exercise_density: 0.1 }))
    expect(t.family).toBe("neutral")
    expect(t.vars["--m-heading-font"]).toBe("var(--m-font-display)")
    expect(t.vars["--m-accent"]).toBe("var(--m-blue)")
  })
})
