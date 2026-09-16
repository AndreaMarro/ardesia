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
import type { ContinuityViewDeps } from "../design/ContinuityView"
import type { LoadScopedContinuityResultV1 } from "../lessonos/continuityRuntime"
import type { ScopedContinuitySnapshotV1 } from "../lessonos/continuityProjection"

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
    stato: {
      kind: "sessions",
      lessonId: "wbstudio-abc",
      sessions: [
        { sessionId: "11111111-1111-4111-8111-111111111111", firstSeenAt: "2026-08-01T09:00:00.000Z" },
        { sessionId: "22222222-2222-4222-8222-222222222222", firstSeenAt: null },
      ],
    },
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
  //
  // I SOTTO-STATI SONO TRE, e la prima versione di questo test ne esercitava
  // UNO. Con un `loadSnapshot` che non si risolve mai osservava solo `loading`,
  // quindi sarebbe rimasta verde a 7/7 anche se la nav fosse sparita da
  // `scope-invalid` e da ogni projection caricata. Un assert che copre un ramo
  // su tre non dice «la nav c'e' sempre»: dice «la nav c'e' mentre carica».
  const SOTTOSTATI: ReadonlyArray<{
    nome: string
    carica: () => Promise<LoadScopedContinuityResultV1>
  }> = [
    {
      nome: "sta caricando",
      carica: () => new Promise<never>(() => {}),
    },
    {
      nome: "scope invalido",
      carica: async () => ({ kind: "scope-invalid", code: "invalid-session-id" }),
    },
    {
      nome: "snapshot caricato",
      carica: async () => ({
        kind: "loaded",
        snapshot: {
          scope: { lessonId: "wbstudio-abc", roomId: "wbstudio-abc", sessionId: "3f2a1c58-9d41-4f7b-8c20-6e5b1a9d4c33" },
          session: null,
          lessonEvents: [],
          journalEvents: [],
          scene: null,
          buildCommitSha: null,
          evidenceByOccurrence: new Map(),
          issues: [],
        } as unknown as ScopedContinuitySnapshotV1,
      }),
    },
  ]

  for (const sotto of SOTTOSTATI) {
    it(`rende la nav nel ramo snapshot: ${sotto.nome}`, async () => {
      // l'id lezione viene dallo HASH della stanza, non da un parametro.
      window.history.replaceState(null, "", "/?vista=continuita&sessione=3f2a1c58-9d41-4f7b-8c20-6e5b1a9d4c33#wbstudio-abc")
      render(
        <ContinuityView
          deps={{
            loadSnapshot: sotto.carica as ContinuityViewDeps["loadSnapshot"],
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
  }
})
