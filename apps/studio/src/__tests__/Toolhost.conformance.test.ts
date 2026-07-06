// @vitest-environment jsdom
//
// CONFORMANCE SUITE TOOLHOST T1 (TOOLHOST-SPEC-v0 §9-T1): golden cases su
// manifest invalidi, capability negate, payload malformati + handshake E2E
// con tool finto montato in iframe sandbox.
//
// Nota harness ONESTA: jsdom non esegue script negli iframe e il suo
// window.postMessage NON trasferisce MessagePort (probe 12/06: ports droppate).
// La consegna di host.hello avviene quindi dispatchando un MessageEvent REALE
// con la porta in event.ports sul contentWindow — lo STESSO listener path che
// l'SDK usa nel browser (event.data + event.ports[0]). Le porte sono i
// MessagePort di Node (stessa API web). Tutto il codice sotto test è reale.
import { afterEach, describe, expect, it } from "vitest"
import {
  CapabilitiesSchema,
  ERR,
  HostHelloSchema,
  PROTOCOL_VERSION,
  ToolManifestSchema,
  isValidProtocolRange,
  protocolSatisfies,
} from "../toolhost-protocol/index.ts"
import type { Capabilities } from "../toolhost-protocol/index.ts"
import { ToolHostSession } from "../toolhost/session.ts"
import type { HostSessionConfig, PortLike } from "../toolhost/session.ts"
import { routeRequest } from "../toolhost/router.ts"
import { connectTool } from "../toolsdk/connect.ts"
import type { ToolHandlers } from "../toolsdk/connect.ts"

// ---------- fixtures ----------

