// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { CircuitCheckEmbed } from "../toolhost/CircuitCheckEmbed"
import { CIRCUIT_CHECK_TOOL_ID, readCircuitProof } from "../toolhost/circuitCheckAdapter"
import { EMBED_DATA_KEY } from "../toolhost/caps/board"
import { buildRecapHtml } from "../store/recapHtml"
import actual from "./fixtures/circuitcheck-math-response.json"
import legacy from "./fixtures/circuitcheck-ac-response.json"

afterEach(cleanup)
describe("formule leggibili nella lavagna e nel documento portabile",()=>{
  it("riapre risultato e passaggi reali come MathML nativo con frazioni e radicali",()=>{
    const proof=readCircuitProof(actual,actual.netlist)
    const result=render(<CircuitCheckEmbed toolLink={{toolId:CIRCUIT_CHECK_TOOL_ID,embedId:"math-proof"}}
      element={{id:"math-proof",customData:{[EMBED_DATA_KEY]:{owner:CIRCUIT_CHECK_TOOL_ID,state:{kind:"circuitcheck-proof-v1",netlist:proof.netlist,
        method:"auto",proof,selectedStep:0,trace:[],diagnosis:null}}}}}/>)
    const answer=result.container.querySelector('[data-circuit-math="answer"]')!
    expect(answer.querySelectorAll("math")).toHaveLength(1)
    expect(answer.querySelector("mfrac")).not.toBeNull()
    expect(answer.querySelector("msqrt")).not.toBeNull()
    expect(result.container.querySelector('[data-circuit-math="steps"] math')).not.toBeNull()
    expect(result.container.querySelectorAll("script")).toHaveLength(0)
  })
  it("il recap conserva MathML autosufficiente, insieme a scope, schema e testo storico",()=>{
    const proof=readCircuitProof(actual,actual.netlist)
    const html=buildRecapHtml({v:1,title:"Lezione AC",durationMs:1000,mathFormulas:[],elementTypeCounts:{embeddable:1},
      totalElementsAdded:1,pdfPagesViewed:[],firstEventTime:1000,lastEventTime:2000},undefined,
      [{embedId:"math-proof",proof,assessedTrace:[],assessment:null}])
    const document=new DOMParser().parseFromString(html,"text/html")
    expect(document.querySelector('[data-circuit-math="answer"] math mfrac')).not.toBeNull()
    expect(document.querySelectorAll('[data-circuit-math="steps"]')).toHaveLength(actual.steps.filter(s=>s.math).length)
    expect(document.querySelector("script")).toBeNull()
    expect(html).toContain("Fasori confrontati su tutti i rami")
    expect(html).toContain("Ricalcolare prima di riusare")
    expect(html).toContain("Schema del passaggio 1")
  })
  it("mantiene il testo esatto delle prove storiche senza AST e non ne inventa le formule",()=>{
    const proof=readCircuitProof(legacy,legacy.netlist)
    const html=buildRecapHtml({v:1,title:"Storico AC",durationMs:1000,mathFormulas:[],elementTypeCounts:{embeddable:1},
      totalElementsAdded:1,pdfPagesViewed:[],firstEventTime:1000,lastEventTime:2000},undefined,
      [{embedId:"old-proof",proof,assessedTrace:[],assessment:null}])
    expect(html).not.toContain('data-circuit-math="answer"')
    expect(html).not.toContain('data-circuit-math="steps"')
    expect(html).toContain(proof.answer.exact)
  })
})
