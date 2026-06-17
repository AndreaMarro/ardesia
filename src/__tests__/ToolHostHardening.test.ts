// @vitest-environment jsdom
//
// TOOLHOST hardening — i tre pilastri della task "ToolHost hardening":
//  A. capability-gating: il grant non può MAI eccedere il manifest (difesa in
//     profondità, anche se il chiamante scavalca resolveGrant);
//  B. kill-switch a runtime: revoke() uccide un tool in esecuzione e blocca i
//     mount; syncKillSwitch() lega la kill-list persistente all'host vivo;
//  C. sandbox iframe: assertToolOriginIsolated rifiuta una collisione di origin
//     (con allow-same-origin il tool erediterebbe i poteri dello Studio).
import { afterEach, describe, expect, it } from "vitest"
import { PROTOCOL_VERSION, ToolManifestSchema } from "../toolhost-protocol/index.ts"
import type { Capabilities, ToolManifest } from "../toolhost-protocol/index.ts"
import { ToolHost, syncKillSwitch } from "../toolhost/host.ts"
import { assertGrantWithinManifest, resolveGrant } from "../toolhost/policy.ts"
import { assertToolOriginIsolated, isToolOriginIsolated, toolOrigin } from "../toolhost/originServer.ts"
import { addToKillList } from "../toolhost/killList.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"

