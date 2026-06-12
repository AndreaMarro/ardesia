import { useState, useRef, useEffect, useCallback, useMemo, type ChangeEvent, type KeyboardEvent } from "react"
import { Excalidraw, MainMenu, WelcomeScreen, convertToExcalidrawElements, serializeAsJSON } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import { EXCALIDRAW_CONFIG } from "./design/excalidrawConfig"
import MathComposer from "./MathComposer"
import { latexToImage } from "./latexToImage"
import { imageToDataURL, pdfToImages } from "./loadFile"
import { workspaceStore, type WorkspaceStore } from "./store/WorkspaceStore"
import { type StorageMode } from "./store/types"
import { JournalRecorder } from "./store/JournalRecorder"
import { ReplayEngine, serializeEvents, deserializeEvents } from "./store/ReplayEngine"
import { IconAlert, IconCheck, IconArrowUpRight } from "./design/icons"
import { AudioRecorder } from "./store/AudioRecorder"
import { isStudentView } from "./store/studentView"
import { isRecapView } from "./store/isRecapView"
import RecapView from "./RecapView"

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
  // Snapshot a mount: la decisione vista studente/docente NON cambia tra render
  // (recorder creati una volta sola nell'effect — UI e storage devono restare coerenti)
  const studentView = useMemo(() => isStudentView(), [])
  const recapView = useMemo(() => isRecapView(), [])
  const [mathOn, setMathOn] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [storeMode, setStoreMode] = useState<StorageMode>("localStorage")
  /** Audio toggle: default OFF (GDPR by design — nessuna registrazione nascosta) */
  const [audioOn, setAudioOn] = useState(false)
  /** Mostra stato registrazione nell'header */
  const [audioRecording, setAudioRecording] = useState(false)
  /** Stato export .lesson */
  const [exporting, setExporting] = useState(false)
  /** Nome lezione (da meta.json) — null = non ancora caricato */
  const [lessonName, setLessonName] = useState<string | null>(null)
  /** Stato rename inline */
  const [editingName, setEditingName] = useState(false)
  /** Campo rename ref per focus */
  const renameInputRef = useRef<HTMLInputElement>(null)
  /** Refs per i dati scena più recenti (per flushPersist) */
  const latestElementsRef = useRef<any>(null)
  const latestAppStateRef = useRef<any>(null)
  const latestFilesRef = useRef<any>(null)
  /** Drawer lezioni */
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [rooms, setRooms] = useState<any[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
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

  // All'avvio, inizializza lo store e carica la scena dal driver attivo (localStorage).
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    actualStore.init()
      .then(() => {
        if (cancelled) return
        setStoreMode(actualStore.mode)

        // In vista studente/recap: niente JournalRecorder né AudioRecorder (sola lettura).
        if (!studentView && !recapView) {
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
        }

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
      // Il nome lezione serve solo all'header docente: in vista studente niente loadMeta
      .then(() => (studentView ? null : actualStore.loadMeta(room)))
      .then((meta) => {
        if (cancelled) return
        if (meta && meta.name) {
          setLessonName(meta.name)
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
              audioRecorder: audioRecorderRef.current,
              apiRef,
              ReplayEngine,
              serializeEvents,
              deserializeEvents,
              AudioRecorder,
              PATHS: { JOURNAL: "raw/events.jsonl", SCENE: "raw/board.excalidraw" },
              navigateToLesson,
              flushPersist,
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

  /** document.title: rec ← "● REC — maestro · studio", altrimenti "maestro · studio" */
  useEffect(() => {
    document.title = audioRecording ? "● REC — maestro · studio" : "maestro · studio"
  }, [audioRecording])

  // Persistenza via WorkspaceStore.
  // Aggiorna refs coi dati più recenti, poi debounce 700ms.
  function persist(elements: any, appState: any, files: any) {
    if (!initialLoadDone.current) return
    latestElementsRef.current = elements
    latestAppStateRef.current = appState
    latestFilesRef.current = files
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      _doSave()
    }, 700)
  }

  /** Esegue il salvataggio con i dati più recenti (dal debounce o da flush) */
  async function _doSave() {
    const elements = latestElementsRef.current
    const appState = latestAppStateRef.current
    const files = latestFilesRef.current
    if (!elements) return
    _pendingSave.current = _pendingSave.current.then(async () => {
      try {
        const serialized = serializeAsJSON(elements, appState, files, "local")
        await actualStore.saveScene(room, serialized)
        setStorageError(null)
        setSaved(true)
        window.setTimeout(() => setSaved(false), 1200)
      } catch (err) {
        setStorageError("Salvataggio non riuscito: " + (err as Error).message)
      }
    })
    await _pendingSave.current
  }

  /** Flush immediato: cancella il debounce e salva subito. Attende il completamento. */
  async function flushPersist() {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current)
      saveTimer.current = null
    }
    await _doSave()
  }

  /** Handler composito: salva scena + registra eventi journal */
  function handleChange(elements: any, appState: any, files: any) {
    persist(elements, appState, files)
    if (!initialLoadDone.current) return
    journalRef.current?.recordChange(elements)
  }

  /** Apre/chiude il drawer delle lezioni */
  async function toggleDrawer() {
    if (drawerOpen) {
      setDrawerOpen(false)
      return
    }
    setLoadingRooms(true)
    setDrawerOpen(true)
    try {
      const list = await actualStore.listRooms()
      setRooms(list)
    } catch (err) {
      setRooms([])
      setStorageError("Errore nel caricamento delle lezioni: " + (err as Error).message)
    } finally {
      setLoadingRooms(false)
    }
  }

  /** Naviga a un'altra lezione: flush persist + cambia hash + forza re-init */
  async function navigateToLesson(targetRoom: string) {
    if (targetRoom === room) {
      setDrawerOpen(false)
      return
    }
    // Flush prima di navigare: zero tratti persi
    await flushPersist()
    // Cambia hash — guidare re-init via room state
    location.hash = targetRoom
    setDrawerOpen(false)
    // Forza un re-mount pulito del componente
    window.location.reload()
  }

  /** Toggle audio: ON = chiede consenso + avvia registrazione, OFF = ferma */
  function toggleAudio() {
    const ar = audioRecorderRef.current
    if (!ar) return
    if (ar.consent) {
      // Spegni: la revoca CANCELLA i chunk (GDPR) — a fine purge aggiorna lo stato
      ar.consent = false
      setAudioOn(false)
      setAudioRecording(false)
      ar.lastRevoke
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

  /** Avvia rename inline del nome lezione */
  function startRename() {
    setEditingName(true)
    // Focus dopo render
    setTimeout(() => renameInputRef.current?.select(), 0)
  }

  /** Salva nome e esce da rename */
  function saveRename(newName: string) {
    const trimmed = newName.trim()
    if (!trimmed) return // nome vuoto = non salvare
    setLessonName(trimmed)
    setEditingName(false)
    actualStore.saveMeta(room, { v: 1, name: trimmed, createdAt: Date.now() }).catch((err) => {
      setStorageError("Salvataggio nome fallito: " + (err as Error).message)
    })
  }

  /** Collega una cartella FSA (showDirectoryPicker) su gesto esplicito utente */
  const handleConnectFolder = useCallback(async () => {
    setStorageError(null)
    try {
      const ok = await actualStore.connectFolder()
      if (ok) {
        setStoreMode("fsa")
      } else {
        setStorageError("Impossibile aprire la cartella. Chrome? Consenti il permesso.")
      }
    } catch (err) {
      setStorageError("Errore aprendo la cartella: " + (err as Error).message)
    }
  }, [actualStore])

  /** Export .lesson: genera ZIP e avvia download */
  async function handleExportLesson() {
    setExporting(true)
    try {
      const zipBlob = await actualStore.exportLesson(room)
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement("a")
      a.href = url
      // Usa il nome lezione (slugificato) se disponibile, altrimenti room id
      const slug = lessonName
        ? lessonName.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 48)
        : room
      a.download = `lezione-${slug}.lesson`
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
  const shareUrl = studentView
    ? `${location.origin}${location.pathname}#${room}`
    : `${location.origin}${location.pathname}?vista=studente#${room}`

  function copyLink() {
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return recapView ? (
    <RecapView store={actualStore} room={room} />
  ) : (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}>
      {studentView ? (
        /* Vista studente: solo wordmark + chip, niente bottoni docente */
        <header className="st-bar st-bar-student">
          <div className="st-brand" title="MAESTRO Studio — la lavagna che ricorda">
            <span className="st-word">maestro</span>
            <span className="st-bdot" aria-hidden />
            <span className="st-sub">studio</span>
          </div>
          <span className="st-chip-student">stai guardando la lavagna</span>
        </header>
      ) : (
      <header className="st-bar">
        <div className="st-brand" title="MAESTRO Studio — la lavagna che ricorda">
          <span className="st-word">maestro</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>

        {/* Nome lezione: editabile inline con matitina hover */}
        {editingName ? (
          <input
            ref={renameInputRef}
            className="st-name-input"
            defaultValue={lessonName ?? room}
            onBlur={(e) => saveRename(e.target.value)}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === "Enter") saveRename((e.target as HTMLInputElement).value)
              if (e.key === "Escape") setEditingName(false)
            }}
            autoFocus
          />
        ) : (
          <span
            className="st-name"
            title={lessonName ? `Rinomina: ${lessonName}` : `Assegna un nome a questa lezione (id: ${room})`}
            onClick={startRename}
          >
            <span className="st-name-text">{lessonName ?? room}</span>
            {!lessonName && <span className="st-name-prompt">dai un nome</span>}
          </span>
        )}

        <div className="st-status">
          {loading && <span className="st-quiet">caricamento…</span>}
          {!loading && (
            storeMode === "fsa"
              ? (
                <span className="st-indicator st-fsa" title="I tuoi dati vivono nella cartella che hai scelto">
                  <span className="st-led" aria-hidden />
                  salvato sul computer
                </span>
              )
              : (
                <span className="st-indicator st-local" title="Senza cartella, i dati restano solo in questo browser">
                  <span className="st-led" aria-hidden />
                  solo in questo browser
                  {" — "}
                  <button onClick={handleConnectFolder} className="st-indicator-connect">
                    scegli cartella…
                  </button>
                </span>
              )
          )}
          {saved && <span className="st-quiet">salvato</span>}
          {storageError && <span className="st-err" title={storageError}><IconAlert /> {storageError}</span>}
        </div>

        <div className="st-actions">
          <button onClick={copyLink} className="st-ghost" title="Copia il link per lo studente (vista sola-lettura)">{copied ? <><IconCheck /> copiato</> : "invita studente"}</button>
          <button onClick={() => setMathOn(v => !v)} className={`st-ghost${mathOn ? " st-on" : ""}`}>formula</button>
          <button onClick={() => fileInputRef.current?.click()} className="st-ghost">media</button>
          <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={handleFile} />
          <button onClick={toggleDrawer} className={`st-ghost${drawerOpen ? " st-on" : ""}`}>
            lezioni
          </button>
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
            Meet<span className="st-ext" aria-hidden><IconArrowUpRight /></span>
          </button>
        </div>
      </header>
      )}

      {/* RECSTRIP: striscia fissa 2px --m-rec sotto l'header quando registra */}
      {audioRecording && <div className="st-recstrip" data-rec-strip />}

      {/* Drawer lezioni */}
      {drawerOpen && (
        <div className="st-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="st-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="st-drawer-header">
              <span className="st-drawer-title">Lezioni</span>
              <button className="st-ghost st-drawer-close" onClick={() => setDrawerOpen(false)}>chiudi</button>
            </div>
            <div className="st-drawer-body">
              {loadingRooms ? (
                <span className="st-quiet">caricamento…</span>
              ) : rooms.length === 0 ? (
                <span className="st-quiet">Nessuna lezione salvata</span>
              ) : (
                rooms.map((r: any) => (
                  <div
                    key={r.room}
                    className={`st-card${r.room === room ? " st-card-current" : ""}`}
                    onClick={() => navigateToLesson(r.room)}
                  >
                    <div className="st-card-line">
                      <span className="st-card-name">{r.name}</span>
                      {r.room === room && <span className="st-card-badge">attuale</span>}
                    </div>
                    <div className="st-card-meta">
                      {new Date(r.mtime).toLocaleDateString("it-IT", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, position: "relative" }}>
        {!loading && studentView && !sceneData && (
          /* Vista studente senza scena salvata: mostra messaggio neutro */
          <div className="st-student-empty">
            <p>Segui la diretta su Meet</p>
          </div>
        )}
        {!loading && !(studentView && !sceneData) && (
          <Excalidraw
            langCode={EXCALIDRAW_CONFIG.langCode}
            theme={EXCALIDRAW_CONFIG.theme}
            aiEnabled={EXCALIDRAW_CONFIG.aiEnabled}
            viewModeEnabled={studentView}
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
            // In vista studente la lavagna è sola-lettura: nessun persist/journal
            onChange={studentView ? undefined : handleChange}
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
