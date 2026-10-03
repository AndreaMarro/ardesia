import { describe, expect, it } from "vitest"
import { readCircuitProof, readCircuitState } from "../toolhost/circuitCheckAdapter"
import { circuitProofSha256 } from "../lessonos/circuitCheckEvent"
import { lessonExpressionMarkup, lessonMathMarkup } from "../toolhost/lessonMath"
import legacy from "./fixtures/circuitcheck-ac-response.json"
import actual from "./fixtures/circuitcheck-math-response.json"
import power from "./fixtures/circuitcheck-power-response.json"

describe("formule strutturate portabili CircuitCheck",()=>{
  it("conserva gli AST reali di Kirchhoff nel roundtrip e li lega al digest",async()=>{
    const proof=readCircuitProof(actual,actual.netlist)
    expect(proof.answer.math).toEqual(actual.answer.math)
    expect(proof.answer.display_exact).toBe(actual.answer.display_exact)
    expect(proof.steps.map(s=>s.math)).toEqual(actual.steps.map(s=>s.math))
    const restored=readCircuitState(JSON.parse(JSON.stringify({kind:"circuitcheck-proof-v1",netlist:actual.netlist,
      method:"auto",proof,selectedStep:0,trace:[],diagnosis:null}))).proof
    expect(restored).toEqual(proof)
    expect(await circuitProofSha256(restored!)).toBe(await circuitProofSha256(proof))
    const changed={...proof,steps:proof.steps.map((s,i)=>i ? s : {...s,math:[{kind:"equation",left:{kind:"symbol",name:"other"},right:{kind:"number",coefficients:["1","0","0","0"]}}]})}
    expect(await circuitProofSha256(changed)).not.toBe(await circuitProofSha256(proof))
    expect(await circuitProofSha256({...proof,answer:{...proof.answer,display_exact:"other"}})).not.toBe(await circuitProofSha256(proof))
  })
  it("mantiene il digest frozen dei dati storici privi di AST",async()=>{
    expect(await circuitProofSha256(readCircuitProof(legacy,legacy.netlist))).toBe("478969cd4002dc37209e2db50e350792815298e8d32e2370f824274450314bc5")
  })
  it("non permette a un AST formalmente valido di sostituire la risposta fasoriale o di potenza",()=>{
    const wrong={kind:"number",coefficients:["999","0","0","0"]}
    expect(lessonExpressionMarkup(wrong)).not.toBeNull()
    expect(()=>readCircuitProof({...actual,answer:{...actual.answer,math:wrong}},actual.netlist)).toThrow("coordinate esatte")
    expect(()=>readCircuitProof({...power,answer:{...power.answer,math:wrong}},power.netlist)).toThrow("coordinate esatte")
    const right={kind:"number",coefficients:power.answer.complex_power.coefficients}
    expect(readCircuitProof({...power,answer:{...power.answer,math:right}},power.netlist).answer.math).toEqual(right)
  })
  it("rifiuta AST malformati o troppo profondi invece di ignorarli nella prova",()=>{
    const malformed={kind:"equation",left:{kind:"symbol",name:"x"},right:{kind:"number",coefficients:["1/0","0","0","0"]}}
    expect(()=>readCircuitProof({...actual,steps:[{...actual.steps[0],math:[malformed]}]},actual.netlist)).toThrow("formula")
    let deep:unknown={kind:"number",coefficients:["1","0","0","0"]}
    for(let i=0;i<40;i++)deep={kind:"multiply",args:[deep]}
    expect(lessonExpressionMarkup(deep)).toBeNull()
    expect(lessonMathMarkup([{kind:"equation",left:{kind:"symbol",name:"x"},right:deep}])).toBeNull()
    expect(()=>readCircuitProof({...legacy,answer:{...legacy.answer,display_exact:"wrong"}},legacy.netlist)).toThrow("espressione esatta")
  })
  it("genera frazioni e radicali nativi e tratta le stringhe come testo",()=>{
    const result=lessonExpressionMarkup(actual.answer.math)!
    expect(result).toContain("<mfrac>")
    expect(result).toContain("<msqrt>")
    expect(result).toContain("<mi>j</mi>")
    const payload='<img src=x onerror="alert(1)">'
    const markup=lessonMathMarkup([{kind:"equation",left:{kind:"symbol",name:payload},right:{kind:"number",coefficients:["1","0","0","0"]},unit:payload}])!
    expect(markup).not.toContain("<img")
    expect(markup).toContain("&lt;img")
    expect(markup).toContain("&quot;")
  })
})
