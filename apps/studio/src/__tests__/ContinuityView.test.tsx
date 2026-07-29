// @vitest-environment jsdom
//
// Superficie di continuita': la vista.
//
// Il contenitore e' l'unico pezzo con effetti. Tutto cio' che decide sta in
// `readResumableSessions` e in `loadScopedContinuitySnapshot`, gia' coperti
// altrove: qui si verifica il cablaggio, cioe' che la vista chieda le cose
// giuste e mostri stati DISTINGUIBILI.
//
// "Distinguibili" e' il punto: nessuna sessione, storage non disponibile e
// lettura fallita devono apparire diversi. Collassarli in un'unica schermata
// vuota e' il modo piu' rapido per far credere a un docente di aver perso una
// lezione che invece c'e'.

import { describe, it, expect, afterEach, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import ContinuityView from "../design/ContinuityView"
import type { IndexedDbEventLogHandle } from "../lessonos/indexedDbEventLog"
import type {
  LoadScopedContinuityResultV1,
  ContinuityRuntimeAdapterFactories,
} from "../lessonos/continuityRuntime"

const LESSON_ID = "wbstudio-abc123"
const SESSION_ONE = "11111111-1111-4111-8111-111111111111"
const SESSION_TWO = "22222222-2222-4222-8222-222222222222"

function at(url: string): void {
  window.history.replaceState(null, "", url)
}

/** Handle finto con le sessioni date; `log: null` per simulare storage assente. */
function handleWith(sessionIds: readonly string[] | null): IndexedDbEventLogHandle {
  return {
    backend:
      sessionIds === null
        ? { kind: "unavailable", code: "indexeddb-unavailable" }
        : { kind: "verified-indexeddb", database: "test" },
    log: sessionIds === null ? null : { async listSessionIds() { return sessionIds } },
    async close() {},
  } as unknown as IndexedDbEventLogHandle
}

afterEach(() => {
  cleanup()
  at("/")
})

describe("ContinuityView", () => {
  it("nessuna lezione nello scope: lo dice, e non apre alcuna sorgente", async () => {
    at("/?vista=continuita")
    const openEventLog = vi.fn()
    render(<ContinuityView deps={{ openEventLog }} />)

    expect(
      (await screen.findByTestId("continuity-surface")).getAttribute("data-state"),
    ).toBe("no-lesson")
    expect(openEventLog).not.toHaveBeenCalled()
  })

  it("sessioni presenti: una voce per sessione, ciascuna con il proprio sessionId nell'URL", async () => {
    at(`/?vista=continuita#${LESSON_ID}`)
    render(
      <ContinuityView deps={{ openEventLog: async () => handleWith([SESSION_ONE, SESSION_TWO]) }} />,
    )

    const items = await screen.findAllByTestId("continuity-session")
    expect(items).toHaveLength(2)
    // Lo hash della stanza va preservato: senza, il link porterebbe a una
    // lezione diversa da quella che si sta guardando.
    expect(items[0].getAttribute("href")).toBe(
      `/?vista=continuita&sessione=${SESSION_ONE}#${LESSON_ID}`,
    )
    expect(items[1].getAttribute("href")).toBe(
      `/?vista=continuita&sessione=${SESSION_TWO}#${LESSON_ID}`,
    )
  })

  it("lezione senza sessioni e storage assente sono stati DIVERSI", async () => {
    at(`/?vista=continuita#${LESSON_ID}`)
    const { unmount } = render(
      <ContinuityView deps={{ openEventLog: async () => handleWith([]) }} />,
    )
    expect(
      (await screen.findByTestId("continuity-surface")).getAttribute("data-state"),
    ).toBe("no-sessions")
    unmount()
    cleanup()

    render(<ContinuityView deps={{ openEventLog: async () => handleWith(null) }} />)
    expect(
      (await screen.findByTestId("continuity-surface")).getAttribute("data-state"),
    ).toBe("storage-unavailable")
  })

  it("con ?sessione: chiede lo snapshot per la tripla esatta dello scope", async () => {
    at(`/?vista=continuita&sessione=${SESSION_ONE}#${LESSON_ID}`)
    // I parametri vanno dichiarati: senza, `vi.fn` inferisce una tupla vuota e
    // `mock.calls[0][0]` non esiste — il test resterebbe verde mentre il
    // typecheck cade, che e' la forma di falso verde piu' cara di questa
    // sessione.
    const loadSnapshot = vi.fn(
      async (
        _requested: { lessonId: unknown; roomId: unknown; sessionId: unknown },
        _factories: ContinuityRuntimeAdapterFactories,
      ): Promise<LoadScopedContinuityResultV1> =>
        Object.freeze({ kind: "scope-invalid" as const, code: "invalid-session-id" as const }),
    )

    render(<ContinuityView deps={{ openEventLog: async () => handleWith([]), loadSnapshot }} />)

    // La card e' pura: mostrare il testo dello scope invalido prova che il
    // risultato del loader e' arrivato fino a lei.
    expect(await screen.findByText("Identificatore sessione non valido")).toBeTruthy()
    expect(loadSnapshot).toHaveBeenCalledTimes(1)
    expect(loadSnapshot.mock.calls[0][0]).toEqual({
      lessonId: LESSON_ID,
      roomId: LESSON_ID,
      sessionId: SESSION_ONE,
    })
  })
})
