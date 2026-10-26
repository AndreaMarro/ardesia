import { useEffect, useRef, useState } from "react";
import {
  describeError,
  studyRequest,
  type ContextPacket,
  type PostitReference,
  type StudyResource,
} from "../api";
import { ErrorNotice, Loading } from "./Feedback";
import { NotebookEditor } from "../integrations/notebook/NotebookEditor";
import { notebookResource } from "../integrations/notebook/model";
import { displaySourceTitle, readLessonPassage } from "./lessonPassageReference";
export function SourceViewer({
  reference,
  onSelect,
  onLoaded,
}: {
  reference: Pick<PostitReference, "resourceId" | "revisionId"> & Partial<Pick<PostitReference, "contextId">>;
  onSelect?: (start: number, end: number, quote: string) => void;
  onLoaded?: (resource: StudyResource) => void;
}) {
  const [resource, setResource] = useState<StudyResource | null>(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0),
    [context, setContext] = useState<ContextPacket | null>(null),
    [contextError, setContextError] = useState(""),
    [contextBusy, setContextBusy] = useState(false);
  const contextGeneration = useRef(0);
  const contextController = useRef<AbortController | null>(null);
  useEffect(() => {
    let active = true;
    contextGeneration.current++;
    contextController.current?.abort();
    setResource(null);
    setError("");
    setContext(null);
    setContextError("");
    setContextBusy(false);
    void studyRequest<StudyResource>(
      `/resources/${encodeURIComponent(reference.resourceId)}/revisions/${encodeURIComponent(reference.revisionId)}`,
    )
      .then((value) => {
        if (active) {
          setResource(value);
          onLoaded?.(value);
        }
      })
      .catch((e) => {
        if (active)
          setError(
            describeError(
              e,
              "Questa revisione non è disponibile. Non è stata sostituita con una versione diversa.",
            ),
          );
      });
    return () => {
      active = false;
      contextGeneration.current++;
      contextController.current?.abort();
    };
  }, [reference.resourceId, reference.revisionId, retry]); // onLoaded is a notification, not an identity dependency.
  async function openContext() {
    if (
      !resource ||
      resource.id !== reference.resourceId ||
      resource.revisionId !== reference.revisionId
    )
      return;
    contextController.current?.abort();
    const controller = new AbortController();
    contextController.current = controller;
    const generation = ++contextGeneration.current;
    setContextBusy(true);
    setContextError("");
    try {
      const value = await studyRequest<ContextPacket>(
        "/context/" +
          encodeURIComponent(resource.contextId) +
          "?" +
          new URLSearchParams({
            query: "",
            resourceId: resource.id,
            revisionId: resource.revisionId,
          }),
        undefined,
        { signal: controller.signal },
      );
      if (generation === contextGeneration.current) setContext(value);
    } catch (e) {
      if (generation === contextGeneration.current)
        setContextError(
          describeError(
            e,
            "Il contesto attuale non è disponibile per questa fonte.",
          ),
        );
    } finally {
      if (generation === contextGeneration.current) setContextBusy(false);
    }
  }
  if (error)
    return (
      <ErrorNotice message={error} onRetry={() => setRetry((v) => v + 1)} />
    );
  if (
    !resource ||
    resource.id !== reference.resourceId ||
    resource.revisionId !== reference.revisionId
  )
    return <Loading>Sto aprendo la revisione originale…</Loading>;
  const passage = readLessonPassage(resource);
  return (
    <section className="source-viewer">
      <div className="source-heading">
        <span>
          {resource.visibility === "private"
            ? "Fonte privata"
            : "Materiale del gruppo"}
        </span>
        <span>Revisione {resource.revisionId.slice(0, 8)}</span>
      </div>
      {resource.kind === "scientific-notebook" && <NotebookEditor key={resource.revisionId}
        resource={notebookResource(resource)} actor={resource.ownerId} readOnly onSaved={() => {}} />}
      {passage && <article className="lesson-passage-source" aria-label="Passaggio della lezione">
        <h3>{displaySourceTitle(resource, 140)}</h3>
        <blockquote>{passage.transcript}</blockquote>
        <p className="fine-print">Passaggio dichiarato dal docente. Il replay e i media restano nello Studio locale; questa fonte non li incorpora.</p>
      </article>}
      {resource.kind === "lesson-passage" && !passage &&
        <ErrorNotice message="Il passaggio della lezione non è leggibile in questa revisione. Non viene mostrato il JSON come spiegazione." />}
      {onSelect ? (
        <details className="source-selection" open={!passage}>
          <summary>{passage ? "Seleziona un frammento della fonte strutturata" : "Seleziona un passaggio preciso"}</summary>
          <p className="fine-print">Seleziona con mouse o tastiera un passaggio nell'originale. Le selezioni conservano gli offset della revisione esatta.</p>
          <textarea
            className="original-text original-selectable"
            aria-label="Originale della fonte"
            readOnly
            value={resource.text}
            rows={Math.min(12, Math.max(4, resource.text.split("\n").length + 1))}
            onSelect={(e) => {
              const el = e.currentTarget;
              if (el.selectionEnd > el.selectionStart)
                onSelect(el.selectionStart, el.selectionEnd, resource.text.slice(el.selectionStart, el.selectionEnd));
            }}
          />
        </details>
      ) : !passage && resource.kind !== "lesson-passage" ? (
        <p className="original-text">{resource.text}</p>
      ) : null}
      <details className="provenance">
        <summary>Fonte, versione e contesto</summary>
        <dl>
          <dt>Risorsa</dt>
          <dd>{resource.id}</dd>
          <dt>Revisione originale</dt>
          <dd>{resource.revisionId}</dd>
          <dt>Hash della revisione</dt>
          <dd>{resource.sha256}</dd>
        </dl>
        <button onClick={() => void openContext()} disabled={contextBusy}>
          {contextBusy ? "Apertura…" : "Apri il contesto di lavoro"}
        </button>
        {contextError && <ErrorNotice message={contextError} />}{" "}
        {context && (
          <div className="context-results">
            <h3>
              {context.sourceState === "HISTORICAL"
                ? "Contesto della versione consegnata"
                : "Collegamenti revisionati"}
            </h3>
            {context.sourceState === "HISTORICAL" && (
              <p className="fine-print">
                Il contesto riguarda la revisione selezionata e i collegamenti
                autorizzati, senza sostituirla con la versione corrente.
              </p>
            )}
            {context.observations.length === 0 ? (
              <p>Nessun collegamento revisionato disponibile.</p>
            ) : (
              context.observations.map((o) => (
                <article key={o.id}>
                  <p>{o.text}</p>
                  <blockquote>{o.evidence.text}</blockquote>
                  <span className="fine-print">
                    Collegato al tentativo e alla revisione{" "}
                    {o.evidence.revisionId.slice(0, 8)}
                  </span>
                </article>
              ))
            )}
            {context.omittedStale > 0 && (
              <p className="fine-print">
                {context.omittedStale} collegamenti esclusi perché la fonte è
                cambiata.
              </p>
            )}
            <p className="fine-print">
              Il contesto mostra i collegamenti attualmente autorizzati.
              L’originale sopra resta la revisione selezionata.
            </p>
          </div>
        )}
      </details>
    </section>
  );
}
