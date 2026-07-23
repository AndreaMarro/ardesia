// MAESTRO-Studio — ReplayEngine
// Ricostruzione deterministica della scena da events.jsonl.
// Applica eventi in ordine temporale: element.add/update popolano una Map<id, state>,
// element.delete rimuove. Gli eventi t0/t1/math.insert/pdf.page.view non alterano
// lo stato elementi (sono metadati per allineamento temporale).

import {
  adaptLegacyJournalEvent,
  assertJournalEnvelopeV2,
  freezeJournalEnvelopeV2,
  journalSourceLessonId,
  looksLikeJournalEnvelopeV2,
  looksLikeRawJournalEnvelopeV2,
  parseLegacyJournalEvent,
  toLegacyJournalEvent,
  type JournalEnvelopeV2,
  type JournalEvent,
} from "./JournalRecorder"
import { PATHS } from "./types"

/**
 * ReplayEngine: applica eventi journal in ordine e produce lo stato finale
 * della scena come array di elementi Excalidraw.
 *
 * Deterministico: stesso journal → stesso array (ordinato per id).
 * Testabile senza Excalidraw — pura struttura dati.
 */
export class ReplayEngine {
  private elements: Map<string, Record<string, unknown>> = new Map()

  /** Applica un singolo evento journal e aggiorna lo stato interno */
  apply(event: JournalEvent): void {
    switch (event.type) {
      case "element.add":
      case "element.update":
        this.elements.set(event.element.id as string, { ...event.element })
        break
      case "element.delete":
        this.elements.delete(event.elementId)
        break
      // t0, t1, math.insert, pdf.page.view, audio.chunk — non modificano lo stato elementi
    }
  }

  /**
   * Replay completo: pulisce lo stato e applica tutti gli eventi in ordine.
   * Restituisce l'array degli elementi finali (ordinato per id).
   */
  replay(events: JournalEvent[]): Record<string, unknown>[] {
    this.elements.clear()
    for (const ev of events) {
      this.apply(ev)
    }
    return this.getElements()
  }

  /** Restituisce lo stato corrente come array ordinato per id */
  getElements(): Record<string, unknown>[] {
    return Array.from(this.elements.values()).sort((a, b) =>
      String(a.id).localeCompare(String(b.id)),
    )
  }

  /**
   * getSceneAt: stato della scena al tempo t.
   * Riavvolge il journal fino a t (incluso) e restituisce gli elementi come array.
   * NON muta lo stato interno di ReplayEngine — chiamate multiple sono safe.
   * O(n) su numero di eventi; n < 200k per sessioni tipiche.
   */
  getSceneAt(events: JournalEvent[], t: number): Record<string, unknown>[] {
    const scene = new Map<string, Record<string, unknown>>()
    for (const ev of events) {
      if (ev.t > t) break
      switch (ev.type) {
        case "element.add":
        case "element.update":
          scene.set(ev.element.id as string, { ...ev.element })
          break
        case "element.delete":
          scene.delete(ev.elementId)
          break
      }
    }
    return Array.from(scene.values()).sort((a, b) =>
      String(a.id).localeCompare(String(b.id)),
    )
  }

  /**
   * getActiveElements: elementi visibili nella finestra [t0, t1].
   *
   * Contratto: un elemento è "attivo" se esisteva in scena in QUALUNQUE
   * istante di [t0, t1]:
   *   a) esisteva già a t0 (anche se cancellato dentro la finestra), OPPURE
   *   b) è stato aggiunto/modificato/cancellato in (t0, t1].
   *
   * Lo stato restituito è quello a t1 per gli elementi ancora vivi;
   * per gli elementi cancellati dentro la finestra viene restituito
   * l'ultimo stato noto prima della cancellazione.
   *
   * NOTA: questo contratto NON è degenere rispetto a getSceneAt(t1)
   * perché elementi cancellati DENTRO [t0, t1] sono inclusi
   * (erano visibili prima della cancellazione) mentre getSceneAt(t1)
   * li esclude.
   */
  getActiveElements(events: JournalEvent[], t0: number, t1: number): Record<string, unknown>[] {
    const sceneAtT1 = new Map<string, Record<string, unknown>>()
    const sceneAtT0 = new Map<string, Record<string, unknown>>()
    const wasActive = new Set<string>()
    const deletedInWindow = new Map<string, Record<string, unknown>>()

    for (const ev of events) {
      if (ev.t > t1) break

      // Build snapshot of what existed at t0
      if (ev.t <= t0) {
        switch (ev.type) {
          case "element.add":
          case "element.update":
            sceneAtT0.set(ev.element.id as string, { ...ev.element })
            break
          case "element.delete":
            sceneAtT0.delete(ev.elementId as string)
            break
        }
      }

      switch (ev.type) {
        case "element.add":
        case "element.update": {
          const id = ev.element.id as string
          // If previously in deletedInWindow, element was re-added
          deletedInWindow.delete(id)
          sceneAtT1.set(id, { ...ev.element })
          if (ev.t >= t0 && ev.t <= t1) {
            wasActive.add(id)
          }
          break
        }
        case "element.delete": {
          const id = ev.elementId as string
          if (ev.t >= t0 && ev.t <= t1) {
            wasActive.add(id)
            const lastState = sceneAtT1.get(id)
            if (lastState) {
              deletedInWindow.set(id, lastState)
            }
          }
          sceneAtT1.delete(id as string)
          break
        }
      }
    }

    // Elements that existed at t0 were visible at the start of the window
    for (const id of sceneAtT0.keys()) {
      wasActive.add(id)
    }

    // Build result: elements alive at t1 (with state at t1)
    // plus elements deleted in window (with last known state)
    const result: Record<string, unknown>[] = []
    for (const el of sceneAtT1.values()) {
      if (wasActive.has(el.id as string)) {
        result.push(el)
      }
    }
    for (const [id, lastState] of deletedInWindow) {
      if (!sceneAtT1.has(id)) {
        // Only add if not already present (could have been re-added)
        result.push(lastState)
      }
    }

    return result.sort((a, b) => String(a.id).localeCompare(String(b.id)))
  }

