// ARDESIA Studio — BETA-003-CONTINUITY-FAIL-CLOSED-STORAGE.
//
// Loader fail-closed dello ScopedContinuitySnapshotV1 (ARD-06 §5). Valida lo
// scope PRIMA di aprire IndexedDB, WorkspaceStore, journal, scena o qualunque
// adapter di persistenza. Non memoizza: ogni chiamata riceve factory che
// costruiscono adapter freschi (nessuna cache process-local). Non tocca
// localStorage e non degrada silenziosamente il backend: la persistenza reale
// e' un campo tipato sia del reader eventi sia del reader workspace, mai una
// etichetta ottimistica. Ogni reader deve implementare dispose(): il loader lo
// invoca in un finally cosi' nessuna handle IndexedDB o FSA resta viva fra i
// cold reopen.
//
// Questo modulo NON dichiara che la route Room sia raggiungibile: la BETA-002
// resta il record causale immutabile di quel requisito bloccato.

import {
  assertEventEnvelopeV2,
  assertFounderBetaAuthority,
  type EventEnvelopeV2,
  type JsonObject,
} from "../core/contracts/eventEnvelope"
import {
  assertLessonOsEnvelopePayload,
  type AppendedEventEnvelopeV2,
} from "./eventlog"
import {
  openIndexedDbEventLog,
  type IndexedDbEventLogOptions,
} from "./indexedDbEventLog"
import {
  ContinuityScopeError,
  validateContinuityScopeV1,
  type ContinuityEvidenceV1,
  type ContinuityScopeErrorCode,
  type ContinuityScopeV1,
  type ContinuitySourceIssueV1,
  type ScopedContinuitySnapshotV1,
} from "./continuityProjection"
import { decodeJournalJsonl } from "../store/ReplayEngine"
import type { JournalEnvelopeV2 } from "../store/JournalRecorder"
import { roomPaths } from "../store/roomPaths"
import {
  parseSessionYamlV2,
  sessionPaths,
  SessionYamlParseError,
  type SessionYamlV2,
} from "../store/sessionState"
import type { WorkspaceStore } from "../store/WorkspaceStore"
import { isConstructedWorkspaceStore } from "../store/WorkspaceStore"

// --- Porte read-only (design §5.2) ---
//
// Sono strette per costruzione: nessuna espone `readAll`, `append`, `list` o
// `delete`. La produzione crea questi reader come proiezione sopra
// IndexedDbEventLog e WorkspaceStore rispettivamente; i test iniettano
// implementazioni deterministiche per esercitare la matrice dei guasti.

export type ContinuityPersistenceStatusV1 =
  | Readonly<{ kind: "verified-indexeddb"; database: string }>
  | Readonly<{ kind: "unavailable"; code: string }>
  | Readonly<{ kind: "data-loss"; code: string; database: string }>
  | Readonly<{ kind: "corrupt"; code: string }>

export type ContinuityWorkspacePersistenceV1 =
  | Readonly<{ kind: "fsa" }>
  | Readonly<{ kind: "local-storage" }>
  | Readonly<{ kind: "bundle" }>
  | Readonly<{ kind: "unavailable"; code: string }>

export interface ContinuityEventReaderV1 {
  readonly persistence: ContinuityPersistenceStatusV1
  readEnvelopesBySession(
    lessonId: string,
    sessionId: string,
  ): Promise<readonly AppendedEventEnvelopeV2[]>
  /** Rilascia connessioni fisiche (IndexedDB/FSA). Il loader lo invoca sempre. */
  dispose(): Promise<void>
}

export interface ContinuityWorkspaceReaderV1 {
  readonly persistence: ContinuityWorkspacePersistenceV1
  read(path: string): Promise<Blob | null>
  /** Rilascia handle FSA/lock ottenuti dal reader; loader la invoca sempre. */
  dispose(): Promise<void>
}

export interface ContinuityRuntimeAdapterFactories {
  /**
   * Riceve lo scope GIA' validato (clausola 2: catturato e validato prima di
   * costruire qualunque persistence). Serve perche' l'integrita' del log sia
   * attribuita allo scope richiesto invece che calcolata globalmente
   * (clausola 6). Il parametro e' opzionale: una factory a zero argomenti
   * resta assegnabile, quindi il cablaggio e' additivo.
   */
  createEventReader(scope?: ContinuityScopeV1): Promise<ContinuityEventReaderV1>
  createWorkspaceReader(): Promise<ContinuityWorkspaceReaderV1>
  buildCommitSha: string | null
}

const FULL_COMMIT_SHA_RE = /^[0-9a-fA-F]{40}$/
const JOURNAL_V1_ADAPTER_PRODUCER_ID = "com.github.andreamarro.ardesia.studio.journal-v1-adapter"
const REDUNDANT_ROOM_KINDS = new Set(["lesson.started", "lesson.ended", "plugin.mounted"])
const NO_OP_DISPOSE = async (): Promise<void> => {}

/**
 * Congela ricorsivamente ogni oggetto raggiungibile, attori/producer/payload
 * ed evidence inclusi. Il caller che tratteneva il riferimento originale non
 * puo' piu' mutare i byte del snapshot dopo la validazione (accept #3).
 */
function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value !== "object" || value === null) return value
  const pending: object[] = [value as object]
  const seen = new WeakSet<object>()
  while (pending.length > 0) {
    const current = pending.pop()!
    if (seen.has(current)) continue
    seen.add(current)
    for (const key of Reflect.ownKeys(current)) {
      const descriptor = Object.getOwnPropertyDescriptor(current, key)
      if (
        descriptor &&
        "value" in descriptor &&
        typeof descriptor.value === "object" &&
        descriptor.value !== null
      ) {
        pending.push(descriptor.value)
      }
    }
    Object.freeze(current)
  }
  return value
}

