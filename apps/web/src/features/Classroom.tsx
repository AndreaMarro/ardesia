import { lazy, Suspense, useState } from "react";
import {
  courseTitle,
  courseSubject,
  baseActivity,
  courseScope,
  courseLessonFromContext,
  sameCourseLesson,
  type ActivityCommit,
} from "../course";
import { TaylorLab } from "../components/TaylorLab";
import { PhysicsLab } from "../components/PhysicsLab";
import { SubmissionPanel } from "../../../studio/src/study/SubmissionPanel";
import { SourceBoard } from "../components/SourceBoard";
import { useResourceComposer } from "../components/useResourceComposer";
import { ErrorNotice, Loading } from "../components/Feedback";
import type { PostitReference } from "../../../studio/src/study/contracts";
import { type StudyMe, type Workspace } from "../api";
import { ScientificNotebooks } from "../integrations/notebook/ScientificNotebooks";
import { PhysicsQuestionBank } from "../components/PhysicsQuestionBank";
import { QuestionBankReview } from "../components/QuestionBankReview";
import { PoiseuilleEpisode } from "../components/PoiseuilleEpisode";
const ScalarExperienceEpisode = lazy(() => import("../components/ScalarExperienceEpisode").then(module => ({default: module.ScalarExperienceEpisode})));

const CourseLearningWorkspace=lazy(()=>import('../components/CourseLearningWorkspace').then(m=>({default:m.CourseLearningWorkspace})));
const LearningJourney = lazy(() => import("./learning-journey/LearningJourney").then(module => ({ default: module.LearningJourney })));

type Props = {
  me: StudyMe;
  data: Workspace;
  onUpdate: () => Promise<void>;
  parentId?: string | null;
};

export function Classroom(props: Props) {
  if (import.meta.env.VITE_S20_LEARNING_JOURNEY === "1" && props.me.role === "student"
      && props.data.enrolled && baseActivity(props.data.edition) === "poiseuille-v1")
    return <JourneyClassroom key={courseScope(props.me, props.data.edition)} {...props} />;
  return <ClassroomScope key={courseScope(props.me, props.data.edition)} {...props} />;
}

function JourneyClassroom(props: Props) {
  const [tools, setTools] = useState(false);
  // A requested correction must keep its existing parent-bound submission flow.
  // Notes, the scientific notebook and the other experiments remain reachable.
  const showJourney = !tools && !props.parentId;
  return <>
    {!props.parentId && <button className="button-quiet" onClick={() => setTools(value => !value)}>
      {showJourney ? "Apri gli strumenti dell’aula" : "Riprendi il percorso guidato"}
    </button>}
    {showJourney
      ? <Suspense fallback={<Loading>Apro il percorso di studio…</Loading>}><LearningJourney me={props.me} data={props.data} /></Suspense>
      : <ClassroomScope {...props} />}
  </>;
}

