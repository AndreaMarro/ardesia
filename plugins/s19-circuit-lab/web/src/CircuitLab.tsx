import { useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
} from "@xyflow/react";
import DOMPurify from "dompurify";
import "@xyflow/react/dist/style.css";
import "./style.css";
import {
  defaultDocument,
  transferDocument,
  changed,
  fingerprint,
  type CircuitDocument,
  type Result,
  type Resource,
  type Step,
  type Transport,
} from "./model";

function Junction({ data }: { data: { label: string } }) {
  return (
    <div className="junction">
      <span>{data.label}</span>
      <Handle type="target" position={Position.Top} />
      <b aria-hidden="true">{data.label === "0" ? "⏚" : "●"}</b>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
const nodeTypes = { junction: Junction };
function Svg({ value }: { value: string }) {
  const clean = DOMPurify.sanitize(value, {
    USE_PROFILES: { svg: true },
    FORBID_TAGS: ["image", "use", "a", "foreignObject", "script", "style"],
    FORBID_ATTR: ["style", "href", "xlink:href"],
  });
  return (
    <div
      className="certified-svg"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
const outcomes: Record<string, string> = {
  valid_so_far: "Passaggi supportati corretti fin qui",
  first_invalid: "Un passaggio richiede una correzione",
  not_assessable: "Passaggio non valutabile",
};
const base = "/s19/circuits";
const initialStep: Step = {
  transcription: "Bilancio delle correnti al nodo a",
  operation: "kcl",
  first: "a",
  second: "-R1,+R2",
};
export function CircuitLab({
  editionId,
  request,
  resourceId,
  revisionId,
  canSubmit = true,
  onResource,
}: {
  editionId: string;
  request: Transport;
  resourceId?: string;
  revisionId?: string;
  canSubmit?: boolean;
  onResource?: (r: Resource | null) => void;
}) {
  const [doc, setDoc] = useState<CircuitDocument>(() =>
    structuredClone(defaultDocument),
  );
  const [result, setResult] = useState<Result | null>(null),
    [resource, setResource] = useState<Resource | null>(null);
  const [receipt, setReceipt] = useState<string>(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [denied, setDenied] = useState<false | "expired" | "forbidden">(false),
    [readOnly, setReadOnly] = useState(Boolean(resourceId)),
    [dirty, setDirty] = useState(true);
  const [selected, setSelected] = useState("R2"),
    [stepIndex, setStepIndex] = useState(0);
  const [studentStep, setStudentStep] = useState<Step>(initialStep);
  const [studentSteps, setStudentSteps] = useState<Step[]>([]);
  const [studentPosition, setStudentPosition] = useState(0);
  const generation = useRef(0),
    actionSequence = useRef(0),
    identity = useRef(0),
    scope = useRef(editionId);
  const resourceRef = useRef<Resource | null>(null);
  const acknowledged = useRef<{ editionId: string; resource: Resource | null } | null>(null);
  const key = useRef<{ payload: string; value: string } | null>(null);
  function adoptResource(value: Resource | null) {
    resourceRef.current = value;
    setResource(value);
  }
  function reportResource(value: Resource | null) {
    acknowledged.current = { editionId, resource: value };
    onResource?.(value);
  }
  function hydrateProcedure(value: CircuitDocument) {
    const steps = value.trace?.steps ?? [];
    setStudentSteps(steps);
    setStudentPosition(Math.max(0, steps.length - 1));
    setStudentStep(steps.at(-1) ?? initialStep);
  }
  const editStep = (next: Step) => {
    if (readOnly) return;
    generation.current++;
    setStudentStep(next);
    setStudentSteps((previous) => {
      const steps = [...previous];
      steps[studentPosition] = next;
      return steps;
    });
    setDoc((d) => ({ ...d, trace: null }));
    setResult(null);
    setReceipt("");
    setDirty(true);
  };
  async function documentSnapshot(withStep = false) {
    const steps = studentSteps.length
      ? [...studentSteps]
      : withStep
        ? [studentStep]
        : [];
    if (!steps.length) return doc;
    return {
      ...doc,
      trace: {
        schema: "student-trace.v1" as const,
        circuit_fingerprint: await fingerprint(doc),
        steps,
      },
    };
  }
  const physical = (next: CircuitDocument) => {
    if (readOnly) return;
    generation.current++;
    setDoc(changed(next));
    setResult(null);
    setReceipt("");
    setDirty(true);
    setMessage("Circuito modificato: ricalcola e ricontrolla i passaggi.");
  };
  const draft = (next: CircuitDocument) => {
    if (readOnly) return;
    generation.current++;
    setDoc(next);
    setDirty(true);
    setReceipt("");
  };
  function failure(e: unknown) {
    const error = e as Error & { status?: number };
    if (error.status === 401 || error.status === 403 || error.status === 404 || error.message === "unauthenticated" || error.message === "forbidden") {
      generation.current++;
      setDoc(structuredClone(defaultDocument));
      setResult(null);
      identity.current++;
      key.current = null;
      adoptResource(null);
      hydrateProcedure(defaultDocument);
      setReceipt("");
      setDenied(error.status === 403 || error.status === 404 || error.message === "forbidden" ? "forbidden" : "expired");
    }
    setMessage(
      error.status === 404
        ? "Questa risorsa non è più disponibile. Il riferimento non viene sostituito."
        : error.message === "stale_revision"
        ? "Esiste una revisione più recente. Riaprila prima di salvare."
        : error.message === "s19_invalid_input"
          ? "Controlla valori, morsetti e procedimento: i dati non sono accettati."
          : error.message === "forbidden"
            ? "Questa risorsa non è accessibile al tuo account."
            : error.message === "unauthenticated"
              ? "La sessione Ardesia è scaduta. Accedi dallo spazio corsi."
              : error.message || "Operazione non riuscita. Riprova.",
    );
  }
  async function action(work: (epoch: number) => Promise<void>) {
    const epoch = generation.current;
    const documentIdentity = identity.current;
    const sequence = ++actionSequence.current;
    setBusy(true);
    setMessage("");
    try {
      await work(epoch);
    } catch (e) {
      const error = e as Error & { status?: number };
      if (
        error.status === 401 || error.message === "unauthenticated" ||
        ((error.status === 403 || error.status === 404 || error.message === "forbidden") && documentIdentity === identity.current) ||
        epoch === generation.current
      )
        failure(e);
    } finally {
      if (sequence === actionSequence.current) setBusy(false);
    }
  }
  function current(epoch: number) {
    return epoch === generation.current;
  }
  function idempotency(payload: unknown) {
    const text = JSON.stringify(payload);
    if (key.current?.payload !== text)
      key.current = { payload: text, value: crypto.randomUUID() };
    return key.current.value;
  }
  async function reopen(id: string, revision?: string) {
    await action(async (epoch) => {
      const value = await request<{
        resource: Resource & { editionId: string };
        document: CircuitDocument;
        result: Result | null;
        canRevise: boolean;
      }>(base + "/" + encodeURIComponent(id) +
        (revision === undefined ? "" : "?revisionId=" + encodeURIComponent(revision)));
      if (!current(epoch)) return;
      if (value.resource.id !== id || value.resource.editionId !== editionId ||
          (revision !== undefined && value.resource.revisionId !== revision))
        throw new Error("La revisione ricevuta non corrisponde al riferimento richiesto.");
      generation.current++;
      setDoc(value.document);
      identity.current++;
      adoptResource(value.resource);
      hydrateProcedure(value.document);
      setResult(value.result);
      setReadOnly(value.canRevise !== true);
      setDirty(false);
      setStepIndex(0);
      setMessage(
        value.result
          ? "Revisione Core riaperta; verifiche ricalcolate da Kirchhoff."
          : "Input e note riaperti. La verifica non è disponibile con il motore attuale.",
      );
      reportResource(value.resource);
    });
  }
  useEffect(() => {
    // L'host può riconoscere un salvataggio o una nuova copia senza sostituire
    // la bozza più recente con un caricamento o con il documento iniziale.
    const ack = acknowledged.current;
    acknowledged.current = null;
    if (scope.current === editionId && ack?.editionId === editionId &&
        ack.resource?.id === resourceId &&
        (revisionId === undefined || ack.resource?.revisionId === revisionId))
      return;
    scope.current = editionId;
    actionSequence.current++;
    setBusy(false);
    identity.current++;
    generation.current++;
    key.current = null;
    setResult(null);
    adoptResource(null);
    setReceipt("");
    setDoc(structuredClone(defaultDocument));
    hydrateProcedure(defaultDocument);
    setDenied(false);
    setReadOnly(Boolean(resourceId));
    setDirty(true);
    if (resourceId) void reopen(resourceId, revisionId);
  }, [editionId, resourceId, revisionId]);
  useEffect(
    () => () => {
      identity.current++;
      generation.current++;
    },
    [],
  );
  async function calculate(withStep = false) {
    if (readOnly) return;
    await action(async (epoch) => {
      const next = await documentSnapshot(withStep);
      if (!current(epoch)) return;
      if (next !== doc) {
        setDoc(next);
        setStudentSteps(next.trace?.steps ?? []);
        setDirty(true);
      }
      const value = await request<Result>(base + "/solve", {
        editionId,
        document: next,
      });
      if (!current(epoch)) return;
      setResult(value);
      setStepIndex(0);
      setMessage(
        withStep
          ? "Controllo del passaggio concluso."
          : "Risultato ricalcolato sul circuito attuale.",
      );
    });
  }
  async function save() {
    if (readOnly) return;
    const documentIdentity = identity.current;
    await action(async (epoch) => {
      const snapshot = await documentSnapshot();
      if (!current(epoch)) return;
      const body = {
        editionId,
        document: snapshot,
        resourceId: resourceRef.current?.id ?? null,
        expectedRevision: resourceRef.current?.revisionId ?? null,
      };
      const value = await request<Resource>(base, body, idempotency(body));
      if (documentIdentity !== identity.current) return;
      // A committed acknowledgement belongs to this document even if newer
      // edits exist. Keep the new revision and retain the unsaved draft.
      adoptResource(value);
      if (current(epoch)) {
        setDoc(snapshot);
        setDirty(false);
        setMessage("Input salvati nella revisione privata Core.");
      } else {
        setDirty(true);
        setMessage("Revisione salvata; restano modifiche da salvare.");
      }
      reportResource(value);
    });
  }
  async function submit() {
    if (readOnly || !canSubmit || !resource || dirty) return;
    await action(async (epoch) => {
      const body = { expectedRevision: resource.revisionId };
      const value = await request<{ receiptId: string }>(
        base + "/" + resource.id + "/submit",
        body,
        idempotency({ resourceId: resource.id, ...body }),
      );
      if (!current(epoch)) return;
      setReceipt(value.receiptId);
      setMessage(
        "Consegna ricevuta dal Core. La review del docente è distinta dai controlli automatici.",
      );
    });
  }
  async function download(format: string) {
    await action(async (epoch) => {
      const value = await request<string>(base + "/export/" + format, {
        editionId,
        document: await documentSnapshot(),
      });
      if (!current(epoch)) return;
      const url = URL.createObjectURL(
        new Blob([value], { type: "text/plain" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `circuito-s19.${format === "spice" ? "cir" : format === "circuitikz" ? "tex" : "json"}`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  async function importFile(file: File | undefined) {
    if (readOnly || !file) return;
    if (file.size > 64000) {
      setMessage("File troppo grande.");
      return;
    }
    await action(async (epoch) => {
      const next = JSON.parse(await file.text());
      const value = await request<Result>(base + "/solve", {
        editionId,
        document: next,
      });
      if (!current(epoch)) return;
      newPrivateDocument(next);
      setResult(value);
      setMessage(
        "Input importati e ricalcolati. Il file non attribuisce permessi o certificazioni.",
      );
    });
  }
  function newPrivateDocument(next: CircuitDocument) {
    generation.current++;
    identity.current++;
    key.current = null;
    setDoc(structuredClone(next));
    hydrateProcedure(next);
    setResult(null);
    adoptResource(null);
    setReadOnly(false);
    setReceipt("");
    setDirty(true);
    setStepIndex(0);
    setSelected("R2");
    reportResource(null);
  }
  const nodeIds = [...new Set(doc.components.flatMap((c) => [c.a, c.b]))];
  const nodes: Node[] = nodeIds.map((id, i) => ({
    id,
    type: "junction",
    data: { label: id },
    position: doc.layout[id] ?? {
      x: i === 0 ? 40 : 350,
      y: i === 2 ? 250 : 40,
    },
    ariaLabel: `Nodo ${id}`,
    draggable: !readOnly,
  }));
  const edges: Edge[] = doc.components.map((c) => ({
    id: c.id,
    source: c.a,
    target: c.b,
    label: `${c.kind === "R" ? "▱" : c.kind === "V" ? "⊕" : "↑"} ${c.id} · ${c.value} ${c.kind === "R" ? "Ω" : c.kind === "V" ? "V" : "A"}${result?.lesson.answer && doc.question.target === c.id ? ` · ${result.lesson.answer.exact} ${result.lesson.answer.unit}` : ""}`,
    markerEnd: { type: MarkerType.ArrowClosed },
    selected: selected === c.id,
    reconnectable: !readOnly,
    interactionWidth: 30,
    ariaLabel: `Ramo ${c.id}, da ${c.a} a ${c.b}`,
    style: {
      stroke: selected === c.id ? "#245e58" : "#8d9790",
      strokeWidth: 2,
    },
    labelStyle: { fontSize: 13, fill: "#163d36" },
    labelBgPadding: [8, 5],
    labelBgBorderRadius: 4,
  }));
  function nodesChanged(changes: NodeChange[]) {
    if (readOnly) return;
    const positions = { ...doc.layout };
    let update = false;
    for (const change of changes)
      if (change.type === "position" && change.position) {
        positions[change.id] = change.position;
        update = true;
      }
    if (update) {
      generation.current++;
      setReceipt("");
      setDoc({ ...doc, layout: positions });
      setDirty(true);
    }
  }
  function reconnect(edge: Edge, connection: Connection) {
    if (readOnly) return;
    if (connection.source === connection.target) {
      setMessage("Collega due nodi distinti.");
      return;
    }
    physical({
      ...doc,
      components: doc.components.map((c) =>
        c.id === edge.id
          ? { ...c, a: connection.source, b: connection.target }
          : c,
      ),
    });
  }
  function connect(connection: Connection) {
    if (readOnly) return;
    if (connection.source === connection.target || doc.components.length >= 32)
      return;
    let id = 1;
    while (doc.components.some((c) => c.id === "R" + id)) id++;
    physical({
      ...doc,
      components: [
        ...doc.components,
        {
          id: "R" + id,
          kind: "R",
          a: connection.source,
          b: connection.target,
          value: "100",
        },
      ],
    });
    setSelected("R" + id);
  }
  const component =
    doc.components.find((c) => c.id === selected) ?? doc.components[0];
  const lesson = result?.lesson,
    step = lesson?.steps?.[stepIndex];
  if (denied)
    return (
      <main className="s19">
        <a href="/?view=courses">← Torna ad Ardesia</a>
        <h1>{denied === "forbidden" ? "Accesso non disponibile" : "Sessione scaduta"}</h1>
        <p role="alert">{message}</p>
      </main>
    );
  return (
    <main className="s19">
      <header className="lab-header">
        <a className="wordmark" href="/?view=courses">
          ardesia<span>.</span>
        </a>
        <span>LABORATORIO / ELETTROTECNICA</span>
        <a href="/?view=courses">Torna ai corsi ↗</a>
      </header>
      <section className="intro">
        <div>
          <p className="eyebrow">01 — NODI E CORRENTI</p>
          <h1>
            Il circuito, passo
            <br />
            dopo passo.
          </h1>
          <p>
            Prevedi una grandezza. Scrivi il bilancio delle correnti.
            <br />
            Verifica il tuo ragionamento sul circuito che hai costruito.
          </p>
        </div>
        <aside>
          <span className="status">DC · LEZIONE IN REVISIONE</span>
          <p>
            Resistori e generatori ideali indipendenti.
            <br />
            Valori in unità SI, calcolo esatto.
          </p>
          <button
            onClick={() => {
              newPrivateDocument(transferDocument);
              setMessage("Nuovo circuito: formula una previsione e salva una nuova risorsa privata.");
            }}
          >
            Affronta un circuito nuovo ↗
          </button>
        </aside>
      </section>
      {readOnly && resource && (
        <section aria-label="Revisione in sola lettura">
          <h2>Revisione in sola lettura</h2>
          <p>Stai leggendo la fonte esatta. Puoi consultarla ed esportarla, oppure creare una copia privata da modificare.</p>
          <button disabled={busy} onClick={() => {
            newPrivateDocument(doc);
            setMessage("Copia privata da salvare. La revisione originale è conservata.");
          }}>Crea una copia privata</button>
        </section>
      )}
      <div className="lab-grid">
        <section className="workbench">
          <div className="section-head">
            <h2>1. Esplora e modifica</h2>
            <span>
              {nodeIds.length} nodi · {doc.components.length} rami
            </span>
          </div>
          <p className="caption">
            Ogni collegamento è un componente. La freccia indica il verso di
            riferimento; nodi uguali hanno lo stesso potenziale.
          </p>
          <div className="flow-stage" aria-label="Rete circuitale modificabile">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={nodesChanged}
              onEdgeClick={(_, e) => setSelected(e.id)}
              onReconnect={reconnect}
              onConnect={connect}
              nodesDraggable={!readOnly}
              nodesConnectable={!readOnly}
              edgesReconnectable={!readOnly}
              fitView
              minZoom={0.4}
              maxZoom={2}
              deleteKeyCode={null}
              nodesFocusable
              edgesFocusable
            >
              <Background color="#d5dcd6" gap={22} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
          <div className="component-editor">
            <label>
              Ramo
              <select
                aria-label="Ramo"
                value={component.id}
                onChange={(e) => setSelected(e.target.value)}
              >
                {doc.components.map((c) => (
                  <option key={c.id}>{c.id}</option>
                ))}
              </select>
            </label>
            <label>
              Valore (
              {component.kind === "R"
                ? "Ω"
                : component.kind === "V"
                  ? "V"
                  : "A"}
              )
              <input
                aria-label="Valore componente"
                disabled={readOnly}
                value={component.value}
                onChange={(e) =>
                  physical({
                    ...doc,
                    components: doc.components.map((c) =>
                      c.id === component.id
                        ? { ...c, value: e.target.value }
                        : c,
                    ),
                  })
                }
              />
            </label>
            {(["a", "b"] as const).map((terminal, i) => (
              <label key={terminal}>
                {i === 0 ? "Dal nodo" : "Al nodo"}
                <select
                  aria-label={i === 0 ? "Dal nodo" : "Al nodo"}
                  disabled={readOnly}
                  value={component[terminal]}
                  onChange={(e) =>
                    physical({
                      ...doc,
                      components: doc.components.map((c) =>
                        c.id === component.id
                          ? { ...c, [terminal]: e.target.value }
                          : c,
                      ),
                    })
                  }
                >
                  {nodeIds.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <p className="caption">
            Trascina un nodo o un estremo del ramo. Per tastiera e touch puoi
            anche scegliere i morsetti qui sopra. Collegare due maniglie
            aggiunge un resistore da 100 Ω.
          </p>
          <details>
            <summary>Netlist e riferimenti</summary>
            <pre>
              {doc.components
                .map(
                  (c) =>
                    `${c.id}: ${c.a} → ${c.b}, ${c.value} ${{ R: "ohm", V: "volt", I: "ampere" }[c.kind]}`,
                )
                .join("\n")}
            </pre>
          </details>
        </section>
        <section className="reasoning">
          <h2>2. Prima di calcolare</h2>
          <div className="question">
            <label>
              Grandezza
              <select
                aria-label="Grandezza"
                disabled={readOnly}
                value={doc.question.quantity}
                onChange={(e) =>
                  physical({
                    ...doc,
                    question: {
                      ...doc.question,
                      quantity: e.target.value as "voltage" | "current",
                    },
                  })
                }
              >
                <option value="voltage">Tensione (V)</option>
                <option value="current">Corrente (A)</option>
              </select>
            </label>
            <label>
              Componente
              <select
                aria-label="Componente richiesto"
                disabled={readOnly}
                value={doc.question.target}
                onChange={(e) =>
                  physical({
                    ...doc,
                    question: { ...doc.question, target: e.target.value },
                  })
                }
              >
                {doc.components.map((c) => (
                  <option key={c.id}>{c.id}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            La tua previsione, con il verso
            <input
              aria-label="Previsione"
              disabled={readOnly}
              placeholder="Per esempio: positiva, tra 0 e 12 V…"
              value={doc.prediction}
              onChange={(e) => draft({ ...doc, prediction: e.target.value })}
            />
          </label>
          <button
            className="primary"
            disabled={busy || readOnly}
            onClick={() => void calculate()}
          >
            Calcola e mostra le equazioni
          </button>
          <hr />
          <h2>3. Scrivi un passaggio</h2>
          {studentSteps.length > 0 && (
            <nav className="procedure-nav" aria-label="Procedimento scritto">
              {studentSteps.map((_, i) => (
                <button
                  key={i}
                  aria-current={studentPosition === i ? "step" : undefined}
                  onClick={() => {
                    setStudentPosition(i);
                    setStudentStep(studentSteps[i]);
                  }}
                >
                  Passaggio {i + 1}
                </button>
              ))}
              {studentSteps.length < 32 && (
                <button
                  disabled={readOnly}
                  onClick={() => {
                    generation.current++;
                    const next = {
                      ...initialStep,
                      transcription: "",
                      second: "",
                    };
                    setStudentPosition(studentSteps.length);
                    setStudentSteps([...studentSteps, next]);
                    setStudentStep(next);
                    setResult(null);
                    setDirty(true);
                    setReceipt("");
                  }}
                >
                  Aggiungi passaggio
                </button>
              )}
            </nav>
          )}
          <p className="caption">
            KCL al nodo a: indica i rami con segno, per esempio −R1,+R2. La
            prosa libera non viene interpretata automaticamente.
          </p>
          <label>
            Operazione
            <select
              aria-label="Operazione"
              disabled={readOnly}
              value={studentStep.operation}
              onChange={(e) => {
                editStep({ ...studentStep, operation: e.target.value });
              }}
            >
              <option value="kcl">KCL · bilancio delle correnti</option>
              <option value="tensione">Valore di una tensione</option>
              <option value="corrente">Valore di una corrente</option>
              <option value="ohm-tensione">
                Ohm · tensione = corrente × R
              </option>
              <option value="serie">Resistori in serie</option>
              <option value="parallelo">Resistori in parallelo</option>
              <option value="altro">Altro metodo · non valutabile</option>
            </select>
          </label>
          <div className="question">
            <label>
              Nodo o primo componente
              <input
                aria-label="Primo riferimento"
                disabled={readOnly}
                value={studentStep.first}
                onChange={(e) => {
                  editStep({ ...studentStep, first: e.target.value });
                }}
              />
            </label>
            <label>
              Rami con segno o riferimento
              <input
                aria-label="Secondo riferimento"
                disabled={readOnly}
                value={studentStep.second}
                onChange={(e) => {
                  editStep({ ...studentStep, second: e.target.value });
                }}
              />
            </label>
          </div>
          <label>
            Valore esatto, se richiesto
            <input
              aria-label="Valore del passaggio"
              disabled={readOnly}
              value={studentStep.claimed_value ?? ""}
              onChange={(e) => {
                editStep({ ...studentStep, claimed_value: e.target.value });
              }}
              placeholder="8 oppure 1/25"
            />
          </label>
          <label>
            Il passaggio che vuoi controllare
            <textarea
              aria-label="Trascrizione"
              disabled={readOnly}
              value={studentStep.transcription}
              onChange={(e) => {
                editStep({ ...studentStep, transcription: e.target.value });
              }}
            />
          </label>
          <button disabled={busy || readOnly} onClick={() => void calculate(true)}>
            Verifica il passaggio
          </button>
          {result?.diagnosis && (
            <div
              className={"diagnosis " + result.diagnosis.outcome}
              role="status"
            >
              <b>
                {outcomes[result.diagnosis.outcome] ?? result.diagnosis.outcome}
              </b>
              <p>{result.diagnosis.message}</p>
              <small>
                Questo esito riguarda i soli passaggi supportati, non l'intero
                procedimento.
              </small>
            </div>
          )}
        </section>
      </div>
      <p className="operation-message" role="status">
        {busy ? "Operazione in corso…" : message}
      </p>
      {lesson && (
        <section className="lesson">
          <div className="section-head">
            <h2>4. Confronta con le equazioni</h2>
            {lesson.answer && (
              <strong className="answer" data-testid="answer">
                {lesson.answer.exact} {lesson.answer.unit}
                <small>Riferimento {lesson.answer.reference}</small>
              </strong>
            )}
          </div>
          {lesson.outcome !== "solved" ? (
            <p role="alert">
              Non risolto:{" "}
              {lesson.message ??
                "Il circuito non rientra nel percorso disponibile."}
            </p>
          ) : (
            <div className="lesson-grid">
              <nav aria-label="Passi della soluzione">
                {lesson.steps?.map((s, i) => (
                  <button
                    key={i}
                    className={i === stepIndex ? "active" : ""}
                    aria-current={i === stepIndex ? "step" : undefined}
                    onClick={() => setStepIndex(i)}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </button>
                ))}
              </nav>
              {step && (
                <article>
                  <h3>{step.title}</h3>
                  <p>{step.explanation}</p>
                  <Svg value={step.svg} />
                  {step.equations?.length > 0 && (
                    <pre>{step.equations.join("\n")}</pre>
                  )}
                </article>
              )}
            </div>
          )}
          <details>
            <summary>Provenienza e limiti della verifica</summary>
            <p>
              Motore Kirchhoff: <code>{lesson.source_sha}</code>. Claim
              elettrico: {lesson.verification?.electrical_claim ?? "nessuno"};
              backend: {lesson.verification?.backend ?? "nessuno"}. Product
              Verified: no. La revisione scientifica della lezione resta
              distinta.
            </p>
            <p>
              Impronta del circuito: <code>{result?.fingerprint}</code>
            </p>
          </details>
        </section>
      )}
      <section className="persistence">
        <div>
          <h2>5. Conserva e consegna</h2>
          <p>
            Le revisioni vivono nel tuo spazio Ardesia. La consegna invia al
            Core la fonte esatta e i controlli ricalcolati.
          </p>
          <label>
            Note sul ragionamento
            <textarea
              aria-label="Note"
              disabled={readOnly}
              value={doc.notes}
              onChange={(e) => draft({ ...doc, notes: e.target.value })}
            />
          </label>
        </div>
        <div className="save-controls">
          <button
            className="primary"
            disabled={busy || readOnly}
            onClick={() => void save()}
          >
            Salva revisione Core
          </button>
          {canSubmit && <button
            disabled={busy || readOnly || !resource || dirty}
            onClick={() => void submit()}
          >
            Consegna al docente
          </button>}
          {resource && (
            <>
              <p>
                Revisione: <code>{resource.revisionId}</code>
                {dirty ? " · modifiche non salvate" : ""}
              </p>
              <button disabled={busy} onClick={() => void reopen(resource.id, resource.revisionId)}>
                Riapri dal Core
              </button>
            </>
          )}
          {receipt && (
            <p data-testid="receipt">
              Ricevuta Core: <code>{receipt}</code>
            </p>
          )}
        </div>
      </section>
      <footer>
        <div className="exports">
          <button disabled={busy} onClick={() => void download("json")}>
            Esporta input JSON
          </button>
          <button disabled={busy} onClick={() => void download("spice")}>
            SPICE DC
          </button>
          <button disabled={busy} onClick={() => void download("circuitikz")}>
            CircuitikZ
          </button>
          <label className="import">
            Riapri input JSON
            <input
              type="file"
              accept="application/json,.json"
              aria-label="Importa circuito JSON"
              disabled={busy || readOnly}
              onChange={(e) => void importFile(e.target.files?.[0])}
            />
          </label>
        </div>
        <p>
          Una nuova domanda richiede una nuova verifica. AC e Laplace hanno
          percorsi separati nel motore e non sono inclusi in questa lezione.
        </p>
      </footer>
    </main>
  );
}
