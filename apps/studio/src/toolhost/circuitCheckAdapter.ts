/** CircuitCheck is a separate deterministic service. This is a wire contract, never a second solver. */
import { lessonExpressionMarkup, lessonMathMarkup } from "./lessonMath"
import { readLaplaceTransform, readLaplaceInputs, assertLaplaceAnswerMath, type CircuitLaplaceTransform, type CircuitLaplaceInputs } from "./circuitLaplace"
import { parseCircuitInputNetlist } from "./circuitInputModel"
export const CIRCUIT_CHECK_TOOL_ID = "io.ardesia.circuit-reasoning"
export const CIRCUIT_CHECK_EMBED_ID = "circuit-reasoning"

export type CircuitStep = Readonly<{
  title: string
  explanation: string
  svg: string
  equations: string[]
  /** Validated expression trees supplied by Kirchhoff, not reparsed equation strings. */
  math?: readonly unknown[]
  /** Component identifiers supplied by Kirchhoff; absent in historical imports. */
  focus?: string[]
}>

export type CircuitVerification = Readonly<{
  electrical_claim:"VERIFIED";backend:"CLOSED";lesson:"exact-answer-crosscheck";product_verified:false
}> | Readonly<{
  electrical_claim:"PORT_SUBPROOFS_CROSSCHECKED";backend:"SUBPROOFS_CLOSED";lesson:"port-subproof-crosscheck";product_verified:false
}> | Readonly<{
  electrical_claim:"PHASOR_PATHS_CROSSCHECKED";backend:"PHASOR_RESIDUALS_CHECKED";lesson:"phasor-all-branches-crosscheck";product_verified:false
  checks: string[]
}> | Readonly<{
  electrical_claim:"PHASOR_POWER_CROSSCHECKED";backend:"PHASOR_RESIDUALS_AND_POWER_CHECKED";lesson:"phasor-power-all-branches-crosscheck";product_verified:false
  checks: string[]
}> | Readonly<{
  electrical_claim:"PHASOR_PORT_PATHS_CROSSCHECKED";backend:"PHASOR_PORT_RESIDUALS_CHECKED";lesson:"phasor-port-crosscheck";product_verified:false
  checks: string[]
}> | Readonly<{
  electrical_claim:"LAPLACE_ALGEBRA_CROSSCHECKED";backend:"SYMBOLIC_MNA_AND_ALGEBRA_CHECKED";lesson:"laplace-exact-algebra-crosscheck";product_verified:false
  checks: string[]
}>

export type CircuitPhasor = Readonly<{
  basis: "1,zeta12,zeta12^2,zeta12^3"
  coefficients: string[]
  real_exact: string
  imaginary_exact: string
  real_decimal: string
  imaginary_decimal: string
  decimal_precision?: Readonly<{real:number;imaginary:number;significant_digits:8;method:"exact-rational-sqrt3-bounds"}>
}>

export type CircuitComplexPower = Readonly<{
  basis: CircuitPhasor["basis"]
  coefficients: string[]
  active: Readonly<{exact:string;decimal:string;unit:"W"}>
  reactive: Readonly<{exact:string;decimal:string;unit:"var"}>
  decimal_precision?: CircuitPhasor["decimal_precision"]
}>

export type CircuitPortAnalysis = Readonly<{
  schema:"ac-port-analysis.v1"
  port:readonly [string,string]
  test_source:Readonly<{id:string;terminals:readonly [string,string];current:Readonly<{exact:"1";unit:"A";phase_degrees:0}>}>
  deactivated_sources:readonly string[]
  status:"EXACT_TRANSFORM_AND_RATIO_CHECKED"
  canonical_proof:false
}>

export type CircuitConventions = Readonly<{
  domain:"ac_sinusoidal"
  time_dependence:"exp(+jωt)"
  amplitude:"unspecified" | "rms" | "peak"
  omega: Readonly<{exact:string;unit:"rad/s"}>
  voltage:"V(first)-V(second)"
  current:"first → second"
  impedance_definition?:"Z=V(port)/I_test"
  test_current?:"second → first"
  impedance_amplitude_invariant?:true
} & ({power_calculated:false} | {
  power_calculated:true
  amplitude:"rms" | "peak"
  power_sign:"passive"
  power_factor:"1" | "1/2"
  power_formula:"S=V*conj(I)" | "S=V*conj(I)/2"
})>

