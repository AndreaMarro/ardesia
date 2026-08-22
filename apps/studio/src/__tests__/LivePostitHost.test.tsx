// @vitest-environment jsdom
//
// CORE-00 — due post-it dello STESSO plugin sulla stessa lavagna, ciascuno col
// proprio stato, che lo ritrovano dopo chiusura e riapertura.
//
// È la prima volta che esiste un composition root persistente e identificato:
// panelHost.ts monta un pannello effimero (PanelMemStore in memoria, board
// inerte) e non passa instanceId, quindi nessun percorso di produzione crea
// un'istanza di plugin che sopravviva alla sessione.

import { afterEach, describe, expect, it, vi } from "vitest"
import { mountLivePostit } from "../toolhost/livePostitHost.ts"
import { ToolHost } from "../toolhost/host.ts"
import { ToolManifestSchema } from "../toolhost-protocol/index.ts"
import { connectTool } from "../sdk/index.ts"
import type { WindowLike } from "../sdk/index.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"

const MANIFEST = ToolManifestSchema.parse({
  manifestVersion: 1,
  id: "com.example.postit",
  name: "Post-it vivo",
  version: "1.0.0",
  protocol: ">=1.0 <2.0",
  entry: "entry.html",
  surfaces: ["board-embed"],
  capabilities: { storage: { quotaMB: 1 } },
  publisher: { id: "ref", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
})

/** Store che sopravvive alla chiusura della lezione: è il punto del test. */
class PersistentStore implements StorageDriverLike, AuditStore {
  files = new Map<string, Blob>()
  async read(path: string): Promise<Blob | null> {
    return this.files.get(path) ?? null
  }
  async write(path: string, data: Blob): Promise<void> {
    this.files.set(path, data)
  }
  async delete(path: string): Promise<void> {
    this.files.delete(path)
  }
  async list(prefix?: string): Promise<StorageEntryLike[]> {
    return [...this.files.entries()]
      .filter(([p]) => prefix === undefined || p.startsWith(prefix))
      .map(([path, data]) => ({ path, data }))
  }
}

class SceneBoard implements BoardApiLike {
  elements: BoardElementLike[] = []
  getSceneElements(): readonly BoardElementLike[] {
    return this.elements
  }
  getAppState(): { selectedElementIds: Record<string, boolean> } {
    return { selectedElementIds: {} }
  }
  updateScene(scene: { elements: BoardElementLike[] }): void {
    this.elements = scene.elements
  }
}

class InPageToolWindow implements WindowLike {
  private _listeners = new Set<(ev: { data: unknown; ports?: readonly unknown[] }) => void>()
  addEventListener(_t: "message", l: (ev: { data: unknown; ports?: readonly unknown[] }) => void): void {
    this._listeners.add(l)
  }
  removeEventListener(_t: "message", l: (ev: { data: unknown; ports?: readonly unknown[] }) => void): void {
    this._listeners.delete(l)
  }
  deliver(data: unknown, ports: readonly unknown[]): void {
    for (const l of [...this._listeners]) l({ data, ports })
  }
}

/** Tool finto che tiene un contatore e lo consegna a suspend/restore. */
function fakeTool(seed: number): {
  connect: (hello: unknown, port: MessagePort) => Promise<void>
  read: () => number
  bump: () => void
} {
  let conta = seed
  return {
    read: () => conta,
    bump: () => {
      conta += 1
    },
    connect: async (hello, port) => {
      const win = new InPageToolWindow()
      const p = connectTool({
        windowRef: win,
        handlers: {
          suspend: () => ({ conta }),
          restore: (state: unknown) => {
            const s = state as { conta?: number } | null
            if (s?.conta !== undefined) conta = s.conta
          },
        },
      })
      win.deliver(hello, [port])
      await p
    },
  }
}

const closers: Array<() => Promise<void>> = []
afterEach(async () => {
  for (const c of closers.splice(0)) await c()
})

const APPROVED = ["storage"] as const
const ALLOW_GATE = { canMount: async () => true }

describe("CORE-00 — due post-it vivi dello stesso plugin", () => {
  it("hanno stato distinto e lo ritrovano dopo chiusura e riapertura", async () => {
    const store = new PersistentStore()
    const board = new SceneBoard()

    const toolA = fakeTool(10)
    const toolB = fakeTool(20)
    const a = await mountLivePostit({
      manifest: MANIFEST,
      instanceId: "post-a",
      store,
      board,
      approved: APPROVED,
      gate: ALLOW_GATE,
      connect: toolA.connect,
    })
    const b = await mountLivePostit({
      manifest: MANIFEST,
      instanceId: "post-b",
      store,
      board,
      approved: APPROVED,
      gate: ALLOW_GATE,
      connect: toolB.connect,
    })

    toolA.bump()
    toolA.bump()
    toolB.bump()

    // chiusura della lezione
    await a.close()
    await b.close()

    // riapertura: due tool NUOVI, con seed sbagliato di proposito, così un
    // verde non può venire dal seed ma solo dallo stato restituito.
    const toolA2 = fakeTool(0)
    const toolB2 = fakeTool(0)
    const a2 = await mountLivePostit({
      manifest: MANIFEST,
      instanceId: "post-a",
      store,
      board,
      approved: APPROVED,
      gate: ALLOW_GATE,
      connect: toolA2.connect,
    })
    const b2 = await mountLivePostit({
      manifest: MANIFEST,
      instanceId: "post-b",
      store,
      board,
      approved: APPROVED,
      gate: ALLOW_GATE,
      connect: toolB2.connect,
    })
    closers.push(
      () => a2.close(),
      () => b2.close(),
    )

    expect(await a2.host.restore()).toBe(true)
    expect(await b2.host.restore()).toBe(true)

    expect(toolA2.read()).toBe(12)
    expect(toolB2.read()).toBe(21)
  })

  it("due istanze non condividono il file di stato", async () => {
    const store = new PersistentStore()
    const board = new SceneBoard()
    const a = await mountLivePostit({
      manifest: MANIFEST,
      instanceId: "post-a",
      store,
      board,
      approved: APPROVED,
      gate: ALLOW_GATE,
      connect: fakeTool(1).connect,
    })
    const b = await mountLivePostit({
      manifest: MANIFEST,
      instanceId: "post-b",
      store,
      board,
      approved: APPROVED,
      gate: ALLOW_GATE,
      connect: fakeTool(2).connect,
    })
    await a.close()
    await b.close()

    expect([...store.files.keys()].filter((p) => p.endsWith("state.json"))).toHaveLength(2)
  })

  it("instanceId malformato = nessun post-it (fail-closed)", async () => {
    const store = new PersistentStore()
    await expect(
      mountLivePostit({
        manifest: MANIFEST,
        instanceId: "../evasione",
        store,
        board: new SceneBoard(),
        approved: APPROVED,
        gate: ALLOW_GATE,
        connect: fakeTool(1).connect,
      }),
    ).rejects.toThrow()
  })

  it("close smonta l'host e chiude le porte anche se suspend fallisce", async () => {
    const closeSpy = vi.spyOn(MessagePort.prototype, "close")
    const store = new PersistentStore()
    try {
      const postit = await mountLivePostit({
        manifest: MANIFEST,
        instanceId: "post-errore-suspend",
        store,
        board: new SceneBoard(),
        approved: APPROVED,
        gate: ALLOW_GATE,
        connect: fakeTool(1).connect,
      })
      const writeSpy = vi.spyOn(store, "write").mockRejectedValueOnce(new Error("persistenza rotta"))
      try {
        await expect(postit.close()).rejects.toThrow("persistenza rotta")
        expect(postit.host.session).toBeNull()
        expect(closeSpy).toHaveBeenCalled()
      } finally {
        writeSpy.mockRestore()
      }
    } finally {
      closeSpy.mockRestore()
    }
  })

  it("chiude entrambe le porte se host.mount fallisce", async () => {
    const mountSpy = vi.spyOn(ToolHost.prototype, "mount").mockImplementation(() => {
      throw new Error("mount rotto")
    })
    const closeSpy = vi.spyOn(MessagePort.prototype, "close")
    try {
      await expect(
        mountLivePostit({
          manifest: MANIFEST,
          instanceId: "post-errore-mount",
          store: new PersistentStore(),
          board: new SceneBoard(),
          approved: APPROVED,
          gate: ALLOW_GATE,
          connect: fakeTool(1).connect,
        }),
      ).rejects.toThrow("mount rotto")
      expect(closeSpy).toHaveBeenCalledTimes(2)
    } finally {
      closeSpy.mockRestore()
      mountSpy.mockRestore()
    }
  })

  it("gate negato: non connette il tool e chiude entrambe le porte", async () => {
    const closeSpy = vi.spyOn(MessagePort.prototype, "close")
    const connect = vi.fn(async () => {})
    try {
      await expect(
        mountLivePostit({
          manifest: MANIFEST,
          instanceId: "post-negato",
          store: new PersistentStore(),
          board: new SceneBoard(),
          approved: APPROVED,
          gate: { canMount: async () => false },
          connect,
        }),
      ).rejects.toThrow("not mountable")
      expect(connect).not.toHaveBeenCalled()
      expect(closeSpy).toHaveBeenCalledTimes(2)
    } finally {
      closeSpy.mockRestore()
    }
  })
})
