// @vitest-environment node
//
// T4 ST3 — Reference Sim Blink LED demo: install → mount → board.write embed →
// suspend/restore lifecycle. Verifica che il tool possa essere installato,
// montato, e interagire con la board in un flusso end-to-end.
//
// Integra:
// - installTool (da ST1/installer.ts)
// - ToolHost runtime (da ST2/host.ts)
// - board.write → embed visibile sulla board
// - suspend/restore → stato preservato

import { describe, expect, it, beforeEach } from "vitest"
import { ToolHost } from "../toolhost/host.ts"
import { installTool, isToolInstalled } from "../toolhost/installer.ts"
import type { InstallerStore } from "../toolhost/installer.ts"
import type { StorageEntryLike } from "../toolhost/caps/storage.ts"
import type { BoardElementLike } from "../toolhost/caps/board.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { StorageDriverLike } from "../toolhost/caps/storage.ts"
import * as fs from "node:fs"
import * as path from "node:path"

// ---------- harness (unificato) ----------

class FullStore implements InstallerStore, StorageDriverLike, AuditStore {
  files = new Map<string, Blob>()

  async read(p: string): Promise<Blob | null> { return this.files.get(p) ?? null }
  async write(p: string, d: Blob): Promise<void> { this.files.set(p, d) }
  async delete(p: string): Promise<void> { this.files.delete(p) }
  async list(prefix?: string): Promise<StorageEntryLike[]> {
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
const BUNDLE_BYTES = fs.readFileSync(path.join(SIM_DIR, "reference-blink.maestrotool"))

const GRANTED_CAPS = {
  "board.read": {},
  "board.write": { scope: "own-embeds" as const },
}

async function makeKeypair(): Promise<{ pubkeyB64: string; privateKey: CryptoKey }> {
  const kp = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"])
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey))
  return { pubkeyB64: btoa(String.fromCharCode(...raw)), privateKey: kp.privateKey }
}

async function signJson(s: string, key: CryptoKey): Promise<string> {
  const sig = new Uint8Array(await crypto.subtle.sign("Ed25519", key, new TextEncoder().encode(s)))
  return btoa(String.fromCharCode(...sig))
}

