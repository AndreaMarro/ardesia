import { useEffect, useRef, useState } from "react";
import {
  describeError,
  studyRequest,
  type StudyResource,
  type Workspace,
} from "../api";
import { ErrorNotice } from "./Feedback";
type Entry = {
  resourceId: string;
  revisionId: string;
  title: string;
  detail: string;
};
function libraryEntries(data: Workspace): Entry[] {
  const entries = new Map<string, Entry>();
  for (const resource of data.resources) {
    entries.set(`${resource.id}:${resource.revisionId}`, {
      resourceId: resource.id,
      revisionId: resource.revisionId,
      title:
        resource.text.split("\n")[0].slice(0, 85) || "Originale della consegna",
      detail: `Versione corrente · ${resource.visibility === "private" ? "privata" : "del gruppo"}`,
    });
  }
  for (const submission of data.submissions) {
    for (const source of submission.source_refs) {
      const key = `${source.resourceId}:${source.revisionId}`;
      if (!entries.has(key))
        entries.set(key, {
          resourceId: source.resourceId,
          revisionId: source.revisionId,
          title: "Fonte della consegna",
          detail: `Versione consegnata · ${submission.student_id} · tentativo ${submission.revision}`,
        });
    }
  }
  return [...entries.values()];
}
export function SourceLibrary({
  data,
  full,
  onOpen,
}: {
  data: Workspace;
  full: boolean;
  onOpen: (resource: StudyResource) => void;
}) {
  const entries = libraryEntries(data);
  const [opening, setOpening] = useState<string | null>(null),
    [error, setError] = useState("");
  const pending = useRef(false),
    mounted = useRef(true),
    controller = useRef<AbortController | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);
  async function open(entry: Entry) {
    if (pending.current || full) return;
    pending.current = true;
    setOpening(`${entry.resourceId}:${entry.revisionId}`);
    setError("");
    controller.current = new AbortController();
    try {
      // The library is an index. Only the authorized exact-revision response supplies the view's context.
      const resource = await studyRequest<StudyResource>(
        `/resources/${encodeURIComponent(entry.resourceId)}/revisions/${encodeURIComponent(entry.revisionId)}`,
        undefined,
        { signal: controller.current.signal },
      );
      if (!mounted.current) return;
      if (
        resource.id !== entry.resourceId ||
        resource.revisionId !== entry.revisionId ||
        typeof resource.contextId !== "string" ||
        !resource.contextId
      )
        throw Error("source_identity_mismatch");
      onOpen(resource);
    } catch (failure) {
      if (mounted.current)
        setError(
          describeError(
            failure,
            "Questa revisione non è disponibile. Nessuna vista è stata aggiunta.",
          ),
        );
    } finally {
      pending.current = false;
      if (mounted.current) setOpening(null);
    }
  }
  return (
    <aside className="board-library" aria-label="Biblioteca delle fonti">
      <h3>La biblioteca</h3>
      <p>
        Staccare una vista lascia intatta la fonte. Puoi riaprire le versioni
        correnti e quelle consegnate.
      </p>
      {error && <ErrorNotice message={error} />}
      {entries.length ? (
        <ul>
          {entries.map((entry, index) => (
            <li key={`${entry.resourceId}:${entry.revisionId}`}>
              <span className="board-library-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <strong>{entry.title}</strong>
                <small>
                  {entry.detail} · rev. {entry.revisionId.slice(0, 8)}
                </small>
                <button
                  disabled={full || opening !== null}
                  onClick={() => void open(entry)}
                  aria-label={`Apri fonte ${index + 1} sul tavolo`}
                >
                  {opening === `${entry.resourceId}:${entry.revisionId}`
                    ? "Apertura…"
                    : "Apri una vista"}{" "}
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-inline">
          Non ci sono ancora fonti autorizzate. Salva una nota o consegna un
          originale.
        </p>
      )}
    </aside>
  );
}
