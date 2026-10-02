/** CircuitCheck is a separate deterministic service. This is a wire contract, never a second solver. */
export const CIRCUIT_CHECK_TOOL_ID = "io.ardesia.circuit-reasoning"
export const CIRCUIT_CHECK_EMBED_ID = "circuit-reasoning"

export type CircuitStep = Readonly<{
  title: string
  explanation: string
  svg: string
  equations: string[]
}>

export type CircuitProof = Readonly<{
  schema: "circuit-proof.v2"
  /** Persisted proof is historical until the service re-solves this revision. */
  scope: "electrical_result" | "legacy_unrecorded"
  fingerprint: string
  sourceSha: string
  lessonBuild: string | null
  verification: Readonly<{electrical_claim:"VERIFIED";backend:"CLOSED";lesson:"exact-answer-crosscheck";product_verified:false}> | null
  inputProvenance: Readonly<{source_kind:"image";source_sha256:string;circuit_sha256:string;confirmed_at_unix:number}> | null
  netlist: string
  title: string
  method: string
  answer: Readonly<{ exact: string; unit: string; reference: string }>
  steps: CircuitStep[]
}>

export type CircuitTraceStep = Readonly<{
  transcription: string
  operation: "serie" | "parallelo" | "kcl" | "corrente" | "tensione" | "altro"
  first: string
  second: string
  claimed_value: string | null
  reading: "clear" | "ambiguous" | "unreadable"
}>

export type CircuitDiagnosis = Readonly<{
  outcome: "first_invalid" | "valid_so_far" | "not_assessable"
  step: number | null
  message: string
  focus: string[]
  circuit_fingerprint: string
}>

export type CircuitEmbedState = Readonly<{
  kind: "circuitcheck-proof-v1"
  netlist: string
  method: string
  proof: CircuitProof | null
  selectedStep: number
  trace: CircuitTraceStep[]
  diagnosis: CircuitDiagnosis | null
  pendingErrorId: string | null
}>

export const emptyCircuitState = (): CircuitEmbedState => ({
  kind: "circuitcheck-proof-v1", netlist: "", method: "auto", proof: null,
  selectedStep: 0, trace: [], diagnosis: null,
  pendingErrorId: null,
})

const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v)
const string = (v: unknown, max: number): v is string => typeof v === "string" && v.length <= max

function readProofFields(value: unknown, requestedNetlist: string): Pick<CircuitProof,"fingerprint"|"sourceSha"|"netlist"|"title"|"method"|"answer"|"steps"> {
  if (!object(value)) throw new Error("CircuitCheck non ha restituito una soluzione verificata per questo circuito.")
  if (JSON.stringify(value).length > 1_500_000) throw new Error("La prova CircuitCheck supera il limite della lavagna.")
  if (value.netlist !== requestedNetlist || !object(value.answer) ||
      !string(value.fingerprint, 64) || !/^[a-f0-9]{64}$/.test(value.fingerprint) ||
      !string(value.source_sha, 100) || !string(value.title, 240) || !string(value.method, 40) ||
      !string(value.answer.exact, 200) || !string(value.answer.unit, 20) ||
      !string(value.answer.reference, 200) || !Array.isArray(value.steps) ||
      value.steps.length < 1 || value.steps.length > 128) {
    throw new Error("CircuitCheck non ha restituito una soluzione verificata per questo circuito.")
  }
  const steps: CircuitStep[] = value.steps.map((raw: unknown) => {
    if (!object(raw) || !string(raw.title, 240) || !string(raw.explanation, 8000) ||
        !string(raw.svg, 100_000) || !raw.svg.startsWith("<svg ") ||
        !Array.isArray(raw.equations) || raw.equations.length > 50 ||
        !raw.equations.every((eq: unknown) => string(eq, 500))) {
      throw new Error("La dimostrazione CircuitCheck contiene un passaggio non leggibile.")
    }
    return { title: raw.title, explanation: raw.explanation, svg: raw.svg,
      equations: raw.equations as string[] }
  })
  return { fingerprint: value.fingerprint, sourceSha: value.source_sha,
    netlist: requestedNetlist, title: value.title, method: value.method,
    answer: { exact: value.answer.exact, unit: value.answer.unit,
      reference: value.answer.reference }, steps }
}

function readProvenance(value: unknown, fingerprint: string): CircuitProof["inputProvenance"] {
  if (value === undefined || value === null) return null
  if (!object(value) || value.source_kind !== "image" ||
      typeof value.source_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(value.source_sha256) ||
      value.circuit_sha256 !== fingerprint || !Number.isInteger(value.confirmed_at_unix) ||
      Number(value.confirmed_at_unix) <= 0) {
    throw new Error("La provenienza fotografica non appartiene alla revisione CircuitCheck.")
  }
  return {source_kind:"image",source_sha256:value.source_sha256,
    circuit_sha256:value.circuit_sha256,confirmed_at_unix:value.confirmed_at_unix as number}
}

