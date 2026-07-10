// P32 R10b — recovery-mode UX (follow-up esplicito di D5).
// D5 ha reso il restore .lesson SOLO-su-log-vuoto; nella Room live il log ha
// già lesson.started ⇒ l'import onesto risponde "skipped-non-empty". Questo
// orchestratore è l'UNICO percorso che rende il restore user-facing quando la
// memoria è persa/danneggiata: conferma esplicita → backup best-effort →
// close → destroy → log vuoto → restore dal bundle (è il contratto documentato
// di destroyEventLogStorage: "il chiamante DEVE (1) avere conferma esplicita
// dell'utente, (2) aver tentato prima exportSnapshot() best-effort").
//
// Le dipendenze sono iniettate: qui si testa l'ORDINE e la mappatura esiti,
// mai i side-effect reali (IndexedDB reale coperto da IndexedDbEventLog.test.ts).
import { describe, expect, it, vi } from "vitest"
import { InMemoryEventLog, type EventLogStore } from "../lessonos/eventlog"
import {
  recoverLessonOsFromBundle,
  type LessonOsRecoveryDeps,
} from "../lessonos/recovery"
import type { LessonOsRestoreStatus } from "../store/lessonBundle"

async function filledStore(): Promise<EventLogStore> {
  const store = new InMemoryEventLog()
  await store.append({
    kind: "lesson.started",
    room: "aula-1",
    t: 1000,
    evidence: ["lesson:aula-1@1000"],
  })
  return store
}

function makeDeps(overrides: Partial<LessonOsRecoveryDeps> = {}) {
  const calls: string[] = []
  const newStore = new InMemoryEventLog()
  const deps: LessonOsRecoveryDeps = {
    currentStore: new InMemoryEventLog(),
    confirm: vi.fn(() => {
      calls.push("confirm")
      return true
    }),
    saveBackup: vi.fn(() => {
      calls.push("saveBackup")
    }),
    destroyStorage: vi.fn(async () => {
      calls.push("destroy")
    }),
    recreateStore: vi.fn(async () => {
      calls.push("recreate")
      return newStore
    }),
    restoreFromBundle: vi.fn(async () => {
      calls.push("restore")
      return { kind: "restored", recovered: 2 } as LessonOsRestoreStatus
    }),
    ...overrides,
  }
  return { deps, calls, newStore }
}

describe("recoverLessonOsFromBundle (P32 R10b)", () => {
  it("conferma rifiutata ⇒ declined, NESSUN side-effect (log intatto)", async () => {
    const { deps } = makeDeps({ confirm: vi.fn(() => false) })

    const outcome = await recoverLessonOsFromBundle(deps)

    expect(outcome).toEqual({ kind: "declined" })
    expect(deps.saveBackup).not.toHaveBeenCalled()
    expect(deps.destroyStorage).not.toHaveBeenCalled()
    expect(deps.recreateStore).not.toHaveBeenCalled()
    expect(deps.restoreFromBundle).not.toHaveBeenCalled()
  })

  it("happy path: backup → destroy → recreate → restore, esito recovered col NUOVO store", async () => {
    const { deps, calls, newStore } = makeDeps({ currentStore: await filledStore() })

    const outcome = await recoverLessonOsFromBundle(deps)

    expect(outcome).toEqual({
      kind: "recovered",
      store: newStore,
      recovered: 2,
      backupTaken: true,
    })
    // Ordine del contratto: backup PRIMA della distruzione, restore per ultimo.
    expect(calls).toEqual(["confirm", "saveBackup", "destroy", "recreate", "restore"])
    // Il backup è lo snapshot JSONL del log corrente (1 evento = 1 riga non vuota).
    const snapshot = (deps.saveBackup as ReturnType<typeof vi.fn>).mock.calls[0]![0] as Blob
    expect(snapshot.size).toBeGreaterThan(0)
    // Il restore opera sul NUOVO store vuoto, mai sul vecchio.
    expect(deps.restoreFromBundle).toHaveBeenCalledWith(newStore)
  })

  it("log corrente VUOTO ⇒ nessun backup da scaricare (backupTaken false), recovery procede", async () => {
    const { deps, newStore } = makeDeps() // currentStore vuoto di default

    const outcome = await recoverLessonOsFromBundle(deps)

    expect(deps.saveBackup).not.toHaveBeenCalled()
    expect(outcome).toEqual({
      kind: "recovered",
      store: newStore,
      recovered: 2,
      backupTaken: false,
    })
  })

  it("store corrente con close() ⇒ close chiamata DOPO il backup e PRIMA della destroy", async () => {
    const calls: string[] = []
    const closable = Object.assign(await filledStore(), {
      close: vi.fn(async () => {
        calls.push("close")
      }),
    })
    const { deps } = makeDeps({
      currentStore: closable,
      saveBackup: vi.fn(() => calls.push("saveBackup")),
      destroyStorage: vi.fn(async () => {
        calls.push("destroy")
      }),
    })

    await recoverLessonOsFromBundle(deps)

    expect(closable.close).toHaveBeenCalledTimes(1)
    expect(calls).toEqual(["saveBackup", "close", "destroy"])
  })

  it("destroy fallita ⇒ destroy-failed, store RIAPERTO best-effort, restore MAI tentato", async () => {
    const { deps, newStore } = makeDeps({
      currentStore: await filledStore(),
      destroyStorage: vi.fn(async () => {
        throw new Error("deleteDatabase bloccata")
      }),
    })

    const outcome = await recoverLessonOsFromBundle(deps)

    expect(outcome).toEqual({
      kind: "destroy-failed",
      store: newStore,
      error: "deleteDatabase bloccata",
    })
    expect(deps.restoreFromBundle).not.toHaveBeenCalled()
  })

  it("restore con esito failed ⇒ restore-failed, errore passato, nuovo store comunque adottabile", async () => {
    const { deps, newStore } = makeDeps({
      currentStore: await filledStore(),
      restoreFromBundle: vi.fn(
        async (): Promise<LessonOsRestoreStatus> => ({
          kind: "failed",
          error: "snapshot malformato (riga non-JSON)",
        }),
      ),
    })

    const outcome = await recoverLessonOsFromBundle(deps)

    expect(outcome).toMatchObject({
      kind: "restore-failed",
      store: newStore,
      backupTaken: true,
    })
    expect((outcome as { error: string }).error).toContain("snapshot malformato")
  })

  it("restore con esito unsupported (recreate degradato a InMemory) ⇒ restore-failed con spiegazione", async () => {
    const { deps } = makeDeps({
      restoreFromBundle: vi.fn(async () => ({ kind: "unsupported" }) as LessonOsRestoreStatus),
    })

    const outcome = await recoverLessonOsFromBundle(deps)

    expect(outcome.kind).toBe("restore-failed")
    expect((outcome as { error: string }).error.toLowerCase()).toContain("persisten")
  })

  it("backup che lancia (log illeggibile) ⇒ best-effort: recovery procede, backupTaken false", async () => {
    const broken = await filledStore()
    broken.readAll = async () => {
      throw new Error("log illeggibile")
    }
    const { deps, newStore } = makeDeps({ currentStore: broken })

    const outcome = await recoverLessonOsFromBundle(deps)

    expect(deps.saveBackup).not.toHaveBeenCalled()
    expect(outcome).toEqual({
      kind: "recovered",
      store: newStore,
      recovered: 2,
      backupTaken: false,
    })
  })
})
