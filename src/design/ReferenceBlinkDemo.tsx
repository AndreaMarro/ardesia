// MAESTRO-Studio — Demo Reference Sim sulla lavagna (S-DESIGN-10, milestone T4).
// Monta il PRIMO tool del marketplace (io.maestro.sim-reference-blink) via la stessa
// ToolHost reale usata in produzione: stesso handshake host.hello → tool.ready →
// ReadyAck, stessa capability board.write che deposita l'embed sulla lavagna.
// L'unica differenza con la shell Tauri/Electron è la SUPERFICIE dell'iframe: qui
// l'entry del tool è servita via srcdoc (l'origin-server loopback vive nella shell,
// "fuori dal perimetro testabile headless", originServer.ts:1-6). Per lo screenshot
// di milestone (scripts/shots.mjs) questo è l'equivalente onesto headless.

import { useEffect, useMemo, useRef, useState } from "react"
import { Excalidraw, convertToExcalidrawElements } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import { EXCALIDRAW_CONFIG } from "./excalidrawConfig.ts"
import { ToolHost } from "../toolhost/host.ts"
import { postHello } from "../toolhost/session.ts"
import { ToolManifestSchema } from "../toolhost-protocol/index.ts"
import type { Capabilities, ToolManifest } from "../toolhost-protocol/index.ts"
import type { BoardApiLike, BoardElementLike } from "../toolhost/caps/board.ts"
import type { AuditStore } from "../toolhost/audit.ts"
import type { StorageDriverLike, StorageEntryLike } from "../toolhost/caps/storage.ts"
import manifestSourceRaw from "../../sim/manifest-source.json?raw"
import entryHtml from "../../sim/entry.html?raw"

export const DEMO_EMBED_ID = "reference-blink-led-1"

/** Capability concesse al tool nella demo: le stesse del manifest Reference Blink. */
export const DEMO_GRANTED_CAPS: Capabilities = {
  "board.read": {},
  "board.write": { scope: "own-embeds" },
}

/** Manifest del tool Reference Blink, parsato e validato dallo schema reale. */
export function loadReferenceManifest(): ToolManifest {
  return ToolManifestSchema.parse(JSON.parse(manifestSourceRaw))
}

/**
 * Store in-memory minimale: la demo non concede `storage`, quindi serve solo
 * all'audit-log (read/write). Soddisfa l'intersezione richiesta da ToolHostDeps.
 */
class MemStore implements StorageDriverLike, AuditStore {
  private _m = new Map<string, Blob>()
  async read(p: string): Promise<Blob | null> {
    return this._m.get(p) ?? null
  }
  async write(p: string, d: Blob): Promise<void> {
    this._m.set(p, d)
  }
  async delete(p: string): Promise<void> {
    this._m.delete(p)
  }
  async list(prefix?: string): Promise<StorageEntryLike[]> {
    return [...this._m.entries()]
      .filter(([k]) => prefix === undefined || k.startsWith(prefix))
      .map(([path, data]) => ({ path, data }))
  }
}

// Embed che il board.write deposita: una "scheda LED" rossa, marcata dall'owner.
// NIENTE `label`: convertToExcalidrawElements lo materializza come text BOUND
// separato; tenendo solo il container, boundElements punterebbe a un id assente
// → render Excalidraw rotto. Il rettangolo da solo è autoconsistente.
export function makeLedSkeleton(embedId: string): BoardElementLike {
  const [rect] = convertToExcalidrawElements([
    {
      type: "rectangle",
      x: 720,
      y: 360,
      width: 250,
      height: 140,
      strokeColor: "#ff3333",
      backgroundColor: "#fff0f0",
      strokeWidth: 2,
      roughness: 1,
      roundness: { type: 3 },
    } as never,
  ])
  return { ...(rect as unknown as BoardElementLike), id: embedId }
}

/** Adapter board.* sull'API Excalidraw (stesso shape di apiRef in Room.tsx). */
export function boardAdapter(api: {
  getSceneElements(): readonly unknown[]
  getAppState(): { selectedElementIds?: Record<string, boolean> }
  updateScene(scene: { elements: unknown[] }): void
}): BoardApiLike {
  return {
    getSceneElements: () => api.getSceneElements() as readonly BoardElementLike[],
    getAppState: () => ({ selectedElementIds: api.getAppState().selectedElementIds ?? {} }),
    updateScene: (scene) => api.updateScene({ elements: scene.elements }),
  }
}

