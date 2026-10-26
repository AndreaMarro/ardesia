import * as Dialog from "@radix-ui/react-dialog";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { StudyMe, Workspace } from "../../api";
import { courseScope } from "../../course";
import { ErrorNotice, Loading } from "../../components/Feedback";
import { SourceViewer } from "../../components/SourceViewer";
import { displaySourceTitle, readLessonPassage } from "../../components/lessonPassageReference";
import { PoiseuilleModel } from "../../components/PoiseuilleVisual";
import { PredictionEvidence } from "../../components/PredictionEvidence";
import { JourneyDialog, JourneyDialogActivity } from "./JourneyDialog";
import { ready, withinCheckpointLimit, unavailableIntegrations, type JourneyIntegrations, type Phase } from "./model";
import { useJourney } from "./useJourney";
import "./learning-journey.css";

const PhysicsLab = lazy(() => import("../../components/PhysicsLab").then(m => ({ default: m.PhysicsLab })));
const FormulaField = lazy(() => import("../../integrations/notebook/FormulaField").then(m => ({ default: m.FormulaField })));
const FormulaPreview = lazy(() => import("../../integrations/notebook/FormulaPreview").then(m => ({ default: m.FormulaPreview })));
const labels: Record<Phase, string> = { prediction: "Prevedi", model: "Sperimenta", response: "Spiega", feedback: "Ritrova il feedback" };

