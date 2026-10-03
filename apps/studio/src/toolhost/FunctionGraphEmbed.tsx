import { useEffect, useMemo, useRef, useState } from "react"
import { EMBED_DATA_KEY } from "./caps/board"
import type { SimulationToolHost, ToolEmbedLike, ToolLinkRef } from "./simulationPluginRegistry"
import { FUNCTION_GRAPH_TOOL_ID, exportFunctionGraphSvg, readFunctionGraphState, type FunctionGraphState } from "./functionGraph"

export function FunctionGraphEmbed({ element, toolLink, host }: {
  element: ToolEmbedLike; toolLink: ToolLinkRef; host?: SimulationToolHost
}) {
  try {
    const marker = element.customData?.[EMBED_DATA_KEY] as { owner?: unknown; state?: unknown } | undefined
    if (element.id !== toolLink.embedId || toolLink.toolId !== FUNCTION_GRAPH_TOOL_ID || marker?.owner !== FUNCTION_GRAPH_TOOL_ID)
      throw new Error("Il grafico non appartiene a questa istanza.")
    const state = readFunctionGraphState(marker.state)
    return <FunctionGraphEditor key={toolLink.embedId} serialized={JSON.stringify(state)} embedId={toolLink.embedId} host={host} />
  } catch (error) {
    return <section aria-label="Grafico non disponibile" role="alert">{error instanceof Error ? error.message : "Grafico non leggibile."}</section>
  }
}

function draftFor(state: FunctionGraphState) {
  return { title: state.title, a: state.coefficients?.[0] ?? "", b: state.coefficients?.[1] ?? "",
    c: state.coefficients?.[2] ?? "", min: state.domain.min, max: state.domain.max }
}

function FunctionGraphEditor({ serialized, embedId, host }: {
  serialized: string; embedId: string; host?: SimulationToolHost
}) {
  const saved = useMemo(() => readFunctionGraphState(JSON.parse(serialized)), [serialized])
  const [draft, setDraft] = useState(() => draftFor(saved))
  const [dirty, setDirty] = useState(false), [busy, setBusy] = useState(false)
  const [error, setError] = useState(""), [notice, setNotice] = useState("")
  const [conflict, setConflict] = useState(false)
  const dirtyRef = useRef(false), base = useRef(serialized), pending = useRef<string | null>(null)
  const latest = useRef(serialized)
  latest.current = serialized
  useEffect(() => {
    if (serialized === pending.current) { base.current = serialized; return }
    if (serialized === base.current) return
    setNotice("")
    if (dirtyRef.current) { setConflict(true); return }
    base.current = serialized; setDraft(draftFor(saved)); setConflict(false)
  }, [serialized, saved])
  const writable = typeof host?.persistEmbedState === "function"
  function change(key: keyof typeof draft, value: string) {
    dirtyRef.current = true; setDirty(true); setError(""); setNotice("")
    setDraft(previous => ({ ...previous, [key]: value }))
  }
  function readDraft(): FunctionGraphState {
    return readFunctionGraphState({ kind: "function-graph-v1", v: 1, title: draft.title,
      coefficients: [draft.a, draft.b, draft.c].every(x => !x.trim()) ? null : [draft.a, draft.b, draft.c],
      domain: { min: draft.min, max: draft.max } })
  }
  let preview = saved
  try { preview = readDraft() } catch { /* Last saved curve stays readable while a field is incomplete. */ }
  async function save() {
    setBusy(true); setError(""); setNotice("")
    try {
      if (!host?.persistEmbedState) throw new Error("La lavagna è in sola lettura.")
      if (conflict || latest.current !== base.current) throw new Error("Il grafico è cambiato sulla lavagna. Ricarica i valori prima di salvare.")
      const next = readDraft(); pending.current = JSON.stringify(next)
      if (await host.persistEmbedState(embedId, next, FUNCTION_GRAPH_TOOL_ID) === false)
        throw new Error("Scrittura del grafico rifiutata. I valori inseriti restano qui.")
      if (host.flushEmbedState && !await host.flushEmbedState())
        throw new Error("Il grafico non è ancora salvato su disco. Riprova senza chiudere la lezione.")
      if (latest.current !== pending.current && latest.current !== base.current)
        throw new Error("Il grafico è cambiato durante il salvataggio. Ricarica i valori dalla lavagna.")
      base.current = pending.current; dirtyRef.current = false; setDirty(false)
      setNotice(host.flushEmbedState ? "Grafico salvato." : "Grafico aggiornato sulla lavagna. Salva la lezione per conservarlo.")
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Salvataggio non riuscito.") }
    finally { pending.current = null; setBusy(false) }
  }
  function downloadSvg() {
    try {
      const url = URL.createObjectURL(new Blob([exportFunctionGraphSvg(readDraft())], { type: "image/svg+xml" }))
      const link = document.createElement("a"); link.href = url; link.download = "grafico-funzione.svg"; link.click()
      setTimeout(() => URL.revokeObjectURL(url), 30_000)
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Grafico non esportabile.") }
  }
  return <section aria-label={`Grafico di funzione ${embedId}`} data-function-graph={embedId}
    onKeyDown={event => event.stopPropagation()}
    style={{ width: "100%", height: "100%", overflow: "auto", boxSizing: "border-box", padding: 16,
      background: "#fff", color: "#203343", font: "14px system-ui, sans-serif", borderRadius: 12, pointerEvents: "auto" }}>
    <header><strong>Grafico quadratico</strong><p style={{ margin: "6px 0 12px" }}>Esplora y = ax² + bx + c. Il grafico è numerico; sono ammesse anche rette e costanti.</p></header>
    <label>Titolo del grafico <input aria-label="Titolo del grafico" value={draft.title} maxLength={120} disabled={!writable || busy}
      onChange={e => change("title", e.target.value)} style={{ width: "65%" }} /></label>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
      {(["a", "b", "c"] as const).map(key => <label key={key}>{key} <input aria-label={`Coefficiente ${key}`} inputMode="decimal"
        value={draft[key]} maxLength={32} disabled={!writable || busy} onChange={e => change(key, e.target.value)} style={{ width: 85 }} /></label>)}
      <label>x minimo <input aria-label="x minimo" value={draft.min} maxLength={32} disabled={!writable || busy}
        onChange={e => change("min", e.target.value)} style={{ width: 85 }} /></label>
      <label>x massimo <input aria-label="x massimo" value={draft.max} maxLength={32} disabled={!writable || busy}
        onChange={e => change("max", e.target.value)} style={{ width: 85 }} /></label>
    </div>
    <div aria-label="Anteprima del grafico" dangerouslySetInnerHTML={{ __html: exportFunctionGraphSvg(preview) }} />
    {!preview.coefficients && <p>Inserisci a, b e c per tracciare la tua funzione.</p>}
    {dirty && <p>Modifiche da salvare.</p>}
    {!writable && <p>Grafico in sola lettura. Puoi esportarne l’immagine SVG.</p>}
    {conflict && <button onClick={() => { base.current = serialized; pending.current = null; dirtyRef.current = false;
      setDirty(false); setDraft(draftFor(saved)); setConflict(false); setError("") }}>Ricarica dalla lavagna</button>}
    <div style={{ display: "flex", gap: 10 }}>
      <button disabled={!writable || busy || conflict} onClick={() => void save()}>{busy ? "Salvataggio…" : "Salva grafico"}</button>
      <button disabled={busy} onClick={downloadSvg}>Esporta SVG</button>
    </div>
    {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
  </section>
}
