// @vitest-environment jsdom
// Montaggio libero slice 4 (persistenza) — i piazzamenti tap-tap non sono più
// solo stato locale del componente: vivono in customData[EMBED_DATA_KEY].state
// (l'ownership/state vive NELLA scena — invariante di caps/board — quindi
// sopravvive a re-mount, save/load e suspend/restore insieme agli elementi).
//
// Canale: l'host (Room) passa `host.persistEmbedState` a
// renderToolCanvasEmbeddable; il tool lo chiama ad ogni cambio piazzamenti.
// Senza host il tap-tap resta funzionante (fail-soft, comportamento slice 3).

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  createReferenceSimulationScene,
  createToolEmbedElement,
  renderToolCanvasEmbeddable,
} from "../toolhost/ToolCanvasEmbeddable"
import { ERR } from "../toolhost-protocol"
import { auditDropCount, readAuditLog, type AuditStore } from "../toolhost/audit"
import { persistRoomEmbedStateThroughToolHost } from "../toolhost/roomWriteBack"
import {
  EMBED_DATA_KEY,
  persistEmbedState,
  persistEmbedStateThroughToolHost,
  type BoardElementLike,
} from "../toolhost/caps/board"

afterEach(cleanup)

function mountSim({
  state,
  persist,
}: {
  state?: unknown
  persist?: (embedId: string, state: unknown) => void
} = {}) {
  const element = createToolEmbedElement(
    state === undefined ? {} : { state },
  )
  const view = renderToolCanvasEmbeddable(
    element as never,
    persist === undefined ? undefined : { persistEmbedState: persist },
  )
  if (view === null) throw new Error("embeddable non renderizzato")
  return render(view).container
}

function palette(container: HTMLElement, label: string): Element {
  const item = container.querySelector(`[aria-label="palette ${label}"]`)
  if (item === null) throw new Error(`palette ${label} non trovata`)
  return item
}

function hole(container: HTMLElement, ref: string): Element {
  const target = container.querySelector(`[data-bb-hole="${ref}"]`)
  if (target === null) throw new Error(`foro ${ref} non trovato`)
  return target
}

function count(container: HTMLElement): string | null {
  return (
    container
      .querySelector("[data-montaggio-canvas-count]")
      ?.getAttribute("data-montaggio-canvas-count") ?? null
  )
}

function notice(container: HTMLElement): string {
  return container.querySelector("[data-montaggio-canvas-notice]")?.textContent ?? ""
}

