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
      // t0, t1, math.insert, pdf.page.view — non modificano lo stato elementi
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
