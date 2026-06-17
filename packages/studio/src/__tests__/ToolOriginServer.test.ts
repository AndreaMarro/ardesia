// TOOLHOST T2 — origin-server loopback per-tool (TOOLHOST-SPEC-v0 §3):
// CSP iniettata su OGNI risposta (incluse anti-side-channel), nonce monouso
// sul document-load dell'entry, path safety (lezione ZipSlip).
import { describe, expect, it } from "vitest"
import { SECURITY_HEADERS, ToolOriginServer, toolOrigin } from "../toolhost/originServer.ts"
import { ToolManifestSchema } from "../toolhost-protocol/index.ts"
import type { ToolManifest } from "../toolhost-protocol/index.ts"

const MANIFEST: ToolManifest = ToolManifestSchema.parse({
  manifestVersion: 1,
  id: "com.example.echo",
  name: "Echo",
  version: "1.0.0",
  protocol: ">=1.0 <2.0",
  entry: "dist/index.html",
  surfaces: ["panel"],
  capabilities: { "board.read": {} },
  publisher: { id: "example", pubkey: "ed25519:AAAA" },
  privacy: { dataOut: "none" },
})

const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff])

function makeServer(now?: () => number): ToolOriginServer {
  return new ToolOriginServer({
    manifest: MANIFEST,
    files: new Map<string, Uint8Array | string>([
      ["dist/index.html", "<html><body>echo</body></html>"],
      ["dist/app.js", "console.log('echo')"],
      ["dist/icon.png", PNG_BYTES],
      ["maestro-tool.json", "{}"],
    ]),
    port: 7311,
    now,
  })
}

function entryPath(server: ToolOriginServer): string {
  const url = server.issueEntryUrl()
  expect(url.startsWith(server.origin + "/")).toBe(true)
  return url.slice(server.origin.length)
}

describe("toolOrigin (origin loopback distinta per-tool)", () => {
  it("costruisce l'origin nel formato spec §3", () => {
    expect(toolOrigin("com.example.echo", 7311)).toBe("http://t-com.example.echo.127-0-0-1.localhost:7311")
  })

  it("due tool diversi → origin diverse (partizionamento browser per costruzione)", () => {
    expect(toolOrigin("com.a.uno", 7311)).not.toBe(toolOrigin("com.a.due", 7311))
  })

  it("rifiuta tool id fuori grammatica (niente host-header injection) e porte invalide", () => {
    expect(() => toolOrigin("evil.host/..", 7311)).toThrow(/invalid tool id/)
    expect(() => toolOrigin("UPPER.Case", 7311)).toThrow(/invalid tool id/)
    expect(() => toolOrigin("nodots", 7311)).toThrow(/invalid tool id/)
    expect(() => toolOrigin("com.example.echo", 0)).toThrow(/invalid port/)
    expect(() => toolOrigin("com.example.echo", 65536)).toThrow(/invalid port/)
  })
})

describe("CSP iniettata dall'host su OGNI risposta", () => {
  it("entry, asset, 404 e 403 portano TUTTI gli header di sicurezza", () => {
    const server = makeServer()
    const responses = [
      server.handleRequest(entryPath(server)), // 200 entry
      server.handleRequest("/dist/app.js"), // 200 asset
      server.handleRequest("/missing.js"), // 404
      server.handleRequest("/dist/index.html"), // 403 (senza nonce)
    ]
    for (const res of responses) {
      for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
        expect(res.headers[k]).toBe(v)
      }
    }
  })

  it("la CSP SERVITA nega rete esterna, canali laterali e form-action (non eredita da default-src)", () => {
    const server = makeServer()
    const res = server.handleRequest("/dist/app.js")
    const csp = res.headers["Content-Security-Policy"]
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("connect-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("frame-src 'none'")
    expect(csp).toContain("form-action 'self'")
    expect(csp).toContain("base-uri 'none'")
    expect(csp).toContain("webrtc 'block'")
    expect(res.headers["Permissions-Policy"]).toContain("microphone=()")
    expect(res.headers["Permissions-Policy"]).toContain("camera=()")
    expect(res.headers["X-DNS-Prefetch-Control"]).toBe("off")
    expect(res.headers["Referrer-Policy"]).toBe("no-referrer")
  })
})

