import { describe, expect, it } from "vitest"
import {
  readCircuitDiagnosis, readCircuitProof, readCircuitState,
  type CircuitTraceStep,
} from "../toolhost/circuitCheckAdapter"
import { circuitProofEvent, circuitTraceEvent } from "../lessonos/circuitCheckEvent"
import { adaptLegacyLessonOsV1Log, assertLessonOsEnvelopePayload, InMemoryEventLog } from "../lessonos/eventlog"
import { materialize } from "../lessonos/materializer"
import { buildLessonStudyDigest, buildStudyDigest } from "../lessonos/studyDigest"
import { buildCircuitCheckInsert, parseToolLink } from "../toolhost/ToolCanvasEmbeddable"
import { EMBED_DATA_KEY, embedOwner } from "../toolhost/caps/board"
import { circuitStudyEvidence } from "../lessonos/circuitStudyEvidence"
import { buildRecapHtml } from "../store/recapHtml"

const netlist = "V1 p 0 14 volt\nR1 p q 4 ohm\nR2 q 0 6 ohm\n? voltage R2"
const fingerprint = "e".repeat(64)
const response = {
  outcome: "solved", netlist, fingerprint, source_sha: "a".repeat(40),
  title: "Tensione di R2", method: "divider",
  verification: { electrical_claim: "VERIFIED", backend: "CLOSED" },
  answer: { exact: "42/5", unit: "V", reference: "q → 0" },
  steps: [{ title: "Riduciamo", explanation: "R1 e R2 sono in serie.",
    svg: '<svg xmlns="http://www.w3.org/2000/svg"></svg>', equations: ["R1+R2=10 Ω"] }],
}
const trace: CircuitTraceStep[] = [{
  transcription: "R1+R2=10", operation: "serie", first: "R1", second: "R2",
  claimed_value: "10", reading: "clear",
}]