/** Snapshot indipendente (structuredClone) + deep-freeze in unica operazione. */
function cloneFrozen<T>(value: T): T {
  return deepFreeze(structuredClone(value)) as T
}

/**
 * Factory di produzione del reader IndexedDB: apre un adapter fresco per la
 * chiamata corrente (nessuna cache process-local). Non silenzia il backend:
 * verified/unavailable/data-loss/corrupt restano stati distinti (accept #2).
 * Il dispose e' invocato dal loader in un finally cosi' la handle non resta
 * viva anche se readEnvelopesBySession viene saltato per corruzione o
 * data-loss (accept #5).
 */
export async function openIndexedDbContinuityEventReader(
  options: IndexedDbEventLogOptions = {},
  scope?: ContinuityScopeV1,
): Promise<ContinuityEventReaderV1> {
  const handle = await openIndexedDbEventLog(
    scope === undefined
      ? options
      : { ...options, scope: { lessonId: scope.lessonId, sessionId: scope.sessionId } },
  )
  const backend = handle.backend
  const dispose = async (): Promise<void> => {
    try { await handle.close() } catch { /* best effort */ }
  }
  if (handle.log === null) {
    return Object.freeze({
      persistence: backend,
      async readEnvelopesBySession() {
        return Object.freeze([]) as readonly AppendedEventEnvelopeV2[]
      },
      dispose,
    })
  }
  const log = handle.log
  return Object.freeze({
    persistence: backend,
    async readEnvelopesBySession(lessonId: string, sessionId: string) {
      const rows = await log.readEnvelopesBySession(lessonId, sessionId)
      return Object.freeze([...rows])
    },
    dispose,
  })
}

/**
 * Adapter di produzione sopra `WorkspaceStore`: la persistence deriva dallo
 * `store.mode` reale (fsa/localStorage/unavailable). Nessun label
 * auto-dichiarato: l'oracolo e' lo store, non il chiamante. Il read passa
 * per `store.read(path)` che a sua volta consulta il driver attivo.
 * Dispose e' un no-op: l'ownership del ciclo di vita dello store resta al
 * chiamante — il loader non deve chiudere handle FSA condivise con altre
 * superfici (Room/Lezione), ma continua a rilasciare la propria copia con
 * `dispose()` (invocata dal finally del loader) per idempotenza.
 */
export function createWorkspaceStoreContinuityWorkspaceReader(
  store: Pick<WorkspaceStore, "mode" | "read">,
): ContinuityWorkspaceReaderV1 {
  const persistence = derivePersistenceFromWorkspaceMode(
    store.mode,
    isConstructedWorkspaceStore(store),
  )
  return Object.freeze({
    persistence,
    async read(path: string) {
      return store.read(path)
    },
    dispose: NO_OP_DISPOSE,
  })
}

function derivePersistenceFromWorkspaceMode(
  mode: WorkspaceStore["mode"],
  connectedStore: boolean,
): ContinuityWorkspacePersistenceV1 {
  switch (mode) {
    case "fsa":
      // `Pick<WorkspaceStore, "mode" | "read">` e' un tipo STRUTTURALE: qualunque
      // oggetto letterale con quei due membri lo soddisfa. `fsa` e' l'unica
      // persistence autoritativa, quindi e' l'unica che non puo' essere
      // autodichiarata: richiede la PROVA DELLA COSTRUZIONE di un WorkspaceStore,
      // non la sola parentela di prototipo - `Object.create(WorkspaceStore.prototype)`
      // supera `instanceof` senza aver mai eseguito il costruttore. Fail-closed:
      // chi non lo e' non degrada ad autorevole, degrada a non disponibile.
      return connectedStore
        ? Object.freeze({ kind: "fsa" as const })
        : Object.freeze({
            kind: "unavailable" as const,
            code: "workspace-uninitialised",
          })
    case "localStorage":
      return Object.freeze({ kind: "local-storage" as const })
    case "unavailable":
      return Object.freeze({
        kind: "unavailable" as const,
        code: "workspace-uninitialised",
      })
  }
}

/**
 * Adapter di produzione per un bundle importato: i byte sono immutabili e la
 * provenienza e' il bundle stesso. Persistence.kind = "bundle" (autoritativa
 * per la sessione importata). `read(path)` fa lookup diretto nel Map di byte
 * gia' parsati e restituisce `null` per path assenti.
 */
export function createImportedBundleContinuityWorkspaceReader(
  files: ReadonlyMap<string, Blob>,
): ContinuityWorkspaceReaderV1 {
  // `ReadonlyMap` e' un vincolo di solo tipo: a runtime il chiamante conserva un
  // Map mutabile. Senza copia, ogni read() consultava la collezione viva del
  // chiamante, che poteva sostituire, aggiungere o rimuovere entry DOPO la
  // costruzione - cioe' riscrivere a piacere il contenuto di un bundle che si
  // dichiara autoritativo per la sessione importata. Le entry vengono acquisite
  // qui, una volta sola.
  const owned = new Map<string, Blob>(files)
  return Object.freeze({
    persistence: Object.freeze({ kind: "bundle" as const }),
    async read(path: string) {
      return owned.get(path) ?? null
    },
    dispose: NO_OP_DISPOSE,
  })
}

export type LoadScopedContinuityResultV1 =
  | Readonly<{ kind: "scope-invalid"; code: ContinuityScopeErrorCode }>
  | Readonly<{ kind: "loaded"; snapshot: ScopedContinuitySnapshotV1 }>

