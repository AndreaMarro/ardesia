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
import { circuitNextLessonEvidence, circuitStudyEvidence } from "../lessonos/circuitStudyEvidence"
import { buildRecapHtml } from "../store/recapHtml"

const netlist = "V1 p 0 14 volt\nR1 p q 4 ohm\nR2 q 0 6 ohm\n? voltage R2"
const fingerprint = "e".repeat(64)
const response = {
  outcome: "solved", netlist, fingerprint, source_sha: "a".repeat(40), lesson_build:"b".repeat(64),
  title: "Tensione di R2", method: "divider",
  verification: { electrical_claim: "VERIFIED", backend: "CLOSED",
    lesson: "exact-answer-crosscheck", product_verified: false },
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
    expect(() => readCircuitProof({...response, verification:{electrical_claim:"VERIFIED",backend:"CLOSED"}}, netlist)).toThrow(/verificata/)
    const proof = readCircuitProof(response, netlist)
    expect(proof.schema).toBe("circuit-proof.v2")
    expect(proof.scope).toBe("electrical_result")
    expect(proof.verification).toEqual(response.verification)
    const photo = {source_kind:"image",source_sha256:"c".repeat(64),
      circuit_sha256:fingerprint,confirmed_at_unix:1780000000}
    expect(readCircuitProof({...response,input_provenance:photo},netlist).inputProvenance).toEqual(photo)
    expect(() => readCircuitProof({...response,input_provenance:{...photo,circuit_sha256:"d".repeat(64)}},netlist)).toThrow(/provenienza/)
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
    expect(stored.proof?.scope).toBe("electrical_result")
    expect(stored.diagnosis).toBeNull() // una vecchia diagnosi non è corrente
    expect(readCircuitState({...stored, trace:[{operation:"nonsense"}]}).proof).toBeNull()
    const legacy = readCircuitState({...stored, proof:{...proof, schema:undefined, scope:undefined, verification:undefined}})
    expect(legacy.proof?.answer.exact).toBe("42/5")
    expect(legacy.proof?.scope).toBe("legacy_unrecorded")
  })

  it("il primo passo errato alimenta il digest con il metodo osservato, senza inventare padronanza", async () => {
    const proof = readCircuitProof(response, netlist)
    const diagnosis = readCircuitDiagnosis({outcome:"first_invalid", step:1,
      message:"La riduzione cambia i nodi", focus:["R1","R2"], circuit_fingerprint:fingerprint}, fingerprint)
    const log = new InMemoryEventLog()
    const event = await circuitProofEvent(proof, "circuit-reasoning", 1000)
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
      await log.append(await circuitProofEvent(proof, "circuit-reasoning", 1000))
      await log.append(await circuitTraceEvent(proof, trace, {
        outcome, step:null, message:"Ancora nessuna diagnosi di errore", focus:[],
        circuit_fingerprint:fingerprint,
      }, "circuit-reasoning", 1100))
      expect(buildStudyDigest(materialize(await log.readAll()))).toEqual({concepts:[],errors:[]})
    }
  })

  it("una correzione valutata collega due tentativi dello stesso circuito senza dichiarare padronanza", async () => {
    const proof = readCircuitProof(response, netlist)
    const log = new InMemoryEventLog()
    await log.append(await circuitProofEvent(proof, "circuit-reasoning", 1000))
    const wrong = await circuitTraceEvent(proof, trace, {
      outcome:"first_invalid",step:1,message:"Somma errata",focus:["R1","R2"],
      circuit_fingerprint:fingerprint,
    }, "circuit-reasoning", 1100)
    await log.append(wrong)
    const fixedTrace = [{...trace[0]!, transcription:"R1+R2=20", claimed_value:"20"}]
    await log.append(await circuitTraceEvent(proof, fixedTrace, {
      outcome:"valid_so_far",step:null,message:"Passaggio valido",focus:[],
      circuit_fingerprint:fingerprint,
    }, "altra-lavagna", 1150, wrong.kind === "circuit.trace.assessed" ? wrong.errorId : undefined))
    expect(buildStudyDigest(materialize(await log.readAll())).errors[0]?.corrected).toBe(false)
    await log.append(await circuitTraceEvent(proof, fixedTrace, {
      outcome:"valid_so_far",step:null,message:"Passaggio valido",focus:[],
      circuit_fingerprint:fingerprint,
    }, "circuit-reasoning", 1200, wrong.kind === "circuit.trace.assessed" ? wrong.errorId : undefined))
    const events = await log.readAll()
    const graph = materialize(events)
    const digest = buildStudyDigest(graph)
    expect(digest.errors).toEqual([expect.objectContaining({id:wrong.kind === "circuit.trace.assessed" ? wrong.errorId : "",corrected:true})])
    expect(graph.edges).toContainEqual(expect.objectContaining({
      from:events[3]!.kind === "circuit.trace.assessed" ? events[3]!.attemptId : "",
      to:wrong.kind === "circuit.trace.assessed" ? wrong.errorId : "",kind:"corregge",
    }))
  })

  it("KCL e osservabili alternativi restano sulla lavagna e generano un errore locale correggibile", async () => {
    const proof = readCircuitProof(response, netlist)
    for (const [operation, label] of [["kcl","KCL al nodo"],["corrente","Corrente di un componente"],["tensione","Tensione di un componente"]] as const) {
      const step: CircuitTraceStep = {transcription:`${operation} del circuito`,operation,
        first:operation === "kcl" ? "q" : "R2",second:operation === "kcl" ? "-R1,+R2" : "",
        claimed_value:operation === "kcl" ? null : "1/2",reading:"clear"}
      const restored = readCircuitState({kind:"circuitcheck-proof-v1",netlist,method:"auto",proof,
        selectedStep:0,trace:[step],diagnosis:null,pendingErrorId:null})
      expect(restored.trace).toEqual([step])
      const wrong = await circuitTraceEvent(proof,[step],{
        outcome:"first_invalid",step:1,message:"Passaggio da correggere",focus:[step.first],
        circuit_fingerprint:fingerprint,
      },"circuit-reasoning",1100)
      expect(wrong.conceptId).toBe(`circuit:method:${operation}`)
      expect(wrong.conceptLabels?.it).toBe(label)
      expect(wrong.observedStep).toEqual(step)
      const log = new InMemoryEventLog()
      await log.append(await circuitProofEvent(proof,"circuit-reasoning",1000))
      await log.append(wrong)
      const fixed = await circuitTraceEvent(proof,[{...step,transcription:"corretto"}],{
        outcome:"valid_so_far",step:null,message:"Passaggio valido",focus:[],circuit_fingerprint:fingerprint,
      },"circuit-reasoning",1200,wrong.errorId)
      await log.append(fixed)
      expect(buildStudyDigest(materialize(await log.readAll())).errors).toEqual([
        expect.objectContaining({id:wrong.errorId,corrected:true}),
      ])
    }
  })

  it("KVL attraversa lavagna, evento e lezione successiva senza perdere la prova", async () => {
    const proof = readCircuitProof(response, netlist)
    const inserted = buildCircuitCheckInsert([])!
    const kvl: CircuitTraceStep = {
      transcription:"4 I + 6 I + 14 = 0", operation:"kvl", first:"p",
      second:"+R1,+R2,+V1", claimed_value:null, reading:"clear",
    }
    const state = readCircuitState({kind:"circuitcheck-proof-v1",netlist,method:"auto",proof,
      selectedStep:0,trace:[kvl],diagnosis:null,pendingErrorId:null})
    expect(state.proof?.fingerprint).toBe(fingerprint)
    expect(state.trace).toEqual([kvl])
    const scene = JSON.stringify({elements:[{...inserted.embed,customData:{
      [EMBED_DATA_KEY]:{owner:"io.ardesia.circuit-reasoning",state},
    }}]})
    const log = new InMemoryEventLog()
    await log.append(await circuitProofEvent(proof,inserted.embedId,1000))
    const wrong = await circuitTraceEvent(proof,[kvl],{
      outcome:"first_invalid",step:1,message:"Manca un termine nella maglia",
      focus:["V1","R1","R2"],circuit_fingerprint:fingerprint,
    },inserted.embedId,1100)
    expect(wrong.conceptId).toBe("circuit:method:kvl")
    expect(wrong.conceptLabels?.it).toBe("KVL nella maglia")
    expect(wrong.observedStep).toEqual(kvl)
    await log.append(wrong)
    const events = await log.readAll()
    expect((await circuitStudyEvidence(scene,events))[0]?.assessedTrace).toEqual([kvl])
    const identity = {lessonId:"lesson-a",sessionId:"11111111-1111-4111-8111-111111111111",
      eventId:"70000000-0000-4000-8000-000000000001",actor:{type:"teacher" as const,id:"synthetic"},
      producer:{id:"test.circuit",version:"1.0.0",commitSha:"a".repeat(40)},idempotencyKey:null}
    const envelopes = events.map((event,i) => adaptLegacyLessonOsV1Log(event,{
      ...identity,eventId:`70000000-0000-4000-8000-${String(i+1).padStart(12,"0")}`,
    }))
    expect((await circuitNextLessonEvidence(scene,envelopes,"lesson-a"))).toEqual([
      expect.objectContaining({embedId:inserted.embedId,errorId:wrong.errorId,
        observedStep:kvl,corrected:false}),
    ])
    expect(buildLessonStudyDigest(envelopes).errors[0]?.conceptId).toBe("circuit:method:kvl")
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
    expect(() => assertLessonOsEnvelopePayload("circuit.trace.assessed", {
      ...base,outcome:"not_assessable",correctsErrorId:"error:a",
    })).toThrow(/correzione CircuitCheck/)
    expect(() => assertLessonOsEnvelopePayload("circuit.trace.assessed", {
      ...base,outcome:"first_invalid",firstInvalidStep:1,
      errorId:"error:a",conceptId:"circuit:method:kcl",conceptLabels:{it:"KCL"},
      observedStep:{...trace[0],operation:"inventato"},
    })).toThrow(/circuit_step/)
    expect(() => assertLessonOsEnvelopePayload("circuit.trace.assessed", {
      ...base,outcome:"valid_so_far",observedStep:trace[0],
    })).toThrow(/passaggio osservato/)
    expect(() => assertLessonOsEnvelopePayload("circuit.proof.verified", {
      exerciseId:"circuit:a",circuitFingerprint:fingerprint,embedId:"board:a",
      answerExact:"42/5",unit:"V",engineRevision:"a".repeat(40),labels:{it:"Risultato"},
      verificationScope:"electrical_result",
    })).toThrow(/scope CircuitCheck/)
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
    await log.append(await circuitProofEvent(proof, inserted.embedId, 1000))
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
    const changedEquation = scene.replace("R1+R2=10 Ω", "R1+R2=20 Ω")
    expect(await circuitStudyEvidence(changedEquation, await log.readAll())).toEqual([])
    const changedSvg = scene.replace('<svg xmlns=\\\"http://www.w3.org/2000/svg\\\"></svg>',
      '<svg xmlns=\\\"http://www.w3.org/2000/svg\\\"><text>falso</text></svg>')
    expect(changedSvg).not.toBe(scene)
    expect(await circuitStudyEvidence(changedSvg, await log.readAll())).toEqual([])
    const legacy = scene.replace('"schema":"circuit-proof.v2"','"schema":"circuit-proof.v1"')
    expect(await circuitStudyEvidence(legacy, await log.readAll())).toEqual([])
    const olderEvents = (await log.readAll()).map(event => {
      if (event.kind !== "circuit.proof.verified") return event
      const old = {...event}
      delete old.verificationScope
      delete old.lessonBuild
      return old
    })
    expect(await circuitStudyEvidence(scene, olderEvents)).toEqual([])
    const unhashedEvents = (await log.readAll()).map(event => {
      if (event.kind !== "circuit.proof.verified") return event
      const old = {...event}
      delete old.proofSha256
      return old
    })
    expect(await circuitStudyEvidence(scene, unhashedEvents)).toEqual([])
  })

  it("recupera il passaggio osservato dalla lezione A senza importare la correzione della lezione B", async () => {
    const proof = readCircuitProof(response, netlist)
    const inserted = buildCircuitCheckInsert([])!
    const scene = JSON.stringify({elements:[{...inserted.embed,customData:{
      [EMBED_DATA_KEY]:{owner:"io.ardesia.circuit-reasoning",state:{
        kind:"circuitcheck-proof-v1",netlist,method:"auto",proof,
        selectedStep:0,trace:[{...trace[0]!,claimed_value:"20"}],diagnosis:null,
      }},
    }}]})
    const log = new InMemoryEventLog()
    await log.append(await circuitProofEvent(proof,inserted.embedId,1000))
    const wrong = await circuitTraceEvent(proof,trace,{
      outcome:"first_invalid",step:1,message:"Somma errata",focus:["R1"],
      circuit_fingerprint:fingerprint,
    },inserted.embedId,1100)
    await log.append(wrong)
    const corrected = await circuitTraceEvent(proof,[{...trace[0]!,claimed_value:"20"}],{
      outcome:"valid_so_far",step:null,message:"Corretto",focus:[],
      circuit_fingerprint:fingerprint,
    },inserted.embedId,1200,wrong.errorId)
    await log.append(corrected)
    const events = await log.readAll()
    const envelope = (event: typeof events[number],index:number,lessonId:string) =>
      adaptLegacyLessonOsV1Log(event,{
        lessonId,sessionId:"11111111-1111-4111-8111-111111111111",
        eventId:`70000000-0000-4000-8000-${String(index+1).padStart(12,"0")}`,
        actor:{type:"teacher",id:"synthetic"},
        producer:{id:"test.circuit",version:"1.0.0",commitSha:"a".repeat(40)},
        idempotencyKey:null,
      })
    const mixed = [envelope(events[0]!,0,"lesson-a"),envelope(events[1]!,1,"lesson-a"),
      envelope(events[2]!,2,"lesson-b")]
    const fromA = await circuitNextLessonEvidence(scene,mixed,"lesson-a")
    expect(fromA).toEqual([expect.objectContaining({
      embedId:inserted.embedId,errorId:wrong.errorId,
      observedStep:trace[0],corrected:false,
    })])
    expect(await circuitNextLessonEvidence(scene,mixed,"lesson-b")).toEqual([])
    const allA = [...mixed.slice(0,2),envelope(events[2]!,3,"lesson-a")]
    expect((await circuitNextLessonEvidence(scene,allA,"lesson-a"))[0]?.corrected).toBe(true)
  })
})
