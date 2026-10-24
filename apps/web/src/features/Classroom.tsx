import { useState } from "react";
import {
  courseTitle,
  courseSubject,
  baseActivity,
  courseScope,
  type ActivityCommit,
} from "../course";
import { TaylorLab } from "../components/TaylorLab";
import { PhysicsLab } from "../components/PhysicsLab";
import { SubmissionPanel } from "../../../studio/src/study/SubmissionPanel";
import { SourceBoard } from "../components/SourceBoard";
import { useResourceComposer } from "../components/useResourceComposer";
import { ErrorNotice } from "../components/Feedback";
import type { PostitReference } from "../../../studio/src/study/contracts";
import { type StudyMe, type Workspace } from "../api";
import { ScientificNotebooks } from "../integrations/notebook/ScientificNotebooks";
import { PhysicsQuestionBank } from "../components/PhysicsQuestionBank";
import { QuestionBankReview } from "../components/QuestionBankReview";
import { PoiseuilleEpisode } from "../components/PoiseuilleEpisode";

type Props = {
  me: StudyMe;
  data: Workspace;
  onUpdate: () => Promise<void>;
  parentId?: string | null;
};

export function Classroom(props: Props) {
  return <ClassroomScope key={courseScope(props.me, props.data.edition)} {...props} />;
}

function ClassroomScope({
  me,
  data,
  onUpdate,
  parentId = null,
}: Props) {
  const [commit, setCommit] = useState<ActivityCommit | null>(null);
  const [guidedEpisode, setGuidedEpisode] = useState(false);
  const [source, setSource] = useState<PostitReference | null>(null);
  const [selectionMessage, setSelectionMessage] = useState("");
  const tutor = me.role === "teacher";
  const activityId = baseActivity(data.edition);
  const draftScope = courseScope(me, data.edition);
  // A parent's selection may arrive before its own course-change effect clears
  // it. Never seed a destination draft with a retry from another course/activity.
  const retryParentId = parentId && data.submissions.some(submission =>
    submission.id === parentId && submission.student_id === me.id &&
    submission.activity_id === activityId,
  ) ? parentId : null;
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
        <button className="button-primary" aria-expanded={guidedEpisode} onClick={() => setGuidedEpisode(value => !value)}>
          {guidedEpisode ? "Torna al laboratorio libero" : "Apri episodio guidato"}
        </button>
      </div>}
      <section className="lab-surface">
        {activityId === "taylor-exp-v1" ? (
          <TaylorLab
            onCommit={setCommit}
            draftKey={JSON.stringify([draftScope, "taylor-lab"])}
          />
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
          {!tutor && activityId && !guidedEpisode && (
            <section className="submission-surface">
              <SubmissionPanel
                key={`${me.id}:${data.edition.id}`}
                editionId={data.edition.id}
                activityId={activityId}
                activityParameters={commit?.activityId === activityId ? commit.parameters : undefined}
                prediction={commit?.activityId === activityId ? commit.prediction : undefined}
                activityReady={commit?.activityId === activityId}
                requireProcedure
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
