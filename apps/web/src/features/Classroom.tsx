import { useState } from "react";
import { PhysicsLab } from "../components/PhysicsLab";
import { SubmissionPanel } from "../../../studio/src/study/SubmissionPanel";
import { SourceViewer } from "../components/SourceViewer";
import type { PostitReference } from "../../../studio/src/study/contracts";
import {
  studyRequest,
  type StudyMe,
  type Workspace,
  type StudyResource,
} from "../api";

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
  const [text, setText] = useState("");
  const [source, setSource] = useState<PostitReference | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const tutor = me.role === "teacher";
  async function save() {
    setBusy(true);
    try {
      const resource = await studyRequest<StudyResource>("/resources", {
        editionId: data.edition.id,
        kind: tutor ? "activity" : "notes",
        visibility: tutor ? "group" : "private",
        text,
      });
      setSource({
        resourceId: resource.id,
        revisionId: resource.revisionId,
        contextId: resource.contextId,
      });
      setText("");
      setMessage(
        tutor
          ? "Materiale pubblicato al gruppo."
          : "Nota salvata nel tuo spazio privato.",
      );
      await onUpdate();
    } catch {
      setMessage("Il salvataggio non è riuscito. Il testo è ancora qui.");
    } finally {
      setBusy(false);
    }
  }
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
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                maxLength={20000}
              />
            </label>
            <button
              className="button-primary"
              disabled={busy || !text.trim()}
              onClick={() => void save()}
            >
              {tutor ? "Pubblica al gruppo" : "Salva nota privata"}
            </button>
            <p role="status">{message}</p>
          </section>
          <section className="resource-collection">
            <div className="section-title">
              <h2>Fonti e passaggi</h2>
              <span>La fonte resta una, anche fra più viste</span>
            </div>
            {data.resources.length === 0 ? (
              <p className="empty-state">
                Il foglio è pronto. Aggiungi la prima nota o un originale nella
                consegna.
              </p>
            ) : (
              <div className="resource-grid">
                {data.resources.map((resource) => (
                  <article className="source-note" key={resource.id}>
                    <SourceViewer
                      reference={{
                        resourceId: resource.id,
                        revisionId: resource.revisionId,
                        contextId: resource.contextId,
                      }}
                    />
                    {!tutor && (
                      <button
                        onClick={() => {
                          setSource({
                            resourceId: resource.id,
                            revisionId: resource.revisionId,
                            contextId: resource.contextId,
                          });
                          setMessage("Fonte collegata alla prossima consegna.");
                        }}
                      >
                        Collega alla consegna
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
          {!tutor && (
            <section className="submission-surface">
              <SubmissionPanel
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
