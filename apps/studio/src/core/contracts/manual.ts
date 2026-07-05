// Core contract — ManualSource / ManualRef (ARCHITECTURE-CANON §4).
// ManualSource = identità content-addressed di un manuale registrato
// (documentId sha256, PR #42/#51). ManualRef = puntamento a una pagina,
// con conversione da/verso la grammatica EvidenceRef normativa di
// eventlog.ts ("manual:vol1:p30").

import { z } from "zod"
import type { EvidenceRef } from "../../lessonos/eventlog"

const MANUAL_ID_RE = /^manual:[a-z0-9][a-z0-9-]*$/
const SHA256_RE = /^[0-9a-f]{64}$/

export const ManualSourceSchema = z
  .strictObject({
    /** Id in forma EvidenceRef-namespace, es. "manual:vol2". */
    manualId: z.string().regex(MANUAL_ID_RE),
    /** Identità content-addressed del PDF (sha256 esadecimale, minuscolo). */
    documentId: z.string().regex(SHA256_RE),
    title: z.string().min(1),
    /** Offset da sommare alla pagina PDF per la numerazione del manuale. */
    pageOffset: z.number().int().optional(),
    /** Range inclusivo [min, max] di pagine PDF valide. */
    pages: z.tuple([z.number().int().min(1), z.number().int().min(1)]).optional(),
  })
  .refine((s) => s.pages === undefined || s.pages[0] <= s.pages[1], {
    message: "pages: min deve essere <= max",
  })

export type ManualSource = z.infer<typeof ManualSourceSchema>

export const ManualRefSchema = z.strictObject({
  manualId: z.string().regex(MANUAL_ID_RE),
  /** Pagina del manuale, 1-based (già rimappata da eventuale pageOffset). */
  page: z.number().int().min(1),
})

export type ManualRef = z.infer<typeof ManualRefSchema>

/** ManualRef → EvidenceRef nella grammatica normativa "manual:<id>:p<page>". */
export function manualRefToEvidence(ref: ManualRef): EvidenceRef {
  return `${ref.manualId}:p${ref.page}`
}

const MANUAL_EVIDENCE_RE = /^(manual:[a-z0-9][a-z0-9-]*):p([1-9]\d*)$/

/** Parse fail-closed dell'evidence manual; undefined su tutto il resto. */
export function parseManualEvidence(evidence: string): ManualRef | undefined {
  const match = MANUAL_EVIDENCE_RE.exec(evidence)
  if (!match) return undefined
  return { manualId: match[1], page: Number(match[2]) }
}
