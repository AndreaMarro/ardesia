import { emptyCircuitInput, parseCircuitInputNetlist, readCircuitInput, type CircuitInputModel } from "./circuitInputModel"
import { readToolSource, sourceImagePattern, sourceImageSha256, sourceSha256, verifyToolSource, type ToolSourceSnapshot } from "./toolSource"

export type CircuitInputSource = {kind:"image"|"board"; name:string; image:string; sha256:string; board?:ToolSourceSnapshot}
export type CircuitInputReceipt = {source_sha256:string;circuit_sha256:string;confirmed_at_unix:number}
export type CircuitIngressState = {
  schema:"circuit-ingress.v1"; mode:"structured"|"expert"; model:CircuitInputModel|null; reviewRequired:boolean
  source:CircuitInputSource|null; uncertainties:string[]; receipt:CircuitInputReceipt|null
}
const object = (v:unknown): v is Record<string,unknown> => Boolean(v) && typeof v === "object" && !Array.isArray(v)
const hash = (v:unknown): v is string => typeof v === "string" && /^[a-f0-9]{64}$/.test(v)
export function initialCircuitIngress(netlist:string):CircuitIngressState {
  let model:CircuitInputModel|null = emptyCircuitInput()
  try {model = parseCircuitInputNetlist(netlist)} catch {model = null}
  return {schema:"circuit-ingress.v1",mode:netlist ? "expert" : "structured",model,reviewRequired:!netlist,source:null,uncertainties:[],receipt:null}
}
export function readCircuitIngress(value:unknown):CircuitIngressState {
  if (!object(value) || value.schema !== "circuit-ingress.v1" || !["structured","expert"].includes(value.mode as string) ||
      !Array.isArray(value.uncertainties) || value.uncertainties.length > 100 ||
      !value.uncertainties.every(v=>typeof v === "string" && v.length <= 1000) ||
      (value.reviewRequired !== undefined && typeof value.reviewRequired !== "boolean")) throw new Error("L’ingresso salvato non è leggibile; conserva il file e ripristina la fonte.")
  let source:CircuitInputSource|null = null, receipt:CircuitInputReceipt|null = null
  if (value.source !== null) {
    const s = value.source
    if (!object(s) || !["image","board"].includes(s.kind as string) || typeof s.name !== "string" || s.name.length > 255 ||
        typeof s.image !== "string" || s.image.length > 2_800_000 || !sourceImagePattern.test(s.image) || !hash(s.sha256)) throw new Error("La fonte salvata non è leggibile.")
    const board = s.kind === "board" ? readToolSource(s.board) : undefined
    if (board && board.image !== s.image) throw new Error("L’immagine non coincide con la selezione salvata.")
    source = {kind:s.kind as CircuitInputSource["kind"],name:s.name,image:s.image,sha256:s.sha256,...(board ? {board} : {})}
  }
  if (value.receipt !== null) {
    const r = value.receipt
    if (!object(r) || !source || r.source_sha256 !== source.sha256 || !hash(r.circuit_sha256) ||
        !Number.isSafeInteger(r.confirmed_at_unix) || Number(r.confirmed_at_unix) < 0) throw new Error("La ricevuta non appartiene alla fonte salvata.")
    receipt = {source_sha256:source.sha256,circuit_sha256:r.circuit_sha256,confirmed_at_unix:r.confirmed_at_unix as number}
  }
  return {schema:"circuit-ingress.v1",mode:value.mode as CircuitIngressState["mode"],
    model:value.model === null ? null : readCircuitInput(value.model),reviewRequired:value.reviewRequired !== false,
    source,uncertainties:[...value.uncertainties] as string[],receipt}
}
export async function inputSourceFromImage(image:string,name:string):Promise<CircuitInputSource> {
  return {kind:"image",name:name.slice(0,255),image,sha256:await sourceImageSha256(image)}
}
export async function inputSourceFromBoard(value:unknown):Promise<CircuitInputSource> {
  const board = await verifyToolSource(value)
  return {kind:"board",name:`Selezione lavagna · ${board.elementIds.length} elementi`,image:board.image,
    sha256:await sourceImageSha256(board.image),board}
}
export async function circuitIngressRequest(path:"source"|"confirm"|"recognize",body:unknown):Promise<Record<string,unknown>> {
  const base = (import.meta.env.VITE_CIRCUITCHECK_API_BASE as string|undefined) || "/circuitcheck"
  const response = await fetch(`${base.replace(/\/$/,"")}/api/${path}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})
  let value:unknown
  try {value = await response.json()} catch {throw new Error("Servizio di ingresso non disponibile.")}
  if (!response.ok || !object(value)) throw new Error(object(value) && typeof value.message === "string" ? value.message : "Ingresso non disponibile.")
  return value
}
export async function confirmCircuitInput(source:CircuitInputSource,netlist:string):Promise<{token:string;receipt:CircuitInputReceipt}> {
  if (await sourceImageSha256(source.image) !== source.sha256) throw new Error("L’immagine è cambiata: carica di nuovo la fonte.")
  if (source.board) await verifyToolSource(source.board)
  const circuitHash = await sourceSha256(netlist)
  const received = await circuitIngressRequest("source",{image:source.image})
  if (received.source_sha256 !== source.sha256 || typeof received.source_token !== "string") throw new Error("Il servizio non ha confermato la fonte corrente.")
  const confirmed = await circuitIngressRequest("confirm",{source_token:received.source_token,netlist,confirmed:true})
  if (confirmed.source_sha256 !== source.sha256 || confirmed.circuit_sha256 !== circuitHash ||
      typeof confirmed.confirmation_token !== "string" || !Number.isSafeInteger(confirmed.confirmed_at_unix) || Number(confirmed.confirmed_at_unix) < 0) throw new Error("La ricevuta non coincide con questa revisione.")
  return {token:confirmed.confirmation_token,receipt:{source_sha256:source.sha256,circuit_sha256:circuitHash,confirmed_at_unix:confirmed.confirmed_at_unix as number}}
}
