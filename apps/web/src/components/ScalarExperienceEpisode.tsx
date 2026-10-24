import {useEffect, useRef, useState} from "react";
import {describeError, requestKey, studyRequest, type StudyMe, type Workspace} from "../api";
import {ErrorNotice, Loading} from "./Feedback";
import type {ActivityEvidenceV2, ComposableExperience, ComposableExperienceStep, ComposableExperiencesResponse, HydrostaticParameters} from "./experienceTypes";
import {HydrostaticModel, hydrostaticFormat} from "./HydrostaticModel";
import {LessonPassageAuthoring, LessonPassageRecovery} from "./LessonPassage";
import {readLessonPassage} from "./lessonPassageReference";

type Reference = {resourceId: string; revisionId: string};
type Receipt = {receiptId: string; submissionId: string; revision: number; activityEvidence: ActivityEvidenceV2};
const phaseNames = {situation: "Situazione", prediction: "Previsione", model: "Modello", visual: "Rappresentazione", explanation: "Spiegazione", source: "Lezione", transfer: "Nuova prova"};
type HydroStep = Extract<ComposableExperienceStep, {activityId: "hydrostatic-v1"}>;

export function ScalarExperienceEpisode({me, data, onUpdate}: {me: StudyMe; data: Workspace; onUpdate: () => Promise<void>}) {
  const [items, setItems] = useState<ComposableExperience[] | null>(null), [error, setError] = useState("");
  const [reload, setReload] = useState(0), [selected, setSelected] = useState("");
  useEffect(() => {
    let active = true; const controller = new AbortController(); setItems(null); setError("");
    void studyRequest<ComposableExperiencesResponse>("/learning-experiences?" + new URLSearchParams({editionId: data.edition.id, format: "composable"}), undefined, {signal: controller.signal})
      .then(value => {if (active) setItems(value.experiences.filter(item => item.compositionVersion === 1 && item.steps.length > 0 && item.steps.every(step => step.activityId === "hydrostatic-v1" && step.prediction.kind === "scalar" && step.prediction.unit === "Pa" && step.advanceWhen === "receipt-confirmed") && item.coursePackRef.packId === data.edition.packId && item.coursePackRef.packVersion === data.edition.packVersion && item.coursePackRef.packSha256 === data.edition.packSha256));})
      .catch(failure => {if (active) setError(describeError(failure, "Il percorso non è disponibile. Puoi riprovare."));});
    return () => {active = false; controller.abort();};
  }, [data.edition.id, data.edition.packSha256, reload]);
  if (error) return <ErrorNotice message={error} onRetry={() => setReload(n => n + 1)} />;
  if (!items) return <Loading>Apro il percorso di pressione…</Loading>;
  const experience = items.find(item => item.id === selected) ?? items[0];
  if (!experience) return <p>Nessun percorso compatibile con questa versione del corso.</p>;
  return <section className="poiseuille-episode" aria-labelledby="scalar-experience-title">
    <div className="lab-introduction"><p className="entry-label">Dalla lezione a una nuova prova · Idrostatica</p><h2 id="scalar-experience-title">{experience.title}</h2><p>{experience.objective}</p>
      {items.length > 1 && <label>Percorso di pressione<select value={experience.id} onChange={e => setSelected(e.target.value)}>{items.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}
    </div>
    {me.role === "teacher" ? <>
      <LessonPassageAuthoring editionId={data.edition.id} onUpdate={onUpdate} />
      <ol className="episode-teacher-plan">{experience.steps.map(step => <li key={step.id}><strong>{step.title}</strong><p>{step.prompt}</p><p>Passi: {step.phases.map(phase => phaseNames[phase]).join(" → ")}. Avanzamento dopo ricevuta, senza approvazione automatica del procedimento.</p></li>)}</ol>
      <p>Le tre previsioni arrivano nelle consegne del corso. Da “Correzioni” ritrovi originale, fonte esatta e aiuti; il diario conserva le osservazioni verificate dal tutor.</p>
    </> : <ScalarSequence key={JSON.stringify(experience.experienceRef)} experience={experience} data={data} onUpdate={onUpdate} />}
    <p className="fine-print">Contenuto DRAFT, revisione scientifica non attestata. Il confronto numerico non valuta il ragionamento. Il riferimento alla lezione è dichiarato dal docente.</p>
  </section>;
}

function ScalarSequence({experience, data, onUpdate}: {experience: ComposableExperience; data: Workspace; onUpdate: () => Promise<void>}) {
  const [index, setIndex] = useState(0), [locked, setLocked] = useState(false);
  const sources = data.resources.filter(resource => resource.editionId === data.edition.id && readLessonPassage(resource));
  const [source, setSource] = useState<Reference | null>(() => sources[0] ? {resourceId: sources[0].id, revisionId: sources[0].revisionId} : null);
  const sourceValue = source ? JSON.stringify(source) : "";
  return <>
    <ol className="episode-progress" aria-label="Passi del percorso di pressione">{experience.steps.map((step, i) => <li key={step.id} aria-current={i === index ? "step" : undefined}><span>{i + 1}</span>{step.title}</li>)}</ol>
    {(sources.length > 0 || source) && <label>Passaggio della lezione collegato<select value={sourceValue} disabled={locked} onChange={e => setSource(e.target.value ? JSON.parse(e.target.value) : null)}>
      <option value="">Nessun passaggio selezionato</option>
      {source && !sources.some(item => item.id === source.resourceId && item.revisionId === source.revisionId) && <option value={sourceValue}>Passaggio selezionato · revisione {source.revisionId.slice(0, 8)}</option>}
      {sources.map(item => <option key={`${item.id}:${item.revisionId}`} value={JSON.stringify({resourceId: item.id, revisionId: item.revisionId})}>{readLessonPassage(item)!.descriptor.objectRefs[0].label} · versione {item.revisionId.slice(0, 8)}</option>)}
    </select></label>}
    <ScalarPrediction key={experience.steps[index].id} experience={experience} step={experience.steps[index] as HydroStep} editionId={data.edition.id} source={source} onUpdate={onUpdate} onActivity={() => setLocked(true)}
      next={index + 1 < experience.steps.length ? () => {setIndex(i => i + 1); setLocked(false);} : undefined} />
  </>;
}

function ScalarPrediction({experience, step, editionId, source, onUpdate, onActivity, next}: {
  experience: ComposableExperience; step: HydroStep; editionId: string; source: Reference | null;
  onUpdate: () => Promise<void>; onActivity: () => void; next?: () => void;
}) {
  const [prediction, setPrediction] = useState(""), [procedure, setProcedure] = useState("");
  const [hints, setHints] = useState(0), [recovery, setRecovery] = useState(false), [support, setSupport] = useState<string[]>([]);
  const [receipt, setReceipt] = useState<Receipt | null>(null), [parentId, setParentId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  const pending = useRef<{key: string; body: Record<string, unknown>} | null>(null), mounted = useRef(true), title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {mounted.current = true; title.current?.focus(); return () => {mounted.current = false;};}, []);
  const number = Number(prediction.replace(",", "."));
  const valid = prediction.trim() !== "" && Number.isFinite(number) && number >= 0 && procedure.trim().length >= 12;
  const locked = busy || Boolean(pending.current) || Boolean(receipt);
  function help(id: string) {onActivity(); setSupport(items => items.includes(id) ? items : [...items, id]);}
  async function submit() {
    if (busy || receipt || !valid) return;
    onActivity();
    const attempt = pending.current ?? {key: requestKey(), body: {
      editionId, activityId: step.activityId, activityParameters: step.parameters, parentId, assetRefs: [], sourceRefs: source ? [source] : [],
      text: `Previsione: ${prediction} Pa.\n\nProcedimento: ${procedure.trim()}`,
      activityEvidence: {schemaVersion: 2, experienceRef: experience.experienceRef, stepId: step.id, prediction: {kind: "scalar", value: number, unit: step.prediction.unit}, supportUsed: support, ...(source ? {lessonPassageRef: source} : {})},
    }};
    pending.current = attempt; setBusy(true); setError(""); setMessage("");
    try {
      const value = await studyRequest<Receipt>("/submissions", attempt.body, {headers: {"Idempotency-Key": attempt.key}});
      if (!mounted.current) return;
      if (value.activityEvidence?.schemaVersion !== 2 || value.activityEvidence.experienceRef.sha256 !== experience.experienceRef.sha256 || value.activityEvidence.stepId !== step.id || value.activityEvidence.result.kind !== "scalar") throw new Error("La ricevuta non corrisponde al passo richiesto.");
      pending.current = null; setReceipt(value); setMessage("Previsione e procedimento ricevuti. Il tutor verifica il ragionamento.");
      try {await onUpdate();} catch {if (mounted.current) setMessage("Ricevuta confermata. Aggiorna le consegne per rileggerla.");}
    } catch (failure) {if (mounted.current) setError(describeError(failure, "Consegna non confermata. Riprova lo stesso invio: la previsione resta qui."));}
    finally {if (mounted.current) setBusy(false);}
  }
  const evidence = receipt?.activityEvidence, result = evidence?.result.kind === "scalar" ? evidence.result : null;
  const check = evidence?.check.kind === "scalar" ? evidence.check : null;
  const parameters: HydrostaticParameters = step.parameters;
  return <section className="episode-step">
    <h3 ref={title} tabIndex={-1}>{step.title}</h3><p>{step.prompt}</p>
    <ol className="composition-phases" aria-label="Composizione del passo">{step.phases.map(phase => <li key={phase} aria-current={phase === (receipt ? "explanation" : "prediction") ? "step" : undefined}>{phaseNames[phase]}</li>)}</ol>
    <div className="lab-layout"><div className="lab-experiment">
      <HydrostaticModel depth={parameters.depth} result={result} />
      <p>ρ = {hydrostaticFormat(parameters.density)} kg/m³ · g = {hydrostaticFormat(parameters.g)} m/s² · superficie = {hydrostaticFormat(parameters.surfacePressure)} Pa. Riferimento: {parameters.reference === "gauge" ? "relativo alla superficie" : "assoluto"}.</p>
      <div className="lab-result" aria-live="polite">{result && check ? <><span>{result.calculatedVariable}</span><strong data-testid="scalar-episode-result">{hydrostaticFormat(result.value)} {result.unit}</strong><p>{check.valueMatches && check.unitMatches ? "Valore e unità coincidono con il modello. Il procedimento resta da verificare." : "Valore o unità da rivedere: separa il contributo della superficie da quello della profondità."}</p><p>{evidence?.assistance === "SUPPORT_REQUESTED" ? "Risposta con aiuto richiesto o risultato precedente disponibile." : "Nessun aiuto richiesto nel servizio prima di questa previsione."}</p></> : <><span>Prima la tua previsione.</span><p>Il risultato viene dal Core soltanto dopo la ricevuta della consegna.</p></>}</div>
    </div><form className="lab-controls" onSubmit={event => {event.preventDefault(); void submit();}}>
      <label>Pressione prevista in Pa<input inputMode="decimal" maxLength={40} value={prediction} disabled={locked} onChange={e => setPrediction(e.target.value)} /></label>
      <label>Spiega il riferimento e il procedimento<textarea rows={4} maxLength={8000} value={procedure} disabled={locked} onChange={e => setProcedure(e.target.value)} /></label>
      {!receipt && <button className="button-primary" disabled={busy || !valid}>{busy ? "Invio…" : pending.current ? "Riprova lo stesso invio" : "Registra previsione e confronta"}</button>}
      <button type="button" disabled={Boolean(pending.current)} aria-disabled={hints >= step.hints.length} onClick={() => {if (hints < step.hints.length) {setHints(n => n + 1); help("constraint-hint");}}}>{hints ? "Un altro indizio" : "Un indizio sul riferimento"}</button>
      {step.hints.slice(0, hints).map((hint, index) => <p className="entry-explanation" key={index}>{hint}</p>)}
      <button type="button" disabled={Boolean(pending.current)} onClick={() => {setRecovery(true); if (source) help("lesson-passage");}}>Recupera il passaggio della lezione</button>
      {recovery && (source ? <LessonPassageRecovery reference={source} /> : <p>Il tutor non ha ancora collegato un passaggio della lezione.</p>)}
      {error && <ErrorNotice message={error} />}
      {receipt && <>
        <button type="button" onClick={() => {setParentId(receipt.submissionId); setReceipt(null); help("model-result"); setMessage("");}}>Correggi con il risultato visto</button>
        {next ? <button type="button" className="button-primary" onClick={next}>Prosegui al prossimo problema</button> : <p className="success-notice">Percorso consegnato. Ritrovi i tentativi e il feedback in “Il mio lavoro”; il tutor può collegare l’esito al diario.</p>}
        <p className="fine-print">Ricevuta {receipt.receiptId}. Nessun avanzamento certifica padronanza o assenza di aiuti esterni.</p>
      </>}
      <p role="status">{message}</p>
    </form></div>
  </section>;
}
