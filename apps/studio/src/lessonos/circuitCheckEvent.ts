import type { LessonOsEvent } from "./eventlog"
import type { CircuitDiagnosis, CircuitProof, CircuitTraceStep } from "../toolhost/circuitCheckAdapter"
import { circuitAssuranceLabel, circuitVerificationScope } from "../toolhost/circuitCheckAdapter"

const exerciseId = (proof: CircuitProof): string => `circuit:${proof.fingerprint}`

/** Bind the complete displayed proof to its factual event, independently of source build metadata. */
export async function circuitProofSha256(proof: CircuitProof): Promise<string> {
  const canonical = [proof.schema, proof.scope, proof.fingerprint, proof.sourceSha,
    proof.lessonBuild, proof.netlist, proof.title, proof.method,
    proof.verification ? [proof.verification.electrical_claim, proof.verification.backend,
      proof.verification.lesson, proof.verification.product_verified,
      ...("checks" in proof.verification ? [proof.verification.checks] : [])] : null,
    proof.inputProvenance ? [proof.inputProvenance.source_kind, proof.inputProvenance.source_sha256,
      proof.inputProvenance.circuit_sha256, proof.inputProvenance.confirmed_at_unix] : null,
    [proof.answer.exact, proof.answer.unit, proof.answer.reference],
    // Keep historical hashes stable when the old adapter had no focus field.
    proof.steps.map(step => [step.title, step.explanation, step.svg, step.equations,
      ...(step.focus === undefined ? [] : [step.focus])]),
    ...(proof.answer.phasor ? [[proof.answer.phasor.basis,proof.answer.phasor.coefficients,
      proof.answer.phasor.real_exact,proof.answer.phasor.imaginary_exact,
      proof.answer.phasor.real_decimal,proof.answer.phasor.imaginary_decimal]] : []),
    ...(proof.conventions?.domain === "ac_sinusoidal" ? [[proof.conventions.domain,proof.conventions.time_dependence,
      proof.conventions.amplitude,proof.conventions.omega.exact,proof.conventions.omega.unit,
      proof.conventions.voltage,proof.conventions.current,proof.conventions.power_calculated]] : []),
    ...(proof.answer.complex_power ? [[proof.answer.complex_power.basis,proof.answer.complex_power.coefficients,
      proof.answer.complex_power.active,proof.answer.complex_power.reactive,
      proof.answer.complex_power.decimal_precision]] : []),
    ...(proof.conventions?.power_calculated ? [[proof.conventions.power_sign,
      proof.conventions.power_factor,proof.conventions.power_formula]] : []),
    // Optional addition: artifacts predating expression trees keep their digest.
    ...(proof.answer.math !== undefined || proof.answer.display_exact !== undefined || proof.steps.some(step=>step.math !== undefined)
      ? [["lesson-math.v1",proof.answer.math ?? null,proof.answer.display_exact ?? null,proof.steps.map(step=>step.math ?? null)]] : []),
    // Additive port projection: no extra slot exists in historical proof hashes.
    ...(proof.answer.complex_impedance ? [["complex-impedance.v1",proof.answer.quantity,
      proof.answer.complex_impedance.basis,proof.answer.complex_impedance.coefficients,
      proof.answer.complex_impedance.real_exact,proof.answer.complex_impedance.imaginary_exact,
      proof.answer.complex_impedance.real_decimal,proof.answer.complex_impedance.imaginary_decimal,
      proof.answer.complex_impedance.decimal_precision ?? null]] : []),
    ...(proof.portAnalysis ? [[proof.portAnalysis.schema,proof.portAnalysis.port,
      proof.portAnalysis.test_source.id,proof.portAnalysis.test_source.terminals,
      proof.portAnalysis.test_source.current.exact,proof.portAnalysis.test_source.current.unit,
      proof.portAnalysis.test_source.current.phase_degrees,proof.portAnalysis.deactivated_sources,
      proof.portAnalysis.status,proof.portAnalysis.canonical_proof]] : []),
    ...(proof.conventions?.impedance_definition !== undefined ? [["impedance-conventions.v1",
      proof.conventions.impedance_definition,proof.conventions.test_current,proof.conventions.impedance_amplitude_invariant]] : []),
    ...(proof.conventions?.domain === "laplace" ? [["laplace-conventions.v1",proof.conventions.domain,
      proof.conventions.variable.symbol,proof.conventions.variable.unit,proof.conventions.initial_time,
      proof.conventions.voltage,proof.conventions.current,proof.conventions.power_calculated]] : []),
    ...(proof.answer.laplace_transform ? [["laplace-transform.v1",proof.answer.quantity,
      proof.answer.laplace_transform.variable,proof.answer.laplace_transform.coefficient_order,
      proof.answer.laplace_transform.numerator,proof.answer.laplace_transform.denominator]] : []),
    ...(proof.laplaceInputs ? [["laplace-inputs.v1",proof.laplaceInputs.initial_time,
      proof.laplaceInputs.sources,proof.laplaceInputs.capacitor_voltages,proof.laplaceInputs.inductor_currents]] : []),
    ...(proof.laplaceOutput ? [["laplace-output.v1",proof.laplaceOutput.time_domain_evaluated,
      proof.laplaceOutput.contains_impulse_terms,proof.laplaceOutput.polynomial_part_degree]] : []),
  ]
  const bytes = new TextEncoder().encode(JSON.stringify(canonical))
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map(value => value.toString(16).padStart(2, "0")).join("")
}

/** Exercise-level facts only. The board scene holds the raw proof and attempt. */
export async function circuitProofEvent(proof: CircuitProof, embedId: string, t: number): Promise<LessonOsEvent> {
  if (proof.scope === "legacy_unrecorded" || circuitVerificationScope(proof.verification) !== proof.scope || !proof.lessonBuild) {
    throw new Error("La prova CircuitCheck non conserva lo scope della verifica.")
  }
  return {
    kind: "circuit.proof.verified", exerciseId: exerciseId(proof),
    circuitFingerprint: proof.fingerprint, embedId,
    answerExact: proof.answer.exact, unit: proof.answer.unit,
    engineRevision: proof.sourceSha,
    verificationScope: proof.scope, lessonBuild: proof.lessonBuild,
    proofSha256: await circuitProofSha256(proof),
    labels: { it: `${proof.title}: ${proof.answer.exact} ${proof.answer.unit} · ${circuitAssuranceLabel(proof)}` },
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
