import { useState } from "react";
import {LessonMediaLibrary} from "./lesson-media/LessonMediaLibrary";
import { NotebookPanel } from "../../../studio/src/study/NotebookPanel";
import { renderPortableNotebook } from "../integrations/notebook/PortableNotebook";
import { CoursePackDisclosure } from "../components/CoursePackDisclosure";
import { type StudyMe, type Workspace } from "../api";
import { useResourceComposer } from "../components/useResourceComposer";
import { SourceViewer } from "../components/SourceViewer";
import { displaySourceTitle } from "../components/lessonPassageReference";
import { ResourceEditor } from "../components/ResourceEditor";
import { EmptyState, ErrorNotice } from "../components/Feedback";
export function Materials({
  me,
  data,
  onUpdate,
}: {
  me: StudyMe;
  data: Workspace;
  onUpdate: () => Promise<void>;
}) {
  const tutor = me.role === "teacher",
    resources = data.resources.filter(
      (r) => r.kind !== "lesson-media-index" && (r.visibility === "group" || r.ownerId === me.id),
    );
  const [selected, setSelected] = useState<string | null>(null);
  const current = resources.find((r) => r.id === selected);
  const composer = useResourceComposer({
    actorId: me.id,
    editionId: data.edition.id,
    kind: tutor ? "material" : "notes",
    visibility: tutor ? "group" : "private",
    successMessage: tutor
      ? "Materiale condiviso con il gruppo."
      : "Nota salvata nel tuo spazio privato.",
    onCreated: (resource) => setSelected(resource.id),
    onUpdate,
  });
  return (
    <>
      <header className="page-heading">
        <h1>{tutor ? "Le fonti del percorso." : "Materiali e appunti."}</h1>
        <p>
          {tutor
            ? "Una biblioteca comune per il gruppo. Fonti, versioni e contesto restano collegati."
            : "I materiali del gruppo e le tue note private. Ogni revisione conserva la sua provenienza."}
        </p>
      </header>
      <LessonMediaLibrary key={`${me.id}:${data.edition.id}`} me={me} data={data} onUpdate={onUpdate} />
      <div className="materials-layout">
        <aside
          aria-label={tutor ? "Biblioteca del gruppo" : "Fonti disponibili"}
        >
          <h2>{tutor ? "Biblioteca del gruppo" : "Fonti disponibili"}</h2>
          {resources.length ? (
            <ul className="material-list">
              {resources.map((r, i) => (
                <li key={r.id}>
                  <button
                    aria-pressed={selected === r.id}
                    onClick={() => setSelected(r.id)}
                  >
                    <span className="document-icon" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <strong>{displaySourceTitle(r, 70)}</strong>
                      <small>
                        {r.visibility === "private"
                          ? "Privata"
                          : "Condivisa con il gruppo"}{" "}
                        ·{" "}
                        {r.kind === "attempt-source"
                          ? "Tentativo"
                          : r.kind === "notes"
                            ? "Nota"
                            : "Materiale"}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-inline">Nessun materiale aggiunto.</p>
          )}
          <details className="disclosure-panel">
            <summary>
              {tutor
                ? "Aggiungi un materiale al gruppo"
                : "Aggiungi una nota privata"}
            </summary>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void composer.save();
              }}
            >
              <label>
                {tutor
                  ? "Traccia, spiegazione o riferimento"
                  : "Titolo e contenuto della nota"}
                <textarea
                  aria-label={
                    tutor
                      ? "Traccia, spiegazione o riferimento"
                      : "Titolo e contenuto della nota"
                  }
                  required
                  rows={6}
                  value={composer.text}
                  maxLength={20000}
                  onChange={(e) => composer.edit(e.target.value)}
                  disabled={composer.busy}
                />
              </label>
              <button
                className="button-primary"
                disabled={composer.busy || !composer.text.trim()}
              >
                {composer.busy
                  ? "Salvataggio…"
                  : tutor
                    ? "Condividi con il gruppo"
                    : "Salva nota privata"}
              </button>
              {composer.error && <ErrorNotice message={composer.error} />}{" "}
              {composer.message && <p role="status">{composer.message}</p>}
            </form>
          </details>
        </aside>
        <div className="material-detail">
          {current ? (
            <>
              <SourceViewer
                key={current.revisionId}
                reference={{
                  resourceId: current.id,
                  revisionId: current.revisionId,
                  contextId: current.contextId,
                }}
              />
              {current.ownerId === me.id && (
                <details className="disclosure-panel">
                  <summary>Modifica e salva una nuova versione</summary>
                  <ResourceEditor
                    key={current.revisionId}
                    resource={current}
                    onUpdate={onUpdate}
                  />
                </details>
              )}
            </>
          ) : (
            <EmptyState title="Apri una fonte.">
              Scegli un materiale per leggerlo, ritrovare i collegamenti o
              aggiornarlo.
            </EmptyState>
          )}
        </div>
      </div>
      {tutor && (
        <details className="disclosure-panel tutor-notebook">
          <summary>Quaderno portabile dell’edizione</summary>
          <p>
            Esporta le fonti e i tentativi accessibili al tuo account tutor, con
            gli originali e la disposizione delle tue viste. La riapertura è in
            lettura.
          </p>
          <NotebookPanel editionId={data.edition.id} renderSource={renderPortableNotebook} />
        </details>
      )}
      {tutor && (
        <CoursePackDisclosure
          editionId={data.edition.id}
          summary="Banco dei contenuti originali in revisione"
          className="content-bank"
        />
      )}
    </>
  );
}
