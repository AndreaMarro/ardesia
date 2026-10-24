import { useEffect, useRef, useState } from "react";
import {publicActivityDomain} from "../publicPreview";
import { describeError, requestKey, studyRequest, type StudyMe, type Workspace } from "../api";
import { ErrorNotice, Loading } from "./Feedback";
import type { ActivityEvidence, ExperienceStep, LearningExperience } from "./experienceTypes";
import { LessonPassageAuthoring, LessonPassageRecovery } from "./LessonPassage";
import { readLessonPassage } from "./lessonPassageReference";
import { PhysicsLab, PoiseuilleModel } from "./PhysicsLab";

type Receipt = { receiptId: string; submissionId: string; revision: number; activityEvidence: ActivityEvidence };
export function PoiseuilleEpisode({ me, data, onUpdate }: {
  me: StudyMe; data: Workspace; onUpdate: () => Promise<void>;
}) {
  const [experiences, setExperiences] = useState<LearningExperience[] | null>(null);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setExperiences(null); setError("");
    void studyRequest<{experiences: LearningExperience[]}>("/learning-experiences?" + new URLSearchParams({editionId: data.edition.id}),
      undefined, {signal: controller.signal}).then(value => { if (active) setExperiences(value.experiences); })
      .catch(failure => { if (active) setError(describeError(failure, "L’episodio non è disponibile. Puoi riprovare.")); });
    return () => { active = false; controller.abort(); };
  }, [data.edition.id, data.edition.packSha256, reload]);
  if (error) return <ErrorNotice message={error} onRetry={() => setReload(n => n + 1)} />;
  if (!experiences) return <Loading>Apro l’episodio del corso…</Loading>;
  const experience = experiences.find(item => item.id === selected) ?? experiences[0];
  if (!experience) return <p>Non è disponibile un episodio per questa versione del corso.</p>;
  return <section className="poiseuille-episode" aria-labelledby="episode-title">
    <div className="lab-introduction">
      <p className="entry-label">Dalla lezione a una nuova prova</p>
      <h2 id="episode-title">{experience.title}</h2><p>{experience.objective}</p>
      {experiences.length > 1 && <label>Variante del percorso
        <select value={experience.id} onChange={e => setSelected(e.target.value)}>
          {experiences.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
        </select>
      </label>}
    </div>
    {me.role === "teacher" ? <>
      <LessonPassageAuthoring editionId={data.edition.id} onUpdate={onUpdate} />
      <ol className="episode-teacher-plan">{experience.steps.map(step => <li key={step.id}><strong>{step.title}</strong><p>{step.prompt}</p></li>)}</ol>
      <p>Le previsioni e i procedimenti arrivano nelle consegne. Da “Correzioni” puoi restituire il feedback, collegare un passaggio al diario e assegnare una nuova prova.</p>
    </> : <EpisodeSequence key={experience.id} experience={experience} data={data} onUpdate={onUpdate} />}
    <p className="fine-print">Ambiente con identità sintetiche. Contenuto DRAFT, revisione scientifica non attestata. Il controllo numerico non sostituisce il feedback del docente.</p>
  </section>;
}

function EpisodeSequence({experience, data, onUpdate}: {
  experience: LearningExperience; data: Workspace; onUpdate: () => Promise<void>;
}) {
  const [index, setIndex] = useState(0);
  const passages = data.resources.filter(resource => resource.editionId === data.edition.id && readLessonPassage(resource));
  const [passageId, setPassageId] = useState(passages[0]?.id ?? "");
  const [passageLocked, setPassageLocked] = useState(false);
  const [explorationUsed, setExplorationUsed] = useState(false);
  const selectedPassage = passages.find(item => item.id === passageId);
  const step = experience.steps[index];
  return <>
    <ol className="episode-progress" aria-label="Passi dell’episodio">
      {experience.steps.map((item, i) => <li key={item.id} aria-current={i === index ? "step" : undefined}>
        <span>{i + 1}</span> {item.title}
      </li>)}
    </ol>
    {passages.length > 0 && <label>Passaggio della lezione collegato
      <select value={passageId} disabled={passageLocked} onChange={e => setPassageId(e.target.value)}>
        <option value="">Nessun passaggio selezionato</option>
        {passages.map(resource => <option key={resource.id} value={resource.id}>{readLessonPassage(resource)!.descriptor.objectRefs[0].label} · versione {resource.revisionId.slice(0, 8)}</option>)}
      </select>
    </label>}
    <PredictionStep key={step.id} experience={experience} step={step} data={data}
      passage={selectedPassage ? {resourceId: selectedPassage.id, revisionId: selectedPassage.revisionId} : null}
      initialSupport={explorationUsed ? ["model-result"] : []} onExplore={() => setExplorationUsed(true)}
      onUpdate={onUpdate} onActivity={() => setPassageLocked(true)} next={index + 1 < experience.steps.length ? () => {setIndex(index + 1); setPassageLocked(false);} : undefined} />
  </>;
}

