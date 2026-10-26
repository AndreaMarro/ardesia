import "./product-shell.css";
export type SurfaceStatus = "loading" | "empty" | "error" | "offline" | "pending" | "stale" | "revoked";
const messages: Record<SurfaceStatus, [string, string]> = {
  loading: ["Apertura in corso", "Stiamo recuperando i dati di questo spazio."],
  empty: ["Uno spazio da iniziare", "Qui compariranno i materiali e i passaggi disponibili per il tuo account."],
  error: ["Non siamo riusciti ad aprire questo passaggio", "Il risultato non è confermato. Puoi riprovare dalla stessa fonte."],
  offline: ["Connessione assente", "I salvataggi sul server non sono confermati. Verifica l’esito quando torna la rete."],
  pending: ["Operazione in corso", "Attendi la ricevuta prima di considerare concluso il salvataggio."],
  stale: ["La fonte è cambiata", "Riapri la revisione prima di continuare. Il confronto deve usare la versione esatta."],
  revoked: ["Accesso revocato", "Questa fonte non è più disponibile per il tuo account. Torna ai materiali accessibili."],
};
/** Copy and presentation only. Owners provide status and recovery from Core responses. */
export function SurfaceState({ state, detail, action }: {
  state: SurfaceStatus; detail?: string; action?: { label: string; onClick: () => void };
}) {
  const busy = state === "loading" || state === "pending";
  return <section className="ps-surface-state" data-state={state} role={state === "error" || state === "revoked" ? "alert" : "status"} aria-busy={busy || undefined}>
    <h3>{messages[state][0]}</h3><p>{detail ?? messages[state][1]}</p>
    {action && <button disabled={busy} onClick={action.onClick}>{action.label}</button>}
  </section>;
}
export type SourceState = "current" | "historical" | "stale" | "revoked" | "unknown";
const sourceLabels: Record<SourceState, string> = { current: "Revisione corrente", historical: "Revisione storica", stale: "Fonte da aggiornare", revoked: "Accesso revocato", unknown: "Stato da verificare" };
/** Never infer freshness from a revision ID, a cache or successful rendering. */
export function SourceStatus({ state, revision }: { state: SourceState; revision?: string }) {
  return <div className="ps-source-status" data-source-state={state} aria-label="Stato della fonte"><span>{sourceLabels[state]}</span>{revision && state !== "revoked" && <code>{revision}</code>}</div>;
}