describe("nonce monouso sul document-load (§3: a scadenza, mai riusabile)", () => {
  it("entry con nonce fresco → 200; lo STESSO nonce riusato → 403", () => {
    const server = makeServer()
    const path = entryPath(server)
    const first = server.handleRequest(path)
    expect(first.status).toBe(200)
    expect(first.body).toBe("<html><body>echo</body></html>")
    expect(first.headers["Content-Type"]).toBe("text/html; charset=utf-8")
    const replay = server.handleRequest(path)
    expect(replay.status).toBe(403)
    expect(replay.body).toBeNull()
  })

  it("entry senza nonce o con nonce mai emesso → 403", () => {
    const server = makeServer()
    expect(server.handleRequest("/dist/index.html").status).toBe(403)
    expect(server.handleRequest("/dist/index.html?n=" + "f".repeat(32)).status).toBe(403)
  })

  it("nonce scaduto → 403 anche se mai consumato", () => {
    let t = 1000
    const server = makeServer(() => t)
    const path = entryPath(server)
    t += 60_001
    expect(server.handleRequest(path).status).toBe(403)
  })

  it("ogni issueEntryUrl emette un nonce DIVERSO e ciascuno vale una sola lettura", () => {
    const server = makeServer()
    const p1 = entryPath(server)
    const p2 = entryPath(server)
    expect(p1).not.toBe(p2)
    expect(server.handleRequest(p1).status).toBe(200)
    expect(server.handleRequest(p2).status).toBe(200)
    expect(server.handleRequest(p1).status).toBe(403)
    expect(server.handleRequest(p2).status).toBe(403)
  })

  it("gli asset non-entry NON richiedono nonce (raggiungibili solo dal documento autorizzato)", () => {
    const server = makeServer()
    const res = server.handleRequest("/dist/app.js")
    expect(res.status).toBe(200)
    expect(res.headers["Content-Type"]).toBe("text/javascript; charset=utf-8")
  })

  it("parametri n ripetuti: vale il PRIMO — ?n=falso&n=vero → 403 (niente smuggling del secondo)", () => {
    const server = makeServer()
    const valid = entryPath(server)
    const realNonce = valid.slice(valid.indexOf("?n=") + 3)
    const res = server.handleRequest(`/dist/index.html?n=${"0".repeat(32)}&n=${realNonce}`)
    expect(res.status).toBe(403)
    // il nonce vero NON è stato consumato dal tentativo: resta valido
    expect(server.handleRequest(`/dist/index.html?n=${realNonce}`).status).toBe(200)
  })

  it("entry con caratteri riservati: round-trip issueEntryUrl→handleRequest lossless", () => {
    const manifest = ToolManifestSchema.parse({
      ...MANIFEST,
      entry: "dist v1/100%/index.html",
    })
    const server = new ToolOriginServer({
      manifest,
      files: new Map([["dist v1/100%/index.html", "<html>ok</html>"]]),
      port: 7311,
    })
    const url = server.issueEntryUrl()
    expect(server.handleRequest(url.slice(server.origin.length)).status).toBe(200)
  })

  it("nonce scaduti vengono ripuliti alla issue successiva (niente crescita illimitata)", () => {
    let t = 1000
    const server = makeServer(() => t)
    const stale = entryPath(server)
    t += 60_001
    entryPath(server) // la issue fa lo sweep
    expect(server.handleRequest(stale).status).toBe(403)
  })
})

describe("path safety (lezione ZipSlip, anche percent-encoded)", () => {
  it("traversal letterale e percent-encoded → 400, mai contenuto", () => {
    const server = makeServer()
    expect(server.handleRequest("/dist/../maestro-tool.json").status).toBe(400)
    expect(server.handleRequest("/dist/%2e%2e/maestro-tool.json").status).toBe(400)
    expect(server.handleRequest("/%2E%2E/secret").status).toBe(400)
    expect(server.handleRequest("/dist\\app.js").status).toBe(400)
    expect(server.handleRequest("dist/app.js").status).toBe(400) // non assoluto
    expect(server.handleRequest("/%zz").status).toBe(400) // encoding malformato
    expect(server.handleRequest("/dist/app%00.js").status).toBe(400) // null byte
    // doppia codifica: si decodifica UNA volta, "%2e%2e" letterale → lookup → 404, mai traversal
    expect(server.handleRequest("/%252e%252e/secret").status).toBe(404)
  })

  it("path sconosciuto → 404 senza body", () => {
    const server = makeServer()
    const res = server.handleRequest("/nope/missing.js")
    expect(res.status).toBe(404)
    expect(res.body).toBeNull()
  })

  it("pacchetto con path non sicuri → REJECT alla costruzione", () => {
    expect(
      () =>
        new ToolOriginServer({
          manifest: MANIFEST,
          files: new Map([
            ["dist/index.html", "x"],
            ["../escape.js", "evil"],
          ]),
          port: 7311,
        }),
    ).toThrow(/unsafe file path/)
  })

  it("pacchetto senza l'entry del manifest → REJECT alla costruzione", () => {
    expect(
      () =>
        new ToolOriginServer({
          manifest: MANIFEST,
          files: new Map([["dist/other.html", "x"]]),
          port: 7311,
        }),
    ).toThrow(/entry not present/)
  })
})

describe("contenuti binari e content-type", () => {
  it("i byte binari tornano IDENTICI (mai .text() su blob — lezione audio)", () => {
    const server = makeServer()
    const res = server.handleRequest("/dist/icon.png")
    expect(res.status).toBe(200)
    expect(res.headers["Content-Type"]).toBe("image/png")
    expect(res.body).toEqual(PNG_BYTES)
  })

  it("estensione ignota → application/octet-stream, query sugli asset ignorata", () => {
    const server = new ToolOriginServer({
      manifest: MANIFEST,
      files: new Map<string, Uint8Array | string>([
        ["dist/index.html", "x"],
        ["dist/data.bin", new Uint8Array([1, 2, 3])],
      ]),
      port: 7311,
    })
    const res = server.handleRequest("/dist/data.bin?cache=1")
    expect(res.status).toBe(200)
    expect(res.headers["Content-Type"]).toBe("application/octet-stream")
  })
})
