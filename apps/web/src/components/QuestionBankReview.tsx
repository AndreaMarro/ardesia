import { useEffect, useRef, useState } from "react";
import { describeError, studyRequest } from "../api";
import { ErrorNotice, Loading } from "./Feedback";
import { physicsLevels, physicsUnits, QuestionSolution } from "./PhysicsQuestionBank";
import "./question-bank-review.css";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
type ScientificReview = {
  reviewId: string; questionVersion: number; contentSha256: string;
  status: ReviewStatus; notes: string; createdAt: number;
};
type Approval = {
  approvalId: string; scientificStatus: "APPROVED" | "REJECTED";
  editorialStatus: "PUBLISHED" | "WITHHELD" | "REVOKED";
  motivation: string; revocationReason: string | null;
};
type ListedQuestion = {
  id: string; title: string; prompt: string; format: "multiple_choice" | "completion";
  taxonomy: { unitId: string; microarea: string; topic: string };
  difficulty: { level: string }; servable: boolean; review: ScientificReview | null;
};
type Queue = { items: ListedQuestion[]; total: number; nextCursor: string | null };
type Detail = {
  contentSha256: string; questionVersion: number;
  question: ListedQuestion & {
    options: { id: string; text: string }[];
    answer: { text: string; unit: string; exact?: string; correctOptionId?: string };
    solution: string; solutionSteps: { title: string; explanation: string }[];
  };
  state: { servable: boolean; approval: Approval | null; review: ScientificReview | null;
    reviewPublication?: Approval | null };
};
type History = { reviews: ScientificReview[]; approvals: Approval[] };
const reviewLabels: Record<ReviewStatus, string> = {
  PENDING: "In revisione", APPROVED: "Valutazione positiva", REJECTED: "Da correggere",
};

function reviewError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message === "question_review_conflict") return "La revisione è cambiata in un’altra scheda. Le tue note restano qui; carica la revisione corrente e confrontala prima di salvare.";
  if (message === "question_revision_changed") return "Il contenuto del quesito è cambiato. Riapri il quesito e ripeti la verifica sulla nuova versione.";
  if (message === "scientific_review_not_approved") return "Serve una valutazione scientifica positiva salvata sulla versione corrente.";
  if (message === "review_publication_revoked") return "La pubblicazione di questa revisione è stata revocata. Carica lo stato corrente e salva una nuova revisione prima di pubblicare ancora.";
  if (message === "question_already_published") return "Il quesito risulta già pubblicato. Carica lo stato corrente prima di cambiare la pubblicazione.";
  return describeError(error, "Non riesco a completare l’operazione. Puoi riprovare.");
}

