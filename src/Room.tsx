import { useState, useRef, useEffect, type ChangeEvent } from "react"
import { Excalidraw, MainMenu, WelcomeScreen, convertToExcalidrawElements, serializeAsJSON } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import { EXCALIDRAW_CONFIG } from "./design/excalidrawConfig"
import MathComposer from "./MathComposer"
import { latexToImage } from "./latexToImage"
import { imageToDataURL, pdfToImages } from "./loadFile"
import { workspaceStore, type WorkspaceStore } from "./store/WorkspaceStore"
import { type StorageUsage } from "./store/types"
import { JournalRecorder } from "./store/JournalRecorder"
import { ReplayEngine, serializeEvents, deserializeEvents } from "./store/ReplayEngine"
import { AudioRecorder } from "./store/AudioRecorder"

// Room id nello hash dell'URL: il link che mandi allo studente apre la STESSA stanza video.
function getRoomId(): string {
  let h = location.hash.replace(/^#/, "").trim()
  if (!h) {
    h = "wbstudio-" + Math.random().toString(36).slice(2, 9)
    location.hash = h
  }
  return h
}

/** Clock condiviso tra JournalRecorder e AudioRecorder (stesso epoch) */
function sharedClock(): number {
  return Date.now()
}

export default function Room({ store }: { store?: WorkspaceStore }) {
  const actualStore = store ?? workspaceStore
  const [room] = useState(getRoomId)
  const [mathOn, setMathOn] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [storageError, setStorageError] = useState<string | null>(null)
  /** Audio toggle: default OFF (GDPR by design — nessuna registrazione nascosta) */
  const [audioOn, setAudioOn] = useState(false)
  /** Mostra stato registrazione nell'header */
  const [audioRecording, setAudioRecording] = useState(false)
  /** Stato export .lesson */
  const [exporting, setExporting] = useState(false)
  /** Uso/quota storage (null = quota non applicabile, es. FSA) */
  const [quota, setQuota] = useState<StorageUsage | null>(null)
  /** Dati scena caricati async dallo store (null = nessun dato salvato) */
  const [sceneData, setSceneData] = useState<any>(null)

  const apiRef = useRef<any>(null)
  const saveTimer = useRef<number | null>(null)
  // Flag per evitare che persist() richiami saveScene durante il caricamento iniziale
  const initialLoadDone = useRef(false)
  // Riferimento al JournalRecorder (creato dopo init store)
  const journalRef = useRef<JournalRecorder | null>(null)
  // Riferimento all'AudioRecorder (creato dopo init store)
  const audioRecorderRef = useRef<AudioRecorder | null>(null)
  // Unsubscribe handle per pointer events Excalidraw
  const unsubsRef = useRef<Array<() => void>>([])
  // Promise-chain mutex per serializzare salvataggi async sovrapposti
  const _pendingSave = useRef<Promise<void>>(Promise.resolve())

  // All'avvio, inizializza lo store e carica la scena dal driver attivo (FSA → localStorage).
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    actualStore.init()
      .then(() => {
        if (cancelled) return
        const clock = sharedClock

        // Crea JournalRecorder dopo init store con clock condiviso
        const jr = new JournalRecorder(actualStore, clock)
        journalRef.current = jr

        // Crea AudioRecorder con clock condiviso
        const ar = new AudioRecorder({
          store: actualStore,
          clock,
          onChunk: (chunkIndex, startEpoch, endEpoch) => {
            jr.recordAudioChunk(chunkIndex, startEpoch, endEpoch)
          },
        })
        audioRecorderRef.current = ar

        return actualStore.loadScene(room)
      })
      .then((data) => {
        if (cancelled) return
        if (data) {
          try {
            const parsed = JSON.parse(data)
            // valori JSON falsy ("" / 0 / false) o non-oggetto = scena corrotta: parti da zero
            if (!parsed || typeof parsed !== "object") throw new Error("scena non valida")
            setSceneData(parsed)
            // Seed journal con elementi esistenti: NON registrarli come element.add
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
          actualStore.storageUsage()
            .then((u) => { if (!cancelled) setQuota(u) })
            .catch(() => {})
          // Esponi test harness per Playwright kill-test (solo dev)
          if (import.meta.env.DEV) {
            ;(window as any).__MAESTRO_TEST__ = {
              ready: true,
              room,
              store: actualStore,
              recorder: journalRef.current,
              audioRecorder: audioRecorderRef.current,
              apiRef,
              ReplayEngine,
              serializeEvents,
              deserializeEvents,
              AudioRecorder,
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
      // Flush journal rimanente e dispose AudioRecorder
      journalRef.current?.flush().catch(() => {})
      audioRecorderRef.current?.dispose()
      journalRef.current = null
      audioRecorderRef.current = null
      // Pulisci tutte le subscription Excalidraw (onPointerDown/onPointerUp)
      for (const unsub of unsubsRef.current) {
        unsub()
      }
      unsubsRef.current = []
    }
  }, [room, actualStore])

  // Persistenza via WorkspaceStore.
  function persist(elements: any, appState: any, files: any) {
    if (!initialLoadDone.current) return
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      _pendingSave.current = _pendingSave.current.then(async () => {
        try {
          const serialized = serializeAsJSON(elements, appState, files, "local")
          await actualStore.saveScene(room, serialized)
          setStorageError(null)
          setSaved(true)
          window.setTimeout(() => setSaved(false), 1200)
          actualStore.storageUsage().then(setQuota).catch(() => {})
        } catch (err) {
          setStorageError("Salvataggio non riuscito: " + (err as Error).message)
        }
      })
    }, 700)
  }

  /** Handler composito: salva scena + registra eventi journal */
  function handleChange(elements: any, appState: any, files: any) {
    persist(elements, appState, files)
    if (!initialLoadDone.current) return
    journalRef.current?.recordChange(elements)
  }

  /** Toggle audio: ON = chiede consenso + avvia registrazione, OFF = ferma */
  function toggleAudio() {
    const ar = audioRecorderRef.current
    if (!ar) return
    if (ar.consent) {
      // Spegni: la revoca CANCELLA i chunk (GDPR) — a fine purge aggiorna la quota
      ar.consent = false
      setAudioOn(false)
      setAudioRecording(false)
      ar.lastRevoke
        .then(() => actualStore.storageUsage().then(setQuota))
        .catch((err) => {
          setStorageError("Revoca dati audio fallita: " + (err as Error).message)
        })
    } else {
      // Accendi
      ar.consent = true
      setAudioOn(true)
      ar.start().then(() => {
        setAudioRecording(ar.recording)
        // Se start fallisce (permesso negato), reset stato
        if (!ar.recording) {
          setAudioOn(false)
        }
      })
    }
  }

  /** Export .lesson: genera ZIP e avvia download */
  async function handleExportLesson() {
    setExporting(true)
    try {
      const zipBlob = await actualStore.exportLesson(room)
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `lezione-${room}.lesson`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setStorageError("Export fallito: " + (err as Error).message)
    } finally {
      setExporting(false)
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function insertMath(latex: string) {
    if (!apiRef.current || !latex.trim()) return
    const { dataURL, width, height } = await latexToImage(latex)
    addImages([{ dataURL, mimeType: "image/svg+xml", width, height, x: 160, y: 120 }])
    journalRef.current?.recordMathInsert(latex)
  }

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
      <header className="st-bar">
        <div className="st-brand" title="MAESTRO Studio — la lavagna che ricorda">
          <span className="st-word">maestro</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-room" title="Stanza condivisa: chi apre il tuo link entra qui">{room}</span>

        <div className="st-status">
          {loading && <span className="st-quiet">caricamento…</span>}
          {!loading && saved && (
            <span className="st-savewrap"><span className="st-led" aria-hidden />salvato</span>
          )}
          {quota && (
            <span
              className="st-cache"
              title={`Cache locale ${(quota.usedBytes / 1048576).toFixed(1)}/${Math.round(quota.quotaBytes / 1048576)} MB — la fonte di verità è la cartella workspace`}
            >
              <span className="st-cachebar" data-warn={quota.usedBytes / quota.quotaBytes > 0.8 || undefined}>
                <span style={{ width: `${Math.min(100, (quota.usedBytes / quota.quotaBytes) * 100)}%` }} />
              </span>
            </span>
          )}
          {storageError && <span className="st-err" title={storageError}>⚠ {storageError}</span>}
        </div>

        <div className="st-actions">
          <button onClick={copyLink} className="st-ghost">{copied ? "✓ copiato" : "invita studente"}</button>
          <button onClick={() => setMathOn(v => !v)} className={`st-ghost${mathOn ? " st-on" : ""}`}>formula</button>
          <button onClick={() => fileInputRef.current?.click()} className="st-ghost">media</button>
          <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={handleFile} />
          {/* Audio toggle: default OFF (GDPR — nessuna registrazione nascosta) */}
          <button
            onClick={toggleAudio}
            className={audioOn ? (audioRecording ? "st-ghost st-rec" : "st-ghost st-on") : "st-ghost"}
            title="Registra SOLO il microfono del docente. Default spento."
          >
            {audioOn ? (audioRecording ? <><span className="st-recdot" aria-hidden />registrando</> : "audio attivo") : "audio"}
          </button>
          {/* Export .lesson: scarica lo ZIP con raw/ immutabile */}
          <button onClick={handleExportLesson} disabled={exporting} className="st-primary">
            {exporting ? "esporto…" : "esporta lezione"}
          </button>
          {/* Video = Google Meet ESTERNO (decisione Andrea 10/06): niente embed; lo strumento è la lavagna. */}
          <button onClick={() => window.open("https://meet.google.com/new", "_blank", "noopener")} className="st-ghost st-meet">
            Meet<span className="st-ext" aria-hidden>↗</span>
          </button>
        </div>
      </header>

      <div style={{ flex: 1, position: "relative" }}>
        {!loading && (
          <Excalidraw
            langCode={EXCALIDRAW_CONFIG.langCode}
            theme={EXCALIDRAW_CONFIG.theme}
            aiEnabled={EXCALIDRAW_CONFIG.aiEnabled}
            UIOptions={EXCALIDRAW_CONFIG.UIOptions}
            excalidrawAPI={(eapi) => {
              apiRef.current = eapi
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
            initialData={
              // i default MAESTRO stanno SOTTO l'appState salvato: una scena
              // senza appState (import/export esterni) non perde Nunito/ink/canvas
              sceneData
                ? { ...sceneData, appState: { ...EXCALIDRAW_CONFIG.newRoomAppState, ...sceneData.appState } }
                : { appState: EXCALIDRAW_CONFIG.newRoomAppState }
            }
            onChange={handleChange}
          >
            {/* MainMenu custom: SOLO ClearCanvas + SaveAsImage — zero Socials/link/Dark-mode */}
            <MainMenu>
              <MainMenu.DefaultItems.ClearCanvas />
              <MainMenu.DefaultItems.SaveAsImage />
            </MainMenu>
            <WelcomeScreen>
              <WelcomeScreen.Center>
                <div className="st-brand st-welcome-brand">
                  <span className="st-word">maestro</span>
                  <span className="st-bdot" aria-hidden />
                  <span className="st-sub">studio</span>
                </div>
                <WelcomeScreen.Center.Heading>
                  <span className="st-welcome-heading">La lavagna che ricorda la tua lezione</span>
                </WelcomeScreen.Center.Heading>
                <div className="st-welcome-guide">
                  <p>Tutto quello che scrivi si salva da solo, qui sul tuo computer.</p>
                  <p>Per le formule premi «formula», per slide e immagini «media».</p>
                  <p>L'audio parte solo se lo accendi tu, dal bottone «audio».</p>
                </div>
              </WelcomeScreen.Center>
              <WelcomeScreen.Hints.ToolbarHint>
                <p className="st-welcome-hint">Scegli una penna e inizia</p>
              </WelcomeScreen.Hints.ToolbarHint>
            </WelcomeScreen>
          </Excalidraw>
        )}
        {mathOn && <MathComposer onClose={() => setMathOn(false)} onInsert={insertMath} />}
      </div>
    </div>
  )
}

