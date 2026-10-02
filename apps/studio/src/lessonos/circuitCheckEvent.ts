import type { LessonOsEvent } from "./eventlog"
import type { CircuitDiagnosis, CircuitProof, CircuitTraceStep } from "../toolhost/circuitCheckAdapter"

const exerciseId = (proof: CircuitProof): string => `circuit:${proof.fingerprint}`

/** Exercise-level facts only. The board scene holds the raw proof and attempt. */
export function circuitProofEvent(proof: CircuitProof, embedId: string, t: number): LessonOsEvent {
  if (proof.scope !== "electrical_result" || !proof.verification || !proof.lessonBuild) {
    throw new Error("La prova CircuitCheck non conserva lo scope della verifica.")
  }
  return {
    kind: "circuit.proof.verified", exerciseId: exerciseId(proof),
    circuitFingerprint: proof.fingerprint, embedId,
    answerExact: proof.answer.exact, unit: proof.answer.unit,
    engineRevision: proof.sourceSha,
    verificationScope: proof.scope, lessonBuild: proof.lessonBuild,
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
      conceptLabels:{it:conceptLabel},
    } : {}),
    ...(diagnosis.outcome === "valid_so_far" && correctsErrorId ? {correctsErrorId} : {}),
    labels: { it: label }, t, evidence: [`board:${embedId}`],
  }
}
