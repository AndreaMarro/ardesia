import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  describeError,
  studyRequest,
  StudyApiError,
  type Workspace,
} from "../api";
import { EmptyState, ErrorNotice, Loading } from "../components/Feedback";
import { replaceCourseHistory, useCourseDraft } from "../courseExitGuard";

type Rules = {
  totalQuestions: number;
  mcq: number;
  completion: number;
  correctTenths: number;
  wrongTenths: number;
  omittedTenths: number;
  maxTenths: number;
  scoring: string;
  maxScore: number;
};

type ExactReference = { id: string; version: number; sha256: string };

type DraftReference = {
  simulationRef?: ExactReference;
  simulationId?: string;
  editorialStatus?: "DRAFT" | "PUBLISHED";
  humanApproval?: boolean;
  releaseScope?: string;
  feedbackAuthority?: string;
  scopeWarning?: string;
};

type Simulation = DraftReference & {
  id: string; title: string; ready: boolean; durationSeconds: number;
  questionCount: number; rules: Rules;
};

type ExamPack = DraftReference & {
  id: string;
  version: number;
  title: string;
  subtitle: string;
  durationSeconds: number;
  rules: Rules;
  provenance: string;
  questionCount: number;
  ready?: boolean;
  approvedCount?: number;
};

type SolutionStep = { title: string; explanation: string };

type ExamQuestion = { questionRef?: ExactReference } & (
  | {
      id: string;
      topic: string;
      type: "mcq";
      prompt: string;
      options: string[];
      answerType?: "option_id";
    }
  | {
      id: string;
      topic: string;
      type: "completion";
      prompt: string;
      format: string;
    });

type ResultQuestion = {
  questionId: string;
  topic: string;
  type: "mcq" | "completion";
  prompt: string;
  options: string[] | null;
  given: number | string | null;
  givenText: string | null;
  expected: number | string;
  expectedText: string;
  accepted: string[] | null;
  status: "correct" | "wrong" | "omitted";
  pointsTenths: number;
  explanation: string;
  solutionSteps?: SolutionStep[];
  familyId?: string;
};

type ExamResult = DraftReference & {
  scoreTenths: number;
  maxTenths: number;
  score: number;
  correct: number;
  wrong: number;
  omitted: number;
  questions: ResultQuestion[];
  validity?: {
    valid: boolean;
    invalidQuestionIds: string[];
    checkedAt: number;
    gate?: string;
  };
};

type ExamSummary = DraftReference & {
  id: string;
  editionId: string;
  status: "in_progress" | "submitted" | "expired";
  startedAt: number;
  deadlineAt: number;
  submittedAt: number | null;
  scoreTenths: number | null;
  score: number | null;
  maxTenths: number;
  correct: number | null;
  wrong: number | null;
  omitted: number | null;
  answerRevision?: number;
};

type ExamAttempt = DraftReference & {
  id: string;
  editionId: string;
  packId: string;
  packVersion: number;
  status: "in_progress" | "submitted" | "expired";
  startedAt: number;
  deadlineAt: number;
  submittedAt: number | null;
  remainingSeconds: number;
  answers: Record<string, number | string | null>;
  title: string;
  subtitle: string;
  durationSeconds: number;
  rules: Rules;
  questions: ExamQuestion[];
  answerRevision: number;
  result: ExamResult | null;
};

type ExamList = { attempts: ExamSummary[]; pack: ExamPack | null; simulations?: Simulation[] };

type AnswerMap = Record<string, number | string | null>;

const statusLabel = {
  in_progress: "In corso",
  submitted: "Consegnata",
  expired: "Tempo scaduto",
};

function isAnswered(value: number | string | null | undefined) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function sameAnswers(a: AnswerMap, b: AnswerMap) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) if (a[key] !== b[key]) return false;
  return true;
}

// A conflict read may refresh revision/status, never the frozen examination.
function sameAttempt(a: ExamAttempt, b: ExamAttempt) {
  const ref = (value?: ExactReference) => value ? [value.id, value.version, value.sha256] : null;
  const identity = (value: ExamAttempt) => [value.id, value.editionId, value.packId, value.packVersion,
    value.simulationId, ref(value.simulationRef), value.startedAt, value.deadlineAt, value.durationSeconds,
    [value.rules.totalQuestions, value.rules.mcq, value.rules.completion, value.rules.correctTenths,
      value.rules.wrongTenths, value.rules.omittedTenths, value.rules.maxTenths, value.rules.maxScore, value.rules.scoring],
    value.questions.map(q => [q.id, q.type, q.topic, q.prompt, ref(q.questionRef),
      q.type === "mcq" ? [q.options, q.answerType] : q.format])];
  return JSON.stringify(identity(a)) === JSON.stringify(identity(b));
}