// --- Utility private ---

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const crypto = (globalThis as { crypto?: Crypto }).crypto
  if (!crypto?.subtle) throw new Error("Continuity loader: Web Crypto non disponibile")
  // Il digest fallisce in un solo ambiente - il gate CI preview-studio-check su
  // Linux - e non si riproduce qui: non con Node 25, non con Node 22 pinnato al
  // workflow, non col pool forks forzato, non con dipendenze allineate al
  // lockfile. Tre correzioni basate su ipotesi di realm hanno fallito.
  //
  // Invece di indovinare una quarta volta, il fallimento viene reso
  // auto-descrittivo: si valida l'ingresso PRIMA di chiamare la WebCrypto, e in
  // caso di rifiuto si riporta cosa e' arrivato davvero. Un TypeError WebIDL
  // opaco non dice se il problema e' il realm, il tipo o un valore assente.
  // Questo e' comunque codice migliore: un errore che nomina la causa.
  // `constructor.name` NON distingue i realm: due realm chiamano entrambi la
  // propria classe "ArrayBuffer". La prima versione di questa diagnostica era
  // cieca proprio alla cosa che doveva misurare. Serve identita', non nome.
  const describe = (value: unknown): string => {
    if (value === null || value === undefined) return String(value)
    const ctor = (value as { constructor?: unknown }).constructor
    const name = (ctor as { name?: string } | undefined)?.name ?? "anonymous"
    const owner =
      ctor === ArrayBuffer
        ? "OUR-ArrayBuffer"
        : ctor === Uint8Array
          ? "OUR-Uint8Array"
          : "FOREIGN-ctor"
    const brand = value instanceof ArrayBuffer ? "instanceof-ours" : "NOT-instanceof-ours"
    return `${typeof value}/${name}/${owner}/${brand}`
  }
  if (!ArrayBuffer.isView(bytes)) {
    throw new TypeError(
      `Continuity loader: sha256Hex richiede una vista tipizzata, ricevuto ${describe(bytes)}`,
    )
  }
  // Forma adottata da loadFile.ts:36, che passa questo stesso gate su main:
  //   crypto.subtle.digest(\"SHA-256\", buf.slice(0))
  // `ArrayBuffer.prototype.slice` copia usando lo species del buffer di ORIGINE,
  // quindi il risultato appartiene sempre al realm da cui i byte provengono.
  // Allocare con un costruttore scelto da noi e lunica forma che questo repo
  // non usa da nessuna parte, ed e lunica che la CI rifiuta.
  const owned = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer
  let digest: Uint8Array
  try {
    digest = new Uint8Array(await crypto.subtle.digest("SHA-256", owned))
  } catch (error) {
    throw new TypeError(
      "Continuity loader: WebCrypto ha rifiutato il buffer del digest. " +
        `input=${describe(bytes)} ` +
        `buffer=${describe(owned)} ` +
        `sourceBuffer=${describe(bytes.buffer)} ` +
        `sliced=${describe(owned)} ` +
        `crypto=${describe(crypto)} ` +
        `subtle=${describe(crypto.subtle)} ` +
        `cause=${error instanceof Error ? error.message : String(error)}`,
    )
  }
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

function issue(
  source: ContinuitySourceIssueV1["source"],
  severity: ContinuitySourceIssueV1["severity"],
  code: ContinuitySourceIssueV1["code"],
  preserved: ContinuitySourceIssueV1["preserved"] = null,
): ContinuitySourceIssueV1 {
  return Object.freeze({ source, severity, code, preserved })
}

/**
 * Preservation metadata deve essere costruita dai byte gia' catturati dal
 * primo read: una seconda `blob.arrayBuffer()` puo' rigettare dopo un parse
 * o scope error, e quella rejection farebbe cascare il loader. I byte sono
 * autoritativi al primo read; la preservation e' un canonicalizer, non un
 * secondo I/O.
 */
async function preservedFromBytes(
  path: string,
  bytes: Uint8Array,
): Promise<ContinuitySourceIssueV1["preserved"]> {
  return Object.freeze({
    path,
    sha256: await sha256Hex(bytes),
    bytes: bytes.byteLength,
  })
}

function persistenceIssueForEvents(
  persistence: ContinuityPersistenceStatusV1,
): ContinuitySourceIssueV1 | null {
  switch (persistence.kind) {
    case "verified-indexeddb":
      return null
    case "unavailable":
      return issue("lesson-event-log", "degraded", "unavailable")
    case "data-loss":
      return issue("lesson-event-log", "degraded", "data-loss")
    case "corrupt":
      // Sequenze non-contigue e tail droppati sono corruzione dell'oracolo
      // di persistenza: fail-closed a livello source, non ancora scope-violation.
      return issue("lesson-event-log", "corrupt", "invalid-schema")
  }
}

/**
 * accept #2/#4: solo FSA e bundle importato sono autoritativi. localStorage
 * (cache di sviluppo) e la persistenza unavailable vengono degradate con codici
 * distinti che sopravvivono nella projection e nella card, cosi' che
 * "workspace non inizializzato", "factory rifiutata" e "handle FSA persa"
 * restino cause visibili distinte anche dopo la serializzazione.
 */
function persistenceIssuesForWorkspace(
  persistence: ContinuityWorkspacePersistenceV1,
): readonly ContinuitySourceIssueV1[] {
  switch (persistence.kind) {
    case "fsa":
    case "bundle":
      return Object.freeze([])
    case "local-storage": {
      // AGENTS §3: localStorage e' CACHE, mai fonte di verita'. Ogni sorgente
      // dichiara la degradazione con codice dedicato; il byte non viene
      // trattato come verificato.
      const code = "local-storage-non-authoritative" as const
      return Object.freeze([
        issue("session", "degraded", code),
        issue("journal", "degraded", code),
        issue("scene", "degraded", code),
      ])
    }
    case "unavailable": {
      const code = mapUnavailableWorkspaceCode(persistence.code)
      return Object.freeze([
        issue("session", "degraded", code),
        issue("journal", "degraded", code),
        issue("scene", "degraded", code),
      ])
    }
  }
}