/** Scena di sfondo della lavagna: titolo del laboratorio (non vuota nello shot). */
function buildLavagnaScene(): unknown[] {
  return convertToExcalidrawElements([
    {
      type: "text",
      x: 120,
      y: 96,
      text: "Laboratorio — Blink LED",
      fontSize: 32,
      strokeColor: "#14130f",
    } as never,
    {
      type: "text",
      x: 120,
      y: 150,
      text: "Primo strumento Reference sulla lavagna MAESTRO",
      fontSize: 18,
      strokeColor: "#8a8682",
    } as never,
  ]) as unknown[]
}

export default function ReferenceBlinkDemo() {
  const manifest = useMemo(loadReferenceManifest, [])
  const initialScene = useMemo(buildLavagnaScene, [])
  const apiRef = useRef<{
    getSceneElements(): readonly unknown[]
    getAppState(): { selectedElementIds?: Record<string, boolean> }
    updateScene(scene: { elements: unknown[] }): void
  } | null>(null)
  const hostRef = useRef<ToolHost | null>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [apiReady, setApiReady] = useState(false)
  const [toolReady, setToolReady] = useState(false)

  // Smonta la sessione del tool quando il componente sparisce.
  useEffect(() => {
    return () => hostRef.current?.unmount()
  }, [])

  /** onLoad dell'iframe del tool: apre la sessione e invia l'hello sulla porta. */
  function handleFrameLoad(): void {
    const cw = frameRef.current?.contentWindow
    const api = apiRef.current
    // mount-once: un reload interno (nonce consumato) non deve ri-montare.
    if (cw === null || cw === undefined || api === null || hostRef.current !== null) return

    const host = new ToolHost(manifest, DEMO_GRANTED_CAPS, {
      store: new MemStore(),
      board: boardAdapter(api),
      makeSkeleton: makeLedSkeleton,
    })
    hostRef.current = host
    const channel = new MessageChannel()
    const session = host.mount(channel.port1)
    session.ready.then(() => setToolReady(true)).catch(() => {})
    postHello(cw, session.hello, channel.port2, window.location.origin)
  }

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
      <header className="st-bar">
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-name">
          <span className="st-name-text">Reference Sim — Blink LED</span>
        </span>
        <span className="st-chip-student st-chip-lesson" title="Primo tool del marketplace Reference">
          tool: {manifest.name}
        </span>
      </header>

      <div style={{ flex: 1, position: "relative" }} data-reference-ready={toolReady ? "1" : "0"}>
        <Excalidraw
          langCode={EXCALIDRAW_CONFIG.langCode}
          theme={EXCALIDRAW_CONFIG.theme}
          aiEnabled={EXCALIDRAW_CONFIG.aiEnabled}
          viewModeEnabled
          UIOptions={EXCALIDRAW_CONFIG.UIOptions}
          excalidrawAPI={(eapi: unknown) => {
            apiRef.current = eapi as typeof apiRef.current
            setApiReady(true)
          }}
          initialData={{ elements: initialScene as never, appState: EXCALIDRAW_CONFIG.newRoomAppState }}
        />

        {/* Pannello del tool, ancorato sulla lavagna: la sua superficie è l'iframe
            srcdoc dell'entry del tool (breadboard + LED). Sandbox come ToolFrame:
            allow-scripts + allow-same-origin (origin = Studio → postHello consegna). */}
        <div className="reference-tool-panel">
          <div className="reference-tool-panel-bar">
            <span className="reference-tool-dot" data-on={toolReady ? "1" : "0"} aria-hidden />
            Reference Sim · breadboard
          </div>
          {apiReady && (
            <iframe
              ref={frameRef}
              title={manifest.name}
              className="reference-tool-frame"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={entryHtml}
              onLoad={handleFrameLoad}
            />
          )}
        </div>
      </div>
    </div>
  )
}
