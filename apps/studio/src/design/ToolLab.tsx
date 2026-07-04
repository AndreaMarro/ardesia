// Tool Lab (?vista=tool-lab) — prima route di PRODOTTO che monta un plugin
// attraverso la pipeline reale: installTool (firma ed25519) → PluginManager
// (lifecycle canMount) → kill-switch (refresh pre-hello) → ToolHost.mount.
// Differenza con la demo (?demo=reference-blink): lì firma/install/lifecycle
// sono bypassati; qui il gating è tutto reale. Resta same-origin la sola
// SUPERFICIE iframe: l'origin-server loopback per-tool vive nella shell
// (originServer.ts:1-6), unica rinuncia possibile in un browser puro.

import { useEffect, useMemo, useRef, useState } from "react"
import { Excalidraw } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import { EXCALIDRAW_CONFIG } from "./excalidrawConfig.ts"
import { ToolHost } from "../toolhost/host.ts"
import { postHello } from "../toolhost/session.ts"
import { resolveGrant, declaredCaps } from "../toolhost/policy.ts"
import { installAndGateReferenceTool } from "../toolhost/toolLab.ts"
import type { ToolLabGateResult } from "../toolhost/toolLab.ts"
import type { InstallerStore } from "../toolhost/installer.ts"
import { WorkspaceStore } from "../store/WorkspaceStore.ts"
import { boardAdapter, makeLedSkeleton } from "./ReferenceBlinkDemo.tsx"

// Stesso vincolo di ToolFrame (§3): no allow-popups, no allow-top-navigation.
const TOOL_LAB_SANDBOX = "allow-scripts allow-same-origin"

export interface ToolLabDeps {
  store?: InstallerStore
  /** Solo test: firma forzata (manomessa) per l'asserzione fail-closed. */
  signatureB64?: string
}

type GateState = "pending" | "mounted-gate-passed" | "install-failed" | "not-mountable"

function defaultStore(): InstallerStore {
  const ws = new WorkspaceStore()
  void ws.init()
  return ws
}

export default function ToolLab({ deps }: { deps?: ToolLabDeps }) {
  const store = useMemo(() => deps?.store ?? defaultStore(), [deps?.store])
  const [gate, setGate] = useState<ToolLabGateResult | null>(null)
  const apiRef = useRef<Parameters<typeof boardAdapter>[0] | null>(null)
  const hostRef = useRef<ToolHost | null>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [apiReady, setApiReady] = useState(false)
  const [toolReady, setToolReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    installAndGateReferenceTool(store, { signatureB64: deps?.signatureB64 })
      .then((result) => {
        if (!cancelled) setGate(result)
      })
      .catch((error) => {
        // fail-closed anche su errori inattesi della pipeline
        if (!cancelled) setGate({ ok: false, reason: "install-failed", detail: String(error) })
      })
    return () => {
      cancelled = true
    }
  }, [store, deps?.signatureB64])

  useEffect(() => {
    return () => hostRef.current?.unmount()
  }, [])

  /** onLoad dell'iframe: kill-switch PRIMA dell'hello, poi mount reale. */
  async function handleFrameLoad(): Promise<void> {
    const cw = frameRef.current?.contentWindow
    const api = apiRef.current
    if (!gate?.ok || cw === null || cw === undefined || api === null || hostRef.current !== null) return

    const grant = resolveGrant(gate.manifest, declaredCaps(gate.manifest))
    const host = new ToolHost(gate.manifest, grant, {
      store,
      board: boardAdapter(api),
      makeSkeleton: makeLedSkeleton,
    })
    // un tool revocato DOPO l'install non deve mai ripartire (stessa regola di ToolFrame)
    if (await host.refreshKillSwitch()) return
    hostRef.current = host
    const channel = new MessageChannel()
    const session = host.mount(channel.port1)
    session.ready.then(() => setToolReady(true)).catch(() => {})
    postHello(cw, session.hello, channel.port2, window.location.origin)
  }

  const state: GateState = gate === null ? "pending" : gate.ok ? "mounted-gate-passed" : gate.reason

  return (
    <div
      style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}
      data-tool-lab-state={state}
    >
      <header className="st-bar">
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-name">
          <span className="st-name-text">Tool Lab — plugin firmato</span>
        </span>
        {gate?.ok && (
          <span className="st-chip-student st-chip-lesson" title="Installato con firma ed25519 verificata">
            tool: {gate.manifest.name} · v{gate.manifest.version}
          </span>
        )}
      </header>

      <div style={{ flex: 1, position: "relative" }} data-reference-ready={toolReady ? "1" : "0"}>
        {gate !== null && !gate.ok && (
          <div role="alert" className="reference-tool-panel" style={{ padding: 16 }}>
            <strong>Plugin non montato (fail-closed).</strong>
            <div>{gate.detail}</div>
          </div>
        )}

        {gate?.ok && (
          <>
            <Excalidraw
              langCode={EXCALIDRAW_CONFIG.langCode}
              theme={EXCALIDRAW_CONFIG.theme}
              aiEnabled={EXCALIDRAW_CONFIG.aiEnabled}
              viewModeEnabled
              UIOptions={EXCALIDRAW_CONFIG.UIOptions}
              excalidrawAPI={(eapi: unknown) => {
                apiRef.current = eapi as Parameters<typeof boardAdapter>[0]
                setApiReady(true)
              }}
            />
            <div className="reference-tool-panel">
              <div className="reference-tool-panel-bar">
                <span className="reference-tool-dot" data-on={toolReady ? "1" : "0"} aria-hidden />
                {gate.manifest.name}
              </div>
              {apiReady && (
                <iframe
                  ref={frameRef}
                  title={gate.manifest.name}
                  className="reference-tool-frame"
                  sandbox={TOOL_LAB_SANDBOX}
                  srcDoc={gate.entryHtml}
                  onLoad={() => void handleFrameLoad().catch(() => hostRef.current?.unmount())}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