function mapUnavailableWorkspaceCode(
  code: string,
): ContinuitySourceIssueV1["code"] {
  switch (code) {
    case "workspace-not-initialised":
    case "workspace-uninitialised":
      return "workspace-uninitialised"
    case "workspace-reader-factory-rejected":
    case "workspace-factory-rejected":
      return "workspace-factory-rejected"
    case "fsa-handle-lost":
    case "fsa-permission-lost":
      return "fsa-handle-lost"
    default:
      return "unavailable"
  }
}

/**
 * Validazione stretta degli envelope stoccati (accept #3):
 * - schema V2 e Founder-Beta authority per ogni riga,
 * - payload LessonOS conforme al kind,
 * - lessonId + sessionId esattamente uguali allo scope (scope-violation),
 * - seq monotona crescente e mai duplicata,
 * - eventId globalmente unico dentro lo stesso store,
 * - idempotencyKey non-null globalmente unica (identita' duplicata = corruzione).
 * Il primo motivo canonico bloccante azzera lessonEvents e produce una issue
 * tipata; nessuna proiezione parziale dagli envelope "buoni". Gli envelope
 * accettati vengono clonati e ricorsivamente congelati (actor/producer/payload
 * ed evidence inclusi) al boundary di validazione: un adapter che trattiene i
 * suoi oggetti originali non puo' mutare replay, evidence o projection
 * dopo il ritorno del loader.
 */
/**
 * Collezione vuota FRESCA e congelata, una per chiamata.
 *
 * Ogni ramo di `validateStoredEnvelopes` deve restituire una collezione fresca
 * e congelata. Il ramo zero-row restituiva `raw`, cioe' l'array POSSEDUTO
 * dall'adapter: chi lo trattiene poteva mutarlo dopo il load e cambiare replay,
 * evidenceByOccurrence e proiezione. I rami di fallimento restituivano `[]`
 * fresco ma non congelato. Un singleton condiviso sembrava sicuro - nessuno
 * puo' mutare un array congelato - ma la clausola 4 chiede una collezione NUOVA:
 * due load indipendenti a zero envelope non devono condividere identita', o un
 * confronto per riferimento li considera lo stesso risultato.
 */
function emptyEnvelopes(): readonly AppendedEventEnvelopeV2[] {
  return Object.freeze([]) as readonly AppendedEventEnvelopeV2[]
}

function validateStoredEnvelopes(
  raw: readonly AppendedEventEnvelopeV2[],
  scope: ContinuityScopeV1,
): { events: readonly AppendedEventEnvelopeV2[]; issue: ContinuitySourceIssueV1 | null } {
  if (raw.length === 0) return { events: emptyEnvelopes(), issue: null }
  const seqs = new Set<number>()
  const eventIds = new Set<string>()
  const idempotencyKeys = new Set<string>()
  let previousSeq = 0
  for (const envelope of raw) {
    if (!Number.isInteger(envelope.seq) || envelope.seq <= 0 || envelope.seq <= previousSeq) {
      return { events: emptyEnvelopes(), issue: issue("lesson-event-log", "corrupt", "invalid-schema") }
    }
    if (seqs.has(envelope.seq)) {
      return { events: emptyEnvelopes(), issue: issue("lesson-event-log", "corrupt", "invalid-schema") }
    }
    seqs.add(envelope.seq)
    previousSeq = envelope.seq
    try {
      const { seq: _seq, ...withoutSeq } = envelope
      assertEventEnvelopeV2(withoutSeq)
      assertFounderBetaAuthority(withoutSeq)
      assertLessonOsEnvelopePayload(withoutSeq.kind, withoutSeq.payload)
    } catch {
      return { events: emptyEnvelopes(), issue: issue("lesson-event-log", "corrupt", "invalid-schema") }
    }
    if (envelope.lessonId !== scope.lessonId || envelope.sessionId !== scope.sessionId) {
      return { events: emptyEnvelopes(), issue: issue("lesson-event-log", "corrupt", "scope-violation") }
    }
    if (eventIds.has(envelope.eventId)) {
      return { events: emptyEnvelopes(), issue: issue("lesson-event-log", "corrupt", "duplicate-event-id") }
    }
    eventIds.add(envelope.eventId)
    if (envelope.idempotencyKey !== null) {
      if (idempotencyKeys.has(envelope.idempotencyKey)) {
        return { events: emptyEnvelopes(), issue: issue("lesson-event-log", "corrupt", "duplicate-event-id") }
      }
      idempotencyKeys.add(envelope.idempotencyKey)
    }
  }
  const cloned = raw.map((envelope) => cloneFrozen(envelope))
  return { events: Object.freeze(cloned), issue: null }
}

/**
 * Controllo ridondante di scope su `payload.room` (design §5.4). Per
 * lesson.started/ended e plugin.mounted, un envelope A/SA con payload.room=B
 * e' event-union/corrupt/scope-violation: la scoperta azzera i fatti e nessun
 * byte-sentinella entra nella UI. La lifecycle senza room e' gia' fermata da
 * assertLessonOsEnvelopePayload (che rende `room` obbligatorio per
 * lesson.started/ended). Un plugin.mounted senza room resta contratto legacy
 * (degraded/unsupported-event-contract), che qui NON azzera gli altri fatti.
 */
function checkRedundantRoomScope(
  events: readonly AppendedEventEnvelopeV2[],
  scope: ContinuityScopeV1,
): { violation: ContinuitySourceIssueV1 | null; legacyPluginMount: boolean } {
  let legacyPluginMount = false
  for (const envelope of events) {
    if (!REDUNDANT_ROOM_KINDS.has(envelope.kind)) continue
    const payloadRoom = (envelope.payload as Record<string, unknown>).room
    if (payloadRoom === undefined) {
      // plugin.mounted storico privo di room: contratto non supportato ma
      // non corruzione. Le lifecycle senza room sarebbero gia' fermate al
      // gate schema (room required in LESSON_OS_PAYLOAD_RULES).
      if (envelope.kind === "plugin.mounted") legacyPluginMount = true
      continue
    }
    if (typeof payloadRoom !== "string" || payloadRoom !== scope.lessonId) {
      return {
        violation: issue("event-union", "corrupt", "scope-violation"),
        legacyPluginMount,
      }
    }
  }
  return { violation: null, legacyPluginMount }
}