function isElectricalVerification(value: unknown): value is NonNullable<CircuitProof["verification"]> {
  return object(value) && value.electrical_claim === "VERIFIED" &&
    value.backend === "CLOSED" && value.lesson === "exact-answer-crosscheck" &&
    value.product_verified === false
}

/** Accept only the service's actual electrical claim and preserve its limited scope. */
export function readCircuitProof(value: unknown, requestedNetlist: string): CircuitProof {
  if (!object(value) || value.outcome !== "solved" || !isElectricalVerification(value.verification)) {
    throw new Error("CircuitCheck non ha restituito una soluzione verificata per questo circuito.")
  }
  const fields = readProofFields(value, requestedNetlist)
  if (typeof value.lesson_build !== "string" || !/^[a-f0-9]{64}$/.test(value.lesson_build)) {
    throw new Error("La revisione della lezione CircuitCheck non è verificabile.")
  }
  return {...fields, schema:"circuit-proof.v2", scope:"electrical_result",
    lessonBuild:value.lesson_build, verification:{...value.verification},
    inputProvenance:readProvenance(value.input_provenance, fields.fingerprint)}
}

export function readCircuitDiagnosis(value: unknown, fingerprint: string): CircuitDiagnosis {
  if (!object(value) || !["first_invalid", "valid_so_far", "not_assessable"].includes(String(value.outcome)) ||
      value.circuit_fingerprint !== fingerprint || !string(value.message, 4000) ||
      !Array.isArray(value.focus) || value.focus.length > 32 ||
      !value.focus.every((item: unknown) => string(item, 100)) ||
      !(value.step === null || Number.isInteger(value.step) && Number(value.step) >= 1 && Number(value.step) <= 32)) {
    throw new Error("La diagnosi non appartiene alla revisione corrente del circuito.")
  }
  return value as CircuitDiagnosis
}

export function readCircuitState(value: unknown): CircuitEmbedState {
  if (!object(value) || value.kind !== "circuitcheck-proof-v1" ||
      !string(value.netlist, 16_000) || !string(value.method, 40) ||
      !Number.isInteger(value.selectedStep) || Number(value.selectedStep) < 0 || Number(value.selectedStep) > 127 ||
      !Array.isArray(value.trace) || value.trace.length > 32) return emptyCircuitState()
  const validTrace = value.trace.every((step: unknown) => object(step) &&
    string(step.transcription, 500) && string(step.first, 500) && string(step.second, 500) &&
    (step.claimed_value === null || string(step.claimed_value, 100)) &&
    ["serie", "parallelo", "kcl", "corrente", "tensione", "altro"].includes(String(step.operation)) &&
    ["clear", "ambiguous", "unreadable"].includes(String(step.reading)))
  if (!validTrace) return emptyCircuitState()
  // A persisted proof is historical evidence only. Legacy v1 had discarded the
  // verification scope: keep it readable without manufacturing a VERIFIED claim.
  let proof: CircuitProof | null = null
  try {
    if (object(value.proof)) {
      const raw = value.proof
      const fields = readProofFields({...raw, source_sha:raw.sourceSha}, value.netlist)
      const scoped = raw.schema === "circuit-proof.v2" && raw.scope === "electrical_result" &&
        isElectricalVerification(raw.verification) &&
        typeof raw.lessonBuild === "string" && /^[a-f0-9]{64}$/.test(raw.lessonBuild)
      proof = {...fields, schema:"circuit-proof.v2",
        scope:scoped ? "electrical_result" : "legacy_unrecorded",
        lessonBuild:scoped ? raw.lessonBuild as string : null,
        verification:scoped ? {...raw.verification as NonNullable<CircuitProof["verification"]>} : null,
        inputProvenance:scoped ? readProvenance(raw.inputProvenance, fields.fingerprint) : null}
    }
  } catch { proof = null }
  return { kind: "circuitcheck-proof-v1", netlist: value.netlist, method: value.method,
    proof, selectedStep: value.selectedStep as number, trace: value.trace as CircuitTraceStep[],
    diagnosis: null,
    pendingErrorId: proof && typeof value.pendingErrorId === "string" &&
      new RegExp(`^circuit-attempt:${proof.fingerprint}:[a-f0-9]{24}:error$`).test(value.pendingErrorId)
        ? value.pendingErrorId : null }
}

export async function callCircuitCheck(path: "solve" | "diagnose", body: unknown, signal?: AbortSignal): Promise<unknown> {
  const base = (import.meta.env.VITE_CIRCUITCHECK_API_BASE as string | undefined) || "/circuitcheck"
  const response = await fetch(`${base.replace(/\/$/, "")}/api/${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body), signal,
  })
  let value: unknown
  try { value = await response.json() } catch { throw new Error("Servizio CircuitCheck non disponibile.") }
  if (!response.ok) throw new Error(object(value) && string(value.message, 1000) ? value.message : "CircuitCheck non disponibile.")
  return value
}
