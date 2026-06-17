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
      <p className="st-state-title">{title}</p>
      <p className="st-state-detail">{detail}</p>
      {hint && <p className="st-state-hint">{hint}</p>}
    </div>
  )
}