function ClassroomScope({
  me,
  data,
  onUpdate,
  parentId = null,
}: Props) {
  const [commit, setCommit] = useState<ActivityCommit | null>(null);
  const [guidedEpisode, setGuidedEpisode] = useState(false);
  const [pressureEpisode, setPressureEpisode] = useState(false);
  const [source, setSource] = useState<PostitReference | null>(null);
  const [selectionMessage, setSelectionMessage] = useState("");
  const tutor = me.role === "teacher";
  const activityId = baseActivity(data.edition);
  const draftScope = courseScope(me, data.edition);
  // A parent's selection may arrive before its own course-change effect clears
  // it. Never seed a destination draft with a retry from another course/activity.
  const retrySubmission = parentId ? data.submissions.find(submission =>
    submission.id === parentId && submission.student_id === me.id,
  ) : undefined;
  const retryParentId = retrySubmission?.activity_id === (commit?.activityId || activityId)
    && sameCourseLesson(courseLessonFromContext(retrySubmission?.courseContext), commit?.courseLesson)
    ? retrySubmission.id : null;
  const composer = useResourceComposer({
    actorId: me.id,
    editionId: data.edition.id,
    kind: tutor ? "activity" : "notes",
    visibility: tutor ? "group" : "private",
    successMessage: tutor
      ? "Materiale pubblicato al gruppo."
      : "Nota salvata nel tuo spazio privato.",
    onCreated: (resource) =>
      setSource({
        resourceId: resource.id,
        revisionId: resource.revisionId,
        contextId: resource.contextId,
      }),
    onUpdate,
  });
  return (
    <>
      <header className="page-heading">
        <p className="breadcrumb">
          {courseSubject(data.edition)} / {courseTitle(data.edition)}
        </p>
        <h1>{activityId ? "Metti un’idea alla prova." : "Il tuo percorso di lavoro."}</h1>
        <p>
          {activityId
            ? "Prevedi prima di muovere il modello. Spiega dopo. Il tuo ragionamento conta."
            : "Organizza le fonti, conserva i passaggi e prepara le domande per il tutor."}
        </p>
      </header>
      {activityId === "poiseuille-v1" && data.enrolled && <div className="episode-entry">
        <div><h2>Una lezione, tre previsioni.</h2><p>Raggio doppio, cambio di vincolo e una nuova prova. Ritrova il passaggio del tutor e conserva il tuo ragionamento.</p></div>
        <button className="button-primary" aria-expanded={guidedEpisode} onClick={() => {setGuidedEpisode(value => !value); setPressureEpisode(false);}}>
          {guidedEpisode ? "Torna al laboratorio libero" : "Apri episodio guidato"}
        </button>
        <button aria-expanded={pressureEpisode} onClick={() => {setPressureEpisode(value => !value); setGuidedEpisode(false);}}>Pressione e profondità · percorso guidato</button>
      </div>}
      <section className="lab-surface">
        {data.edition.packId?.startsWith("sf-") ? (<Suspense fallback={<Loading>Apro le lezioni del corso…</Loading>}><CourseLearningWorkspace me={me} resources={data.resources} submissions={data.submissions} onSaved={ref=>{setSource(ref);setSelectionMessage('Configurazione collegata alla prossima consegna.');}} onInvalidated={()=>setSource(null)} editionId={data.edition.id} onCommit={setCommit} initialActivityId={retrySubmission?.activity_id} initialCourseLesson={courseLessonFromContext(retrySubmission?.courseContext)}/></Suspense>) : activityId === "taylor-exp-v1" ? (
          <TaylorLab
            onCommit={setCommit}
            draftKey={JSON.stringify([draftScope, "taylor-lab"])}
          />
        ) : activityId === "poiseuille-v1" && data.enrolled && pressureEpisode ? (
          <Suspense fallback={<Loading>Apro il percorso di pressione…</Loading>}><ScalarExperienceEpisode me={me} data={data} onUpdate={onUpdate} /></Suspense>
        ) : activityId === "poiseuille-v1" && data.enrolled && guidedEpisode ? (
          <PoiseuilleEpisode me={me} data={data} onUpdate={onUpdate} />
        ) : activityId === "poiseuille-v1" ? (
          <PhysicsLab
            onCommit={setCommit}
            draftKey={JSON.stringify([draftScope, "physics-lab"])}
          />
        ) : (
          <div className="empty-state">
            <h2>Questo percorso non ha un laboratorio disponibile.</h2>
            <p>
              Non è prevista una consegna guidata da questa pagina. Puoi usare
              le note, le fonti e il quaderno quando partecipi all’edizione.
            </p>
          </div>
        )}
      </section>
      {data.enrolled ? (
        <>
          {data.edition.questionBankIds?.includes("physics-semestre-2026") && (
            tutor ? <QuestionBankReview key={`${me.id}:${data.edition.id}:review-bank`} editionId={data.edition.id} />
              : <PhysicsQuestionBank key={`${me.id}:${data.edition.id}:physics-bank`} editionId={data.edition.id} />
          )}
          <ScientificNotebooks me={me} data={data} onUpdate={onUpdate} onUse={tutor ? undefined : reference => {
            setSource(reference);
            setSelectionMessage("Quaderno collegato alla prossima consegna.");
          }} />
          <section className="source-composer">
            <div>
              <h2>
                {tutor
                  ? "Un materiale per il gruppo"
                  : "Il tuo spazio di lavoro"}
              </h2>
              <p>
                {tutor
                  ? "Pubblica una traccia o un passaggio da discutere insieme."
                  : "Le note rimangono private. Il tutor vede soltanto ciò che consegni."}
              </p>
            </div>
            <label>
              {tutor
                ? "Traccia o spiegazione"
                : "Una nota, una domanda, un procedimento"}
              <textarea
                aria-label={
                  tutor
                    ? "Traccia o spiegazione"
                    : "Una nota, una domanda, un procedimento"
                }
                value={composer.text}
                onChange={(e) => {
                  composer.edit(e.target.value);
                  setSelectionMessage("");
                }}
                disabled={composer.busy}
                rows={4}
                maxLength={20000}
              />
            </label>
            <button
              className="button-primary"
              disabled={composer.busy || !composer.text.trim()}
              onClick={() => void composer.save()}
            >
              {tutor ? "Pubblica al gruppo" : "Salva nota privata"}
            </button>
            {composer.error && <ErrorNotice message={composer.error} />}
            <p role="status">{selectionMessage || composer.message}</p>
          </section>
          <SourceBoard
            key={`${me.id}:${data.edition.id}`}
            me={me}
            data={data}
            onUpdate={onUpdate}
            onUse={(reference) => {
              setSource(reference);
              setSelectionMessage("Fonte collegata alla prossima consegna.");
            }}
          />
          {!tutor && activityId && !guidedEpisode && !pressureEpisode && (
            <section className="submission-surface">
              <SubmissionPanel
                key={`${me.id}:${data.edition.id}`}
                editionId={data.edition.id}
                activityId={commit?.activityId||activityId}
                activityParameters={commit?.parameters}
                courseLesson={commit?.courseLesson}
                prediction={commit?.prediction}
                activityReady={commit!==null}
                requireProcedure
                parentScopeStrict={data.edition.packId?.startsWith("sf-")}
                me={me}
                source={source}
                parentId={retryParentId}
                onUpdate={onUpdate}
              />
            </section>
          )}
        </>
      ) : (
        <section className="empty-state">
          <h2>{activityId ? "Il laboratorio è aperto." : "Il percorso è consultabile."}</h2>
          <p>
            Conferma la partecipazione all’edizione per accedere al tuo lavoro e
            {activityId ? "consegnare." : "salvare note e quaderno."}
          </p>
        </section>
      )}
    </>
  );
}