export type CircuitLaplaceConventions = Readonly<{
  domain:"laplace"
  variable:Readonly<{symbol:"s";unit:"1/s"}>
  initial_time:"0-"
  voltage:"V(first)-V(second)"
  current:"first → second"
  power_calculated:false
  time_dependence?:never;amplitude?:never;omega?:never
  impedance_definition?:never;test_current?:never;impedance_amplitude_invariant?:never
}>

export type CircuitProof = Readonly<{
  schema: "circuit-proof.v2"
  /** Persisted proof is historical until the service re-solves this revision. */
  scope: "electrical_result" | "port_subproofs_crosschecked" | "phasor_paths_crosschecked" | "phasor_power_crosschecked" | "phasor_port_crosschecked" | "laplace_algebra_crosschecked" | "legacy_unrecorded"
  fingerprint: string
  sourceSha: string
  lessonBuild: string | null
  verification: CircuitVerification | null
  inputProvenance: Readonly<{source_kind:"image";source_sha256:string;circuit_sha256:string;confirmed_at_unix:number}> | null
  netlist: string
  title: string
  method: string
  answer: Readonly<{ exact: string; unit: string; reference: string; phasor?:CircuitPhasor; quantity?:"power"|"equivalent_impedance"|"voltage"|"current"; complex_power?:CircuitComplexPower
    complex_impedance?:CircuitPhasor
    laplace_transform?:CircuitLaplaceTransform
    math?:unknown;display_exact?:string }>
  conventions?: CircuitConventions | CircuitLaplaceConventions
  portAnalysis?: CircuitPortAnalysis
  laplaceInputs?: CircuitLaplaceInputs
  laplaceOutput?: Readonly<{time_domain_evaluated:false;contains_impulse_terms:boolean;polynomial_part_degree:number|null}>
  steps: CircuitStep[]
}>

