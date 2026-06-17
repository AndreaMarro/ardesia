// @vitest-environment node
//
// T4 ST2 — Reference Sim tool: ToolHost runtime + handshake + board.read/write caps.
// Verifica che il tool possa essere montato col ToolHost, che l'handshake
// (host.hello → tool.ready → ready ack) funzioni, e che le capability
// board.read/write siano attive e correttamente instradate.

import { describe, expect, it, beforeEach } from "vitest"
import { ToolHost } from "../toolhost/host.ts"
import { ToolManifestSchema } from "../toolhost-protocol/index.ts"
import type { BoardElementLike } from "../toolhost/caps/board.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { StorageDriverLike } from "../toolhost/caps/storage.ts"
import * as fs from "node:fs"
import * as path from "node:path"

// ---------- harness ----------

class TestStore implements StorageDriverLike, AuditStore {
  files = new Map<string, Blob>()
  async read(p: string): Promise<Blob | null> { return this.files.get(p) ?? null }
  async write(p: string, d: Blob): Promise<void> { this.files.set(p, d) }
  async delete(p: string): Promise<void> { this.files.delete(p) }
  async list(prefix?: string): Promise<{ path: string; data: Blob }[]> {
    return [...this.files.entries()]
      .filter(([p]) => prefix === undefined || p.startsWith(prefix))
      .map(([path, data]) => ({ path, data }))
  }
}

class TestBoard {
  elements: BoardElementLike[] = []
  selected: Record<string, boolean> = {}

  getSceneElements(): readonly BoardElementLike[] { return this.elements }
  getAppState(): { selectedElementIds: Record<string, boolean> } {
    return { selectedElementIds: this.selected }
  }
  updateScene(scene: { elements: BoardElementLike[] }): void {
    this.elements = [...scene.elements]
  }
}

const SIM_DIR = path.resolve(import.meta.dirname, "../../sim")
const MANIFEST_SRC = fs.readFileSync(path.join(SIM_DIR, "manifest-source.json"), "utf-8")

const REFERENCE_MANIFEST = ToolManifestSchema.parse(JSON.parse(MANIFEST_SRC))

const GRANTED_CAPS = {
  "board.read": {},
  "board.write": { scope: "own-embeds" as const },
}

// ---------- tests ----------

describe("T4 ST2 — ToolHost runtime + handshake", () => {
  let store: TestStore
  let board: TestBoard
  let host: ToolHost

  beforeEach(() => {
    store = new TestStore()
    board = new TestBoard()
    host = new ToolHost(REFERENCE_MANIFEST, GRANTED_CAPS, {
      store,
      board,
      now: () => 1000,
    })
  })

  it("ToolHost creato con manifest Reference → audit log inizializzato", () => {
    expect(host.manifest.id).toBe("io.maestro.sim-reference-blink")
    expect(host.manifest.name).toBe("Reference Sim — Blink LED")
    expect(host.audit).toBeDefined()
    expect(host.session).toBeNull()
  })

  it("mount → session attiva con hello corretto", () => {
    const { port1, port2 } = new MessageChannel()
    const session = host.mount(port1)

    expect(host.session).toBe(session)
    expect(session.hello.jsonrpc).toBe("2.0")
    expect(session.hello.method).toBe("host.hello")
    expect(session.hello.params.grantedCaps["board.read"]).toBeDefined()
    expect(session.hello.params.grantedCaps["board.write"]).toBeDefined()
    expect(session.hello.params.nonce.length).toBeGreaterThanOrEqual(16)
    expect(session.hello.params.protocolVersion).toBeDefined()

    port2.close()
  })

  it("handshake completo: tool.ready → ready ack con bearerToken", async () => {
    const { port1, port2 } = new MessageChannel()
    const session = host.mount(port1)

    // Colleziona messaggi da port2
    const messages: unknown[] = []
    port2.addEventListener("message", (ev) => { messages.push(ev.data) })
    port2.start()

    // Simula tool.ready
    const readyId = "test-ready-1"
    port2.postMessage({
      jsonrpc: "2.0",
      id: readyId,
      method: "tool.ready",
      params: {
        nonce: session.hello.params.nonce,
        protocolVersion: "1.0.0",
      },
    })

    // Aspetta che il messaggio venga processato
    await session.ready

    // Cedi il ciclo eventi per far arrivare la response su port2
    await new Promise((r) => setTimeout(r, 10))

    // Ora port2 dovrebbe aver ricevuto il ready ack
    expect(messages.length).toBeGreaterThanOrEqual(1)

    const ack = messages.find(
      (m: unknown) =>
        typeof m === "object" && m !== null &&
        (m as Record<string, unknown>).id === readyId,
    ) as Record<string, unknown> | undefined

    expect(ack).toBeDefined()
    expect(ack!.jsonrpc).toBe("2.0")
    const result = ack!.result as Record<string, unknown> | undefined
    expect(result).toBeDefined()
    expect(result!.bearerToken).toBeDefined()
    expect(typeof result!.bearerToken).toBe("string")
    expect(result!.bearerToken).toBeTruthy()
    expect(result!.grantedCaps).toBeDefined()

    port2.close()
  })

  it("handshake fallisce con nonce sbagliato", async () => {
    const { port1, port2 } = new MessageChannel()
    const session = host.mount(port1)

    const messages: unknown[] = []
    port2.addEventListener("message", (ev) => { messages.push(ev.data) })
    port2.start()

    // tool.ready con nonce SBAGLIATO
    port2.postMessage({
      jsonrpc: "2.0",
      id: "bad-nonce",
      method: "tool.ready",
      params: { nonce: "wrong-nonce-12345678", protocolVersion: "1.0.0" },
    })

    await expect(session.ready).rejects.toThrow(/nonce mismatch/)

    // Verifica errore sul port2
    await new Promise((r) => setTimeout(r, 50))
    const errMsg = messages.find(
      (m: unknown) =>
        typeof m === "object" && m !== null &&
        (m as Record<string, unknown>).id === "bad-nonce",
    ) as Record<string, unknown> | undefined
    expect(errMsg).toBeDefined()
    expect((errMsg as Record<string, unknown>).error).toBeDefined()
  })

  it("unmount → session si chiude", () => {
    const { port1 } = new MessageChannel()
    host.mount(port1)

    expect(host.session).not.toBeNull()

    host.unmount()
    expect(host.session).toBeNull()
  })
})

