import { useEffect, useRef, useState } from "react";
import { describeError, studyRequest } from "../api";
import { ErrorNotice } from "./Feedback";
type Result = {
  ratio: number;
  fixedQuantity: string;
  calculatedVariable: string;
  domain: string;
};
export function PhysicsLab() {
  const [radius, setRadius] = useState(1.5),
    [boundary, setBoundary] = useState("pressure"),
    [prediction, setPrediction] = useState("");
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
    setResult(null);
    setChanged(true);
    setError("");
  }
  async function evaluate() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    const current = ++sequence.current;
    controller.current = new AbortController();
    try {
      const value = await studyRequest<Result>(
        "/activities/evaluate",
        {
          activityId: "poiseuille-v1",
          parameters: { radiusRatio: radius, boundary },
        },
        { signal: controller.current.signal },
      );
      if (current === sequence.current) {
        setResult(value);
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
          Un tubo si allarga. La portata aumenta sempre? Parti dal vincolo, poi
          metti alla prova la tua previsione.
        </p>
      </div>
      <div className="lab-layout">
        <div className="lab-experiment">
          <div className="lab-caption">
            <span>Un modello, due situazioni</span>
            <span>Poiseuille</span>
          </div>
          <svg
            viewBox="0 0 560 260"
            role="img"
            aria-label={`Tubo idealizzato con rapporto dei raggi ${radius}`}
          >
            <defs>
              <pattern
                id="lab-grid"
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
            <rect width="560" height="260" fill="url(#lab-grid)" opacity=".2" />
            <path
              d="M0 100H150M0 160H150M410 100H560M410 160H560"
              className="tube-baseline"
            />
            <path
              d={`M150 100Q170 100 190 ${130 - radius * 28}H370Q390 ${130 - radius * 28} 410 100V160Q390 160 370 ${130 + radius * 28}H190Q170 ${130 + radius * 28} 150 160Z`}
              className="tube-body"
            />
            <path
              d="M35 130H125M435 130H525"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="m115 124 10 6-10 6m400-12 10 6-10 6"
              fill="none"
              stroke="currentColor"
            />
            <path
              d={`M280 ${130 - radius * 28}V130`}
              stroke="currentColor"
              strokeDasharray="4 4"
            />
            <text x="294" y={117 - radius * 14}>
              r
            </text>
            <text x="280" y="225" textAnchor="middle">
              r / r₀ = {radius.toLocaleString("it-IT")}
            </text>
            <text x="18" y="68">
              ingresso
            </text>
            <text x="455" y="68">
              uscita
            </text>
          </svg>
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
                    ? "La pressione è fissata. Il rapporto dei raggi compare alla quarta potenza."
                    : "La portata è fissata. Confronta la pressione necessaria nei due tubi."}
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
              onChange={(e) => setPrediction(e.target.value)}
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
              min="0.5"
              max="2"
              step="0.05"
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
          <button className="button-primary" disabled={busy}>
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
          </details>
        </form>
      </div>
    </section>
  );
}
