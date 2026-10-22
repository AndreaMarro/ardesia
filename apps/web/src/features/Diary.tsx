import { useEffect, useRef, useState } from "react";
import { describeError, requestKey, studyRequest, type StudyMe } from "../api";
import { SourceViewer } from "../components/SourceViewer";
import { ErrorNotice, Loading } from "../components/Feedback";
import type { LabActivityId } from "../course";

export type DiaryThread = {
  threadId: string;
  studentId: string;
  editionId: string;
  conceptId: string;
  category: string;
  status: string;
  sourceState: string;
  source: { resourceId: string; revisionId: string; quote?: string } | null;
  contested: boolean;
  feedback?: {
    explanation: string;
    nextStep: string;
    rubric: { criterion: string };
    verification: string;
  };
  transferExercise?: {
    exerciseId: string;
    prompt: string;
    parameters: Record<string, unknown>;
  };
  attempts: { attemptId: string; procedure?: string }[];
  latestVerification?: { scope: string };
  history: { seq: number; kind: string }[];
};
type DiaryData = {
  threads: DiaryThread[];
  confirmedOpenCount: number;
  candidateCount: number;
};
const concepts: Record<string, string> = {
  "radius-power": "Potenze del raggio",
  "unit-conversion": "Conversione delle unità",
  "model-selection": "Scelta del modello",
  procedure: "Procedimento",
  "taylor-exp-remainder": "Taylor, fattoriale e resto",
};
const labels: Record<string, string> = {
  CANDIDATE: "Da verificare",
  OPEN: "Da riprovare",
  PRACTISING: "In pratica",
  VERIFIED_RESOLVED: "Verificato su una nuova prova",
  RECURRED: "Da riprendere",
  DISMISSED: "Archiviato",
};

