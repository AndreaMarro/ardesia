import { useState } from "react";
import {
  courseTitle,
  courseSubject,
  isTaylor,
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

export function Classroom({
  me,
  data,
  onUpdate,
  parentId = null,
}: {
  me: StudyMe;
  data: Workspace;
  onUpdate: () => Promise<void>;
  parentId?: string | null;
}) {
  const [commit, setCommit] = useState<ActivityCommit | null>(null);
  const [source, setSource] = useState<PostitReference | null>(null);
  const [selectionMessage, setSelectionMessage] = useState("");
  const tutor = me.role === "teacher";
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
        <h1>Metti un’idea alla prova.</h1>
        <p>
          Prevedi prima di muovere il modello. Spiega dopo. Il tuo ragionamento
          conta.
        </p>
      </header>
      <section className="lab-surface">
        {isTaylor(data.edition) ? (
          <TaylorLab
            onCommit={setCommit}
            draftKey={JSON.stringify([me.id, data.edition.id, "taylor-lab"])}
          />
        ) : (
          <PhysicsLab
            onCommit={setCommit}
            draftKey={JSON.stringify([me.id, data.edition.id, "physics-lab"])}
          />
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
          {!tutor && (
            <section className="submission-surface">
              <SubmissionPanel
                key={`${me.id}:${data.edition.id}`}
                editionId={data.edition.id}
                activityId={
                  isTaylor(data.edition) ? "taylor-exp-v1" : "poiseuille-v1"
                }
                activityParameters={commit?.parameters}
                prediction={commit?.prediction}
                activityReady={Boolean(commit)}
                requireProcedure
                me={me}
                source={source}
                parentId={parentId}
                onUpdate={onUpdate}
              />
            </section>
          )}
        </>
      ) : (
        <section className="empty-state">
          <h2>Il laboratorio è aperto.</h2>
          <p>
            Conferma la partecipazione all’edizione per accedere al tuo lavoro e
            consegnare.
          </p>
        </section>
      )}
    </>
  );
}
