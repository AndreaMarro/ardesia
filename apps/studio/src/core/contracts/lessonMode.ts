// Core contract — LessonMode (PRODUCT-CANON §3): da stringhe `buildMode`
// ad-hoc di ELAB a enum tipato di Core, condiviso da TUTTI i plugin.
// Il canon definisce DUE modalità; "sandbox"/montaggi-liberi resta un
// buildMode interno del plugin finché il canon non lo promuove.

import { z } from "zod"

export const LessonModeSchema = z.enum(["passo-passo", "gia-montato"])

export type LessonMode = z.infer<typeof LessonModeSchema>

const BUILD_MODE_TO_LESSON_MODE: Record<string, LessonMode> = {
  complete: "gia-montato",
  guided: "passo-passo",
}

/**
 * Mappa un buildMode legacy ELAB ("complete"/"guided"/"sandbox") sul canon.
 * Fail-closed: tutto ciò che non è nel canon → undefined (nessuna inferenza).
 */
export function lessonModeFromBuildMode(buildMode: string): LessonMode | undefined {
  return BUILD_MODE_TO_LESSON_MODE[buildMode]
}
