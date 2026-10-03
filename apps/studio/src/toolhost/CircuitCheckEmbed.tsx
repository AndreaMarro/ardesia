import { useEffect, useRef, useState, type CSSProperties } from "react"
import { EMBED_DATA_KEY } from "./caps/board"
import { circuitProofEvent, circuitTraceEvent } from "../lessonos/circuitCheckEvent"
import type { SimulationToolHost, ToolEmbedLike, ToolLinkRef } from "./simulationPluginRegistry"
import { CircuitInputEditor } from "./CircuitInputEditor"
import { lessonExpressionMarkup, lessonMathMarkup } from "./lessonMath"
import { circuitInputNetlist, parseCircuitInputNetlist, type CircuitInputModel } from "./circuitInputModel"
import { circuitIngressRequest, confirmCircuitInput, initialCircuitIngress, inputSourceFromBoard, inputSourceFromImage, readCircuitIngress, type CircuitIngressState } from "./circuitIngress"
import {
  callCircuitCheck, circuitAssuranceLabel, circuitConventionsLabel, emptyCircuitState, readCircuitDiagnosis, readCircuitProof,
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
type CircuitInputEmbedState = CircuitEmbedState & {input?:CircuitIngressState}

/** Owned Ardesia board object. Kirchhoff remains the only mathematical authority. */
export function CircuitCheckEmbed({element, toolLink, host}: {
  element: ToolEmbedLike; toolLink: ToolLinkRef; host?: SimulationToolHost
}) {
  const marker = element.customData?.[EMBED_DATA_KEY] as {state?: unknown} | undefined
  const [initial] = useState(() => {
    const saved = marker?.state === undefined ? emptyCircuitState() : readCircuitState(marker.state)
    try {
      const rawInput = (marker?.state as {input?:unknown}|undefined)?.input
      return {state:{...saved,input:rawInput === undefined ? initialCircuitIngress(saved.netlist) : readCircuitIngress(rawInput)},error:""}
    } catch (cause) {return {state:{...saved,input:initialCircuitIngress(saved.netlist)},error:(cause as Error).message}}
  })
  const [state, setState] = useState<CircuitInputEmbedState>(initial.state)
  const [inputError,setInputError] = useState(initial.error)
  const [confirmed,setConfirmed] = useState(false)
  const [current, setCurrent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState(state.proof ? "Prova riaperta dalla lavagna: ricalcola per verificarla con il motore corrente." : "")
  const generation = useRef(0)
  const writable = Boolean(host?.persistEmbedState)
  const input = state.input ?? initialCircuitIngress(state.netlist)
  useEffect(() => () => { generation.current += 1 }, [])

  function update(next: CircuitInputEmbedState): Promise<boolean> {
    setState(next)
    return Promise.resolve(host?.persistEmbedState?.(toolLink.embedId, next, toolLink.toolId))
      .then(saved => saved === true, () => false)
  }
  function editNetlist(netlist: string) {
    let model:CircuitInputModel|null = null
    try {model = parseCircuitInputNetlist(netlist)} catch { /* Expert-only rows remain intact. */ }
    editInput({...input,mode:"expert",model,receipt:null,reviewRequired:Boolean(input.source)},netlist)
  }
  function editInput(next:CircuitIngressState,netlist=state.netlist) {
    generation.current += 1
    setCurrent(false); setBusy(false); setConfirmed(false); setError(""); setNotice("")
    void update({...state,input:next,netlist,proof:null,trace:[],diagnosis:null,pendingErrorId:null,selectedStep:0,selectedFocus:null})
  }
  async function loadSource(file?:File) {
    if (!file || !writable) return
    const n=++generation.current
    setBusy(true);setConfirmed(false);setCurrent(false);setError("")
    try {
      if (!["image/png","image/jpeg","image/webp"].includes(file.type) || file.size > 2_000_000) throw new Error("Usa una foto PNG, JPEG o WebP entro 2 MB; per PDF importa la pagina nella lavagna e selezionala.")
      const image=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error("Immagine non leggibile."));reader.onload=()=>resolve(String(reader.result));reader.readAsDataURL(file)})
      const source=await inputSourceFromImage(image,file.name)
      if (n!==generation.current) return
      setInputError("")
      editInput({...input,source,receipt:null,reviewRequired:true,uncertainties:[],mode:input.model ? "structured" : "expert"})
    } catch (cause) {if(n===generation.current)setError((cause as Error).message)}
    finally {if(n===generation.current)setBusy(false)}
  }
  async function recognize() {
    if (!input.source) return
    const n=++generation.current
    setBusy(true);setConfirmed(false);setCurrent(false);setError("");setNotice("")
    try {
      const proposal=await circuitIngressRequest("recognize",{image:input.source.image})
      if (typeof proposal.netlist !== "string" || proposal.netlist.length>16000 || !Array.isArray(proposal.uncertainties) || proposal.uncertainties.length>100 ||
          !proposal.uncertainties.every(v=>typeof v === "string" && v.length<=1000)) throw new Error("Il riconoscimento non ha restituito una proposta leggibile. Ricostruisci il circuito con i componenti.")
      const model=parseCircuitInputNetlist(proposal.netlist)
      if(n!==generation.current)return
      editInput({...input,model,mode:"structured",receipt:null,reviewRequired:true,uncertainties:proposal.uncertainties as string[]},proposal.netlist)
      setNotice("Lettura proposta: confronta ogni componente e collegamento con la fonte, poi conferma questa revisione.")
    } catch(cause) {if(n===generation.current)setError((cause as Error).message)}
    finally {if(n===generation.current)setBusy(false)}
  }
  async function captureSelection() {
    if(!host?.captureSelection || !writable)return
    const n=++generation.current
    setBusy(true);setConfirmed(false);setCurrent(false);setError("")
    try {
      const source=await inputSourceFromBoard(await host.captureSelection(toolLink.embedId))
      if(n!==generation.current)return
      setInputError("")
      editInput({...input,source,receipt:null,reviewRequired:true,uncertainties:[],mode:input.model ? "structured" : "expert"})
    } catch(cause) {if(n===generation.current)setError((cause as Error).message)}
    finally {if(n===generation.current)setBusy(false)}
  }
  async function solve() {
    const n = ++generation.current
    setBusy(true); setCurrent(false); setError(""); setNotice("")
    try {
      if (!state.netlist.trim()) throw new Error("Inserisci componenti, collegamenti e domanda.")
      if (inputError) throw new Error(inputError)
      if ((input.source || input.reviewRequired || input.mode === "structured") && !confirmed) throw new Error("Confronta componenti, valori, morsetti e domanda; poi conferma questa revisione.")
      if (input.mode === "structured" && (!input.model || circuitInputNetlist(input.model) !== state.netlist)) throw new Error("La revisione non coincide con i componenti visualizzati: modifica e conferma di nuovo.")
      const approval=input.source ? await confirmCircuitInput(input.source,state.netlist) : null
      if (n !== generation.current) return
      const proof = readCircuitProof(await callCircuitCheck("solve", {
        netlist: state.netlist, method: state.method, source_kind: input.source ? "image" : "netlist",
        ...(approval ? {confirmation_token:approval.token} : {}),
      }), state.netlist)
      if (n !== generation.current) return
      if (approval && (!proof.inputProvenance || proof.inputProvenance.source_sha256 !== approval.receipt.source_sha256 ||
          proof.inputProvenance.circuit_sha256 !== approval.receipt.circuit_sha256 || proof.inputProvenance.confirmed_at_unix !== approval.receipt.confirmed_at_unix)) throw new Error("La prova non conserva la ricevuta della fonte confermata.")
      if (state.proof && (state.proof.fingerprint !== proof.fingerprint ||
          state.proof.answer.exact !== proof.answer.exact)) {
        throw new Error("La prova salvata non coincide con il nuovo calcolo. Nessun risultato corrente esposto.")
      }
      const event = await circuitProofEvent(proof, toolLink.embedId, Date.now())
      if (n !== generation.current) return
      const selectedStep = Math.min(state.selectedStep, proof.steps.length - 1)
      const selectedFocus = state.selectedFocus && proof.steps[selectedStep]?.focus?.includes(state.selectedFocus)
        ? state.selectedFocus : null
      const saved = await update({...state,input:{...input,receipt:approval?.receipt ?? null},proof,selectedStep,selectedFocus,diagnosis:null})
      if (n !== generation.current) return
      if (!saved) throw new Error("La prova non è stata salvata nella lavagna: nessun evento di lezione registrato.")
      if (!await host?.flushEmbedState?.()) throw new Error("La prova non è ancora durevole nella lezione: nessun evento registrato.")
      if (n !== generation.current) return
      setCurrent(true)
      host?.emitLessonEvent?.(event)
      setNotice(`${circuitAssuranceLabel(proof)} per questa revisione. La prova è associata all'oggetto lavagna.`)
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
      const event = await circuitTraceEvent(proof, state.trace, diagnosis,
        toolLink.embedId, Date.now(), state.pendingErrorId)
      const pendingErrorId = diagnosis.outcome === "first_invalid" ? event.errorId ?? null
        : diagnosis.outcome === "valid_so_far" ? null : state.pendingErrorId
      const saved = await update({...state, diagnosis, pendingErrorId})
      if (n !== generation.current) return
      if (!saved) throw new Error("Il tentativo non è stato salvato nella lavagna: nessun evento di lezione registrato.")
      if (!await host?.flushEmbedState?.()) throw new Error("Il tentativo non è ancora durevole nella lezione: nessun evento registrato.")
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
  const answerMath=lessonExpressionMarkup(proof?.answer.math)
  const selectedMath=lessonMathMarkup(selected?.math)
  const references = [...new Set(proof?.steps.flatMap(step => step.focus ?? []) ?? [])]
  async function selectReference(reference: string) {
    if (!proof) return
    const matches = proof.steps.flatMap((step,index) => step.focus?.includes(reference) ? [index] : [])
    const next = matches.find(index => index > state.selectedStep) ?? matches[0]
    if (next === undefined) return
    setNotice(""); setError("")
    try {
      const saved = await update({...state,selectedStep:next,selectedFocus:reference})
      if (!saved || !await host?.flushEmbedState?.()) throw new Error("not-durable")
      setNotice(`Riferimento ${reference} salvato nel passaggio ${next + 1}.`)
    } catch {
      setError("Il riferimento non è ancora salvato nella lezione.")
    }
  }
  return <section style={shell} aria-label="CircuitCheck sulla lavagna">
    <div style={{display:"flex", justifyContent:"space-between", gap:12, alignItems:"baseline"}}>
      <div><strong style={{fontSize:20}}>CircuitCheck</strong><div>Ragionamento sui circuiti · oggetto della lezione</div></div>
      <span style={{color:current ? "#116b47" : "#865921", fontWeight:700}}>
        {current ? proof?.scope === "electrical_result" ? "verificato ora" : "confrontato ora"
          : proof ? "prova da ricalcolare" : "in preparazione"}
      </span>
    </div>
    <div style={{marginTop:14,padding:10,border:"1px solid #d0d8df",borderRadius:8}}>
      {host?.captureSelection && <><button type="button" disabled={!writable||busy} onClick={()=>void captureSelection()}>Acquisisci selezione della lavagna</button><p style={{fontSize:13}}>Seleziona i tratti, il testo o la pagina immagine prima di aprire CircuitCheck. I tratti restano modificabili sulla lavagna; qui ne conservi anche una copia della revisione usata.</p></>}
      <label>Foto o immagine del circuito (PNG, JPEG, WebP · massimo 2 MB)
        <input aria-label="Carica fonte CircuitCheck" type="file" accept="image/png,image/jpeg,image/webp" disabled={!writable||busy} onChange={e=>{void loadSource(e.target.files?.[0]);e.target.value=""}}/>
      </label>
      {input.source && <><p><strong>Fonte conservata:</strong> {input.source.name}</p><img src={input.source.image} alt="Fonte originale da confrontare con i componenti" style={{display:"block",maxWidth:"100%",maxHeight:360,objectFit:"contain",background:"white"}}/>
        <p>Correggi la lettura con i controlli qui sotto. La fonte originale resta salvata nell’oggetto della lezione.</p>
        <button type="button" disabled={!writable||busy} onClick={()=>void recognize()}>Invia a OpenAI e proponi lettura</button>
        <p style={{fontSize:13}}>Questa azione invia l’immagine al provider configurato dal servizio. Puoi ricostruire manualmente il circuito senza inviarla.</p>
        {input.source.board && <p>Tratti e file originali: {input.source.board.elementIds.length} elementi · scena {input.source.board.sceneSha256}</p>}
        {input.receipt && <p style={{fontSize:13}}>Ricevuta storica della revisione: {input.receipt.circuit_sha256}. Al riavvio serve una nuova revisione esplicita; la ricevuta non certifica la fedeltà della lettura.</p>}
      </>}
    </div>
    {inputError && <p role="alert">{inputError}</p>}
    {!!input.uncertainties.length && <div><strong>Punti da chiarire nella lettura proposta</strong><ul>{input.uncertainties.map((u,i)=><li key={i}>{u}</li>)}</ul></div>}
    <div style={{display:"flex",gap:8,marginTop:12}}>
      <button type="button" aria-pressed={input.mode === "structured"} disabled={!input.model||busy||!writable} onClick={()=>{if(input.model){let netlist="";try{netlist=circuitInputNetlist(input.model)}catch{/* incomplete draft */}editInput({...input,mode:"structured",receipt:null,reviewRequired:true},netlist)}}}>Componenti e collegamenti</button>
      <button type="button" aria-pressed={input.mode === "expert"} disabled={busy||!writable} onClick={()=>void update({...state,input:{...input,mode:"expert"}})}>Vista esperta</button>
    </div>
    {input.mode === "structured" && input.model && <CircuitInputEditor value={input.model} disabled={!writable||busy} onChange={(model,netlist)=>editInput({...input,model,mode:"structured",receipt:null,reviewRequired:true},netlist ?? "")}/>}
    <div hidden={input.mode !== "expert"}><label style={{display:"block", marginTop:14}}>Circuito e domanda · netlist
      <textarea aria-label="Circuito CircuitCheck" style={{...field, minHeight:105, marginTop:5}}
        value={state.netlist} disabled={!writable||busy} onChange={event => editNetlist(event.target.value)}
        placeholder={"V1 b 0 12 volt\nR1 b a 100 ohm\nR2 a 0 220 ohm\n? voltage R2"} />
    </label>{!input.model && <p>Questo testo contiene righe non rappresentabili nell’editor a componenti. La vista esperta conserva il circuito completo.</p>}</div>
    {(input.source || input.reviewRequired || input.mode === "structured") && <label style={{display:"block",marginTop:12}}><input type="checkbox" checked={confirmed} disabled={!writable||busy||!state.netlist.trim()||Boolean(inputError)} onChange={e=>setConfirmed(e.target.checked)}/> Ho confrontato con la fonte e rivisto componenti, valori, morsetti, versi e domanda di questa revisione.</label>}
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
        {current ? proof.scope === "electrical_result" ? "Risultato verificato: " : "Risultato corrente: "
          : "Risultato registrato, in attesa di nuova verifica: "}
        <strong>{answerMath ? <span data-circuit-math="answer" dangerouslySetInnerHTML={{__html:answerMath}}/> : proof.answer.exact} {proof.answer.unit}</strong> · {proof.answer.reference}
      </p>
      <p>{circuitAssuranceLabel(proof)}. La verifica riguarda il calcolo indicato.</p>
      {proof.conventions && <p>{circuitConventionsLabel(proof)}</p>}
      {references.length > 0 && <nav aria-label="Riferimenti del circuito" style={{marginBottom:10}}>
        <span>Segui nello schema: </span>{references.map(reference => <button type="button" key={reference}
          style={{...button,margin:3}} aria-pressed={state.selectedFocus === reference}
          onClick={() => void selectReference(reference)}>{reference}</button>)}
      </nav>}
      <div style={{display:"flex", gap:7, flexWrap:"wrap"}}>
        {proof.steps.map((step, i) => <button type="button" key={i}
          style={{...button, background:i === state.selectedStep ? "#dce9ef" : "#fff"}}
          aria-pressed={i === state.selectedStep}
          onClick={() => void update({...state, selectedStep:i,selectedFocus:null})}>{i+1}. {step.title}</button>)}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"minmax(220px,1fr) minmax(200px,1fr)", gap:16, marginTop:12}}>
        <img style={{maxWidth:"100%", background:"#fff", border:"1px solid #d0d8df"}}
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(selected.svg)}`}
          alt={`Schema del passaggio ${state.selectedStep+1}: ${selected.title}`} />
        <div><strong>{selected.title}</strong><p>{selected.explanation}</p>
          {!!selected.focus?.length && <p>Riferimenti di questo passaggio: {selected.focus.join(", ")}</p>}
          {selectedMath ? <div data-circuit-math="steps" style={{overflowX:"auto",fontSize:18}} dangerouslySetInnerHTML={{__html:selectedMath}}/>
            : selected.equations.map((equation,i) => <p key={i}><code>{equation}</code></p>)}
        </div>
      </div>
    </div>}
    {proof && current && proof.conventions?.domain === "ac_sinusoidal" &&
      <p>Il controllo automatico dei passaggi dello studente in AC non è ancora disponibile.</p>}
    {proof && current && !proof.conventions && <div style={{marginTop:16, borderTop:"1px solid #d0d8df", paddingTop:14}}>
      <h3 style={{margin:"0 0 8px"}}>Procedimento dello studente</h3>
      <p style={{fontSize:13}}>Puoi controllare riduzioni, KCL al nodo, KVL nella maglia e valori DC di corrente o tensione del circuito originale. Per KCL usa tutti i rami, per esempio -R1,+R2,+R3: + se la corrente esce dal nodo nel verso della netlist. Per KVL indica il nodo di partenza e le tensioni orientate di una maglia chiusa, per esempio +R1,+R2,-V1. Per un valore numerico puoi dichiarare il verso con i due morsetti, per esempio q,p. Il valore controllato non certifica il metodo scritto.</p>
      {state.trace.map((item, i) => {const numeric=item.operation === "corrente" || item.operation === "tensione",kcl=item.operation === "kcl",kvl=item.operation === "kvl",law=kcl || kvl;return <fieldset key={i} style={{border:"1px solid #d0d8df", borderRadius:8, marginBottom:8}}>
        <legend>Passaggio {i+1}</legend>
        <label>Trascrizione<input style={field} aria-label={`Trascrizione ${i+1}`} value={item.transcription}
          onChange={event => patchTrace(i,{transcription:event.target.value})}/></label>
        <div style={{display:"flex", flexWrap:"wrap", gap:7, marginTop:6}}>
          <select aria-label={`Operazione ${i+1}`} value={item.operation} style={field}
            onChange={event => {const operation=event.target.value as CircuitTraceStep["operation"];patchTrace(i,{operation,
              first:["kcl","kvl"].includes(operation) ? "" : item.first,
              second:["kcl","kvl","corrente","tensione"].includes(operation) ? "" : item.second,
              claimed_value:["kcl","kvl"].includes(operation) ? null : item.claimed_value})}}>
            <option value="serie">Serie</option><option value="parallelo">Parallelo</option>
            <option value="kcl">KCL al nodo</option><option value="kvl">KVL nella maglia</option>
            <option value="corrente">Corrente componente</option>
            <option value="tensione">Tensione componente</option><option value="altro">Altro</option>
          </select>
          <input aria-label={kvl ? `Nodo ${i+1}` : `Primo componente ${i+1}`} placeholder={law ? kvl ? "Nodo iniziale" : "Nodo" : "R1"} style={field} value={item.first}
            onChange={event => patchTrace(i,{first:event.target.value})}/>
          <input aria-label={numeric ? `Verso (morsetti) ${i+1}` : kvl ? `Termini orientati ${i+1}` : `Secondo componente ${i+1}`}
            placeholder={kcl ? "-R1,+R2,+R3" : kvl ? "+R1,+R2,-V1" : numeric ? "q,p (facoltativo)" : "R2"}
            style={field} value={item.second}
            onChange={event => patchTrace(i,{second:event.target.value})}/>
          {!law && <input aria-label={`Valore ${i+1}`} placeholder={numeric ? item.operation === "corrente" ? "A" : "V" : "Ω"} style={field} value={item.claimed_value ?? ""}
            onChange={event => patchTrace(i,{claimed_value:event.target.value || null})}/>}
        </div>
        <label>Leggibilità<select style={field} value={item.reading}
          onChange={event => patchTrace(i,{reading:event.target.value as CircuitTraceStep["reading"]})}>
          <option value="clear">Chiaro</option><option value="ambiguous">Incerto</option><option value="unreadable">Illeggibile</option>
        </select></label>
      </fieldset>})}
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
