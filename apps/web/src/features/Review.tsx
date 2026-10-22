import { useEffect, useRef, useState } from "react";
import {
  describeError,
  requestKey,
  studyRequest,
  type StudyResource,
  type Submission,
  type Workspace,
} from "../api";
import { baseActivity, courseTitle, type LabActivityId } from "../course";
import { AssetPreview } from "../components/AssetPreview";
import { SourceViewer } from "../components/SourceViewer";
import { EmptyState, ErrorNotice } from "../components/Feedback";
type Anchor = {
  resourceId: string;
  revisionId: string;
  start: number;
  end: number;
  quote: string;
};
export function Review({
  data,
  onUpdate,
  onDiary,
}: {
  data: Workspace;
  onUpdate: () => Promise<void>;
  onDiary: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null),
    [filter, setFilter] = useState("waiting");
  const visible = data.submissions.filter(
    (s) => filter === "all" || !s.feedback.some((f) => f.review),
  );
  const current = data.submissions.find((s) => s.id === selected);
  const activityId = baseActivity(data.edition);
  return (
    <>
      <header className="page-heading">
        <p className="breadcrumb">
          Mini-corsi / {courseTitle(data.edition)} / Regia tutor
        </p>
        <h1>Un intervento preciso.</h1>
        <p>
          Apri la consegna, ritrova il passaggio e restituisci una spiegazione.
          Il lavoro privato che non è stato consegnato resta privato.
        </p>
      </header>
      <nav className="filter-tabs" aria-label="Filtra le consegne">
        {[
          ["waiting", "Da correggere"],
          ["all", "Tutte le consegne"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
            <span>
              {value === "waiting"
                ? data.submissions.filter(
                    (s) => !s.feedback.some((f) => f.review),
                  ).length
                : data.submissions.length}
            </span>
          </button>
        ))}
      </nav>
      {data.submissions.length === 0 ? (
        <EmptyState title="Il gruppo non ha ancora consegnato.">
          Qui compariranno i tentativi inviati, con i loro originali e le
          versioni esatte.
        </EmptyState>
      ) : (
        <div className="review-layout">
          <aside className="submission-list" aria-label="Consegne del gruppo">
            {visible.length === 0 ? (
              <p className="empty-inline">
                Tutte le consegne hanno ricevuto un intervento.
              </p>
            ) : (
              visible.map((s) => (
                <button
                  key={s.id}
                  aria-pressed={selected === s.id}
                  onClick={() => setSelected(s.id)}
                >
                  <span className="submission-avatar" aria-hidden="true">
                    {s.student_id.slice(-2)}
                  </span>
                  <span>
                    <strong>{s.student_id}</strong>
                    <small>
                      Tentativo {s.revision} ·{" "}
                      {s.feedback.some((f) => f.review)
                        ? "Restituito"
                        : "Da correggere"}
                    </small>
                  </span>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              ))
            )}
          </aside>
          <div className="review-detail">
            {current ? (
              <SubmissionReview
                key={JSON.stringify([data.edition.id, data.edition.packSha256, current.id, activityId])}
                submission={current}
                editionId={data.edition.id}
                activityId={current.activity_id === activityId ? activityId : null}
                onUpdate={onUpdate}
                onDiary={onDiary}
              />
            ) : (
              <EmptyState title="Scegli una consegna.">
                L’originale e lo spazio di correzione si apriranno qui, uno
                accanto all’altro.
              </EmptyState>
            )}
          </div>
        </div>
      )}
    </>
  );
}
function SubmissionReview({
  submission,
  editionId,
  activityId,
  onUpdate,
  onDiary,
}: {
  submission: Submission;
  editionId: string;
  activityId: LabActivityId | null;
  onUpdate: () => Promise<void>;
  onDiary: () => void;
}) {
  const candidate = submission.feedback[0],
    published = candidate?.review;
  const [text, setText] = useState(published?.text ?? ""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [sourceIndex, setSourceIndex] = useState(0),
    [anchor, setAnchor] = useState<Anchor | null>(null),
    [loaded, setLoaded] = useState<StudyResource | null>(null);
  const key = useRef(requestKey());
  const reference = submission.source_refs[sourceIndex];
  async function begin() {
    setBusy(true);
    setError("");
    try {
      await studyRequest("/feedback/drafts", { submissionId: submission.id });
      await onUpdate();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  }
  async function publish(decision: "returned" | "needs_clarification") {
    if (!candidate) return;
    setBusy(true);
    setError("");
    try {
      await studyRequest(
        "/feedback/" + candidate.id + "/publish",
        { expectedRevision: submission.revision, text, decision },
        { headers: { "Idempotency-Key": key.current } },
      );
      setMessage(
        decision === "returned"
          ? "Correzione restituita allo studente."
          : "Richiesta di chiarimento restituita, senza voto.",
      );
      await onUpdate();
    } catch (e) {
      setError(describeError(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="review-detail-heading">
        <h2>
          {submission.student_id} <span>· tentativo {submission.revision}</span>
        </h2>
        <span className="state-label">
          {published ? "Restituito" : "Da correggere"}
        </span>
      </div>
      <div className="review-columns">
        <section>
          <h3>La versione consegnata</h3>
          <p className="original-text submission-answer">
            {submission.text || "Consegna tramite originale allegato."}
          </p>
          {submission.source_refs.length > 1 && (
            <label>
              Fonte collegata
              <select
                value={sourceIndex}
                onChange={(e) => {
                  setSourceIndex(Number(e.target.value));
                  setAnchor(null);
                  setLoaded(null);
                }}
              >
                {submission.source_refs.map((ref, i) => (
                  <option key={ref.revisionId} value={i}>
                    Fonte {i + 1} · revisione {ref.revisionId.slice(0, 8)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {reference && (
            <SourceViewer
              key={reference.revisionId}
              reference={reference}
              onLoaded={setLoaded}
              onSelect={(start, end, quote) =>
                setAnchor({
                  resourceId: reference.resourceId,
                  revisionId: reference.revisionId,
                  start,
                  end,
                  quote,
                })
              }
            />
          )}{" "}
          {submission.asset_refs.map((id, i) => (
            <AssetPreview key={id} id={id} index={i + 1} />
          ))}
          <details className="provenance">
            <summary>Ricevuta persistente della consegna</summary>
            <p className="id-text">{submission.receipt_id}</p>
            <p>
              Questo intervento riguarda soltanto il tentativo{" "}
              {submission.revision} e le sue fonti collegate.
            </p>
          </details>
        </section>
        <section className="feedback-editor">
          <h3>La correzione del tutor</h3>
          {published ? (
            <>
              <p className="reviewed-copy">{published.text}</p>
              <p className="success-notice">
                Intervento del tutor restituito sulla versione{" "}
                {submission.revision}.
              </p>
            </>
          ) : (
            <>
              <p className="fine-print">
                Scrivi una spiegazione sul passaggio. La correzione funziona
                anche con AI spenta.
              </p>
              {!candidate ? (
                <button onClick={() => void begin()} disabled={busy}>
                  Inizia la correzione
                </button>
              ) : (
                <>
                  <label>
                    Spiegazione del tutor
                    <textarea
                      rows={8}
                      value={text}
                      disabled={busy || candidate.stale}
                      onChange={(e) => {
                        setText(e.target.value);
                        key.current = requestKey();
                      }}
                    />
                  </label>
                  {candidate.stale && (
                    <ErrorNotice message="La fonte è cambiata. Questa proposta non può essere pubblicata su una versione diversa." />
                  )}
                  <div className="button-row">
                    <button
                      className="button-primary"
                      disabled={busy || candidate.stale || !text.trim()}
                      onClick={() => void publish("returned")}
                    >
                      {busy ? "Invio…" : "Restituisci la correzione"}
                    </button>
                    <button
                      disabled={busy || candidate.stale || !text.trim()}
                      onClick={() => void publish("needs_clarification")}
                    >
                      Chiedi un chiarimento
                    </button>
                  </div>
                </>
              )}
            </>
          )}
          {error && <ErrorNotice message={error} />}{" "}
          {message && (
            <p role="status" className="success-notice">
              {message}
            </p>
          )}
          <ObservationForm
            submission={submission}
            editionId={editionId}
            activityId={activityId}
            anchor={anchor}
            source={loaded}
            onDiary={onDiary}
          />
        </section>
      </div>
    </>
  );
}
function ObservationForm({
  submission,
  editionId,
  activityId,
  anchor,
  source,
  onDiary,
}: {
  submission: Submission;
  editionId: string;
  activityId: LabActivityId | null;
  anchor: Anchor | null;
  source: StudyResource | null;
  onDiary: () => void;
}) {
  const [concept, setConcept] = useState(
      activityId === "taylor-exp-v1" ? "taylor-exp-remainder"
        : activityId === "poiseuille-v1" ? "radius-power" : "procedure",
    ),
    [category, setCategory] = useState("model_selection"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [created, setCreated] = useState(false);
  const key = useRef(requestKey());
  const [recurrences, setRecurrences] = useState<
      { threadId: string; conceptId: string }[]
    >([]),
    [threadId, setThreadId] = useState(""),
    [explanation, setExplanation] = useState("");
  useEffect(() => {
    let active = true;
    void studyRequest<{
      threads: {
        threadId: string;
        studentId: string;
        conceptId: string;
        status: string;
      }[];
    }>("/diary?" + new URLSearchParams({ editionId }))
      .then((value) => {
        if (active)
          setRecurrences(
            value.threads.filter(
              (t) =>
                t.studentId === submission.student_id &&
                t.status === "VERIFIED_RESOLVED",
            ),
          );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [submission.id, submission.student_id, editionId]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!anchor) return;
    setBusy(true);
    setError("");
    try {
      if (threadId) {
        await studyRequest(
          "/diary/threads/" + threadId + "/recur",
          { submissionId: submission.id, anchor, explanation },
          { headers: { "Idempotency-Key": key.current } },
        );
      } else {
        await studyRequest(
          "/diary/observations",
          { submissionId: submission.id, conceptId: concept, category, anchor },
          { headers: { "Idempotency-Key": key.current } },
        );
      }
      setCreated(true);
    } catch (ex) {
      setError(
        describeError(
          ex,
          "L’osservazione non è stata registrata. Controlla il passaggio selezionato.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  function changed() {
    key.current = requestKey();
    setCreated(false);
  }
  return (
    <details className="observation-form">
      <summary>Collega un passaggio al diario</summary>
      {activityId === null && <p className="fine-print">
        Osservazione manuale: scegli un concetto generale oppure collega una ricomparsa già documentata.
      </p>}
      <p>
        Seleziona un estratto nell’originale a sinistra. La proposta sarà poi
        confermata con una spiegazione, una rubrica e un problema diverso.
      </p>
      {anchor ? (
        <blockquote>{anchor.quote}</blockquote>
      ) : (
        <p className="selection-hint">
          Nessun passaggio selezionato nell’originale.
        </p>
      )}
      <form onSubmit={(e) => void submit(e)}>
        {recurrences.length > 0 && (
          <label>
            Nuova osservazione o ricomparsa
            <select
              value={threadId}
              onChange={(e) => {
                setThreadId(e.target.value);
                changed();
              }}
            >
              <option value="">Apri un nuovo passaggio</option>
              {recurrences.map((t) => (
                <option key={t.threadId} value={t.threadId}>
                  Ricomparsa: {t.conceptId}
                </option>
              ))}
            </select>
          </label>
        )}
        {threadId ? (
          <label>
            Che cosa è ricomparso
            <textarea
              required
              value={explanation}
              onChange={(e) => {
                setExplanation(e.target.value);
                changed();
              }}
            />
          </label>
        ) : (
          <>
            <label>
              Concetto
              <select
                value={concept}
                onChange={(e) => {
                  setConcept(e.target.value);
                  changed();
                }}
              >
                {activityId === "taylor-exp-v1" ? (
                  <option value="taylor-exp-remainder">
                    Taylor, fattoriale e resto
                  </option>
                ) : activityId === "poiseuille-v1" ? (
                  <option value="radius-power">Potenze del raggio</option>
                ) : null}
                <option value="unit-conversion">Conversione delle unità</option>
                <option value="model-selection">Scelta del modello</option>
                <option value="procedure">Procedimento</option>
              </select>
            </label>
            <label>
              Tipo di difficoltà
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  changed();
                }}
              >
                {[
                  ["model_selection", "Scelta del modello"],
                  ["procedure", "Procedimento"],
                  ["algebra", "Algebra"],
                  ["sign", "Segno"],
                  ["units", "Unità"],
                  ["arithmetic", "Calcolo"],
                  ["reading_or_transcription", "Lettura o trascrizione"],
                  ["ambiguous_question", "Domanda ambigua"],
                  ["misconception", "Comprensione del concetto"],
                  ["other", "Altro"],
                ].map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        <button
          disabled={busy || !anchor || !source || created}
          className="button-primary"
        >
          {busy
            ? "Registrazione…"
            : created
              ? "Passaggio registrato"
              : threadId
                ? "Registra la ricomparsa"
                : "Proponi il passaggio"}
        </button>
        {error && <ErrorNotice message={error} />}{" "}
        {created && (
          <p className="success-notice" role="status">
            Passaggio registrato.{" "}
            <button className="text-link" type="button" onClick={onDiary}>
              Apri il diario per il prossimo passo
            </button>
          </p>
        )}
      </form>
    </details>
  );
}