describe("T4 ST2 — board.read/write caps con Reference Sim", () => {
  let store: TestStore
  let board: TestBoard
  let host: ToolHost

  beforeEach(() => {
    store = new TestStore()
    board = new TestBoard()
    host = new ToolHost(REFERENCE_MANIFEST, GRANTED_CAPS, {
      store,
      board,
      now: () => 1000,
    })
  })

  async function readySession(host: ToolHost, port2: MessagePort): Promise<void> {
    const session = host.session!
    port2.postMessage({
      jsonrpc: "2.0",
      id: "ready",
      method: "tool.ready",
      params: { nonce: session.hello.params.nonce, protocolVersion: "1.0.0" },
    })
    await session.ready
  }

  it("board.read scena vuota → elements vuoto", async () => {
    const { port1, port2 } = new MessageChannel()
    host.mount(port1)

    const responses: unknown[] = []
    port2.addEventListener("message", (ev) => { responses.push(ev.data) })
    port2.start()

    await readySession(host, port2)

    // board.read
    port2.postMessage({
      jsonrpc: "2.0",
      id: "br-1",
      method: "board.read",
      params: { target: "scene" },
    })

    await new Promise((r) => setTimeout(r, 50))

    const resp = responses.find(
      (m: unknown) =>
        typeof m === "object" && m !== null &&
        (m as Record<string, unknown>).id === "br-1",
    ) as Record<string, unknown> | undefined

    expect(resp).toBeDefined()
    const result = resp!.result as { elements?: unknown[] } | undefined
    expect(result).toBeDefined()
    expect(result!.elements).toEqual([])

    port2.close()
  })

  it("board.write crea embed → board.read lo restituisce", async () => {
    const { port1, port2 } = new MessageChannel()
    host.mount(port1)

    const responses: unknown[] = []
    port2.addEventListener("message", (ev) => { responses.push(ev.data) })
    port2.start()

    await readySession(host, port2)

    // board.write: crea un embed
    port2.postMessage({
      jsonrpc: "2.0",
      id: "bw-1",
      method: "board.write",
      params: { embedId: "reference-blink-led-1", state: { ledOn: true, ts: 1000 } },
    })

    await new Promise((r) => setTimeout(r, 50))

    // Verifica che l'embed sia stato creato sulla board
    expect(board.elements.length).toBeGreaterThanOrEqual(1)
    const embed = board.elements.find((el) => el.id === "reference-blink-led-1")
    expect(embed).toBeDefined()
    expect(embed!.customData?.["maestroTool"]).toBeDefined()
    const marker = embed!.customData!["maestroTool"] as Record<string, unknown>
    expect(marker.owner).toBe("io.maestro.sim-reference-blink")

    // board.read: verifica che l'embed sia nella scena
    port2.postMessage({
      jsonrpc: "2.0",
      id: "br-2",
      method: "board.read",
      params: { target: "scene" },
    })

    await new Promise((r) => setTimeout(r, 50))

    const readResp = responses.find(
      (m: unknown) =>
        typeof m === "object" && m !== null &&
        (m as Record<string, unknown>).id === "br-2",
    ) as Record<string, unknown> | undefined

    expect(readResp).toBeDefined()
    const readResult = readResp!.result as { elements?: unknown[] } | undefined
    expect(readResult).toBeDefined()
    expect(readResult!.elements!.length).toBeGreaterThanOrEqual(1)

    port2.close()
  })

  it("board.write aggiorna embed esistente (stesso owner)", async () => {
    const { port1, port2 } = new MessageChannel()
    host.mount(port1)

    const responses: unknown[] = []
    port2.addEventListener("message", (ev) => { responses.push(ev.data) })
    port2.start()

    await readySession(host, port2)

    // Crea
    port2.postMessage({
      jsonrpc: "2.0",
      id: "bw-1",
      method: "board.write",
      params: { embedId: "reference-blink-led-1", state: { ledOn: false, ts: 1000 } },
    })

    await new Promise((r) => setTimeout(r, 50))

    // Aggiorna
    port2.postMessage({
      jsonrpc: "2.0",
      id: "bw-2",
      method: "board.write",
      params: { embedId: "reference-blink-led-1", state: { ledOn: true, ts: 2000 } },
    })

    await new Promise((r) => setTimeout(r, 50))

    // Verifica stato aggiornato
    const embed = board.elements.find((el) => el.id === "reference-blink-led-1")
    expect(embed).toBeDefined()
    const marker = embed!.customData!["maestroTool"] as Record<string, unknown>
    const state = marker.state as { ledOn?: boolean; ts?: number }
    expect(state.ledOn).toBe(true)
    expect(state.ts).toBe(2000)

    port2.close()
  })
})
