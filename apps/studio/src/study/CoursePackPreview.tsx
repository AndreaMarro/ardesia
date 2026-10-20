import { useEffect, useRef, useState } from "react";
import { studyRequest } from "./apiClient";
type Exercise = {
  id: string;
  session?: number;
  activityId: string;
  prompt: string;
  solution?: string;
  answer: { value: number; unit: string };
};
type Pack = {
  title: string;
  scope: string;
  status: string;
  activities: { id: string; title: string }[];
  exercises: Exercise[];
  transferTests: {
    id: string;
    title: string;
    instructions: string;
    items: Exercise[];
  }[];
  reviewRubric: string[];
};
type Parameters = Record<string, string | number>;
type Field = {
  key: string;
  label: string;
  value: string | number;
  options?: [string, string][];
  min?: number;
  max?: number;
  step?: number;
};
const fields: Record<string, Field[]> = {
  "taylor-exp-v1": [
    { key: "x", label: "Argomento x", value: 0.5, min: -1, max: 1, step: 0.01 },
    {
      key: "degree",
      label: "Grado del polinomio",
      value: 3,
      min: 0,
      max: 12,
      step: 1,
    },
  ],
  "poiseuille-v1": [
    {
      key: "radiusRatio",
      label: "Rapporto r/r₀",
      value: 1.5,
      min: 0.1,
      max: 3,
      step: 0.05,
    },
    {
      key: "boundary",
      label: "Vincolo del modello",
      value: "pressure",
      options: [
        ["pressure", "Differenza di pressione fissa"],
        ["flow", "Portata fissa"],
      ],
    },
  ],
  "units-v1": [
    { key: "value", label: "Valore iniziale", value: 1, min: 0, step: 0.01 },
    {
      key: "fromUnit",
      label: "Unità iniziale lineare",
      value: "m",
      options: [
        ["m", "m"],
        ["cm", "cm"],
        ["mm", "mm"],
      ],
    },
    {
      key: "toUnit",
      label: "Unità finale lineare",
      value: "cm",
      options: [
        ["m", "m"],
        ["cm", "cm"],
        ["mm", "mm"],
      ],
    },
    {
      key: "dimension",
      label: "Dimensione geometrica",
      value: 2,
      options: [
        ["2", "Area, fattore al quadrato"],
        ["3", "Volume, fattore al cubo"],
      ],
    },
  ],
  "hydrostatic-v1": [
    {
      key: "density",
      label: "Densità del liquido (kg/m³)",
      value: 1000,
      min: 1,
      max: 20000,
    },
    {
      key: "depth",
      label: "Profondità sotto la superficie (m)",
      value: 1,
      min: 0,
      max: 1000,
      step: 0.1,
    },
    {
      key: "g",
      label: "Accelerazione g (m/s²)",
      value: 9.81,
      min: 0.01,
      max: 30,
      step: 0.01,
    },
    {
      key: "surfacePressure",
      label: "Pressione alla superficie (Pa)",
      value: 101325,
      min: 0,
      max: 2000000,
    },
    {
      key: "reference",
      label: "Pressione da calcolare",
      value: "gauge",
      options: [
        ["gauge", "Incremento dalla superficie"],
        ["absolute", "Pressione assoluta"],
      ],
    },
  ],
  "buoyancy-v1": [
    {
      key: "liquidDensity",
      label: "Densità del liquido (kg/m³)",
      value: 1000,
      min: 1,
      max: 20000,
    },
    {
      key: "objectDensity",
      label: "Densità del corpo (kg/m³)",
      value: 600,
      min: 1,
      max: 30000,
    },
    {
      key: "volume",
      label: "Volume del corpo (m³)",
      value: 0.001,
      min: 0.000001,
      max: 1000,
      step: 0.001,
    },
    {
      key: "g",
      label: "Accelerazione g (m/s²)",
      value: 9.81,
      min: 0.01,
      max: 30,
      step: 0.01,
    },
  ],
};
function defaults(model: string): Parameters {
  return Object.fromEntries(
    fields[model].map((field) => [field.key, field.value]),
  );
}
type Result = {
  remainderBound?: number;
  value?: number;
  ratio?: number;
  unit?: string;
  calculatedVariable: string;
  domain: string;
  regime?: string;
  immersedFraction?: number | null;
};
const format = (value: number) =>
  value.toLocaleString("it-IT", { maximumSignificantDigits: 10 });
