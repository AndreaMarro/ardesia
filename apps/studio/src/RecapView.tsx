// MAESTRO-Studio — RecapView (riepilogo lezione)
// Route ?vista=recap per-lezione: titolo, durata, concetti, materiali esportati.
// Linguaggio docente: "appunti salvati" (sottotitolo), mai flush/cache.
// Ogni card ha una label propria (tempo / lavagna / formule), non ripetuta.

import { useState, useEffect, useMemo } from "react"
import { type WorkspaceStore } from "./store/WorkspaceStore"
import { buildRecap, formatDuration, type LessonRecap } from "./store/lessonRecap"
import { buildRecapHtml } from "./store/recapHtml"
import { createEventLogStore } from "./lessonos/indexedDbEventLog"
import { buildRoomStudyDigest, type StudyDigest } from "./lessonos/studyDigest"
import { lessonSlug } from "./lessonSlug"
import EmptyState from "./design/EmptyState"

interface RecapViewProps {
  store: WorkspaceStore
  room: string
}

/**
 * Lezione realmente vuota: nessun evento registrato (firstEventTime === null) e
 * nessun contenuto da riepilogare. La guardia su firstEventTime evita di marcare
 * "vuota" una lezione con sola attività registrata ma durata 0 (es. un singolo
 * audio.chunk: il recap non lo proietta, ma c'è stata attività — niente messaggio
 * fuorviante "torna alla lavagna"). I check sul contenuto coprono il caso di
 * elementi con timestamp corrotto (firstEventTime null ma aggregazioni > 0).
 */
function isRecapEmpty(r: LessonRecap): boolean {
  return (
    r.firstEventTime === null &&
    r.durationMs === 0 &&
    r.totalElementsAdded === 0 &&
    r.mathFormulas.length === 0 &&
    r.pdfPagesViewed.length === 0
  )
}

