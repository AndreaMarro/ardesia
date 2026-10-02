import { useEffect, useRef, useState, type CSSProperties } from "react"
import { EMBED_DATA_KEY } from "./caps/board"
import { circuitProofEvent, circuitTraceEvent } from "../lessonos/circuitCheckEvent"
import type { SimulationToolHost, ToolEmbedLike, ToolLinkRef } from "./simulationPluginRegistry"
import {
  callCircuitCheck, emptyCircuitState, readCircuitDiagnosis, readCircuitProof,
  readCircuitState, type CircuitEmbedState, type CircuitTraceStep,
} from "./circuitCheckAdapter"

const blankTrace = (): CircuitTraceStep => ({
  transcription: "", operation: "serie", first: "", second: "",
  claimed_value: null, reading: "clear",
})

const shell: CSSProperties = {
  width: "100%", height: "100%", overflow: "auto", boxSizing: "border-box",
  background: "#f8f7f2", color: "#202c38", padding: 18,
  border: "1px solid #d0d8df", borderRadius: 12, font: "15px/1.45 system-ui, sans-serif",
  pointerEvents: "auto",
}
const button: CSSProperties = {
  border: "1px solid #315b74", background: "#fff", color: "#193b50",
  borderRadius: 8, padding: "8px 11px", cursor: "pointer", font: "inherit",
}
const field: CSSProperties = {
  width: "100%", boxSizing: "border-box", border: "1px solid #aebdc8",
  borderRadius: 7, padding: 8, font: "inherit", background: "#fff", color: "#202c38",
}

