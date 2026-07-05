// Core contract — BoardCitation (ARCHITECTURE-CANON §4): il legame
// lavagna ↔ manuale. Un elemento della board cita una pagina di manuale;
// l'evidence prodotta segue la grammatica normativa di eventlog.ts
// ("board:<elementId>", "manual:<id>:p<n>", "lesson:<room>@<t>").

import { z } from "zod"
import type { EvidenceRef } from "../../lessonos/eventlog"
import { ManualRefSchema } from "./manual"
import { manualRefToEvidence } from "./manual"

export const BoardCitationSchema = z.strictObject({
  /** Id dell'elemento Excalidraw che àncora la citazione. */
  boardElementId: z.string().min(1),
  ref: ManualRefSchema,
  /** Room della lezione; assente = MAI inventata (vincolo bridge §2.5). */
  room: z.string().min(1).optional(),
  /** Timestamp ms epoch fornito dal chiamante (il contratto non inventa tempi). */
  t: z.number().int().min(0),
})

export type BoardCitation = z.infer<typeof BoardCitationSchema>

/**
 * Evidence della citazione, nell'ordine board → manual → lesson.
 * Il ref lesson è presente solo se la room è nota.
 */
export function boardCitationToEvidence(citation: BoardCitation): EvidenceRef[] {
  const evidence: EvidenceRef[] = [
    `board:${citation.boardElementId}`,
    manualRefToEvidence(citation.ref),
  ]
  if (citation.room !== undefined) {
    evidence.push(`lesson:${citation.room}@${citation.t}`)
  }
  return evidence
}