describe("SimulationBoard — persistenza piazzamenti (montaggio libero slice 4)", () => {
  it("un piazzamento completo chiama host.persistEmbedState con lo stato aggiornato", () => {
    const persist = vi.fn()
    const container = mountSim({ persist })

    fireEvent.click(palette(container, "Resistenza"))
    fireEvent.click(hole(container, "bb1:c3"))
    // primo tap: pending, nessun piazzamento → nessun persist
    expect(persist).not.toHaveBeenCalled()

    fireEvent.click(hole(container, "bb1:c4"))
    expect(persist).toHaveBeenCalledTimes(1)
    const [embedId, state] = persist.mock.calls[0] as [string, Record<string, unknown>]
    expect(embedId).toBe("elab-v1-cap6-esp1-first-led")
    expect(state.kind).toBe("simulation-scene-v1")
    expect((state.scene as { experimentId: string }).experimentId).toBe("v1-cap6-esp1")
    expect(state.montaggio).toMatchObject({
      placements: [{ id: "r-libero-1", type: "resistor", holes: ["bb1:c3", "bb1:c4"] }],
    })
    expect((state.montaggio as { operations?: Array<{ id: string; operation: { kind: string } }> }).operations).toEqual([
      expect.objectContaining({
        id: "elab-v1-cap6-esp1-first-led:montaggio:place:r-libero-1",
        operation: expect.objectContaining({
          kind: "place-component",
        }),
      }),
    ])
  })

  it("i piazzamenti nello stato embed vengono ripristinati al mount (re-mount survivor)", () => {
    const container = mountSim({
      state: {
        kind: "simulation-scene-v1",
        scene: createReferenceSimulationScene(),
        montaggio: {
          placements: [{ id: "led-libero-1", type: "led", holes: ["bb1:d12", "bb1:d13"] }],
        },
      },
    })

    expect(count(container)).toBe("1")
    expect(
      container.querySelector('[aria-label="LED montaggio libero led-libero-1"]'),
    ).not.toBeNull()

    // i fori del piazzamento ripristinato risultano occupati per i tap successivi
    fireEvent.click(palette(container, "Resistenza"))
    fireEvent.click(hole(container, "bb1:d12"))
    expect(notice(container)).toContain("occupato")
    expect(count(container)).toBe("1")
  })

  it("'riparti dal manuale' persiste l'azzeramento dei piazzamenti", () => {
    const persist = vi.fn()
    const container = mountSim({
      persist,
      state: {
        kind: "simulation-scene-v1",
        scene: createReferenceSimulationScene(),
        montaggio: {
          placements: [{ id: "r-libero-1", type: "resistor", holes: ["bb1:c3", "bb1:c4"] }],
        },
      },
    })
    expect(count(container)).toBe("1")

    const reset = container.querySelector("[data-montaggio-canvas-reset]")
    if (reset === null) throw new Error("reset non trovato")
    fireEvent.click(reset)

    expect(count(container)).toBe("0")
    expect(persist).toHaveBeenCalledTimes(1)
    const [, state] = persist.mock.calls[0] as [string, Record<string, unknown>]
    expect(state.montaggio).toEqual({ placements: [], operations: [] })
  })

  it("senza host il tap-tap resta funzionante (fail-soft slice 3)", () => {
    const container = mountSim()
    fireEvent.click(palette(container, "LED"))
    fireEvent.click(hole(container, "bb1:d12"))
    fireEvent.click(hole(container, "bb1:d13"))
    expect(count(container)).toBe("1")
  })
})

