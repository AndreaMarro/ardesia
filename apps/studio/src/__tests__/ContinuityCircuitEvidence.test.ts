import { describe,expect,it } from "vitest"
import { createEventEnvelopeV2,type JsonObject } from "../core/contracts/eventEnvelope"
import { adaptLegacyLessonOsV1Log,type AppendedEventEnvelopeV2 } from "../lessonos/eventlog"
import { circuitProofEvent } from "../lessonos/circuitCheckEvent"
import { loadScopedContinuitySnapshot,createImportedBundleContinuityWorkspaceReader,type ContinuityPersistenceStatusV1 } from "../lessonos/continuityRuntime"
import { projectContinuityV1 } from "../lessonos/continuityProjection"
import { readCircuitProof } from "../toolhost/circuitCheckAdapter"
import { sessionPaths,serializeSessionYamlV2 } from "../store/sessionState"
import { roomPaths } from "../store/roomPaths"
import portResponse from "./fixtures/circuitcheck-port-response.json"

const lessonId = "circuit-continuity"
const sessionId = "11111111-1111-4111-8111-111111111111"
const scope = {lessonId,sessionId,roomId:lessonId}
const producer = {id:"com.github.andreamarro.ardesia.studio",version:"1.0.0",commitSha:"d".repeat(40)}
const actor = {type:"teacher" as const,id:"teacher"}
const id = (n:number)=>`22222222-2222-4222-8222-${String(n).padStart(12,"0")}`

async function scenario() {
  const proof = readCircuitProof(portResponse,portResponse.netlist)
  const started:AppendedEventEnvelopeV2 = {...createEventEnvelopeV2({lessonId,sessionId,producer,actor,
    kind:"lesson.started",causationId:null,idempotencyKey:null,
    evidence:[{ref:`lesson:${lessonId}@1000`,resolution:"verified"}],payload:{room:lessonId}},
  {eventId:()=>id(1),now:()=>new Date(1000)}),seq:1}
  const factual = adaptLegacyLessonOsV1Log({...await circuitProofEvent(proof,"circuit-reasoning",2000),seq:2},
    {lessonId,sessionId,producer,actor,eventId:id(2),idempotencyKey:null})
  const scene = JSON.parse(JSON.stringify({elements:[{id:"circuit-reasoning",type:"embeddable",customData:{
    maestroTool:{owner:"io.ardesia.circuit-reasoning",state:{kind:"circuitcheck-proof-v1",netlist:proof.netlist,
      method:"auto",proof,selectedStep:0,trace:[],diagnosis:null}},
  }}]}))
  return {proof,started,factual,scene}
}

async function load(input:Awaited<ReturnType<typeof scenario>>,options:{
  events?:AppendedEventEnvelopeV2[];created?:number;cache?:boolean;missingSession?:boolean;
  persistence?:ContinuityPersistenceStatusV1;build?:string|null;journal?:string;
} = {}) {
  const files = new Map<string,Blob>([
    [roomPaths(lessonId).scene,new Blob([JSON.stringify(input.scene)])],
    [roomPaths(lessonId).journal,new Blob([options.journal??""])],
  ])
  if (!options.missingSession) files.set(sessionPaths(scope).session,new Blob([Uint8Array.from(serializeSessionYamlV2({
    v:2,lessonId,sessionId,created:options.created??1000,revision:0,audioConsent:false,audioStartEpoch:null,
  }))]))
  const workspace = createImportedBundleContinuityWorkspaceReader(files)
  const result = await loadScopedContinuitySnapshot(scope,{
    createEventReader:async()=>({persistence:options.persistence??{kind:"verified-indexeddb",database:"test"},
      readEnvelopesBySession:async()=>options.events??[input.started,input.factual],dispose:async()=>{}}),
    createWorkspaceReader:async()=>options.cache ? {...workspace,persistence:{kind:"local-storage"}}:workspace,
    buildCommitSha:options.build === undefined ? producer.commitSha:options.build,
  })
  if (result.kind !== "loaded") throw new Error("scope unexpectedly rejected")
  return result.snapshot
}