const PILOT_MANIFEST = {
  manifestVersion: 1,
  id: "com.elab.breadboard-sim",
  name: "Breadboard Arduino",
  version: "0.1.0",
  protocol: ">=1.0 <2.0",
  entry: "dist/index.html",
  surfaces: ["board-embed", "panel", "fullscreen"],
  capabilities: {
    "board.read": {},
    "board.write": { scope: "own-embeds" },
    storage: { quotaMB: 200 },
    "llm.generate": { maxTokensPerCall: 4000 },
  },
  pricing: { model: "one-time", sku: "breadboard-sim-v1" },
  publisher: { id: "elab", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
  i18n: {
    it: {
      name: "Breadboard Arduino",
      consentBlurb: "Può leggere la selezione sulla lavagna e disegnare i propri circuiti.",
    },
  },
} as const

function manifestWith(patch: Record<string, unknown>): unknown {
  return { ...structuredClone(PILOT_MANIFEST as unknown as Record<string, unknown>), ...patch }
}

const BEARER = "bearer-secret-9f31"

const FULL_CAPS: Capabilities = {
  "board.read": {},
  "board.write": { scope: "own-embeds" },
  storage: { quotaMB: 10 },
}

// ---------- harness ----------

const openChannels: MessageChannel[] = []
const mountedFrames: HTMLIFrameElement[] = []

afterEach(() => {
  for (const ch of openChannels.splice(0)) {
    ch.port1.close()
    ch.port2.close()
  }
  for (const f of mountedFrames.splice(0)) f.remove()
})

function trackChannel(): MessageChannel {
  const ch = new MessageChannel()
  openChannels.push(ch)
  return ch
}

function mountToolFrame(): { iframe: HTMLIFrameElement; cw: Window } {
  const iframe = document.createElement("iframe")
  iframe.setAttribute("sandbox", "allow-scripts allow-forms")
  document.body.appendChild(iframe)
  mountedFrames.push(iframe)
  const cw = iframe.contentWindow
  if (cw === null) throw new Error("jsdom did not provide a contentWindow")
  return { iframe, cw }
}

function deliverWindowMessage(cw: Window, data: unknown, ports: MessagePort[] = []): void {
  cw.dispatchEvent(new MessageEvent("message", { data, ports }))
}

/** Collector FIFO sulla porta: evita perdite di messaggi tra listener una-tantum. */
function collect(port: MessagePort): { next: () => Promise<unknown> } {
  const queue: unknown[] = []
  const waiters: Array<(v: unknown) => void> = []
  port.addEventListener("message", (ev) => {
    const w = waiters.shift()
    if (w !== undefined) w((ev as MessageEvent).data)
    else queue.push((ev as MessageEvent).data)
  })
  port.start()
  return {
    next: () => {
      const head = queue.shift()
      if (head !== undefined) return Promise.resolve(head)
      return new Promise((r) => waiters.push(r))
    },
  }
}

interface SessionSetup {
  session: ToolHostSession
  hostPort: MessagePort
  toolPort: MessagePort
}

function makeSession(cfg?: Partial<HostSessionConfig>): SessionSetup {
  const ch = trackChannel()
  const session = new ToolHostSession({
    grantedCaps: FULL_CAPS,
    bearerToken: BEARER,
    handlers: {},
    ...cfg,
  })
  session.attach(ch.port1 as unknown as PortLike)
  return { session, hostPort: ch.port1, toolPort: ch.port2 }
}

/** Handshake raw lato-tool (senza SDK), per i test adversarial sul router. */
async function rawReady(setup: SessionSetup): Promise<{ next: () => Promise<unknown> }> {
  const rx = collect(setup.toolPort)
  setup.toolPort.postMessage({
    jsonrpc: "2.0",
    id: "ready-raw",
    method: "tool.ready",
    params: { nonce: setup.session.nonce, protocolVersion: PROTOCOL_VERSION },
  })
  const ack = (await rx.next()) as { result?: { bearerToken?: string } }
  expect(ack.result?.bearerToken).toBe(BEARER)
  return rx
}

function expectError(msg: unknown, code: number): void {
  const m = msg as { error?: { code?: number }; result?: unknown }
  expect(m.result).toBeUndefined()
  expect(m.error?.code).toBe(code)
}

// ---------- 1. manifest golden cases ----------

describe("conformance/manifest (Zod .strict, vocabolario chiuso)", () => {
  it("accetta il manifest del pilot breadboard (esempio spec §2)", () => {
    const parsed = ToolManifestSchema.safeParse(PILOT_MANIFEST)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.capabilities["board.write"]?.scope).toBe("own-embeds")
      expect(parsed.data.id).toBe("com.elab.breadboard-sim")
    }
  })

  it("rifiuta chiavi top-level sconosciute (niente superficie non dichiarata)", () => {
    expect(ToolManifestSchema.safeParse(manifestWith({ autorun: true })).success).toBe(false)
  })

  it("rifiuta manifestVersion diverso da 1", () => {
    expect(ToolManifestSchema.safeParse(manifestWith({ manifestVersion: 2 })).success).toBe(false)
  })

  it("rifiuta id non reverse-dns", () => {
    expect(ToolManifestSchema.safeParse(manifestWith({ id: "Breadboard Sim!" })).success).toBe(false)
    expect(ToolManifestSchema.safeParse(manifestWith({ id: "nodots" })).success).toBe(false)
  })

  it("rifiuta capability fuori dal vocabolario chiuso (fs/shell NON esistono)", () => {
    const caps = { ...PILOT_MANIFEST.capabilities, "fs.read": {} }
    expect(ToolManifestSchema.safeParse(manifestWith({ capabilities: caps })).success).toBe(false)
    expect(CapabilitiesSchema.safeParse({ "shell.exec": {} }).success).toBe(false)
  })

  it('rifiuta board.write con scope diverso da "own-embeds"', () => {
    const caps = { ...PILOT_MANIFEST.capabilities, "board.write": { scope: "all" } }
    expect(ToolManifestSchema.safeParse(manifestWith({ capabilities: caps })).success).toBe(false)
  })

  it("rifiuta net.fetch senza domini e net.fetch con dataOut:none (incoerente)", () => {
    const noDomains = { ...PILOT_MANIFEST.capabilities, "net.fetch": { domains: [] } }
    expect(ToolManifestSchema.safeParse(manifestWith({ capabilities: noDomains })).success).toBe(false)
    const fetchCaps = { ...PILOT_MANIFEST.capabilities, "net.fetch": { domains: ["api.example.com"] } }
    // dataOut "none" promette zero esfiltrazione: net.fetch dichiarato la contraddice.
    expect(
      ToolManifestSchema.safeParse(manifestWith({ capabilities: fetchCaps, privacy: { dataOut: "none" } })).success,
    ).toBe(false)
    expect(
      ToolManifestSchema.safeParse(
        manifestWith({ capabilities: fetchCaps, privacy: { dataOut: "declared-domains" } }),
      ).success,
    ).toBe(true)
  })

  it("rifiuta entry path non sicuri (lezione ZipSlip)", () => {
    expect(ToolManifestSchema.safeParse(manifestWith({ entry: "../../etc/passwd.html" })).success).toBe(false)
    expect(ToolManifestSchema.safeParse(manifestWith({ entry: "/abs/index.html" })).success).toBe(false)
    expect(ToolManifestSchema.safeParse(manifestWith({ entry: "dist/app.js" })).success).toBe(false)
    expect(ToolManifestSchema.safeParse(manifestWith({ entry: "dist/sub/index.html" })).success).toBe(true)
  })

  it("rifiuta pubkey senza prefisso ed25519:", () => {
    expect(
      ToolManifestSchema.safeParse(manifestWith({ publisher: { id: "elab", pubkey: "rsa:AAAA" } })).success,
    ).toBe(false)
  })

  it("rifiuta quota storage non positiva e surfaces duplicate", () => {
    const caps = { ...PILOT_MANIFEST.capabilities, storage: { quotaMB: 0 } }
    expect(ToolManifestSchema.safeParse(manifestWith({ capabilities: caps })).success).toBe(false)
    expect(
      ToolManifestSchema.safeParse(manifestWith({ surfaces: ["panel", "panel"] })).success,
    ).toBe(false)
  })
})

