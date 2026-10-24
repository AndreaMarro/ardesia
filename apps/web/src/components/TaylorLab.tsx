import { useEffect, useRef, useState } from "react";
import { describeError, studyRequest } from "../api";
import type { ActivityCommit } from "../course";
import { readResourceDraft, writeResourceDraft } from "./sessionDraftCache";
import { requestKey } from "../api";
import { ErrorNotice } from "./Feedback";
import { readTaylorResult, TaylorPlot, type TaylorResult } from "./TaylorPlot";
export function TaylorLab({
  onCommit,
  draftKey,
}: {
  onCommit: (value: ActivityCommit | null) => void;
  draftKey?: string;
}) {
  const saved = useRef(
    draftKey
      ? (JSON.parse(readResourceDraft(draftKey)?.text ?? "null") as {
          x: string;
          degree: string;
          prediction: string;
        } | null)
      : null,
  );
  const [x, setX] = useState(saved.current?.x ?? "0.5"),
    [degree, setDegree] = useState(saved.current?.degree ?? "3"),
    [prediction, setPrediction] = useState(saved.current?.prediction ?? "");
  const [result, setResult] = useState<TaylorResult | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const generation = useRef(0),
    pending = useRef(false),
    controller = useRef<AbortController | null>(null),
    mounted = useRef(true);
  useEffect(() => {
    if (draftKey)
      writeResourceDraft(draftKey, {
        text: JSON.stringify({ x, degree, prediction }),
        key: requestKey(),
      });
  }, [draftKey, x, degree, prediction]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
      controller.current?.abort();
    };
  }, []);
  const valid =
    x.trim() !== "" &&
    degree.trim() !== "" &&
    Number.isFinite(Number(x)) &&
    Number(x) >= -1 &&
    Number(x) <= 1 &&
    Number.isInteger(Number(degree)) &&
    Number(degree) >= 0 &&
    Number(degree) <= 12;
  function change(update: () => void) {
    update();
    generation.current++;
    controller.current?.abort();
    setResult(null);
    setError("");
    onCommit(null);
  }
  async function evaluate() {
    if (pending.current || !valid || !prediction.trim()) return;
    pending.current = true;
    setBusy(true);
    setError("");
    const current = ++generation.current;
    const parameters = { x: Number(x), degree: Number(degree) };
    controller.current = new AbortController();
    try {
      const response = await studyRequest<unknown>(
        "/activities/evaluate",
        { activityId: "taylor-exp-v1", parameters },
        { signal: controller.current.signal },
      );
      if (current !== generation.current || !mounted.current) return;
      const value = readTaylorResult(response, parameters);
      setResult(value);
      onCommit({
        activityId: "taylor-exp-v1",
        parameters,
        prediction: prediction.trim(),
      });
    } catch (failure) {
      if (current === generation.current && mounted.current)
        setError(
          describeError(
            failure,
            "Il confronto non è disponibile. La tua previsione resta qui.",
          ),
        );
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  const format = (value: number) =>
    value.toLocaleString("it-IT", { maximumSignificantDigits: 9 });
  return (
    <section className="physics-lab taylor-lab" aria-labelledby="taylor-title">
      <div className="lab-introduction">
        <p className="section-meta">Analisi 1 · banco originale DRAFT</p>
        <h2 id="taylor-title">Quanto basta per approssimare?</h2>
        <p>
          Scegli un grado. Prevedi il valore e spiega come controlleresti il
          resto, poi confronta il polinomio con il modello.
        </p>
      </div>
      <div className="lab-layout">
        <div className="lab-experiment">
          <div className="lab-caption">
            <span>Maclaurin di exp</span>
            <span>Centro 0</span>
          </div>
          {result && <TaylorPlot result={result} x={Number(x)} />}
          <div className="lab-result" aria-live="polite" aria-busy={busy}>
            {result ? (
              <>
                <span>
                  Polinomio di grado {result.degree} · {result.terms} termini
                </span>
                <strong>
                  Pₙ({x}) = {format(result.value)}
                </strong>
                <p>
                  Maggiorante conservativo |Rₙ| ≤{" "}
                  {format(result.remainderBound)}
                </p>
                {result.absoluteError !== undefined && <p>Scarto numerico rispetto a exp del Core: {format(result.absoluteError)}. Il maggiorante resta un controllo distinto.</p>}
                <p>
                  Controllo numerico DRAFT. Il procedimento e la dimostrazione
                  del limite richiedono la verifica del tutor.
                </p>
              </>
            ) : (
              <>
                <span>Prima una previsione. Poi il confronto.</span>
                <p>
                  Modificando un dato, il risultato precedente viene rimosso.
                </p>
              </>
            )}
          </div>
        </div>
        <form
          className="lab-controls"
          onSubmit={(event) => {
            event.preventDefault();
            void evaluate();
          }}
        >
          <label>
            La tua previsione e il controllo del resto
            <textarea
              aria-label="La tua previsione e il controllo del resto"
              rows={3}
              maxLength={1000}
              value={prediction}
              onChange={(event) =>
                change(() => setPrediction(event.target.value))
              }
            />
          </label>
          <label>
            Argomento x
            <input
              type="number"
              min={-1}
              max={1}
              step="any"
              value={x}
              onChange={(event) => change(() => setX(event.target.value))}
            />
          </label>
          <label>
            Grado del polinomio
            <input
              type="number"
              min={0}
              max={12}
              step={1}
              value={degree}
              onChange={(event) => change(() => setDegree(event.target.value))}
            />
          </label>
          <div className="taylor-degree-steps" role="group" aria-label="Costruzione per gradi">
            <button type="button" disabled={!valid || Number(degree) === 0} onClick={() => change(() => setDegree(String(Number(degree) - 1)))}>Grado precedente</button>
            <button type="button" disabled={!valid || Number(degree) === 12} onClick={() => change(() => setDegree(String(Number(degree) + 1)))}>Grado successivo</button>
          </div>
          {!valid && (
            <p role="alert">Scegli x tra −1 e 1 e un grado intero da 0 a 12.</p>
          )}
          <button
            className="button-primary"
            disabled={busy || !valid || !prediction.trim()}
          >
            {busy
              ? "Confronto in corso…"
              : "Registra la previsione e confronta"}
          </button>
          {error && <ErrorNotice message={error} />}
          <details>
            <summary>Ipotesi e limiti del banco</summary>
            <p>
              {result?.domain ??
                "Exp reale, centro zero, −1 ≤ x ≤ 1, grado intero 0–12. Maggiorante di Lagrange con M=1 sul segmento negativo e M=3 sul positivo, incluso arrotondamento del polinomio."}
            </p>
            <p>
              Il calcolo non approva il ragionamento scritto. Revisione
              scientifica umana: da eseguire.
            </p>
          </details>
        </form>
      </div>
    </section>
  );
}