export default function RecapView({ store, room }: RecapViewProps) {
  const [recap, setRecap] = useState<LessonRecap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [digest, setDigest] = useState<StudyDigest | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    // Digesto di studio (concetti + errori break→explain) dal log LessonOS,
    // room-scoped. Fail-soft: senza log leggibile il materiale resta valido
    // senza le sezioni pedagogiche.
    void (async () => {
      try {
        const log = await createEventLogStore()
        const events = await log.readAll()
        if (!cancelled) setDigest(buildRoomStudyDigest(events, room))
        if ("close" in log) await (log as { close(): Promise<void> }).close()
      } catch {
        /* fail-soft: nessun digesto */
      }
    })()
    buildRecap(store, room)
      .then((r) => {
        if (!cancelled) setRecap(r)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError((err as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [store, room])

  // react-best-practices: deriva l'HTML del materiale UNA volta per recap
  // (memoized), unica fonte per anteprima E download — mai rigenerato a ogni render.
  const recapHtml = useMemo(
    () => (recap && !isRecapEmpty(recap) ? buildRecapHtml(recap, digest ?? undefined) : null),
    [recap, digest],
  )

  async function handleExport() {
    setExporting(true)
    setExportError(null)
    try {
      const zipBlob = await store.exportLesson(room)
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement("a")
      const slug = lessonSlug(recap?.title ?? "", room)
      a.href = url
      a.download = `lezione-${slug}.lesson`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      // Errore LOCALE all'azione: non nasconde il riepilogo (sarebbe contraddittorio
      // suggerire "esporta la lezione" proprio quando l'export è fallito).
      setExportError("Esportazione non riuscita: " + (err as Error).message + ". Riprova; se persiste, controlla lo spazio su disco.")
    } finally {
      setExporting(false)
    }
  }

  // Deliverable umano-leggibile: un recap.html autosufficiente e stampabile
  // (worksheet + Fonti), derivato dal recap già proiettato. ZERO PII.
  function handleDownloadRecapHtml() {
    if (!recapHtml || !recap) return
    const blob = new Blob([recapHtml], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `recap-${lessonSlug(recap.title, room)}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="st-recap">
      <header className="st-bar st-bar-recap">
        <div className="st-brand" title="Ardesia Studio — la lavagna che ricorda">
          <span className="st-word">Ardesia</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-chip-student">riepilogo lezione</span>
        <div className="st-recap-actions" style={{ marginLeft: "auto" }}>
          <button onClick={handleDownloadRecapHtml} disabled={!recapHtml} className="st-ghost">
            scarica recap
          </button>
          <button onClick={handleExport} disabled={exporting} className="st-primary">
            {exporting ? "esporto…" : "esporta .lesson"}
          </button>
        </div>
      </header>

      <div className="st-recap-body" style={{ padding: "24px 32px", maxWidth: "640px", margin: "0 auto" }}>
        {exportError && (
          <p className="st-recap-export-err" role="alert" style={{
            fontSize: "var(--m-fs-sm)",
            color: "var(--m-error)",
            margin: "0 0 var(--m-sp-4)",
            lineHeight: 1.5,
          }}>{exportError}</p>
        )}
        {loading && <p className="st-quiet">caricamento…</p>}
        {error && (
          <EmptyState
            tone="error"
            title="Riepilogo non disponibile"
            detail={"Non è stato possibile preparare il riepilogo di questa lezione. " + error}
            hint="Riprova tra qualche istante. Se il problema resta, esporta la lezione e riaprila da un'altra scheda."
          />
        )}
        {!loading && !error && (recap === null || isRecapEmpty(recap)) && (
          <EmptyState
            title="Ancora nessun appunto"
            detail="Questa lezione non contiene ancora elementi sulla lavagna né formule."
            hint="Torna alla lavagna e inizia a scrivere: il riepilogo si aggiorna da solo."
          />
        )}
        {!loading && !error && recap !== null && !isRecapEmpty(recap) && (
          <>
            <section style={{ marginBottom: "28px" }}>
              <h2 className="st-recap-title" style={{
                fontFamily: "var(--m-font-display)",
                fontSize: "var(--m-fs-2xl)",
                fontWeight: 600,
                color: "var(--m-ink)",
                margin: 0,
              }}>
                {recap.title}
              </h2>
              <p className="st-recap-subtitle" style={{
                fontSize: "var(--m-fs-md)",
                color: "var(--m-ink-3)",
                margin: "var(--m-sp-1) 0 0",
              }}>
                I tuoi appunti salvati, in breve.
              </p>
            </section>

            <div className="st-recap-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "32px",
            }}>
              <div className="st-recap-card" style={{
                padding: "16px",
                borderRadius: "var(--m-r-card)",
                border: "1px solid var(--m-line-2)",
                background: "var(--m-canvas)",
              }}>
                <span className="st-recap-label" style={{ fontSize: "var(--m-fs-xs)", color: "var(--m-ink-4)", display: "block" }}>tempo</span>
                <span className="st-recap-value" style={{ fontSize: "var(--m-fs-xl)", fontWeight: 600, color: "var(--m-ink)", display: "block", margin: "4px 0" }}>{formatDuration(recap.durationMs)}</span>
                <span className="st-recap-desc" style={{ fontSize: "var(--m-fs-xs)", color: "var(--m-ink-3)" }}>durata della lezione</span>
              </div>

              <div className="st-recap-card" style={{
                padding: "16px",
                borderRadius: "var(--m-r-card)",
                border: "1px solid var(--m-line-2)",
                background: "var(--m-canvas)",
              }}>
                <span className="st-recap-label" style={{ fontSize: "var(--m-fs-xs)", color: "var(--m-ink-4)", display: "block" }}>lavagna</span>
                <span className="st-recap-value" style={{ fontSize: "var(--m-fs-xl)", fontWeight: 600, color: "var(--m-ink)", display: "block", margin: "4px 0" }}>{recap.totalElementsAdded}</span>
                <span className="st-recap-desc" style={{ fontSize: "var(--m-fs-xs)", color: "var(--m-ink-3)" }}>elementi sulla lavagna</span>
              </div>

              <div className="st-recap-card" style={{
                padding: "16px",
                borderRadius: "var(--m-r-card)",
                border: "1px solid var(--m-line-2)",
                background: "var(--m-canvas)",
              }}>
                <span className="st-recap-label" style={{ fontSize: "var(--m-fs-xs)", color: "var(--m-ink-4)", display: "block" }}>formule</span>
                <span className="st-recap-value" style={{ fontSize: "var(--m-fs-xl)", fontWeight: 600, color: "var(--m-ink)", display: "block", margin: "4px 0" }}>{recap.mathFormulas.length}</span>
                <span className="st-recap-desc" style={{ fontSize: "var(--m-fs-xs)", color: "var(--m-ink-3)" }}>formule scritte</span>
              </div>
            </div>

            {recap.mathFormulas.length > 0 && (
              <section style={{ marginBottom: "24px" }}>
                <h3 style={{
                  fontFamily: "var(--m-font-display)",
                  fontSize: "var(--m-fs-lg)",
                  color: "var(--m-ink-2)",
                  margin: "0 0 12px",
                }}>Formule inserite</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {recap.mathFormulas.map((f, i) => (
                    <code key={i} style={{
                      padding: "4px 10px",
                      borderRadius: "var(--m-r-pill)",
                      background: "var(--m-fill)",
                      border: "1px solid var(--m-line-2)",
                      fontSize: "var(--m-fs-sm)",
                      color: "var(--m-ink-2)",
                      fontFamily: "var(--m-font-mono)",
                    }}>{f}</code>
                  ))}
                </div>
              </section>
            )}

            {recapHtml && (
              <section style={{ marginBottom: "24px" }}>
                <h3 style={{
                  fontFamily: "var(--m-font-display)",
                  fontSize: "var(--m-fs-lg)",
                  color: "var(--m-ink-2)",
                  margin: "0 0 12px",
                }}>Anteprima materiale</h3>
                <iframe
                  title="Anteprima del recap stampabile da consegnare"
                  srcDoc={recapHtml}
                  sandbox=""
                  style={{
                    width: "100%",
                    height: "380px",
                    border: "1px solid var(--m-line-2)",
                    borderRadius: "var(--m-r-card)",
                    background: "var(--m-canvas)",
                  }}
                />
              </section>
            )}

            <section style={{ marginBottom: "24px" }}>
              <h3 style={{
                fontFamily: "var(--m-font-display)",
                fontSize: "var(--m-fs-lg)",
                color: "var(--m-ink-2)",
                margin: "0 0 12px",
              }}>Elementi sulla lavagna</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {Object.entries(recap.elementTypeCounts).length === 0 && (
                  <span style={{ fontSize: "var(--m-fs-sm)", color: "var(--m-ink-4)" }}>nessun elemento registrato</span>
                )}
                {Object.entries(recap.elementTypeCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <span key={type} style={{
                      padding: "4px 10px",
                      borderRadius: "var(--m-r-pill)",
                      background: "var(--m-accent-wash)",
                      border: "1px solid var(--m-accent-light)",
                      fontSize: "var(--m-fs-sm)",
                      color: "var(--m-accent)",
                    }}>
                      {type} <strong>{count}</strong>
                    </span>
                  ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
