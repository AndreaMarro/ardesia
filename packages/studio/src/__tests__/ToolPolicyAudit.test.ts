// TOOLHOST T2-ST2 — policy (grant deny-by-default + consenso IT) e audit-log
// append-only per-tool (spec §2 lifecycle grant, §3 innesto P3).
import { describe, expect, it } from "vitest"
import { ERR, TOOL_METHODS, ToolManifestSchema } from "../toolhost-protocol/index.ts"
import type { ToolManifest } from "../toolhost-protocol/index.ts"
import {
  buildConsentSheet,
  capsRequiringReconsent,
  createGrantRecord,
  resolveGrant,
} from "../toolhost/policy.ts"
import { ToolAuditLog, auditPath, readAuditLog } from "../toolhost/audit.ts"
import type { AuditEvent, AuditStore } from "../toolhost/audit.ts"
import { routeRequest } from "../toolhost/router.ts"

const MANIFEST: ToolManifest = ToolManifestSchema.parse({
  manifestVersion: 1,
  id: "com.example.echo",
  name: "Echo Tool",
  version: "1.2.0",
  protocol: ">=1.0 <2.0",
  entry: "dist/index.html",
  surfaces: ["panel"],
  capabilities: {
    "board.read": {},
    "board.write": { scope: "own-embeds" },
    storage: { quotaMB: 50 },
    "llm.generate": { maxTokensPerCall: 4000 },
  },
  publisher: { id: "example", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
  i18n: { it: { name: "Strumento Eco", consentBlurb: "Legge la selezione e salva i propri dati." } },
})

function manifestVariant(capabilities: Record<string, unknown>): ToolManifest {
  return ToolManifestSchema.parse({
    ...MANIFEST,
    i18n: undefined,
    capabilities,
  })
}

// ---------- policy: grant deny-by-default ----------

describe("policy/resolveGrant (deny-by-default, mai oltre il manifest)", () => {
  it("nessuna approvazione → nessuna capability operativa (solo ui implicita, inerte in v0)", () => {
    const grant = resolveGrant(MANIFEST, [])
    expect(grant["board.read"]).toBeUndefined()
    expect(grant["board.write"]).toBeUndefined()
    expect(grant.storage).toBeUndefined()
    expect(grant["llm.generate"]).toBeUndefined()
    expect(grant.ui).toEqual({})
  })

  it("approvazione parziale → SOLO quelle capability, con la config DEL MANIFEST", () => {
    const grant = resolveGrant(MANIFEST, ["board.read", "storage"])
    expect(grant["board.read"]).toEqual({})
    expect(grant.storage).toEqual({ quotaMB: 50 })
    expect(grant["board.write"]).toBeUndefined()
    expect(grant["llm.generate"]).toBeUndefined()
  })

  it("approvare una capability NON dichiarata nel manifest non concede nulla", () => {
    const noStorage = manifestVariant({ "board.read": {} })
    const grant = resolveGrant(noStorage, ["board.read", "storage", "net.fetch"])
    expect(grant.storage).toBeUndefined()
    expect(grant["net.fetch"]).toBeUndefined()
    expect(grant["board.read"]).toEqual({})
  })

  it("ui resta INERTE nel wire v0: nessun metodo del registro è gateato su ui", () => {
    // blinda l'assunzione dietro grant.ui implicito: se in futuro atterra un
    // metodo ui.* nel registro, questo test fallisce e impone ri-consenso esplicito
    expect(Object.values(TOOL_METHODS).every((spec) => spec.cap !== "ui")).toBe(true)
  })

  it("il grant record registra cosa/versione/quando", () => {
    const grant = resolveGrant(MANIFEST, ["board.read"])
    const record = createGrantRecord(MANIFEST, grant, 1718000000000)
    expect(record).toEqual({
      v: 1,
      toolId: "com.example.echo",
      toolVersion: "1.2.0",
      granted: ["board.read", "ui"],
      t: 1718000000000,
    })
  })
})

describe("policy/buildConsentSheet (sheet permessi in italiano)", () => {
  it("usa nome e consentBlurb i18n.it e descrive ogni capability con i numeri del manifest", () => {
    const sheet = buildConsentSheet(MANIFEST)
    expect(sheet.toolName).toBe("Strumento Eco")
    expect(sheet.blurb).toBe("Legge la selezione e salva i propri dati.")
    expect(sheet.publisherId).toBe("example")
    expect(sheet.dataOut).toBe("none")
    const byCap = new Map(sheet.requested.map((r) => [r.cap, r]))
    expect(byCap.get("storage")?.detail).toBe("fino a 50 MB")
    expect(byCap.get("llm.generate")?.detail).toBe("max 4000 token per chiamata")
    expect(byCap.get("board.read")?.label).toMatch(/lavagna/)
    // ogni voce ha una label italiana non vuota
    for (const item of sheet.requested) expect(item.label.length).toBeGreaterThan(0)
  })

  it("senza i18n per la locale → fallback al name del manifest, blurb vuoto", () => {
    const plain = manifestVariant({ "board.read": {} })
    const sheet = buildConsentSheet(plain)
    expect(sheet.toolName).toBe("Echo Tool")
    expect(sheet.blurb).toBe("")
    expect(sheet.requested.map((r) => r.cap)).toEqual(["board.read"])
  })

  it("net.fetch mostra i domini dichiarati", () => {
    const withNet = ToolManifestSchema.parse({
      ...MANIFEST,
      i18n: undefined,
      capabilities: { "net.fetch": { domains: ["api.example.com", "cdn.example.com"] } },
      privacy: { dataOut: "declared-domains" },
    })
    const sheet = buildConsentSheet(withNet)
    expect(sheet.requested[0]?.detail).toBe("domini: api.example.com, cdn.example.com")
    expect(sheet.dataOut).toBe("declared-domains")
  })
})

describe("policy/capsRequiringReconsent (update con DIFF capabilities ⇒ ri-consenso)", () => {
  it("capability aggiunta → ri-consenso; rimozione sola → nessuno", () => {
    const v1 = manifestVariant({ "board.read": {} })
    const v2 = manifestVariant({ "board.read": {}, storage: { quotaMB: 10 } })
    expect(capsRequiringReconsent(v1, v2)).toEqual(["storage"])
    expect(capsRequiringReconsent(v2, v1)).toEqual([])
  })

  it("config cambiata (quota aumentata) → ri-consenso", () => {
    const small = manifestVariant({ storage: { quotaMB: 10 } })
    const big = manifestVariant({ storage: { quotaMB: 500 } })
    expect(capsRequiringReconsent(small, big)).toEqual(["storage"])
    expect(capsRequiringReconsent(small, small)).toEqual([])
  })
})

// ---------- audit: append-only per-tool ----------

class MemoryStore implements AuditStore {
  files = new Map<string, Blob>()
  writeDelay = 0
  failNextWrite = false

  async read(path: string): Promise<Blob | null> {
    return this.files.get(path) ?? null
  }

  async write(path: string, data: Blob): Promise<void> {
    if (this.failNextWrite) {
      this.failNextWrite = false
      throw new Error("disk full")
    }
    if (this.writeDelay > 0) await new Promise((r) => setTimeout(r, this.writeDelay))
    this.files.set(path, data)
  }
}

describe("audit/ToolAuditLog (append-only, per-tool, esiti)", () => {
  it("registra timestamp, tool, metodo, esito — e preserva le righe precedenti", async () => {
    const store = new MemoryStore()
    let t = 100
    const log = new ToolAuditLog(store, "com.example.echo", () => t++)
    await log.append({ method: "board.read", outcome: "ok" })
    await log.append({ method: "storage.get", outcome: "denied", code: ERR.CAPABILITY_DENIED })
    const { entries, malformed } = await readAuditLog(store, "com.example.echo")
    expect(malformed).toBe(0)
    expect(entries).toEqual([
      { v: 1, t: 100, tool: "com.example.echo", method: "board.read", outcome: "ok" },
      { v: 1, t: 101, tool: "com.example.echo", method: "storage.get", outcome: "denied", code: ERR.CAPABILITY_DENIED },
    ])
  })

  it("append concorrenti SERIALIZZATE: nessuna riga persa (read-modify-write)", async () => {
    const store = new MemoryStore()
    store.writeDelay = 1
    const log = new ToolAuditLog(store, "com.example.echo", () => 7)
    await Promise.all(
      Array.from({ length: 10 }, (_, i) => log.append({ method: `m${i}`, outcome: "ok" })),
    )
    const { entries } = await readAuditLog(store, "com.example.echo")
    expect(entries.map((e) => e.method)).toEqual(Array.from({ length: 10 }, (_, i) => `m${i}`))
  })

  it("idle() attende che TUTTE le append accodate siano atterrate (shutdown pulito)", async () => {
    const store = new MemoryStore()
    store.writeDelay = 1
    const log = new ToolAuditLog(store, "com.example.echo", () => 7)
    void log.append({ method: "a", outcome: "ok" })
    void log.append({ method: "b", outcome: "ok" })
    await log.idle()
    const { entries } = await readAuditLog(store, "com.example.echo")
    expect(entries.map((e) => e.method)).toEqual(["a", "b"])
  })

  it("una write fallita rigetta la SUA append ma non avvelena la catena", async () => {
    const store = new MemoryStore()
    const log = new ToolAuditLog(store, "com.example.echo", () => 1)
    store.failNextWrite = true
    await expect(log.append({ method: "lost", outcome: "ok" })).rejects.toThrow(/disk full/)
    await log.append({ method: "kept", outcome: "ok" })
    const { entries } = await readAuditLog(store, "com.example.echo")
    expect(entries.map((e) => e.method)).toEqual(["kept"])
  })

  it("righe corrotte: contate come malformed, MAI spacciate per entry valide", async () => {
    const store = new MemoryStore()
    const log = new ToolAuditLog(store, "com.example.echo", () => 1)
    await log.append({ method: "good", outcome: "ok" })
    const prior = await store.files.get(auditPath("com.example.echo"))!.text()
    store.files.set(auditPath("com.example.echo"), new Blob([prior + "{broken\n" + '{"v":9}\n']))
    const { entries, malformed } = await readAuditLog(store, "com.example.echo")
    expect(entries.map((e) => e.method)).toEqual(["good"])
    expect(malformed).toBe(2)
  })

  it("log separati per tool diversi; toolId fuori grammatica → REJECT", async () => {
    const store = new MemoryStore()
    await new ToolAuditLog(store, "com.a.uno", () => 1).append({ method: "x", outcome: "ok" })
    await new ToolAuditLog(store, "com.b.due", () => 1).append({ method: "y", outcome: "ok" })
    expect((await readAuditLog(store, "com.a.uno")).entries.map((e) => e.method)).toEqual(["x"])
    expect((await readAuditLog(store, "com.b.due")).entries.map((e) => e.method)).toEqual(["y"])
    expect(() => auditPath("../escape")).toThrow(/invalid tool id/)
    expect(() => auditPath("a/b.c")).toThrow(/invalid tool id/)
  })

  it("log mai scritto → zero entries, zero malformed (mai errore)", async () => {
    const store = new MemoryStore()
    expect(await readAuditLog(store, "com.example.echo")).toEqual({ entries: [], malformed: 0 })
  })
})

// ---------- router → onAudit: ogni chiamata capability registrata con esito ----------

describe("router/onAudit (criterio T2-d: tentativi negati LOGGATI)", () => {
  async function route(raw: unknown, cfg?: { caps?: Record<string, unknown> }): Promise<AuditEvent[]> {
    const events: AuditEvent[] = []
    await routeRequest(raw, {
      grantedCaps: cfg?.caps ?? { "board.read": {} },
      handlers: {
        "board.read": (p) => {
          if ((p as { target: string }).target === "selection") throw new Error("boom")
          return { elements: [] }
        },
      },
      onAudit: (e) => events.push(e),
    })
    return events
  }

  it("chiamata concessa e riuscita → esito ok", async () => {
    const events = await route({ jsonrpc: "2.0", id: 1, method: "board.read", params: { target: "scene" } })
    expect(events).toEqual([{ method: "board.read", outcome: "ok" }])
  })

  it("capability NON dichiarata/concessa → denied + codice (criterio di accettazione T2)", async () => {
    const events = await route({ jsonrpc: "2.0", id: 1, method: "storage.get", params: { key: "k" } })
    expect(events).toEqual([{ method: "storage.get", outcome: "denied", code: ERR.CAPABILITY_DENIED }])
  })

  it("metodo fuori protocollo (fs.read) → denied + METHOD_NOT_FOUND", async () => {
    const events = await route({ jsonrpc: "2.0", id: 1, method: "fs.read", params: {} })
    expect(events).toEqual([{ method: "fs.read", outcome: "denied", code: ERR.METHOD_NOT_FOUND }])
  })

  it("params malformati → invalid; handler che lancia → error", async () => {
    const bad = await route({ jsonrpc: "2.0", id: 1, method: "board.read", params: { target: "tutto" } })
    expect(bad).toEqual([{ method: "board.read", outcome: "invalid", code: ERR.INVALID_PARAMS }])
    const thrown = await route({ jsonrpc: "2.0", id: 1, method: "board.read", params: { target: "selection" } })
    expect(thrown).toEqual([{ method: "board.read", outcome: "error", code: ERR.INTERNAL }])
  })

  it("payload non JSON-RPC → method <malformed>, esito invalid; nome metodo troncato a 128", async () => {
    const junk = await route({ not: "jsonrpc" })
    expect(junk).toEqual([{ method: "<malformed>", outcome: "invalid", code: ERR.INVALID_REQUEST }])
    const long = await route({ jsonrpc: "2.0", id: 1, method: "x".repeat(500), params: {} })
    expect(long[0]?.method).toHaveLength(128)
    expect(long[0]?.outcome).toBe("denied")
  })

  it("notification (senza id) → nessuna response, nessun evento audit", async () => {
    const events = await route({ jsonrpc: "2.0", method: "telemetry.beacon", params: {} })
    expect(events).toEqual([])
  })

  it("un onAudit che LANCIA non nega mai la response al tool (azione già avvenuta)", async () => {
    const response = await routeRequest(
      { jsonrpc: "2.0", id: 1, method: "board.read", params: { target: "scene" } },
      {
        grantedCaps: { "board.read": {} },
        handlers: { "board.read": () => ({ elements: [] }) },
        onAudit: () => {
          throw new Error("audit sink broken")
        },
      },
    )
    expect(response).toEqual({ jsonrpc: "2.0", id: 1, result: { elements: [] } })
  })

  it("board.write fuori own-embeds → denied + loggato", async () => {
    const events: AuditEvent[] = []
    await routeRequest(
      { jsonrpc: "2.0", id: 1, method: "board.write", params: { embedId: "altrui", state: {} } },
      {
        grantedCaps: { "board.write": { scope: "own-embeds" } },
        handlers: { "board.write": () => ({}) },
        isOwnEmbed: () => false,
        onAudit: (e) => events.push(e),
      },
    )
    expect(events).toEqual([{ method: "board.write", outcome: "denied", code: ERR.CAPABILITY_DENIED }])
  })
})
