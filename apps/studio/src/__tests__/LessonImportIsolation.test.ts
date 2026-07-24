// @vitest-environment jsdom
// ARDESIA Studio — isolamento transazionale dell'import `.lesson` (ADR-0006, R6).
//
// `lessonImportTransaction.ts` implementa gia' una transazione seria: stage,
// backup, verifica byte-a-byte in rilettura, rollback, marcatore di commit. Ma
// ogni scrittura passava da `store.write()`, che prende e rilascia il lock di
// path una alla volta: fra un file e il successivo un altro scrittore poteva
// infilarsi. La transazione era atomica sul contenuto, non nel tempo.
//
// Il rimedio di ADR-0006 non e' avvolgere l'import in `withWorkspaceExclusive`
// lasciando dentro le write pubbliche: quello **deadlocca**, ed e' dimostrato in
// `LessonMutationReentrancy.test.ts`. Serve che l'import possieda la lease E
// scriva attraverso la porta driver grezza.
//
// Questi test guardano il LEDGER dei lock, non i tempi: nessuna corsa, nessun
// flake.

import { describe, it, expect, beforeEach } from "vitest"
import { WorkspaceStore } from "../store/WorkspaceStore"
import type { WorkspaceDriver, FileEntry } from "../store/types"
import { exportLesson } from "../store/lessonBundle"
import { roomPaths } from "../store/roomPaths"
import { createEventEnvelopeV2 } from "../core/contracts/eventEnvelope"
import {
  createInProcessMutationLockBroker,
  createLessonMutationCoordinator,
  WORKSPACE_MUTATION_LOCK,
  type MutationLockBroker,
  type MutationLockMode,
  type MutationSafety,
  type MutationTryLockResult,
} from "../store/lessonMutationLock"

const ROOM = "lezione-uno"

class MemoryDriver implements WorkspaceDriver {
  readonly name = "memory"
  private files = new Map<string, ArrayBuffer>()
  private legacy = new Map<string, string>()

  available(): boolean { return true }
  async init(): Promise<boolean> { return true }

  async read(path: string): Promise<Blob | null> {
    const raw = this.files.get(path)
    return raw ? new Blob([raw]) : null
  }

  async write(path: string, data: Blob): Promise<void> {
    this.files.set(path, await data.arrayBuffer())
  }

  async delete(path: string): Promise<void> { this.files.delete(path) }

  async list(prefix?: string): Promise<FileEntry[]> {
    const out: FileEntry[] = []
    for (const [path, buf] of this.files) {
      if (prefix && !path.startsWith(prefix)) continue
      out.push({ path, data: new Blob([buf]), mtime: 0 })
    }
    return out
  }

  getLegacyScene(room: string): string | null { return this.legacy.get(room) ?? null }
  setLegacyScene(room: string, data: string): void { this.legacy.set(room, data) }
}

/**
 * Ledger sopra il broker in-process DI PRODUZIONE.
 *
 * Il primo tentativo scriveva un broker semplificato a mano, e sbagliava: non
 * accodava le richieste `shared` dietro uno scrittore esclusivo, quindi
 * l'intruso risultava passare anche quando la lease funzionava. Un oracolo
 * scritto a mano che diverge dall'originale non misura il prodotto, misura
 * l'oracolo. Qui si delega, e si registra soltanto.
 */
class LedgerBroker implements MutationLockBroker {
  readonly ledger: string[] = []
  private readonly inner = createInProcessMutationLockBroker()
  readonly safety: MutationSafety = "origin-exclusive"

  request<T>(name: string, options: Readonly<{ mode: MutationLockMode }>,
             work: () => Promise<T>): Promise<T> {
    this.ledger.push(`request:${options.mode}:${name}`)
    return this.inner.request(name, options, async () => {
      this.ledger.push(`enter:${options.mode}:${name}`)
      try {
        return await work()
      } finally {
        this.ledger.push(`exit:${options.mode}:${name}`)
      }
    })
  }

  tryRequest<T>(name: string, options: Readonly<{ mode: MutationLockMode }>,
                work: () => Promise<T>): Promise<MutationTryLockResult<T>> {
    this.ledger.push(`try:${options.mode}:${name}`)
    return this.inner.tryRequest(name, options, async () => {
      this.ledger.push(`enter:${options.mode}:${name}`)
      try {
        return await work()
      } finally {
        this.ledger.push(`exit:${options.mode}:${name}`)
      }
    })
  }
}

function attach(store: WorkspaceStore, driver: MemoryDriver): void {
  ;(store as unknown as Record<string, unknown>).driver = driver
  ;(store as unknown as Record<string, unknown>).fallback = driver
  ;(store as unknown as Record<string, unknown>)._mode = "localStorage"
}