// ---------- 2. versioning ----------

describe("conformance/protocol-version", () => {
  it("protocolSatisfies applica il range del manifest", () => {
    expect(protocolSatisfies("1.0.0", ">=1.0 <2.0")).toBe(true)
    expect(protocolSatisfies("1.9.3", ">=1.0 <2.0")).toBe(true)
    expect(protocolSatisfies("2.0.0", ">=1.0 <2.0")).toBe(false)
    expect(protocolSatisfies("0.9.9", ">=1.0 <2.0")).toBe(false)
  })

  it("range fuori grammatica v0 → invalido (mai permissivo)", () => {
    expect(isValidProtocolRange("^1.0")).toBe(false)
    expect(isValidProtocolRange("latest")).toBe(false)
    expect(isValidProtocolRange("")).toBe(false)
    expect(protocolSatisfies("1.0.0", "^1.0")).toBe(false)
  })
})

// ---------- 3. handshake E2E con tool finto in iframe sandbox ----------

describe("conformance/handshake (iframe sandbox + nonce monouso)", () => {
  it("tool finto echo monta in iframe sandbox e completa l'handshake (DoD T1)", async () => {
    const setup = makeSession({
      handlers: { "board.read": (p) => ({ elements: [{ echo: p }] }) },
    })
    const { iframe, cw } = mountToolFrame()
    expect(iframe.getAttribute("sandbox")).toBe("allow-scripts allow-forms")

    const connP = connectTool({ windowRef: cw })
    deliverWindowMessage(cw, setup.session.hello, [setup.toolPort])
    const conn = await connP

    expect(conn.bearerToken).toBe(BEARER)
    expect(conn.grantedCaps).toEqual(FULL_CAPS)
    await setup.session.ready

    const result = (await conn.call("board.read", { target: "scene" })) as { elements: unknown[] }
    expect(result.elements).toEqual([{ echo: { target: "scene" } }])
    conn.close()
  })

  it("il bearer token non è MAI nell'URL dell'iframe né nell'hello", () => {
    const setup = makeSession()
    const { iframe } = mountToolFrame()
    expect(iframe.src.includes(BEARER)).toBe(false)
    expect(JSON.stringify(setup.session.hello).includes(BEARER)).toBe(false)
    // un host che provasse a infilare il token nell'hello violerebbe lo schema strict:
    const polluted = {
      ...setup.session.hello,
      params: { ...setup.session.hello.params, bearerToken: BEARER },
    }
    expect(HostHelloSchema.safeParse(polluted).success).toBe(false)
  })

  it("tool.ready con nonce sbagliato → HANDSHAKE_FAILED, nessun token, sessione fallita", async () => {
    const setup = makeSession()
    const rx = collect(setup.toolPort)
    setup.toolPort.postMessage({
      jsonrpc: "2.0",
      id: 1,
      method: "tool.ready",
      params: { nonce: "x".repeat(32), protocolVersion: PROTOCOL_VERSION },
    })
    const res = await rx.next()
    expectError(res, ERR.HANDSHAKE_FAILED)
    expect(JSON.stringify(res).includes(BEARER)).toBe(false)
    await expect(setup.session.ready).rejects.toThrow(/nonce mismatch/)
  })

  it("nonce monouso: replay di tool.ready dopo il consumo → rifiutato senza secondo token", async () => {
    const setup = makeSession()
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({
      jsonrpc: "2.0",
      id: "replay",
      method: "tool.ready",
      params: { nonce: setup.session.nonce, protocolVersion: PROTOCOL_VERSION },
    })
    const replay = await rx.next()
    expectError(replay, ERR.HANDSHAKE_FAILED)
    expect(JSON.stringify(replay).includes(BEARER)).toBe(false)
  })

  it("messaggi spazzatura sulla finestra prima dell'hello vengono ignorati", async () => {
    const setup = makeSession()
    const { cw } = mountToolFrame()
    const connP = connectTool({ windowRef: cw })
    deliverWindowMessage(cw, "junk")
    deliverWindowMessage(cw, { jsonrpc: "2.0", method: "host.hello", params: { evil: true } })
    deliverWindowMessage(cw, setup.session.hello, [setup.toolPort])
    const conn = await connP
    expect(conn.bearerToken).toBe(BEARER)
    conn.close()
  })

  it("hello valido ma SENZA porta nei transferables → l'SDK non parte, riparte col successivo", async () => {
    const setup = makeSession()
    const { cw } = mountToolFrame()
    const connP = connectTool({ windowRef: cw })
    deliverWindowMessage(cw, setup.session.hello, []) // nessuna porta
    deliverWindowMessage(cw, setup.session.hello, [setup.toolPort])
    const conn = await connP
    expect(conn.bearerToken).toBe(BEARER)
    conn.close()
  })

  it("hello con major di protocollo incompatibile → connectTool rifiuta", async () => {
    const { cw } = mountToolFrame()
    const ch = trackChannel()
    const alienHello = HostHelloSchema.parse({
      jsonrpc: "2.0",
      method: "host.hello",
      params: {
        protocolVersion: "2.0.0",
        grantedCaps: {},
        nonce: "n".repeat(32),
        theme: "light",
        locale: "it",
      },
    })
    const connP = connectTool({ windowRef: cw })
    deliverWindowMessage(cw, alienHello, [ch.port2])
    await expect(connP).rejects.toThrow(/incompatible host protocol/)
  })

  it("request operativa PRIMA di tool.ready → HANDSHAKE_FAILED (porta non fidata finché il nonce non torna)", async () => {
    const setup = makeSession()
    const rx = collect(setup.toolPort)
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: 7, method: "board.read", params: { target: "scene" } })
    expectError(await rx.next(), ERR.HANDSHAKE_FAILED)
  })
})

