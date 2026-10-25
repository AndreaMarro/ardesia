import { useState } from "react";
import { describeError, studyRequest, type StudyResource } from "../api";
import { ErrorNotice } from "./Feedback";
export function ResourceEditor({
  resource,
  onUpdate,
}: {
  resource: StudyResource;
  onUpdate: () => Promise<void>;
}) {
  const [text, setText] = useState(resource.text),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await studyRequest("/resources/" + resource.id + "/revise", {
        expectedRevision: resource.revisionId,
        text,
      });
      setMessage(
        "Nuova revisione salvata. Le consegne precedenti conservano la loro versione.",
      );
      await onUpdate();
    } catch (ex) {
      setError(describeError(ex));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="resource-editor" onSubmit={(e) => void save(e)}>
      <label>
        Modifica il testo della fonte
        <textarea
          value={text}
          maxLength={20000}
          rows={7}
          onChange={(e) => {
            setText(e.target.value);
            setMessage("");
          }}
        />
      </label>
      <p className="draft-state">
        {text === resource.text
          ? "Nessuna modifica da salvare."
          : "Modifiche non ancora salvate."}
      </p>
      <button
        className="button-primary"
        disabled={busy || !text.trim() || text === resource.text}
      >
        {busy ? "Salvataggio…" : "Salva una nuova revisione"}
      </button>
      {message && (
        <p role="status" className="success-notice">
          {message}
        </p>
      )}
      {error && <ErrorNotice message={error} />}
    </form>
  );
}
