import { useState, useRef, type CSSProperties } from "react"
import { Excalidraw, convertToExcalidrawElements, serializeAsJSON } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import MathComposer from "./MathComposer"
import { latexToImage } from "./latexToImage"

// Room id nello hash dell'URL: il link che mandi allo studente apre la STESSA stanza video.
function getRoomId(): string {
  let h = location.hash.replace(/^#/, "").trim()
  if (!h) {
    h = "wbstudio-" + Math.random().toString(36).slice(2, 9)
    location.hash = h
  }
  return h
}

export default function Room() {
  const [room] = useState(getRoomId)
  const [videoOn, setVideoOn] = useState(false)
  const [mathOn, setMathOn] = useState(false)
  const [copied, setCopied] = useState(false)
  const [api, setApi] = useState<any>(null)
  const [saved, setSaved] = useState(false)

  // Persistenza locale per-stanza: la lezione NON sparisce al refresh (la lezione resta tua).
  // Fase-0 = localStorage (per-browser). Sync cross-device/cloud = Fase-1 (Supabase).
  const STORAGE_KEY = `studio-scene:${room}`
  const [initialData] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null } catch { return null }
  })
  const saveTimer = useRef<number | null>(null)
  function persist(elements: any, appState: any, files: any) {
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, serializeAsJSON(elements, appState, files, "local"))
        setSaved(true); window.setTimeout(() => setSaved(false), 1200)
      } catch { /* quota/serialize: non bloccare la lezione */ }
    }, 700)
  }

  // Inserisce la formula come immagine SVG sulla lavagna Excalidraw.
  async function insertMath(latex: string) {
    if (!api || !latex.trim()) return
    const { dataURL, width, height } = await latexToImage(latex)
    const fileId = (crypto.randomUUID?.() ?? String(Math.random()).slice(2)) as string
    api.addFiles([{ id: fileId, dataURL, mimeType: "image/svg+xml", created: Date.now(), lastRetrieved: Date.now() }])
    const els = convertToExcalidrawElements([{ type: "image", x: 160, y: 120, width, height, fileId } as any])
    api.updateScene({ elements: [...api.getSceneElements(), ...els] })
  }
  const shareUrl = `${location.origin}${location.pathname}#${room}`

  function copyLink() {
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
          background: "#111", color: "#fff", fontFamily: "-apple-system,system-ui,sans-serif", fontSize: 14,
        }}
      >
        <strong style={{ letterSpacing: 0.3 }}>Studio</strong>
        <span style={{ opacity: 0.6 }}>·</span>
        <span style={{ opacity: 0.8 }}>stanza {room}</span>
        {saved && <span style={{ color: "#5fd38a", fontSize: 12 }}>✓ salvato</span>}
        <button onClick={copyLink} style={btn}>{copied ? "✓ copiato" : "copia link studente"}</button>
        <button onClick={() => setMathOn(v => !v)} style={{ ...btn, background: mathOn ? "#1763ff" : "#333" }}>∑ formula</button>
        <button onClick={() => setVideoOn(v => !v)} style={{ ...btn, marginLeft: "auto", background: videoOn ? "#e0245e" : "#1763ff" }}>
          {videoOn ? "chiudi video" : "avvia video"}
        </button>
      </header>

      <div style={{ flex: 1, position: "relative" }}>
        <Excalidraw excalidrawAPI={setApi} initialData={initialData ?? undefined} onChange={persist} />
        {mathOn && <MathComposer onClose={() => setMathOn(false)} onInsert={insertMath} />}
        {videoOn && <VideoPanel room={room} />}
      </div>
    </div>
  )
}

// Jitsi embeddato (video + audio + screen-share). Lo studente apre lo stesso link → stessa stanza.
function VideoPanel({ room }: { room: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  return (
    <iframe
      ref={ref}
      title="video"
      allow="camera; microphone; fullscreen; display-capture; autoplay"
      src={`https://meet.jit.si/${encodeURIComponent(room)}#config.prejoinPageEnabled=false`}
      style={{
        position: "absolute", right: 12, bottom: 12, width: 320, height: 240,
        border: "0", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,.35)", background: "#000", zIndex: 5,
      }}
    />
  )
}

const btn: CSSProperties = {
  border: 0, background: "#333", color: "#fff", padding: "6px 12px",
  borderRadius: 8, fontSize: 13, cursor: "pointer",
}