// ---------- 4. router host-side: validazione Zod e deny-by-default ----------

describe("conformance/router (validazione host-side, capability deny-by-default)", () => {
  it("payload non JSON-RPC → INVALID_REQUEST con id null", async () => {
    const setup = makeSession()
    const rx = await rawReady(setup)
    setup.toolPort.postMessage("garbage-string")
    const res = (await rx.next()) as { id: unknown; error: { code: number } }
    expect(res.error.code).toBe(ERR.INVALID_REQUEST)
    expect(res.id).toBeNull()
  })

  it("id di tipo invalido (boolean) → INVALID_REQUEST", async () => {
    const setup = makeSession()
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: true, method: "board.read", params: { target: "scene" } })
    expectError(await rx.next(), ERR.INVALID_REQUEST)
  })

  it("metodo fuori registro (fs.read) → METHOD_NOT_FOUND: la capability non esiste nel protocollo", async () => {
    const setup = makeSession()
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: 1, method: "fs.read", params: { path: "/etc/passwd" } })
    expectError(await rx.next(), ERR.METHOD_NOT_FOUND)
  })

  // Pinna la verità P0-C: net.fetch è DICHIARATIVO (manifest/policy), non un
  // metodo runtime — TOOL_METHODS copre board.*/storage.*/graph.query. Anche con
  // la capability concessa, la chiamata protocollo NON esiste. La rete vera
  // dell'entry (fetch del browser da srcDoc) oggi NON passa da qui: il suo
  // enforcement è ADR-0001 (PROPOSED, gate Andrea).
  it("net.fetch via protocollo → METHOD_NOT_FOUND anche con capability dichiarata (dichiarativo, non runtime)", async () => {
    const setup = makeSession({ grantedCaps: { "net.fetch": { domains: ["api.example.com"] } } })
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({
      jsonrpc: "2.0",
      id: 1,
      method: "net.fetch",
      params: { url: "https://api.example.com/data" },
    })
    expectError(await rx.next(), ERR.METHOD_NOT_FOUND)
  })

  it("deny-by-default: storage.get senza capability storage → CAPABILITY_DENIED e handler MAI invocato", async () => {
    let invoked = 0
    const setup = makeSession({
      grantedCaps: { "board.read": {} },
      handlers: { "storage.get": () => ((invoked += 1), { value: "leak" }) },
    })
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: 1, method: "storage.get", params: { key: "k" } })
    expectError(await rx.next(), ERR.CAPABILITY_DENIED)
    expect(invoked).toBe(0)
  })

  it("params malformati → INVALID_PARAMS e handler MAI invocato", async () => {
    let invoked = 0
    const setup = makeSession({
      handlers: { "storage.set": () => ((invoked += 1), {}) },
    })
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: 1, method: "storage.set", params: { key: "k" } }) // manca value
    expectError(await rx.next(), ERR.INVALID_PARAMS)
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: 2, method: "board.read", params: { target: "everything" } })
    expectError(await rx.next(), ERR.INVALID_PARAMS)
    expect(invoked).toBe(0)
  })

  it("storage key traversal (raw/../x) → INVALID_PARAMS", async () => {
    const setup = makeSession({ handlers: { "storage.get": () => ({ value: null }) } })
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: 1, method: "storage.get", params: { key: "a/../secret" } })
    expectError(await rx.next(), ERR.INVALID_PARAMS)
  })

  it('board.write scope "own-embeds": embed altrui negato, embed proprio permesso', async () => {
    const writes: string[] = []
    const setup = makeSession({
      isOwnEmbed: (id) => id.startsWith("tool-embed:"),
      handlers: {
        "board.write": (p) => {
          writes.push((p as { embedId: string }).embedId)
          return {}
        },
      },
    })
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({
      jsonrpc: "2.0", id: 1, method: "board.write", params: { embedId: "someone-else", state: {} },
    })
    expectError(await rx.next(), ERR.CAPABILITY_DENIED)
    setup.toolPort.postMessage({
      jsonrpc: "2.0", id: 2, method: "board.write", params: { embedId: "tool-embed:1", state: { x: 1 } },
    })
    const ok = (await rx.next()) as { result: unknown }
    expect(ok.result).toEqual({})
    expect(writes).toEqual(["tool-embed:1"])
  })

  it("board.write senza predicato di ownership configurato → negato (deny-by-default)", async () => {
    const res = await routeRequest(
      { jsonrpc: "2.0", id: 1, method: "board.write", params: { embedId: "tool-embed:1", state: {} } },
      { grantedCaps: FULL_CAPS, handlers: { "board.write": () => ({}) } },
    )
    expectError(res, ERR.CAPABILITY_DENIED)
  })

  it("handler che lancia → INTERNAL, la sessione sopravvive alla richiesta successiva", async () => {
    const setup = makeSession({
      handlers: {
        "board.read": (p) => {
          if ((p as { target: string }).target === "selection") throw new Error("boom")
          return { elements: [] }
        },
      },
    })
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: 1, method: "board.read", params: { target: "selection" } })
    const err = (await rx.next()) as { error: { code: number; message: string } }
    expect(err.error.code).toBe(ERR.INTERNAL)
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: 2, method: "board.read", params: { target: "scene" } })
    const ok = (await rx.next()) as { id: unknown; result: unknown }
    expect(ok.id).toBe(2)
    expect(ok.result).toEqual({ elements: [] })
  })

  it("alle notification (senza id) NON si risponde, anche se sconosciute", async () => {
    const setup = makeSession({ handlers: { "board.read": () => ({ elements: [] }) } })
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({ jsonrpc: "2.0", method: "telemetry.beacon", params: { x: 1 } })
    // sentinella: la PRIMA risposta che arriva deve essere quella della request valida successiva
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: "sentinel", method: "board.read", params: { target: "scene" } })
    const first = (await rx.next()) as { id: unknown }
    expect(first.id).toBe("sentinel")
  })

  it("metodo concesso ma non cablato dall'host → INTERNAL (mai silenzio)", async () => {
    const setup = makeSession({ handlers: {} })
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: 1, method: "storage.list", params: {} })
    expectError(await rx.next(), ERR.INTERNAL)
  })
})

