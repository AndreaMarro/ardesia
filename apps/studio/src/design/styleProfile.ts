// MAESTRO-Studio — PL-1: contratto StyleProfile v1 + loader FAIL-CLOSED
// (DESIGN-MAESTRO-v1 §3.C). Il profilo è prodotto da lessonos (style.py) in
// derived/style_profile.json. Qualunque difetto — file assente, JSON rotto,
// chiave extra, valore fuori range, v≠1, lessons_analyzed<3 — produce `null`,
// MAI un throw: senza profilo valido lo studio resta al tema neutro di oggi.

import { z } from "zod"
import { PATHS } from "../store/types"

const unit = z.number().min(0).max(1)

/** Lezioni minime prima di etichettare lo stile di un docente (spec §4). */
export const MIN_LESSONS_ANALYZED = 3

// strictObject: una chiave sconosciuta = contratto violato = profilo scartato.
// Il vincolo lessons_analyzed>=3 sta NELLO schema: anche chi usa safeParse
// direttamente non può aggirare il fail-closed.
export const styleProfileSchema = z.strictObject({
  v: z.literal(1),
  teacher_id: z.string().min(1),
  lessons_analyzed: z.number().int().min(MIN_LESSONS_ANALYZED),
  exercise_density: unit,
  question_density: unit,
  registro: unit,
  concept_granularity: unit,
  prereq_explicitness: unit,
  tics: z.array(z.string()),
})

export type StyleProfile = z.infer<typeof styleProfileSchema>

const SCHEMA_KEYS = new Set(Object.keys(styleProfileSchema.shape))

/** Valida un valore arbitrario come StyleProfile v1. Fail-closed: null, mai throw. */
export function parseStyleProfile(raw: unknown): StyleProfile | null {
  try {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null
    // zod v4 ignora silenziosamente una own-property "__proto__" (anti-pollution):
    // il contratto invece la considera chiave extra → rifiuto esplicito.
    for (const key of Object.keys(raw)) {
      if (!SCHEMA_KEYS.has(key)) return null
    }
    const result = styleProfileSchema.safeParse(raw)
    return result.success ? result.data : null
  } catch {
    // getter/Proxy ostili nell'input: safeParse non li cattura, noi sì
    return null
  }
}

/** Sorgente minimale: basta la read del WorkspaceStore/driver. */
export interface ProfileSource {
  read(path: string): Promise<Blob | null>
}

/** Carica derived/style_profile.json dal workspace. Fail-closed: null, mai throw. */
export async function loadStyleProfile(source: ProfileSource): Promise<StyleProfile | null> {
  try {
    const blob = await source.read(PATHS.STYLE_PROFILE)
    if (!blob) return null
    const text = await blob.text()
    return parseStyleProfile(JSON.parse(text))
  } catch {
    return null
  }
}
