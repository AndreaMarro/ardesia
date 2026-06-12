// @vitest-environment jsdom
// TOOLHOST T2-ST4 — superficie iframe (modello vscode-webview, spec §3): sandbox
// CON allow-same-origin (origin per-tool distinta, partizionata dal browser) ma
// senza popups/top-navigation; src con nonce dall'origin-server; handshake al
// load (hello + porta nei transferables, target = ORIGIN DEL TOOL, mai "*");
// unmount → sessione chiusa.
import { afterEach, describe, expect, it, vi } from "vitest"
import { act } from "react"
import { createRoot } from "react-dom/client"
import type { Root } from "react-dom/client"
import { HostHelloSchema, ToolManifestSchema } from "../toolhost-protocol/index.ts"
import { ToolFrame, TOOL_IFRAME_SANDBOX } from "../toolhost/ToolFrame.tsx"
import { ToolHost } from "../toolhost/host.ts"
import { ToolOriginServer } from "../toolhost/originServer.ts"
import { resolveGrant } from "../toolhost/policy.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { BoardApiLike } from "../toolhost/caps/board.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const MANIFEST = ToolManifestSchema.parse({
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

const store: StorageDriverLike & AuditStore = {
  read: async () => null,
  write: async () => {},
  delete: async () => {},
  list: async (): Promise<StorageEntryLike[]> => [],
}

const board: BoardApiLike = {
  getSceneElements: () => [],
  getAppState: () => ({ selectedElementIds: {} }),
  updateScene: () => {},
}

let root: Root | null = null
let container: HTMLElement | null = null

afterEach(async () => {
  if (root !== null) await act(async () => root!.unmount())
  container?.remove()
  root = null
  container = null
})

async function renderFrame(): Promise<{ host: ToolHost; server: ToolOriginServer; iframe: HTMLIFrameElement }> {
  const host = new ToolHost(MANIFEST, resolveGrant(MANIFEST, ["board.read"]), { store, board })
  const server = new ToolOriginServer({
    manifest: MANIFEST,
    files: new Map([["dist/index.html", "<html>echo</html>"]]),
    port: 7311,
  })
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  await act(async () => {
    root!.render(<ToolFrame host={host} originServer={server} />)
  })
  const iframe = container.querySelector("iframe")
  if (iframe === null) throw new Error("iframe non renderizzato")
  return { host, server, iframe }
}

describe("ToolFrame (iframe sandbox + handshake al load)", () => {
  it("sandbox spec §3: same-origin sì (origin per-tool), popups/top-navigation MAI; src = entry-url con nonce", async () => {
    const { server, iframe } = await renderFrame()
    expect(iframe.getAttribute("sandbox")).toBe(TOOL_IFRAME_SANDBOX)
    // allow-same-origin è necessario: senza, origin opaca → l'hello con
    // targetOrigin concreto non verrebbe MAI consegnato (vedi ToolFrame.tsx).
    expect(TOOL_IFRAME_SANDBOX).toContain("allow-same-origin")
    expect(TOOL_IFRAME_SANDBOX).not.toContain("allow-popups")
    expect(TOOL_IFRAME_SANDBOX).not.toContain("allow-top-navigation")
    expect(iframe.src.startsWith(server.origin + "/")).toBe(true)
    expect(iframe.src).toContain("?n=")
    expect(iframe.title).toBe("Echo")
  })

  it("al load: monta la sessione e posta host.hello con la porta, target = origin del tool (mai *)", async () => {
    const { host, server, iframe } = await renderFrame()
    const cw = iframe.contentWindow!
    const posted = vi.spyOn(cw, "postMessage").mockImplementation(() => {})
    await act(async () => {
      iframe.dispatchEvent(new Event("load"))
    })
    expect(host.session).not.toBeNull()
    expect(posted).toHaveBeenCalledTimes(1)
    const [hello, targetOrigin, transfer] = posted.mock.calls[0]! as unknown as [unknown, string, Transferable[]]
    expect(HostHelloSchema.safeParse(hello).success).toBe(true)
    // il bearer NON viaggia nell'hello (solo nel ReadyAck post-nonce)
    expect(JSON.stringify(hello)).not.toContain("bearer")
    expect(targetOrigin).toBe(server.origin)
    expect(transfer).toHaveLength(1)
    expect(transfer[0]).toBeInstanceOf(MessagePort)
  })

  it("unmount del componente → sessione chiusa sul ToolHost", async () => {
    const { host, iframe } = await renderFrame()
    vi.spyOn(iframe.contentWindow!, "postMessage").mockImplementation(() => {})
    await act(async () => {
      iframe.dispatchEvent(new Event("load"))
    })
    expect(host.session).not.toBeNull()
    await act(async () => root!.unmount())
    root = null
    expect(host.session).toBeNull()
  })
})
