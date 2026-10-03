/** Editable input only. Kirchhoff validates and solves the resulting circuit. */
export type CircuitInputKind = "R" | "V" | "I" | "L" | "C"
export type CircuitInputComponent = {
  id: string; kind: CircuitInputKind; from: string; to: string; value: string; phase: string
  waveform?: "" | "step" | "impulse"
  initial?: string
}
export type CircuitInputModel = {
  schema: "circuit-input.v1"
  domain: "dc" | "ac" | "laplace"
  omega: string
  amplitude: "unspecified" | "rms" | "peak"
  components: CircuitInputComponent[]
  request: {quantity: "voltage" | "current" | "power" | "resistance" | "impedance"; target: string; from: string; to: string}
}
export const circuitInputUnits: Record<CircuitInputKind, string> = {
  R: "ohm", V: "volt", I: "ampere", L: "henry", C: "farad",
}
export const circuitInputValueUnit = (c: CircuitInputComponent, domain: CircuitInputModel["domain"]): string =>
  circuitInputUnits[c.kind] + (domain === "laplace" && ["V", "I"].includes(c.kind) && c.waveform === "impulse" ? "*s" : "")
export const emptyCircuitInput = (): CircuitInputModel => ({
  schema: "circuit-input.v1", domain: "dc", omega: "", amplitude: "unspecified", components: [],
  request: {quantity: "voltage", target: "", from: "", to: ""},
})
const record = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === "object" && !Array.isArray(v)
const text = (v: unknown): v is string => typeof v === "string" && v.length <= 100
const kinds = Object.keys(circuitInputUnits)
const node = /^[A-Za-z0-9_][A-Za-z0-9_.:-]{0,63}$/
const number = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$|^[+-]?\d+\/[1-9]\d*$/
function positive(value: string) { return number.test(value) && !value.startsWith("-") && /[1-9]/.test(value.split(/[eE/]/)[0]) }

/** Allows incomplete fields while editing, but never arbitrary executable or oversized input. */
export function readCircuitInput(value: unknown): CircuitInputModel {
  if (!record(value) || value.schema !== "circuit-input.v1" || !["dc", "ac", "laplace"].includes(value.domain as string) ||
      !text(value.omega) || !["unspecified", "rms", "peak"].includes(value.amplitude as string) ||
      !Array.isArray(value.components) || value.components.length > 64 ||
      !value.components.every(c => record(c) && kinds.includes(c.kind as string) &&
        [c.id, c.from, c.to, c.value, c.phase].every(text) &&
        (c.initial === undefined || text(c.initial)) &&
        (c.waveform === undefined || ["", "step", "impulse"].includes(c.waveform as string))) || !record(value.request) ||
      !["voltage", "current", "power", "resistance", "impedance"].includes(value.request.quantity as string) ||
      ![value.request.target, value.request.from, value.request.to].every(text)) {
    throw new Error("L’interpretazione del circuito non è leggibile.")
  }
  return {schema: "circuit-input.v1", domain: value.domain as CircuitInputModel["domain"], omega: value.omega,
    amplitude: value.amplitude as CircuitInputModel["amplitude"],
    components: value.components.map(c => ({id:c.id,kind:c.kind,from:c.from,to:c.to,value:c.value,phase:c.phase,
      ...(c.initial === undefined ? {} : {initial:c.initial}), ...(c.waveform === undefined ? {} : {waveform:c.waveform})})),
    request: {...value.request} as CircuitInputModel["request"]}
}

export function circuitInputNetlist(input: CircuitInputModel): string {
  const model = readCircuitInput(input)
  if (!model.components.length) throw new Error("Aggiungi i componenti del tuo circuito.")
  if (model.domain === "ac" && !positive(model.omega)) throw new Error("Indica una pulsazione positiva in rad/s.")
  const ids = new Set<string>(), nodes = new Set<string>()
  const lines = model.domain === "ac" ? [`@ac ${model.omega} rad/s`, `@amplitude ${model.amplitude}`] : model.domain === "laplace" ? ["@laplace"] : []
  for (const c of model.components) {
    if (!new RegExp(`^${c.kind}[A-Za-z0-9_]{0,63}$`).test(c.id) || ids.has(c.id)) throw new Error(`Controlla il nome univoco del componente ${c.id || "senza nome"}.`)
    if (!node.test(c.from) || !node.test(c.to) || c.from === c.to) throw new Error(`Indica due morsetti distinti per ${c.id}.`)
    if (!number.test(c.value) || (["R", "L", "C"].includes(c.kind) && !positive(c.value))) throw new Error(`Controlla il valore di ${c.id} in ${circuitInputUnits[c.kind]}. Usa un numero o una frazione esatta.`)
    if (model.domain === "dc" && ["L", "C"].includes(c.kind)) throw new Error("Per induttori e condensatori scegli il regime sinusoidale o Laplace.")
    const source = c.kind === "V" || c.kind === "I"
    if (source && model.domain === "ac" && (!/^[+-]?\d+$/.test(c.phase) || !Number.isSafeInteger(Number(c.phase)) || Number(c.phase) % 30 !== 0)) throw new Error(`Indica la fase di ${c.id} in gradi multipli di 30, senza arrotondarla.`)
    if (source && model.domain === "laplace" && !["step", "impulse"].includes(c.waveform ?? "")) throw new Error(`Scegli gradino o impulso per ${c.id}; l’impulso richiede la sua area.`)
    if (model.domain === "laplace" && ["L", "C"].includes(c.kind) && !number.test(c.initial ?? "")) throw new Error(`Indica lo stato iniziale di ${c.id} a t = 0−, anche quando vale zero.`)
    ids.add(c.id); nodes.add(c.from); nodes.add(c.to)
    lines.push(`${c.id} ${c.from} ${c.to} ${c.value} ${circuitInputValueUnit(c,model.domain)}${source && model.domain === "ac" ? ` ${c.phase}deg` : source && model.domain === "laplace" ? ` ${c.waveform}` : ""}`)
    if (model.domain === "laplace" && ["L", "C"].includes(c.kind)) lines.push(`@initial ${c.id} ${c.kind === "C" ? "voltage" : "current"} ${c.initial} ${c.kind === "C" ? "volt" : "ampere"}`)
  }
  const q = model.request
  if (q.quantity === "resistance" || q.quantity === "impedance") {
    if (q.quantity === "resistance" && model.domain !== "dc") throw new Error("La resistenza di porta richiede il regime continuo.")
    if (q.quantity === "impedance" && model.domain !== "ac") throw new Error("L’impedenza di porta richiede il regime sinusoidale.")
    if (!nodes.has(q.from) || !nodes.has(q.to) || q.from === q.to) throw new Error("Scegli due morsetti presenti e distinti per la porta.")
    lines.push(`? ${q.quantity} ${q.from} ${q.to}`)
  } else {
    if (!ids.has(q.target)) throw new Error("Scegli il componente della domanda.")
    if (q.quantity === "power" && (model.domain !== "ac" || model.amplitude === "unspecified")) throw new Error("La potenza richiede regime sinusoidale e ampiezza RMS o di picco esplicita.")
    lines.push(`? ${q.quantity} ${q.target}`)
  }
  return lines.join("\n")
}

