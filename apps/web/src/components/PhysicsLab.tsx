import { useEffect, useRef, useState } from "react";
import { describeError, studyRequest } from "../api";
import type { ActivityCommit } from "../course";
import { readResourceDraft, writeResourceDraft } from "./sessionDraftCache";
import { requestKey } from "../api";
import { ErrorNotice } from "./Feedback";
import {PoiseuilleModel} from "./PoiseuilleVisual";
import {PublicLessonDemo} from "./PublicLessonDemo";
export {PoiseuilleModel} from "./PoiseuilleVisual";
import { publicActivityResult, publicCaseCount, publicLessonDemo, publicRadius } from "../publicPreview";
type Result = {
  ratio: number;
  fixedQuantity: string;
  calculatedVariable: string;
  domain: string;
};
export function PhysicsLab({
  onCommit,
  draftKey,
  publicPreview = false,
  numericPrediction = false,
}: {
  onCommit?: (value: ActivityCommit | null) => void;
  draftKey?: string;
  publicPreview?: boolean;
  numericPrediction?: boolean;
}) {
  const saved = useRef(
    draftKey
      ? (JSON.parse(readResourceDraft(draftKey)?.text ?? "null") as {
          radius: number;
          boundary: string;
          prediction: string;
        } | null)
      : null,
  );
  const [radius, setRadius] = useState(saved.current?.radius ?? (numericPrediction ? 2 : 1.5)),
    [boundary, setBoundary] = useState(saved.current?.boundary ?? "pressure"),
    [prediction, setPrediction] = useState(saved.current?.prediction ?? "");
  const [result, setResult] = useState<Result | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [changed, setChanged] = useState(false);
  const [graph, setGraph] = useState(false), [help, setHelp] = useState(false), [transfer, setTransfer] = useState(false);
  const predictionNumber = Number(prediction.replace(",", "."));
  const predictionReady = prediction.trim() !== "" && (!numericPrediction || (Number.isFinite(predictionNumber) && predictionNumber > 0));
  const pending = useRef(false),
    sequence = useRef(0),
    controller = useRef<AbortController | null>(null),
    mounted = useRef(true),
    predictionElement = useRef<HTMLInputElement>(null),
    modelDetails = useRef<HTMLDetailsElement>(null),
    resultElement = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (draftKey)
      writeResourceDraft(draftKey, {
        text: JSON.stringify({ radius, boundary, prediction }),
        key: requestKey(),
      });
  }, [draftKey, radius, boundary, prediction]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      sequence.current++;
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (result && window.matchMedia?.("(max-width: 720px)").matches) {
      resultElement.current?.scrollIntoView({ block: "nearest" });
    }
  }, [result]);
  function invalidate() {
    sequence.current++;
    onCommit?.(null);
    setResult(null);
    setChanged(true);
    setError("");
    setGraph(false);
  }
  async function evaluate() {
    if (pending.current || !predictionReady) return;
    pending.current = true;
    setBusy(true);
    setError("");
    const current = ++sequence.current;
    controller.current = new AbortController();
    try {
      const value = publicPreview ? publicActivityResult(radius, boundary) : await studyRequest<Result>(
        "/activities/evaluate",
        {
          activityId: "poiseuille-v1",
          parameters: { radiusRatio: radius, boundary },
        },
        { signal: controller.current.signal },
      );
      if (current === sequence.current) {
        setResult(value);
        onCommit?.({
          activityId: "poiseuille-v1",
          parameters: { radiusRatio: radius, boundary },
          prediction: prediction.trim(),
        });
        setChanged(false);
      }
    } catch (e) {
      if (current === sequence.current)
        setError(
          describeError(
            e,
            "Il calcolo non è disponibile. La tua previsione è ancora qui.",
          ),
        );
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <section className="physics-lab" aria-labelledby="physics-title">
      <div className="lab-introduction">
        <h2 id="physics-title">Che cosa tieni fisso?</h2>
        <p>
          Confronta due tubi cilindrici della stessa lunghezza, con lo stesso
          fluido. Se cambia il raggio, la portata aumenta sempre? Parti dal vincolo.
        </p>
      </div>
      {transfer && <p className="transfer-prompt" role="status">Nuovo problema: la pompa mantiene Q, ma il raggio si dimezza.</p>}
      <div className="lab-layout">
        <div className="lab-experiment">
          <div className="lab-caption">
            <span>Un modello, due situazioni</span>
            <span>Poiseuille</span>
          </div>
          <PoiseuilleModel radius={radius} boundary={boundary} revealed={Boolean(result)} graph={graph} />
          <p>Schema ideale · fluido newtoniano · moto laminare</p>
          <div
            className="lab-result"
            ref={resultElement}
            aria-live="polite"
            aria-busy={busy}
          >
            {result ? (
              <>
                <span>Il modello restituisce</span>
                <strong data-testid="physics-ratio">
                  {result.calculatedVariable} ={" "}
                  {result.ratio.toLocaleString("it-IT", {
                    maximumFractionDigits: 6,
                  })}
                </strong>
                <p>
                  {result.fixedQuantity === "pressure"
                    ? "La differenza di pressione è fissata. Il rapporto dei raggi compare alla quarta potenza."
                    : "La portata è fissata. Confronta la differenza di pressione necessaria nei due tubi."}
                </p>
                {numericPrediction && <p className="prediction-comparison">{Math.abs(predictionNumber - result.ratio) <= Math.max(1e-9, result.ratio * 1e-6)
                  ? "La previsione coincide con il modello. Ora spiega perché il vincolo fa la differenza."
                  : result.fixedQuantity === "pressure" ? "Il raggio entra alla quarta potenza: confronta l’effetto sul raggio con quello sulla portata."
                  : "Q rimane fissata. Isola Δp: la quarta potenza del raggio va al denominatore."}</p>}
              </>
            ) : (
              <>
                <span>
                  {changed
                    ? "Parametri cambiati. Metti di nuovo alla prova la previsione."
                    : "Prima un’idea. Poi il risultato."}
                </span>
                <p>Il risultato compare quando scegli di calcolare.</p>
              </>
            )}
          </div>
        </div>
        <form
          className="lab-controls"
          onSubmit={(e) => {
            e.preventDefault();
            void evaluate();
          }}
        >
          <label>
            {numericPrediction ? "Rapporto previsto" : "La tua previsione"}
            <input
              ref={predictionElement}
              aria-label={numericPrediction ? "Rapporto previsto" : "La tua previsione"}
              inputMode={numericPrediction ? "decimal" : "text"}
              value={prediction}
              onChange={(e) => {
                setPrediction(e.target.value);
                if (onCommit || numericPrediction) invalidate();
              }}
              placeholder={numericPrediction ? (boundary === "pressure" ? "Q/Q₀ = …" : "Δp/Δp₀ = …") : "Che cosa pensi che cambierà?"}
              maxLength={1000}
            />
          </label>
          <label>
            Grandezza fissata
            <select
              value={boundary}
              onChange={(e) => {
                setBoundary(e.target.value);
                invalidate();
                if (numericPrediction) setPrediction("");
              }}
            >
              <option value="pressure">Differenza di pressione Δp</option>
              <option value="flow">Portata Q</option>
            </select>
          </label>
          <label className="range-label">
            Rapporto dei raggi <output>{radius.toLocaleString("it-IT")}</output>
            <input
              aria-label="Rapporto dei raggi"
              type="range"
              min={publicRadius.min}
              max={publicRadius.max}
              step={publicRadius.step}
              value={radius}
              onChange={(e) => {
                setRadius(Number(e.target.value));
                invalidate();
                if (numericPrediction) setPrediction("");
              }}
            />
            <span className="range-ticks">
              <span>0,5 ×</span>
              <span>1 ×</span>
              <span>2 ×</span>
            </span>
          </label>
          <button
            className="button-primary"
            disabled={busy || !predictionReady}
          >
            {busy ? "Calcolo in corso…" : "Metti alla prova"}
          </button>
          {error && <ErrorNotice message={error} />}
          {result && <div className="discovery-actions">
            <button type="button" aria-expanded={graph} onClick={() => setGraph(value => !value)}>{graph ? "Nascondi il grafico" : "Guarda il grafico"}</button>
            <button type="button" aria-expanded={help} onClick={() => setHelp(value => !value)}>Riprendi il vincolo</button>
            <button type="button" onClick={() => {invalidate(); setPrediction("");}}>Prova di nuovo</button>
            <button type="button" className="button-primary" onClick={() => {invalidate(); setRadius(.5); setBoundary("flow"); setPrediction(""); setTransfer(true); setHelp(false); predictionElement.current?.focus();}}>Un problema diverso</button>
          </div>}
          {help && <div className="constraint-recovery">
            <h3>Un passaggio alla volta.</h3>
            {publicPreview && <PublicLessonDemo onShowFormula={() => {if (modelDetails.current) modelDetails.current.open = true;}} />}
            <ol><li>Individua ciò che resta costante: Δp oppure Q.</li><li>Parti da Q = π r⁴ Δp / (8 η L). Se Q resta fissa, isola Δp.</li><li>Confronta i rapporti, mantenendo viscosità e lunghezza costanti.</li></ol>
            <p>Una risposta ottenuta dopo questo aiuto è una risposta assistita. Prova poi una situazione diversa.</p>
          </div>}
          {numericPrediction && <button type="button" className="text-link" onClick={() => {invalidate(); setRadius(2); setBoundary("pressure"); setPrediction(""); setTransfer(false); setHelp(false);}}>Ricomincia l’esperimento</button>}
          <details ref={modelDetails}>
            <summary>Modello e limiti</summary>
            <p className="formula" id={publicPreview ? publicLessonDemo.objectId : undefined}>Q = π r⁴ Δp / (8 η L)</p>
            <p>
              {result?.domain ??
                "Tubo cilindrico rigido, viscosità e lunghezza fissate; fluido incomprimibile, moto laminare stazionario."}
            </p>
            <p className="fine-print">
              Controllo numerico deterministico. Contenuto in revisione
              scientifica prima del pilot.
            </p>
            {publicPreview && (
              <p className="fine-print">
                Questa anteprima esplora {publicCaseCount} configurazioni: tutti i
                risultati sono stati calcolati dal motore scientifico di Ardesia
                durante la preparazione della pagina. Lunghezza e viscosità
                rimangono costanti. La previsione resta in questa pagina; nessuna
                risposta viene inviata a un servizio o salvata come profilo studente.
              </p>
            )}
          </details>
        </form>
      </div>
    </section>
  );
}