describe("CircuitCheck nel confine Ardesia", () => {
  it("rifiuta risultati senza verifica elettrica o riferiti a un altro circuito", () => {
    expect(() => readCircuitProof({...response, verification: {electrical_claim:"UNVERIFIED",backend:"CLOSED"}}, netlist)).toThrow(/verificata/)
    expect(() => readCircuitProof(response, netlist.replace("14", "15"))).toThrow(/verificata/)
  })

  it("l'oggetto della lavagna è posseduto, distinto per istanza e riapre come prova storica", () => {
    const first = buildCircuitCheckInsert([])!
    const second = buildCircuitCheckInsert([{id:first.embedId}])!
    expect(second.embedId).not.toBe(first.embedId)
    expect(parseToolLink(String(first.embed.link))).toEqual({toolId:"io.ardesia.circuit-reasoning", embedId:first.embedId})
    expect(embedOwner(first.embed as {id:string;customData?:Record<string,unknown>})).toBe("io.ardesia.circuit-reasoning")
    expect((first.embed.customData as Record<string,unknown>)[EMBED_DATA_KEY]).toBeDefined()
    const proof = readCircuitProof(response, netlist)
    const stored = readCircuitState({kind:"circuitcheck-proof-v1",netlist,method:"auto",proof,
      selectedStep:0,trace,diagnosis:{outcome:"valid_so_far"}})
    expect(stored.proof?.answer.exact).toBe("42/5")
    expect(stored.diagnosis).toBeNull() // una vecchia diagnosi non è corrente
    expect(readCircuitState({...stored, trace:[{operation:"nonsense"}]}).proof).toBeNull()
  })

  it("il primo passo errato alimenta il digest con il metodo osservato, senza inventare padronanza", async () => {
    const proof = readCircuitProof(response, netlist)
    const diagnosis = readCircuitDiagnosis({outcome:"first_invalid", step:1,
      message:"La riduzione cambia i nodi", focus:["R1","R2"], circuit_fingerprint:fingerprint}, fingerprint)
    const log = new InMemoryEventLog()
    const event = circuitProofEvent(proof, "circuit-reasoning", 1000)
    await log.append(event)
    await log.append(await circuitTraceEvent(proof, trace, diagnosis, "circuit-reasoning", 1100))
    const graph = materialize(await log.readAll())
    const attempt = [...graph.nodes.keys()].find(key => key.startsWith("circuit-attempt:"))!
    const digest = buildStudyDigest(graph)
    expect(graph.nodes.get(`circuit:${fingerprint}`)?.evidenceRefs).toContain("board:circuit-reasoning")
    expect(graph.edges).toContainEqual(expect.objectContaining({from:attempt,to:`circuit:${fingerprint}`,kind:"deriva-da"}))
    expect(digest.concepts).toEqual([expect.objectContaining({id:"circuit:method:serie",label:"Riduzione in serie"})])
    expect(digest.errors).toEqual([expect.objectContaining({
      id:`${attempt}:error`, conceptId:"circuit:method:serie", corrected:false,
      evidence:["board:circuit-reasoning"],
    })])
    expect(digest.errors[0]?.label).toContain("La riduzione cambia i nodi")
    const identity = {lessonId:"lesson:circuit",sessionId:"11111111-1111-4111-8111-111111111111",
      eventId:"70000000-0000-4000-8000-000000000001",actor:{type:"teacher" as const,id:"synthetic"},
      producer:{id:"test.circuit",version:"1.0.0",commitSha:"a".repeat(40)},idempotencyKey:null}
    const envelopes = (await log.readAll()).map((event,i) => adaptLegacyLessonOsV1Log(event, {
      ...identity,eventId:`70000000-0000-4000-8000-${String(i+1).padStart(12,"0")}`,
    }))
    expect(buildLessonStudyDigest(envelopes)).toEqual(digest)
    expect((await log.readAll()).map(item => item.kind)).toEqual(["circuit.proof.verified","circuit.trace.assessed"])
  })

  it("un tentativo valido fin qui o non valutabile non diventa errore o competenza", async () => {
    const proof = readCircuitProof(response, netlist)
    for (const outcome of ["valid_so_far", "not_assessable"] as const) {
      const log = new InMemoryEventLog()
      await log.append(circuitProofEvent(proof, "circuit-reasoning", 1000))
      await log.append(await circuitTraceEvent(proof, trace, {
        outcome, step:null, message:"Ancora nessuna diagnosi di errore", focus:[],
        circuit_fingerprint:fingerprint,
      }, "circuit-reasoning", 1100))
      expect(buildStudyDigest(materialize(await log.readAll()))).toEqual({concepts:[],errors:[]})
    }
  })

  it("rifiuta una proiezione semantica parziale o attribuita a un tentativo non valutabile", () => {
    const base = {attemptId:"attempt:a",exerciseId:"circuit:a",labels:{it:"Tentativo"}}
    expect(() => assertLessonOsEnvelopePayload("circuit.trace.assessed", {
      ...base,outcome:"first_invalid",firstInvalidStep:1,errorId:"error:a",
    })).toThrow(/metodo completo/)
    expect(() => assertLessonOsEnvelopePayload("circuit.trace.assessed", {
      ...base,outcome:"not_assessable",firstInvalidStep:1,errorId:"error:a",
      conceptId:"circuit:method:serie",conceptLabels:{it:"Riduzione in serie"},
    })).toThrow(/primo passaggio valutato/)
  })

  it("il materiale stampabile usa solo la prova e il tentativo che coincidono con gli eventi della lezione", async () => {
    const proof = readCircuitProof(response, netlist)
    const inserted = buildCircuitCheckInsert([])!
    const marker = {owner:"io.ardesia.circuit-reasoning", state:{
      kind:"circuitcheck-proof-v1", netlist, method:"auto", proof,
      selectedStep:0, trace, diagnosis:null,
    }}
    const scene = JSON.stringify({elements:[{...inserted.embed, customData:{[EMBED_DATA_KEY]:marker}}]})
    const log = new InMemoryEventLog()
    expect(await circuitStudyEvidence(scene, await log.readAll())).toEqual([])
    await log.append(circuitProofEvent(proof, inserted.embedId, 1000))
    let evidence = await circuitStudyEvidence(scene, await log.readAll())
    expect(evidence).toHaveLength(1)
    expect(evidence[0]!.assessment).toBeNull()
    const diagnosis = readCircuitDiagnosis({outcome:"first_invalid",step:1,
      message:"Valore errato",focus:["R1"],circuit_fingerprint:fingerprint},fingerprint)
    await log.append(await circuitTraceEvent(proof, trace, diagnosis, inserted.embedId, 1100))
    evidence = await circuitStudyEvidence(scene, await log.readAll())
    expect(evidence[0]!.assessment).toContain("primo passaggio")
    const html = buildRecapHtml({v:1,title:"Lezione circuiti",durationMs:1000,
      mathFormulas:[],elementTypeCounts:{embeddable:1},totalElementsAdded:1,
      pdfPagesViewed:[],firstEventTime:1000,lastEventTime:2000},undefined,evidence)
    expect(html).toContain("Ragionamento sui circuiti")
    expect(html).toContain("42/5")
    expect(html).not.toContain("<svg") // il render Node non emette SVG senza sanitizer DOM
    expect(html).toContain("Procedimento dello studente")
    expect(html).toContain("R1+R2=10 Ω")
    const changed = scene.replace("42/5", "42/4")
    expect(await circuitStudyEvidence(changed, await log.readAll())).toEqual([])
  })
})