/** Owned Ardesia board object. Kirchhoff remains the only mathematical authority. */
export function CircuitCheckEmbed({element, toolLink, host}: {
  element: ToolEmbedLike; toolLink: ToolLinkRef; host?: SimulationToolHost
}) {
  const marker = element.customData?.[EMBED_DATA_KEY] as {state?: unknown} | undefined
  const [state, setState] = useState<CircuitEmbedState>(() =>
    marker?.state === undefined ? emptyCircuitState() : readCircuitState(marker.state))
  const [current, setCurrent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState(state.proof ? "Prova riaperta dalla lavagna: ricalcola per verificarla con il motore corrente." : "")
  const generation = useRef(0)
  const writable = Boolean(host?.persistEmbedState)
  useEffect(() => () => { generation.current += 1 }, [])

  function update(next: CircuitEmbedState): Promise<boolean> {
    setState(next)
    return Promise.resolve(host?.persistEmbedState?.(toolLink.embedId, next, toolLink.toolId))
      .then(saved => saved === true, () => false)
  }
  function editNetlist(netlist: string) {
    generation.current += 1
    setCurrent(false); setError(""); setNotice("")
    void update({...state, netlist, proof: null, trace: [], diagnosis: null, selectedStep: 0})
  }
  async function solve() {
    const n = ++generation.current
    setBusy(true); setError(""); setNotice("")
    try {
      if (!state.netlist.trim()) throw new Error("Inserisci componenti, collegamenti e domanda.")
      const proof = readCircuitProof(await callCircuitCheck("solve", {
        netlist: state.netlist, method: state.method, source_kind: "netlist",
      }), state.netlist)
      if (n !== generation.current) return
      if (state.proof && (state.proof.fingerprint !== proof.fingerprint ||
          state.proof.answer.exact !== proof.answer.exact)) {
        throw new Error("La prova salvata non coincide con il nuovo calcolo. Nessun risultato corrente esposto.")
      }
      const saved = await update({...state, proof, selectedStep: Math.min(state.selectedStep, proof.steps.length - 1), diagnosis: null})
      if (n !== generation.current) return
      if (!saved) throw new Error("La prova non è stata salvata nella lavagna: nessun evento di lezione registrato.")
      if (!await host?.flushEmbedState?.()) throw new Error("La prova non è ancora durevole nella lezione: nessun evento registrato.")
      if (n !== generation.current) return
      setCurrent(true)
      host?.emitLessonEvent?.(circuitProofEvent(proof, toolLink.embedId, Date.now()))
      setNotice("Risultato verificato dal motore CircuitCheck per questa revisione. La prova è associata all'oggetto lavagna.")
    } catch (cause) {
      if (n === generation.current) setError(cause instanceof Error ? cause.message : String(cause))
    } finally { if (n === generation.current) setBusy(false) }
  }
  async function diagnose() {
    const proof = state.proof
    if (!proof || !current) { setError("Ricalcola prima il circuito salvato."); return }
    const n = ++generation.current
    setBusy(true); setError("")
    try {
      const diagnosis = readCircuitDiagnosis(await callCircuitCheck("diagnose", {
        netlist: state.netlist,
        trace: {schema: "student-trace.v1", circuit_fingerprint: proof.fingerprint, steps: state.trace},
      }), proof.fingerprint)
      if (n !== generation.current) return
      const saved = await update({...state, diagnosis})
      if (n !== generation.current) return
      if (!saved) throw new Error("Il tentativo non è stato salvato nella lavagna: nessun evento di lezione registrato.")
      if (!await host?.flushEmbedState?.()) throw new Error("Il tentativo non è ancora durevole nella lezione: nessun evento registrato.")
      if (n !== generation.current) return
      const event = await circuitTraceEvent(proof, state.trace, diagnosis, toolLink.embedId, Date.now())
      if (n !== generation.current) return
      host?.emitLessonEvent?.(event)
    } catch (cause) {
      if (n === generation.current) setError(cause instanceof Error ? cause.message : String(cause))
    } finally { if (n === generation.current) setBusy(false) }
  }
  function patchTrace(index: number, patch: Partial<CircuitTraceStep>) {
    generation.current += 1
    update({...state, diagnosis: null, trace: state.trace.map((item, i) => i === index ? {...item, ...patch} : item)})
  }
  const proof = state.proof
  const selected = proof?.steps[Math.min(state.selectedStep, proof.steps.length - 1)]
  return <section style={shell} aria-label="CircuitCheck sulla lavagna">
    <div style={{display:"flex", justifyContent:"space-between", gap:12, alignItems:"baseline"}}>
      <div><strong style={{fontSize:20}}>CircuitCheck</strong><div>Ragionamento sui circuiti · oggetto della lezione</div></div>
      <span style={{color:current ? "#116b47" : "#865921", fontWeight:700}}>
        {current ? "verificato ora" : proof ? "prova da ricalcolare" : "in preparazione"}
      </span>
    </div>
    <label style={{display:"block", marginTop:14}}>Circuito e domanda
      <textarea aria-label="Circuito CircuitCheck" style={{...field, minHeight:105, marginTop:5}}
        value={state.netlist} disabled={!writable} onChange={event => editNetlist(event.target.value)}
        placeholder={"V1 b 0 12 volt\nR1 b a 100 ohm\nR2 a 0 220 ohm\n? voltage R2"} />
    </label>
    <div style={{display:"flex", gap:8, marginTop:10}}>
      <button type="button" style={button} disabled={busy || !writable} onClick={() => void solve()}>
        {busy ? "Attendi…" : proof ? "Ricalcola e verifica" : "Risolvi e verifica"}
      </button>
    </div>
    {error && <p role="alert" style={{color:"#a32424"}}>{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {proof && selected && <div style={{marginTop:16, borderTop:"1px solid #d0d8df", paddingTop:14}}>
      <h3 style={{margin:"0 0 6px"}}>{proof.title}</h3>
      <p style={{margin:"0 0 10px"}}>
        {current ? "Risultato verificato: " : "Risultato registrato, in attesa di nuova verifica: "}
        <strong>{proof.answer.exact} {proof.answer.unit}</strong> · {proof.answer.reference}
      </p>
      <div style={{display:"flex", gap:7, flexWrap:"wrap"}}>
        {proof.steps.map((step, i) => <button type="button" key={i}
          style={{...button, background:i === state.selectedStep ? "#dce9ef" : "#fff"}}
          aria-pressed={i === state.selectedStep}
          onClick={() => void update({...state, selectedStep:i})}>{i+1}. {step.title}</button>)}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"minmax(220px,1fr) minmax(200px,1fr)", gap:16, marginTop:12}}>
        <img style={{maxWidth:"100%", background:"#fff", border:"1px solid #d0d8df"}}
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(selected.svg)}`}
          alt={`Schema del passaggio ${state.selectedStep+1}: ${selected.title}`} />
        <div><strong>{selected.title}</strong><p>{selected.explanation}</p>
          {selected.equations.map((equation,i) => <p key={i}><code>{equation}</code></p>)}
        </div>
      </div>
    </div>}
    {proof && current && <div style={{marginTop:16, borderTop:"1px solid #d0d8df", paddingTop:14}}>
      <h3 style={{margin:"0 0 8px"}}>Procedimento dello studente</h3>
      {state.trace.map((item, i) => <fieldset key={i} style={{border:"1px solid #d0d8df", borderRadius:8, marginBottom:8}}>
        <legend>Passaggio {i+1}</legend>
        <label>Trascrizione<input style={field} aria-label={`Trascrizione ${i+1}`} value={item.transcription}
          onChange={event => patchTrace(i,{transcription:event.target.value})}/></label>
        <div style={{display:"flex", gap:7, marginTop:6}}>
          <select aria-label={`Operazione ${i+1}`} value={item.operation} style={field}
            onChange={event => patchTrace(i,{operation:event.target.value as CircuitTraceStep["operation"]})}>
            <option value="serie">Serie</option><option value="parallelo">Parallelo</option><option value="altro">Altro</option>
          </select>
          <input aria-label={`Primo componente ${i+1}`} placeholder="R1" style={field} value={item.first}
            onChange={event => patchTrace(i,{first:event.target.value})}/>
          <input aria-label={`Secondo componente ${i+1}`} placeholder="R2" style={field} value={item.second}
            onChange={event => patchTrace(i,{second:event.target.value})}/>
          <input aria-label={`Valore ${i+1}`} placeholder="Ω" style={field} value={item.claimed_value ?? ""}
            onChange={event => patchTrace(i,{claimed_value:event.target.value || null})}/>
        </div>
        <label>Leggibilità<select style={field} value={item.reading}
          onChange={event => patchTrace(i,{reading:event.target.value as CircuitTraceStep["reading"]})}>
          <option value="clear">Chiaro</option><option value="ambiguous">Incerto</option><option value="unreadable">Illeggibile</option>
        </select></label>
      </fieldset>)}
      <div style={{display:"flex", gap:8}}>
        <button type="button" style={button} disabled={busy || !writable || state.trace.length >= 32}
          onClick={() => void update({...state, trace:[...state.trace, blankTrace()], diagnosis:null})}>Aggiungi passaggio</button>
        <button type="button" style={button} disabled={busy || state.trace.length < 1}
          onClick={() => void diagnose()}>Controlla il procedimento</button>
      </div>
      {state.diagnosis && <p role="status"><strong>{state.diagnosis.outcome === "first_invalid"
        ? `Primo passaggio da rivedere: ${state.diagnosis.step}`
        : state.diagnosis.outcome === "valid_so_far" ? "Valido fin qui" : "Non determinabile"}.</strong>
        {" "}{state.diagnosis.message}</p>}
    </div>}
  </section>
}
