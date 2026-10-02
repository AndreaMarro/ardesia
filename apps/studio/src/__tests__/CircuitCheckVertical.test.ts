import { describe, expect, it } from "vitest"
import {
  readCircuitDiagnosis, readCircuitProof, readCircuitState,
  type CircuitTraceStep,
} from "../toolhost/circuitCheckAdapter"
import { circuitProofEvent, circuitTraceEvent } from "../lessonos/circuitCheckEvent"
import { InMemoryEventLog } from "../lessonos/eventlog"
import { materialize } from "../lessonos/materializer"
import { buildCircuitCheckInsert, parseToolLink } from "../toolhost/ToolCanvasEmbeddable"
import { EMBED_DATA_KEY, embedOwner } from "../toolhost/caps/board"

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

  it("il log conserva prova e tentativo con riferimenti alla lavagna, senza inventare una competenza", async () => {
    const proof = readCircuitProof(response, netlist)
    const diagnosis = readCircuitDiagnosis({outcome:"first_invalid", step:1,
      message:"La riduzione cambia i nodi", focus:["R1","R2"], circuit_fingerprint:fingerprint}, fingerprint)
    const log = new InMemoryEventLog()
    const event = circuitProofEvent(proof, "circuit-reasoning", 1000)
    await log.append(event)
    await log.append(await circuitTraceEvent(proof, trace, diagnosis, "circuit-reasoning", 1100))
    const graph = materialize(await log.readAll())
    const attempt = [...graph.nodes.keys()].find(key => key.startsWith("circuit-attempt:"))!
    expect(graph.nodes.get(`circuit:${fingerprint}`)?.evidenceRefs).toContain("board:circuit-reasoning")
    expect(graph.edges).toContainEqual(expect.objectContaining({from:attempt,to:`circuit:${fingerprint}`,kind:"deriva-da"}))
    expect([...graph.nodes.values()].every(node => node.kind !== "concetto")).toBe(true)
    expect((await log.readAll()).map(item => item.kind)).toEqual(["circuit.proof.verified","circuit.trace.assessed"])
  })
})
