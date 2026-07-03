// LessonOS — journalBridge: promozione deterministica JournalEvent → LessonOsEvent.
// Contratto normativo: docs/product/JOURNAL-LESSONOS-BRIDGE-SPEC.md (PR #34).
//
// Il journal della lavagna e l'event-log LessonOS sono DUE log con ruoli diversi:
// il bridge promuove SOLO ciò che ha semantica didattica certa e deterministica.
// Unica promozione: `pdf.page.view` riconosciuto da un ManualRegistry esplicito
// → `material.cited` con evidence doppia (pagina manuale + provenienza journal).
// Tutto il resto (element.*, math.insert, audio.chunk, t0/t1) resta journal-side
// e viene consumato dalla projection come counts (teacherDashboardProjection.ts).
//
// Vincoli (spec §2): zero LLM, funzione pura (nessun clock interno), evidence
// mai vuota (assertEvidence), append-only lato consumer (il dedup al replay è
// del writer, via cursore `afterT`), room mai inventata (solo `opts.room`).

import type { JournalEvent, JournalPdfPageView } from "../store/JournalRecorder"
import { assertEvidence, type Labels, type LessonOsEvent } from "./eventlog"

/** Pagina di manuale registrato risolta da una vista PDF del journal. */
export interface ManualPageRef {
  /** Id manuale in forma EvidenceRef-namespace, es. "manual:vol1". */
  manualId: string
  /** Pagina del manuale (già rimappata da eventuale pageOffset del registry). */
  page: number
  /** Label esplicite; se assenti il bridge ne deriva una deterministica. */
  labels?: Labels
}

/**
 * Registry dei manuali (spec §2.3): configurazione esplicita, non inferenza.
 * `pdf.page.view` non porta l'identità del PDF, quindi la promozione richiede
 * questo lookup iniettato dal chiamante. `undefined` = il documento corrente
 * non è un manuale registrato → NESSUN material.cited, resta solo count.
 */
export interface ManualRegistry {
  resolve(view: JournalPdfPageView & { t: number }): ManualPageRef | undefined
}

export interface JournalBridgeOptions {
  registry: ManualRegistry
  /**
   * Room per associare gli eventi promossi al segmento lezione (spec §2.5).
   * Se assente, nessun ref `lesson:` viene aggiunto: mai inventare room.
   */
  room?: string
  /**
   * Cursore di idempotenza (spec §2.4): promuove solo journal con `t > afterT`.
   * Il writer che appende sull'event-log tiene l'ultimo t processato e passa
   * qui il cursore: il re-run sull'intero journal non ri-appende nulla.
   */
  afterT?: number
}

/**
 * Registry minimale per il caso odierno (un solo manuale attivo dichiarato):
 * ogni pdf.page.view viene attribuita a `manualId`, con `pageOffset` per
 * rimappare la pagina del PDF sulla numerazione del manuale.
 */
export function singleManualRegistry(
  manualId: string,
  opts: { pageOffset?: number; title?: string } = {},
): ManualRegistry {
  const offset = opts.pageOffset ?? 0
  return {
    resolve(view) {
      const page = view.page + offset
      const title = opts.title ?? manualId
      return { manualId, page, labels: { it: `${title} — p.${page}` } }
    },
  }
}

/**
 * Funzione PURA (spec §2.4): stesso input ⇒ stesso output; i timestamp vengono
 * dai journal, mai da un clock interno. Ogni evento prodotto passa da
 * assertEvidence prima di essere restituito: nessun fatto senza provenienza.
 */
export function bridgeJournalToLessonOs(
  journalEvents: readonly JournalEvent[],
  opts: JournalBridgeOptions,
): LessonOsEvent[] {
  const afterT = opts.afterT ?? Number.NEGATIVE_INFINITY
  const promoted: LessonOsEvent[] = []

  for (const ev of journalEvents) {
    if (ev.type !== "pdf.page.view") continue
    if (ev.t <= afterT) continue

    const ref = opts.registry.resolve(ev)
    if (!ref) continue

    const materialId = `${ref.manualId}:p${ref.page}`
    // Evidence doppia (spec §2.1): fatto (pagina manuale) + provenienza journal;
    // più il segmento lezione se la room è nota.
    const evidence = [materialId, `journal:pdf.page.view@${ev.t}`]
    if (opts.room !== undefined) evidence.push(`lesson:${opts.room}@${ev.t}`)
    assertEvidence(evidence, `journalBridge pdf.page.view@${ev.t}`)

    promoted.push({
      kind: "material.cited",
      materialId,
      labels: ref.labels ?? { it: materialId },
      t: ev.t,
      evidence,
    })
  }

  return promoted
}
