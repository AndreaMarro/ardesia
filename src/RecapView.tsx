// MAESTRO-Studio — RecapView (riepilogo lezione)
// Route ?vista=recap per-lezione: titolo, durata, concetti, materiali esportati.
// Linguaggio docente: "appunti salvati" (sottotitolo), mai flush/cache.
// Ogni card ha una label propria (tempo / lavagna / formule), non ripetuta.

import { useState, useEffect } from "react"
import { type WorkspaceStore } from "./store/WorkspaceStore"
import { buildRecap, formatDuration, type LessonRecap } from "./store/lessonRecap"

interface RecapViewProps {
  store: WorkspaceStore
  room: string
}

export default function RecapView({ store, room }: RecapViewProps) {
  const [recap, setRecap] = useState<LessonRecap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
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

  async function handleExport() {
    setExporting(true)
    try {
      const zipBlob = await store.exportLesson(room)
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement("a")
      const slug = recap?.title
        ? recap.title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 48)
        : room
      a.href = url
      a.download = `lezione-${slug}.lesson`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError("Export fallito: " + (err as Error).message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="st-recap">
      <header className="st-bar st-bar-recap">
        <div className="st-brand" title="MAESTRO Studio — la lavagna che ricorda">
          <span className="st-word">maestro</span>
          <span className="st-bdot" aria-hidden />
          <span className="st-sub">studio</span>
        </div>
        <span className="st-chip-student">riepilogo lezione</span>
        <div className="st-recap-actions" style={{ marginLeft: "auto" }}>
          <button onClick={handleExport} disabled={exporting} className="st-primary">
            {exporting ? "esporto…" : "esporta .lesson"}
          </button>
        </div>
      </header>

      <div className="st-recap-body" style={{ padding: "24px 32px", maxWidth: "640px", margin: "0 auto" }}>
        {loading && <p className="st-quiet">caricamento…</p>}
        {error && <p className="st-err">{error}</p>}
        {!loading && !error && recap === null && (
          <div className="st-recap-empty" style={{ textAlign: "center", padding: "40px 0" }}>
            <p>Nessun dato disponibile per questa lezione.</p>
          </div>
        )}
        {!loading && !error && recap !== null && (
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
