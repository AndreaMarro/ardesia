// LessonOS — journalBridgeWriter: consumer append-only del bridge JournalEvent -> LessonOsEvent.
//
// Questo modulo NON decide quale PDF sia un manuale: riceve un ManualRegistry
// esplicito dal chiamante. Il suo unico compito è mantenere idempotente il replay
// del journal: ricava dal LessonOS event-log l'ultimo `journal:pdf.page.view@t`
// già promosso, promuove solo `t > cursore`, e appende via EventLogStore.append.

import type { AppendedEvent, EventLogStore } from "./eventlog"
import {
  bridgeJournalToLessonOs,
  type JournalBridgeOptions,
} from "./journalBridge"
import type { JournalEvent } from "../store/JournalRecorder"

const JOURNAL_PDF_EVIDENCE_RE = /^journal:pdf\.page\.view@(-?\d+(?:\.\d+)?)$/

export function lastPromotedJournalT(events: readonly AppendedEvent[]): number | null {
  let last: number | null = null
  for (const event of events) {
    for (const ref of event.evidence) {
      const match = JOURNAL_PDF_EVIDENCE_RE.exec(ref)
      if (!match) continue
      const t = Number(match[1])
      if (!Number.isFinite(t)) continue
      if (last === null || t > last) last = t
    }
  }
  return last
}

export async function appendJournalBridgeTail(
  store: EventLogStore,
  journalEvents: readonly JournalEvent[],
  opts: Omit<JournalBridgeOptions, "afterT">,
): Promise<AppendedEvent[]> {
  const existing = await store.readAll()
  const afterT = lastPromotedJournalT(existing) ?? Number.NEGATIVE_INFINITY
  const promoted = bridgeJournalToLessonOs(journalEvents, { ...opts, afterT })
  const appended: AppendedEvent[] = []
  for (const event of promoted) {
    appended.push(await store.append(event))
  }
  return appended
}
