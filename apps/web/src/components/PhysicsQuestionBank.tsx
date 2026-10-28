import { useEffect, useRef, useState } from "react";
import { describeError, studyRequest } from "../api";
import { ErrorNotice, Loading } from "./Feedback";
import "./physics-question-bank.css";

type Level = "base" | "facile" | "medio" | "difficile";
export type Question = {
  id: string;
  prompt: string;
  format: "multiple_choice" | "completion";
  options: { id: string; text: string }[];
  taxonomy: { unitId: string; macroarea: string; microarea: string; topic: string };
  difficulty: { level: Level; reason: string };
  familyId: string;
  status: "PUBLISHED";
  descriptors?: { scope?: string };
};
type QuestionPage = { bankSha256: string; items: Question[]; total: number; nextCursor: string | null };
type BankCatalog = {
  title: string;
  questionCount: number;
  bankSha256: string;
  countsByDifficulty: Record<Level, number>;
};
type Feedback = {
  questionId: string;
  outcome: "correct" | "incorrect" | "omitted";
  score: number;
  matchingPolicy: string;
  answer: { text: string; unit: string; correctOptionId?: string };
  solution: string;
  scientificApproval: "APPROVED";
};
type Exam = {
  bankSha256: string;
  seed: string;
  durationSeconds: number;
  questions: Question[];
};
export const physicsUnits = [
  ["U1", "Metodi e misure"], ["U2", "Meccanica"], ["U3", "Fluidi"],
  ["U4", "Onde meccaniche"], ["U5", "Termodinamica"],
  ["U6", "Elettricità e magnetismo"], ["U7", "Radiazioni e ottica"],
];
export const physicsLevels: Level[] = ["base", "facile", "medio", "difficile"];

function bankError(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "question_bank_changed") return "Il materiale è stato aggiornato. Chiudi e riapri la banca per usare la versione corrente.";
  if (code === "insufficient_distinct_families") return "Questo filtro non contiene abbastanza famiglie diverse per una prova completa. Scegli tutti i livelli.";
  return describeError(error, "Non riesco a caricare i quesiti. Puoi riprovare.");
}

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith("**") && part.endsWith("**")
    ? <strong key={index}>{part.slice(2, -2)}</strong> : part);
}

