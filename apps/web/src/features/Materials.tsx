import { useState } from "react";
import { CoursePackPreview } from "../../../studio/src/study/CoursePackPreview";
import {
  describeError,
  studyRequest,
  type StudyMe,
  type Workspace,
} from "../api";
import { SourceViewer } from "../components/SourceViewer";
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
      (r) => r.visibility === "group" || r.ownerId === me.id,
    );
  const [selected, setSelected] = useState<string | null>(null),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const current = resources.find((r) => r.id === selected);
  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await studyRequest<{ id: string }>("/resources", {
        editionId: data.edition.id,
        kind: tutor ? "material" : "notes",
        visibility: tutor ? "group" : "private",
        text,
      });
      setSelected(r.id);
      setText("");
      setMessage(
        tutor
          ? "Materiale condiviso con il gruppo."
          : "Nota salvata nel tuo spazio privato.",
      );
      await onUpdate();
    } catch (ex) {
      setError(describeError(ex));
    } finally {
      setBusy(false);
    }
  }
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
      <div className="materials-layout">
        <aside>
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
                      <strong>{r.text.split("\n")[0].slice(0, 70)}</strong>
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
            <form onSubmit={(e) => void create(e)}>
              <label>
                {tutor
                  ? "Traccia, spiegazione o riferimento"
                  : "Titolo e contenuto della nota"}
                <textarea
                  required
                  rows={6}
                  value={text}
                  maxLength={20000}
                  onChange={(e) => setText(e.target.value)}
                />
              </label>
              <button
                className="button-primary"
                disabled={busy || !text.trim()}
              >
                {busy
                  ? "Salvataggio…"
                  : tutor
                    ? "Condividi con il gruppo"
                    : "Salva nota privata"}
              </button>
              {error && <ErrorNotice message={error} />}{" "}
              {message && <p role="status">{message}</p>}
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
        <details className="disclosure-panel content-bank">
          <summary>Banco dei contenuti originali in revisione</summary>
          <CoursePackPreview />
        </details>
      )}
    </>
  );
}