function PredictionStep({experience, step, data, passage, onUpdate, onActivity, initialSupport, onExplore, next}: {
  experience: LearningExperience; step: ExperienceStep; data: Workspace;
  passage: {resourceId: string; revisionId: string} | null;
  onUpdate: () => Promise<void>; onActivity: () => void; next?: () => void;
  initialSupport: string[]; onExplore: () => void;
}) {
  const [ratio, setRatio] = useState("");
  const [boundary, setBoundary] = useState("");
  const [procedure, setProcedure] = useState("");
  const [support, setSupport] = useState<string[]>(initialSupport);
  const [graph, setGraph] = useState(false), [explore, setExplore] = useState(false);
  const [hint, setHint] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const mounted = useRef(true);
  const title = useRef<HTMLHeadingElement>(null);
  const pending = useRef<{key: string; body: Record<string, unknown>} | null>(null);
  useEffect(() => { mounted.current = true; title.current?.focus(); return () => { mounted.current = false; }; }, []);
  function useSupport(id: string) { onActivity(); setSupport(items => items.includes(id) ? items : [...items, id]); }
  const number = Number(ratio.replace(",", "."));
  const ready = ratio.trim() !== "" && Number.isFinite(number) && number > 0 && boundary !== "" && procedure.trim().length >= 12;
  async function submit() {
    if (busy || !ready || receipt) return;
    onActivity();
    const attempt = pending.current ?? {key: requestKey(), body: {
      editionId: data.edition.id, activityId: step.activityId, activityParameters: step.parameters,
      text: `Previsione: ${ratio}; grandezza fissata: ${boundary === "flow" ? "Q" : "Δp"}.\n\nProcedimento: ${procedure.trim()}`,
      assetRefs: [], parentId,
      sourceRefs: passage ? [passage] : [],
      activityEvidence: {schemaVersion: 1, experienceId: experience.id, stepId: step.id,
        prediction: {ratio: number, fixedQuantity: boundary}, supportUsed: support,
        ...(passage ? {lessonPassageRef: passage} : {})},
    }};
    pending.current = attempt;
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await studyRequest<Receipt>("/submissions", attempt.body, {headers: {"Idempotency-Key": attempt.key}});
      if (!mounted.current) return;
      pending.current = null;
      setReceipt(result);
      setMessage("Previsione e procedimento ricevuti. La verifica del ragionamento spetta al tutor.");
      try { await onUpdate(); }
      catch { if (mounted.current) setMessage("Previsione ricevuta. Aggiorna le consegne per rileggerla."); }
    } catch (failure) { if (mounted.current) setError(describeError(failure, "Consegna non confermata. Il procedimento è qui: riprova lo stesso invio.")); }
    finally { if (mounted.current) setBusy(false); }
  }
  const evidence = receipt?.activityEvidence;
  const lengthRatio = step.parameters.length ?? 1, viscosityRatio = step.parameters.viscosity ?? 1;
  const changedMaterial = lengthRatio !== 1 || viscosityRatio !== 1;
  const locked = busy || Boolean(pending.current) || Boolean(receipt);
  return <div className="episode-step">
    <h3 ref={title} tabIndex={-1}>{step.title}</h3><p>{step.prompt}</p>
    <div className="lab-layout">
      <div className="lab-experiment">
        <PoiseuilleModel radius={step.parameters.radiusRatio} boundary={step.parameters.boundary}
          revealed={Boolean(evidence) && (!changedMaterial || Boolean(evidence?.result.visual))} graph={graph && !changedMaterial}
          lengthRatio={lengthRatio} viscosityRatio={viscosityRatio} visualState={evidence?.result.visual} />
        <p>{changedMaterial ? `η/η₀ = ${viscosityRatio.toLocaleString("it-IT")} · L/L₀ = ${lengthRatio.toLocaleString("it-IT")}.` : "Stesso fluido e stessa lunghezza."} Rapporti senza unità; Q in m³/s, Δp in Pa, r e L in m, η in Pa·s.</p>
        <p className="fine-print">{evidence?.result.domain ?? publicActivityDomain}</p>
        <div className="lab-result" aria-live="polite">
          {evidence ? <>
            <span>Il modello deterministico restituisce</span>
            <strong data-testid="episode-ratio">{evidence.result.calculatedVariable} = {evidence.result.ratio.toLocaleString("it-IT", {maximumFractionDigits: 6})}</strong>
            <p>{!evidence.check.constraintMatches ? "Hai scambiato il vincolo: rileggi quale grandezza viene mantenuta costante." :
              !evidence.check.ratioMatches ? "Il vincolo è quello indicato. Ricontrolla il raggio alla quarta potenza, i fattori viscosità e lunghezza e la grandezza da isolare." :
              "Il rapporto e il vincolo coincidono con il modello. Il tutor può ora rivedere il procedimento."}</p>
            <p>{evidence.assistance === "SUPPORT_REQUESTED" ? "Risposta con aiuto richiesto prima della previsione." : "Nessun aiuto richiesto in questo passaggio prima della previsione."}</p>
          </> : <><span>Prima la tua previsione.</span><p>Il risultato compare dopo che previsione e procedimento sono stati ricevuti dal servizio.</p></>}
        </div>
      </div>
      <form className="lab-controls" onSubmit={e => {e.preventDefault(); void submit();}}>
        <label>Rapporto previsto<input inputMode="decimal" value={ratio} maxLength={40} disabled={locked} onChange={e => setRatio(e.target.value)} /></label>
        <label>Grandezza che resta fissata<select value={boundary} disabled={locked} onChange={e => setBoundary(e.target.value)}>
          <option value="">Scegli il vincolo</option><option value="pressure">Differenza di pressione Δp</option><option value="flow">Portata Q</option>
        </select></label>
        <label>Spiega il vincolo e il procedimento<textarea rows={4} maxLength={8000} value={procedure} disabled={locked} onChange={e => setProcedure(e.target.value)} /></label>
        {!receipt && <button className="button-primary" disabled={busy || !ready}>{busy ? "Invio…" : "Registra previsione e confronta"}</button>}
        <button type="button" onClick={() => {setHint(true); useSupport("constraint-hint");}}>Un aiuto sul vincolo</button>
        {hint && <p className="entry-explanation">Parti da Q = π r⁴ Δp / (8 η L). Se Q resta costante, isola Δp: la quarta potenza del raggio è al denominatore. Se Δp resta costante, confronta Q.</p>}
        <button type="button" onClick={() => {setRecovery(true); if (passage) useSupport("lesson-passage");}}>Recupera il passaggio della lezione</button>
        {recovery && (passage ? <LessonPassageRecovery key={`${passage.resourceId}:${passage.revisionId}`} reference={passage} /> :
          <p>Il tutor non ha ancora collegato un passaggio della lezione. Puoi usare l’aiuto sul vincolo e chiedere il collegamento.</p>)}
        {error && <ErrorNotice message={error} />}
        {receipt && <>
          {!changedMaterial && <button type="button" aria-expanded={graph} onClick={() => {setGraph(value => !value); onExplore();}}>Guarda la relazione nel grafico</button>}
          <button type="button" aria-expanded={explore} onClick={() => {setExplore(value => !value); onExplore();}}>Esplora il raggio e il vincolo</button>
          <button type="button" onClick={() => {
            setParentId(receipt.submissionId); setReceipt(null); setSupport(items => [...new Set([...items, "model-result"])]);
            setMessage(""); setError("");
          }}>Correggi con il risultato visto</button>
          {next ? <button className="button-primary" type="button" onClick={next}>{step.id === "fixed-flow" ? "Affronta il problema diverso" : "Cambia il vincolo"}</button> :
            <p className="success-notice">Episodio consegnato. In “Il mio lavoro” ritrovi tentativi e feedback; nel diario, le osservazioni che il tutor ha verificato e il prossimo problema assegnato.</p>}
          <p className="fine-print">Ricevuta {receipt.receiptId}. Gli aiuti esterni non sono osservati; questa risposta non attesta padronanza autonoma.</p>
        </>}
        <p role="status">{message}</p>
      </form>
    </div>
    {explore && <section className="episode-exploration"><h3>Fai cambiare il modello.</h3><p>Questa è un’esplorazione con viscosità e lunghezza costanti, distinta dal problema assegnato. La prossima previsione dell’episodio conserverà l’uso del modello come aiuto.</p><PhysicsLab numericPrediction /></section>}
  </div>;
}