/** Render original Markdown text without interpreting HTML or executable math. */
export function QuestionSolution({ text }: { text: string }) {
  return <div className="physics-bank-solution-text">{text.split(/\n\s*\n/).map((block, index) => {
    const lines = block.split("\n");
    if (/^#{1,6}\s/.test(lines[0])) {
      return <div key={index}><h4>{inline(lines[0].replace(/^#{1,6}\s+/, ""))}</h4>
        {lines.length > 1 && <p>{inline(lines.slice(1).join("\n"))}</p>}</div>;
    }
    if (lines.every(line => /^[-*]\s/.test(line))) {
      return <ul key={index}>{lines.map((line, item) => <li key={item}>{inline(line.slice(2))}</li>)}</ul>;
    }
    return <p key={index}>{inline(block)}</p>;
  })}</div>;
}

export function QuestionCard({ question, base, bankSha256, index }: {
  question: Question; base: string; bankSha256: string; index: number;
}) {
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  const pending = useRef(false);
  useEffect(() => () => controller.current?.abort(), []);
  async function check(value: string) {
    if (pending.current) return;
    pending.current = true;
    const active = new AbortController();
    controller.current = active;
    setBusy(true); setError("");
    try {
      const result = await studyRequest<Feedback>(`${base}/attempts`, {
        questionId: question.id, response: value, bankSha256,
      }, { signal: active.signal });
      if (!active.signal.aborted) setFeedback(result);
    } catch (failure) {
      if (!active.signal.aborted) setError(bankError(failure));
    } finally {
      if (!active.signal.aborted) { pending.current = false; setBusy(false); }
    }
  }
  return <article className="physics-bank-question" aria-label={`Quesito ${index + 1}`}>
    <div className="physics-bank-question-meta">
      <span>{question.taxonomy.unitId} · {question.taxonomy.microarea}</span>
      <span>{question.difficulty.level}</span>
      {question.descriptors?.scope === "provided_law_extension" && <span>Approfondimento · legge fornita</span>}
    </div>
    <h3>{index + 1}. {question.taxonomy.topic}</h3>
    <p className="physics-bank-prompt">{question.prompt}</p>
    <form onSubmit={event => { event.preventDefault(); void check(response); }}>
      {question.format === "multiple_choice" ? <fieldset disabled={busy || Boolean(feedback)}>
        <legend>Scegli una risposta</legend>
        {question.options.map(option => <label className="physics-bank-option" key={option.id}>
          <input type="radio" name={question.id} value={option.id} checked={response === option.id}
            onChange={() => setResponse(option.id)} />
          <span><strong>{option.id}.</strong> {option.text}</span>
        </label>)}
      </fieldset> : <label>La tua risposta
        <input aria-label="La tua risposta" value={response} maxLength={128} autoComplete="off"
          disabled={busy || Boolean(feedback)} onChange={event => setResponse(event.target.value)} />
        <small>Sono accettate frazioni come 3/2 e la virgola decimale. Segui l’unità indicata nel quesito.</small>
      </label>}
      {!feedback && <div className="physics-bank-actions">
        <button className="button-primary" disabled={busy || !response.trim()}>{busy ? "Verifica…" : "Verifica risposta"}</button>
        <button type="button" disabled={busy} onClick={() => void check("")}>Mostra lo svolgimento</button>
      </div>}
    </form>
    {error && <ErrorNotice message={error} />}
    {feedback && <section className="physics-bank-feedback" aria-label="Risposta e svolgimento">
      <p role="status"><strong>{feedback.outcome === "correct" ? "Risposta corretta" : feedback.outcome === "incorrect" ? "Da rivedere" : "Risposta omessa"}</strong>
        {" · "}{feedback.score > 0 ? "+" : ""}{feedback.score.toLocaleString("it-IT")} punti</p>
      <p><strong>Risultato:</strong> {feedback.answer.correctOptionId ? `${feedback.answer.correctOptionId}. ` : ""}{feedback.answer.text}</p>
      {feedback.matchingPolicy === "approved_aliases_only" && feedback.outcome === "incorrect" &&
        <p>Il confronto riconosce le forme di risposta previste. Controlla lo svolgimento anche se hai scritto una forma simbolica equivalente.</p>}
      <QuestionSolution text={feedback.solution} />
    </section>}
  </article>;
}

function BankReader({ editionId, bankId }: { editionId: string; bankId: string }) {
  const base = `/editions/${encodeURIComponent(editionId)}/question-banks/${encodeURIComponent(bankId)}`;
  const [catalog, setCatalog] = useState<BankCatalog | null>(null);
  const [page, setPage] = useState<QuestionPage | null>(null);
  const [filters, setFilters] = useState({ unit: "", difficulty: "", format: "", query: "" });
  const [search, setSearch] = useState("");
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [exam, setExam] = useState<Exam | null>(null);
  const [examBusy, setExamBusy] = useState(false);
  const examController = useRef<AbortController | null>(null);
  const examPending = useRef(false);
  const listingSha = useRef<string | null>(null);
  useEffect(() => () => examController.current?.abort(), []);
  useEffect(() => {
    const controller = new AbortController();
    void studyRequest<BankCatalog>(base, undefined, { signal: controller.signal }).then(result => {
      if (!controller.signal.aborted) setCatalog(result);
    }).catch(failure => { if (!controller.signal.aborted) setError(bankError(failure)); });
    return () => controller.abort();
  }, [base, reload]);
  const cursor = cursors[cursors.length - 1];
  useEffect(() => {
    if (exam) return;
    const controller = new AbortController();
    const parameters = new URLSearchParams({ limit: "10" });
    if (listingSha.current) parameters.set("bankSha256", listingSha.current);
    if (filters.unit) parameters.set("unitId", filters.unit);
    if (filters.difficulty) parameters.set("difficulty", filters.difficulty);
    if (filters.format) parameters.set("format", filters.format);
    if (filters.query) parameters.set("q", filters.query);
    if (cursor) parameters.set("after", cursor);
    setLoading(true); setPage(null); setError("");
    void studyRequest<QuestionPage>(`${base}/questions?${parameters}`, undefined, { signal: controller.signal })
      .then(result => {
        if (!controller.signal.aborted) {
          listingSha.current = result.bankSha256;
          setPage(result);
        }
      })
      .catch(failure => { if (!controller.signal.aborted) setError(bankError(failure)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [base, filters, cursor, reload, exam]);
  function changeFilter(key: keyof typeof filters, value: string) {
    setCursors([null]); setFilters(previous => ({ ...previous, [key]: value }));
  }
  async function makeExam() {
    if (examPending.current) return;
    examPending.current = true;
    const controller = new AbortController();
    examController.current = controller;
    setExamBusy(true); setError("");
    try {
      const result = await studyRequest<Exam>(`${base}/exams`, {
        seed: crypto.randomUUID(), profileId: "semestre-2026",
        ...(catalog ? { bankSha256: catalog.bankSha256 } : {}),
      }, { signal: controller.signal });
      if (!controller.signal.aborted) setExam(result);
    } catch (failure) {
      if (!controller.signal.aborted) setError(bankError(failure));
    } finally {
      if (!controller.signal.aborted) { examPending.current = false; setExamBusy(false); }
    }
  }
  const questions = exam?.questions ?? page?.items ?? [];
  const sha = exam?.bankSha256 ?? page?.bankSha256 ?? "";
  return <section className="physics-bank" aria-label="Banca quesiti di fisica">
    <header>
      <h2>Fisica, un quesito alla volta.</h2>
      <p>{catalog ? `${catalog.questionCount.toLocaleString("it-IT")} quesiti` : "Banca dei quesiti"} · quattro livelli · senza calcolatrice.</p>
      <p className="physics-bank-review">Sono disponibili solo i quesiti pubblicati per questa edizione. Gli svolgimenti sono disponibili dopo la risposta.</p>
      <p className="physics-bank-session-note">Allenamento personale: le risposte di questa sezione non vengono salvate nel diario del corso.</p>
    </header>
    <div className="physics-bank-actions">
      <button type="button" disabled={examBusy} onClick={() => void makeExam()}>
        {examBusy ? "Preparo i quesiti…" : "Genera una prova 2026 · 31 quesiti"}
      </button>
      {exam && <button type="button" onClick={() => { setExam(null); setCursors([null]); }}>Torna alla ricerca</button>}
    </div>
    {exam ? <p role="status">Allenamento nel formato 2026: 21 scelte multiple e 10 completamenti. Tempo di riferimento: {exam.durationSeconds / 60} minuti. Puoi aprire la correzione dopo ogni risposta. La distribuzione degli argomenti è una scelta didattica per l’allenamento, non una quota ministeriale.</p>
      : <form className="physics-bank-filters" onSubmit={event => { event.preventDefault(); changeFilter("query", search); }}>
        <label>Argomento<select value={filters.unit} onChange={event => changeFilter("unit", event.target.value)}>
          <option value="">Tutti gli argomenti</option>{physicsUnits.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
        </select></label>
        <label>Difficoltà<select value={filters.difficulty} onChange={event => changeFilter("difficulty", event.target.value)}>
          <option value="">Tutti i livelli</option>{physicsLevels.map(level => <option key={level}>{level}</option>)}
        </select></label>
        <label>Formato<select value={filters.format} onChange={event => changeFilter("format", event.target.value)}>
          <option value="">Tutti i formati</option><option value="multiple_choice">Scelta multipla</option><option value="completion">Completamento</option>
        </select></label>
        <label className="physics-bank-search">Cerca un concetto<input value={search} maxLength={120}
          onChange={event => setSearch(event.target.value)} placeholder="Per esempio: pressione, energia, lenti" /></label>
        <button type="submit">Cerca</button>
      </form>}
    {error && <ErrorNotice message={error} onRetry={() => setReload(value => value + 1)} />}
    {!exam && loading ? <Loading>Carico i quesiti…</Loading> : <>
      {!exam && page && <p role="status">{page.total.toLocaleString("it-IT")} quesiti trovati · pagina {cursors.length}</p>}
      {!questions.length && !error && <p>Nessun quesito con questi filtri. Prova a cambiare argomento o parole di ricerca.</p>}
      {questions.map((question, index) => <QuestionCard key={`${sha}:${question.id}`} question={question}
        index={exam ? index : (cursors.length - 1) * 10 + index} base={base} bankSha256={sha} />)}
      {!exam && page && <nav className="physics-bank-actions" aria-label="Pagine dei quesiti">
        <button type="button" disabled={cursors.length === 1} onClick={() => setCursors(previous => previous.slice(0, -1))}>Precedenti</button>
        <button type="button" disabled={!page.nextCursor} onClick={() => setCursors(previous => [...previous, page.nextCursor])}>Successivi</button>
      </nav>}
    </>}
  </section>;
}

export function PhysicsQuestionBank({ editionId, bankId = "physics-semestre-2026" }: { editionId: string; bankId?: string }) {
  const [open, setOpen] = useState(false);
  return <details className="disclosure-panel physics-bank-disclosure" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>Allenati con la banca di fisica · Semestre filtro 2026/27</summary>
    {open && <BankReader key={`${editionId}:${bankId}`} editionId={editionId} bankId={bankId} />}
  </details>;
}
