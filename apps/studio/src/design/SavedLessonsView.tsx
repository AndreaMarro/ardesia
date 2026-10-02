// L'alias storico ?vista=lezioni-salvate ospita la superficie Founder Beta
// Materiali. Il flusso è locale e deliberato: export, preview read-only,
// commit e recovery sono quattro porte distinte.

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import ViewNav from "./ViewNav"
import EmptyState from "./EmptyState"
import { workspaceStore, type WorkspaceStore } from "../store/WorkspaceStore"
import { createEventLogStore, IndexedDbEventLog } from "../lessonos/indexedDbEventLog"
import type { EnvelopeEventLogStore, EventLogStore } from "../lessonos/eventlog"
import type {
  ImportLessonResult,
  LessonImportPreview,
  LessonOsRestoreStatus,
} from "../store/lessonBundle"
import { validateProductRoomId } from "../store/roomPaths"

type MaterialsStore = Pick<
  WorkspaceStore,
  | "mode"
  | "init"
  | "connectFolder"
  | "exportLesson"
  | "previewLessonBlobForRoom"
  | "importLessonBlobForRoom"
  | "recoverPendingLessonImport"
>

type MaterialsEventLog = EventLogStore &
  EnvelopeEventLogStore &
  Readonly<{ close?: () => Promise<void> }>

export type SavedLessonsViewProps = Readonly<{
  store?: MaterialsStore
  eventLogFactory?: () => Promise<MaterialsEventLog>
  download?: (blob: Blob, filename: string) => void
}>

