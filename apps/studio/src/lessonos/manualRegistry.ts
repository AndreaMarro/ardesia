// LessonOS — manualRegistry: risoluzione manuali keyed STRETTAMENTE su documentId.
// Generalizza il VOL1_DOCUMENT_REGISTRY dei test del bridge: configurazione
// esplicita documentId (content-addressed, PR #42) → manuale. MAI inferenza da
// documentName (spec bridge §2.3: configurazione, non euristica).

import type { ManualRegistry } from "./journalBridge"
// Import di valore verso manualConfig; manualConfig importa solo il TIPO
// ManualRegistryEntry da qui (type-only, eraso a runtime: nessun ciclo reale).
import { ELAB_MANUAL_ENTRIES } from "./manualConfig"

export interface ManualRegistryEntry {
  /** Id manuale in forma EvidenceRef-namespace, es. "manual:vol1". */
  manualId: string
  /** Titolo umano per la label; assente → si usa manualId. */
  title?: string
  /** Offset da sommare alla pagina PDF per ottenere la numerazione del manuale. */
  pageOffset?: number
  /** Range inclusivo [min, max] di pagine PDF valide; assente = tutte. */
  pages?: [number, number]
}

/**
 * Registry statico: risolve SOLO su `view.documentId`.
 * documentId assente/sconosciuto o pagina fuori range → undefined (nessuna
 * promozione; il journal conserva comunque il pdf.page.view).
 */
export function staticManualRegistry(
  entries: Record<string, ManualRegistryEntry>,
): ManualRegistry {
  return {
    resolve(view) {
      if (!view.documentId) return undefined
      const entry = entries[view.documentId]
      if (!entry) return undefined
      if (entry.pages && (view.page < entry.pages[0] || view.page > entry.pages[1])) {
        return undefined
      }
      const page = view.page + (entry.pageOffset ?? 0)
      const title = entry.title ?? entry.manualId
      return { manualId: entry.manualId, page, labels: { it: `${title} — p.${page}` } }
    },
  }
}

/**
 * Registry attivo di default a runtime: config manuali ELAB reale (C1),
 * keyed su hash sha256 dell'intero PDF — vedi provenienza in manualConfig.ts.
 * documentId non in config → undefined → nessun material.cited (fail-closed).
 */
export const defaultManualRegistry: ManualRegistry = staticManualRegistry(ELAB_MANUAL_ENTRIES)
