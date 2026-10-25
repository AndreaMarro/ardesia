import { useEffect, useRef, useState } from "react";
import { describeError, requestKey, studyRequest } from "../../api";
import { studySessionEpoch, subscribeStudySessionEnd } from "../../../../studio/src/study/sessionBoundary";
import type { InsightData } from "./contracts";
import "./learning-insights.css";

type Props = { me: { id: string; role: "student" | "teacher" }; editionId: string };
const outcomes = {MATCH:"Concorde con il modello",MISMATCH:"Da confrontare con il modello",NOT_CHECKED:"Esito non verificato"};
const help: Record<string,string> = {"constraint-hint":"Indizio sul vincolo","lesson-passage":"Passaggio della lezione","model-result":"Risultato del modello"};
const categories: Record<string,string> = {units:"Unità di misura",procedure:"Procedimento",model_selection:"Scelta del modello",ambiguous_question:"Contenuto da chiarire"};

export function LearningInsights(props: Props) {
  return <ScopedInsights key={`${props.me.id}:${props.me.role}:${props.editionId}`} {...props}/>;
}

function ScopedInsights({me,editionId}: Props) {
  const [data,setData]=useState<InsightData|null>(null);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState("");
  const [reason,setReason]=useState("");
  const [contesting,setContesting]=useState<string|null>(null);
  const lifetime=useRef({alive:true,revoked:false,epoch:studySessionEpoch()});
  const read=useRef<AbortController|null>(null);
  const current=()=>lifetime.current.alive&&!lifetime.current.revoked&&lifetime.current.epoch===studySessionEpoch();
  const query=new URLSearchParams({editionId}).toString();
  async function refresh() {
    read.current?.abort();const controller=new AbortController();read.current=controller;
    setError("");
    try {
      const result=await studyRequest<InsightData>(`/learning-insights?${query}`,undefined,{signal:controller.signal});
      if(current()&&!controller.signal.aborted) setData(result);
    } catch(e) {
      if(current()&&!controller.signal.aborted) {setData(null);setError(describeError(e,"Le evidenze non sono disponibili. Controlla la connessione e riprova."));}
    }
  }
  useEffect(()=>{
    lifetime.current={alive:true,revoked:false,epoch:studySessionEpoch()};
    const unsubscribe=subscribeStudySessionEnd(()=>{
      lifetime.current.revoked=true;read.current?.abort();setData(null);setBusy(false);setError("La sessione è terminata. Accedi di nuovo.");
    });
    void refresh();
    return ()=>{lifetime.current.alive=false;read.current?.abort();unsubscribe();};
  },[]); // A keyed identity/edition owns this complete request lifetime.

  async function command(run:()=>Promise<unknown>,message:string) {
    if(!current())return;
    setBusy(true);setError("");setStatus("");
    try {await run();if(current()){setStatus(message);await refresh();}}
    catch(e){if(current()){
      const code=e instanceof Error?e.message:"";
      if(["unauthenticated","forbidden","session_changed","insight_source_unavailable","stale_source"].includes(code))setData(null);
      setError(code==="insight_source_unavailable"?"La fonte non è più disponibile. Aggiorna le evidenze prima di continuare.":describeError(e,"Operazione non riuscita. I dati facoltativi non sono stati confermati; puoi riprovare."));
    }} finally {if(current())setBusy(false);}
  }
  async function download() {
    await command(async()=>{
      const value=await studyRequest<InsightData>(`/learning-insights/export?${query}`);
      if(!current())return;
      const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:"application/json"}));
      const anchor=document.createElement("a");anchor.href=url;anchor.download="ardesia-learning-insights.json";anchor.click();URL.revokeObjectURL(url);
    },"Esportazione preparata. Contiene le sole evidenze visibili al tuo account.");
  }
  return <section className="learning-insights" aria-labelledby="insights-title">
    <header className="page-heading"><p className="insights-eyebrow">Il percorso, con le sue fonti</p>
      <h1 id="insights-title">{me.role==="student"?"Quello che hai provato.":"Le evidenze del corso."}</h1>
      <p>Tentativi, aiuti richiesti e passaggi da riprendere. Ogni indicazione conserva la propria evidenza.</p>
    </header>
    <div className="insights-toolbar"><button onClick={()=>void refresh()} disabled={busy||lifetime.current.revoked}>Aggiorna</button>
      {data&&<button onClick={()=>void download()} disabled={busy}>Esporta i dati visibili</button>}</div>
    {error&&<p className="insights-error" role="alert">{error}</p>}
    <p className="insights-status" role="status">{status}</p>
    {!data&&!error&&<p role="status">Apertura delle evidenze…</p>}
    {data&&<>
      {data.cohortSuppressed?<aside className="insights-note">Statistiche di gruppo nascoste: meno di cinque studenti con evidenze utilizzabili. Restano disponibili le singole ricevute autorizzate.</aside>:
      data.summary&&<dl className="insights-metrics"><div><dt>Tentativi conservati</dt><dd>{data.summary.attempts}</dd></div><div><dt>Con verifica deterministica</dt><dd>{data.summary.checked}</dd></div><div><dt>Con aiuto richiesto</dt><dd>{data.summary.assisted}</dd></div></dl>}
      <div className="insights-columns"><section aria-labelledby="attempts-title"><h2 id="attempts-title">Le prove svolte</h2>
        {!data.attempts.length&&<p>Le tue ricevute appariranno qui dopo una consegna. Lo studio resta disponibile con l’analitica facoltativa disattivata.</p>}
        <ol className="insights-attempts">{data.attempts.map(a=><li key={a.receiptId}><article className="insights-card">
          <div className="insights-card-title"><h3>{a.activityId}</h3><span className={`insights-badge ${a.outcome==="MISMATCH"?"insights-review":""}`}>{outcomes[a.outcome]}</span></div>
          <p>{a.assistance==="SUPPORT_REQUESTED"?"Aiuto richiesto":a.assistance==="NO_SUPPORT_REQUESTED"?"Nessun aiuto richiesto registrato":"Assistenza non registrata"}</p>
          {a.supportUsed.length>0&&<ul>{a.supportUsed.map(s=><li key={s}>{help[s]??s}</li>)}</ul>}
          {me.role==="teacher"&&<p>Studente: {a.studentId}</p>}
          {a.sourceState==="HISTORICAL"&&<p className="insights-note">La fonte è stata aggiornata. Questa ricevuta conserva la revisione storica.</p>}
          <details><summary>Mostra evidenza</summary><dl><dt>Ricevuta Core</dt><dd>{a.receiptId}</dd><dt>Modello / versione</dt><dd>{a.activityId} / {a.modelVersion??"non registrata"}</dd><dt>Fonti esatte</dt><dd>{a.sourceRefs.map(r=><p key={r.resourceId}>{r.resourceId} · {r.revisionId}</p>)}</dd></dl><p>Il controllo riguarda questa prova. Non misura da solo l’apprendimento né gli aiuti esterni.</p></details>
          {me.role==="student"&&<button disabled={busy||!data.preferences.enabled} onClick={()=>void command(()=>studyRequest("/learning-insights/events",{editionId,events:[{schemaVersion:1,eventId:requestKey(),consentId:data.preferences.consentId,receiptId:a.receiptId,kind:"difficulty.reported",occurredAt:Date.now()/1000}]}),"Segnalazione registrata come osservazione dichiarata, senza diagnosi.")}>Segnala difficoltà</button>}
        </article></li>)}</ol>
        {data.comparisons.length>0&&<section className="insights-card"><h2>Tentativi collegati</h2><p>Confronti osservati, senza attribuzione causale. Un tentativo dopo il primo può avere aiuti diversi.</p>{data.comparisons.map(c=><details key={c.afterReceiptId}><summary>{c.scope==="SAME_MODEL_PARAMETERS"?"Stesso modello e parametri":"Il contesto è cambiato"}</summary><p>Prima: {outcomes[c.beforeOutcome as keyof typeof outcomes]??c.beforeOutcome}. Dopo: {outcomes[c.afterOutcome as keyof typeof outcomes]??c.afterOutcome}.</p><p>Ricevute: {c.beforeReceiptId} → {c.afterReceiptId}</p><p>Assistenza registrata: {c.beforeAssistance} → {c.afterAssistance}</p></details>)}</section>}
      </section><aside><section className="insights-card" aria-labelledby="suggestions-title"><h2 id="suggestions-title">Da riprendere insieme</h2>
        {!data.suggestions.length&&<p>Nessuna indicazione revisionata da mostrare. Pochi clic non bastano per classificare una difficoltà.</p>}
        {data.suggestions.map(s=><article key={s.threadId}><h3>{categories[s.category]??s.category}</h3><p>{s.uncertainty}</p><details><summary>Fonte dell’indicazione</summary><p>{s.sourceRef.resourceId} · {s.sourceRef.revisionId}</p><p>Osservazione revisionata nel diario Core.</p></details>
          {me.role==="student"&&<button onClick={()=>{setContesting(s.threadId);setReason("");}}>Contesta questa indicazione</button>}</article>)}
        {contesting&&<form onSubmit={e=>{e.preventDefault();void command(async()=>{await studyRequest(`/diary/threads/${encodeURIComponent(contesting)}/contest`,{reason},{headers:{"Idempotency-Key":requestKey()}});if(current())setContesting(null);},"Contestazione inviata al diario per la revisione.");}}><label>Motivo della contestazione<textarea required maxLength={4000} value={reason} onChange={e=>setReason(e.target.value)}/></label><button disabled={busy||!reason.trim()}>Invia contestazione</button></form>}
      </section>
      {data.recoveries.length>0&&<section className="insights-card"><h2>Verificati su una prova diversa</h2>{data.recoveries.map(r=><article key={r.threadId}><h3>{categories[r.category]??r.category}</h3><p>{r.scope}</p><details><summary>Fonte della verifica</summary><p>Osservazione: {r.sourceRef.resourceId} · {r.sourceRef.revisionId}</p><p>Ricevuta della nuova prova: {r.verificationReceiptId}</p>{r.verificationSourceRefs.map(ref=><p key={ref.resourceId}>{ref.resourceId} · {ref.revisionId}</p>)}</details></article>)}</section>}
      <section className="insights-card" aria-labelledby="privacy-title"><h2 id="privacy-title">I dati, sotto controllo</h2>
        <p>Ricevute e feedback servono a ritrovare il tuo lavoro. L’analitica facoltativa è una scelta separata, riferita a questa edizione.</p>
        {me.role==="student"&&<><label className="insights-choice"><input type="checkbox" checked={data.preferences.enabled} disabled={busy||!data.preferences.notice} onChange={e=>{const enabled=e.target.checked;void command(()=>studyRequest("/learning-insights/preferences",{editionId,enabled,noticeVersion:enabled?data.preferences.notice?.version:null},{method:"PUT"}),enabled?"Analitica facoltativa attivata.":"Analitica facoltativa disattivata ed eventi facoltativi cancellati. Lo studio continua.");}}/>Condividi osservazioni d’uso facoltative</label>
          {data.preferences.notice?<p>{data.preferences.notice.purpose}. Conservazione prevista degli eventi: {data.preferences.notice.retentionDays} giorni. Disattivando cancelli gli eventi facoltativi; le ricevute restano nel Core.</p>:<p>Raccolta non attiva: l’informativa per questa finalità non è configurata.</p>}</>}
        <p>Nessuna registrazione di audio, video, testo libero, emozioni o attività fuori dall’app tramite questo pannello. Nessun uso per addestramento esterno.</p>
        <details><summary>Limiti delle misure</summary><ul>{data.limits.map(l=><li key={l}>{l}</li>)}</ul></details>
      </section></aside></div>
    </>}
  </section>;
}
