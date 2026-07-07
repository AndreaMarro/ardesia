// Student Pack come ARTEFATTO (NOTTE-13, decisione autonoma): prima di questo
// modulo "Genera pack" / "Esporta" del cruscotto Z7 erano SOLO eventi
// sull'event-log — nessun file consegnabile allo studente (Product Flow Audit
// NOTTE-12, blocco #2). Qui il pack diventa un JSON versionato, scaricabile e
// re-importabile (round-trip chiuso).
//
// ZERO PII: il pack porta id/etichette didattiche/evidenze del LIBRO
// (pagina/claim/estratto), mai nomi o dati di studenti reali.
// Modulo puro: il download è della vista; i timestamp arrivano dal chiamante.

import { z } from "zod"
import type { TeacherDashboardProjection } from "./teacherDashboardProjection"

export const STUDENT_PACK_FORMAT = "ardesia.studentpack/1"

type Z7Candidate = TeacherDashboardProjection["studentPackQueue"][number]

// Le labels reali dell'event-log possono avere solo "it" (mai inventare "en").
const labelsSchema = z.object({ it: z.string(), en: z.string().optional() }).passthrough()

// EvidenceRef dell'event-log = stringa di provenienza ("evento#seq" / ref
// libro): il pack le trasporta INTATTE, sono la catena di custodia.
const packSchema = z.object({
  candidateId: z.string().min(1),
  errorId: z.string().min(1),
  fromRoom: z.string(),
  label: labelsSchema,
  evidence: z.array(z.string()),
})

const artifactSchema = z.object({
  format: z.literal(STUDENT_PACK_FORMAT),
  exportedAt: z.number(),
  packs: z.array(packSchema).min(1),
})

export type StudentPackArtifact = z.infer<typeof artifactSchema>

/** Artefatto dal candidato Z7 (il gesto "Esporta" fotografa QUESTO pack). */
export function buildStudentPackArtifact(
  candidate: Pick<Z7Candidate, "candidateId" | "errorId" | "fromRoom" | "label" | "evidenceRefs">,
  options: { now: number },
): StudentPackArtifact {
  return {
    format: STUDENT_PACK_FORMAT,
    exportedAt: options.now,
    packs: [
      {
        candidateId: candidate.candidateId,
        errorId: candidate.errorId,
        fromRoom: candidate.fromRoom,
        // "it" garantito nell'artefatto: la prima label disponibile quando
        // il log non ha l'italiano (mai una stringa vuota inventata a caso).
        label: {
          ...candidate.label,
          it: candidate.label.it ?? Object.values(candidate.label)[0] ?? "(senza etichetta)",
        },
        evidence: [...candidate.evidenceRefs],
      },
    ],
  }
}

export function studentPackFileName(candidateId: string, exportedAt: number): string {
  const safe = candidateId.replace(/[^a-zA-Z0-9_-]/g, "_")
  return `studentpack-${safe}-${exportedAt}.json`
}

export type StudentPackParseResult =
  | { ok: true; artifact: StudentPackArtifact }
  | { ok: false; error: string }

/**
 * Parse fail-closed di un artefatto (import/riapertura): JSON invalido,
 * formato sconosciuto o schema violato = errore DICHIARATO, mai un pack
 * parzialmente ricostruito.
 */
export function parseStudentPackArtifact(rawText: string): StudentPackParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawText)
  } catch (error) {
    return { ok: false, error: `JSON non valido: ${String(error)}` }
  }
  const result = artifactSchema.safeParse(parsed)
  if (!result.success) {
    const issue = result.error.issues[0]
    return {
      ok: false,
      error: `non è un student pack ${STUDENT_PACK_FORMAT}: ${issue?.path.join(".") ?? ""} ${issue?.message ?? ""}`.trim(),
    }
  }
  return { ok: true, artifact: result.data }
}