function ReviewEditor({ base, questionId, onChange, onBusy }: {
  base: string; questionId: string; onChange: () => void; onBusy: (busy: boolean) => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [history, setHistory] = useState<History | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ReviewStatus>("PENDING");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [publishOpen, setPublishOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState("");
  const [historyVersion, setHistoryVersion] = useState(0);
  const [conflict, setConflict] = useState(false);
  const [comparison, setComparison] = useState(false);
  const pending = useRef(false);
  const mutation = useRef<AbortController | null>(null);
  const heading = useRef<HTMLHeadingElement | null>(null);
  const focused = useRef(false);
  const path = `${base}/review/questions/${encodeURIComponent(questionId)}`;
  useEffect(() => {
    const controller = new AbortController();
    void studyRequest<Detail>(path, undefined, { signal: controller.signal }).then(value => {
      if (controller.signal.aborted) return;
      setDetail(value); setNotes(value.state.review?.notes ?? "");
      setStatus(value.state.review?.status ?? "PENDING");
    }).catch(failure => { if (!controller.signal.aborted) setError(reviewError(failure)); });
    return () => { controller.abort(); mutation.current?.abort(); };
  }, [path]);
  useEffect(() => {
    const controller = new AbortController();
    void studyRequest<History>(`${path}/history`, undefined, { signal: controller.signal })
      .then(value => { if (!controller.signal.aborted) setHistory(value); })
      .catch(failure => { if (!controller.signal.aborted) setError(reviewError(failure)); });
    return () => controller.abort();
  }, [path, historyVersion]);
  useEffect(() => {
    if (detail && !focused.current) {
      heading.current?.focus(); focused.current = true;
    }
  }, [detail]);

  async function perform(action: "save" | "publish" | "revoke" | "reload") {
    if (!detail || pending.current) return;
    pending.current = true; setBusy(true); onBusy(true); setError(""); setMessage("");
    const controller = new AbortController(); mutation.current = controller;
    try {
      if (action === "reload") {
        const current = await studyRequest<Detail>(path, undefined, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setDetail(current); setComparison(true); setPublishOpen(false); setConfirmed(false);
        setMessage("Stato corrente caricato. Le tue note sono conservate: confrontale con la revisione salvata prima di salvare di nuovo.");
      } else if (action === "save") {
        const review = await studyRequest<ScientificReview>(`${base}/review/reviews`, {
          questionId, questionVersion: detail.questionVersion, contentSha256: detail.contentSha256,
          status, notes, expectedReviewId: detail.state.review?.reviewId ?? null,
        }, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setDetail({ ...detail, state: { ...detail.state, review, reviewPublication: null } });
        setComparison(false);
        setPublishOpen(false); setConfirmed(false);
        setMessage("Revisione privata salvata. La pubblicazione non è cambiata.");
      } else if (action === "publish" && detail.state.review && confirmed) {
        const approval = await studyRequest<Approval>(`${base}/review/reviews/${encodeURIComponent(detail.state.review.reviewId)}/publish`,
          { confirmPublication: true }, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setDetail({ ...detail, state: { ...detail.state, approval, reviewPublication: approval, servable: true } });
        setPublishOpen(false); setConfirmed(false); setMessage("Quesito pubblicato per questa edizione.");
      } else if (action === "revoke" && detail.state.approval) {
        const approval = await studyRequest<Approval>(`${base}/review/approvals/${encodeURIComponent(detail.state.approval.approvalId)}/revoke`,
          { reason }, { signal: controller.signal });
        if (controller.signal.aborted) return;
        setDetail({ ...detail, state: { ...detail.state, approval, servable: false,
          reviewPublication: detail.state.reviewPublication?.approvalId === approval.approvalId
            ? approval : detail.state.reviewPublication } });
        setReason(""); setMessage("Pubblicazione revocata. Lo storico è conservato.");
      }
      if (!controller.signal.aborted) { setConflict(false); onChange(); setHistoryVersion(value => value + 1); }
    } catch (failure) {
      if (!controller.signal.aborted) {
        setError(reviewError(failure));
        setConflict(failure instanceof Error && ["question_review_conflict", "question_revision_changed", "review_publication_revoked", "question_already_published"].includes(failure.message));
      }
    } finally {
      if (!controller.signal.aborted) { pending.current = false; setBusy(false); onBusy(false); }
    }
  }

  if (!detail) return error ? <ErrorNotice message={error} /> : <Loading>Carico il quesito integrale…</Loading>;
  const question = detail.question;
  const saved = detail.state.review;
  const dirty = notes !== (saved?.notes ?? "") || status !== (saved?.status ?? "PENDING");
  const bindingChanged = Boolean(saved &&
    (saved.contentSha256 !== detail.contentSha256 || saved.questionVersion !== detail.questionVersion));
  const wasRevoked = detail.state.reviewPublication?.editorialStatus === "REVOKED";
  const freshReviewRequired = bindingChanged || wasRevoked;
  const canPublish = saved?.status === "APPROVED" && !dirty && !conflict && !freshReviewRequired;
  return <article className="physics-bank-question question-review-editor" aria-label="Revisione del quesito">
    <div className="physics-bank-question-meta"><span>{question.taxonomy.unitId} · {question.taxonomy.microarea}</span>
      <span>Versione {detail.questionVersion} · {question.difficulty.level}</span></div>
    <h3 ref={heading} tabIndex={-1}>{question.title}</h3>
    <p className="physics-bank-prompt">{question.prompt}</p>
    {question.options.length > 0 && <ol className="question-review-options">{question.options.map(option =>
      <li key={option.id}><strong>{option.id}.</strong> {option.text}</li>)}</ol>}
    <section aria-label="Risposta e soluzione integrali">
      <h4>Risposta prevista</h4>
      <p>{question.answer.correctOptionId ? `${question.answer.correctOptionId}. ` : ""}{question.answer.text}</p>
      <p>Unità dichiarata: <strong>{question.answer.unit || "non indicata"}</strong></p>
      <QuestionSolution text={question.solution} />
      {question.solutionSteps.length > 0 && <details><summary>Passaggi strutturati della soluzione</summary>
        {question.solutionSteps.map((step, index) => <section key={index}><h5>{index + 1}. {step.title}</h5>
          <p className="physics-bank-prompt">{step.explanation}</p></section>)}</details>}
    </section>
    <form className="question-review-form" onSubmit={event => { event.preventDefault(); void perform("save"); }}>
      <h4>Valutazione scientifica privata</h4>
      <p>Controlla ipotesi, formule, passaggi, unità e unicità della risposta. Le osservazioni e la decisione restano riservate al docente.</p>
      {bindingChanged && <p>Il quesito è cambiato rispetto alla revisione salvata. Verifica il contenuto e salva una nuova revisione su questa versione.</p>}
      {comparison && <section aria-label="Revisione corrente salvata"><h5>Revisione corrente salvata</h5>
        {saved ? <><p>{reviewLabels[saved.status]} · versione {saved.questionVersion}</p><p className="physics-bank-prompt">{saved.notes}</p></>
          : <p>Nessuna revisione salvata.</p>}</section>}
      <label>Osservazioni della revisione<textarea rows={5} maxLength={2000} value={notes} disabled={busy}
        onChange={event => { setNotes(event.target.value); setConfirmed(false); setMessage(""); }} /></label>
      <label>Esito scientifico<select value={status} disabled={busy}
        onChange={event => { setStatus(event.target.value as ReviewStatus); setConfirmed(false); setMessage(""); }}>
        {Object.entries(reviewLabels).map(([value, title]) => <option value={value} key={value}>{title}</option>)}
      </select></label>
      <div className="physics-bank-actions"><button className="button-primary" disabled={busy || conflict || !notes.trim() || (!dirty && Boolean(saved) && !freshReviewRequired)}>
        {busy ? "Operazione in corso…" : freshReviewRequired ? "Salva nuova revisione privata" : "Salva revisione privata"}</button>
        <span>{dirty ? "Modifiche da salvare" : saved ? "Revisione salvata" : "Nessuna revisione salvata"}</span></div>
    </form>
    <section className="question-review-publication" aria-label="Pubblicazione editoriale">
      <h4>Pubblicazione per questa edizione</h4>
      <p role="status">{detail.state.servable ? "Pubblicato: disponibile agli studenti di questa edizione." : "Non pubblicato: il quesito non è disponibile agli studenti."}</p>
      {detail.state.servable ? <form onSubmit={event => { event.preventDefault(); void perform("revoke"); }}>
        <label>Motivo della revoca<input value={reason} maxLength={2000} disabled={busy} onChange={event => setReason(event.target.value)} /></label>
        <button type="submit" disabled={busy || !reason.trim()}>Revoca pubblicazione</button>
      </form> : <>
        <p>Una valutazione positiva salvata non pubblica il quesito. La pubblicazione richiede una conferma separata.</p>
        {wasRevoked && <p>La pubblicazione legata a questa revisione è stata revocata. Salva una nuova revisione prima di pubblicare ancora.</p>}
        {!publishOpen ? <button type="button" disabled={busy || !canPublish} onClick={() => setPublishOpen(true)}>Prepara pubblicazione</button>
          : <div className="question-review-confirm"><label><input type="checkbox" checked={confirmed} disabled={busy || !canPublish}
            onChange={event => setConfirmed(event.target.checked)} />Confermo la pubblicazione di questa versione agli studenti dell’edizione.</label>
            <button type="button" disabled={busy || !canPublish || !confirmed} onClick={() => void perform("publish")}>Pubblica il quesito</button>
            <button type="button" disabled={busy} onClick={() => { setPublishOpen(false); setConfirmed(false); }}>Annulla</button></div>}
      </>}
    </section>
    {error && <ErrorNotice message={error} />}
    {conflict && <button type="button" disabled={busy} onClick={() => void perform("reload")}>Carica la revisione corrente</button>}
    {message && <p role="status">{message}</p>}
    <details className="question-review-history"><summary>Storico privato della revisione e della pubblicazione</summary>
      {history ? <><h4>Revisioni scientifiche</h4>{history.reviews.length ? <ol>{history.reviews.map(review =>
        <li key={review.reviewId}><strong>{reviewLabels[review.status]}</strong> · versione {review.questionVersion}
          <p className="physics-bank-prompt">{review.notes}</p></li>)}</ol> : <p>Nessuna revisione salvata.</p>}
        <h4>Decisioni editoriali</h4>{history.approvals.length ? <ol>{history.approvals.map(approval =>
          <li key={approval.approvalId}><strong>{approval.editorialStatus === "PUBLISHED" ? "Pubblicato" : approval.editorialStatus === "REVOKED" ? "Revocato" : "Non pubblicato"}</strong>
            <p>{approval.motivation}</p>{approval.revocationReason && <p>Revoca: {approval.revocationReason}</p>}</li>)}</ol>
          : <p>Nessuna decisione editoriale.</p>}</> : <p>Carico lo storico…</p>}
    </details>
  </article>;
}

function ReviewQueue({ editionId, bankId }: { editionId: string; bankId: string }) {
  const base = `/editions/${encodeURIComponent(editionId)}/question-banks/${encodeURIComponent(bankId)}`;
  const [page, setPage] = useState<Queue | null>(null);
  const [filters, setFilters] = useState({ unitId: "", difficulty: "", format: "", pending: "true", q: "" });
  const [search, setSearch] = useState("");
  const [cursors, setCursors] = useState<(string | null)[]>([null]);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const cursor = cursors[cursors.length - 1];
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ limit: "20", pending: filters.pending });
    for (const field of ["unitId", "difficulty", "format", "q"] as const) if (filters[field]) params.set(field, filters[field]);
    if (cursor) params.set("after", cursor);
    setPage(null); setError("");
    void studyRequest<Queue>(`${base}/review/questions?${params}`, undefined, { signal: controller.signal })
      .then(value => { if (!controller.signal.aborted) setPage(value); })
      .catch(failure => { if (!controller.signal.aborted) setError(reviewError(failure)); });
    return () => controller.abort();
  }, [base, filters, cursor, refresh]);
  function filter(field: keyof typeof filters, value: string) {
    setFilters(previous => ({ ...previous, [field]: value })); setCursors([null]);
  }
  return <section className="physics-bank" aria-label="Revisione scientifica privata">
    <header><h2>Rivedi, poi decidi se pubblicare.</h2><p>La coda e le osservazioni sono private. Il materiale originale resta immutato; ogni decisione riguarda una versione precisa in questa edizione.</p></header>
    <form className="physics-bank-filters" onSubmit={event => { event.preventDefault(); filter("q", search); }}>
      <label>Argomento della revisione<select value={filters.unitId} disabled={busy} onChange={event => filter("unitId", event.target.value)}>
        <option value="">Tutti gli argomenti</option>{physicsUnits.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>
      <label>Difficoltà della revisione<select value={filters.difficulty} disabled={busy} onChange={event => filter("difficulty", event.target.value)}>
        <option value="">Tutti i livelli</option>{physicsLevels.map(level => <option key={level}>{level}</option>)}</select></label>
      <label>Formato della revisione<select value={filters.format} disabled={busy} onChange={event => filter("format", event.target.value)}>
        <option value="">Tutti i formati</option><option value="multiple_choice">Scelta multipla</option><option value="completion">Completamento</option></select></label>
      <label>Pubblicazione<select value={filters.pending} disabled={busy} onChange={event => filter("pending", event.target.value)}>
        <option value="true">Non pubblicati</option><option value="false">Tutti i quesiti</option></select></label>
      <label>Cerca nella coda<input value={search} maxLength={120} disabled={busy} onChange={event => setSearch(event.target.value)} /></label>
      <button type="submit" disabled={busy}>Cerca quesiti da revisionare</button>
    </form>
    {error && <ErrorNotice message={error} onRetry={() => setRefresh(value => value + 1)} />}
    {page ? <><p role="status">{page.total} quesiti · pagina {cursors.length}</p>
      <ul className="question-review-queue">{page.items.map(question => <li key={question.id}>
        <button type="button" disabled={busy} aria-pressed={selected === question.id} onClick={() => setSelected(question.id)}>
          <strong>{question.title}</strong><span>{question.taxonomy.unitId} · {question.difficulty.level} · {question.servable ? "Pubblicato" : question.review ? reviewLabels[question.review.status] : "Da revisionare"}</span></button>
      </li>)}</ul>
      {!page.items.length && <p>Nessun quesito con questi filtri.</p>}
      <nav className="physics-bank-actions" aria-label="Pagine della revisione">
        <button disabled={busy || cursors.length === 1} onClick={() => setCursors(previous => previous.slice(0, -1))}>Precedenti</button>
        <button disabled={busy || !page.nextCursor} onClick={() => setCursors(previous => [...previous, page.nextCursor])}>Successivi</button>
      </nav></> : !error && <Loading>Carico la coda privata…</Loading>}
    {selected && <ReviewEditor key={`${editionId}:${bankId}:${selected}`} base={base} questionId={selected}
      onBusy={setBusy} onChange={() => setRefresh(value => value + 1)} />}
  </section>;
}

export function QuestionBankReview({ editionId, bankId = "physics-semestre-2026" }: { editionId: string; bankId?: string }) {
  const [open, setOpen] = useState(false);
  return <details className="disclosure-panel physics-bank-disclosure" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>Revisione scientifica dei quesiti · spazio docente</summary>
    {open && <ReviewQueue key={`${editionId}:${bankId}`} editionId={editionId} bankId={bankId} />}
  </details>;
}
