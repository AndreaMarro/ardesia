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
import { cleanup, render, screen, waitFor } from "@testing-library/react"
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
    log:
      sessionIds === null
        ? null
        : {
            async listSessionIds() {
              return sessionIds
            },
            // Una data di inizio deterministica per voce, in ordine di indice:
            // l'ordine temporale coincide qui con quello di elenco.
            async readEnvelopesBySession(_lessonId: string, sessionId: string) {
              const indice = sessionIds.indexOf(sessionId)
              if (indice < 0) return []
              return [{ occurredAt: `2026-08-0${indice + 1}T09:00:00.000Z` }]
            },
          },
    async close() {},
  } as unknown as IndexedDbEventLogHandle
}

/**
 * Handle finto con date di inizio per sessione. Gli UUID ordinano
 * ONE < TWO < THREE, le date dicono l'opposto; l'elenco arriva in un terzo
 * ordine ancora. L'unico output accettabile e' temporale DESC.
 */
const OLDEST_START = "2026-08-01T09:00:00.000Z"
const MID_START = "2026-08-20T09:00:00.000Z"
const NEWEST_START = "2026-09-05T09:00:00.000Z"
const SESSION_THREE = "88888888-8888-4888-8888-888888888888"

function handleWithSessionStarts(): IndexedDbEventLogHandle {
  const starts = new Map([
    [SESSION_ONE, NEWEST_START],
    [SESSION_TWO, OLDEST_START],
    [SESSION_THREE, MID_START],
  ])
  return {
    backend: { kind: "verified-indexeddb", database: "test" },
    log: {
      async listSessionIds() {
        return [SESSION_TWO, SESSION_THREE, SESSION_ONE]
      },
      async readEnvelopesBySession(_lessonId: string, sessionId: string) {
        const occurredAt = starts.get(sessionId)
        return occurredAt === undefined ? [] : [{ occurredAt }]
      },
    },
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
    // Ordine temporale DESC: prima la piu' recente (TWO, 2 agosto).
    // Lo hash della stanza va preservato in ogni href: senza, il link
    // porterebbe a una lezione diversa da quella che si sta guardando.
    expect(items[0].getAttribute("href")).toBe(
      `/?vista=continuita&sessione=${SESSION_TWO}#${LESSON_ID}`,
    )
    expect(items[1].getAttribute("href")).toBe(
      `/?vista=continuita&sessione=${SESSION_ONE}#${LESSON_ID}`,
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
    expect(voci[0].getAttribute("data-continuity-session-id")).toBe(SESSION_TWO)
    expect(voci[1].getAttribute("data-continuity-session-id")).toBe(SESSION_ONE)
    // e la vista promette SOLO la cronologia che l'archivio conserva: l'ordine
    // ora e' quello temporale, detto esplicitamente invece del vecchio
    // disclaimer sull'ordine interno.
    expect(visibile).toContain("In ordine di inizio")
  })

  it("tre sessioni con UUID incompatibili: prima la piu' recente, con date e marchio", async () => {
    // UUID: ONE < TWO < THREE; date: ONE=5-set, THREE=20-ago, TWO=1-ago;
    // elenco: [TWO, THREE, ONE]. Se la vista seguisse UUID, inserimento o
    // indice, la prima voce non sarebbe ONE. La prima voce deve essere quella
    // da cui Andrea normalmente vuole riprendere.
    at(`/?vista=continuita#${LESSON_ID}`)
    render(<ContinuityView deps={{ openEventLog: async () => handleWithSessionStarts() }} />)

    const voci = await screen.findAllByTestId("continuity-session")
    expect(voci).toHaveLength(3)
    // Ordine temporale DESC: prima la recente (ONE), poi THREE, poi TWO.
    expect(voci[0].getAttribute("data-continuity-session-id")).toBe(SESSION_ONE)
    expect(voci[1].getAttribute("data-continuity-session-id")).toBe(SESSION_THREE)
    expect(voci[2].getAttribute("data-continuity-session-id")).toBe(SESSION_TWO)
    // Data di inizio leggibile dalla macchina…
    expect(voci[0].querySelector("time")?.getAttribute("dateTime")).toBe(NEWEST_START)
    expect(voci[1].querySelector("time")?.getAttribute("dateTime")).toBe(MID_START)
    expect(voci[2].querySelector("time")?.getAttribute("dateTime")).toBe(OLDEST_START)
    // …e dal docente: testo visibile non vuoto dentro <time>, mai un UUID.
    for (const voce of voci) {
      expect(voce.querySelector("time")?.textContent?.trim().length).toBeGreaterThan(0)
    }
    const superficie = await screen.findByTestId("continuity-surface")
    const visibile = superficie.textContent ?? ""
    expect(visibile).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    )
    // La piu' recente e' marcata, una sola volta, sulla PRIMA voce. Il
    // marchio ha le parentesi («(più recente)»): la nota d'ordine parla di
    // «più recente» senza parentesi, e contare la substring nuda confonderebbe
    // le due cose.
    expect(voci[0].textContent).toContain("(più recente)")
    expect(voci[1].textContent).not.toContain("(più recente)")
    expect(voci[2].textContent).not.toContain("(più recente)")
    // E la nota dice l'ordine vero, non il vecchio disclaimer.
    expect(visibile).toContain("dalla più recente")
    expect(visibile).not.toContain("non è quello temporale")
  })

  it("date non disponibili: la voce resta con «data non disponibile», senza marchio bugiardo", async () => {
    // Cucitura `readSessions`: stabilisce il ramo senza sperare di
    // raggiungerlo via storage (una sessione senza eventi leggibili non si
    // semina in un log append-only).
    at(`/?vista=continuita#${LESSON_ID}`)
    render(
      <ContinuityView
        deps={{
          readSessions: async () =>
            ({
              kind: "sessions",
              lessonId: LESSON_ID,
              sessions: [
                { sessionId: SESSION_TWO, firstSeenAt: OLDEST_START },
                { sessionId: SESSION_ONE, firstSeenAt: null },
              ],
            }) as const,
        }}
      />,
    )

    const voci = await screen.findAllByTestId("continuity-session")
    expect(voci).toHaveLength(2)
    expect(voci[1].textContent).toContain("data non disponibile")
    expect(voci[1].querySelector("time")).toBeNull()
    const superficie = await screen.findByTestId("continuity-surface")
    const visibile = superficie.textContent ?? ""
    // L'ultima voce non ha data nota: incoronarla «(più recente)» mentirebbe…
    // (il marchio ha le parentesi; la nota d'ordine resta lecita).
    expect(voci[0].textContent).not.toContain("(più recente)")
    expect(voci[1].textContent).not.toContain("(più recente)")
    // …ma la posizione in fondo va detta, altrimenti sembra un caso.
    expect(visibile).toContain("senza data leggibile")
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

  it("snapshot che rigetta: niente loading infinito, stato d'errore esplicito", async () => {
    // Se il loader rigetta (indice corrotto, lettura rifiutata), la vista non
    // deve restare su «Caricamento…» per sempre: e' la forma peggiore di
    // ricevuta, perche' finge attesa mentre non succedera' piu' niente.
    at(`/?vista=continuita&sessione=${SESSION_ONE}#${LESSON_ID}`)
    render(
      <ContinuityView
        deps={{
          openEventLog: async () => handleWith([]),
          loadSnapshot: () => Promise.reject(new Error("indice sessioni illeggibile")),
        }}
      />,
    )

    // Il loading TERMINA: senza fix questo waitFor scade (la card resta
    // data-continuity-phase="loading" e la rejection resta unhandled).
    await waitFor(
      () => {
        const phase = document
          .querySelector("[data-continuity-phase]")
          ?.getAttribute("data-continuity-phase")
        expect(phase).not.toBe("loading")
      },
      { timeout: 2000 },
    )
    const card = document.querySelector("[data-continuity-phase]")
    expect(card?.getAttribute("data-continuity-phase")).toBe("load-failed")
    // Stato esplicito: un alert leggibile, non un falso "nessuna sessione"
    // (quella sarebbe la lista, qui siamo nello snapshot) e non un successo.
    expect(card?.getAttribute("role")).toBe("alert")
    expect(card?.textContent ?? "").toContain("indice sessioni illeggibile")
    // Una via d'uscita sola e onesta, come negli altri rami d'errore.
    expect(card?.querySelector('[data-next-action="reopen-lesson"]')).not.toBeNull()
    // Lo scope resta quello chiesto: lesson visibile nella URL/scope.
    expect(window.location.hash).toBe(`#${LESSON_ID}`)
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

  it("apertura che rigetta nel listing: niente loading infinito, archivio dichiarato non raggiungibile", async () => {
    // Ramo listing SENZA ?sessione: se l'apertura rigetta, la vista non deve
    // restare su "Lettura delle sessioni…" ne' fingere "nessuna sessione".
    at(`/?vista=continuita#${LESSON_ID}`)
    render(
      <ContinuityView
        deps={{
          openEventLog: () => Promise.reject(new Error("Web Crypto non disponibile")),
        }}
      />,
    )

    const superficie = await screen.findByTestId("continuity-surface")
    await waitFor(
      () => {
        expect(superficie.getAttribute("data-state")).not.toBe("loading")
      },
      { timeout: 2000 },
    )
    // Stato d'errore corretto: archivio non raggiungibile, mai no-sessions
    // (le sessioni potrebbero esistere: non sono state lette).
    expect(superficie.getAttribute("data-state")).toBe("storage-unavailable")
    expect(superficie.textContent ?? "").toContain("Archivio non raggiungibile")
    // Lesson/hash correnti non alterati: la lezione guardata resta quella.
    expect(window.location.hash).toBe(`#${LESSON_ID}`)
  })
})
