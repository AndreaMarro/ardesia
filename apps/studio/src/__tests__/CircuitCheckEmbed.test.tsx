// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { CircuitCheckEmbed } from "../toolhost/CircuitCheckEmbed"
import { CIRCUIT_CHECK_TOOL_ID, readCircuitProof, type CircuitEmbedState } from "../toolhost/circuitCheckAdapter"
import { EMBED_DATA_KEY } from "../toolhost/caps/board"
import portResponse from "./fixtures/circuitcheck-port-response.json"
import acResponse from "./fixtures/circuitcheck-ac-response.json"

const toolLink = {toolId:CIRCUIT_CHECK_TOOL_ID,embedId:"circuit-test"}
const element = (state?: CircuitEmbedState) => ({id:toolLink.embedId,
  customData:{[EMBED_DATA_KEY]:{owner:CIRCUIT_CHECK_TOOL_ID,...(state ? {state} : {})}}})

afterEach(() => {cleanup();vi.unstubAllGlobals()})

describe("CircuitCheck: prova sulla lavagna", () => {
  it.each([portResponse,acResponse])("mostra e registra il livello reale della prova $method", async (response) => {
    const persistEmbedState = vi.fn(async () => true)
    const flushEmbedState = vi.fn(async () => true)
    const emitLessonEvent = vi.fn()
    vi.stubGlobal("fetch",vi.fn(async () => new Response(JSON.stringify(response),{
      status:200,headers:{"Content-Type":"application/json"},
    })))
    render(<CircuitCheckEmbed element={element()} toolLink={toolLink}
      host={{persistEmbedState,flushEmbedState,emitLessonEvent}} />)
    fireEvent.change(screen.getByLabelText("Circuito CircuitCheck"),{target:{value:response.netlist}})
    fireEvent.click(screen.getByRole("button",{name:"Risolvi e verifica"}))
    await screen.findByText("confrontato ora")
    expect(screen.queryByText("verificato ora")).toBeNull()
    expect(flushEmbedState).toHaveBeenCalledOnce()
    expect(emitLessonEvent).toHaveBeenCalledOnce()
    expect(emitLessonEvent.mock.calls[0]?.[0].verificationScope).toBe(
      response.method === "phasor" ? "phasor_paths_crosschecked" : "port_subproofs_crosschecked")
    if (response.method === "phasor") {
      expect(screen.getByText(/ω = 100 rad\/s/).textContent).toContain("ampiezza non specificata")
      expect(screen.queryByRole("button",{name:"Controlla il procedimento"})).toBeNull()
    }
  })

  it("riapre il riferimento selezionato e mantiene la prova storica da ricalcolare", async () => {
    const proof = readCircuitProof(acResponse,acResponse.netlist)
    let saved: CircuitEmbedState = {kind:"circuitcheck-proof-v1",netlist:proof.netlist,method:"auto",
      proof,selectedStep:0,trace:[],diagnosis:null,pendingErrorId:null}
    const host = {flushEmbedState:vi.fn(async () => true),persistEmbedState:vi.fn(async (_embed:string,next:unknown) => {
      saved = JSON.parse(JSON.stringify(next)) as CircuitEmbedState
      return true
    })}
    const first = render(<CircuitCheckEmbed element={element(saved)} toolLink={toolLink} host={host} />)
    fireEvent.click(screen.getByRole("button",{name:"R1"}))
    await waitFor(() => expect(saved.selectedFocus).toBe("R1"))
    await screen.findByText(/Riferimento R1 salvato nel passaggio/)
    expect(host.flushEmbedState).toHaveBeenCalledOnce()
    expect(saved.proof?.steps[saved.selectedStep]?.focus).toContain("R1")
    first.unmount()
    render(<CircuitCheckEmbed element={element(saved)} toolLink={toolLink} host={host} />)
    expect(screen.getByRole("button",{name:"R1"}).getAttribute("aria-pressed")).toBe("true")
    expect(screen.getByText("prova da ricalcolare")).toBeDefined()
    expect(screen.queryByText("confrontato ora")).toBeNull()
  })

  it("toglie la verifica corrente se il nuovo calcolo viene rifiutato", async () => {
    const emitLessonEvent = vi.fn()
    const fetch = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(portResponse)))
      .mockResolvedValueOnce(new Response(JSON.stringify({outcome:"refusal",message:"Circuito non risolto"})))
    vi.stubGlobal("fetch",fetch)
    render(<CircuitCheckEmbed element={element()} toolLink={toolLink}
      host={{persistEmbedState:async () => true,flushEmbedState:async () => true,emitLessonEvent}} />)
    fireEvent.change(screen.getByLabelText("Circuito CircuitCheck"),{target:{value:portResponse.netlist}})
    fireEvent.click(screen.getByRole("button",{name:"Risolvi e verifica"}))
    await screen.findByText("confrontato ora")
    fireEvent.click(screen.getByRole("button",{name:"Ricalcola e verifica"}))
    await screen.findByRole("alert")
    expect(screen.queryByText("confrontato ora")).toBeNull()
    expect(screen.getByText("prova da ricalcolare")).toBeDefined()
    expect(emitLessonEvent).toHaveBeenCalledOnce()
  })

  it("non registra una prova prima che la scena sia durevole", async () => {
    const emitLessonEvent = vi.fn()
    vi.stubGlobal("fetch",vi.fn(async () => new Response(JSON.stringify(portResponse))))
    render(<CircuitCheckEmbed element={element()} toolLink={toolLink}
      host={{persistEmbedState:async () => true,flushEmbedState:async () => false,emitLessonEvent}} />)
    fireEvent.change(screen.getByLabelText("Circuito CircuitCheck"),{target:{value:portResponse.netlist}})
    fireEvent.click(screen.getByRole("button",{name:"Risolvi e verifica"}))
    expect((await screen.findByRole("alert")).textContent).toContain("non è ancora durevole")
    expect(screen.queryByText("confrontato ora")).toBeNull()
    expect(emitLessonEvent).not.toHaveBeenCalled()
  })
})
