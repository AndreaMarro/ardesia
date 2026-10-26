import { useEffect, useRef, useState } from "react";
import { describeError, requestKey, studyRequest } from "../../api";
import type { StudyResource, Workspace } from "../../api";
import { subscribeStudySessionEnd } from "../../../../studio/src/study/sessionBoundary";
import { ErrorNotice, Loading } from "../../components/Feedback";
import { EquationInput } from "./EquationInput";
import { runCas } from "./casClient";
import type { CasInput, CasResult } from "./cas";
import {
  decodeWorksheet,
  initialInput,
  sameBinding,
  WORKSHEET_KIND,
} from "./worksheet";
import type { Binding, Worksheet } from "./worksheet";
import notices from "./THIRD_PARTY_NOTICES.txt?url";
type Detail = {
  questionVersion: number;
  contentSha256: string;
  question: {
    title: string;
    prompt: string;
    answer: { text: string; unit: string };
  };
};
type Saved = { resource: StudyResource; worksheet: Worksheet };
const example = {
  left: "\\frac{x}{x}",
  right: "1",
  values: "x=2",
  differentiate: "x",
  domain: "x reale e diverso da zero. Unità da verificare separatamente.",
};

export default function CasWorkbench({
  base,
  questionId,
  onClose,
}: {
  base: string;
  questionId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null),
    [input, setInput] = useState<CasInput>(initialInput),
    [notes, setNotes] = useState("");
  const [result, setResult] = useState<CasResult | null>(null),
    [saved, setSaved] = useState<Saved[]>([]),
    [resource, setResource] = useState<StudyResource | null>(null);
  const [binding, setBinding] = useState<Binding | null>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(""),
    [locked, setLocked] = useState(false);
  const [reload, setReload] = useState(0),
    [dirty, setDirty] = useState(false),
    [conflict, setConflict] = useState(false);
  const job = useRef<AbortController | null>(null),
    pending = useRef(false),
    mounted = useRef(true),
    generation = useRef(0);
  const idempotency = useRef({ text: "", key: "" });
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  const parts = base.split("/"),
    editionId = decodeURIComponent(parts[2]),
    bankId = decodeURIComponent(parts[4]);
  const path = `${base}/review/questions/${encodeURIComponent(questionId)}`;
  const currentBinding = (value: Detail): Binding => ({
    bankId,
    questionId,
    questionVersion: value.questionVersion,
    contentSha256: value.contentSha256,
  });
  const stale = Boolean(
    detail && binding && !sameBinding(binding, currentBinding(detail)),
  );
  function denied(failure: unknown) {
    if (
      failure instanceof Error &&
      ["forbidden", "unauthenticated", "session_changed"].includes(
        failure.message,
      )
    ) {
      job.current?.abort();
      setLocked(true);
      setDetail(null);
      setSaved([]);
      setResult(null);
      setInput(initialInput);
      setNotes("");
      setResource(null);
      setBinding(null);
    }
    setError(
      describeError(
        failure,
        "Operazione non riuscita. La bozza resta qui: riprova.",
      ),
    );
  }
  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    job.current = controller;
    setError("");
    setBusy("Carico il quesito e i fogli privati…");
    void studyRequest<Detail>(path, undefined, { signal: controller.signal })
      .then(async (value) => {
        if (controller.signal.aborted) return;
        setDetail(value);
        setBinding(currentBinding(value));
        setLocked(false);
        const workspace = await studyRequest<Workspace>(
          `/workspace?editionId=${encodeURIComponent(editionId)}`,
          undefined,
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        setSaved(
          workspace.resources
            .filter(
              (item) =>
                item.kind === WORKSHEET_KIND && item.visibility === "private",
            )
            .flatMap((item) => {
              const worksheet = decodeWorksheet(item.text);
              return worksheet &&
                worksheet.source.bankId === bankId &&
                worksheet.source.questionId === questionId
                ? [{ resource: item, worksheet }]
                : [];
            }),
        );
      })
      .catch((failure) => {
        if (!controller.signal.aborted) denied(failure);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy("");
      });
    const unsubscribe = subscribeStudySessionEnd(() => {
      controller.abort();
      job.current?.abort();
      setLocked(true);
      setDetail(null);
      setSaved([]);
      setResult(null);
      setInput(initialInput);
      setNotes("");
    });
    return () => {
      mounted.current = false;
      generation.current++;
      controller.abort();
      job.current?.abort();
      unsubscribe();
    };
    // The parent keys this component to the exact source; no old state crosses banks/questions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, reload]);
  function change(patch: Partial<CasInput>) {
    generation.current++;
    job.current?.abort();
    setBusy("");
    pending.current = false;
    setInput((value) => ({ ...value, ...patch }));
    setResult(null);
    setMessage("");
    setDirty(true);
  }
  async function authorize(signal: AbortSignal) {
    const current = await studyRequest<Detail>(path, undefined, { signal });
    if (signal.aborted) throw new DOMException("Annullato", "AbortError");
    setDetail(current);
    if (!binding || !sameBinding(binding, currentBinding(current)))
      throw new Error("stale_source");
    return current;
  }
  async function calculate() {
    if (pending.current || !detail || stale || locked) return;
    const controller = new AbortController();
    job.current?.abort();
    job.current = controller;
    pending.current = true;
    const snapshot = input,
      epoch = ++generation.current;
    setBusy("Calcolo in corso…");
    setError("");
    setMessage("");
    setResult(null);
    try {
      await authorize(controller.signal);
      const value = await runCas(snapshot, controller.signal);
      if (
        mounted.current &&
        !controller.signal.aborted &&
        epoch === generation.current
      ) {
        setResult(value);
        setDirty(true);
        setMessage(
          "Calcolo terminato. Controlla dominio, unità e interpretazione prima della revisione.",
        );
      }
    } catch (failure) {
      if (!controller.signal.aborted) {
        if (
          failure instanceof Error &&
          [
            "forbidden",
            "unauthenticated",
            "session_changed",
            "stale_source",
          ].includes(failure.message)
        )
          denied(failure);
        else
          setError(
            failure instanceof Error
              ? failure.message
              : "Calcolo non riuscito.",
          );
      }
    } finally {
      if (mounted.current && epoch === generation.current) {
        pending.current = false;
        setBusy("");
      }
    }
  }
  async function save() {
    if (pending.current || !detail || !binding || stale || locked || conflict)
      return;
    const controller = new AbortController();
    job.current?.abort();
    job.current = controller;
    pending.current = true;
    setBusy("Salvo il foglio privato…");
    setError("");
    setMessage("");
    try {
      await authorize(controller.signal);
      const text = JSON.stringify({
        schema: 1,
        source: binding,
        input,
        notes,
        result,
      } satisfies Worksheet);
      if (text.length > 18000) throw new Error("worksheet_too_large");
      if (idempotency.current.text !== text)
        idempotency.current = { text, key: requestKey() };
      const options = {
        signal: controller.signal,
        headers: { "Idempotency-Key": idempotency.current.key },
      };
      const value = resource
        ? await studyRequest<StudyResource>(
            `/resources/${encodeURIComponent(resource.id)}/revise`,
            { expectedRevision: resource.revisionId, text },
            options,
          )
        : await studyRequest<StudyResource>(
            "/resources",
            { editionId, kind: WORKSHEET_KIND, visibility: "private", text },
            options,
          );
      if (controller.signal.aborted) return;
      setResource(value);
      setSaved((list) => [
        {
          resource: value,
          worksheet: { schema: 1, source: binding, input, notes, result: null },
        },
        ...list.filter((item) => item.resource.id !== value.id),
      ]);
      setDirty(false);
      setMessage(
        "Foglio privato salvato nel Core. Puoi riaprirlo dopo il ricaricamento.",
      );
    } catch (failure) {
      if (!controller.signal.aborted) {
        if (failure instanceof Error && failure.message === "stale_revision")
          setConflict(true);
        denied(failure);
      }
    } finally {
      if (mounted.current && !controller.signal.aborted) {
        pending.current = false;
        setBusy("");
      }
    }
  }
  async function reopen(id: string) {
    if (
      pending.current ||
      (dirty &&
        !window.confirm(
          "La bozza non salvata verrà sostituita dal foglio selezionato. Continuare?",
        ))
    )
      return;
    const controller = new AbortController();
    job.current?.abort();
    job.current = controller;
    pending.current = true;
    setBusy("Riapro la revisione corrente…");
    setError("");
    try {
      const current = await studyRequest<Detail>(path, undefined, {
        signal: controller.signal,
      });
      const value = await studyRequest<StudyResource>(
        `/resources/${encodeURIComponent(id)}`,
        undefined,
        { signal: controller.signal },
      );
      if (controller.signal.aborted) return;
      const worksheet = decodeWorksheet(value.text);
      if (
        value.kind !== WORKSHEET_KIND ||
        value.visibility !== "private" ||
        !worksheet ||
        worksheet.source.bankId !== bankId ||
        worksheet.source.questionId !== questionId
      )
        throw new Error("invalid_worksheet");
      setDetail(current);
      setResource(value);
      setBinding(worksheet.source);
      setInput(worksheet.input);
      setNotes(worksheet.notes);
      setResult(null);
      setDirty(false);
      setConflict(false);
      setMessage(
        "Foglio riaperto. Ripeti il calcolo per ottenere un risultato attuale.",
      );
    } catch (failure) {
      if (!controller.signal.aborted) denied(failure);
    } finally {
      if (mounted.current && !controller.signal.aborted) {
        pending.current = false;
        setBusy("");
      }
    }
  }
  function newSheet() {
    if (
      dirty &&
      !window.confirm(
        "Scartare la bozza non salvata e iniziare un nuovo foglio?",
      )
    )
      return;
    generation.current++;
    job.current?.abort();
    pending.current = false;
    setBusy("");
    setInput(initialInput);
    setNotes("");
    setResult(null);
    setResource(null);
    setBinding(detail ? currentBinding(detail) : null);
    setDirty(false);
    setConflict(false);
    setError("");
    setMessage("Nuovo foglio sulla versione corrente.");
  }
  const disabled = Boolean(busy) || locked || stale;
  return (
    <section
      className="aq-workbench"
      aria-label="Laboratorio matematico del revisore"
    >
      <header>
        <div>
          <p className="aq-eyebrow">
            Controprova privata · Cortex Compute Engine 0.152.0
          </p>
          <h3 tabIndex={-1} ref={heading}>
            Metti alla prova il procedimento.
          </h3>
        </div>
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => {
            if (!dirty || window.confirm("Chiudere la bozza non salvata?"))
              onClose();
          }}
        >
          Chiudi laboratorio
        </button>
      </header>
      <p>
        Semplifica espressioni, sostituisci valori e confronta due procedimenti.
        Il risultato è un supporto alla revisione: non attribuisce voti o
        approvazioni.
      </p>
      <p>
        <a href={notices} target="_blank" rel="noreferrer">
          Provenienza e licenze del motore
        </a>
      </p>
      {error && (
        <ErrorNotice
          message={error}
          onRetry={
            !detail && !locked ? () => setReload((n) => n + 1) : undefined
          }
        />
      )}
      {busy && <Loading>{busy}</Loading>}
      {message && <p role="status">{message}</p>}
      {detail && !locked && (
        <>
          <div className="aq-source">
            <strong>{detail.question.title}</strong>
            <p>
              Versione {binding?.questionVersion} · {questionId}
            </p>
            <details>
              <summary>Quesito e risposta di riferimento</summary>
              <p>{detail.question.prompt}</p>
              <p>
                {detail.question.answer.text} · unità:{" "}
                {detail.question.answer.unit || "non indicata"}
              </p>
              <p className="assessment-quality-hash">
                Fonte SHA-256: {binding?.contentSha256}
              </p>
            </details>
          </div>
          {stale && (
            <p role="alert">
              Questo foglio riguarda una versione precedente del quesito. Resta
              consultabile; inizia un nuovo foglio per verificare la versione
              corrente.
            </p>
          )}
          <div className="aq-sheet-actions">
            <button type="button" disabled={Boolean(busy)} onClick={newSheet}>
              Nuovo foglio
            </button>
            <label>
              Fogli privati salvati
              <select
                value=""
                disabled={Boolean(busy)}
                onChange={(event) => {
                  if (event.target.value) void reopen(event.target.value);
                }}
              >
                <option value="">Scegli un foglio da riaprire</option>
                {saved.map((item) => (
                  <option key={item.resource.id} value={item.resource.id}>
                    {item.worksheet.notes.slice(0, 70) ||
                      item.worksheet.input.left}{" "}
                    · v{item.worksheet.source.questionVersion}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p>
            Lettere minuscole per le variabili; angoli in radianti. Le unità si
            controllano separatamente. I valori decimali usano il punto.
          </p>
          <div className="aq-equations">
            <EquationInput
              label="A"
              value={input.left}
              disabled={disabled}
              onChange={(left) => change({ left })}
            />
            <EquationInput
              label="B"
              value={input.right}
              disabled={disabled}
              onChange={(right) => change({ right })}
            />
          </div>
          <div className="aq-parameters">
            <label>
              Valori da sostituire
              <input
                value={input.values}
                disabled={disabled}
                maxLength={512}
                placeholder="x=2; y=3/4"
                onChange={(event) => change({ values: event.target.value })}
              />
            </label>
            <label>
              Derivata di A rispetto a
              <input
                value={input.differentiate}
                disabled={disabled}
                maxLength={1}
                placeholder="x"
                onChange={(event) =>
                  change({ differentiate: event.target.value })
                }
              />
            </label>
          </div>
          <label>
            Ipotesi, dominio e unità dichiarati dal revisore
            <textarea
              rows={3}
              maxLength={1000}
              value={input.domain}
              disabled={disabled}
              onChange={(event) => change({ domain: event.target.value })}
            />
          </label>
          <div className="button-row">
            <button
              type="button"
              disabled={disabled}
              onClick={() => void calculate()}
            >
              Esegui controprova
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => change(example)}
            >
              Esempio: divisione e dominio
            </button>
            {busy === "Calcolo in corso…" && (
              <button
                type="button"
                onClick={() => {
                  generation.current++;
                  job.current?.abort();
                  pending.current = false;
                  setBusy("");
                  setMessage("Calcolo annullato. La bozza è conservata.");
                }}
              >
                Annulla calcolo
              </button>
            )}
          </div>
          {result && (
            <section
              className="aq-results"
              aria-label="Risultato della controprova"
            >
              <h4>
                {result.symbolicZero
                  ? "Scarto simbolico nullo"
                  : "Scarto non ridotto a zero"}
              </h4>
              <p>
                Lo scarto nullo riguarda le forme elaborate dal motore. Non
                dimostra l’uguaglianza su tutti i domini. Lo scarto non nullo
                può richiedere ulteriori trasformazioni.
              </p>
              <div className="aq-result-grid">
                {(["left", "right"] as const).map((key, index) => (
                  <div key={key}>
                    <h5>Espressione {index === 0 ? "A" : "B"}</h5>
                    <dl>
                      <dt>Forma semplificata</dt>
                      <dd>
                        <code>{result[key].exact}</code>
                      </dd>
                      <dt>Approssimazione senza valori</dt>
                      <dd>
                        <code>{result[key].approximate}</code>
                      </dd>
                      <dt>Con i valori sostituiti</dt>
                      <dd>
                        <code>{result[key].atValues}</code>
                      </dd>
                    </dl>
                  </div>
                ))}
              </div>
              <p>
                Scarto A − B: <code>{result.difference}</code>
              </p>
              {result.derivative && (
                <p>
                  Derivata di A: <code>{result.derivative}</code>
                </p>
              )}
              <h5>Restrizioni rilevate prima della semplificazione</h5>
              {result.restrictions.length ? (
                <ul>
                  {result.restrictions.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              ) : (
                <p>Nessuna restrizione rilevata dai controlli supportati.</p>
              )}
              <p>
                Elenco parziale per variabili reali: controlla anche i vincoli
                del problema, gli estremi e le unità. Nessun campionamento
                numerico è una prova di identità.
              </p>
            </section>
          )}
          <label>
            Osservazioni sul foglio
            <textarea
              rows={3}
              value={notes}
              maxLength={1000}
              disabled={disabled}
              onChange={(event) => {
                setNotes(event.target.value);
                setDirty(true);
                setMessage("");
              }}
            />
          </label>
          {conflict && (
            <p role="alert">
              Un’altra scheda ha aggiornato il foglio. La tua bozza è
              conservata: riapri la revisione corrente oppure inizia un nuovo
              foglio.
            </p>
          )}
          <div className="button-row">
            <button
              type="button"
              disabled={disabled || conflict || !dirty}
              onClick={() => void save()}
            >
              Salva foglio privato
            </button>
            <span role="status">
              {dirty
                ? "Modifiche non salvate"
                : resource
                  ? "Revisione Core salvata"
                  : "Nuovo foglio, non salvato"}
            </span>
          </div>
          {resource && (
            <p className="assessment-quality-hash">
              Risorsa {resource.id} · revisione {resource.revisionId}
            </p>
          )}
        </>
      )}
    </section>
  );
}
