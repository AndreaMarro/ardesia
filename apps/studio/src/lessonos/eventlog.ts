// LessonOS — event log append-only (micro-slice, da LESSONOS-MEMORY-ARCHITECTURE-RESEARCH).
// L'event log è l'UNICA fonte di verità della memoria didattica: il grafo è una
// vista materializzata (materializer.ts), sempre riderivabile da zero. AgentMemory
// resta una cache di recall, mai sorgente. Nessun graph-DB esterno.
//
// Vincoli di questa slice: zero LLM, zero MCP, zero dipendenze nuove. Lo schema
// SQLite sotto è il contratto di persistenza; il binding runtime (WASM lato client
// o nativo) è una decisione separata — qui c'è un'implementazione in-memory di
// riferimento con la stessa disciplina, usata dai test e dal materializer.

/**
 * Riferimento di evidenza: ogni nodo/arco del grafo DEVE citare da dove viene
 * (canone `provenance`). Formato `namespace:payload`, es.:
 *   "board:<elementId>" | "manual:vol1:p30" | "lesson:<room>@<t>" | "plugin:<id>@<version>"
 */
export type EvidenceRef = string

const EVIDENCE_RE = /^[a-z][a-z0-9-]*:.+$/

export function isValidEvidenceRef(ref: unknown): ref is EvidenceRef {
  return typeof ref === "string" && EVIDENCE_RE.test(ref)
}

/** Lancia se la lista evidenze è vuota o contiene ref malformati: nessun fatto senza provenienza. */
export function assertEvidence(refs: unknown, context: string): asserts refs is EvidenceRef[] {
  if (!Array.isArray(refs) || refs.length === 0) {
    throw new Error(`LessonOS event log: evidence obbligatoria mancante (${context})`)
  }
  for (const ref of refs) {
    if (!isValidEvidenceRef(ref)) {
      throw new Error(`LessonOS event log: evidence ref malformata "${String(ref)}" (${context}); atteso "namespace:payload"`)
    }
  }
}

/** Label multilingua: concept_id neutro + label per lingua (requisito strutturale, non traduzione finale). */
export type Labels = Record<string, string>

interface BaseEvent {
  /** Timestamp evento (ms epoch), fornito dal chiamante: il log non inventa tempi. */
  t: number
  evidence: EvidenceRef[]
  /** PluginInstance che ha causato il fatto, quando il producer e' un post-it. */
  instanceId?: string
  /** Id dell'azione/comando che ha causato l'evento: utile per replay e audit. */
  causationId?: string
  /** Provenienza leggibile della superficie che ha prodotto l'evento. */
  provenance?: {
    surface: "postit" | "notebook" | "whiteboard" | "overlay"
    pluginId?: string
    source?: string
  }
}