function clock(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function scoreLabel(tenths: number | null) {
  return tenths === null ? "—" : (tenths / 10).toFixed(1).replace(".", ",");
}

function dateLabel(instant: number | null) {
  if (!instant) return "—";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(instant * 1000));
}

function isDraft(reference: DraftReference) {
  return reference.humanApproval === false || reference.releaseScope === "PRIVATE_SYNTHETIC_ACCEPTANCE";
}

function DraftNotice({ reference }: { reference: DraftReference }) {
  return <>{isDraft(reference) && <p role="note">DRAFT · ambito privato di accettazione sintetica. Riscontro di riferimento; approvazione umana non eseguita.</p>}
    {reference.scopeWarning && <p>{reference.scopeWarning}</p>}</>;
}

function simulationHref(editionId: string, simulationId: string) {
  return `/?${new URLSearchParams({ view: "exam", edition: editionId, simulation: simulationId })}`;
}

function examError(failure: unknown) {
  const code = failure instanceof Error ? failure.message : "";
  if (code === "exam_active_simulation_conflict") return "È già in corso un’altra simulazione. Puoi riprenderla esplicitamente qui sotto.";
  if (["exam_simulation_not_found", "exam_simulation_unavailable", "invalid_exam_simulation"].includes(code)) return "Questa simulazione non è disponibile per l’edizione selezionata. Scegli una delle simulazioni disponibili.";
  if (code === "exam_selection_mismatch") return "La prova ricevuta non corrisponde alla selezione. Riapri l’elenco delle simulazioni.";
  return describeError(failure);
}