const FIXED_PRODUCER = Object.freeze({
  id: "com.github.andreamarro.ardesia.studio",
  version: "0.0.0",
  commitSha: "a".repeat(40),
})
const SESSION_ID = "11111111-1111-4111-8111-111111111111"

function canonicalJournalLine(lessonId: string): string {
  return JSON.stringify(createEventEnvelopeV2(
    {
      lessonId,
      sessionId: SESSION_ID,
      kind: "journal.pointer.down",
      actor: { type: "teacher", id: "founder-beta-teacher" },
      producer: FIXED_PRODUCER,
      causationId: null,
      idempotencyKey: `journal:${SESSION_ID}:33333333-3333-4333-8333-333333333333`,
      evidence: [{ ref: "board:pointer", resolution: "verified" }],
      payload: {},
    },
    {
      eventId: () => "33333333-3333-4333-8333-333333333333",
      now: () => new Date(1050),
    },
  ))
}

async function seededBundle(): Promise<Blob> {
  const source = new WorkspaceStore()
  attach(source, new MemoryDriver())
  await source.write(
    roomPaths(ROOM).journal,
    new Blob([`${canonicalJournalLine(ROOM)}\n`], { type: "application/x-ndjson" }),
  )
  await source.saveSessionYaml("v: 1\ncreated: 1000\naudioConsent: false\n")
  await source.saveScene(ROOM, JSON.stringify({ type: "excalidraw", elements: [] }))
  return exportLesson(source, ROOM)
}

describe("import .lesson — isolamento transazionale", () => {
  let bundle: Blob
  let broker: LedgerBroker
  let target: WorkspaceStore

  beforeEach(async () => {
    bundle = await seededBundle()
    broker = new LedgerBroker()
    target = new WorkspaceStore({
      mutationCoordinator: createLessonMutationCoordinator(broker),
    })
    attach(target, new MemoryDriver())
    broker.ledger.length = 0
  })

  it("prende UNA lease esclusiva di workspace per tutto l'import", async () => {
    await target.importLessonBlobForRoom(bundle, ROOM, null)

    const exclusive = broker.ledger.filter(
      (entry) => entry === `enter:exclusive:${WORKSPACE_MUTATION_LOCK}`)
    expect(exclusive).toHaveLength(1)
  })

  it("non riacquisisce alcun lock dentro la lease (porta driver grezza)", async () => {
    await target.importLessonBlobForRoom(bundle, ROOM, null)

    const enter = broker.ledger.filter((entry) => entry.startsWith("enter:"))
    const inside = enter.slice(
      enter.indexOf(`enter:exclusive:${WORKSPACE_MUTATION_LOCK}`) + 1)
    // dentro la lease non deve comparire NESSUNA nuova acquisizione: ne' shared
    // sul workspace ne' un lock di lezione. Sono le due forme che deadloccano.
    expect(inside).toEqual([])
  })

  it("la lease copre l'import per intero, non un file alla volta", async () => {
    await target.importLessonBlobForRoom(bundle, ROOM, null)

    const enterAt = broker.ledger.indexOf(`enter:exclusive:${WORKSPACE_MUTATION_LOCK}`)
    const exitAt = broker.ledger.indexOf(`exit:exclusive:${WORKSPACE_MUTATION_LOCK}`)
    expect(enterAt).toBeGreaterThanOrEqual(0)
    expect(exitAt).toBeGreaterThan(enterAt)
    // nessun rilascio-e-riacquisizione a meta' strada
    expect(broker.ledger.filter(
      (entry) => entry === `exit:exclusive:${WORKSPACE_MUTATION_LOCK}`)).toHaveLength(1)
  })

  it("uno scrittore esterno non si infila fra i file dell'import", async () => {
    const importing = target.importLessonBlobForRoom(bundle, ROOM, null)
    // richiesta emessa mentre l'import e' in corso
    const intruder = target.write("raw/altra-lezione/board.excalidraw",
                                  new Blob(["{}"]))
    await Promise.all([importing, intruder])

    const exitImport = broker.ledger.indexOf(`exit:exclusive:${WORKSPACE_MUTATION_LOCK}`)
    const enterIntruder = broker.ledger.findIndex(
      (entry, i) => i > 0 && entry === `enter:shared:${WORKSPACE_MUTATION_LOCK}`)
    expect(exitImport).toBeGreaterThanOrEqual(0)
    expect(enterIntruder).toBeGreaterThan(exitImport)
  })

  it("l'import resta corretto: i byte della lezione arrivano a destinazione", async () => {
    const result = await target.importLessonBlobForRoom(bundle, ROOM, null)
    expect(result).toBeTruthy()
    const scene = await target.read(roomPaths(ROOM).scene)
    expect(scene).not.toBeNull()
  })
})