  /** Resetta lo stato */
  reset(): void {
    this.elements.clear()
  }
}

/**
 * Serializza un array di eventi JournalEvent in formato JSONL (una riga per evento).
 * Utile per test e debug.
 */
export function serializeEvents(events: JournalEvent[]): string {
  return events.map((e) => JSON.stringify(e)).join("\n") + "\n"
}

export type JournalDecodeIssue = Readonly<{
  source: string
  line: number
  reason: string
}>

export type JournalDecodeResult = Readonly<{
  envelopes: readonly JournalEnvelopeV2[]
  legacy: readonly JournalEvent[]
  issues: readonly JournalDecodeIssue[]
}>

/**
 * Decodifica un journal fisico senza riordinare le righe. V2 malformato è
 * fail-closed; legacy malformato è saltato ma riportato esplicitamente.
 */
export function decodeJournalJsonl(text: string, source: string): JournalDecodeResult {
  const sourceLessonId = journalSourceLessonId(source)
  const envelopes: JournalEnvelopeV2[] = []
  const legacy: JournalEvent[] = []
  const issues: JournalDecodeIssue[] = []
  const eventIds = new Set<string>()
  const idempotencyKeys = new Set<string>()
  const addEnvelope = (envelope: JournalEnvelopeV2): void => {
    if (eventIds.has(envelope.eventId)) {
      throw new Error(`duplicate eventId ${envelope.eventId}`)
    }
    if (
      envelope.idempotencyKey !== null &&
      idempotencyKeys.has(envelope.idempotencyKey)
    ) {
      throw new Error(`duplicate idempotency key ${envelope.idempotencyKey}`)
    }
    eventIds.add(envelope.eventId)
    if (envelope.idempotencyKey !== null) idempotencyKeys.add(envelope.idempotencyKey)
    envelopes.push(envelope)
  }

  for (const [index, rawLine] of text.split("\n").entries()) {
    const line = index + 1
    const trimmed = rawLine.trim()
    if (!trimmed) continue
    let parsed: unknown
    try {
      parsed = JSON.parse(trimmed)
    } catch {
      if (looksLikeRawJournalEnvelopeV2(rawLine)) {
        throw new Error(`${source}: line ${line}: invalid JSON in V2 envelope`)
      }
      issues.push({ source, line, reason: "invalid JSON legacy row" })
      continue
    }

    if (looksLikeJournalEnvelopeV2(parsed)) {
      try {
        assertJournalEnvelopeV2(parsed)
        const envelope = freezeJournalEnvelopeV2(parsed)
        if (source === PATHS.JOURNAL) {
          throw new Error("physical V2 envelopes are forbidden in the flat legacy journal")
        }
        if (envelope.lessonId !== sourceLessonId) {
          throw new Error(`lesson/source mismatch (${envelope.lessonId})`)
        }
        addEnvelope(envelope)
        const projection = toLegacyJournalEvent(envelope)
        if (projection) legacy.push(projection)
      } catch (error) {
        throw new Error(`${source}: line ${line}: ${(error as Error).message}`, { cause: error })
      }
      continue
    }

    const event = parseLegacyJournalEvent(parsed)
    if (!event) {
      issues.push({ source, line, reason: "invalid legacy journal row" })
      continue
    }
    legacy.push(event)
    let envelope: JournalEnvelopeV2 | null
    try {
      envelope = adaptLegacyJournalEvent(event, source, line, rawLine)
    } catch (error) {
      issues.push({ source, line, reason: (error as Error).message })
      continue
    }
    if (envelope) {
      try {
        addEnvelope(envelope)
      } catch (error) {
        throw new Error(`${source}: line ${line}: ${(error as Error).message}`, { cause: error })
      }
    }
  }

  return {
    envelopes: Object.freeze(envelopes),
    legacy: Object.freeze(legacy),
    issues: Object.freeze(issues),
  }
}

/**
 * Deserializza una stringa JSONL in array di eventi.
 * Salta righe vuote o non-JSON.
 */
export function deserializeEvents(text: string, source: string = PATHS.JOURNAL): JournalEvent[] {
  return [...decodeJournalJsonl(text, source).legacy]
}