// ---------- 5. graph.query: capability read-only instradata sul wire ----------

describe("conformance/graph.query (read-only, deny-by-default)", () => {
  it("con grant e handler cablato il metodo ESISTE nel registro (fine METHOD_NOT_FOUND)", async () => {
    const setup = makeSession({
      grantedCaps: { "graph.query": {} },
      handlers: {
        "graph.query": () => ({ total: 0, summary: { nodeCounts: {}, edgeCounts: {}, uncorrectedErrors: 0 } }),
      },
    })
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: 1, method: "graph.query", params: { select: "summary" } })
    const res = (await rx.next()) as { result?: { total: number }; error?: { code: number } }
    expect(res.error).toBeUndefined()
    expect(res.result?.total).toBe(0)
  })

  it("senza capability graph.query → CAPABILITY_DENIED e handler MAI invocato", async () => {
    let invoked = 0
    const setup = makeSession({
      grantedCaps: { "board.read": {} },
      handlers: { "graph.query": () => ((invoked += 1), { total: 0 }) },
    })
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: 1, method: "graph.query", params: { select: "summary" } })
    expectError(await rx.next(), ERR.CAPABILITY_DENIED)
    expect(invoked).toBe(0)
  })

  it("params fuori schema → INVALID_PARAMS (select ignoto; kind con summary; kind di arco su nodes)", async () => {
    let invoked = 0
    const setup = makeSession({
      grantedCaps: { "graph.query": {} },
      handlers: { "graph.query": () => ((invoked += 1), { total: 0 }) },
    })
    const rx = await rawReady(setup)
    setup.toolPort.postMessage({ jsonrpc: "2.0", id: 1, method: "graph.query", params: { select: "everything" } })
    expectError(await rx.next(), ERR.INVALID_PARAMS)
    setup.toolPort.postMessage({
      jsonrpc: "2.0", id: 2, method: "graph.query", params: { select: "summary", kind: "errore" },
    })
    expectError(await rx.next(), ERR.INVALID_PARAMS)
    setup.toolPort.postMessage({
      jsonrpc: "2.0", id: 3, method: "graph.query", params: { select: "nodes", kind: "corregge" },
    })
    expectError(await rx.next(), ERR.INVALID_PARAMS)
    expect(invoked).toBe(0)
  })
})