describe("persistEmbedState — write-back host-side in scena (caps/board)", () => {
  class MemoryAuditStore implements AuditStore {
    files = new Map<string, Blob>()

    async read(path: string): Promise<Blob | null> {
      return this.files.get(path) ?? null
    }

    async write(path: string, data: Blob): Promise<void> {
      this.files.set(path, data)
    }
  }

  function makeApi(elements: Array<Record<string, unknown>>) {
    const updateScene = vi.fn()
    return {
      api: {
        getSceneElements: () => elements as never,
        getAppState: () => ({ selectedElementIds: {} }),
        updateScene,
      },
      updateScene,
    }
  }

  it("aggiorna lo state del PROPRIO embed preservando l'owner", () => {
    const embed = {
      id: "embed-1",
      customData: { [EMBED_DATA_KEY]: { owner: "io.ardesia.simulation-plugin", state: { a: 1 } } },
    }
    const { api, updateScene } = makeApi([embed])

    persistEmbedState(api, "embed-1", { a: 2 })

    expect(updateScene).toHaveBeenCalledTimes(1)
    const next = updateScene.mock.calls[0][0].elements.find(
      (el: { id: string }) => el.id === "embed-1",
    )
    expect(next.customData[EMBED_DATA_KEY]).toEqual({
      owner: "io.ardesia.simulation-plugin",
      state: { a: 2 },
    })
  })

  it("audit rigettato dopo board.write riuscita: il commit resta, e la perdita e' OSSERVABILE", async () => {
    const owner = "io.ardesia.simulation"
    const embed = {
      id: "embed-1",
      customData: { [EMBED_DATA_KEY]: { owner, state: { a: 1 } } },
    }
    const { api, updateScene } = makeApi([embed])

    // Store il cui write fallisce SOLO sul path dell'audit: board.write e'
    // gia' committato quando l'append rigetta. E' lo scenario che la policy
    // fail-soft dichiara di gestire.
    class RejectingAuditStore extends MemoryAuditStore {
      override async write(path: string, data: Blob): Promise<void> {
        if (path.endsWith("/audit.jsonl")) {
          throw new Error("quota exceeded")
        }
        return super.write(path, data)
      }
    }
    const store = new RejectingAuditStore()

    // fail-soft: la mutazione della board NON viene riclassificata come reject
    await expect(
      persistEmbedStateThroughToolHost(api, store, "embed-1", { a: 2 }, { toolId: owner, now: () => 123 }),
    ).resolves.toBe(true)
    expect(updateScene).toHaveBeenCalledTimes(1)

    // il file non contiene la riga: e' andata persa davvero
    await expect(readAuditLog(store, owner)).resolves.toEqual({ entries: [], malformed: 0 })

    // ...e la perdita deve lasciare ESATTAMENTE un segnale. Senza questa riga
    // «fail-soft» non e' una policy: e' un buco, indistinguibile dal successo.
    expect(auditDropCount(store, owner)).toBe(1)
  })

  it("elemento NON marcato (disegno del docente) o assente: no-op, mai scrittura", () => {
    const drawing = { id: "draw-1", customData: {} }
    const { api, updateScene } = makeApi([drawing])

    persistEmbedState(api, "draw-1", { hack: true })
    persistEmbedState(api, "missing", { hack: true })

    expect(updateScene).not.toHaveBeenCalled()
  })

  it("puo' aggiornare lo state attraversando board.write ToolHost e audit", async () => {
    const owner = "io.ardesia.simulation"
    const embed = {
      id: "embed-1",
      customData: { [EMBED_DATA_KEY]: { owner, state: { a: 1 } } },
    }
    const { api, updateScene } = makeApi([embed])
    const store = new MemoryAuditStore()

    await expect(
      persistEmbedStateThroughToolHost(api, store, "embed-1", { a: 2 }, { toolId: owner, now: () => 123 }),
    ).resolves.toBe(true)

    expect(updateScene).toHaveBeenCalledTimes(1)
    const next = updateScene.mock.calls[0][0].elements.find(
      (el: { id: string }) => el.id === "embed-1",
    )
    expect(next.customData[EMBED_DATA_KEY]).toEqual({
      owner,
      state: { a: 2 },
    })
    await expect(readAuditLog(store, owner)).resolves.toEqual({
      entries: [{ v: 1, t: 123, tool: owner, method: "board.write", outcome: "ok" }],
      malformed: 0,
    })
    // Controllo negativo del contatore di drop: senza questa riga il test
    // «la perdita e' osservabile» resterebbe verde anche con un contatore
    // sempre acceso, che non distinguerebbe nulla.
    expect(auditDropCount(store, owner)).toBe(0)
  })

  it("un audit sink fallito non trasforma un board.write gia' committato in reject", async () => {
    const owner = "io.ardesia.simulation"
    const embed = {
      id: "embed-1",
      customData: { [EMBED_DATA_KEY]: { owner, state: { a: 1 } } },
    }
    const { api, updateScene } = makeApi([embed])
    const failingAuditStore: AuditStore = {
      read: async () => null,
      write: async () => {
        throw new Error("injected audit failure")
      },
    }

    await expect(
      persistEmbedStateThroughToolHost(
        api,
        failingAuditStore,
        "embed-1",
        { a: 2 },
        { toolId: owner },
      ),
    ).resolves.toBe(true)

    expect(updateScene).toHaveBeenCalledTimes(1)
    const next = updateScene.mock.calls[0][0].elements.find(
      (element: { id: string }) => element.id === "embed-1",
    )
    expect(next.customData[EMBED_DATA_KEY]).toEqual({
      owner,
      state: { a: 2 },
    })
  })

  it("break-connections passa dal write-back governato e produce audit board.write", async () => {
    const owner = "io.ardesia.simulation"
    const element = createToolEmbedElement()
    let elements: BoardElementLike[] = [element as BoardElementLike]
    const api = {
      getSceneElements: () => elements,
      getAppState: () => ({ selectedElementIds: {} }),
      updateScene: (scene: { elements: BoardElementLike[] }) => {
        elements = scene.elements
      },
    }
    const store = new MemoryAuditStore()
    const view = renderToolCanvasEmbeddable(element as never, {
      persistEmbedState: (embedId, state) => {
        void persistEmbedStateThroughToolHost(api, store, embedId, state, {
          toolId: owner,
          now: () => 456,
        })
      },
    })
    if (view === null) throw new Error("embeddable non renderizzato")
    const container = render(view).container
    const breakButton = container.querySelector("[data-sim-break]")
    if (breakButton === null) throw new Error("break button non trovato")

    fireEvent.click(breakButton)

    await waitFor(async () => {
      const audit = await readAuditLog(store, owner)
      expect(audit.entries).toEqual([
        { v: 1, t: 456, tool: owner, method: "board.write", outcome: "ok" },
      ])
    })
    const marker = elements[0]?.customData?.[EMBED_DATA_KEY] as { owner: string; state: { scene: { connections: unknown[] } } }
    expect(marker.owner).toBe(owner)
    expect(marker.state.scene.connections).toEqual([])
  })

  it("rifiuta un write-back quando il caller non possiede l'embed", async () => {
    const embed = {
      id: "embed-1",
      customData: { [EMBED_DATA_KEY]: { owner: "io.ardesia.simulation", state: { a: 1 } } },
    }
    const { api, updateScene } = makeApi([embed])
    const store = new MemoryAuditStore()

    await expect(
      persistEmbedStateThroughToolHost(api, store, "embed-1", { a: 2 }, { toolId: "io.ardesia.other" }),
    ).resolves.toBe(false)

    expect(updateScene).not.toHaveBeenCalled()
    await expect(readAuditLog(store, "io.ardesia.other")).resolves.toEqual({
      entries: [
        {
          v: 1,
          t: expect.any(Number),
          tool: "io.ardesia.other",
          method: "board.write",
          outcome: "denied",
          code: ERR.CAPABILITY_DENIED,
        },
      ],
      malformed: 0,
    })
  })

  it("segnala a Room un write-back governato negato", async () => {
    const embed = {
      id: "embed-1",
      customData: { [EMBED_DATA_KEY]: { owner: "io.ardesia.simulation", state: { a: 1 } } },
    }
    const { api, updateScene } = makeApi([embed])
    const store = new MemoryAuditStore()
    const reportError = vi.fn()

    await persistRoomEmbedStateThroughToolHost(
      api,
      store,
      "embed-1",
      { a: 2 },
      "io.ardesia.other",
      reportError,
    )

    expect(updateScene).not.toHaveBeenCalled()
    expect(reportError).toHaveBeenCalledWith("Write-back ToolHost fallito: richiesta negata")
  })

  it("serializza audit concorrenti sullo stesso tool/store", async () => {
    const owner = "io.ardesia.simulation"
    const embed = {
      id: "embed-1",
      customData: { [EMBED_DATA_KEY]: { owner, state: { a: 1 } } },
    }
    const { api } = makeApi([embed])
    const store = new MemoryAuditStore()
    let t = 1

    await Promise.all([
      persistEmbedStateThroughToolHost(api, store, "embed-1", { a: 2 }, { toolId: owner, now: () => t++ }),
      persistEmbedStateThroughToolHost(api, store, "embed-1", { a: 3 }, { toolId: owner, now: () => t++ }),
    ])

    const audit = await readAuditLog(store, owner)
    expect(audit).toEqual({
      entries: [
        { v: 1, t: 1, tool: owner, method: "board.write", outcome: "ok" },
        { v: 1, t: 2, tool: owner, method: "board.write", outcome: "ok" },
      ],
      malformed: 0,
    })
  })
})