export type CircuitTraceStep = Readonly<{
  transcription: string
  operation: "serie" | "parallelo" | "kcl" | "kvl" | "corrente" | "tensione" | "altro"
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
  selectedFocus?: string | null
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

const rational = (v: unknown): v is string => string(v,200) && /^-?\d+(?:\/[1-9]\d*)?$/.test(v)

function readPhasor(value: unknown): CircuitPhasor {
  if (!object(value) || value.basis !== "1,zeta12,zeta12^2,zeta12^3" ||
      !Array.isArray(value.coefficients) || value.coefficients.length !== 4 ||
      !value.coefficients.every(rational) || !string(value.real_exact,500) ||
      !string(value.imaginary_exact,500) || !string(value.real_decimal,200) ||
      !value.real_decimal.trim() || !Number.isFinite(Number(value.real_decimal)) ||
      !string(value.imaginary_decimal,200) || !value.imaginary_decimal.trim() ||
      !Number.isFinite(Number(value.imaginary_decimal))) {
    throw new Error("La prova fasoriale CircuitCheck non conserva le coordinate esatte.")
  }
  const precision = value.decimal_precision
  if (precision !== undefined && (!object(precision) ||
      !Number.isSafeInteger(precision.real) || (precision.real as number) < 8 ||
      !Number.isSafeInteger(precision.imaginary) || (precision.imaginary as number) < 8 ||
      precision.significant_digits !== 8 || precision.method !== "exact-rational-sqrt3-bounds")) {
    throw new Error("La prova fasoriale CircuitCheck non conserva la precisione dichiarata.")
  }
  return {basis:value.basis,coefficients:[...value.coefficients] as string[],
    real_exact:value.real_exact,imaginary_exact:value.imaginary_exact,
    real_decimal:value.real_decimal,imaginary_decimal:value.imaginary_decimal,
    ...(precision === undefined ? {} : {decimal_precision:{...precision} as CircuitPhasor["decimal_precision"]})}
}

function readConventions(value: unknown): CircuitConventions | CircuitLaplaceConventions {
  if (object(value) && value.domain === "laplace") {
    if (!object(value.variable) || value.variable.symbol !== "s" || value.variable.unit !== "1/s" ||
        value.initial_time !== "0-" || value.voltage !== "V(first)-V(second)" || value.current !== "first → second" ||
        value.power_calculated !== false || ["omega","amplitude","time_dependence","impedance_definition","power_formula","power_factor"].some(key=>value[key] !== undefined)) {
      throw new Error("La prova Laplace non conserva variabile, stato iniziale e convenzioni.")
    }
    return {domain:"laplace",variable:{symbol:"s",unit:"1/s"},initial_time:"0-",voltage:"V(first)-V(second)",current:"first → second",power_calculated:false}
  }
  if (!object(value) || value.domain !== "ac_sinusoidal" || value.time_dependence !== "exp(+jωt)" ||
      !["unspecified","rms","peak"].includes(value.amplitude as string) || !object(value.omega) || !rational(value.omega.exact) ||
      !/^[1-9]/.test(value.omega.exact) || value.omega.unit !== "rad/s" ||
      value.voltage !== "V(first)-V(second)" || value.current !== "first → second" ||
      ![false,true].includes(value.power_calculated as boolean)) {
    throw new Error("La prova fasoriale CircuitCheck non conserva frequenza e convenzioni.")
  }
  const base = {domain:value.domain,time_dependence:value.time_dependence,amplitude:value.amplitude as CircuitConventions["amplitude"],
    omega:{exact:value.omega.exact,unit:value.omega.unit},voltage:value.voltage,
    current:value.current} as const
  const hasImpedance = ["impedance_definition","test_current","impedance_amplitude_invariant"].some(key=>value[key] !== undefined)
  if(hasImpedance && (value.power_calculated !== false || value.impedance_definition !== "Z=V(port)/I_test" ||
      value.test_current !== "second → first" || value.impedance_amplitude_invariant !== true)) {
    throw new Error("L’impedenza CircuitCheck non conserva il rapporto e il verso della corrente di prova.")
  }
  if (value.power_calculated === false) return {...base,power_calculated:false,
    ...(hasImpedance ? {impedance_definition:"Z=V(port)/I_test",test_current:"second → first",impedance_amplitude_invariant:true} as const : {})}
  if (!["rms","peak"].includes(value.amplitude as string) || value.power_sign !== "passive" ||
      value.power_factor !== (value.amplitude === "rms" ? "1" : "1/2") ||
      value.power_formula !== (value.amplitude === "rms" ? "S=V*conj(I)" : "S=V*conj(I)/2")) {
    throw new Error("La potenza CircuitCheck richiede convenzione RMS o picco, fattore e segno passivo coerenti.")
  }
  return {...base,power_calculated:true,amplitude:value.amplitude as "rms"|"peak",
    power_sign:"passive",power_factor:value.power_factor as "1"|"1/2",
    power_formula:value.power_formula as "S=V*conj(I)"|"S=V*conj(I)/2"}
}

function readPortAnalysis(value: unknown, netlist: string, reference: string): CircuitPortAnalysis {
  const lines=netlist.split(/\r?\n/).map(line=>line.split("#",1)[0]!.trim()).filter(Boolean).map(line=>line.split(/\s+/))
  const questions=lines.filter(line=>line[0] === "?")
  const components=lines.filter(line=>!line[0]!.startsWith("@") && line[0] !== "?")
  const sourceIds=components.filter(line=>/^[VI]/i.test(line[0]!)).map(line=>line[0]!)
  const nodeNames=new Set(components.flatMap(line=>line.slice(1,3)))
  const node=(name:unknown):name is string=>string(name,100) && name.length>0 && !/\s/.test(name)
  if(!object(value) || value.schema !== "ac-port-analysis.v1" ||
      !Array.isArray(value.port) || value.port.length !== 2 || !value.port.every(node) || value.port[0] === value.port[1] ||
      !value.port.every(name=>nodeNames.has(name)) || questions.length !== 1 || questions[0]!.length !== 4 ||
      questions[0]![1] !== "impedance" || questions[0]![2] !== value.port[0] || questions[0]![3] !== value.port[1] ||
      reference !== `${value.port[0]} → ${value.port[1]}` ||
      !object(value.test_source) || !node(value.test_source.id) || components.map(line=>line[0]).includes(value.test_source.id) ||
      !Array.isArray(value.test_source.terminals) || value.test_source.terminals.length !== 2 ||
      value.test_source.terminals[0] !== value.port[1] || value.test_source.terminals[1] !== value.port[0] ||
      !object(value.test_source.current) || value.test_source.current.exact !== "1" ||
      value.test_source.current.unit !== "A" || value.test_source.current.phase_degrees !== 0 ||
      !Array.isArray(value.deactivated_sources) || value.deactivated_sources.length > 32 ||
      JSON.stringify(value.deactivated_sources) !== JSON.stringify(sourceIds) ||
      value.status !== "EXACT_TRANSFORM_AND_RATIO_CHECKED" || value.canonical_proof !== false) {
    throw new Error("La prova CircuitCheck non conserva porta, sorgenti spente e corrente di prova.")
  }
  return {schema:"ac-port-analysis.v1",port:[value.port[0],value.port[1]],
    test_source:{id:value.test_source.id,terminals:[value.port[1],value.port[0]],current:{exact:"1",unit:"A",phase_degrees:0}},
    deactivated_sources:[...sourceIds],status:"EXACT_TRANSFORM_AND_RATIO_CHECKED",canonical_proof:false}
}

function readComplexPower(value: unknown): CircuitComplexPower {
  if (!object(value) || !object(value.active) || !object(value.reactive) ||
      value.active.unit !== "W" || value.reactive.unit !== "var") {
    throw new Error("La potenza CircuitCheck non conserva P, Q e le rispettive unità.")
  }
  // The same exact coordinate representation is used, but complex power is
  // a constant complex quantity, never a voltage/current phasor.
  const coordinates = readPhasor({...value,real_exact:value.active.exact,
    real_decimal:value.active.decimal,imaginary_exact:value.reactive.exact,
    imaginary_decimal:value.reactive.decimal})
  return {basis:coordinates.basis,coefficients:coordinates.coefficients,
    active:{exact:coordinates.real_exact,decimal:coordinates.real_decimal,unit:"W"},
    reactive:{exact:coordinates.imaginary_exact,decimal:coordinates.imaginary_decimal,unit:"var"},
    ...(coordinates.decimal_precision ? {decimal_precision:coordinates.decimal_precision} : {})}
}

function readProofFields(value: unknown, requestedNetlist: string): Pick<CircuitProof,"fingerprint"|"sourceSha"|"netlist"|"title"|"method"|"answer"|"steps"|"conventions"|"portAnalysis"|"laplaceInputs"|"laplaceOutput"> {
  if (!object(value)) throw new Error("CircuitCheck non ha restituito una soluzione verificata per questo circuito.")
  if (JSON.stringify(value).length > 1_500_000) throw new Error("La prova CircuitCheck supera il limite della lavagna.")
  if (value.netlist !== requestedNetlist || !object(value.answer) ||
      !string(value.fingerprint, 64) || !/^[a-f0-9]{64}$/.test(value.fingerprint) ||
      !string(value.source_sha, 100) || !string(value.title, 240) || !string(value.method, 40) ||
      !string(value.answer.exact, value.method === "laplace" ? 8000 : 200) || !string(value.answer.unit, 20) ||
      !string(value.answer.reference, 200) || !Array.isArray(value.steps) ||
      value.steps.length < 1 || value.steps.length > 128) {
    throw new Error("CircuitCheck non ha restituito una soluzione verificata per questo circuito.")
  }
  if ((value.answer.complex_power !== undefined || value.answer.quantity === "power") &&
      (value.answer.quantity !== "power" || value.answer.complex_power === undefined || value.answer.phasor !== undefined)) {
    throw new Error("CircuitCheck non conserva la richiesta di potenza complessa.")
  }
  if ((value.answer.complex_impedance !== undefined || value.answer.quantity === "equivalent_impedance" || value.port_analysis !== undefined) &&
      (value.answer.quantity !== "equivalent_impedance" || value.answer.complex_impedance === undefined || value.port_analysis === undefined ||
       value.answer.phasor !== undefined || value.answer.complex_power !== undefined)) {
    throw new Error("CircuitCheck non conserva la richiesta di impedenza della porta.")
  }
  const phasor=value.answer.phasor === undefined ? undefined : readPhasor(value.answer.phasor)
  const complexPower=value.answer.complex_power === undefined ? undefined : readComplexPower(value.answer.complex_power)
  const complexImpedance=value.answer.complex_impedance === undefined ? undefined : readPhasor(value.answer.complex_impedance)
  const portAnalysis=value.port_analysis === undefined ? undefined : readPortAnalysis(value.port_analysis,requestedNetlist,value.answer.reference)
  const hasLaplace=value.method === "laplace" || value.answer.laplace_transform !== undefined || value.laplace_inputs !== undefined || value.laplace_output !== undefined ||
    requestedNetlist.split(/\r?\n/).some(line=>line.split("#",1)[0]?.trim() === "@laplace")
  let laplaceTransform:CircuitLaplaceTransform|undefined,laplaceInputs:CircuitLaplaceInputs|undefined
  let laplaceQuantity:"voltage"|"current"|undefined
  let laplaceOutput:CircuitProof["laplaceOutput"]
  if (hasLaplace) {
    const input=parseCircuitInputNetlist(requestedNetlist)
    const target=input.components.find(c=>c.id===input.request.target)
    if (input.domain !== "laplace" || !["voltage","current"].includes(input.request.quantity) ||
        value.method !== "laplace" || value.answer.quantity !== input.request.quantity ||
        value.answer.unit !== (input.request.quantity === "voltage" ? "V*s" : "A*s") ||
        !target || value.answer.reference !== `${target.from} → ${target.to}` ||
        phasor || complexPower || complexImpedance || portAnalysis) throw new Error("La trasformata CircuitCheck non corrisponde alla domanda e ai riferimenti originali.")
    laplaceQuantity=input.request.quantity as "voltage"|"current"
    laplaceTransform=readLaplaceTransform(value.answer.laplace_transform)
    laplaceInputs=readLaplaceInputs(value.laplace_inputs,requestedNetlist)
    assertLaplaceAnswerMath(value.answer.math,laplaceTransform)
    const degree=laplaceTransform.numerator.length-laplaceTransform.denominator.length
    const polynomialDegree=laplaceTransform.numerator.some(c=>c!=="0")&&degree>=0 ? degree : null
    if(!object(value.laplace_output) || value.laplace_output.time_domain_evaluated !== false ||
        value.laplace_output.polynomial_part_degree !== polynomialDegree ||
        value.laplace_output.contains_impulse_terms !== (polynomialDegree !== null)) {
      throw new Error("La prova Laplace non conserva il limite sull’inversione e sugli impulsi.")
    }
    laplaceOutput={time_domain_evaluated:false,contains_impulse_terms:polynomialDegree !== null,polynomial_part_degree:polynomialDegree}
  }
  let answerMath:CircuitProof["answer"]["math"]
  if(laplaceTransform) answerMath=JSON.parse(JSON.stringify(value.answer.math))
  else if(value.answer.math !== undefined) {
    const ast=value.answer.math
    const expected=phasor?.coefficients ?? complexPower?.coefficients ?? complexImpedance?.coefficients ??
      (rational(value.answer.exact) ? [value.answer.exact,"0","0","0"] : null)
    if(!object(ast) || ast.kind !== "number" || !Array.isArray(ast.coefficients) || !expected ||
        !lessonExpressionMarkup(ast) || JSON.stringify(ast.coefficients)!==JSON.stringify(expected)) {
      throw new Error("La formula del risultato non coincide con le coordinate esatte della prova.")
    }
    answerMath={kind:"number",coefficients:[...ast.coefficients] as string[]}
  }
  if(value.answer.display_exact !== undefined && (!answerMath || !string(value.answer.display_exact,hasLaplace ? 8000 : 500))) {
    throw new Error("La forma leggibile del risultato non conserva l’espressione esatta.")
  }
  const steps: CircuitStep[] = value.steps.map((raw: unknown) => {
    if (!object(raw) || !string(raw.title, 240) || !string(raw.explanation, 8000) ||
        !string(raw.svg, 100_000) || !raw.svg.startsWith("<svg ") ||
        !Array.isArray(raw.equations) || raw.equations.length > 50 ||
        !raw.equations.every((eq: unknown) => string(eq, hasLaplace ? 8000 : 500)) ||
        (raw.focus !== undefined && (!Array.isArray(raw.focus) || raw.focus.length > 128 ||
          !raw.focus.every((id: unknown) => string(id, 100) && id.length > 0)))) {
      throw new Error("La dimostrazione CircuitCheck contiene un passaggio non leggibile.")
    }
    if(raw.math !== undefined && !lessonMathMarkup(raw.math)) throw new Error("La formula di un passaggio CircuitCheck non è leggibile.")
    return { title: raw.title, explanation: raw.explanation, svg: raw.svg,
      equations: [...raw.equations] as string[],
      ...(raw.math === undefined ? {} : {math:JSON.parse(JSON.stringify(raw.math)) as unknown[]}),
      ...(raw.focus === undefined ? {} : {focus:[...raw.focus as string[]]}) }
  })
  return { fingerprint: value.fingerprint, sourceSha: value.source_sha,
    netlist: requestedNetlist, title: value.title, method: value.method,
    answer: { exact: value.answer.exact, unit: value.answer.unit,
      reference: value.answer.reference,
      ...(phasor ? {phasor} : {}),
      ...(complexPower ? {quantity:"power" as const,complex_power:complexPower} : {}),
      ...(complexImpedance ? {quantity:"equivalent_impedance" as const,complex_impedance:complexImpedance} : {}),
      ...(laplaceTransform ? {quantity:laplaceQuantity,laplace_transform:laplaceTransform} : {}),
      ...(answerMath ? {math:answerMath} : {}),
      ...(value.answer.display_exact === undefined ? {} : {display_exact:value.answer.display_exact as string}) }, steps,
    ...(value.conventions === undefined ? {} : {conventions:readConventions(value.conventions)}),
    ...(portAnalysis === undefined ? {} : {portAnalysis}),
    ...(laplaceInputs === undefined ? {} : {laplaceInputs}),
    ...(laplaceOutput === undefined ? {} : {laplaceOutput}) }
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

function isElectricalVerification(value: unknown): value is Extract<CircuitVerification,{electrical_claim:"VERIFIED"}> {
  return object(value) && value.electrical_claim === "VERIFIED" &&
    value.backend === "CLOSED" && value.lesson === "exact-answer-crosscheck" &&
    value.product_verified === false
}

function isPortVerification(value: unknown): value is Extract<CircuitVerification,{electrical_claim:"PORT_SUBPROOFS_CROSSCHECKED"}> {
  return object(value) && value.electrical_claim === "PORT_SUBPROOFS_CROSSCHECKED" &&
    value.backend === "SUBPROOFS_CLOSED" && value.lesson === "port-subproof-crosscheck" &&
    value.product_verified === false
}

function isPhasorVerification(value: unknown): value is Extract<CircuitVerification,{electrical_claim:"PHASOR_PATHS_CROSSCHECKED"}> {
  const checks = ["legge dei nodi","legge delle maglie","identità di Tellegen","leggi costitutive di tutti i componenti"]
  return object(value) && value.electrical_claim === "PHASOR_PATHS_CROSSCHECKED" &&
    value.backend === "PHASOR_RESIDUALS_CHECKED" && value.lesson === "phasor-all-branches-crosscheck" &&
    value.product_verified === false && Array.isArray(value.checks) && value.checks.length === checks.length &&
    checks.every((check,index) => (value.checks as unknown[])[index] === check)
}

function isPowerVerification(value: unknown): value is Extract<CircuitVerification,{electrical_claim:"PHASOR_POWER_CROSSCHECKED"}> {
  const checks = ["legge dei nodi","legge delle maglie","identità di Tellegen","leggi costitutive di tutti i componenti",
    "potenze di tutti i rami: prodotto indipendente","bilancio delle potenze complesse"]
  return object(value) && value.electrical_claim === "PHASOR_POWER_CROSSCHECKED" &&
    value.backend === "PHASOR_RESIDUALS_AND_POWER_CHECKED" && value.lesson === "phasor-power-all-branches-crosscheck" &&
    value.product_verified === false && Array.isArray(value.checks) && value.checks.length === checks.length &&
    checks.every((check,index) => (value.checks as unknown[])[index] === check)
}

function isPhasorPortVerification(value: unknown): value is Extract<CircuitVerification,{electrical_claim:"PHASOR_PORT_PATHS_CROSSCHECKED"}> {
  const checks = ["legge dei nodi","legge delle maglie","identità di Tellegen","leggi costitutive di tutti i componenti",
    "sorgenti indipendenti spente e corrente di prova orientata","impedenza di porta: rapporto tensione/corrente",
    "misura di porta confrontata con il kernel"]
  return object(value) && value.electrical_claim === "PHASOR_PORT_PATHS_CROSSCHECKED" &&
    value.backend === "PHASOR_PORT_RESIDUALS_CHECKED" && value.lesson === "phasor-port-crosscheck" &&
    value.product_verified === false && Array.isArray(value.checks) && value.checks.length === checks.length &&
    checks.every((check,index) => (value.checks as unknown[])[index] === check)
}

function isLaplaceVerification(value: unknown): value is Extract<CircuitVerification,{electrical_claim:"LAPLACE_ALGEBRA_CROSSCHECKED"}> {
  const checks=["residui della matrice MNA","legge dei nodi su tutti i rami","leggi costitutive con stato iniziale",
    "algebra: identità polinomiali indipendenti","passaggi e risposta: proiezioni esatte controllate"]
  return object(value) && value.electrical_claim === "LAPLACE_ALGEBRA_CROSSCHECKED" &&
    value.backend === "SYMBOLIC_MNA_AND_ALGEBRA_CHECKED" && value.lesson === "laplace-exact-algebra-crosscheck" &&
    value.product_verified === false && Array.isArray(value.checks) && value.checks.length === checks.length &&
    checks.every((check,index)=>(value.checks as unknown[])[index] === check)
}

/** These are distinct assurance levels, not interchangeable aliases for VERIFIED. */
export function circuitVerificationScope(value: unknown): Exclude<CircuitProof["scope"],"legacy_unrecorded"> | null {
  return isElectricalVerification(value) ? "electrical_result"
    : isPortVerification(value) ? "port_subproofs_crosschecked"
      : isPhasorVerification(value) ? "phasor_paths_crosschecked"
        : isPowerVerification(value) ? "phasor_power_crosschecked"
          : isPhasorPortVerification(value) ? "phasor_port_crosschecked"
            : isLaplaceVerification(value) ? "laplace_algebra_crosschecked" : null
}

function scopeMatchesFields(fields: Pick<CircuitProof,"method"|"answer"|"conventions"|"portAnalysis"|"laplaceInputs"|"laplaceOutput">, scope: CircuitProof["scope"] | null): boolean {
  if (scope === "laplace_algebra_crosschecked") return fields.method === "laplace" && fields.conventions?.domain === "laplace" &&
    Boolean(fields.answer.laplace_transform && fields.answer.math && fields.laplaceInputs && fields.laplaceOutput) &&
    !fields.answer.phasor && !fields.answer.complex_power && !fields.answer.complex_impedance && !fields.portAnalysis
  if (fields.laplaceInputs || fields.laplaceOutput || fields.answer.laplace_transform || fields.conventions?.domain === "laplace" || fields.method === "laplace") return false
  if (scope === "phasor_paths_crosschecked") return fields.method === "phasor" &&
    ["V","A"].includes(fields.answer.unit) && Boolean(fields.answer.phasor && fields.conventions) &&
    !fields.answer.complex_power && !fields.answer.complex_impedance && !fields.portAnalysis &&
    !fields.conventions?.impedance_definition && fields.conventions?.power_calculated === false
  if (scope === "phasor_power_crosschecked") return fields.method === "phasor" &&
    fields.answer.quantity === "power" && fields.answer.unit === "VA" && Boolean(fields.answer.complex_power) &&
    !fields.answer.phasor && !fields.answer.complex_impedance && !fields.portAnalysis && fields.conventions?.power_calculated === true
  if (scope === "phasor_port_crosschecked") return fields.method === "test_current" &&
    fields.answer.quantity === "equivalent_impedance" && fields.answer.unit === "Ω" &&
    Boolean(fields.answer.complex_impedance && fields.answer.math && fields.portAnalysis) &&
    !fields.answer.phasor && !fields.answer.complex_power && fields.conventions?.power_calculated === false &&
    fields.conventions.impedance_definition === "Z=V(port)/I_test" && fields.conventions.test_current === "second → first" &&
    fields.conventions.impedance_amplitude_invariant === true
  if (fields.method === "phasor" || fields.answer.phasor || fields.answer.complex_power || fields.answer.complex_impedance || fields.portAnalysis || fields.conventions) return false
  if (scope === "port_subproofs_crosschecked") return fields.method === "test_current" && fields.answer.unit === "Ω"
  return fields.method !== "test_current"
}

export function circuitAssuranceLabel(proof: CircuitProof): string {
  return proof.scope === "electrical_result" ? "Risultato elettrico verificato"
    : proof.scope === "port_subproofs_crosschecked" ? "Resistenza di porta: sottoprove chiuse e confrontate"
      : proof.scope === "phasor_paths_crosschecked" ? "Fasori confrontati su tutti i rami"
        : proof.scope === "phasor_power_crosschecked" ? "Potenza complessa e bilancio confrontati su tutti i rami"
          : proof.scope === "phasor_port_crosschecked" ? "Impedenza di porta: corrente di prova e percorsi confrontati"
            : proof.scope === "laplace_algebra_crosschecked" ? "Laplace: trasformate e passaggi algebrici controllati"
        : "Prova storica senza livello di verifica registrato"
}

export function circuitConventionsLabel(proof: CircuitProof): string | null {
  if(proof.conventions?.domain === "laplace") return "Trasformata unilaterale di Laplace · s in 1/s · stato iniziale dichiarato a t = 0−. La funzione del tempo richiede un ulteriore passaggio."
  const amplitude = proof.conventions?.amplitude === "rms" ? "ampiezze RMS dichiarate nell’ingresso"
    : proof.conventions?.amplitude === "peak" ? "ampiezze di picco dichiarate nell’ingresso"
      : "ampiezza non specificata come picco o RMS"
  const power = proof.answer.complex_power
  const detail = power && proof.conventions?.power_calculated
    ? ` P = ${power.active.exact} W · Q = ${power.reactive.exact} var. Convenzione passiva: potenza positiva assorbita. ${proof.conventions.power_formula}.`
    : proof.portAnalysis ? ` Impedenza fra ${proof.portAnalysis.port[0]} e ${proof.portAnalysis.port[1]}; sorgenti indipendenti spente, prova di 1 A dal secondo morsetto al primo. Il rapporto V/I non dipende da RMS o picco.` : ""
  return proof.conventions
    ? `Regime sinusoidale · ω = ${proof.conventions.omega.exact} rad/s · exp(+jωt) · ${amplitude}.${detail}`
    : null
}

/** Accept only the service's actual electrical claim and preserve its limited scope. */
export function readCircuitProof(value: unknown, requestedNetlist: string): CircuitProof {
  if (!object(value) || value.outcome !== "solved" || !circuitVerificationScope(value.verification)) {
    throw new Error("CircuitCheck non ha restituito una soluzione verificata per questo circuito.")
  }
  const fields = readProofFields(value, requestedNetlist)
  const scope = circuitVerificationScope(value.verification)!
  if (!scopeMatchesFields(fields,scope)) {
    throw new Error("La prova CircuitCheck non conserva metodo, unità e convenzioni previsti.")
  }
  if (typeof value.lesson_build !== "string" || !/^[a-f0-9]{64}$/.test(value.lesson_build)) {
    throw new Error("La revisione della lezione CircuitCheck non è verificabile.")
  }
  return {...fields, schema:"circuit-proof.v2", scope,
    lessonBuild:value.lesson_build, verification:{...value.verification as CircuitVerification},
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
    ["serie", "parallelo", "kcl", "kvl", "corrente", "tensione", "altro"].includes(String(step.operation)) &&
    ["clear", "ambiguous", "unreadable"].includes(String(step.reading)))
  if (!validTrace) return emptyCircuitState()
  // A persisted proof is historical evidence only. Legacy v1 had discarded the
  // verification scope: keep it readable without manufacturing a VERIFIED claim.
  let proof: CircuitProof | null = null
  try {
    if (object(value.proof)) {
      const raw = value.proof
      const fields = readProofFields({...raw, source_sha:raw.sourceSha,port_analysis:raw.portAnalysis,laplace_inputs:raw.laplaceInputs,laplace_output:raw.laplaceOutput}, value.netlist)
      const scope = circuitVerificationScope(raw.verification)
      const scoped = raw.schema === "circuit-proof.v2" && scope !== null && raw.scope === scope &&
        scopeMatchesFields(fields,scope) &&
        typeof raw.lessonBuild === "string" && /^[a-f0-9]{64}$/.test(raw.lessonBuild)
      proof = {...fields, schema:"circuit-proof.v2",
        scope:scoped ? scope : "legacy_unrecorded",
        lessonBuild:scoped ? raw.lessonBuild as string : null,
        verification:scoped ? {...raw.verification as NonNullable<CircuitProof["verification"]>} : null,
        inputProvenance:scoped ? readProvenance(raw.inputProvenance, fields.fingerprint) : null}
    }
  } catch { proof = null }
  return { kind: "circuitcheck-proof-v1", netlist: value.netlist, method: value.method,
    proof, selectedStep: value.selectedStep as number, trace: value.trace as CircuitTraceStep[],
    ...(value.selectedFocus === undefined ? {} : {selectedFocus:
      typeof value.selectedFocus === "string" && proof?.steps[value.selectedStep as number]?.focus?.includes(value.selectedFocus)
        ? value.selectedFocus : null}),
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
