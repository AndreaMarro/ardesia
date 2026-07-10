// LessonOS — recovery-mode UX (P32 R10b, follow-up esplicito di D5).
//
// D5 ha reso il restore .lesson SOLO-su-log-vuoto (mai merge: i seq collidono
// = corruzione); nella Room live il log contiene già lesson.started dal mount,
// quindi l'import onesto risponde "skipped-non-empty". Questo modulo è l'UNICO
// percorso che rende il restore user-facing quando la memoria è persa o
// danneggiata (runtime.dataLoss/corrupted), rispettando ALLA LETTERA il
// contratto documentato di destroyEventLogStorage (indexedDbEventLog.ts):
// il chiamante DEVE (1) avere conferma esplicita dell'utente, (2) aver tentato
// prima exportSnapshot() best-effort del log corrente.
//
// Sequenza: conferma → backup best-effort → close → destroy → store nuovo
// (vuoto) → restore dal bundle. Ogni esito è esplicito, mai swallow (§4.4).
// Le dipendenze sono iniettate: la Room cabla i side-effect reali
// (window.confirm, download del backup, destroyEventLogStorage,
// createEventLogStore, restoreLessonOsSnapshotFromBundle).

import type { EventLogStore } from "./eventlog"
import { exportEventLogSnapshot } from "./indexedDbEventLog"
import type { LessonOsRestoreStatus } from "../store/lessonBundle"

export interface LessonOsRecoveryDeps {
  /** Log corrente (quello "vivo" ma con memoria persa/danneggiata). */
  currentStore: EventLogStore
  /** Conferma esplicita dell'utente (contratto destroyEventLogStorage). */
  confirm: () => boolean
  /** Consegna del backup JSONL all'utente (es. download). Chiamata SOLO se il log ha contenuto. */
  saveBackup: (snapshot: Blob) => void
  /** Distruzione fisica del database del log (destroyEventLogStorage bound). */
  destroyStorage: () => Promise<void>
  /** Ricrea lo store (createEventLogStore: mai throw, degrada a InMemory). */
  recreateStore: () => Promise<EventLogStore>
  /** Restore della sola memoria dal bundle sul log indicato (helper lessonBundle). */
  restoreFromBundle: (log: EventLogStore) => Promise<LessonOsRestoreStatus>
}

export type LessonOsRecoveryOutcome =
  /** Conferma rifiutata: NIENTE è stato toccato. */
  | { kind: "declined" }
  /** Log ricreato e memoria ripristinata dal bundle (seq originali). */
  | { kind: "recovered"; store: EventLogStore; recovered: number; backupTaken: boolean }
  /** deleteDatabase fallita: nulla è andato perso; store riaperto best-effort. */
  | { kind: "destroy-failed"; store: EventLogStore; error: string }
  /** Log distrutto e ricreato VUOTO ma restore non riuscito: lo store nuovo va
   *  comunque adottato (il vecchio non esiste più); l'errore è da mostrare. */
  | { kind: "restore-failed"; store: EventLogStore; error: string; backupTaken: boolean }

export async function recoverLessonOsFromBundle(
  deps: LessonOsRecoveryDeps,
): Promise<LessonOsRecoveryOutcome> {
  if (!deps.confirm()) return { kind: "declined" }

  // Backup best-effort PRIMA di toccare qualsiasi cosa (contratto destroy):
  // un log illeggibile non blocca la recovery — è esattamente il caso in cui
  // serve. Nessun download per un log vuoto (non c'è niente da salvare).
  let backupTaken = false
  try {
    const snapshot = await exportEventLogSnapshot(deps.currentStore)
    if (snapshot.size > 0) {
      deps.saveBackup(snapshot)
      backupTaken = true
    }
  } catch {
    // best-effort: il backup mancato non ferma la recovery
  }

  // deleteDatabase resta bloccata finché esistono connessioni aperte:
  // chiudere il log corrente PRIMA della distruzione (dopo il backup, che
  // invece ha bisogno della connessione).
  const closable = deps.currentStore as EventLogStore & { close?: () => Promise<void> }
  if (typeof closable.close === "function") {
    try {
      await closable.close()
    } catch {
      // una close fallita non deve impedire il tentativo di destroy
    }
  }

  try {
    await deps.destroyStorage()
  } catch (err) {
    // Nulla è stato perso (la delete è fallita): riapri best-effort lo stesso
    // database così la Room resta funzionante col log di prima.
    const reopened = await deps.recreateStore()
    return {
      kind: "destroy-failed",
      store: reopened,
      error: err instanceof Error ? err.message : String(err),
    }
  }

  const store = await deps.recreateStore()
  const status = await deps.restoreFromBundle(store)
  if (status.kind === "restored") {
    return { kind: "recovered", store, recovered: status.recovered, backupTaken }
  }
  return { kind: "restore-failed", store, error: describeRestoreFailure(status), backupTaken }
}

/** Traduzione onesta degli esiti non-restored del retry (linguaggio docente). */
function describeRestoreFailure(status: LessonOsRestoreStatus): string {
  switch (status.kind) {
    case "failed":
      return status.error
    case "unsupported":
      return "il log ricreato non supporta il restore (persistenza locale non disponibile, es. modalità privata)"
    case "no-snapshot":
      return "il file .lesson non contiene la memoria didattica (export senza snapshot)"
    case "skipped-non-empty":
      return "il log ricreato non risulta vuoto"
    case "not-attempted":
      return "restore non tentato"
    default:
      return "esito imprevisto"
  }
}