export function CoursePackPreview({ editionId }: { editionId?: string } = {}) {
  const [pack, setPack] = useState<Pack | null>(null),
    [model, setModel] = useState<string | null>(null),
    [parameters, setParameters] = useState<Parameters>({});
  const [result, setResult] = useState<Result | null>(null),
    [error, setError] = useState(""),
    [loadError, setLoadError] = useState("");
  const sequence = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setPack(null);
    setModel(null);
    setResult(null);
    setLoadError("");
    studyRequest<Pack>(
      "/coursepack" +
        (editionId ? "?" + new URLSearchParams({ editionId }) : ""),
      undefined,
      { signal: controller.signal },
    )
      .then((value) => {
        if (active) {
          setPack(value);
          const available = value.activities.filter((item) => fields[item.id]);
          const initial =
            available.find((item) => item.id === "units-v1")?.id ??
            available[0]?.id ??
            null;
          setModel(initial);
          setParameters(initial ? defaults(initial) : {});
        }
      })
      .catch(() => {
        if (active) setLoadError("Banco contenuti non disponibile.");
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [editionId]);
  useEffect(() => {
    const current = ++sequence.current;
    setResult(null);
    setError("");
    if (!model) return;
    void studyRequest<Result>("/activities/evaluate", {
      activityId: model,
      parameters,
    })
      .then((value) => {
        if (sequence.current === current) setResult(value);
      })
      .catch(() => {
        if (sequence.current === current)
          setError("Calcolo non disponibile: controlla il dominio o riprova.");
      });
    return () => {
      sequence.current++;
    };
  }, [model, parameters]);
  function change(key: string, value: string | number) {
    setResult(null);
    setParameters((previous) => ({ ...previous, [key]: value }));
  }
  function exercises(items: Exercise[], solutions: boolean) {
    return items.map((item) => (
      <article className="study-postit" key={item.id}>
        <h4>
          {item.id}
          {item.session ? ` · incontro ${item.session}` : ""}
        </h4>
        <p>{item.prompt}</p>
        {solutions && (
          <details>
            <summary>Soluzione proposta DRAFT</summary>
            <p>{item.solution}</p>
            <p>
              {format(item.answer.value)} {item.answer.unit}
            </p>
          </details>
        )}
      </article>
    ));
  }
  if (loadError) return <p role="alert">{loadError}</p>;
  if (!pack) return <p role="status">Caricamento contenuti originali…</p>;
  return (
    <section className="study-lab" aria-label="Banco di revisione contenuti">
      <h2>{pack.title}</h2>
      <p>
        <strong>DRAFT · Revisione scientifica umana: da eseguire</strong>
      </p>
      <p>{pack.scope}</p>
      <p>
        {pack.exercises.length} esercizi originali · {pack.activities.length}{" "}
        attività · {pack.transferTests.length} prove di trasferimento. Controllo
        numerico automatico; nessuna approvazione docente registrata.
      </p>
      <h3>Esplora i modelli del percorso</h3>
      <label>
        Attività da esplorare
        <select
          value={model ?? ""}
          onChange={(event) => {
            setResult(null);
            setModel(event.target.value);
            setParameters(defaults(event.target.value));
          }}
        >
          {pack.activities
            .filter((activity) => fields[activity.id])
            .map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.title}
              </option>
            ))}
        </select>
      </label>
      <div className="study-source-form">
        {(model ? (fields[model] ?? []) : []).map((field) => (
          <label key={field.key}>
            {field.label}
            {field.options ? (
              <select
                value={parameters[field.key]}
                onChange={(event) =>
                  change(
                    field.key,
                    typeof field.value === "number"
                      ? Number(event.target.value)
                      : event.target.value,
                  )
                }
              >
                {field.options.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                min={field.min}
                max={field.max}
                step={field.step ?? 1}
                value={parameters[field.key]}
                onChange={(event) =>
                  change(
                    field.key,
                    event.target.value === "" ? "" : Number(event.target.value),
                  )
                }
              />
            )}
          </label>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="study-result" aria-live="polite">
        {result && (
          <>
            <strong>
              {result.calculatedVariable}:{" "}
              {format(result.value ?? result.ratio ?? 0)} {result.unit ?? ""}
            </strong>
            <p>{result.domain}</p>
            {result.remainderBound !== undefined && (
              <p>
                Maggiorante conservativo del resto:{" "}
                {format(result.remainderBound)}
              </p>
            )}
            {result.regime && (
              <p>
                {result.regime === "sinking"
                  ? "Il peso supera la spinta massima: nessun equilibrio libero di galleggiamento."
                  : result.regime === "neutral"
                    ? "Densità uguali: equilibrio indifferente completamente immerso."
                    : `In equilibrio la frazione immersa è ${format(result.immersedFraction ?? 0)}. La spinta effettiva è uguale al peso, inferiore al massimo.`}
              </p>
            )}
          </>
        )}
      </div>
      <details>
        <summary>{pack.exercises.length} esercizi per revisione</summary>
        {exercises(pack.exercises, true)}
      </details>
      <details>
        <summary>{pack.transferTests.length} prove di trasferimento</summary>
        {pack.transferTests.map((group) => (
          <section key={group.id}>
            <h3>{group.title}</h3>
            <p>{group.instructions}</p>
            {exercises(group.items, false)}
          </section>
        ))}
      </details>
      <details>
        <summary>Rubrica di revisione scientifica</summary>
        <ul>
          {pack.reviewRubric.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          La firma e la decisione umana vanno raccolte sul manifest con hash del
          contenuto. Il percorso tutor sintetico non approva questo materiale.
        </p>
      </details>
    </section>
  );
}
