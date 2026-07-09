// MAESTRO-Studio — S-UX-2: vista vuota / di errore, sobria e utile.
// Tre livelli di testo coerenti: titolo (cosa), dettaglio (cosa e' successo),
// suggerimento (cosa fare). Nessun emoji; tipografia dai soli token --m-*.

interface EmptyStateProps {
  /** Una riga breve: lo stato in cui si trova l'utente. */
  title: string
  /** Cosa e' successo, in italiano sobrio. */
  detail: string
  /** Cosa fare adesso (azione concreta). Opzionale. */
  hint?: string
  /** "error" per i guasti (rosso semaforo + role=alert); default neutro. */
  tone?: "neutral" | "error"
  /** Layout compatto per pannelli stretti (drawer): meno spazio verticale. */
  compact?: boolean
}

export default function EmptyState({ title, detail, hint, tone = "neutral", compact = false }: EmptyStateProps) {
  const cls = [
    "st-state",
    tone === "error" ? "st-state-error" : "",
    compact ? "st-state-compact" : "",
  ].filter(Boolean).join(" ")
  return (
    <div className={cls} role={tone === "error" ? "alert" : "status"}>
      {tone !== "error" && (
        // Segno "ardesioso" alla Miró/Calder: dischi primari su un filo + una
        // piccola stella. Delizia sobria per lo stato vuoto, mai un emoji.
        <svg className="st-state-mark" width="54" height="26" viewBox="0 0 54 26" aria-hidden="true">
          <line x1="5" y1="14" x2="49" y2="14" stroke="var(--m-ink-3)" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="11" cy="14" r="4" fill="var(--m-blue)" />
          <circle cx="28" cy="8" r="3.4" fill="var(--m-ochre)" />
          <circle cx="43" cy="16" r="3" fill="var(--m-viridian)" />
          <path d="M27 18 l2.2 3.6 l-4.4 0 z" fill="var(--m-ink)" />
        </svg>
      )}
      <p className="st-state-title">{title}</p>
      <p className="st-state-detail">{detail}</p>
      {hint && <p className="st-state-hint">{hint}</p>}
    </div>
  )
}