async function readSession(
  scope: ContinuityScopeV1,
  workspace: ContinuityWorkspaceReaderV1,
): Promise<{
  session: ScopedContinuitySnapshotV1["session"]
  issue: ContinuitySourceIssueV1 | null
}> {
  const path = sessionPaths(scope).session
  let blob: Blob | null
  try {
    blob = await workspace.read(path)
  } catch {
    return { session: null, issue: issue("session", "degraded", "fsa-handle-lost") }
  }
  // Assenza esatta di session.yaml: sorgente richiesta ma documento assente
  // (design §9.1). Provenience della sessione NON e' disponibile finche' non
  // torna, quindi non puo' apparire come ready silenziosamente.
  if (blob === null) return { session: null, issue: issue("session", "degraded", "missing") }
  let bytes: Uint8Array
  try {
    bytes = new Uint8Array(await blob.arrayBuffer())
  } catch {
    // accept #5: byte-read failure sulla session e' degraded per-source
    // (l'FSA ha aperto il file ma poi lo ha perso), non corrupt.
    return { session: null, issue: issue("session", "degraded", "read-rejected") }
  }
  let doc: SessionYamlV2
  try {
    doc = parseSessionYamlV2(bytes)
  } catch (error) {
    if (error instanceof SessionYamlParseError) {
      // Riusa i byte gia' catturati: mai un secondo blob.arrayBuffer().
      return {
        session: null,
        issue: issue(
          "session",
          "corrupt",
          "invalid-schema",
          await preservedFromBytes(path, bytes),
        ),
      }
    }
    return { session: null, issue: issue("session", "corrupt", "invalid-schema") }
  }
  if (doc.lessonId !== scope.lessonId || doc.sessionId !== scope.sessionId) {
    return {
      session: null,
      issue: issue(
        "session",
        "corrupt",
        "scope-violation",
        await preservedFromBytes(path, bytes),
      ),
    }
  }
  return {
    session: Object.freeze({ document: doc, sha256: await sha256Hex(bytes) }),
    issue: null,
  }
}

async function readJournal(
  scope: ContinuityScopeV1,
  workspace: ContinuityWorkspaceReaderV1,
): Promise<{
  entries: readonly Readonly<{ line: number; envelope: JournalEnvelopeV2 }>[]
  issues: readonly ContinuitySourceIssueV1[]
}> {
  const path = roomPaths(scope.roomId).journal
  let blob: Blob | null
  try {
    blob = await workspace.read(path)
  } catch {
    return { entries: [], issues: [issue("journal", "degraded", "fsa-handle-lost")] }
  }
  if (blob === null) return { entries: [], issues: [] }
  // accept #5: blob.arrayBuffer() puo' rigettare (FSA persa dopo un read
  // riuscito, quota superata, etc.) ed e' un errore per-source: emettere una
  // journal/degraded/read-rejected tipata, non rigettare l'intero loader.
  let bytes: Uint8Array
  try {
    bytes = new Uint8Array(await blob.arrayBuffer())
  } catch {
    return { entries: [], issues: [issue("journal", "degraded", "read-rejected")] }
  }
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes)
  const preserved = Object.freeze({
    path,
    sha256: await sha256Hex(bytes),
    bytes: bytes.byteLength,
  })
  let decoded: ReturnType<typeof decodeJournalJsonl>
  try {
    decoded = decodeJournalJsonl(text, path)
  } catch {
    return {
      entries: [],
      issues: [issue("journal", "corrupt", "invalid-schema", preserved)],
    }
  }

  const collected: Array<{ line: number; envelope: JournalEnvelopeV2 }> = []
  const collectedIssues: ContinuitySourceIssueV1[] = []
  let legacyRecoverySeen = false
  const markLegacy = (): void => {
    if (legacyRecoverySeen) return
    legacyRecoverySeen = true
    collectedIssues.push(issue("journal", "degraded", "legacy-recovery-required"))
  }
  for (const [index, envelope] of decoded.envelopes.entries()) {
    if (envelope.producer.id === JOURNAL_V1_ADAPTER_PRODUCER_ID) {
      // Riga fisica V1 adattata: resta materia di recovery, non entra come
      // ready (design §3.4). L'adattatore genera un sessionId deterministico
      // che NON e' quello dello scope: percio' controlliamo il producer prima
      // di filtrare per session, altrimenti il legacy sparirebbe in silenzio.
      markLegacy()
      continue
    }
    if (envelope.lessonId !== scope.lessonId) {
      collectedIssues.push(issue("journal", "corrupt", "scope-violation", preserved))
      return { entries: [], issues: collectedIssues }
    }
    if (envelope.sessionId !== scope.sessionId) continue
    collected.push({ line: index + 1, envelope })
  }
  if (decoded.issues.length > 0) markLegacy()
  return {
    entries: Object.freeze(collected.map((entry) => Object.freeze(entry))),
    issues: Object.freeze(collectedIssues),
  }
}

