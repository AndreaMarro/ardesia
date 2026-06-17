// @vitest-environment node
//
// SECONDO plugin di riferimento ("Contorno lavagna"): stress del contratto SDK
// Layer-0 su una coppia di capability DIVERSA dal primo (Arduino Blink usa
// board.read + board.write). Qui: board.read + `ui`, SOLA LETTURA.
//   1. modello puro (outline.ts): sommario deterministico + rendering pannello;
//   2. handshake multi-capability: grantedCaps contiene board.read E ui, NON board.write;
//   3. board.read reale (due target: scene + selection) → contorno corretto;
//   4. `ui` gate il pannello: adattivo con ui, fallback inerte senza ui;
//   5. `ui` è capability dichiarabile MA senza metodo wire (by contract) → inerte in v0;
//   6. least-privilege: board.write NON concessa → CAPABILITY_DENIED al wire;
//   7. lifecycle: lo stato UI del pannello sopravvive a suspend/restore;
//   8. audit: solo board.read (zero write — l'ispettore non scrive mai).
// Tutto guidato dal plugin REALE (plugins/outline/main.ts) via SDK reale +
// MessageChannel, contro la ToolHost reale.
import { afterEach, describe, expect, it } from "vitest"
import { start } from "../../plugins/outline/main.ts"
import { manifest as outlineManifest } from "../../plugins/outline/manifest.ts"
import {
  DEFAULT_PANEL_STATE,
  EMPTY_OUTLINE,
  flipExpanded,
  flipView,
  isPanelState,
  renderPanel,
  summarize,
} from "../../plugins/outline/outline.ts"
import { ToolHost, statePath } from "../toolhost/host.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import { readAuditLog } from "../toolhost/audit.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import { resolveGrant } from "../toolhost/policy.ts"
import { CONTRACT, ERR } from "../sdk/index.ts"
import type { Capabilities, CapabilityName, WindowLike } from "../sdk/index.ts"

