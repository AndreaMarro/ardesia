// @vitest-environment jsdom
//
// P0-LIVE — graph.query VIVO fuori dai test: la zona "Ripasso errori" del
// cruscotto docente monta il plugin ripasso (#117) via ToolHost REALE con
// l'event-log LessonOS cablato (deps.eventLog). Prima superficie NON-gate che
// passa un event-log vero alla creazione ToolHost: fino a qui il metodo wire
// graph.query girava SOLO con log iniettati nei file di test.
//
// Falsificabilità: le righe del pannello devono arrivare dal WIRE (host.hello →
// tool.ready → graph.query → audit-log), non da una chiamata diretta al
// materializer — per questo il test legge anche l'audit del ToolHost.
// Dati SEMPRE reali: fixture = eventi LessonOS veri su InMemoryEventLog.

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { InMemoryEventLog } from "../lessonos/eventlog"
import TeacherDashboardView from "../design/TeacherDashboardView"
import { mountRipassoPanel } from "../toolhost/panelHost"

afterEach(() => {
  cleanup()
})

/** Stessa lezione "ohm" del test e2e #117: eventi VERI, mai oggetti-grafo a mano. */
async function seededLog(): Promise<InMemoryEventLog> {
  const log = new InMemoryEventLog()
  await log.append({
    kind: "concept.introduced",
    conceptId: "concetto:legge-ohm",
    labels: { it: "Legge di Ohm" },
    evidence: ["manual:vol1:p30"],
    t: 1000,
  })
  await log.append({
    kind: "error.observed",
    errorId: "errore:polarita-led",
    conceptId: "concetto:legge-ohm",
    labels: { it: "LED montato al contrario" },
    evidence: ["board:elem-led-1"],
    t: 3000,
  })
  await log.append({
    kind: "error.observed",
    errorId: "errore:resistenza-mancante",
    conceptId: "concetto:legge-ohm",
    labels: { it: "Resistenza dimenticata" },
    evidence: ["board:elem-r-1", "manual:vol1:p31"],
    t: 3500,
  })
  await log.append({
    kind: "exercise.completed",
    exerciseId: "esercizio:rimonta-led",
    correctsErrorId: "errore:polarita-led",
    labels: { it: "Rimonta il LED" },
    evidence: ["board:elem-led-2"],
    t: 4000,
  })
  return log
}

describe("TeacherDashboardView — zona Ripasso errori (plugin via ToolHost reale)", () => {
  it("mostra aperti prima dei corretti, con provenienza verbatim dall'event-log", async () => {
    render(<TeacherDashboardView deps={{ loadEvents: async () => [], eventLog: await seededLog() }} />)

    // L'errore MAI corretto è "DA RIPRENDERE", col concetto risolto in label
    // e la fonte VERBATIM (canone LessonOS: nessun fatto senza provenienza).
    const aperto = await screen.findByText(/DA RIPRENDERE · Resistenza dimenticata/)
    expect(aperto.textContent).toContain("Legge di Ohm")
    expect(aperto.textContent).toContain("manual:vol1:p31")

    const zona = document.querySelector("[data-zripasso]")
    expect(zona).not.toBeNull()
    expect(zona!.getAttribute("data-zripasso-aperti")).toBe("1")

    // Il corretto compare DOPO l'aperto (ordine del ripasso: prima cosa riprendere).
    const testo = zona!.textContent ?? ""
    const iAperto = testo.indexOf("Resistenza dimenticata")
    const iCorretto = testo.indexOf("LED montato al contrario")
    expect(iAperto).toBeGreaterThanOrEqual(0)
    expect(iCorretto).toBeGreaterThan(iAperto)
  })

  it("senza event-log iniettato: fallback vuoto → messaggio onesto, mai crash del cruscotto", async () => {
    render(<TeacherDashboardView deps={{ loadEvents: async () => [] }} />)
    expect(await screen.findByText("Nessun errore osservato in questa lezione.")).toBeTruthy()
  })
})

describe("mountRipassoPanel — helper di produzione (wire ToolHost, non scorciatoia)", () => {
  it("capability negata dal docente → ripasso vuoto anche con log pieno (policy reale)", async () => {
    const handle = await mountRipassoPanel({ eventLog: await seededLog(), approved: [] })
    try {
      expect(await handle.plugin.refresh()).toEqual({ v: 1, aperti: [], corretti: [] })
    } finally {
      handle.close()
    }
  })

  it("ogni lettura del grafo passa dall'audit-log del ToolHost (graph.query nel wire)", async () => {
    const handle = await mountRipassoPanel({ eventLog: await seededLog() })
    try {
      const model = await handle.plugin.refresh()
      expect(model.aperti.map((i) => i.errorId)).toEqual(["errore:resistenza-mancante"])
      const audit = await handle.readAudit()
      expect(audit.entries.some((e) => e.method === "graph.query" && e.outcome === "ok")).toBe(true)
      expect(audit.malformed).toBe(0)
    } finally {
      handle.close()
    }
  })
})