async function readScene(
  scope: ContinuityScopeV1,
  workspace: ContinuityWorkspaceReaderV1,
): Promise<{
  scene: ScopedContinuitySnapshotV1["scene"]
  issue: ContinuitySourceIssueV1 | null
}> {
  const path = roomPaths(scope.roomId).scene
  let blob: Blob | null
  try {
    blob = await workspace.read(path)
  } catch {
    return { scene: null, issue: issue("scene", "degraded", "fsa-handle-lost") }
  }
  if (blob === null) return { scene: null, issue: null }
  // accept #5: byte-read failure e' per-source, non deve rigettare il loader.
  let bytes: Uint8Array
  try {
    bytes = new Uint8Array(await blob.arrayBuffer())
  } catch {
    return { scene: null, issue: issue("scene", "degraded", "read-rejected") }
  }
  const preserved = Object.freeze({
    path,
    sha256: await sha256Hex(bytes),
    bytes: bytes.byteLength,
  })
  let parsed: unknown
  try {
    parsed = JSON.parse(new TextDecoder("utf-8", { fatal: false }).decode(bytes))
  } catch {
    return {
      scene: null,
      issue: issue("scene", "corrupt", "invalid-schema", preserved),
    }
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed) ||
    !("elements" in parsed) ||
    !Array.isArray((parsed as { elements: unknown }).elements)
  ) {
    return {
      scene: null,
      issue: issue("scene", "corrupt", "invalid-schema", preserved),
    }
  }
  // accept: elementi malformati (non-oggetto) rendono l'INTERA scena corrupt.
  // Un `elements: [42]` non deve collassare in una scena verified con zero
  // elementi e nascondere embed non validi.
  const rawElements = (parsed as { elements: readonly unknown[] }).elements
  for (const element of rawElements) {
    if (typeof element !== "object" || element === null || Array.isArray(element)) {
      return {
        scene: null,
        issue: issue("scene", "corrupt", "invalid-schema", preserved),
      }
    }
  }
  // accept #3: la scena e' clonata e ricorsivamente congelata (embed
  // customData compreso) cosi' che un caller che trattiene l'input non
  // possa mutare la projection dopo il ritorno del loader.
  const elements: readonly JsonObject[] = rawElements.map(
    (element) => cloneFrozen(element as JsonObject),
  )
  const embeds: Array<{
    instanceId: string
    pluginId: string
    sceneDigest: string | null
  }> = []
  for (const element of elements) {
    const detected = detectSimulationEmbed(element)
    if (detected !== null) embeds.push(detected)
  }
  return {
    scene: Object.freeze({
      sha256: await sha256Hex(bytes),
      elements: Object.freeze(elements),
      simulationEmbeds: Object.freeze(embeds.map((embed) => Object.freeze(embed))),
    }),
    issue: null,
  }
}

// accept: rileva sia il marker Simulation di produzione
// (`type: "embeddable"` + `customData.maestroTool.owner`) sia il contratto
// legacy (`type: "embed"` + flat customData) — cosi' una scena reale con
// embed Simulation zero-event forza la required build/plugin provenance
// invece di nascondersi come empty verified.
const SIMULATION_PLUGIN_IDS: ReadonlySet<string> = new Set([
  "io.ardesia.simulation",
  "io.ardesia.simulation-plugin",
])
const MAESTRO_TOOL_MARKER_KEY = "maestroTool"

function readOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null
}

function detectSimulationEmbed(element: JsonObject): {
  instanceId: string
  pluginId: string
  sceneDigest: string | null
} | null {
  const type = element.type
  // Produzione: embed maestro-tool su Excalidraw embeddable.
  if (type === "embeddable") {
    const customData = element.customData
    if (typeof customData !== "object" || customData === null || Array.isArray(customData)) {
      return null
    }
    const marker = (customData as Record<string, unknown>)[MAESTRO_TOOL_MARKER_KEY]
    if (typeof marker !== "object" || marker === null || Array.isArray(marker)) return null
    const owner = (marker as Record<string, unknown>).owner
    if (typeof owner !== "string" || owner.length === 0) return null
    const hashAt = owner.indexOf("#")
    const pluginId = hashAt >= 0 ? owner.slice(0, hashAt) : owner
    if (!SIMULATION_PLUGIN_IDS.has(pluginId)) return null
    const instanceFromOwner = hashAt >= 0 ? owner.slice(hashAt + 1) : null
    const elementId = readOptionalString(element.id)
    const instanceId = instanceFromOwner ?? elementId ?? owner
    // sceneDigest e' preferenzialmente dentro marker.state (produzione);
    // fallback su customData.sceneDigest per compatibilita' con test/tools.
    const stateRaw = (marker as Record<string, unknown>).state
    let sceneDigest: string | null = null
    if (typeof stateRaw === "object" && stateRaw !== null && !Array.isArray(stateRaw)) {
      sceneDigest = readOptionalString((stateRaw as Record<string, unknown>).sceneDigest)
    }
    if (sceneDigest === null) {
      sceneDigest = readOptionalString((customData as Record<string, unknown>).sceneDigest)
    }
    return { instanceId, pluginId, sceneDigest }
  }
  // Legacy: embed con customData flat (instanceId/pluginId diretti).
  if (type === "embed") {
    const customData = element.customData
    if (typeof customData !== "object" || customData === null || Array.isArray(customData)) {
      return null
    }
    const cd = customData as Record<string, unknown>
    const instanceId = readOptionalString(cd.instanceId)
    const pluginId = readOptionalString(cd.pluginId)
    if (instanceId === null || pluginId === null) return null
    return {
      instanceId,
      pluginId,
      sceneDigest: readOptionalString(cd.sceneDigest),
    }
  }
  return null
}

/**
 * Valutazione fail-closed della provenance build (design §8.2, §9.1). Non
 * basta un buildCommitSha non-null: deve essere un full-SHA canonico e ogni
 * envelope Founder deve dichiarare lo stesso producer.commitSha. Un
 * disallineamento diventa build/corrupt/digest-mismatch e blocca la
 * projection dalla presentazione come ready. accept #4: la scena che monta un
 * Simulation embed richiede lo stesso build+plugin provenance anche se non
 * ci sono ancora eventi scoped (una scena con embed senza receipt non e' mai
 * un empty verificato).
 */
