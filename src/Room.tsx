import { useState, useRef, useEffect, type CSSProperties, type ChangeEvent } from "react"
import { Excalidraw, convertToExcalidrawElements, serializeAsJSON } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import MathComposer from "./MathComposer"
import { latexToImage } from "./latexToImage"
import { imageToDataURL, pdfToImages } from "./loadFile"
import { workspaceStore, type WorkspaceStore } from "./store/WorkspaceStore"
import { JournalRecorder } from "./store/JournalRecorder"
import { ReplayEngine, serializeEvents, deserializeEvents } from "./store/ReplayEngine"

// Room id nello hash dell'URL: il link che mandi allo studente apre la STESSA stanza video.
function getRoomId(): string {
  let h = location.hash.replace(/^#/, "").trim()
  if (!h) {
    h = "wbstudio-" + Math.random().toString(36).slice(2, 9)
    location.hash = h
  }
  return h
}

export default function Room({ store }: { store?: WorkspaceStore }) {
  const actualStore = store ?? workspaceStore
  const [room] = useState(getRoomId)
  const [mathOn, setMathOn] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [storageError, setStorageError] = useState<string | null>(null)
  /** Dati scena caricati async dallo store (null = nessun dato salvato) */
  const [sceneData, setSceneData] = useState<any>(null)

  const apiRef = useRef<any>(null)
  const saveTimer = useRef<number | null>(null)
  // Flag per evitare che persist() richiami saveScene durante il caricamento iniziale
  const initialLoadDone = useRef(false)
  // Riferimento al JournalRecorder (creato dopo init store)
  const journalRef = useRef<JournalRecorder | null>(null)
  // Unsubscribe handle per pointer events Excalidraw
  const unsubsRef = useRef<Array<() => void>>([])
  // Promise-chain mutex per serializzare salvataggi async sovrapposti
  const _pendingSave = useRef<Promise<void>>(Promise.resolve())

  // All'avvio, inizializza lo store e carica la scena dal driver attivo (FSA → localStorage).
  // Excalidraw monta SOLO dopo il caricamento (render condizionale), evitando race condition
  // sul ciclo di vita di Excalidraw: initialData è sempre al primo mount.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    actualStore.init()
      .then(() => {
        if (cancelled) return
        // Crea JournalRecorder dopo init store
        const jr = new JournalRecorder(actualStore)
        journalRef.current = jr
        return actualStore.loadScene(room)
      })
      .then((data) => {
        if (cancelled) return
        if (data) {
          try {
            const parsed = JSON.parse(data)
            setSceneData(parsed)
            // Seed journal con elementi esistenti: NON registrarli come element.add
            // Deve avvenire PRIMA di initialLoadDone=true per evitare che handleChange
            // registri la scena caricata come nuovi eventi.
            const jr = journalRef.current
            if (jr && parsed?.elements) {
              jr.seed(parsed.elements)
            }
          } catch {
            // JSON malformato — si parte da zero
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setStorageError("Caricamento scena fallito: " + (err as Error).message)
        }
      })
      .finally(() => {
        if (!cancelled) {
          initialLoadDone.current = true
          setLoading(false)
          // Esponi test harness per Playwright kill-test (solo dev)
          if (import.meta.env.DEV) {
            ;(window as any).__MAESTRO_TEST__ = {
              ready: true,
              room,
              store: actualStore,
              recorder: journalRef.current,
              apiRef,
              ReplayEngine,
              serializeEvents,
              deserializeEvents,
              PATHS: { JOURNAL: "raw/events.jsonl", SCENE: "raw/board.excalidraw" },
            }
          }
        }
      })
    return () => {
      cancelled = true
      // Pulisci il debounce timer persist() se ancora in sospeso
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current)
        saveTimer.current = null
      }
      // Flush journal rimanente e unsubscribe pointer events
      journalRef.current?.flush()
      journalRef.current = null
      // Pulisci tutte le subscription Excalidraw (onPointerDown/onPointerUp)
      for (const unsub of unsubsRef.current) {
        unsub()
      }
      unsubsRef.current = []
    }
  }, [room, actualStore])

  // Persistenza via WorkspaceStore.
  // La scena viene salvata sul driver attivo (FSA → localStorage come cache/fallback).
  // Gestione quota 5MB esplicita e visibile — MAI try/catch muto.
  // Promise-chain mutex serializza salvataggi async sovrapposti.
  function persist(elements: any, appState: any, files: any) {
    if (!initialLoadDone.current) return // ignora onChange durante il caricamento iniziale
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      _pendingSave.current = _pendingSave.current.then(async () => {
        try {
          const serialized = serializeAsJSON(elements, appState, files, "local")
          await actualStore.saveScene(room, serialized)
          setStorageError(null)
          setSaved(true)
          window.setTimeout(() => setSaved(false), 1200)
        } catch (err) {
          // Quota esaurita o errore di scrittura — mostra all'utente, MAI try/catch muto
          setStorageError("Salvataggio non riuscito: " + (err as Error).message)
        }
      })
    }, 700)
  }

  /** Handler composito: salva scena + registra eventi journal.
   *  Non registra eventi durante il caricamento iniziale: la scena caricata
   *  è già stata seedata dal then() di loadScene prima che initialLoadDone diventi true. */
  function handleChange(elements: any, appState: any, files: any) {
    persist(elements, appState, files)
    if (!initialLoadDone.current) return
    journalRef.current?.recordChange(elements)
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Aggiunge N immagini sulla lavagna Excalidraw in un solo update (math, immagini, pagine-PDF).
  function addImages(items: { dataURL: string; mimeType: string; width: number; height: number; x: number; y: number }[]) {
    if (!apiRef.current || !items.length) return
    const files = items.map((it) => {
      const id = (crypto.randomUUID?.() ?? String(Math.random()).slice(2)) as string
      return { ...it, _id: id, file: { id, dataURL: it.dataURL, mimeType: it.mimeType, created: Date.now(), lastRetrieved: Date.now() } }
    })
    apiRef.current.addFiles(files.map((f) => f.file))
    const els = convertToExcalidrawElements(
      files.map((f) => ({ type: "image", x: f.x, y: f.y, width: f.width, height: f.height, fileId: f._id }) as any)
    )
    apiRef.current.updateScene({ elements: [...apiRef.current.getSceneElements(), ...els] })
  }

  // Formula → immagine SVG sulla lavagna.
  async function insertMath(latex: string) {
    if (!apiRef.current || !latex.trim()) return
    const { dataURL, width, height } = await latexToImage(latex)
    addImages([{ dataURL, mimeType: "image/svg+xml", width, height, x: 160, y: 120 }])
    journalRef.current?.recordMathInsert(latex)
  }

  // Carica immagine o PDF → sulla lavagna (PDF = una pagina-immagine ciascuna, impilate).
  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file || !apiRef.current) return
    try {
      if (file.type === "application/pdf") {
        const pages = await pdfToImages(file)
        let y = 100
        const items = pages.map((p) => {
          const width = Math.min(720, p.width)
          const height = Math.round(width * (p.height / p.width))
          const it = { dataURL: p.dataURL, mimeType: "image/png", width, height, x: 160, y }
          y += height + 24
          return it
        })
        addImages(items)
      } else if (file.type.startsWith("image/")) {
        const { dataURL, width, height } = await imageToDataURL(file)
        const w = Math.min(600, width)
        const h = Math.round(w * (height / width))
        addImages([{ dataURL, mimeType: file.type, width: w, height: h, x: 160, y: 120 }])
      } else {
        alert("Formato non supportato (usa immagine o PDF).")
      }
    } catch (err) {
      alert("Caricamento non riuscito: " + (err as Error).message)
    }
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
        {loading && <span style={{ color: "#888", fontSize: 12 }}>caricamento…</span>}
        {saved && <span style={{ color: "#5fd38a", fontSize: 12 }}>✓ salvato</span>}
        {storageError && (
          <span
            style={{ color: "#ff6b6b", fontSize: 12, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            title={storageError}
          >
            ⚠ {storageError}
          </span>
        )}
        <button onClick={copyLink} style={btn}>{copied ? "✓ copiato" : "copia link studente"}</button>
        <button onClick={() => setMathOn(v => !v)} style={{ ...btn, background: mathOn ? "#1763ff" : "#333" }}>∑ formula</button>
        <button onClick={() => fileInputRef.current?.click()} style={btn}>carica img/PDF</button>
        <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={handleFile} />
        {/* Video = Google Meet ESTERNO (decisione Andrea 10/06): niente embed; lo strumento è la lavagna. */}
        <button onClick={() => window.open("https://meet.google.com/new", "_blank", "noopener")} style={{ ...btn, marginLeft: "auto", background: "#1763ff" }}>
          apri Meet
        </button>
      </header>

      <div style={{ flex: 1, position: "relative" }}>
        {/* Excalidraw monta SOLO dopo il caricamento: initialData al primo mount = scena restorata correttamente.
            Se sceneData è null e loading è false, initialData=undefined = scena vuota. */}
        {!loading && (
          <Excalidraw
            excalidrawAPI={(eapi) => {
              apiRef.current = eapi
              // Sottoscrivi pointer events per journal t0/t1
              if (typeof eapi.onPointerDown === "function") {
                const unsubDown = eapi.onPointerDown(() => {
                  journalRef.current?.recordPointerDown()
                })
                unsubsRef.current.push(unsubDown)
              }
              if (typeof eapi.onPointerUp === "function") {
                const unsubUp = eapi.onPointerUp(() => {
                  journalRef.current?.recordPointerUp()
                })
                unsubsRef.current.push(unsubUp)
              }
            }}
            initialData={sceneData ?? undefined}
            onChange={handleChange}
          />
        )}
        {mathOn && <MathComposer onClose={() => setMathOn(false)} onInsert={insertMath} />}
      </div>
    </div>
  )
}

const btn: CSSProperties = {
  border: 0, background: "#333", color: "#fff", padding: "6px 12px",
  borderRadius: 8, fontSize: 13, cursor: "pointer",
}