async function readySession(host: ToolHost, port2: MessagePort): Promise<void> {
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

// ---------- tests ----------

describe("T4 ST3 — Blink LED demo lifecycle", () => {
  let store: FullStore
  let board: TestBoard
  let host: ToolHost
  let manifestJson: string
  let signature: string
  let bundleZip: Blob

  beforeEach(async () => {
    store = new FullStore()
    board = new TestBoard()

    const { pubkeyB64, privateKey } = await makeKeypair()
    const obj = JSON.parse(MANIFEST_SRC)
    obj.publisher.pubkey = `ed25519:${pubkeyB64}`
    manifestJson = JSON.stringify(obj)
    signature = await signJson(manifestJson, privateKey)
    bundleZip = new Blob([BUNDLE_BYTES], { type: "application/zip" })
  })

  it("install → mount → board.write crea embed LED sulla board", async () => {
    // 1. Install
    const manifest = await installTool(store, manifestJson, bundleZip, signature, () => 1000)
    expect(manifest.id).toBe("io.maestro.sim-reference-blink")

    // 2. Mount
    host = new ToolHost(manifest, GRANTED_CAPS, { store, board, now: () => 2000 })
    const { port1, port2 } = new MessageChannel()
    host.mount(port1)

    // 3. Handshake
    await readySession(host, port2)

    // 4. Tool scrive un embed LED sulla board
    port2.postMessage({
      jsonrpc: "2.0",
      id: "bw-1",
      method: "board.write",
      params: {
        embedId: "reference-blink-led-1",
        state: { ledOn: true, ts: 2000, label: "LED1" },
      },
    })

    await new Promise((r) => setTimeout(r, 50))

    // 5. Verifica embed sulla board
    const embed = board.elements.find((el) => el.id === "reference-blink-led-1")
    expect(embed).toBeDefined()
    const marker = embed!.customData?.["maestroTool"] as Record<string, unknown> | undefined
    expect(marker).toBeDefined()
    expect(marker!.owner).toBe("io.maestro.sim-reference-blink")
    const state = marker!.state as { ledOn?: boolean; ts?: number; label?: string } | undefined
    expect(state).toBeDefined()
    expect(state!.ledOn).toBe(true)
    expect(state!.label).toBe("LED1")

    port2.close()
  })

  it("tool installato → isToolInstalled true → mount funziona", async () => {
    const manifest = await installTool(store, manifestJson, bundleZip, signature, () => 1000)

    expect(await isToolInstalled(store, "io.maestro.sim-reference-blink")).toBe(true)

    host = new ToolHost(manifest, GRANTED_CAPS, { store, board, now: () => 2000 })
    const { port1, port2 } = new MessageChannel()
    host.mount(port1)
    await readySession(host, port2)

    // Verifica che il tool possa leggere la board (vuota all'inizio)
    const responses: unknown[] = []
    port2.addEventListener("message", (ev) => { responses.push(ev.data) })
    port2.start()

    port2.postMessage({
      jsonrpc: "2.0",
      id: "br-1",
      method: "board.read",
      params: { target: "scene" },
    })

    await new Promise((r) => setTimeout(r, 50))

    const resp = responses.find(
      (m: unknown) => typeof m === "object" && m !== null && (m as Record<string, unknown>).id === "br-1",
    ) as Record<string, unknown> | undefined
    expect(resp).toBeDefined()
    const result = resp!.result as { elements?: unknown[] } | undefined
    expect(result).toBeDefined()
    expect(Array.isArray(result!.elements)).toBe(true)

    port2.close()
  })

  it("Blink LED: tool scrive embed → suspend con stato → restore → embed ancora sulla board", async () => {
    const manifest = await installTool(store, manifestJson, bundleZip, signature, () => 1000)

    // === Session 1: mount + write embed ===
    host = new ToolHost(manifest, GRANTED_CAPS, { store, board, now: () => 3000 })
    const { port1: p1a, port2: p2a } = new MessageChannel()
    host.mount(p1a)
    await readySession(host, p2a)

    // Tool risponde a host.suspend con lo stato
    const suspendResponses: unknown[] = []
    p2a.addEventListener("message", (ev) => {
      const msg = ev.data as Record<string, unknown> | undefined
      if (msg && msg.method === "host.suspend") {
        p2a.postMessage({
          jsonrpc: "2.0",
          id: msg.id,
          result: { state: { ledOn: true, label: "LED1", blinkCount: 42 } },
        })
      }
      suspendResponses.push(ev.data)
    })
    p2a.start()

    // Scrivi embed
    p2a.postMessage({
      jsonrpc: "2.0", id: "bw-s1", method: "board.write",
      params: { embedId: "reference-blink-led-1", state: { ledOn: true, ts: 3000, label: "LED1" } },
    })
    await new Promise((r) => setTimeout(r, 50))

    // Suspend
    await host.suspend()

    // Verifica state.json salvato
    const stateBlob = await store.read("tools/io.maestro.sim-reference-blink/state.json")
    expect(stateBlob).not.toBeNull()
    const stateDoc = JSON.parse(await stateBlob!.text())
    expect(stateDoc.v).toBe(1)
    expect(stateDoc.state.ledOn).toBe(true)
    expect(stateDoc.state.blinkCount).toBe(42)

    // === Session 2: nuovo mount + restore ===
    const { port1: p1b, port2: p2b } = new MessageChannel()
    host.mount(p1b)

    // Restore should deliver the saved blink state
    const restoreResponses: unknown[] = []
    p2b.addEventListener("message", (ev) => {
      const msg = ev.data as Record<string, unknown> | undefined
      if (msg && msg.method === "host.restore") {
        p2b.postMessage({
          jsonrpc: "2.0",
          id: msg.id,
          result: {},
        })
      }
      restoreResponses.push(ev.data)
    })
    p2b.start()

    await readySession(host, p2b)

    const restored = await host.restore()
    expect(restored).toBe(true)

    // Verifica che l'embed sia ANCORA sulla board (persistenza board, non tool state)
    const embed = board.elements.find((el) => el.id === "reference-blink-led-1")
    expect(embed).toBeDefined()

    p2a.close()
    p2b.close()
  })

  it("demo Blink LED: embed con ledOn=true ha marker visibile sulla board", async () => {
    const manifest = await installTool(store, manifestJson, bundleZip, signature, () => 1000)

    host = new ToolHost(manifest, GRANTED_CAPS, { store, board, now: () => 4000 })
    const { port1, port2 } = new MessageChannel()
    host.mount(port1)
    await readySession(host, port2)

    // Scrivi embed con LED acceso
    port2.postMessage({
      jsonrpc: "2.0", id: "bw-demo", method: "board.write",
      params: { embedId: "reference-blink-led-demo", state: { ledOn: true, ts: 4000, label: "BLINK" } },
    })

    await new Promise((r) => setTimeout(r, 50))

    const embed = board.elements.find((el) => el.id === "reference-blink-led-demo")
    expect(embed).toBeDefined()
    const marker = embed!.customData?.["maestroTool"] as Record<string, unknown> | undefined
    expect(marker).toBeDefined()
    const state = marker!.state as Record<string, unknown> | undefined
    expect(state!.ledOn).toBe(true)

    // Leggi embed via board.read e verifica che i dati siano gli stessi
    const readResponses: unknown[] = []
    port2.addEventListener("message", (ev) => { readResponses.push(ev.data) })
    port2.start()

    port2.postMessage({
      jsonrpc: "2.0", id: "br-demo", method: "board.read",
      params: { target: "scene" },
    })

    await new Promise((r) => setTimeout(r, 50))

    const readResp = readResponses.find(
      (m: unknown) => typeof m === "object" && m !== null && (m as Record<string, unknown>).id === "br-demo",
    ) as Record<string, unknown> | undefined
    expect(readResp).toBeDefined()
    const readResult = readResp!.result as { elements?: unknown[] } | undefined
    expect(readResult).toBeDefined()
    expect(readResult!.elements!.length).toBeGreaterThanOrEqual(1)

    const readEmbed = (readResult!.elements as BoardElementLike[]).find(
      (el) => el.id === "reference-blink-led-demo",
    )
    expect(readEmbed).toBeDefined()

    port2.close()
  })
})