class MemoryWorkspace implements StorageDriverLike, AuditStore {
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

class FakeBoard implements BoardApiLike {
  elements: BoardElementLike[] = []
  selected: Record<string, boolean> = {}
  getSceneElements(): readonly BoardElementLike[] {
    return this.elements
  }
  getAppState(): { selectedElementIds: Record<string, boolean> } {
    return { selectedElementIds: this.selected }
  }
  updateScene(scene: { elements: BoardElementLike[] }): void {
    this.elements = scene.elements
  }
}

class FakeToolWindow implements WindowLike {
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

const openChannels: MessageChannel[] = []
afterEach(() => {
  for (const ch of openChannels.splice(0)) {
    ch.port1.close()
    ch.port2.close()
  }
})

interface Harness {
  host: ToolHost
  session: ReturnType<ToolHost["mount"]>
  plugin: Awaited<ReturnType<typeof start>>
}

/**
 * Monta il reference plugin reale. `grant` di default = resolveGrant(board.read)
 * (la policy inietta sempre `ui`); passa `grant` esplicito per scenari di degrado.
 */
async function mount(
  board: FakeBoard,
  store: MemoryWorkspace,
  opts: { grant?: Capabilities; now?: () => number } = {},
): Promise<Harness> {
  const grant = opts.grant ?? resolveGrant(outlineManifest, ["board.read"] as CapabilityName[])
  const host = new ToolHost(outlineManifest, grant, { store, board, now: opts.now })
  const ch = new MessageChannel()
  openChannels.push(ch)
  const session = host.mount(ch.port1)
  const win = new FakeToolWindow()
  const pluginPromise = start({ windowRef: win })
  win.deliver(session.hello, [ch.port2])
  return { host, session, plugin: await pluginPromise }
}

/** Scena di prova: 4 elementi (2 rectangle, 1 ellipse, 1 text), 2 selezionati. */
function seedBoard(board: FakeBoard): void {
  board.elements = [
    { id: "a", type: "rectangle" },
    { id: "b", type: "rectangle" },
    { id: "c", type: "ellipse" },
    { id: "d", type: "text" },
  ]
  board.selected = { b: true, c: true }
}

describe("outline.ts — modello puro", () => {
  it("summarize conta totale, selezione e per-tipo con chiavi ORDINATE", () => {
    const scene = [
      { type: "text" },
      { type: "rectangle" },
      { type: "ellipse" },
      { type: "rectangle" },
    ]
    const out = summarize(scene, [{ type: "rectangle" }])
    expect(out.total).toBe(4)
    expect(out.selected).toBe(1)
    expect(out.byType).toEqual({ ellipse: 1, rectangle: 2, text: 1 })
    // ordine delle chiavi indipendente dall'ordine di scansione
    expect(Object.keys(out.byType)).toEqual(["ellipse", "rectangle", "text"])
  })

  it("summarize bucketizza elementi senza type-stringa come 'unknown'", () => {
    const out = summarize([{ type: "rectangle" }, {}, { type: 7 }, null, "x"], [])
    expect(out.byType).toEqual({ rectangle: 1, unknown: 4 })
    expect(out.total).toBe(5)
  })

  it("renderPanel con ui: vista summary rispetta expanded", () => {
    const out = summarize(seedScene(), [{ type: "rectangle" }, { type: "ellipse" }])
    const collapsed = renderPanel(out, DEFAULT_PANEL_STATE, true)
    expect(collapsed.adaptive).toBe(true)
    expect(collapsed.lines).toEqual(["Totale: 4", "Selezionati: 2"])
    const expanded = renderPanel(out, flipExpanded(DEFAULT_PANEL_STATE), true)
    expect(expanded.lines).toEqual(["Totale: 4", "Selezionati: 2", "ellipse: 1", "rectangle: 2", "text: 1"])
  })

  it("renderPanel con ui: vista byType elenca i tipi ordinati", () => {
    const out = summarize(seedScene(), [])
    const byType = renderPanel(out, flipView(DEFAULT_PANEL_STATE), true)
    expect(byType.adaptive).toBe(true)
    expect(byType.lines).toEqual(["Totale: 4", "ellipse: 1", "rectangle: 2", "text: 1"])
  })

  it("renderPanel senza ui: fallback inerte di una riga, ignora view/expanded", () => {
    const out = summarize(seedScene(), [{ type: "rectangle" }])
    const richState = flipExpanded(flipView(DEFAULT_PANEL_STATE))
    const fb = renderPanel(out, richState, false)
    expect(fb.adaptive).toBe(false)
    expect(fb.lines).toEqual(["4 elementi, 1 selezionati"])
  })

  it("scena vuota: byType placeholder, fallback coerente", () => {
    expect(renderPanel(EMPTY_OUTLINE, flipView(DEFAULT_PANEL_STATE), true).lines).toEqual([
      "Totale: 0",
      "(nessun elemento)",
    ])
    expect(renderPanel(EMPTY_OUTLINE, DEFAULT_PANEL_STATE, false).lines).toEqual(["0 elementi, 0 selezionati"])
  })

  it("isPanelState accetta solo stati ben formati", () => {
    expect(isPanelState({ v: 1, view: "byType", expanded: true })).toBe(true)
    expect(isPanelState({ v: 1, view: "summary", expanded: false })).toBe(true)
    expect(isPanelState({ v: 2, view: "summary", expanded: false })).toBe(false)
    expect(isPanelState({ v: 1, view: "grid", expanded: false })).toBe(false)
    expect(isPanelState({ v: 1, view: "summary", expanded: "yes" })).toBe(false)
    expect(isPanelState(null)).toBe(false)
  })
})

function seedScene(): unknown[] {
  return [{ type: "rectangle" }, { type: "rectangle" }, { type: "ellipse" }, { type: "text" }]
}

describe("plugin-outline — board.read + ui via ToolHost reale", () => {
  it("handshake multi-capability: grantedCaps ha board.read E ui, NON board.write", async () => {
    const board = new FakeBoard()
    seedBoard(board)
    const { plugin } = await mount(board, new MemoryWorkspace())
    const caps = plugin.conn.grantedCaps
    expect(caps["board.read"]).toBeDefined()
    expect(caps.ui).toBeDefined()
    expect(caps["board.write"]).toBeUndefined()
  })

  it("board.read (scene + selection) → contorno corretto della lavagna", async () => {
    const board = new FakeBoard()
    seedBoard(board)
    const { plugin } = await mount(board, new MemoryWorkspace())
    const out = plugin.outline()
    expect(out.total).toBe(4)
    expect(out.selected).toBe(2)
    expect(out.byType).toEqual({ ellipse: 1, rectangle: 2, text: 1 })
    // refresh ri-legge: cambiando selezione e ricalcolando, il contorno segue.
    board.selected = { a: true, b: true, c: true }
    const out2 = await plugin.refresh()
    expect(out2.selected).toBe(3)
  })

  it("ui concessa: pannello adattivo, i controlli mutano la vista", async () => {
    const board = new FakeBoard()
    seedBoard(board)
    const { plugin } = await mount(board, new MemoryWorkspace())
    expect(plugin.render()).toEqual({
      title: "Contorno lavagna",
      lines: ["Totale: 4", "Selezionati: 2"],
      adaptive: true,
    })
    expect(plugin.toggleExpanded()).toBe(true)
    expect(plugin.render().lines).toContain("rectangle: 2")
    expect(plugin.toggleView()).toBe(true)
    expect(plugin.render().lines).toEqual(["Totale: 4", "ellipse: 1", "rectangle: 2", "text: 1"])
  })

  it("grant senza ui (difensivo, non-v0): fallback inerte, controlli no-op", async () => {
    const board = new FakeBoard()
    seedBoard(board)
    // NOTA onesta: in v0 resolveGrant INIETTA SEMPRE `ui` (policy.ts:80), quindi un
    // grant senza ui NON è prodotto in produzione. Qui forziamo il grant a mano per
    // esercitare DIFENSIVAMENTE il ramo di degrado del modello (forward-looking se
    // una versione futura rendesse `ui` negabile) — non uno scenario operativo v0.
    const { plugin } = await mount(board, new MemoryWorkspace(), { grant: { "board.read": {} } })
    expect(plugin.conn.grantedCaps.ui).toBeUndefined()
    const view = plugin.render()
    expect(view.adaptive).toBe(false)
    expect(view.lines).toEqual(["4 elementi, 2 selezionati"])
    // i controlli UI sono inerti senza la capability
    expect(plugin.toggleView()).toBe(false)
    expect(plugin.toggleExpanded()).toBe(false)
    expect(plugin.render().lines).toEqual(["4 elementi, 2 selezionati"])
  })

  it("`ui` è capability dichiarabile ma SENZA metodo wire in v0 (inerte by contract)", async () => {
    // Invariante REALE del contratto (non l'assenza di una stringa qualsiasi): `ui`
    // è nel vocabolario capability MA nessun metodo wire è gated da `ui`. Aggiungere
    // un metodo ui.* a TOOL_METHODS romperebbe questa asserzione → decisione cosciente.
    expect(CONTRACT.capabilities).toContain("ui")
    expect(Object.values(CONTRACT.toolMethods)).not.toContain("ui")
    expect(Object.keys(CONTRACT.toolMethods).some((m) => m.startsWith("ui."))).toBe(false)
    // Corollario sul wire vivo: un plugin che ha `ui` concessa non raggiunge alcun
    // metodo ui.* (il method-lookup del router precede il cap-check → METHOD_NOT_FOUND).
    const board = new FakeBoard()
    seedBoard(board)
    const { plugin } = await mount(board, new MemoryWorkspace())
    expect(plugin.conn.grantedCaps.ui).toBeDefined()
    let err: { code?: number } | null = null
    await plugin.conn.call("ui.resize", { width: 200 }).catch((e: unknown) => {
      err = e as { code?: number }
    })
    expect(err).not.toBeNull()
    expect(err!.code).toBe(ERR.METHOD_NOT_FOUND)
  })

  it("least-privilege: board.write non concessa → CAPABILITY_DENIED", async () => {
    const board = new FakeBoard()
    seedBoard(board)
    const { plugin } = await mount(board, new MemoryWorkspace())
    let err: { code?: number } | null = null
    await plugin.conn
      .call("board.write", { embedId: "io.maestro.outline-ref:x", state: { foo: 1 } })
      .catch((e: unknown) => {
        err = e as { code?: number }
      })
    expect(err).not.toBeNull()
    expect(err!.code).toBe(ERR.CAPABILITY_DENIED)

    // Params MALFORMATI con cap negata: ancora CAPABILITY_DENIED (non INVALID_PARAMS).
    // Prova che il router gate la capability PRIMA di validare i params: un plugin
    // senza board.write non scopre nemmeno la forma attesa dei params.
    let err2: { code?: number } | null = null
    await plugin.conn.call("board.write", { garbage: true }).catch((e: unknown) => {
      err2 = e as { code?: number }
    })
    expect(err2!.code).toBe(ERR.CAPABILITY_DENIED)

    // l'ispettore non ha toccato la lavagna
    expect(board.elements).toHaveLength(4)
  })

  it("lifecycle: lo stato UI del pannello sopravvive a suspend/restore", async () => {
    const board = new FakeBoard()
    seedBoard(board)
    const store = new MemoryWorkspace()
    const a = await mount(board, store, { now: () => 1000 })
    // il docente passa a vista per-tipo + espansa
    a.plugin.toggleView()
    a.plugin.toggleExpanded()
    expect(a.plugin.render().lines[0]).toBe("Totale: 4")
    await a.host.suspend()
    expect(store.files.has(statePath(outlineManifest.id))).toBe(true)
    const doc = JSON.parse(await store.files.get(statePath(outlineManifest.id))!.text())
    expect(doc.state).toEqual({ v: 1, view: "byType", expanded: true })
    a.host.unmount()

    // nuovo mount: parte dal default, poi restore reidrata la vista per-tipo.
    const b = await mount(board, store)
    expect(b.plugin.render().lines).toEqual(["Totale: 4", "Selezionati: 2"]) // default summary
    expect(await b.host.restore()).toBe(true)
    expect(b.plugin.render().lines).toEqual(["Totale: 4", "ellipse: 1", "rectangle: 2", "text: 1"]) // byType
  })

  it("audit: solo board.read (due letture), zero write", async () => {
    const board = new FakeBoard()
    seedBoard(board)
    const store = new MemoryWorkspace()
    let t = 5000
    const { host } = await mount(board, store, { now: () => t++ })
    await host.audit.idle()
    const log = await readAuditLog(store, outlineManifest.id)
    expect(log.malformed).toBe(0)
    expect(log.entries.length).toBe(2)
    expect(log.entries.every((e) => e.method === "board.read")).toBe(true)
    expect(log.entries.every((e) => e.tool === outlineManifest.id)).toBe(true)
  })
})