/** Strict projection: unsupported rows remain available in the expert view, never silently dropped. */
export function parseCircuitInputNetlist(netlist: string): CircuitInputModel {
  if (netlist.length > 16000) throw new Error("Circuito troppo lungo per l’editor.")
  const model = emptyCircuitInput()
  let question = false, amplitude = false
  const initials = new Map<string,{quantity:string;value:string;unit:string}>()
  for (const raw of netlist.split(/\r?\n/)) {
    const line = raw.split("#", 1)[0].trim()
    if (!line) continue
    const p = line.split(/\s+/)
    if (p[0] === "@laplace" && p.length === 1 && model.domain === "dc" && !model.components.length && !question) {
      model.domain = "laplace"; continue
    }
    if (p[0] === "@ac" && p.length === 3 && p[2] === "rad/s" && model.domain === "dc" && !model.components.length && !question) {
      model.domain = "ac"; model.omega = p[1]; continue
    }
    if (p[0] === "@amplitude" && p.length === 2 && model.domain === "ac" && !amplitude && !model.components.length && !question && ["rms", "peak", "unspecified"].includes(p[1])) {
      model.amplitude = p[1] as CircuitInputModel["amplitude"]; amplitude = true; continue
    }
    if (p[0] === "@initial" && model.domain === "laplace" && p.length === 5 && !question) {
      if (initials.has(p[1])) throw new Error("Lo stato iniziale è dichiarato più volte; correggilo nella vista esperta.")
      initials.set(p[1],{quantity:p[2],value:p[3],unit:p[4]}); continue
    }
    if (p[0] === "?" && !question) {
      if ((p[1] === "resistance" || p[1] === "impedance") && p.length === 4) model.request = {quantity:p[1],from:p[2],to:p[3],target:""}
      else if (["voltage", "current", "power"].includes(p[1]) && p.length === 3) model.request = {quantity:p[1] as CircuitInputModel["request"]["quantity"],target:p[2],from:"",to:""}
      else throw new Error("La domanda richiede la vista esperta.")
      question = true; continue
    }
    const kind = p[0][0] as CircuitInputKind
    const phased = model.domain === "ac" && ["V", "I"].includes(kind)
    const laplaceSource = model.domain === "laplace" && ["V", "I"].includes(kind)
    const unit = circuitInputUnits[kind] + (laplaceSource && p[5] === "impulse" ? "*s" : "")
    if (question || !kinds.includes(kind) || p.length !== (phased || laplaceSource ? 6 : 5) || p[4] !== unit ||
        (phased && !/^[+-]?\d+deg$/.test(p[5])) || (laplaceSource && !["step", "impulse"].includes(p[5]))) {
      throw new Error("Questa riga richiede la vista esperta; nessuna parte del circuito è stata rimossa.")
    }
    model.components.push({id:p[0],kind,from:p[1],to:p[2],value:p[3],phase:phased ? p[5].slice(0,-3) : "",
      ...(laplaceSource ? {waveform:p[5] as "step"|"impulse"} : {})})
  }
  for (const [id,initial] of initials) {
    const component=model.components.find(c=>c.id===id)
    if (!component || !["L", "C"].includes(component.kind) ||
        initial.quantity !== (component.kind === "C" ? "voltage" : "current") ||
        initial.unit !== (component.kind === "C" ? "volt" : "ampere")) throw new Error("Lo stato iniziale non corrisponde al componente e alla sua unità; controlla la vista esperta.")
    component.initial=initial.value
  }
  if (netlist.trim()) {
    if (!question) throw new Error("Completa la domanda nella vista esperta prima di aprire i componenti.")
    circuitInputNetlist(model)
  }
  return model
}