export type LessonOsEvent =
  | (BaseEvent & { kind: "lesson.started"; room: string })
  | (BaseEvent & { kind: "lesson.ended"; room: string })
  | (BaseEvent & { kind: "concept.introduced"; conceptId: string; labels: Labels })
  | (BaseEvent & { kind: "material.cited"; materialId: string; conceptId?: string; labels: Labels })
  | (BaseEvent & {
      kind: "error.observed"
      errorId: string
      conceptId: string
      /** Studente a cui l'errore è attribuito; assente = non attribuito (lezione di classe). */
      studentId?: string
      labels: Labels
    })
  | (BaseEvent & {
      kind: "exercise.completed"
      exerciseId: string
      conceptId?: string
      /** Se presente: questo esercizio corregge l'errore osservato (arco `corregge`). */
      correctsErrorId?: string
      /** Studente che ha completato; assente = non attribuito. */
      studentId?: string
      labels: Labels
    })
  | (BaseEvent & {
      kind: "simulation.step.completed"
      stepId: string
      sceneId?: string
      experimentId?: string
      conceptId?: string
      labels: Labels
    })
  | (BaseEvent & {
      /** Il solve reale ha prodotto un risultato per l'esperimento (telemetria break→explain). */
      kind: "simulation.circuit.solved"
      experimentId: string
      sceneId?: string
      conceptId?: string
      /** Corrente misurata dal solve in mA (es. 15.3): payload per provenance/product-factory. */
      currentMa?: number
      /** Il circuito risolto è conforme al book-layout del volume (parità). */
      bookLayoutValid?: boolean
      labels: Labels
    })
  | (BaseEvent & {
      /** Errore elettrico osservato dal solver (filo scollegato, LED invertito, R mancante/pericolosa). */
      kind: "simulation.error.observed"
      errorId: string
      conceptId: string
      sceneId?: string
      experimentId?: string
      studentId?: string
      labels: Labels
    })
  | (BaseEvent & {
      kind: "plugin.mounted"
      pluginId: string
      pluginKind: string
      instanceId: string
      room?: string
      labels: Labels
    })
  | (BaseEvent & {
      kind: "arduino.compile.completed"
      pluginId: string
      boardId: string
      fqbn: string
      provider: "browser-avr" | "local-agent" | "remote"
      ok: boolean
      artifactFormat?: "intel-hex" | "elf" | "bin"
      artifactBytes?: number
      diagnostic: string
      labels: Labels
    })
  | (BaseEvent & {
      kind: "elabtutor.command.issued"
      pluginId: string
      command: "simulation.command"
      targetInstanceId: string
      toolchainInstanceId?: string
      grounded: boolean
      diagnostic: string
      labels: Labels
    })
  | (BaseEvent & {
      /** Tentativo quiz per-studente: fatto registrato; ogni vista (media, debito) è derivata. */
      kind: "quiz.attempted"
      quizId: string
      conceptId?: string
      studentId?: string
      correct: number
      total: number
      labels: Labels
    })
  | (BaseEvent & {
      /**
       * Uno student-pack è stato generato da un candidato Z7 (errore osservato mai
       * corretto). Fatto append-only: il projector lifta lo status del candidato
       * da "candidate" a "generated". packId = candidateId (`sp-<errorId>`).
       */
      kind: "studentpack.generated"
      packId: string
      errorId: string
      /** Room della lezione da cui nasce il pack; assente = candidato orfano. */
      fromRoom?: string
    })
  | (BaseEvent & {
      /** Uno student-pack generato è stato esportato: lift "generated" → "exported". */
      kind: "studentpack.exported"
      packId: string
    })

/** Evento accettato dal log: immutabile, con numero di sequenza monotono. */
export type AppendedEvent = LessonOsEvent & { readonly seq: number }

/**
 * Schema SQLite del log (contratto di persistenza).
 * Disciplina append-only: SOLO INSERT; niente UPDATE/DELETE; la compaction
 * (futura, non decisa) avviene per copia su nuova tabella + swap, mai in-place.
 */
export const EVENT_LOG_DDL = `
CREATE TABLE IF NOT EXISTS lessonos_events (
  seq      INTEGER PRIMARY KEY AUTOINCREMENT,
  t        INTEGER NOT NULL,
  kind     TEXT    NOT NULL,
  payload  TEXT    NOT NULL, -- JSON dell'evento completo (fonte per il materializer)
  evidence TEXT    NOT NULL  -- JSON array di EvidenceRef, mai vuoto (validato in append)
);
CREATE INDEX IF NOT EXISTS idx_lessonos_events_kind ON lessonos_events (kind);
CREATE INDEX IF NOT EXISTS idx_lessonos_events_t    ON lessonos_events (t);
`

/** Porta del log: qualunque backend (SQLite, in-memory) deve rispettarla. */
export interface EventLogStore {
  /** Valida l'evidenza, assegna `seq` e accoda. Rifiuta eventi senza provenienza. */
  append(event: LessonOsEvent): Promise<AppendedEvent>
  /** Tutti gli eventi in ordine di `seq` (l'ordine del log è l'ordine della verità). */
  readAll(): Promise<AppendedEvent[]>
}

/** Implementazione di riferimento in-memory: stessa disciplina dello schema SQLite. */
export class InMemoryEventLog implements EventLogStore {
  private events: AppendedEvent[] = []
  private nextSeq = 1

  async append(event: LessonOsEvent): Promise<AppendedEvent> {
    assertEvidence(event.evidence, event.kind)
    if (!Number.isFinite(event.t)) {
      throw new Error(`LessonOS event log: timestamp non valido per ${event.kind}`)
    }
    const appended: AppendedEvent = Object.freeze({ ...structuredClone(event), seq: this.nextSeq++ })
    this.events.push(appended)
    return appended
  }

  async readAll(): Promise<AppendedEvent[]> {
    return [...this.events]
  }
}
