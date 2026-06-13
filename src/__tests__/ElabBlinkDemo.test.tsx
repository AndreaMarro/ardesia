// @vitest-environment jsdom
//
// S-DESIGN-10 — demo ELAB Sim sulla lavagna: verifica che gli helper della
// superficie demo (manifest, board adapter, skeleton) reggano un mount REALE
// del tool via ToolHost, con board.write che deposita l'embed LED marcato.
// Non testa entry.html (già coperto da ToolElabSim*.test): testa il wiring che
// ElabBlinkDemo.tsx aggiunge sopra la ToolHost di produzione.

import { describe, it, expect, afterEach, vi } from "vitest"

// Excalidraw importa moduli che esplodono in jsdom (ImageExportDialog) e non
// serve il render reale qui: stub del componente + convert pass-through che
// preserva type/props (così makeLedSkeleton resta verificabile). Stesso pattern
// del mock in Room.integration.test. La conversione vera è esercitata dal build
// reale e dallo screenshot (npm run shots) in ST2.
vi.mock("@excalidraw/excalidraw", () => ({
  Excalidraw: () => null,
  convertToExcalidrawElements: (skeletons: Array<Record<string, unknown>>) =>
    skeletons.map((s, i) => ({ ...s, id: (s.id as string) ?? `gen-${i}` })),
  FONT_FAMILY: { Nunito: 6 },
}))
vi.mock("@excalidraw/excalidraw/index.css", () => ({}))

import { ToolHost } from "../toolhost/host.ts"
import { embedOwner, type BoardElementLike } from "../toolhost/caps/board.ts"
import {
  DEMO_EMBED_ID,
  DEMO_GRANTED_CAPS,
  loadElabManifest,
  makeLedSkeleton,
  boardAdapter,
} from "../design/ElabBlinkDemo.tsx"
import { isElabBlinkDemo } from "../store/elabBlinkDemo.ts"

class TestBoardApi {
  elements: BoardElementLike[] = []
  selected: Record<string, boolean> = {}
  getSceneElements(): readonly BoardElementLike[] {
    return this.elements
  }
  getAppState(): { selectedElementIds: Record<string, boolean> } {
    return { selectedElementIds: this.selected }
  }
  updateScene(scene: { elements: BoardElementLike[] }): void {
    this.elements = [...scene.elements]
  }
}

class MemStore {
  files = new Map<string, Blob>()
  async read(p: string): Promise<Blob | null> {
    return this.files.get(p) ?? null
  }
  async write(p: string, d: Blob): Promise<void> {
    this.files.set(p, d)
  }
  async delete(p: string): Promise<void> {
    this.files.delete(p)
  }
  async list(prefix?: string) {
    return [...this.files.entries()]
      .filter(([k]) => prefix === undefined || k.startsWith(prefix))
      .map(([path, data]) => ({ path, data }))
  }
}

async function readyOnPort(host: ToolHost, port2: MessagePort): Promise<void> {
  const session = host.session!
  port2.postMessage({
    jsonrpc: "2.0",
    id: "ready",
    method: "tool.ready",
    params: { nonce: session.hello.params.nonce, protocolVersion: "1.0.0" },
  })
  await session.ready
  await new Promise((r) => setTimeout(r, 10))
}