export function Diary({
  me,
  editionId,
  activityId = null,
}: {
  me: StudyMe;
  editionId: string;
  activityId?: LabActivityId | null;
}) {
  const [data, setData] = useState<DiaryData | null>(null);
  const [filter, setFilter] = useState("open");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const scope = `${me.id}:${editionId}`;
  const currentScope = useRef(scope);
  currentScope.current = scope;
  const loadingRequest = useRef<{
    sequence: number;
    controller?: AbortController;
  }>({ sequence: 0 });
  async function refresh() {
    if (currentScope.current !== scope) return;
    loadingRequest.current.controller?.abort();
    const controller = new AbortController();
    const sequence = ++loadingRequest.current.sequence;
    loadingRequest.current.controller = controller;
    setLoadError("");
    setLoading(true);
    try {
      const value = await studyRequest<DiaryData>(
        "/diary?" + new URLSearchParams({ editionId }),
        undefined,
        { signal: controller.signal },
      );
      if (
        sequence === loadingRequest.current.sequence &&
        !controller.signal.aborted &&
        currentScope.current === scope
      )
        setData(value);
    } catch (e) {
      if (
        sequence !== loadingRequest.current.sequence ||
        controller.signal.aborted
      )
        return;
      setLoadError(
        describeError(e, "Il diario non è disponibile. Puoi riprovare."),
      );
      throw e;
    } finally {
      if (
        sequence === loadingRequest.current.sequence &&
        !controller.signal.aborted
      )
        setLoading(false);
    }
  }
  useEffect(() => {
    setData(null);
    void refresh().catch(() => {});
    return () => {
      loadingRequest.current.sequence++;
      loadingRequest.current.controller?.abort();
    };
  }, [me.id, editionId]); // eslint-disable-line react-hooks/exhaustive-deps
  const visible =
    data?.threads.filter(
      (t) =>
        filter === "all" ||
        (filter === "verified" && t.status === "VERIFIED_RESOLVED") ||
        (filter === "open" &&
          !["VERIFIED_RESOLVED", "DISMISSED"].includes(t.status)),
    ) ?? [];
  return (
    <>
      <header className="page-heading">
        <h1>Un errore. Un passo avanti.</h1>
        <p>
          Il passaggio originale, una spiegazione e un problema diverso per
          capire che cosa è cambiato.
        </p>
      </header>
      <div className="diary-toolbar">
        <nav aria-label="Filtra il diario">
          {[
            ["open", "Da riprovare"],
            ["verified", "Verificati"],
            ["all", "Tutti"],
          ].map(([key, label]) => (
            <button
              key={key}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        <span>
          {data
            ? `${data.confirmedOpenCount} passaggi da riprendere`
            : loading
              ? "Apertura del diario…"
              : "Diario non disponibile"}
        </span>
      </div>
      {loadError && (
        <ErrorNotice
          message={loadError}
          onRetry={() => {
            void refresh().catch(() => {});
          }}
        />
      )}
      {!data && loading ? (
        <Loading>Sto aprendo il tuo diario…</Loading>
      ) : data && visible.length === 0 ? (
        <section className="diary-empty">
          <span className="empty-book" aria-hidden="true">
            ↗
          </span>
          <h2>Qui ritroverai i passaggi su cui lavorare.</h2>
          <p>
            Una difficoltà viene collegata a una fonte e verificata dal tutor.
            Nessuna valutazione nasce da un semplice clic.
          </p>
        </section>
      ) : (
        <div className="diary-list">
          {visible.map((thread) => (
            <DiaryCard
              key={thread.threadId}
              thread={thread}
              tutor={me.role === "teacher"}
              activityId={activityId}
              onUpdate={refresh}
            />
          ))}
        </div>
      )}
    </>
  );
}

function DiaryCard({
  thread,
  tutor,
  activityId,
  onUpdate,
}: {
  thread: DiaryThread;
  tutor: boolean;
  activityId: LabActivityId | null;
  onUpdate: () => Promise<void>;
}) {
  const taylor = activityId === "taylor-exp-v1";
  const [answer, setAnswer] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [criterion, setCriterion] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [prompt, setPrompt] = useState("");
  const [x, setX] = useState("-0.5"),
    [degree, setDegree] = useState("3"),
    [originalX, setOriginalX] = useState("0.5"),
    [originalDegree, setOriginalDegree] = useState("3");
  const [radius, setRadius] = useState("2");
  const [originalRadius, setOriginalRadius] = useState("1.5");
  const [boundary, setBoundary] = useState("pressure");
  const [sourceChecked, setSourceChecked] = useState(false);
  const [procedureQuote, setProcedureQuote] = useState("");
  const [variationReason, setVariationReason] = useState("");
  const key = useRef(requestKey());
  const pendingPractice = useRef<{ text: string; key: string } | null>(null);
  const base = "/diary/threads/" + thread.threadId;
  async function command(path: string, body: unknown) {
    setBusy(true);
    setMessage("");
    let received = false;
    try {
      await studyRequest(base + "/" + path, body, {
        headers: { "Idempotency-Key": requestKey() },
      });
      received = true;
      await onUpdate();
    } catch (e) {
      setMessage(
        describeError(
          e,
          received
            ? "Operazione registrata. Aggiorna il diario per vedere lo stato aggiornato."
            : "Operazione non conclusa. Controlla la fonte e i campi richiesti.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  async function practice() {
    if (!thread.transferExercise) return;
    setBusy(true);
    setMessage("");
    const pending = pendingPractice.current ?? {
      text: answer,
      key: key.current,
    };
    pendingPractice.current = pending;
    let received = false;
    try {
      const receipt = await studyRequest<{ submissionId: string }>(
        "/submissions",
        {
          editionId: thread.editionId,
          activityId: thread.transferExercise.exerciseId,
          diaryThreadId: thread.threadId,
          activityParameters: thread.transferExercise.parameters,
          text: pending.text,
          assetRefs: [],
        },
        { headers: { "Idempotency-Key": pending.key + ":submission" } },
      );
      await studyRequest(
        base + "/practice",
        {
          submissionId: receipt.submissionId,
          exerciseId: thread.transferExercise.exerciseId,
          parameters: thread.transferExercise.parameters,
        },
        { headers: { "Idempotency-Key": pending.key + ":practice" } },
      );
      received = true;
      setAnswer("");
      pendingPractice.current = null;
      key.current = requestKey();
      setMessage("Nuova prova consegnata. La verifica spetta al tutor.");
      await onUpdate();
    } catch {
      setMessage(
        received
          ? "Nuova prova consegnata. Aggiorna il diario per vedere lo stato aggiornato."
          : "Consegna non conclusa. Il procedimento è conservato qui: puoi riprovare.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function confirm() {
    if (activityId === null) return;
    try {
      await command("confirm", {
        rubric: { criterion, procedureRequired: true },
        explanation,
        nextStep,
        sourceChecked,
        transferExercise: {
          exerciseId: "transfer-" + thread.threadId,
          prompt,
          parameters: taylor
            ? { x: Number(x), degree: Number(degree) }
            : { radiusRatio: Number(radius), boundary },
          originalParameters: taylor
            ? { x: Number(originalX), degree: Number(originalDegree) }
            : { radiusRatio: Number(originalRadius), boundary },
        },
      });
    } catch {
      setMessage(
        "I parametri della nuova prova devono essere un oggetto JSON valido.",
      );
    }
  }
  return (
    <article className="diary-entry">
      <header>
        <div>
          <span className="entry-category">
            {concepts[thread.conceptId] ?? thread.conceptId}
          </span>
          <h2>{tutor ? thread.studentId : "Il passaggio da rivedere"}</h2>
        </div>
        <span className={"state-label state-" + thread.status.toLowerCase()}>
          {labels[thread.status] ?? thread.status}
        </span>
      </header>
      {thread.sourceState !== "CURRENT" && (
        <p className="source-warning">
          La fonte è cambiata o non è più disponibile. Serve una nuova verifica.
        </p>
      )}
      {thread.source && (
        <>
          <p className="entry-label">Dove mi sono fermato</p>
          <blockquote>{thread.source.quote}</blockquote>
          <DiarySource
            resourceId={thread.source.resourceId}
            revisionId={thread.source.revisionId}
          />
        </>
      )}
      {thread.feedback && (
        <div className="entry-explanation">
          <h3>Perché non funzionava</h3>
          <p>{thread.feedback.explanation}</p>
          <h3>Cosa provo adesso</h3>
          <p>{thread.feedback.nextStep}</p>
        </div>
      )}
      {thread.latestVerification && (
        <p className="verified-note">{thread.latestVerification.scope}</p>
      )}
      {!tutor &&
        thread.transferExercise &&
        ["OPEN", "PRACTISING", "RECURRED"].includes(thread.status) &&
        thread.sourceState === "CURRENT" && (
          <details className="entry-practice">
            <summary>Affronta una situazione nuova</summary>
            <p>{thread.transferExercise.prompt}</p>
            <p className="fine-print">
              Parametri assegnati:{" "}
              {JSON.stringify(thread.transferExercise.parameters)}. La verifica
              del procedimento è a cura del tutor; questa prova manuale non
              certifica automaticamente il modello.
            </p>
            <label>
              Spiega il tuo procedimento
              <textarea
                rows={5}
                disabled={Boolean(pendingPractice.current)}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  key.current = requestKey();
                }}
              />
            </label>
            <button
              className="button-primary"
              disabled={busy || !answer.trim()}
              onClick={() => void practice()}
            >
              Consegna la nuova prova
            </button>
          </details>
        )}
      {tutor && thread.status === "CANDIDATE" && activityId === null && (
        <p className="fine-print">
          La preparazione guidata di una nuova prova non è disponibile per questa attività.
          L’osservazione e lo storico restano consultabili.
        </p>
      )}
      {tutor && thread.status === "CANDIDATE" && activityId !== null && (
        <details className="entry-practice">
          <summary>Verifica e prepara il prossimo passo</summary>
          <label>
            Spiegazione del tutor
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </label>
          <label>
            Criterio della rubrica
            <input
              value={criterion}
              onChange={(e) => setCriterion(e.target.value)}
            />
          </label>
          <label>
            Prossimo passo
            <input
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
            />
          </label>
          <label>
            Nuovo problema
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </label>
          {taylor ? (
            <div className="parameter-comparison">
              <label>
                Argomento originale x
                <input
                  type="number"
                  min={-1}
                  max={1}
                  step="any"
                  value={originalX}
                  onChange={(e) => setOriginalX(e.target.value)}
                />
              </label>
              <label>
                Grado originale
                <input
                  type="number"
                  min={0}
                  max={12}
                  step={1}
                  value={originalDegree}
                  onChange={(e) => setOriginalDegree(e.target.value)}
                />
              </label>
              <label>
                Nuovo argomento x
                <input
                  type="number"
                  min={-1}
                  max={1}
                  step="any"
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                />
              </label>
              <label>
                Nuovo grado
                <input
                  type="number"
                  min={0}
                  max={12}
                  step={1}
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                />
              </label>
            </div>
          ) : (
            <div className="parameter-comparison">
              <label>
                Rapporto originale r/r₀
                <input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.05"
                  value={originalRadius}
                  onChange={(e) => setOriginalRadius(e.target.value)}
                />
              </label>
              <label>
                Nuovo rapporto r/r₀
                <input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.05"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                />
              </label>
              <label>
                Grandezza fissata nel confronto
                <select
                  value={boundary}
                  onChange={(e) => setBoundary(e.target.value)}
                >
                  <option value="pressure">Differenza di pressione</option>
                  <option value="flow">Portata</option>
                </select>
              </label>
            </div>
          )}

          {thread.category === "ambiguous_question" && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={sourceChecked}
                onChange={(e) => setSourceChecked(e.target.checked)}
              />
              Ho controllato la fonte e chiarito l’ambiguità.
            </label>
          )}
          <button
            className="button-primary"
            disabled={
              busy ||
              !explanation.trim() ||
              !criterion.trim() ||
              !nextStep.trim() ||
              !prompt.trim() ||
              (taylor &&
                (![x, originalX].every(
                  (v) =>
                    v.trim() !== "" &&
                    Number.isFinite(Number(v)) &&
                    Number(v) >= -1 &&
                    Number(v) <= 1,
                ) ||
                  ![degree, originalDegree].every(
                    (v) =>
                      v.trim() !== "" &&
                      Number.isInteger(Number(v)) &&
                      Number(v) >= 0 &&
                      Number(v) <= 12,
                  )))
            }
            onClick={() => void confirm()}
          >
            Conferma osservazione e assegna la nuova prova
          </button>
        </details>
      )}
      {tutor && thread.status === "PRACTISING" && (
        <details className="entry-practice">
          <summary>Rivedi la nuova prova</summary>
          <blockquote>{thread.attempts.at(-1)?.procedure}</blockquote>
          <label>
            Passaggio del procedimento verificato
            <textarea
              value={procedureQuote}
              onChange={(e) => setProcedureQuote(e.target.value)}
            />
          </label>
          <label>
            Motivazione della verifica
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <label>
            Che cosa rende diversa questa prova
            <input
              value={variationReason}
              onChange={(e) => setVariationReason(e.target.value)}
            />
          </label>
          <button
            className="button-primary"
            disabled={
              busy ||
              !procedureQuote.trim() ||
              !reason.trim() ||
              !variationReason.trim()
            }
            onClick={() =>
              void command("verify", {
                attemptId: thread.attempts.at(-1)?.attemptId,
                rubricEvidence: {
                  criterion: thread.feedback?.rubric.criterion,
                  procedureQuote,
                  reasoning: reason,
                  variationReason,
                },
              })
            }
          >
            Registra la verifica del tutor
          </button>
        </details>
      )}
      {!["DISMISSED", "VERIFIED_RESOLVED"].includes(thread.status) && (
        <details className="entry-correction">
          <summary>
            {tutor
              ? "Archivia un’osservazione non pertinente"
              : "C’è qualcosa da correggere?"}
          </summary>
          <label>
            {tutor
              ? "Motivo dell’archiviazione"
              : "Spiega cosa va ricontrollato"}
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button
            disabled={busy || !reason.trim()}
            onClick={() =>
              void command(tutor ? "dismiss" : "contest", { reason })
            }
          >
            {tutor ? "Archivia con motivazione" : "Chiedi di ricontrollare"}
          </button>
        </details>
      )}
      {thread.contested && (
        <p className="fine-print">
          È stato richiesto di ricontrollare questa osservazione.
        </p>
      )}
      <details className="entry-history">
        <summary>Cosa è cambiato · {thread.history.length} passaggi</summary>
        <ol>
          {thread.history.map((item) => (
            <li key={item.seq}>
              {item.kind.startsWith("error.proposed")
                ? "Osservazione proposta"
                : item.kind === "error.observed"
                  ? "Osservazione confermata"
                  : item.kind === "exercise.completed"
                    ? "Nuova prova verificata"
                    : item.kind.startsWith("error.transfer")
                      ? "Nuovo tentativo consegnato"
                      : item.kind.startsWith("error.dismissed")
                        ? "Osservazione archiviata"
                        : "Richiesta di ricontrollo"}
            </li>
          ))}
        </ol>
      </details>
      <p role="status">{message}</p>
    </article>
  );
}

function DiarySource({
  resourceId,
  revisionId,
}: {
  resourceId: string;
  revisionId: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>Apri la fonte originale</summary>
      {open && (
        <SourceViewer reference={{ resourceId, revisionId, contextId: "" }} />
      )}
    </details>
  );
}