function evaluateBuildProvenance(
  lessonEvents: readonly AppendedEventEnvelopeV2[],
  journalEvents: readonly Readonly<{ line: number; envelope: JournalEnvelopeV2 }>[],
  scene: ScopedContinuitySnapshotV1["scene"],
  buildCommitSha: string | null,
): ContinuitySourceIssueV1 | null {
  const hasEvents = lessonEvents.length > 0 || journalEvents.length > 0
  const hasSimulationEmbed = (scene?.simulationEmbeds.length ?? 0) > 0
  const requiresProvenance = hasEvents || hasSimulationEmbed
  if (!requiresProvenance) return null
  if (buildCommitSha === null || !FULL_COMMIT_SHA_RE.test(buildCommitSha)) {
    return issue("build", "degraded", "missing")
  }
  const canonicalBuild = buildCommitSha.toLowerCase()
  const mismatched = [...lessonEvents, ...journalEvents.map((entry) => entry.envelope)]
    .some((envelope) => (envelope.producer.commitSha ?? "").toLowerCase() !== canonicalBuild)
  if (mismatched) return issue("build", "corrupt", "digest-mismatch")
  return null
}

function unavailableEventReader(code: string): ContinuityEventReaderV1 {
  return Object.freeze({
    persistence: Object.freeze({ kind: "unavailable" as const, code }),
    async readEnvelopesBySession() {
      return Object.freeze([]) as readonly AppendedEventEnvelopeV2[]
    },
    dispose: NO_OP_DISPOSE,
  })
}

function unavailableWorkspaceReader(code: string): ContinuityWorkspaceReaderV1 {
  return Object.freeze({
    persistence: Object.freeze({ kind: "unavailable" as const, code }),
    async read() {
      return null
    },
    dispose: NO_OP_DISPOSE,
  })
}

/**
 * Costruisce lo scoped snapshot fail-closed per lo scope richiesto. Se lo
 * scope e' invalido, ritorna scope-invalid SENZA invocare le factory. Se
 * valido, consulta esattamente una volta ogni factory (nuovi adapter per
 * ogni chiamata) e traduce ogni fallimento in una issue tipata; non produce
 * mai una projection parziale sotto una etichetta ready. Le dispose dei
 * reader sono invocate sempre, anche quando il ramo di lettura viene
 * saltato per persistenza degradata o corrotta.
 */
/**
 * Differisce una chiamata cosi' che un throw SINCRONO diventi una rejection.
 *
 * Gli elementi di un array literal sono valutati immediatamente, quindi
 * `Promise.allSettled([a(), b()])` non contiene affatto un throw sincrono di
 * `a()` o `b()`: l'espressione esplode prima che `allSettled` venga invocata.
 * Nel percorso factory questo lasciava il primo reader gia' creato senza
 * dispose; nel percorso di cleanup impediva del tutto la seconda dispose.
 */
function settled<T>(run: () => T | Promise<T>): Promise<T> {
  return Promise.resolve().then(run)
}

export async function loadScopedContinuitySnapshot(
  requested: { lessonId: unknown; roomId: unknown; sessionId: unknown },
  factories: ContinuityRuntimeAdapterFactories,
): Promise<LoadScopedContinuityResultV1> {
  let scope: ContinuityScopeV1
  try {
    scope = validateContinuityScopeV1(requested)
  } catch (error) {
    if (error instanceof ContinuityScopeError) {
      return Object.freeze({ kind: "scope-invalid" as const, code: error.code })
    }
    throw error
  }

  // La costruzione delle factory puo' fallire: la rejection non deve leakare
  // untyped, deve tradursi in un reader "unavailable/factory-rejected" cosi'
  // che il loader emetta la issue tipata e proceda.
  const [eventReaderResult, workspaceReaderResult] = await Promise.allSettled([
    settled(() => factories.createEventReader(scope)),
    settled(() => factories.createWorkspaceReader()),
  ])
  const eventReader: ContinuityEventReaderV1 = eventReaderResult.status === "fulfilled"
    ? eventReaderResult.value
    : unavailableEventReader("event-reader-factory-rejected")
  const workspaceReader: ContinuityWorkspaceReaderV1 = workspaceReaderResult.status === "fulfilled"
    ? workspaceReaderResult.value
    : unavailableWorkspaceReader("workspace-reader-factory-rejected")

  try {
    return await buildScopedSnapshot(scope, eventReader, workspaceReader, factories)
  } finally {
    // Rilascia sempre: nessuna handle IndexedDB/FSA sopravvive alla chiamata.
    await Promise.allSettled([
      settled(() => eventReader.dispose()),
      settled(() => workspaceReader.dispose()),
    ])
  }
}

