// @vitest-environment jsdom
// ARDESIA Studio — caratterizzazione della NON reentranza del coordinator.
//
// `LessonMutationCoordinator` documenta a parole di non essere reentrante. Gli
// audit del 23-07 hanno registrato la conseguenza pratica — avvolgere le write
// annidate dell'import `.lesson` in `withWorkspaceExclusive` **deadlocca** — ma
// come nota, non come predicato eseguibile.
//
// Questi test riproducono il comportamento sull'implementazione REALE (il
// broker in-process di produzione, istanziato isolato per test) e congelano
// anche la conseguenza piu' seria, scoperta scrivendoli: un'attesa circolare
// non blocca solo il suo import, **avvelena il lock di workspace per tutto il
// realm**. Nessun rimedio e' proposto qui: il rimedio e' ADR-0006.

import { describe, it, expect } from "vitest"
import {
  createInProcessMutationLockBroker,
  createLessonMutationCoordinator,
  lessonMutationLockName,
} from "../store/lessonMutationLock"

/** Sentinella: N giri di macrotask senza che la promise si stabilizzi. */
const PENDING = Symbol("pending")

async function settlesWithin<T>(
  promise: Promise<T>,
  turns = 25,
): Promise<T | typeof PENDING> {
  let settled = false
  let value: T | undefined
  void promise.then((v) => {
    settled = true
    value = v
  })
  for (let i = 0; i < turns && !settled; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
  return settled ? (value as T) : PENDING
}

/** Un coordinator per test: stato del lock non condiviso fra i casi. */
function isolatedCoordinator() {
  return createLessonMutationCoordinator(createInProcessMutationLockBroker())
}

describe("LessonMutationCoordinator — non reentranza", () => {
  it("i test esercitano il broker in-process, non un mock", () => {
    expect(isolatedCoordinator().safety).toBe("local-only")
  })

  it("controllo positivo: due mutazioni sequenziali non annidate completano", async () => {
    const coordinator = isolatedCoordinator()
    const done: string[] = []

    await coordinator.withPathMutation("raw/lessonA/board.excalidraw", async () => {
      done.push("first")
    })
    await coordinator.withWorkspaceExclusive(async () => {
      done.push("second")
    })

    expect(done).toEqual(["first", "second"])
  })

  it("controllo positivo: due lezioni distinte procedono in parallelo", async () => {
    // il confine e' la lezione, non il workspace: se anche questo si bloccasse,
    // il lock sarebbe troppo grosso e i test di deadlock non proverebbero nulla
    const coordinator = isolatedCoordinator()
    const order: string[] = []

    await Promise.all([
      coordinator.withPathMutation("raw/lessonA/board.excalidraw", async () => {
        order.push("A")
      }),
      coordinator.withPathMutation("raw/lessonB/board.excalidraw", async () => {
        order.push("B")
      }),
    ])

    expect(order.sort()).toEqual(["A", "B"])
  })

  it("withPathMutation dentro withWorkspaceExclusive non progredisce", async () => {
    const coordinator = isolatedCoordinator()
    const innerRan: string[] = []

    const outer = coordinator.withWorkspaceExclusive(async () => {
      // il workspace e' preso in ESCLUSIVA; withPathMutation chiede lo stesso
      // nome in SHARED e si accoda dietro lo scrittore che lo sta attendendo
      await coordinator.withPathMutation("raw/lessonA/board.excalidraw", async () => {
        innerRan.push("inner")
      })
    })

    expect(await settlesWithin(outer)).toBe(PENDING)
    expect(innerRan).toEqual([])

    // e resta bloccato: non e' lentezza, e' attesa circolare
    expect(await settlesWithin(outer, 50)).toBe(PENDING)
  })

  it("withPathMutation annidato sulla stessa lezione non progredisce", async () => {
    const coordinator = isolatedCoordinator()
    const innerRan: string[] = []

    const outer = coordinator.withPathMutation(
      "raw/lessonA/board.excalidraw",
      async () => {
        await coordinator.withPathMutation("raw/lessonA/meta.json", async () => {
          innerRan.push("inner")
        })
      },
    )

    expect(await settlesWithin(outer)).toBe(PENDING)
    expect(innerRan).toEqual([])
  })

  it("un'attesa circolare avvelena il workspace per tutto il realm", async () => {
    // scoperto scrivendo questi test: il danno non e' confinato all'import che
    // si e' annidato. Chi condivide il broker — nel prodotto e' un singleton di
    // modulo — resta fuori anche su una lezione che non c'entra nulla.
    const broker = createInProcessMutationLockBroker()
    const deadlocked = createLessonMutationCoordinator(broker)
    const innocent = createLessonMutationCoordinator(broker)

    const stuck = deadlocked.withWorkspaceExclusive(async () => {
      await deadlocked.withPathMutation("raw/lessonA/board.excalidraw", async () => {})
    })
    expect(await settlesWithin(stuck)).toBe(PENDING)

    const unrelated = innocent.withPathMutation(
      "raw/lessonZ/board.excalidraw",
      async () => {},
    )
    expect(await settlesWithin(unrelated)).toBe(PENDING)
  })

  it("gli alias di case collassano sullo stesso nome di lock", () => {
    // su storage case-insensitive `RoomA` e `rooma` sono la stessa lezione: il
    // nome del lock lo riflette gia', e la transazione di import deve rifiutare
    // l'alias PRIMA di mutare (ADR-0006), non scoprirlo a meta' scrittura
    expect(lessonMutationLockName("RoomA")).toBe(lessonMutationLockName("rooma"))
  })
})
