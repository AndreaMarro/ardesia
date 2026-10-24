import { useEffect, useId, useRef, useState } from "react";
import { describeError, studyRequest } from "../api";
import type { ActivityCommit } from "../course";
import { readResourceDraft, writeResourceDraft } from "./sessionDraftCache";
import { requestKey } from "../api";
import { ErrorNotice } from "./Feedback";
import { publicActivityResult, publicCaseCount, publicRadius } from "../publicPreview";
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
}: {
  onCommit?: (value: ActivityCommit | null) => void;
  draftKey?: string;
  publicPreview?: boolean;
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
  const [radius, setRadius] = useState(saved.current?.radius ?? 1.5),
    [boundary, setBoundary] = useState(saved.current?.boundary ?? "pressure"),
    [prediction, setPrediction] = useState(saved.current?.prediction ?? "");
  const [result, setResult] = useState<Result | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [changed, setChanged] = useState(false);
  const pending = useRef(false),
    sequence = useRef(0),
    controller = useRef<AbortController | null>(null),
    mounted = useRef(true),
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
  }
  async function evaluate() {
    if (pending.current || (onCommit && !prediction.trim())) return;
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
      <div className="lab-layout">
        <div className="lab-experiment">
          <div className="lab-caption">
            <span>Un modello, due situazioni</span>
            <span>Poiseuille</span>
          </div>
          <PoiseuilleModel radius={radius} boundary={boundary} />
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
            La tua previsione
            <input
              value={prediction}
              onChange={(e) => {
                setPrediction(e.target.value);
                if (onCommit) invalidate();
              }}
              placeholder="Che cosa pensi che cambierà?"
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
            disabled={busy || Boolean(onCommit && !prediction.trim())}
          >
            {busy ? "Calcolo in corso…" : "Metti alla prova"}
          </button>
          {error && <ErrorNotice message={error} />}
          <details>
            <summary>Modello e limiti</summary>
            <p className="formula">Q = π r⁴ Δp / 8 η L</p>
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
                rimangono costanti. La previsione scritta resta nel browser e non
                viene valutata automaticamente.
              </p>
            )}
          </details>
        </form>
      </div>
    </section>
  );
}

/** The free laboratory and guided episode share the same geometric view. */
export function PoiseuilleModel({ radius, boundary }: {radius: number; boundary: string}) {
  const gridId = useId();
  return <figure className="poiseuille-model">
          <svg
            viewBox="0 0 560 260"
            role="img"
            aria-label={`Due tubi cilindrici con rapporto dei raggi ${radius}`}
          >
            <defs>
              <pattern
                id={gridId}
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M28 0H0V28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth=".3"
                />
              </pattern>
            </defs>
            <rect width="560" height="260" fill={`url(#${gridId})`} opacity=".2" />
            <path d="M25 102H235V158H25Z" className="tube-body" />
            <path
              d={`M325 ${130 - radius * 28}H535V${130 + radius * 28}H325Z`}
              className="tube-body"
            />
            <path
              d="M40 130H220M340 130H520"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="m210 124 10 6-10 6m290-12 10 6-10 6"
              fill="none"
              stroke="currentColor"
            />
            <path
              d={`M430 ${130 - radius * 28}V130M130 102V130`}
              stroke="currentColor"
              strokeDasharray="4 4"
            />
            <text x="444" y={117 - radius * 14}>
              r
            </text>
            <text x="144" y="112">r₀</text>
            <text x="280" y="225" textAnchor="middle">
              r / r₀ = {radius.toLocaleString("it-IT")}
            </text>
            <text x="130" y="54" textAnchor="middle">
              riferimento
            </text>
            <text x="430" y="54" textAnchor="middle">
              confronto
            </text>
          </svg>
    <figcaption>{boundary === "flow" ? "Q è costante: la portata non cambia." : "Δp è costante: confronta la portata."}</figcaption>
  </figure>;
}