// ---------- 6. SDK: chiamate concorrenti, errori, lifecycle suspend/restore ----------

describe("conformance/toolsdk (call concorrenti + lifecycle)", () => {
  async function connectedPair(cfg?: Partial<HostSessionConfig>, handlers?: ToolHandlers) {
    const setup = makeSession(cfg)
    const { cw } = mountToolFrame()
    const connP = connectTool({ windowRef: cw, handlers })
    deliverWindowMessage(cw, setup.session.hello, [setup.toolPort])
    const conn = await connP
    await setup.session.ready
    return { setup, conn }
  }

  it("due call concorrenti risolte ciascuna col proprio id", async () => {
    const store = new Map<string, string>([["a", "1"], ["b", "2"]])
    const { conn } = await connectedPair({
      handlers: { "storage.get": (p) => ({ value: store.get((p as { key: string }).key) ?? null }) },
    })
    const [ra, rb] = await Promise.all([
      conn.call("storage.get", { key: "a" }),
      conn.call("storage.get", { key: "b" }),
    ])
    expect(ra).toEqual({ value: "1" })
    expect(rb).toEqual({ value: "2" })
    conn.close()
  })

  it("call su capability negata → la promise rifiuta con CAPABILITY_DENIED", async () => {
    const { conn } = await connectedPair({ grantedCaps: { "board.read": {} } })
    await expect(conn.call("storage.get", { key: "a" })).rejects.toMatchObject({
      code: ERR.CAPABILITY_DENIED,
    })
    conn.close()
  })

  it("lifecycle suspend/restore: lo stato serializzato dal tool torna indietro intatto", async () => {
    let restored: unknown = null
    const { setup, conn } = await connectedPair({}, {
      suspend: () => ({ circuit: ["led", "r220"], zoom: 1.5 }),
      restore: (state) => {
        restored = state
      },
    })
    const rx = collect(setup.hostPort)
    setup.hostPort.postMessage({ jsonrpc: "2.0", id: "s1", method: "host.suspend", params: {} })
    const suspendRes = (await rx.next()) as { result: { state: unknown } }
    const saved = suspendRes.result.state
    expect(saved).toEqual({ circuit: ["led", "r220"], zoom: 1.5 })

    setup.hostPort.postMessage({ jsonrpc: "2.0", id: "s2", method: "host.restore", params: { state: saved } })
    const ackRestore = (await rx.next()) as { result: unknown }
    expect(ackRestore.result).toEqual({})
    expect(restored).toEqual(saved)
    conn.close()
  })
})