export function Exam({ data, simulationId }: { data: Workspace; simulationId?: string }) {
  const initialQuery = useRef(new URLSearchParams(window.location.search).get("simulation") ?? undefined);
  const routeSimulation = simulationId ?? initialQuery.current;
  const [requestedSimulation, setRequestedSimulation] = useState(routeSimulation);
  const editionId = data.edition.id;
  const exitDraft = useCourseDraft("assessment");
  const [listing, setListing] = useState<ExamList | null>(null);
  const [exam, setExam] = useState<ExamAttempt | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "wrong" | "omitted">("all");
  const dirty = useRef(false);
  const submittingRef = useRef(false);
  const revisionRef = useRef(0);
  const savingRef = useRef(false);
  const pendingRef = useRef(false);
  const answersRef = useRef<AnswerMap>({});
  const examRef = useRef<ExamAttempt | null>(null);
  const flushRef = useRef<() => void>(() => undefined);
  const routeEpoch = useRef(0);
  // undefined: no conflict; null: blocked until a trustworthy read succeeds.
  const conflictRef = useRef<ExamAttempt | null | undefined>(undefined);
  const [conflict, setConflict] = useState<ExamAttempt | null | undefined>(undefined);
  const [conflictChoice, setConflictChoice] = useState<"server" | "local" | null>(null);
  const [resolvingConflict, setResolvingConflict] = useState(false);
  const [checkingConflict, setCheckingConflict] = useState(false);

  const refresh = useCallback(async (active = true) => {
    const value = await studyRequest<ExamList>(
      `/exams?editionId=${encodeURIComponent(editionId)}`,
    );
    if (active) setListing(value);
    return value;
  }, [editionId]);

  useEffect(() => {
    let active = true;
    routeEpoch.current += 1;
    setLoading(true);
    setError("");
    setExam(null);
    setListing(null);
    setRequestedSimulation(routeSimulation);
    dirty.current = false;
    pendingRef.current = false;
    examRef.current = null;
    conflictRef.current = undefined;
    setConflict(undefined);
    setConflictChoice(null);
    void refresh(false)
      .then(async (value) => {
        if (!active) return;
        setListing(value);
        if (routeSimulation) {
          if (!value.simulations?.some((item) => item.id === routeSimulation)) {
            setError("Questa simulazione non appartiene all’edizione selezionata o non è disponibile.");
            return;
          }
          const matching = value.attempts.find((item) => item.status === "in_progress" && item.simulationId === routeSimulation);
          if (matching) {
            const restored = await studyRequest<ExamAttempt>(`/exams/${encodeURIComponent(matching.id)}`);
            if (active) open(restored, routeSimulation);
          }
        }
      })
      .catch((failure) => {
        if (active) setError(examError(failure));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      routeEpoch.current += 1;
    };
  }, [refresh, routeSimulation]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    examRef.current = exam;
  }, [exam]);

  function open(next: ExamAttempt, expectedSimulation?: string) {
    if (next.editionId !== editionId || (expectedSimulation !== undefined && next.simulationId !== expectedSimulation))
      throw new Error("exam_selection_mismatch");
    if (next.simulationId) {
      replaceCourseHistory(simulationHref(editionId, next.simulationId));
      setRequestedSimulation(next.simulationId);
    }
    exitDraft.confirm(exitDraft.checkpoint());
    conflictRef.current = undefined;
    setConflict(undefined);
    setConflictChoice(null);
    examRef.current = next;
    answersRef.current = next.answers ?? {};
    dirty.current = false;
    pendingRef.current = false;
    revisionRef.current = next.answerRevision ?? 0;
    setExam(next);
    setAnswers(next.answers ?? {});
    setCurrent(0);
    setRemaining(next.remainingSeconds);
    setConfirming(false);
    setSaved("idle");
    setFilter("all");
    setError("");
  }

  async function start() {
    const epoch = routeEpoch.current;
    setStarting(true);
    setError("");
    try {
      const next = await studyRequest<ExamAttempt>(
        "/exams", { editionId, ...(requestedSimulation ? { simulationId: requestedSimulation } : {}) },
        { method: "POST" },
      );
      if (epoch === routeEpoch.current) open(next, requestedSimulation);
    } catch (failure) {
      if (epoch !== routeEpoch.current) return;
      setError(examError(failure));
      if (failure instanceof Error && failure.message === "exam_active_simulation_conflict") await refresh().catch(() => undefined);
    } finally {
      if (epoch === routeEpoch.current) setStarting(false);
    }
  }

  async function reopen(id: string) {
    const epoch = routeEpoch.current;
    setLoading(true);
    setError("");
    try {
      const known = listing?.attempts.find((item) => item.id === id);
      const next = await studyRequest<ExamAttempt>(`/exams/${encodeURIComponent(id)}`);
      if (epoch === routeEpoch.current) open(next, known?.simulationId);
    } catch (failure) {
      if (epoch === routeEpoch.current) setError(examError(failure));
    } finally {
      if (epoch === routeEpoch.current) setLoading(false);
    }
  }

  function answer(questionId: string, value: number | string) {
    setConflictChoice(null);
    exitDraft.changed();
    dirty.current = true;
    setSaved("idle");
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  }

  const reloadAfterConflict = useCallback(async (attemptId: string) => {
    const epoch = routeEpoch.current;
    conflictRef.current = null;
    setCheckingConflict(true);
    setConflict(null);
    setConflictChoice(null);
    setConfirming(false);
    dirty.current = true;
    pendingRef.current = false;
    exitDraft.changed();
    setSaved("error");
    setError("");
    try {
      const fresh = await studyRequest<ExamAttempt>(`/exams/${attemptId}`);
      if (epoch !== routeEpoch.current || examRef.current?.id !== attemptId) return;
      if (!sameAttempt(examRef.current, fresh)) throw new Error("exam_selection_mismatch");
      conflictRef.current = fresh;
      setConflict(fresh);
      if (fresh.status !== "in_progress") setRemaining(0);
    } catch (failure) {
      if (epoch === routeEpoch.current) setError(failure instanceof Error && failure.message === "exam_selection_mismatch"
        ? examError(failure) : "Non riesco a verificare la versione sul servizio. Le scelte locali restano protette: riprova la verifica.");
    } finally {
      if (epoch === routeEpoch.current) setCheckingConflict(false);
    }
  }, [exitDraft]);

  const flush = useCallback(async (replacement?: ExamAttempt) => {
    const currentExam = examRef.current;
    if (!currentExam || currentExam.status !== "in_progress") return;
    if (conflictRef.current !== undefined && (!replacement || conflictRef.current !== replacement || replacement.status !== "in_progress")) return;
    if (savingRef.current) {
      pendingRef.current = true;
      return;
    }
    const epoch = routeEpoch.current;
    const snapshot = answersRef.current;
    const baseRevision = replacement?.answerRevision ?? revisionRef.current;
    const generation = exitDraft.checkpoint();
    savingRef.current = true;
    pendingRef.current = false;
    setConflictChoice(null);
    setSaved("saving");
    try {
      const value = await studyRequest<ExamAttempt>(
        `/exams/${currentExam.id}/answers`,
        { answers: snapshot, expectedRevision: baseRevision },
        { method: "PUT" },
      );
      if (epoch !== routeEpoch.current || examRef.current?.id !== currentExam.id) return;
      if (!sameAttempt(currentExam, value)) throw new Error("exam_selection_mismatch");
      if (value.status !== "in_progress") {
        // Expiry can close the server attempt while a local save is in flight.
        // Keep the local draft until the reader explicitly opens that result.
        conflictRef.current = value;
        setConflict(value);
        setRemaining(0);
        dirty.current = true;
        pendingRef.current = false;
        exitDraft.changed();
        setSaved("error");
        return;
      }
      conflictRef.current = undefined;
      setConflict(undefined);
      setError("");
      revisionRef.current = value.answerRevision ?? baseRevision + 1;
      const changedDuringSave = !sameAnswers(answersRef.current, snapshot);
      dirty.current = changedDuringSave;
      pendingRef.current = changedDuringSave;
      setSaved(changedDuringSave ? "saving" : "saved");
      if (!changedDuringSave) exitDraft.confirm(generation);
    } catch (failure) {
      if (epoch !== routeEpoch.current) return;
      if (failure instanceof StudyApiError && failure.status === 409 && failure.message === "exam_revision_conflict") {
        await reloadAfterConflict(currentExam.id);
        return;
      }
      setSaved("error");
      dirty.current = true;
      if (!(failure instanceof StudyApiError && failure.status === 409)) setError(examError(failure));
    } finally {
      savingRef.current = false;
      if (epoch === routeEpoch.current && conflictRef.current === undefined && pendingRef.current && dirty.current && examRef.current) {
        pendingRef.current = false;
        window.setTimeout(() => flushRef.current(), 0);
      }
    }
  }, [reloadAfterConflict, exitDraft]);

  async function discardLocalAfterConfirmation() {
    if (!examRef.current || resolvingConflict || savingRef.current) return;
    const epoch = routeEpoch.current, currentExam = examRef.current, generation = exitDraft.checkpoint();
    setResolvingConflict(true);
    try {
      const fresh = await studyRequest<ExamAttempt>(`/exams/${currentExam.id}`);
      if (epoch !== routeEpoch.current || examRef.current?.id !== currentExam.id) return;
      if (!sameAttempt(currentExam, fresh)) throw new Error("exam_selection_mismatch");
      if (generation !== exitDraft.checkpoint()) {
        conflictRef.current = fresh;
        setConflict(fresh);
        setConflictChoice(null);
        setError("Le scelte locali sono cambiate durante la verifica. Controllale e conferma di nuovo prima di scartarle.");
        return;
      }
      open(fresh, currentExam.simulationId);
    } catch (failure) {
      if (epoch === routeEpoch.current) setError(examError(failure));
    } finally {
      if (epoch === routeEpoch.current) setResolvingConflict(false);
    }
  }

  useEffect(() => {
    flushRef.current = () => void flush();
  }, [flush]);

  useEffect(() => {
    if (!exam || exam.status !== "in_progress" || !dirty.current || conflictRef.current !== undefined) return;
    const id = window.setTimeout(() => void flush(), 700);
    return () => window.clearTimeout(id);
  }, [answers, exam, flush]);

  useEffect(() => {
    if (!exam || exam.status !== "in_progress") return;
    setRemaining(exam.remainingSeconds);
    const id = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [exam]);

  const submit = useCallback(
    async (force = false) => {
      if (!exam || exam.status !== "in_progress" || submittingRef.current || conflictRef.current !== undefined)
        return;
      if (savingRef.current) {
        setError("Attendi la fine del salvataggio e consegna di nuovo.");
        return;
      }
      if (!force && !confirming) {
        setConfirming(true);
        return;
      }
      const generation = exitDraft.checkpoint();
      submittingRef.current = true;
      setSubmitting(true);
      setConfirming(false);
      setError("");
      try {
        const value = await studyRequest<ExamAttempt>(
          `/exams/${exam.id}/submit`,
          { answers, expectedRevision: revisionRef.current },
          { method: "POST" },
        );
        revisionRef.current = value.answerRevision ?? revisionRef.current;
        setExam(value);
        setRemaining(0);
        setSaved("idle");
        dirty.current = false;
        exitDraft.confirm(generation);
        await refresh().catch(() => undefined);
      } catch (failure) {
        if (
          failure instanceof StudyApiError &&
          failure.status === 409 &&
          failure.message === "exam_revision_conflict"
        ) {
          await reloadAfterConflict(exam.id).catch(() => undefined);
        } else {
          setError(describeError(failure));
        }
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [answers, confirming, exam, refresh, reloadAfterConflict, exitDraft],
  );

  useEffect(() => {
    if (exam?.status === "in_progress" && remaining === 0)
      void submit(true);
  }, [exam?.status, remaining, submit]);

  if (loading && !exam && !listing)
    return <Loading>Sto preparando la prova…</Loading>;

  const hasConflict = conflict !== undefined;
  const conflictNotice = hasConflict && <section aria-label="Scelte dopo il conflitto" role="alert">
    <h2>Le risposte locali sono ancora qui.</h2>
    <p>Il servizio conserva una versione diversa. Il salvataggio automatico e la consegna sono sospesi finché scegli come continuare. Il tempo della prova continua a scorrere.</p>
    {conflict === null ? <><p>{checkingConflict ? "Verifico la versione sul servizio…" : "La versione del servizio non è verificata. Le risposte locali sono conservate."}</p><button disabled={checkingConflict || resolvingConflict || saved === "saving"} onClick={() => examRef.current && void reloadAfterConflict(examRef.current.id)}>Riprova la verifica del servizio</button></> : <>
      {conflict.status !== "in_progress" && <p>La prova sul servizio è già chiusa. Le modifiche locali non possono più essere salvate: puoi leggerle e copiarle prima di aprire il risultato del servizio.</p>}
      {conflictChoice === "server" ? <>
        <p>Ricaricando dal servizio perderai le modifiche locali non salvate. Vuoi scartarle e aprire la versione del servizio?</p>
        <button disabled={resolvingConflict} onClick={() => void discardLocalAfterConfirmation()}>Conferma scarto e ricarica</button>
        <button disabled={resolvingConflict} onClick={() => setConflictChoice(null)}>Torna alle scelte</button>
      </> : conflictChoice === "local" ? <>
        <p>Le scelte di questa scheda sostituiranno quelle salvate sul servizio, comprese le modifiche dell’altra scheda. Confermi questa sostituzione?</p>
        <button disabled={saved === "saving"} onClick={() => conflictRef.current && void flush(conflictRef.current)}>Conferma sostituzione sul servizio</button>
        <button disabled={saved === "saving"} onClick={() => setConflictChoice(null)}>Torna alle scelte</button>
      </> : <>
        <button disabled={saved === "saving" || resolvingConflict} onClick={() => setConflictChoice("server")}>Ricarica le risposte del servizio</button>
        {conflict.status === "in_progress" && <button disabled={saved === "saving" || resolvingConflict} onClick={() => setConflictChoice("local")}>Salva le scelte di questa scheda</button>}
      </>}
    </>}
  </section>;

  if (exam) {
    if (exam.status === "in_progress")
      return (
        <ExamRunner
          exam={exam}
          answers={answers}
          current={current}
          remaining={remaining}
          saved={saved}
          submitting={submitting}
          confirming={confirming}
          error={error}
          conflictNotice={conflictNotice}
          blocked={hasConflict}
          onAnswer={answer}
          onCurrent={setCurrent}
          onConfirm={() => setConfirming(true)}
          onCancel={() => setConfirming(false)}
          onSubmit={() => void submit(true)}
        />
      );
    return (
      <ExamResultView
        exam={exam}
        filter={filter}
        onFilter={setFilter}
        onBack={() => {
          setExam(null);
          void refresh().catch((failure) => setError(describeError(failure)));
        }}
      />
    );
  }

  const openAttempt = listing?.attempts.find(
    (attempt) => attempt.status === "in_progress",
  );
  const simulations = listing?.simulations ?? [];
  const selectedSimulation = simulations.find((item) => item.id === requestedSimulation);
  const invalidSelection = Boolean(requestedSimulation && listing && !selectedSimulation);
  const examReady = listing?.pack?.ready !== false;
  const differentActive = Boolean(openAttempt && requestedSimulation && openAttempt.simulationId !== requestedSimulation);
  return (
    <>
      <header className="page-heading">
        <p className="date-line">{data.edition.title ?? "Fisica"}</p>
        <h1>La prova di fisica.</h1>
        <p>
          31 quesiti in 50 minuti. Una risposta corretta vale +1,00, una
          risposta errata −0,10, una risposta omessa 0,00. Le spiegazioni
          compaiono solo dopo la consegna.
        </p>
      </header>
      {error && <ErrorNotice message={error} />}
      {simulations.length > 0 && <section aria-label="Simulazioni tematiche disponibili">
        <h2>Scegli la simulazione</h2>
        <ul>{simulations.map((item) => <li key={item.id}>
          <a href={simulationHref(editionId, item.id)} aria-current={item.id === requestedSimulation ? "page" : undefined}>{item.title}</a>
          <p>{item.questionCount} quesiti · {item.durationSeconds / 60} minuti · {item.ready ? "Disponibile" : "Non disponibile"}</p>
          <DraftNotice reference={item} />
        </li>)}</ul>
      </section>}
      {selectedSimulation && <section aria-labelledby="simulation-start-title" className="exam-start">
        <div><h2 id="simulation-start-title">{selectedSimulation.title}</h2>
          <DraftNotice reference={selectedSimulation} />
          <p>{selectedSimulation.questionCount} quesiti: {selectedSimulation.rules.mcq} scelte e {selectedSimulation.rules.completion} completamenti in {selectedSimulation.durationSeconds / 60} minuti.</p>
          <p>{selectedSimulation.rules.scoring} Le correzioni compaiono solo dopo la consegna o la scadenza.</p>
        </div>
        <button className="button-primary" disabled={starting || !selectedSimulation.ready || Boolean(openAttempt)} onClick={() => void start()}>
          {starting ? "Preparazione…" : "Inizia la simulazione"}
        </button>
      </section>}
      {openAttempt ? (
        <section className="exam-resume" aria-labelledby="exam-resume-title">
          <div>
            <p className="exam-kicker">Prova interrotta</p>
            <h2 id="exam-resume-title">{differentActive ? "È in corso un’altra simulazione." : "Riprendi da dove eri."}</h2>
            {openAttempt.simulationId && <p>{simulations.find((item) => item.id === openAttempt.simulationId)?.title ?? openAttempt.simulationId}</p>}
            <DraftNotice reference={openAttempt} />
            <p>
              Il tempo continua a scorrere. Le risposte salvate restano
              disponibili sul servizio.
            </p>
          </div>
          <button className="button-primary" onClick={() => void reopen(openAttempt.id)}>
            {differentActive ? "Riprendi l’altra simulazione" : "Riprendi la prova"}
          </button>
        </section>
      ) : simulations.length > 0 || invalidSelection ? null : listing?.pack ? (
        <section className="exam-start" aria-labelledby="exam-start-title">
          <div>
            <p className="exam-kicker">{listing.pack.subtitle}</p>
            <h2 id="exam-start-title">{listing.pack.title}</h2>
            <p>
              Prova originale scritta per ARDESIA, ispirata ai programmi di
              fisica della scuola secondaria superiore. Non è un fac-simile
              ufficiale.
            </p>
            {!examReady && (
              <p role="status">
                {(listing.pack.approvedCount ?? 0) >= 31
                  ? "I quesiti approvati non bastano a comporre la prova: servono 21 scelte e 10 completamenti con famiglie distinte."
                  : "Servono 31 quesiti approvati per aprire la prova."}
              </p>
            )}
          </div>
          <button
            className="button-primary"
            disabled={starting || !examReady}
            onClick={() => void start()}
          >
            {starting
              ? "Preparazione…"
              : examReady
                ? "Inizia la prova"
                : (listing.pack.approvedCount ?? 0) >= 31
                  ? "Composizione non disponibile"
                  : "In attesa delle approvazioni"}
          </button>
        </section>
      ) : (
        !loading && (
          <EmptyState title="Nessuna prova disponibile.">
            Questa edizione non è collegata a una prova di fisica approvata.
          </EmptyState>
        )
      )}
      <ExamHistory attempts={listing?.attempts ?? []} simulations={simulations} onOpen={reopen} />
    </>
  );
}

function ExamHistory({
  attempts,
  simulations,
  onOpen,
}: {
  attempts: ExamSummary[];
  simulations: Simulation[];
  onOpen: (id: string) => void;
}) {
  if (attempts.length === 0)
    return (
      <EmptyState title="Nessuna prova ancora.">
        Quando inizi, il timer parte davvero. Puoi interrompere e riprendere
        finché il tempo non scade.
      </EmptyState>
    );
  return (
    <section className="exam-history" aria-labelledby="exam-history-title">
      <h2 id="exam-history-title">Le tue prove</h2>
      <ul>
        {attempts.map((attempt) => (
          <li key={attempt.id}>
            <button onClick={() => onOpen(attempt.id)}>
              <span>
                <strong>{statusLabel[attempt.status]}</strong>
                {attempt.simulationId && <small>{simulations.find((item) => item.id === attempt.simulationId)?.title ?? attempt.simulationId}</small>}
                {isDraft(attempt) && <small>DRAFT · riscontro di riferimento · approvazione umana non eseguita</small>}
                <small>{dateLabel(attempt.startedAt)}</small>
              </span>
              <span className="exam-history-score">
                {attempt.score === null
                  ? "in corso"
                  : `${scoreLabel(attempt.scoreTenths)} / 31,0`}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ExamRunner({
  exam,
  answers,
  current,
  remaining,
  saved,
  submitting,
  confirming,
  error,
  conflictNotice,
  blocked,
  onAnswer,
  onCurrent,
  onConfirm,
  onCancel,
  onSubmit,
}: {
  exam: ExamAttempt;
  answers: AnswerMap;
  current: number;
  remaining: number;
  saved: "idle" | "saving" | "saved" | "error";
  submitting: boolean;
  confirming: boolean;
  error: string;
  conflictNotice: ReactNode;
  blocked: boolean;
  onAnswer: (id: string, value: number | string) => void;
  onCurrent: (value: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const question = exam.questions[current];
  const answeredCount = exam.questions.filter((item) =>
    isAnswered(answers[item.id]),
  ).length;
  const urgent = remaining <= 5 * 60;
  return (
    <div className="exam-runner">
      <header className="exam-toolbar">
        <div>
          <p className="exam-kicker">{exam.subtitle}</p>
          <h1>{exam.title}</h1>
        </div>
        <div
          className={`exam-timer${urgent ? " is-urgent" : ""}`}
          role="timer"
          aria-live="off"
        >
          <span>Tempo rimasto</span>
          <strong>{clock(remaining)}</strong>
        </div>
      </header>
      <DraftNotice reference={exam} />
      <div className="exam-progress">
        <span>
          Domanda {current + 1} di {exam.questions.length}
        </span>
        <span>{answeredCount} risposte date</span>
        <span aria-live="polite">
          {blocked
            ? "Salvataggio automatico sospeso"
            : saved === "saving"
            ? "Salvataggio…"
            : saved === "saved"
              ? "Risposte salvate"
              : saved === "error"
                ? "Salvataggio non riuscito: riprova a rispondere"
                : "Le risposte si salvano da sole"}
        </span>
      </div>
      {error && <ErrorNotice message={error} />}
      {conflictNotice}
      <div className="exam-layout">
        <nav className="exam-palette" aria-label="Vai a una domanda">
          {exam.questions.map((item, index) => (
            <button
              key={item.id}
              className={[
                index === current ? "is-current" : "",
                isAnswered(answers[item.id]) ? "is-answered" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={index === current ? "step" : undefined}
              aria-label={`Domanda ${index + 1}${isAnswered(answers[item.id]) ? ", risposta data" : ""}`}
              onClick={() => onCurrent(index)}
            >
              {index + 1}
            </button>
          ))}
        </nav>
        <section className="exam-question" aria-labelledby="exam-question-title">
          <p className="exam-kicker">{question.topic}</p>
          <h2 id="exam-question-title">{question.prompt}</h2>
          {question.type === "mcq" ? (
            <fieldset className="exam-options">
              <legend>Scegli una sola risposta.</legend>
              {question.options.map((option, index) => {
                const optionValue =
                  question.answerType === "option_id"
                    ? String.fromCharCode(65 + index)
                    : index;
                return (
                <label
                  key={option}
                  className={
                    answers[question.id] === optionValue ? "is-selected" : ""
                  }
                >
                  <input
                    type="radio"
                    name={`exam-${question.id}`}
                    checked={answers[question.id] === optionValue}
                    onChange={() => onAnswer(question.id, optionValue)}
                  />
                  <span className="exam-option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </label>
                );
              })}
            </fieldset>
          ) : (
            <label className="exam-completion">
              Testo o numero
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                value={
                  typeof answers[question.id] === "string"
                    ? (answers[question.id] as string)
                    : ""
                }
                onChange={(event) => onAnswer(question.id, event.target.value)}
              />
            </label>
          )}
          <div className="exam-actions">
            <button
              disabled={current === 0}
              onClick={() => onCurrent(Math.max(0, current - 1))}
            >
              Precedente
            </button>
            {current < exam.questions.length - 1 ? (
              <button
                className="button-primary"
                onClick={() =>
                  onCurrent(Math.min(exam.questions.length - 1, current + 1))
                }
              >
                Successiva
              </button>
            ) : (
              <button className="button-primary" disabled={blocked} onClick={onConfirm}>
                Consegna
              </button>
            )}
          </div>
        </section>
      </div>
      <footer className="exam-footer">
        <p>
          {exam.rules.scoring} Le risposte vuote valgono zero.
        </p>
        {confirming ? (
          <div className="exam-confirm" role="group" aria-labelledby="exam-confirm-title">
            <h2 id="exam-confirm-title">Consegnare adesso?</h2>
            <p>
              {exam.questions.length - answeredCount === 0
                ? "Hai risposto a tutte le domande."
                : `Restano ${exam.questions.length - answeredCount} domande senza risposta.`}{" "}
              Dopo la consegna non potrai più modificare le risposte.
            </p>
            <div>
              <button onClick={onCancel} disabled={submitting}>
                Continua la prova
              </button>
              <button
                className="button-primary"
                onClick={onSubmit}
                disabled={submitting || blocked}
              >
                {submitting ? "Consegna…" : "Consegna definitivamente"}
              </button>
            </div>
          </div>
        ) : (
          <button className="button-quiet" disabled={blocked} onClick={onConfirm}>
            Consegna la prova
          </button>
        )}
      </footer>
    </div>
  );
}

function ExamResultView({
  exam,
  filter,
  onFilter,
  onBack,
}: {
  exam: ExamAttempt;
  filter: "all" | "wrong" | "omitted";
  onFilter: (value: "all" | "wrong" | "omitted") => void;
  onBack: () => void;
}) {
  const result = exam.result;
  if (!result) return <ErrorNotice message="Esito non disponibile." />;
  const questions = result.questions.filter(
    (question) => filter === "all" || question.status === filter,
  );
  return (
    <>
      <header className="page-heading">
        <p className="date-line">{statusLabel[exam.status]}</p>
        <h1>
          {exam.status === "expired"
            ? "Il tempo è scaduto."
            : "La prova è consegnata."}
        </h1>
        <p>
          Il punteggio segue la regola della prova: +1,00 per una risposta
          corretta, −0,10 per una risposta errata, 0,00 per una risposta
          omessa. Le spiegazioni restano disponibili qui.
        </p>
      </header>
      <DraftNotice reference={exam} />
      {isDraft(exam) && <p>Il punteggio confronta le risposte con il riferimento DRAFT.</p>}
      {result.validity && !result.validity.valid && (
        <div className="exam-invalid" role="alert">
          <strong>Prova non valida.</strong> La revisione scientifica di uno o
          più quesiti è stata revocata dopo l’avvio. Il punteggio resta visibile
          per trasparenza, ma non va considerato un esito valido.
        </div>
      )}
      <section className="exam-score" aria-label="Esito della prova">
        <div>
          <span>{isDraft(exam) ? "Punteggio di riferimento" : "Punteggio"}</span>
          <strong>{scoreLabel(result.scoreTenths)}</strong>
          <small>su 31,0</small>
        </div>
        <dl>
          <div>
            <dt>Corrette</dt>
            <dd>{result.correct}</dd>
          </div>
          <div>
            <dt>Errate</dt>
            <dd>{result.wrong}</dd>
          </div>
          <div>
            <dt>Omesse</dt>
            <dd>{result.omitted}</dd>
          </div>
        </dl>
      </section>
      <div className="exam-result-actions">
        <button onClick={onBack}>Torna alle prove</button>
      </div>
      <nav className="filter-tabs" aria-label="Filtra la revisione">
        {[
          ["all", `Tutte (${result.questions.length})`],
          ["wrong", `Errate (${result.wrong})`],
          ["omitted", `Omesse (${result.omitted})`],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={filter === id}
            onClick={() => onFilter(id as "all" | "wrong" | "omitted")}
          >
            {label}
          </button>
        ))}
      </nav>
      {questions.length === 0 ? (
        <EmptyState title="Nessun errore da rivedere.">
          Con questo filtro non resta nulla. Puoi tornare a tutte le domande.
        </EmptyState>
      ) : (
        <section className="exam-review" aria-label="Revisione delle risposte">
          {questions.map((question) => (
            <article
              key={question.questionId}
              className={`exam-review-item is-${question.status}`}
            >
              <header>
                <span className="exam-review-index">
                  {String(
                    result.questions.findIndex(
                      (item) => item.questionId === question.questionId,
                    ) + 1,
                  ).padStart(2, "0")}
                </span>
                <div>
                  <p className="exam-kicker">{question.topic}</p>
                  <h2>{question.prompt}</h2>
                </div>
                <span className="exam-status">
                  {question.status === "correct"
                    ? "Corretta"
                    : question.status === "wrong"
                      ? "Errata"
                      : "Omessa"}
                </span>
              </header>
              <dl>
                <div>
                  <dt>La tua risposta</dt>
                  <dd>{question.givenText ?? "Nessuna risposta"}</dd>
                </div>
                <div>
                  <dt>Risposta attesa</dt>
                  <dd>{question.expectedText}</dd>
                </div>
                <div>
                  <dt>Punteggio</dt>
                  <dd>
                    {question.pointsTenths > 0 ? "+" : ""}
                    {scoreLabel(question.pointsTenths)}
                  </dd>
                </div>
              </dl>
              <details open={question.status !== "correct"}>
                <summary>Spiegazione</summary>
                <p>{question.explanation}</p>
                {question.solutionSteps?.length ? (
                  <ol className="exam-solution-steps">
                    {question.solutionSteps.map((step) => (
                      <li key={`${question.questionId}-${step.title}`}>
                        <strong>{step.title}</strong>
                        <p>{step.explanation}</p>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </details>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
