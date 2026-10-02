import type { LessonOsEvent } from "./eventlog"
import type { CircuitDiagnosis, CircuitProof, CircuitTraceStep } from "../toolhost/circuitCheckAdapter"

const exerciseId = (proof: CircuitProof): string => `circuit:${proof.fingerprint}`

/** Bind the complete displayed proof to its factual event, independently of source build metadata. */
export async function circuitProofSha256(proof: CircuitProof): Promise<string> {
  const canonical = [proof.schema, proof.scope, proof.fingerprint, proof.sourceSha,
    proof.lessonBuild, proof.netlist, proof.title, proof.method,
    proof.verification ? [proof.verification.electrical_claim, proof.verification.backend,
      proof.verification.lesson, proof.verification.product_verified] : null,
    proof.inputProvenance ? [proof.inputProvenance.source_kind, proof.inputProvenance.source_sha256,
      proof.inputProvenance.circuit_sha256, proof.inputProvenance.confirmed_at_unix] : null,
    [proof.answer.exact, proof.answer.unit, proof.answer.reference],
    proof.steps.map(step => [step.title, step.explanation, step.svg, step.equations]),
  ]
  const bytes = new TextEncoder().encode(JSON.stringify(canonical))
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map(value => value.toString(16).padStart(2, "0")).join("")
}

/** Exercise-level facts only. The board scene holds the raw proof and attempt. */
export async function circuitProofEvent(proof: CircuitProof, embedId: string, t: number): Promise<LessonOsEvent> {
  if (proof.scope !== "electrical_result" || !proof.verification || !proof.lessonBuild) {
    throw new Error("La prova CircuitCheck non conserva lo scope della verifica.")
  }
  return {
    kind: "circuit.proof.verified", exerciseId: exerciseId(proof),
    circuitFingerprint: proof.fingerprint, embedId,
    answerExact: proof.answer.exact, unit: proof.answer.unit,
    engineRevision: proof.sourceSha,
    verificationScope: proof.scope, lessonBuild: proof.lessonBuild,
    proofSha256: await circuitProofSha256(proof),
    labels: { it: `${proof.title}: ${proof.answer.exact} ${proof.answer.unit}` },
    t, evidence: [`board:${embedId}`],
  }
}

export async function circuitTraceEvent(
  proof: CircuitProof, trace: readonly CircuitTraceStep[], diagnosis: CircuitDiagnosis,
  embedId: string, t: number, correctsErrorId: string | null = null,
): Promise<Extract<LessonOsEvent,{kind:"circuit.trace.assessed"}>> {
  if (diagnosis.circuit_fingerprint !== proof.fingerprint) {
    throw new Error("La diagnosi non appartiene alla prova CircuitCheck.")
  }
  if (correctsErrorId && !new RegExp(`^circuit-attempt:${proof.fingerprint}:[a-f0-9]{24}:error$`).test(correctsErrorId)) {
    throw new Error("La correzione non appartiene al circuito corrente.")
  }
  const bytes = new TextEncoder().encode(JSON.stringify({fingerprint:proof.fingerprint,trace}))
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map(value => value.toString(16).padStart(2, "0")).join("")
  const attemptId = `circuit-attempt:${proof.fingerprint}:${hash.slice(0, 24)}`
  const invalid = diagnosis.outcome === "first_invalid" && diagnosis.step !== null
    ? trace[diagnosis.step - 1] : undefined
  const conceptLabel = invalid?.reading === "clear"
    ? invalid.operation === "serie" ? "Riduzione in serie"
      : invalid.operation === "parallelo" ? "Riduzione in parallelo"
      : invalid.operation === "kcl" ? "KCL al nodo"
      : invalid.operation === "kvl" ? "KVL nella maglia"
      : invalid.operation === "corrente" ? "Corrente di un componente"
      : invalid.operation === "tensione" ? "Tensione di un componente" : undefined
    : undefined
  const label = diagnosis.outcome === "first_invalid"
    ? `Tentativo: primo passaggio da rivedere ${diagnosis.step}: ${diagnosis.message}`
    : diagnosis.outcome === "valid_so_far" ? "Tentativo valido fin qui" : "Tentativo non valutabile"
  return {
    kind: "circuit.trace.assessed",
    attemptId,
    exerciseId: exerciseId(proof), outcome: diagnosis.outcome,
    ...(diagnosis.outcome === "first_invalid" && diagnosis.step !== null
      ? { firstInvalidStep: diagnosis.step } : {}),
    ...(conceptLabel ? {
      errorId:`${attemptId}:error`, conceptId:`circuit:method:${invalid!.operation}`,
      conceptLabels:{it:conceptLabel}, observedStep:{...invalid!},
    } : {}),
    ...(diagnosis.outcome === "valid_so_far" && correctsErrorId ? {correctsErrorId} : {}),
    labels: { it: label }, t, evidence: [`board:${embedId}`],
  }
}