describe("S-DESIGN-10 ElabBlinkDemo helpers", () => {
  it("loadElabManifest parsa il manifest reale del tool Blink", () => {
    const m = loadElabManifest()
    expect(m.id).toBe("io.maestro.sim-elab-blink")
    expect(m.entry).toBe("entry.html")
    expect(m.capabilities["board.write"]).toEqual({ scope: "own-embeds" })
  })

  it("makeLedSkeleton produce un elemento con l'id richiesto (non l'id stock)", () => {
    const el = makeLedSkeleton("custom-embed-xyz")
    expect(el.id).toBe("custom-embed-xyz")
    // È un elemento Excalidraw reale (convertToExcalidrawElements), non uno stub.
    expect(el.type).toBe("rectangle")
  })

  it("boardAdapter inoltra updateScene all'API sottostante", () => {
    const api = new TestBoardApi()
    const adapter = boardAdapter(api)
    adapter.updateScene({ elements: [{ id: "a" }] })
    expect(api.elements).toEqual([{ id: "a" }])
    // selectedElementIds assente → {} (non crasha board.read selection)
    expect(adapter.getAppState().selectedElementIds).toEqual({})
  })

  it("mount via ToolHost + board.write deposita l'embed LED marcato dall'owner", async () => {
    const api = new TestBoardApi()
    const host = new ToolHost(loadElabManifest(), DEMO_GRANTED_CAPS, {
      store: new MemStore(),
      board: boardAdapter(api),
      makeSkeleton: makeLedSkeleton,
    })
    const { port1, port2 } = new MessageChannel()
    host.mount(port1)
    await readyOnPort(host, port2)

    port2.postMessage({
      jsonrpc: "2.0",
      id: "bw-1",
      method: "board.write",
      params: { embedId: DEMO_EMBED_ID, state: { ledOn: true, label: "LED1" } },
    })
    await new Promise((r) => setTimeout(r, 30))

    const embed = api.elements.find((el) => el.id === DEMO_EMBED_ID)
    expect(embed).toBeDefined()
    expect(embedOwner(embed!)).toBe("io.maestro.sim-elab-blink")
    const marker = embed!.customData!["maestroTool"] as { state?: { ledOn?: boolean } }
    expect(marker.state?.ledOn).toBe(true)
    // lo skeleton custom (rettangolo) è stato usato, non il default embeddable
    expect(embed!.type).toBe("rectangle")

    port2.close()
  })

  it("board.write NON può sovrascrivere un elemento del docente (own-embeds)", async () => {
    const api = new TestBoardApi()
    // disegno del docente già sulla lavagna, NON marcato come tool
    api.elements = [{ id: "docente-stroke", type: "freedraw" }]
    const host = new ToolHost(loadElabManifest(), DEMO_GRANTED_CAPS, {
      store: new MemStore(),
      board: boardAdapter(api),
      makeSkeleton: makeLedSkeleton,
    })
    const { port1, port2 } = new MessageChannel()
    host.mount(port1)
    await readyOnPort(host, port2)

    // Cattura la risposta a bw-evil: il deny deve essere ESPLICITO (error code
    // CAPABILITY_DENIED), non un no-op silenzioso — così se isOwnEmbed regredisse
    // a "scrive ma non muta" il test fallirebbe lo stesso.
    const denied = new Promise<{ error?: { code: number } }>((resolve) => {
      port2.addEventListener("message", (e: MessageEvent) => {
        const msg = e.data as { id?: string; error?: { code: number } }
        if (msg.id === "bw-evil") resolve(msg)
      })
      port2.start()
    })

    port2.postMessage({
      jsonrpc: "2.0",
      id: "bw-evil",
      method: "board.write",
      params: { embedId: "docente-stroke", state: { hijacked: true } },
    })

    const resp = await denied
    expect(resp.error?.code).toBe(-32001) // ERR.CAPABILITY_DENIED

    const el = api.elements.find((e) => e.id === "docente-stroke")!
    expect(el.customData).toBeUndefined()
    expect(el.type).toBe("freedraw")
    port2.close()
  })
})

describe("S-DESIGN-10 isElabBlinkDemo", () => {
  const realHref = window.location.href
  function setHref(href: string) {
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: new URL(href),
    })
  }
  afterEach(() => setHref(realHref))

  it("true solo con ?demo=elab-blink", () => {
    setHref("http://localhost/?demo=elab-blink#room1")
    expect(isElabBlinkDemo()).toBe(true)
  })
  it("false senza il parametro o con valore diverso", () => {
    setHref("http://localhost/#room1")
    expect(isElabBlinkDemo()).toBe(false)
    setHref("http://localhost/?demo=altro")
    expect(isElabBlinkDemo()).toBe(false)
    setHref("http://localhost/?vista=studente")
    expect(isElabBlinkDemo()).toBe(false)
  })
})