function selectedRoom(): string | null {
  try {
    if (typeof window === "undefined") return null
    const room = window.location.hash.replace(/^#/, "")
    return room === "" ? null : validateProductRoomId(room)
  } catch {
    return null
  }
}

function downloadInBrowser(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.style.display = "none"
  document.body.appendChild(link)
  try {
    link.click()
  } finally {
    link.remove()
    URL.revokeObjectURL(url)
  }
}

function restoreMessage(status: LessonOsRestoreStatus): string {
  switch (status.kind) {
    case "restored":
      return `Import completato: ${status.recovered} eventi LessonOS ripristinati.`
    case "no-snapshot":
      return "Import completato: il bundle non contiene memoria LessonOS."
    case "not-attempted":
      return "Import completato: ripristino LessonOS non richiesto."
    case "unsupported":
      return "Import completato: questo browser non supporta il ripristino LessonOS."
    case "skipped-non-empty":
      return "Import completato: la memoria LessonOS esistente non è stata unita."
    case "failed":
      return `Import annullato e workspace ripristinato: ${status.error}`
  }
}

function identityLabel(preview: LessonImportPreview): string {
  if (preview.identity.kind === "unassigned") return "Legacy non assegnato"
  return preview.identity.lessonId
}

function resultFailed(result: ImportLessonResult): boolean {
  return result.lessonOsRestore.kind === "failed"
}

export default function SavedLessonsView({
  store = workspaceStore,
  eventLogFactory = createEventLogStore,
  download = downloadInBrowser,
}: SavedLessonsViewProps) {
  const room = useMemo(selectedRoom, [])
  const [eventLog, setEventLog] = useState<MaterialsEventLog | null>(null)
  const [loading, setLoading] = useState(room !== null)
  const [mode, setMode] = useState<string>(store.mode)
  const [busy, setBusy] = useState<"folder" | "export" | "preview" | "commit" | "recovery" | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<LessonImportPreview | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const operationActive = useRef(false)

  useEffect(() => {
    if (room === null) return
    let cancelled = false
    let openedLog: MaterialsEventLog | null = null
    void (async () => {
      try {
        await store.init()
        openedLog = await eventLogFactory()
        if (cancelled) {
          await openedLog.close?.()
          return
        }
        setMode(store.mode)
        setEventLog(openedLog)
      } catch (cause) {
        if (!cancelled) {
          setError(`Archivio locale non disponibile: ${cause instanceof Error ? cause.message : String(cause)}`)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
      if (openedLog !== null) void openedLog.close?.()
    }
  }, [eventLogFactory, room, store])

  const run = async (kind: NonNullable<typeof busy>, operation: () => Promise<void>) => {
    if (operationActive.current) return
    operationActive.current = true
    setBusy(kind)
    setError(null)
    setMessage(null)
    try {
      await operation()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      operationActive.current = false
      setBusy(null)
    }
  }

  const previewFile = async (file: File, legacyClaim?: Readonly<{ userConfirmed: true }>) => {
    if (room === null) return
    setSelectedFile(file)
    setPreview(null)
    await run("preview", async () => {
      const next = await store.previewLessonBlobForRoom(file, room, legacyClaim)
      setPreview(next)
      setMessage(next.commitReady
        ? "Bundle verificato. Il commit richiede una conferma separata."
        : "Bundle verificato, ma una recovery deve essere completata prima del commit.")
    })
  }

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ""
    if (file) void previewFile(file)
  }

  const handleExport = () => {
    if (room === null) return
    void run("export", async () => {
      // Acquire current canonical memory for this click, independently of the
      // mounted handle: like RecapView, export requires persistence and never
      // substitutes an unavailable backend with the general factory's empty
      // in-memory fallback. A silent fallback would become a verified-empty
      // bundle presented as a successful export.
      const log = new IndexedDbEventLog()
      let blob: Blob
      try {
        await log.open()
        blob = await store.exportLesson(room, log)
      } finally {
        await log.close()
      }
      download(blob, `lezione-${room}.lesson`)
      setMessage("Export .lesson creato e legato alla lezione corrente.")
    })
  }

  const handleConnectFolder = () => {
    void run("folder", async () => {
      if (!await store.connectFolder()) {
        throw new Error("Cartella non collegata: selezione annullata o browser non supportato.")
      }
      setMode(store.mode)
      setMessage("Cartella locale collegata.")
    })
  }

  const handleCommit = () => {
    if (
      room === null ||
      eventLog === null ||
      selectedFile === null ||
      preview?.commitReady !== true ||
      preview.identity.kind === "unassigned"
    ) return
    void run("commit", async () => {
      const result = preview.identity.kind === "claimed"
        ? await store.importLessonBlobForRoom(
          selectedFile,
          room,
          eventLog,
          { userConfirmed: true },
        )
        : await store.importLessonBlobForRoom(selectedFile, room, eventLog)
      const outcome = restoreMessage(result.lessonOsRestore)
      if (resultFailed(result)) {
        setError(outcome)
        return
      }
      setMessage(outcome)
      setPreview(null)
      setSelectedFile(null)
    })
  }

  const handleRecovery = () => {
    if (eventLog === null || selectedFile === null) return
    void run("recovery", async () => {
      const status = await store.recoverPendingLessonImport(eventLog)
      if (status?.kind === "failed") {
        setError(restoreMessage(status))
      }
      const next = room === null
        ? null
        : await store.previewLessonBlobForRoom(
          selectedFile,
          room,
          preview?.identity.kind === "claimed" ? { userConfirmed: true } : undefined,
        )
      setPreview(next)
      if (next?.commitReady) setMessage("Recovery completata. Il bundle può essere importato.")
    })
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
          <span className="st-name-text">Materiali locali</span>
        </span>
        <ViewNav current="lezioni-salvate" />
      </header>

      <main style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {room === null ? (
          <EmptyState
            tone="error"
            title="Nessuna lezione selezionata"
            detail="La superficie Materiali non inventa una stanza: aprila dalla lezione corrente."
            hint="Torna a Lezione e usa il link Materiali mantenendo lo stesso hash stanza."
          />
        ) : loading ? (
          <EmptyState
            title="Apro l'archivio locale"
            detail="La lezione resta sul dispositivo; nessun contenuto viene inviato a un backend."
          />
        ) : (
          <div style={contentStyle}>
            <section style={cardStyle} aria-labelledby="materials-current-title">
              <div style={sectionHeadingStyle}>
                <div>
                  <h1 id="materials-current-title" style={titleStyle}>Lezione {room}</h1>
                  <p style={mutedStyle}>Archivio: {mode}. Export e import usano il bundle aperto .lesson.</p>
                </div>
                <button
                  type="button"
                  className="st-ghost"
                  disabled={busy !== null}
                  onClick={handleConnectFolder}
                >
                  {busy === "folder" ? "collego…" : "Collega cartella"}
                </button>
              </div>
              <div style={actionRowStyle}>
                <a className="st-ghost" href={`/?vista=recap#${room}`}>
                  Rivedi il recap stampabile
                </a>
                <button
                  type="button"
                  className="st-primary"
                  disabled={busy !== null || eventLog === null}
                  onClick={handleExport}
                >
                  {busy === "export" ? "Esporto…" : "Esporta .lesson"}
                </button>
                <label style={fileLabelStyle}>
                  Seleziona bundle .lesson
                  <input
                    type="file"
                    accept=".lesson,application/zip"
                    aria-label="Seleziona bundle .lesson"
                    disabled={busy !== null || eventLog === null}
                    onChange={handleFile}
                  />
                </label>
              </div>
            </section>

            {preview !== null && (
              <section style={cardStyle} aria-labelledby="materials-preview-title">
                <h2 id="materials-preview-title" style={titleStyle}>Anteprima import</h2>
                <dl style={factsStyle}>
                  <div><dt style={termStyle}>Identità</dt><dd style={valueStyle}>{identityLabel(preview)}</dd></div>
                  <div><dt style={termStyle}>LessonOS</dt><dd style={valueStyle}>{preview.lessonOs}</dd></div>
                  <div>
                    <dt style={termStyle}>Manifest</dt>
                    <dd style={valueStyle}>
                      {preview.manifest === null
                        ? "legacy"
                        : `v${preview.manifest.schemaVersion} · SHA ${preview.manifest.producer.commitSha.slice(0, 12)}`}
                    </dd>
                  </div>
                </dl>
                <ul style={fileListStyle} aria-label="File verificati nel bundle">
                  {preview.files.map((file) => (
                    <li key={`${file.sourcePath}:${file.targetPath}`} style={fileRowStyle}>
                      <span>
                        <strong>{file.sourcePath}</strong>
                        <small style={fileTargetStyle}>{file.targetPath} · {file.bytes} byte</small>
                      </span>
                      <span style={badgeStyle}>{file.action === "create" ? "Crea" : "Sostituisce"}</span>
                    </li>
                  ))}
                </ul>
                {preview.pendingRecovery !== null && (
                  <div role="alert" style={recoveryStyle}>
                    <strong>Recovery pendente: {preview.pendingRecovery.phase}</strong>
                    <span>Transazione {preview.pendingRecovery.id}. Il commit resta bloccato.</span>
                    <button
                      type="button"
                      className="st-ghost"
                      disabled={busy !== null}
                      onClick={handleRecovery}
                    >
                      {busy === "recovery" ? "Riprendo…" : "Riprendi recovery"}
                    </button>
                  </div>
                )}
                {preview.identity.kind === "unassigned" && (
                  <div role="alert" style={recoveryStyle}>
                    <strong>Bundle legacy senza identità</strong>
                    <span>La destinazione non viene dedotta: conferma la stanza e ripeti la preview.</span>
                    <button
                      type="button"
                      className="st-ghost"
                      disabled={busy !== null || selectedFile === null}
                      onClick={() => {
                        if (selectedFile) void previewFile(selectedFile, { userConfirmed: true })
                      }}
                    >
                      Assegna alla lezione {room}
                    </button>
                  </div>
                )}
                <div style={actionRowStyle}>
                  <button
                    type="button"
                    className="st-primary"
                    disabled={
                      busy !== null ||
                      !preview.commitReady ||
                      preview.identity.kind === "unassigned"
                    }
                    onClick={handleCommit}
                  >
                    {busy === "commit" ? "Importo…" : "Importa il bundle"}
                  </button>
                  <span style={mutedStyle}>Il preview non modifica la lezione.</span>
                </div>
              </section>
            )}

            {error !== null && <p role="alert" style={errorStyle}>{error}</p>}
            {message !== null && <p role="status" style={messageStyle}>{message}</p>}
          </div>
        )}
      </main>
    </div>
  )
}

const contentStyle = { maxWidth: 900, margin: "0 auto", display: "grid", gap: 16 } as const
const cardStyle = {
  background: "var(--m-surface, #fff)",
  border: "1px solid var(--m-line, #d9e0e7)",
  borderRadius: 12,
  padding: 18,
  display: "grid",
  gap: 16,
} as const
const sectionHeadingStyle = { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" } as const
const titleStyle = { margin: 0, color: "var(--m-ink, #1f2c3a)", fontSize: 20 } as const
const mutedStyle = { margin: 0, color: "var(--m-ink-2, #5c6b7a)", fontSize: 13 } as const
const actionRowStyle = { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" } as const
const fileLabelStyle = { display: "grid", gap: 5, fontSize: 13, color: "var(--m-ink-2, #5c6b7a)" } as const
const factsStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, margin: 0 } as const
const termStyle = { fontSize: 12, color: "var(--m-ink-3, #718096)", textTransform: "uppercase" } as const
const valueStyle = { margin: "3px 0 0", fontWeight: 650, overflowWrap: "anywhere" } as const
const fileListStyle = { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 } as const
const fileRowStyle = { display: "flex", justifyContent: "space-between", gap: 12, padding: 10, borderRadius: 8, background: "var(--m-fill, #f4f6f8)" } as const
const fileTargetStyle = { display: "block", marginTop: 3, color: "var(--m-ink-3, #718096)" } as const
const badgeStyle = { alignSelf: "start", padding: "3px 7px", borderRadius: 999, background: "var(--m-accent-wash, #e9f2fb)", fontSize: 12 } as const
const recoveryStyle = { display: "grid", gap: 8, padding: 12, border: "1px solid var(--m-warning, #ad6b00)", borderRadius: 8 } as const
const errorStyle = { margin: 0, color: "var(--m-error, #a12b2b)" } as const
const messageStyle = { margin: 0, color: "var(--m-success, #216e4e)" } as const
