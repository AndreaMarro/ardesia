// @vitest-environment jsdom
//
// Continuita' e' l'unica superficie della shell Founder Beta che non rendeva
// `ViewNav`. Misurato il 2026-07-30 su `main`: `grep -c ViewNav
// src/design/ContinuityView.tsx` -> 0, mentre Room, ElabLab, SavedLessonsView,
// TeacherDashboardView e SimulationPluginWorkbench lo rendono tutti.
//
// Non e' un dettaglio estetico. Il GOAL dice: «un docente apre una lezione, la
// chiude, la ritrova in Continuita', la esporta e la reimporta in Materiali».
// Senza nav, il passo dopo «la ritrova in Continuita'» non esiste: il docente
// e' su un vicolo cieco e l'unica uscita e' il tasto indietro del browser.
//
// L'assert e' su OGNI RAMO, non sul ramo felice. I rami di errore sono
// esattamente quelli in cui un docente ha piu' bisogno di potersene andare, e
// sono anche quelli che un test scritto sul caso buono non tocca mai.

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import ContinuityView from "../design/ContinuityView"
import type { ContinuitySurfaceStateV1 } from "../lessonos/continuitySurface"

afterEach(() => {
  cleanup()
  window.history.replaceState(null, "", "/?vista=continuita")
})

/** I rami che `ContinuityView` puo' rendere nella fase "listing". */
const RAMI: ReadonlyArray<{ nome: string; stato: ContinuitySurfaceStateV1 }> = [
  { nome: "nessuna lezione nello scope", stato: { kind: "no-lesson" } },
  { nome: "nessuna sessione ripristinabile", stato: { kind: "no-sessions", lessonId: "wbstudio-abc" } },
  { nome: "storage non raggiungibile", stato: { kind: "storage-unavailable", backend: { kind: "unavailable", code: "SecurityError" } } },
  { nome: "lettura fallita", stato: { kind: "unreadable", code: "QuotaExceededError" } },
  {
    nome: "elenco sessioni",
    stato: { kind: "sessions", lessonId: "wbstudio-abc", sessionIds: ["s-1", "s-2"] },
  },
]

describe("ContinuityView — la nav esiste in ogni ramo", () => {
  it("rende la nav mentre sta ancora leggendo", async () => {
    // Il ramo di caricamento e' il primo che un docente vede, ed e' quello in
    // cui la vista non sa ancora niente: se la nav comparisse solo dopo, la
    // superficie sarebbe senza uscita proprio durante l'attesa.
    render(<ContinuityView deps={{ readSessions: () => new Promise<never>(() => {}) }} />)
    // jest-dom non e' caricato in questo progetto: si legge l'attributo dal DOM.
    const superficie = await screen.findByTestId("continuity-surface")
    expect(superficie.getAttribute("data-state")).toBe("loading")
    expect(document.querySelector("[data-view-nav]")).not.toBeNull()
  })

  for (const ramo of RAMI) {
    it(`rende la nav nel ramo: ${ramo.nome}`, async () => {
      render(<ContinuityView deps={{ readSessions: async () => ramo.stato }} />)
      await screen.findByTestId("continuity-surface")

      const nav = document.querySelector("[data-view-nav]")
      expect(nav).not.toBeNull()
      // tre voci, e Continuita' e' quella corrente: una nav che non dice dove
      // sei e' meta' nav.
      expect(nav!.querySelectorAll("[data-view-nav-item]")).toHaveLength(3)
      expect(
        nav!.querySelector('[data-view-nav-item="continuita"][aria-current="page"]'),
      ).not.toBeNull()
    })
  }

  // La fase "snapshot" e' quella in cui il docente atterra DOPO aver scelto una
  // sessione: e' il cuore del GOAL ("riapre a freddo e riprende"). Anche qui la
  // nav mancava — `ContinuityResumeCard` ha sei rami di ritorno e zero ViewNav.
  it("rende la nav anche quando sta caricando lo snapshot di una sessione", async () => {
    // l'id lezione viene dallo HASH della stanza, non da un parametro.
    window.history.replaceState(null, "", "/?vista=continuita&sessione=s-1#wbstudio-abc")
    render(
      <ContinuityView
        deps={{
          loadSnapshot: () => new Promise<never>(() => {}),
          readSessions: async () => ({ kind: "no-lesson" }) as ContinuitySurfaceStateV1,
        }}
      />,
    )
    await vi.waitFor(() => {
      expect(document.querySelector("[data-view-nav]")).not.toBeNull()
    })
    expect(
      document.querySelectorAll("[data-view-nav] [data-view-nav-item]"),
    ).toHaveLength(3)
  })
})
