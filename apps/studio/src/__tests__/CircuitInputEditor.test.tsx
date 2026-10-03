// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { CircuitInputEditor } from "../toolhost/CircuitInputEditor"
import { circuitInputNetlist, emptyCircuitInput, parseCircuitInputNetlist, readCircuitInput, type CircuitInputModel } from "../toolhost/circuitInputModel"

afterEach(cleanup)
const dc = "V1 a 0 12 volt\nR1 a 0 100 ohm\n? current R1"
const ac = "@ac 100 rad/s\n@amplitude rms\nV1 a 0 10 volt 30deg\nR1 a b 3 ohm\nL1 b 0 1/25 henry\n? power R1"

describe("interpretazione semantica del circuito", () => {
  it.each([dc, ac, "R1 a 0 3 ohm\nR2 a 0 6 ohm\n? resistance a 0"])("conserva morsetti, valori e domanda senza introdurre dati: %s", netlist => {
    expect(circuitInputNetlist(parseCircuitInputNetlist(netlist))).toBe(netlist)
  })
  it.each([
    `${dc}\nE1 a 0 b 0 2`, `${dc}\n? voltage V1`, `V1 a 0 12 volt\nR1 a 0 100 ohm`,
    "R1 a 0 3 ohm\n@ac 100 rad/s\n? current R1", ac.replace("30deg","31deg"),
    ac.replace("@amplitude rms","@amplitude rms\n@amplitude peak"),
    ac.replace("@amplitude rms","@amplitude unspecified"),
    dc.replace("R1 a 0", "R1 a a"), dc.replace("100 ohm","0 ohm"),
  ])("rifiuta righe e interpretazioni non rappresentabili senza perderle: %s", netlist=>{
    expect(()=>parseCircuitInputNetlist(netlist)).toThrow()
  })
  it("la bozza vuota è persistibile ma non produce un circuito di esempio",()=>{
    expect(readCircuitInput(emptyCircuitInput()).components).toEqual([])
    expect(()=>circuitInputNetlist(emptyCircuitInput())).toThrow("Aggiungi")
  })
  it("respinge dati persistiti fuori schema e limiti",()=>{
    const model = parseCircuitInputNetlist(dc)
    expect(()=>readCircuitInput({...model,components:[{...model.components[0],kind:"E"}]})).toThrow()
    expect(()=>readCircuitInput({...model,omega:"1".repeat(101)})).toThrow()
    expect(()=>readCircuitInput({...model,components:Array(65).fill(model.components[0])})).toThrow()
    expect(()=>circuitInputNetlist({...model,components:[model.components[0],model.components[0]]})).toThrow("univoco")
  })
  it("costruisce un circuito con controlli semantici, poi corregge un collegamento locale",()=>{
    let latest: CircuitInputModel = emptyCircuitInput(), netlist: string|null = null
    function Controlled(){const [value,setValue]=useState(latest);return <CircuitInputEditor value={value} onChange={(next,text)=>{latest=next;netlist=text;setValue(next)}}/>}
    render(<Controlled />)
    fireEvent.click(screen.getByRole("button",{name:"Aggiungi generatore di tensione"}))
    fireEvent.change(screen.getByLabelText("Valore V1"),{target:{value:"12"}})
    fireEvent.change(screen.getByLabelText("Primo morsetto V1"),{target:{value:"a"}})
    fireEvent.change(screen.getByLabelText("Secondo morsetto V1"),{target:{value:"0"}})
    fireEvent.click(screen.getByRole("button",{name:"Aggiungi resistore"}))
    fireEvent.change(screen.getByLabelText("Valore R1"),{target:{value:"100"}})
    fireEvent.change(screen.getByLabelText("Primo morsetto R1"),{target:{value:"a"}})
    fireEvent.change(screen.getByLabelText("Secondo morsetto R1"),{target:{value:"0"}})
    fireEvent.change(screen.getByLabelText("Grandezza da trovare"),{target:{value:"current"}})
    fireEvent.change(screen.getByLabelText("Componente della domanda"),{target:{value:"R1"}})
    expect(netlist).toBe(dc)
    fireEvent.change(screen.getByLabelText("Primo morsetto R1"),{target:{value:"b"}})
    expect(latest.components[0].from).toBe("a")
    expect(netlist).toContain("R1 b 0 100 ohm")
    fireEvent.change(screen.getByLabelText("Valore R1"),{target:{value:""}})
    expect(netlist).toBeNull()
    expect(screen.queryByRole("textbox",{name:"Circuito CircuitCheck"})).toBeNull()
  })
})
