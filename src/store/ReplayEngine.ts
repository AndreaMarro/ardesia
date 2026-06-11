// MAESTRO-Studio — ReplayEngine
// Ricostruzione deterministica della scena da events.jsonl.
// Applica eventi in ordine temporale: element.add/update popolano una Map<id, state>,
// element.delete rimuove. Gli eventi t0/t1/math.insert/pdf.page.view non alterano
// lo stato elementi (sono metadati per allineamento temporale).

import type { JournalEvent } from "./JournalRecorder"

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
   * getActiveElements: elementi creati o modificati nella finestra [t0, t1].
   *
   * Per ogni elemento, traccia firstSeen (creazione) e lastModified (ultimo update).
   * Un elemento è "attivo" nella finestra se firstSeen o lastModified cade in [t0, t1].
   * Lo stato restituito è quello dell'elemento AL TEMPO t1 (fine finestra).
   *
   * Elementi cancellati DENTRO [t0, t1] → esclusi (non esistono a t1).
   * Elementi cancellati DOPO t1 ma attivi nella finestra → inclusi (erano attivi).
   */
  getActiveElements(events: JournalEvent[], t0: number, t1: number): Record<string, unknown>[] {
    // Passata 1: applica tutti gli eventi fino a t1 per avere lo stato a fine finestra
    const scene = new Map<string, Record<string, unknown>>()
    // Traccia se un elemento era attivo nella finestra
    const active = new Set<string>()

    for (const ev of events) {
      if (ev.t > t1) break
      switch (ev.type) {
        case "element.add":
        case "element.update": {
          const id = ev.element.id as string
          scene.set(id, { ...ev.element })
          if (ev.t >= t0 && ev.t <= t1) {
            active.add(id)
          }
          break
        }
        case "element.delete":
          scene.delete(ev.elementId)
          break
      }
    }

    // Filtra solo gli elementi attivi nella finestra
    return Array.from(scene.values())
      .filter((el) => active.has(el.id as string))
      .sort((a, b) => String(a.id).localeCompare(String(b.id)))
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

/**
 * Deserializza una stringa JSONL in array di eventi.
 * Salta righe vuote o non-JSON.
 */
export function deserializeEvents(text: string): JournalEvent[] {
  const events: JournalEvent[] = []
  for (const line of text.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      events.push(JSON.parse(trimmed) as JournalEvent)
    } catch {
      // riga malformata — skip
    }
  }
  return events
}