async function buildScopedSnapshot(
  scope: ContinuityScopeV1,
  eventReader: ContinuityEventReaderV1,
  workspaceReader: ContinuityWorkspaceReaderV1,
  factories: ContinuityRuntimeAdapterFactories,
): Promise<LoadScopedContinuityResultV1> {
  const issues: ContinuitySourceIssueV1[] = []
  // Su fallimento di validazione la collezione congelata viene scartata e
  // sopravvive questo inizializzatore: deve essere congelato anch'esso.
  let lessonEvents: readonly AppendedEventEnvelopeV2[] = emptyEnvelopes()

  const persistenceProblem = persistenceIssueForEvents(eventReader.persistence)
  if (persistenceProblem !== null) {
    issues.push(persistenceProblem)
  }
  if (
    eventReader.persistence.kind === "verified-indexeddb" ||
    eventReader.persistence.kind === "data-loss"
  ) {
    // data-loss lascia un log leggibile ma degradato: la query di scope puo'
    // ancora tornare fatti canonici. Se il read fallisce viene emessa una
    // issue corrupt aggiuntiva.
    let raw: readonly AppendedEventEnvelopeV2[]
    try {
      raw = await eventReader.readEnvelopesBySession(scope.lessonId, scope.sessionId)
    } catch {
      issues.push(issue("lesson-event-log", "corrupt", "invalid-schema"))
      raw = emptyEnvelopes()
    }
    const { events, issue: validationIssue } = validateStoredEnvelopes(raw, scope)
    if (validationIssue !== null) {
      issues.push(validationIssue)
    } else {
      lessonEvents = events
    }
  }

  // Sorgenti workspace: unavailable (workspace non inizializzato, factory
  // rifiutata) salta ogni read; local-storage/fsa/bundle leggono davvero. La
  // authority resta esplicita: local-storage aggiunge issue non-authoritative
  // per source PRIMA dei fatti read, cosi' la card vede sia la degradazione
  // di provenance sia il risultato del read (accept #2, #4).
  const workspacePersistence = workspaceReader.persistence
  const workspaceCanRead = workspacePersistence.kind !== "unavailable"
  const workspacePersistenceIssues = persistenceIssuesForWorkspace(workspacePersistence)
  const sessionResult = workspaceCanRead
    ? await readSession(scope, workspaceReader)
    : { session: null as ScopedContinuitySnapshotV1["session"], issue: null }
  const journalResult = workspaceCanRead
    ? await readJournal(scope, workspaceReader)
    : {
        entries: Object.freeze([]) as readonly Readonly<{ line: number; envelope: JournalEnvelopeV2 }>[],
        issues: Object.freeze([]) as readonly ContinuitySourceIssueV1[],
      }
  const sceneResult = workspaceCanRead
    ? await readScene(scope, workspaceReader)
    : { scene: null as ScopedContinuitySnapshotV1["scene"], issue: null }
  for (const entry of workspacePersistenceIssues) issues.push(entry)
  if (sessionResult.issue !== null) issues.push(sessionResult.issue)
  for (const entry of journalResult.issues) issues.push(entry)
  if (sceneResult.issue !== null) issues.push(sceneResult.issue)

  // Payload.room scope check (event-union corrupt) — design §5.4 I1.
  if (lessonEvents.length > 0) {
    const { violation, legacyPluginMount } = checkRedundantRoomScope(lessonEvents, scope)
    if (violation !== null) {
      issues.push(violation)
      lessonEvents = emptyEnvelopes()
    } else if (legacyPluginMount) {
      // Contratto legacy visibile ma non blocca la union: la Simulation ne
      // deriva `event-contract-legacy` a livello projector.
      issues.push(issue("event-union", "degraded", "unsupported-event-contract"))
    }
  }

  // Union globale eventId LessonOS ∪ journal (ARD-06 §5.4 I2, §12 RED-06-03).
  const combinedEventIds = new Set<string>()
  let unionCorrupted = false
  for (const envelope of lessonEvents) {
    if (combinedEventIds.has(envelope.eventId)) {
      unionCorrupted = true
      break
    }
    combinedEventIds.add(envelope.eventId)
  }
  if (!unionCorrupted) {
    for (const entry of journalResult.entries) {
      if (combinedEventIds.has(entry.envelope.eventId)) {
        unionCorrupted = true
        break
      }
      combinedEventIds.add(entry.envelope.eventId)
    }
  }
  let journalEvents = journalResult.entries
  if (unionCorrupted) {
    issues.push(issue("event-union", "corrupt", "duplicate-event-id"))
    lessonEvents = emptyEnvelopes()
    journalEvents = Object.freeze([])
  }

  // Build receipt: null/malformed => missing; producer.commitSha differente
  // dal build => corrupt/digest-mismatch (design §8.2, §9.1). La scena con
  // Simulation embed richiede la stessa provenance anche se gli eventi sono
  // vuoti (accept #4).
  const buildIssue = evaluateBuildProvenance(
    lessonEvents,
    journalEvents,
    sceneResult.scene,
    factories.buildCommitSha,
  )
  if (buildIssue !== null) issues.push(buildIssue)

  const evidenceByOccurrence = buildEvidenceOccurrenceMap(
    lessonEvents,
    journalEvents,
  )

  const snapshot: ScopedContinuitySnapshotV1 = Object.freeze({
    scope,
    session: sessionResult.session,
    lessonEvents,
    journalEvents,
    scene: sceneResult.scene,
    buildCommitSha: factories.buildCommitSha,
    evidenceByOccurrence,
    issues: Object.freeze(issues),
  })
  return Object.freeze({ kind: "loaded" as const, snapshot })
}

// La mappa e' keyed per `${eventId}:${evidenceIndex}` cosi' due occurrence
// della stessa ref restano distinte (design §5.4). Il loader NON e' un
// resolver strict: non parsa namespace, non verifica target scoped, non fa
// receipt artifact/build. Quindi una evidence dichiarata "verified" resta
// unsupported/handler-unavailable finche' il resolver di §8 non conferma il
// target; una dichiarata "missing" resta missing/declared-missing. Nessun
// byte viene promosso a "resolved" senza verifica reale (design §8.1).
function buildEvidenceOccurrenceMap(
  lessonEvents: readonly AppendedEventEnvelopeV2[],
  journalEvents: readonly Readonly<{ line: number; envelope: JournalEnvelopeV2 }>[],
): ReadonlyMap<string, ContinuityEvidenceV1> {
  const map = new Map<string, ContinuityEvidenceV1>()
  const drop = (
    envelope: EventEnvelopeV2<string, JsonObject>,
    evidence: readonly Readonly<{ ref: string; resolution: "verified" | "missing" }>[],
  ): void => {
    for (const [index, entry] of evidence.entries()) {
      const key = `${envelope.eventId}:${index}`
      const declaredVerified = entry.resolution === "verified"
      map.set(key, Object.freeze({
        occurrenceId: key,
        eventId: envelope.eventId,
        evidenceIndex: index,
        ref: entry.ref,
        declared: entry.resolution,
        status: declaredVerified ? "unsupported" : "missing",
        target: null,
        reason: declaredVerified ? "handler-unavailable" : "declared-missing",
      }))
    }
  }
  for (const envelope of lessonEvents) drop(envelope, envelope.evidence)
  for (const entry of journalEvents) drop(entry.envelope, entry.envelope.evidence)
  return map
}
