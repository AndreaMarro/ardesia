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
import { loadScopedContinuitySnapshot } from "../lessonos/continuityRuntime"
import { workspaceStore } from "../store/WorkspaceStore"
import { roomPaths } from "../store/roomPaths"

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
  it("riapertura diretta: inizializza il workspace, legge la scena e conserva la degradazione della cache", async () => {
    at(`/?vista=continuita&sessione=${SESSION_ONE}#${LESSON_ID}`)
    expect(workspaceStore.mode).toBe("unavailable")
    await workspaceStore.saveScene(LESSON_ID,JSON.stringify({elements:[{id:"saved-note",type:"text",text:"Appunto salvato"}]}))
    const results: LoadScopedContinuityResultV1[] = []
    const loadSnapshot: typeof loadScopedContinuitySnapshot = async (requested,factories) => {
      const result = await loadScopedContinuitySnapshot(requested,{
        ...factories,
        createEventReader: async () => ({
          persistence:{kind:"verified-indexeddb",database:"continuity-test"},
          readEnvelopesBySession:async()=>[],dispose:async()=>{},
        }),
      })
      results.push(result)
      return result
    }
    try {
      const {container} = render(<ContinuityView deps={{loadSnapshot}} />)
      await screen.findByText("Continuita' degradata")
      const result = results[0]!
      expect(result.kind).toBe("loaded")
      if (result.kind === "loaded") {
        expect(result.snapshot.scene?.elements).toEqual([{id:"saved-note",type:"text",text:"Appunto salvato"}])
        expect(result.snapshot.issues.some(issue=>issue.code === "workspace-uninitialised")).toBe(false)
        expect(result.snapshot.issues.filter(issue=>issue.code === "local-storage-non-authoritative")).toHaveLength(3)
      }
      expect(workspaceStore.mode).toBe("localStorage")
      expect(container.querySelector('[data-continuity-issue-code="workspace-uninitialised"]')).toBeNull()
      expect(container.querySelectorAll('[data-continuity-issue-code="local-storage-non-authoritative"]')).toHaveLength(3)
    } finally {
      await workspaceStore.delete(roomPaths(LESSON_ID).scene)
      localStorage.clear()
    }
  })

  it("nessuna lezione nello scope: lo dice, e non apre alcuna sorgente", async () => {
    at("/?vista=continuita")
    const openEventLog = vi.fn()
    render(<ContinuityView deps={{ openEventLog }} />)

    expect(
      (await screen.findByTestId("continuity-surface")).getAttribute("data-state"),
    ).toBe("no-lesson")
    expect(openEventLog).not.toHaveBeenCalled()
  })

  it("apertura che rigetta: esce da loading senza dire che le sessioni sono assenti", async () => {
    at(`/?vista=continuita#${LESSON_ID}`)
    const openEventLog = vi.fn(async (): Promise<IndexedDbEventLogHandle> => {
      throw new Error("Web Crypto non disponibile")
    })
    const { container } = render(<ContinuityView deps={{ openEventLog }} />)
    await screen.findByText("Archivio non raggiungibile")
    expect(screen.getByTestId("continuity-surface").getAttribute("data-state"))
      .toBe("storage-unavailable")
    expect(container.textContent).toContain("Le sessioni potrebbero esistere: non sono state lette")
    expect(container.textContent).not.toContain("Lettura delle sessioni")
    expect(container.textContent).not.toContain("Nessuna sessione da riprendere")
    expect(openEventLog).toHaveBeenCalledTimes(1)
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

  it("nessun UUID nel testo VISIBILE: l'obiettivo di prodotto, come assert da due secondi", async () => {
    // Promozione di un finding del golden path E2E a controllo meccanico.
    // Il 2026-07-30 `e2e/golden-path.spec.ts` era rosso al passo 4 con
    // «Continuità mostra un identificatore tecnico come testo visibile:
    // 26d92fab-…»: la vista rendeva `{sessionId}` come testo del link.
    // Quel test costa 8 secondi e un browser; questo costa 2 secondi, e la
    // regola del loop e' che un difetto meccanicamente controllabile diventa
    // un controllo, non attenzione.
    //
    // `textContent` e non `innerText`: jsdom non calcola il layout, quindi
    // `innerText` non e' affidabile qui. La differenza — testo di nodi nascosti
    // — non si applica: questa vista non ne ha.
    at(`/?vista=continuita#${LESSON_ID}`)
    render(
      <ContinuityView deps={{ openEventLog: async () => handleWith([SESSION_ONE, SESSION_TWO]) }} />,
    )
    // PRECONDIZIONE STABILITA, non sperata. `findByTestId("continuity-surface")`
    // da solo risolve sullo stato di CARICAMENTO, che porta lo stesso testid:
    // la prima versione di questo assert leggeva «Continuita'Lettura delle
    // sessioni…» e passava senza aver mai visto una sessione. L'ha scoperto
    // l'assert successivo, non questo — se fosse stato l'unico, il repo avrebbe
    // guadagnato un test verde che non guarda niente.
    const voci = await screen.findAllByTestId("continuity-session")
    expect(voci).toHaveLength(2)
    const superficie = await screen.findByTestId("continuity-surface")
    expect(superficie.getAttribute("data-state")).toBe("sessions")
    const visibile = superficie.textContent ?? ""
    expect(visibile).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    )
    // e l'identificatore resta disponibile alle MACCHINE, che ne hanno bisogno
    expect(voci[0].getAttribute("data-continuity-session-id")).toBe(SESSION_ONE)
    // la vista non deve promettere una cronologia che l'archivio non conserva:
    // `listSessionIds` ordina lessicograficamente per UUID casuale
    expect(visibile).toContain("non è quello temporale")
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
