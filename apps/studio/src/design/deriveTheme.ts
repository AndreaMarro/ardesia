// MAESTRO-Studio — PL-1: deriveTheme PURA (DESIGN-MAESTRO-v1 §4, formule esatte).
// StyleProfile → MTheme {family, variant, vars(11)}. Isteresi di Schmitt sulla
// famiglia accento (entra ≥.65, resta >.55), clamp a 2 decimali sui numerici,
// null → NEUTRAL. I semafori (--m-rec/--m-verified/--m-warn/--m-error) e il blu
// brand NON compaiono MAI nell'output: i token riscrivibili sono SOLO questi 11.

import type { StyleProfile } from "./styleProfile"

export const PLASTIC_VARS = [
  "--m-accent",
  "--m-accent-down",
  "--m-accent-deep",
  "--m-accent-off",
  "--m-accent-wash",
  "--m-accent-light",
  "--m-density",
  "--m-track",
  "--m-heading-font",
  "--m-rule-weight",
  "--m-h-scale",
] as const

export type PlasticVar = (typeof PLASTIC_VARS)[number]

export type ThemeFamily = "neutral" | "terracotta" | "salvia"
export type ThemeVariant = "classico" | "esercizio-first" | "socratico"

export interface MTheme {
  family: ThemeFamily
  variant: ThemeVariant
  vars: Record<PlasticVar, string>
}

// Soglie Schmitt (§4): entra ≥ ENTER, resta finché > STAY.
export const HYSTERESIS = { ENTER: 0.65, STAY: 0.55 } as const

type AccentPalette = Pick<
  Record<PlasticVar, string>,
  "--m-accent" | "--m-accent-down" | "--m-accent-deep" | "--m-accent-off" | "--m-accent-wash" | "--m-accent-light"
>

// Neutro = il blu brand di tokens.css (riferimenti var: zero drift se il blu cambia lì).
const NEUTRAL_ACCENT: AccentPalette = {
  "--m-accent": "var(--m-blue)",
  "--m-accent-down": "var(--m-blue-down)",
  "--m-accent-deep": "var(--m-blue-deep)",
  "--m-accent-off": "var(--m-blue-off)",
  "--m-accent-wash": "var(--m-blue-wash)",
  "--m-accent-light": "var(--m-blue-light)",
}

const TERRACOTTA_ACCENT: AccentPalette = {
  "--m-accent": "#c2410c",
  "--m-accent-down": "#9a3412",
  "--m-accent-deep": "#7c2d12",
  "--m-accent-off": "#f0b8a0",
  "--m-accent-wash": "rgba(194,65,12,.06)",
  "--m-accent-light": "rgba(194,65,12,.12)",
}

const SALVIA_ACCENT: AccentPalette = {
  "--m-accent": "#0f766e",
  "--m-accent-down": "#115e59",
  "--m-accent-deep": "#134e4a",
  "--m-accent-off": "#99ccc6",
  "--m-accent-wash": "rgba(15,118,110,.06)",
  "--m-accent-light": "rgba(15,118,110,.12)",
}

const ACCENTS: Record<ThemeFamily, AccentPalette> = {
  neutral: NEUTRAL_ACCENT,
  terracotta: TERRACOTTA_ACCENT,
  salvia: SALVIA_ACCENT,
}

const VARIANTS: Record<ThemeFamily, ThemeVariant> = {
  neutral: "classico",
  terracotta: "esercizio-first",
  salvia: "socratico",
}

/** Tema neutro = default odierno di tokens.css (track "2.20px" ≡ "2.2px" in CSS:
 *  stesso formato a 2 decimali delle formule, così un profilo tutto-default
 *  produce vars identiche al neutro e applyTheme non scrive alcun override). */
export const NEUTRAL_THEME: MTheme = Object.freeze({
  family: "neutral" as const,
  variant: "classico" as const,
  vars: Object.freeze({
    ...NEUTRAL_ACCENT,
    "--m-density": "1.00",
    "--m-track": "2.20px",
    "--m-heading-font": "var(--m-font-ui)",
    "--m-rule-weight": "1px",
    "--m-h-scale": "1.00",
  }),
})

/** Arrotonda a 2 decimali POI clampa (§4: "clamp a 2 decimali"). */
function round2clamp(value: number, lo: number, hi: number): number {
  const rounded = Math.round(value * 100) / 100
  return Math.min(hi, Math.max(lo, rounded))
}

/**
 * Famiglia accento con isteresi di Schmitt:
 * - terracotta: entra P≥.65, resta finché P>.55
 * - salvia: entra D≥.65 E D>P, resta finché D>.55
 * Restare nella famiglia corrente ha precedenza sull'ingresso in un'altra
 * (anti-sfarfallio: si esce solo sotto la soglia bassa).
 */
function resolveFamily(P: number, D: number, prev: ThemeFamily): ThemeFamily {
  if (prev === "terracotta" && P > HYSTERESIS.STAY) return "terracotta"
  if (prev === "salvia" && D > HYSTERESIS.STAY) return "salvia"
  if (D >= HYSTERESIS.ENTER && D > P) return "salvia"
  if (P >= HYSTERESIS.ENTER) return "terracotta"
  return "neutral"
}

/**
 * Deriva il tema dal profilo. PURA: stesso input → stesso output, nessun I/O.
 * `prev` è la famiglia attiva prima di questa derivazione (per l'isteresi);
 * profilo null/assente → NEUTRAL_THEME (fail-closed). I tics NON influenzano
 * l'output (invarianza §4: solo testo dispense, mai UI).
 */
export function deriveTheme(profile: StyleProfile | null, prev: ThemeFamily = "neutral"): MTheme {
  if (!profile) return NEUTRAL_THEME

  const family = resolveFamily(profile.exercise_density, profile.question_density, prev)
  const F = profile.registro
  const serif = F >= 0.6

  return {
    family,
    variant: VARIANTS[family],
    vars: {
      ...ACCENTS[family],
      "--m-density": round2clamp(1 + 0.1 * profile.concept_granularity, 1.0, 1.1).toFixed(2),
      "--m-track": `${round2clamp(2.2 * (1 + 0.16 * F), 2.2, 2.55).toFixed(2)}px`,
      "--m-heading-font": serif ? "var(--m-font-display)" : "var(--m-font-ui)",
      "--m-rule-weight": serif ? "1.5px" : "1px",
      "--m-h-scale": round2clamp(1 + 0.06 * profile.prereq_explicitness, 1.0, 1.06).toFixed(2),
    },
  }
}
