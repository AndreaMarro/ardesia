import { useState } from "react";
import { PhysicsLab } from "../components/PhysicsLab";
import { SubmissionPanel } from "../../../studio/src/study/SubmissionPanel";
import { SourceBoard } from "../components/SourceBoard";
import { useResourceComposer } from "../components/useResourceComposer";
import { ErrorNotice } from "../components/Feedback";
import type { PostitReference } from "../../../studio/src/study/contracts";
import { type StudyMe, type Workspace } from "../api";

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
  const [source, setSource] = useState<PostitReference | null>(null);
  const [selectionMessage, setSelectionMessage] = useState("");
  const tutor = me.role === "teacher";
  const composer = useResourceComposer({
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
        <p className="breadcrumb">Fisica / Fluidi e ragionamento fisico</p>
        <h1>Metti un’idea alla prova.</h1>
        <p>
          Prevedi prima di muovere il modello. Spiega dopo. Il tuo ragionamento
          conta.
        </p>
      </header>
      <section className="lab-surface">
        <PhysicsLab />
      </section>
      {data.enrolled ? (
        <>
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