const MANIFEST: ToolManifest = ToolManifestSchema.parse({
  manifestVersion: 1,
  id: "com.example.echo",
  name: "Echo",
  version: "1.0.0",
  protocol: ">=1.0 <2.0",
  entry: "dist/index.html",
  surfaces: ["panel"],
  capabilities: { "board.read": {}, "board.write": { scope: "own-embeds" } },
  publisher: { id: "example", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
})

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

const board: BoardApiLike = {
  getSceneElements: (): readonly BoardElementLike[] => [],
  getAppState: () => ({ selectedElementIds: {} }),
  updateScene: () => {},
}

const openChannels: MessageChannel[] = []
afterEach(() => {
  for (const ch of openChannels.splice(0)) {
    ch.port1.close()
    ch.port2.close()
  }
})

function makeHost(grant: Capabilities, store = new MemoryWorkspace()): ToolHost {
  return new ToolHost(MANIFEST, grant, { store, board })
}

/** Mount + handshake reale (tool.ready) per ottenere una sessione viva e pronta. */
async function mountReady(host: ToolHost): Promise<MessageChannel> {
  const ch = new MessageChannel()
  openChannels.push(ch)
  const session = host.mount(ch.port1)
  ch.port2.start()
  ch.port2.postMessage({
    jsonrpc: "2.0",
    id: 1,
    method: "tool.ready",
    params: { protocolVersion: PROTOCOL_VERSION, nonce: session.nonce },
  })
  await session.ready
  return ch
}

describe("A. capability-gating: il grant non può eccedere il manifest", () => {
  it("grant pulito da resolveGrant → nessun throw", () => {
    expect(() => assertGrantWithinManifest(MANIFEST, resolveGrant(MANIFEST, ["board.read", "board.write"]))).not.toThrow()
  })

  it("grant con capability NON dichiarata (storage) → throw 'grant exceeds manifest'", () => {
    const escalated = { "board.read": {}, storage: { quotaMB: 5 } } as unknown as Capabilities
    expect(() => assertGrantWithinManifest(MANIFEST, escalated)).toThrow(/grant exceeds manifest.*storage/)
  })

  it("grant con config gonfiata rispetto al manifest → throw 'does not match manifest'", () => {
    // board.write nel manifest = own-embeds; un grant che cambia lo scope è escalation di config
    const tampered = { "board.write": { scope: "all-embeds" } } as unknown as Capabilities
    expect(() => assertGrantWithinManifest(MANIFEST, tampered)).toThrow(/does not match manifest/)
  })

  it("il ToolHost RIFIUTA la costruzione con un grant escalato (gate alla radice)", () => {
    const escalated = { "board.read": {}, storage: { quotaMB: 1 } } as unknown as Capabilities
    expect(() => makeHost(escalated)).toThrow(/grant exceeds manifest/)
  })

  it("`ui` è esente: resolveGrant la inietta sempre anche se il manifest non la dichiara", () => {
    const grant = resolveGrant(MANIFEST, ["board.read"])
    expect(grant.ui).toBeDefined()
    expect(MANIFEST.capabilities.ui).toBeUndefined()
    expect(() => assertGrantWithinManifest(MANIFEST, grant)).not.toThrow()
  })
})

describe("B. kill-switch a runtime", () => {
  it("revoke() chiude IMMEDIATAMENTE la sessione viva (uccide un tool in esecuzione)", async () => {
    const host = makeHost(resolveGrant(MANIFEST, ["board.read"]))
    await mountReady(host)
    expect(host.session).not.toBeNull()
    expect(host.revoked).toBe(false)

    host.revoke()

    expect(host.revoked).toBe(true)
    expect(host.session).toBeNull()
  })

  it("dopo revoke() ogni mount è bloccato (kill terminale, non un semplice unmount)", () => {
    const host = makeHost(resolveGrant(MANIFEST, ["board.read"]))
    host.revoke()
    const ch = new MessageChannel()
    openChannels.push(ch)
    expect(() => host.mount(ch.port1)).toThrow(/revoked: mount denied/)
  })

  it("unmount() NON è terminale: il re-mount resta possibile (distinto da revoke)", async () => {
    const host = makeHost(resolveGrant(MANIFEST, ["board.read"]))
    await mountReady(host)
    host.unmount()
    expect(host.revoked).toBe(false)
    expect(() => host.mount(new MessageChannel().port1)).not.toThrow()
  })

  it("revoke() è idempotente", () => {
    const host = makeHost(resolveGrant(MANIFEST, ["board.read"]))
    host.revoke()
    expect(() => host.revoke()).not.toThrow()
    expect(host.revoked).toBe(true)
  })

  it("syncKillSwitch: tool nella kill-list → revocato (sessione uccisa) e ritorna true", async () => {
    const store = new MemoryWorkspace()
    const host = makeHost(resolveGrant(MANIFEST, ["board.read"]), store)
    await mountReady(host)
    await addToKillList(store, MANIFEST.id, "revoca docente", () => 1000)

    const killed = await syncKillSwitch(store, host)

    expect(killed).toBe(true)
    expect(host.revoked).toBe(true)
    expect(host.session).toBeNull()
  })

  it("syncKillSwitch: tool NON nella kill-list → non tocca l'host, ritorna false", async () => {
    const store = new MemoryWorkspace()
    const host = makeHost(resolveGrant(MANIFEST, ["board.read"]), store)
    await mountReady(host)
    await addToKillList(store, "com.altro.tool", undefined, () => 1000)

    const killed = await syncKillSwitch(store, host)

    expect(killed).toBe(false)
    expect(host.revoked).toBe(false)
    expect(host.session).not.toBeNull()
  })

  it("refreshKillSwitch: usa lo store dell'host per consultare la kill-list e revoca se elencato", async () => {
    const store = new MemoryWorkspace()
    const host = makeHost(resolveGrant(MANIFEST, ["board.read"]), store)
    expect(await host.refreshKillSwitch()).toBe(false)
    expect(host.revoked).toBe(false)
    await addToKillList(store, MANIFEST.id, undefined, () => 1000)
    expect(await host.refreshKillSwitch()).toBe(true)
    expect(host.revoked).toBe(true)
  })

  it("syncKillSwitch propaga l'errore su kill-list corrotta (mai eseguire con stato di revoca ignoto)", async () => {
    const store = new MemoryWorkspace()
    const host = makeHost(resolveGrant(MANIFEST, ["board.read"]), store)
    store.files.set("tools/kill-list.json", new Blob(["{vandalo"]))
    await expect(syncKillSwitch(store, host)).rejects.toThrow(/corrupted kill-list/)
    // l'host resta integro: meglio bloccare a monte che revocare su dato corrotto
    expect(host.revoked).toBe(false)
  })
})

describe("C. sandbox iframe: isolamento dell'origin del tool", () => {
  it("origin del tool distinta da quella dello Studio → nessun throw", () => {
    const studio = "http://localhost:5173"
    const origin = toolOrigin("com.example.echo", 7311)
    expect(origin).not.toBe(studio)
    expect(() => assertToolOriginIsolated(origin, studio)).not.toThrow()
  })

  it("collisione origin tool == origin Studio → mount rifiutato (no eredità dei poteri)", () => {
    const studio = "http://localhost:5173"
    expect(() => assertToolOriginIsolated(studio, studio)).toThrow(/collides with studio origin.*mount refused/)
  })

  it("collisione normalizzata: differenze di slash/case dell'host NON aggirano il guard", () => {
    // confronto grezzo direbbe 'distinte'; la normalizzazione URL.origin le smaschera
    expect(isToolOriginIsolated("http://localhost:5173/", "http://localhost:5173")).toBe(false)
    expect(isToolOriginIsolated("http://LOCALHOST:5173", "http://localhost:5173")).toBe(false)
    // origin realmente distinte restano isolate
    expect(isToolOriginIsolated("http://t-x.127-0-0-1.localhost:7311", "http://localhost:5173")).toBe(true)
  })
})