export function LearningJourney(props: { me: StudyMe; data: Workspace; integrations?: JourneyIntegrations }) {
  if (props.me.role !== "student" || !props.data.enrolled) return <p>Questo percorso richiede la partecipazione dello studente all’edizione.</p>;
  return <JourneyScope key={courseScope(props.me, props.data.edition)} {...props} />;
}
function JourneyScope({ me, data: initialData, integrations = unavailableIntegrations }: {
  me: StudyMe; data: Workspace; integrations?: JourneyIntegrations;
}) {
  const journey = useJourney(me, initialData.edition.id);
  const { data, draft, receipt, busy, error, message, denied, dirty, conflict } = journey;
  const [focus, setFocus] = useState(false), [showFormula, setShowFormula] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const sourceButton = useRef<HTMLButtonElement>(null);
  const nested = useRef(0), closingNested = useRef(false);
  const reportDialog = useCallback((open: boolean) => {
    nested.current = Math.max(0, nested.current + (open ? 1 : -1));
    if (!open) {
      // A single Escape belongs to the inner dialog, even when both Radix
      // dismiss handlers run in that native event's dispatch.
      closingNested.current = true;
      setTimeout(() => { closingNested.current = false; }, 0);
    }
  }, []);
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, [draft?.phase, draft?.stepId, focus]);
  useEffect(() => {
    const revalidate = () => { if (document.visibilityState === "visible") void journey.refresh(); };
    addEventListener("focus", revalidate); document.addEventListener("visibilitychange", revalidate);
    return () => { removeEventListener("focus", revalidate); document.removeEventListener("visibilitychange", revalidate); };
  });
  if (denied) return <ErrorNotice message="L’accesso a questo lavoro non è più disponibile. Riapri lo spazio dopo aver verificato la sessione." />;
  if (!data || !draft) return error ? <>
    <ErrorNotice message={error} onRetry={journey.checkpointUnavailable ? undefined : journey.retry} />
    {journey.checkpointUnavailable && <button className="button-quiet" onClick={journey.openEdition}>Apri il percorso di questa edizione</button>}
  </> : <Loading>Apro il tuo percorso e la posizione salvata…</Loading>;
  const stepIndex = data.experience.steps.findIndex(step => step.id === draft.stepId);
  const step = data.experience.steps[stepIndex];
  const locked = busy || !!draft.pendingKey || !!draft.receiptId || !!conflict;
  const sources = data.workspace.resources.filter(resource => resource.kind !== "learning-journey-checkpoint"
    && resource.visibility === "group" && ["activity", "material", "notes", "lesson-passage", "living-source", "living-annotation"].includes(resource.kind));
  const source = sources.find(item => item.id === draft.source?.resourceId);
  const submission = data.workspace.submissions.find(item => item.receipt_id === receipt?.receiptId);
  function support(id: "constraint-hint" | "lesson-passage" | "model-result") {
    journey.addSupport(id);
  }
  const savedSource = draft.source;
  const sourceDialog = savedSource && <JourneyDialog disabled={busy || !!draft.pendingKey} label="Apri la fonte" title="La spiegazione originale"
    description="Leggi la revisione collegata al tuo lavoro. Fonte e contesto restano nello stesso percorso."
    onOpen={() => {
      if (source && readLessonPassage(source) && !locked) journey.edit({ helpSource: savedSource,
        support: [...new Set([...draft.support, "lesson-passage" as const])] });
      else support("constraint-hint");
    }}>
    <SourceViewer key={`${savedSource.resourceId}:${savedSource.revisionId}`} reference={savedSource} />
    {integrations.lessonReplay.state === "AVAILABLE" && <button type="button" onClick={() => {
      support("lesson-passage"); integrations.lessonReplay.state === "AVAILABLE" && integrations.lessonReplay.adapter.openPassage(savedSource);
    }}>Riapri il passaggio registrato</button>}
  </JourneyDialog>;
  const body = <>
    <div className="lj-toolbar">
      <p role="status" className="lj-save-state">{busy ? "Operazione in corso…" : draft.pendingKey ? "Invio da confermare" : dirty ? "Modifiche da salvare" : "Salvato nel tuo spazio"}</p>
      <button className="lj-secondary" disabled={busy || !dirty || !!conflict} onClick={() => void journey.save()}>Salva e riprendi</button>
    </div>
    <header className="lj-intro">
      <p className="lj-kicker">Fisica · {stepIndex + 1} di {data.experience.steps.length}</p>
      <h1>{data.experience.title}</h1>
      <p className="lj-objective">{data.experience.objective}</p>
    </header>
    <div className="lj-source-strip">
      <div><span>La tua fonte</span>
        <select aria-label="Fonte del percorso" disabled={locked} value={draft.source?.resourceId ?? ""} onChange={event => {
          const chosen = sources.find(item => item.id === event.target.value);
          journey.edit({ source: chosen ? { resourceId: chosen.id, revisionId: chosen.revisionId, contextId: chosen.contextId } : null });
        }}>
          <option value="">Scegli la spiegazione del tutor</option>
          {sources.map(item => <option key={item.id} value={item.id}>{displaySourceTitle(item)}</option>)}
          {savedSource && !sources.some(item => item.id === savedSource.resourceId) && <option value={savedSource.resourceId}>Fonte salvata · revisione originale</option>}
        </select>
        {savedSource && <small>Revisione {savedSource.revisionId.slice(0, 8)}</small>}
      </div>
      {sourceDialog}
      {source && savedSource && source.revisionId !== savedSource.revisionId && !locked && <button className="lj-secondary" onClick={() => journey.edit({ source: {
        resourceId: source.id, revisionId: source.revisionId, contextId: source.contextId,
      } })}>Collega la revisione attuale</button>}
      {!sources.length && !savedSource && <p>Il tutor non ha collegato una fonte leggibile. La consegna rimane indisponibile.</p>}
    </div>
    <nav className="lj-steps" aria-label="Passaggi di studio">
      {(["prediction", "model", "response", "feedback"] as Phase[]).map((phase, index) => <button key={phase} type="button"
        disabled={busy || !!draft.pendingKey || phase === "feedback" && !receipt} aria-current={draft.phase === phase ? "step" : undefined}
        onClick={() => void journey.phase(phase)}><span aria-hidden="true">{index + 1}</span>{labels[phase]}</button>)}
    </nav>
    <div className="lj-stage">
      {conflict && <section className="lj-tutor-feedback" role="alert">
        <h2>Questo lavoro è cambiato in un’altra scheda.</h2>
        <p>La tua bozza è ancora visibile qui. Il salvataggio è bloccato per conservare entrambe le versioni.</p>
        <details><summary>Confronta il testo salvato nel servizio</summary><p className="original-text">{conflict.procedure || "Nessun ragionamento salvato."}</p></details>
        <button className="lj-secondary" onClick={() => void journey.useServerVersion()}>Sostituisci la bozza con la versione salvata</button>
      </section>}
      <div className="lj-stage-heading"><h2 tabIndex={-1} ref={title}>{draft.phase === "feedback" ? "Il tuo tentativo, con il suo contesto." : step.title}</h2>
        <p>{step.prompt}</p>
      </div>
      {draft.phase === "prediction" && <div className="lj-study-grid">
        <div className="lj-model-preview"><PoiseuilleModel radius={step.parameters.radiusRatio} boundary={step.parameters.boundary} revealed={false}
          lengthRatio={step.parameters.length ?? 1} viscosityRatio={step.parameters.viscosity ?? 1} />
          <p>Modello ideale · fluido newtoniano · moto laminare</p>
        </div>
        <div className="lj-writing">
          <p>Prima del calcolo, scrivi quello che ti aspetti.</p>
          <label>Rapporto previsto<input inputMode="decimal" maxLength={40} value={draft.ratio} disabled={locked} onChange={e => journey.edit({ ratio: e.target.value })} /></label>
          <label>Grandezza fissata<select value={draft.boundary} disabled={locked} onChange={e => journey.edit({ boundary: e.target.value as typeof draft.boundary })}>
            <option value="">Scegli il vincolo</option><option value="pressure">Differenza di pressione Δp</option><option value="flow">Portata Q</option>
          </select></label>
          <div className="lj-actions"><button className="lj-primary" disabled={busy || !!draft.pendingKey} onClick={() => void journey.phase("response")}>Scrivi la risposta</button>
            <button className="lj-secondary" disabled={busy || !!draft.pendingKey} onClick={() => void journey.phase("model")}>Esplora prima il modello</button></div>
        </div>
      </div>}
      {draft.phase === "model" && <>
        <p className="lj-assistance">L’esplorazione è un aiuto: il Core la conserverà nel tentativo quando mostri il risultato.</p>
        <fieldset disabled={busy || !!draft.pendingKey} className="lj-model-fieldset"><Suspense fallback={<Loading>Apro il modello scientifico…</Loading>}><PhysicsLab numericPrediction
          draftKey={JSON.stringify([courseScope(me, initialData.edition), "s20-exploration", step.id])}
          onCommit={commit => { if (commit) support("model-result"); }} /></Suspense></fieldset>
        <div className="lj-actions"><button className="lj-primary" disabled={busy || !!draft.pendingKey} onClick={() => void journey.phase("response")}>Torna alla tua risposta</button></div>
      </>}
      {draft.phase === "response" && <div className="lj-response">
        <p>Previsione: <strong>{draft.ratio || "da completare"}</strong> · vincolo: <strong>{draft.boundary === "flow" ? "Q" : draft.boundary === "pressure" ? "Δp" : "da scegliere"}</strong></p>
        <label>Il tuo ragionamento<textarea rows={6} maxLength={8000} value={draft.procedure} disabled={locked} onChange={e => journey.edit({ procedure: e.target.value })} /></label>
        <button className="lj-secondary" aria-expanded={showFormula} onClick={() => setShowFormula(value => !value)}>Scrivi una formula</button>
        {showFormula && <Suspense fallback={<Loading>Apro la scrittura matematica…</Loading>}><FormulaField label="Formula del ragionamento" value={draft.formula} disabled={locked}
          onChange={value => journey.edit({ formula: value.slice(0, 2000) })} /></Suspense>}
        {!showFormula && draft.formula && <Suspense fallback={<code>{draft.formula}</code>}><FormulaPreview value={draft.formula} /></Suspense>}
        <p className="lj-assistance">{draft.support.length ? "Studio con aiuto dichiarato. Gli aiuti esterni non sono osservati." : "Studio autonomo: nessun aiuto richiesto in questo passaggio. Non è una verifica di padronanza."}</p>
        {!withinCheckpointLimit(draft) ? <p role="alert">La bozza supera lo spazio disponibile dopo la codifica. Riduci testo o formula prima di salvare o inviare.</p>
          : !ready(draft) && <p>Per consegnare, completa previsione, vincolo, fonte e almeno una frase di ragionamento (12 caratteri).</p>}
        <div className="lj-actions"><button className="lj-primary" disabled={busy || !ready(draft) || !!draft.receiptId || !!conflict} onClick={() => void journey.submit()}>
          {draft.pendingKey ? "Conferma lo stesso invio" : "Invia il tentativo"}</button></div>
      </div>}
      {draft.phase === "feedback" && receipt && <div className="lj-feedback">
        <p className="lj-received">Ricevuto dal Core</p>
        <PredictionEvidence value={receipt.activityEvidence} />
        <p className="lj-receipt">Ricevuta <code>{receipt.receiptId}</code></p>
        <p className="original-text">{submission?.text ?? "Rileggi il servizio per aprire l’originale ricevuto."}</p>
        {submission?.feedback.filter(item => item.review).map(item => <article key={item.id} className="lj-tutor-feedback"><h3>Il tutor ha scritto</h3><p>{item.review!.text}</p>
          {item.stale && <p>Questo feedback riguarda la revisione originaria della fonte.</p>}</article>)}
        {!submission?.feedback.some(item => item.review) && <p>Il feedback del tutor non è ancora disponibile. Il confronto numerico non sostituisce la revisione del ragionamento.</p>}
        <div className="lj-actions"><button className="lj-secondary" disabled={busy} onClick={() => void journey.refresh()}>Aggiorna il feedback</button>
          {stepIndex + 1 < data.experience.steps.length && <button className="lj-primary" disabled={busy || !!draft.pendingKey} onClick={() => void journey.nextStep()}>Affronta un problema diverso</button>}
        </div>
        {stepIndex + 1 === data.experience.steps.length && <p>Hai concluso i passaggi di questo episodio. Le ricevute restano nel tuo lavoro.</p>}
      </div>}
      {draft.phase === "feedback" && !receipt && <ErrorNotice message="La ricevuta salvata non è ancora leggibile. Il testo è conservato; rileggi il servizio per confermarla." onRetry={() => void journey.refresh()} />}
    </div>
    <div className="lj-recovery">
      <JourneyDialog disabled={busy || !!draft.pendingKey} label="Un aiuto sul vincolo" title="Riparti da ciò che resta costante"
        description="Questo aiuto sarà dichiarato nel tentativo." onOpen={() => support("constraint-hint")}>
        <p>Individua che cosa controlla la pompa. Se mantiene la portata, isola la differenza di pressione prima di confrontare i raggi.</p>
        <Suspense fallback={<p>Q = π r⁴ Δp / (8 η L)</p>}><FormulaPreview value={String.raw`Q=\frac{\pi r^4\Delta p}{8\eta L}`} /></Suspense>
        <p>Il raggio compare alla quarta potenza. Considera anche lunghezza e viscosità indicate nel problema.</p>
      </JourneyDialog>
      {integrations.memory.state === "AVAILABLE" && savedSource && <button className="lj-secondary" onClick={() => integrations.memory.state === "AVAILABLE" && integrations.memory.adapter.openSource(savedSource)}>Ritrova nella memoria</button>}
      <details><summary>Ricevute dei passaggi precedenti</summary>
        {data.workspace.submissions.filter(item => item.activityEvidence?.schemaVersion === 1 && item.activityEvidence.experienceId === data.experience.id).map(item => <article key={item.id}>
          <p>{item.text}</p><p className="lj-receipt">Ricevuta <code>{item.receipt_id}</code></p>
          {item.source_refs.map(ref => <JourneyDialog key={ref.revisionId} label="Riapri l’originale" title="Originale del tentativo" description="La revisione esatta conservata nella consegna."><SourceViewer reference={ref} /></JourneyDialog>)}
        </article>)}
      </details>
    </div>
    {error && <ErrorNotice message={error} onRetry={() => void journey.refresh()} />}
    <p role="status">{message}</p>
    <footer className="lj-footer">Contenuto {data.experience.editorialStatus} · approvazione scientifica {data.experience.scientificApproval === "NOT_ATTESTED" ? "non attestata" : data.experience.scientificApproval}. La ricevuta conferma la consegna, non una verifica effettiva.</footer>
  </>;
  return <div className="lj-root" data-testid="learning-journey">
    <JourneyDialogActivity.Provider value={reportDialog}><Dialog.Root open={focus} onOpenChange={value => {
      if (!value && (nested.current > 0 || closingNested.current)) return;
      setFocus(value);
    }}>
      <div className="lj-focus-control"><Dialog.Trigger asChild><button ref={sourceButton} className="lj-secondary">Studia senza distrazioni</button></Dialog.Trigger></div>
      {!focus && body}
      <Dialog.Portal><Dialog.Overlay className="lj-overlay" /><Dialog.Content className="lj-focus lj-root" onOpenAutoFocus={event => { event.preventDefault(); title.current?.focus(); }}>
        <div className="lj-focus-heading"><Dialog.Title>Il tuo spazio di studio</Dialog.Title><Dialog.Close className="lj-secondary">Esci dalla concentrazione</Dialog.Close></div>
        <Dialog.Description className="lj-sr-only">Obiettivo, fonte, modello e risposta. Escape torna allo spazio del corso.</Dialog.Description>{body}
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root></JourneyDialogActivity.Provider>
  </div>;
}