describe("Continuità CircuitCheck — riferimenti verificati sui dati persistiti",()=>{
  it("risolve la prova e l'evento di sessione senza riscrivere declared o promuovere la cache",async()=>{
    const input = await scenario()
    const snapshot = await load(input,{cache:true})
    const occurrence = snapshot.evidenceByOccurrence.get(`${id(2)}:0`)!
    expect(occurrence).toMatchObject({declared:"missing",status:"resolved",reason:null,
      target:{kind:"board-element",lessonId,elementId:"circuit-reasoning",href:`/#${lessonId}`}})
    expect(snapshot.evidenceByOccurrence.get(`${id(1)}:0`)).toMatchObject({status:"resolved",
      target:{kind:"lesson-event",eventId:id(1),lessonId,sessionId}})
    expect(input.factual.evidence[0]!.resolution).toBe("missing")
    expect(input.proof.verification!.product_verified).toBe(false)
    const projection = projectContinuityV1(snapshot)
    expect(projection.phase).toBe("degraded")
    expect(projection.missingEvidence).toEqual([])
    expect(snapshot.issues.filter(issue=>issue.code === "local-storage-non-authoritative")).toHaveLength(3)
  })

  it.each(["answer","svg","focus","event-hash","engine-revision","wrong-producer","deleted","absent","duplicate","wrong-owner"])("non risolve prova %s",async variant=>{
    const input = await scenario()
    const el = input.scene.elements[0]
    const proof = el.customData.maestroTool.state.proof
    if (variant === "answer") proof.answer.exact = "123"
    if (variant === "svg") proof.steps[0].svg = '<svg xmlns="http://www.w3.org/2000/svg"><text>alterato</text></svg>'
    if (variant === "focus") proof.steps[0].focus = ["different-reference"]
    if (variant === "event-hash") input.factual = {...input.factual,payload:{...input.factual.payload,proofSha256:"0".repeat(64)}}
    if (variant === "engine-revision") input.factual = {...input.factual,payload:{...input.factual.payload,engineRevision:"0".repeat(40)}}
    if (variant === "wrong-producer") input.factual = {...input.factual,producer:{...producer,id:"different.producer"}}
    if (variant === "deleted") el.isDeleted = true
    if (variant === "absent") input.scene.elements = []
    if (variant === "duplicate") input.scene.elements.push(structuredClone(el))
    if (variant === "wrong-owner") el.customData.maestroTool.owner = "io.ardesia.other"
    const snapshot = await load(input)
    expect(snapshot.evidenceByOccurrence.get(`${id(2)}:0`)?.status).not.toBe("resolved")
    expect(snapshot.evidenceByOccurrence.get(`${id(2)}:0`)?.target).toBeNull()
  })

  it.each(["session-missing","session-created","build-missing","build-mismatch","data-loss","duplicate-start","foreign-scope"])("blocca la risoluzione con %s",async variant=>{
    const input = await scenario()
    const options:Parameters<typeof load>[1] = {}
    if (variant === "session-missing") options.missingSession = true
    if (variant === "session-created") options.created = 1001
    if (variant === "build-missing") options.build = null
    if (variant === "build-mismatch") options.build = "f".repeat(40)
    if (variant === "data-loss") options.persistence = {kind:"data-loss",code:"truncated",database:"test"}
    if (variant === "duplicate-start") options.events = [input.started,input.factual,{...input.started,eventId:id(3),seq:3}]
    if (variant === "foreign-scope") options.events = [input.started,{...input.factual,lessonId:"another-lesson"}]
    const snapshot = await load(input,options)
    expect([...snapshot.evidenceByOccurrence.values()].some(item=>item.status === "resolved")).toBe(false)
  })

  it.each([`lesson:${lessonId}@1e3`,`lesson:${lessonId}@01000`,`lesson:${lessonId}@999`,`lesson:${lessonId}@2000`,"lesson:other@1000"])("non risolve il riferimento %s",async ref=>{
    const input = await scenario()
    input.started = {...input.started,evidence:[{ref,resolution:"verified"}]}
    const snapshot = await load(input)
    expect(snapshot.evidenceByOccurrence.get(`${id(1)}:0`)?.status).not.toBe("resolved")
  })

  it("non sceglie tra due eventi con lo stesso timestamp",async()=>{
    const input = await scenario()
    input.factual = {...input.factual,occurredAt:input.started.occurredAt}
    const snapshot = await load(input)
    expect(snapshot.evidenceByOccurrence.get(`${id(1)}:0`)?.status).not.toBe("resolved")
  })

  it("lascia consultative le citazioni AI e non risolve retroattivamente il journal",async()=>{
    const input = await scenario()
    const sources = [{ref:"board:circuit-reasoning",resolution:"missing" as const},{ref:`lesson:${lessonId}@1000`,resolution:"missing" as const}]
    const ai:AppendedEventEnvelopeV2 = {...createEventEnvelopeV2({lessonId,sessionId,producer,
      actor:{type:"system",id:"ai.consultative"},kind:"ai.advice.proposed",causationId:null,idempotencyKey:null,evidence:sources,
      payload:{model:{provider:"test",id:"test",version:"1"},sources,actionLevel:"A0",humanReview:"pending"}},
    {eventId:()=>id(3),now:()=>new Date(3000)}),seq:3}
    const journal = createEventEnvelopeV2({lessonId,sessionId,producer,actor,kind:"journal.element.add",
      causationId:null,idempotencyKey:null,evidence:[{ref:"board:circuit-reasoning",resolution:"verified"}],
      payload:{element:input.scene.elements[0] as JsonObject}}, {eventId:()=>id(4),now:()=>new Date(1500)})
    const snapshot = await load(input,{events:[input.started,input.factual,ai],journal:JSON.stringify(journal)+"\n"})
    expect(snapshot.evidenceByOccurrence.get(`${id(2)}:0`)?.status).toBe("resolved")
    for (const key of [`${id(3)}:0`,`${id(3)}:1`,`${id(4)}:0`]) {
      expect(snapshot.evidenceByOccurrence.get(key)?.status).not.toBe("resolved")
      expect(snapshot.evidenceByOccurrence.get(key)?.target).toBeNull()
    }
  })
})
