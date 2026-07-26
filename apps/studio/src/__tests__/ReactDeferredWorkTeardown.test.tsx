// @vitest-environment jsdom
// Proprieta' verificata, in generale: alla fine di un test non deve restare
// lavoro React differito che, girando dopo il teardown dell'ambiente jsdom,
// legga una globale `window` che non esiste piu'.
//
// Meccanismo. Un commit React che avviene FUORI da una finestra `act()` viene
// accodato dal React scheduler con `setImmediate` (scheduler.development.js:210
// lega la globale al caricamento del modulo, riga 218 la chiama). Un `Immediate`
// di Node appartiene all'event loop del PROCESSO, non a jsdom: non viene
// cancellato dal teardown dell'ambiente. La callback che React esegue legge come
// prima istruzione la globale nuda `window` (react-dom-client.development.js:
// 17920), e il teardown jsdom di vitest cancella `window` da `globalThis`. Se un
// file finisce con quel task in coda, il task esplode DOPO il teardown come
// unhandled error: test verdi, processo a 1.
//
// La fixture usa soltanto React e react-dom. Il difetto non appartiene a un
// componente di prodotto: appartiene alla combinazione React + jsdom + Node, e un
// test che lo dimostrasse tramite un componente specifico misurerebbe la cosa
// sbagliata.
//
// Tre oracoli, che si tengono a vicenda:
//
//  A  CON la difesa il turno senza `window` e' pulito.
//  B  il setup globale del gate esegue DAVVERO il drenaggio fra due test. Questo
//     oracolo va rosso anche se il corpo di `vitest.setup.ts` viene svuotato
//     lasciando il riferimento in `vitest.config.ts` — una
//     `expect(config).toContain(...)` non lo rileverebbe.
//  C  controllo negativo: la stessa fixture SENZA la difesa esplode davvero. E'
//     l'oracolo che impedisce ad A di diventare verde per assenza di lavoro
//     differito invece che per merito della difesa. Sta per ultimo perche'
//     provoca di proposito un errore non gestito.
import { createRoot, type Root } from "react-dom/client"
import { describe, expect, it } from "vitest"
import { flushReactDeferredWork, reactDeferredWorkDrainCount } from "./reactWorkDrain"

const WINDOWLESS_TURN_MS = 25
const MISSING_WINDOW = "window is not defined"

function Leaf() {
  return <span data-testid="leaf">contenuto</span>
}

/**
 * Monta un root React FUORI da `act()`: e' la condizione che manda il commit al
 * React scheduler reale invece che nella `actQueue` di act.
 */
function mountRootOutsideAct(): { root: Root; host: HTMLDivElement } {
  const host = document.createElement("div")
  document.body.appendChild(host)
  const root = createRoot(host)
  root.render(<Leaf />)
  return { root, host }
}

function disposeRoot({ root, host }: { root: Root; host: HTMLDivElement }): void {
  root.unmount()
  host.remove()
}

/**
 * Cancella `window` come fa il teardown dell'ambiente jsdom di vitest, concede al
 * loop una girata di timers e di check, e restituisce SOLO gli errori non gestiti
 * che riguardano l'assenza di `window`.
 *
 * Ogni altro errore non gestito raccolto nella finestra viene RILANCIATO dopo il
 * ripristino. Sospendere la rilevazione di vitest e poi ignorare quello che si
 * raccoglie farebbe di questo test il posto dove i guasti estranei vanno a
 * morire.
 */
async function uncaughtWhileWindowIsMissing(): Promise<string[]> {
  const seen: unknown[] = []
  const collect = (error: unknown) => {
    seen.push(error)
  }
  const savedListeners = process.listeners("uncaughtException")
  process.removeAllListeners("uncaughtException")
  process.on("uncaughtException", collect)
  const savedWindow = Reflect.get(globalThis, "window")
  Reflect.deleteProperty(globalThis, "window")
  try {
    // La finestra deve coprire ANCHE la fase `check`, dove Node esegue gli
    // `setImmediate`: e' lì che gira il lavoro del React scheduler. Il timer da
    // solo risolve nella fase timers, quindi si cede esplicitamente al check
    // prima di ripristinare `window`.
    await new Promise<void>((resolve) => {
      setTimeout(resolve, WINDOWLESS_TURN_MS)
    })
    await new Promise<void>((resolve) => {
      setImmediate(resolve)
    })
  } finally {
    Reflect.set(globalThis, "window", savedWindow)
    process.off("uncaughtException", collect)
    for (const listener of savedListeners) {
      process.on("uncaughtException", listener)
    }
  }
  const aboutMissingWindow: string[] = []
  const unrelated: unknown[] = []
  for (const error of seen) {
    if (String(error).includes(MISSING_WINDOW)) {
      aboutMissingWindow.push(String(error))
    } else {
      unrelated.push(error)
    }
  }
  if (unrelated.length === 1) throw unrelated[0]
  if (unrelated.length > 1) {
    throw new AggregateError(
      unrelated,
      `${unrelated.length} errori non gestiti estranei a questo test, non inghiottiti`,
    )
  }
  return aboutMissingWindow
}

// Drenaggi portati a termine, campionati alla fine del test A. Fra A e B gira il
// setup globale, e in questo file nient'altro incrementa il contatore.
let drainsAfterFirstTest: number | null = null

describe("lavoro React differito e teardown dell'ambiente", () => {
  it("A — con il drenaggio, il turno senza window non produce errori", async () => {
    const mounted = mountRootOutsideAct()

    await flushReactDeferredWork()
    expect(await uncaughtWhileWindowIsMissing()).toEqual([])

    disposeRoot(mounted)
    drainsAfterFirstTest = reactDeferredWorkDrainCount()
  })

  it("B — il setup globale del gate esegue il drenaggio fra un test e il successivo", () => {
    // `null` significa che i test hanno girato fuori ordine: l'oracolo non vale,
    // e meglio rosso che verde per caso.
    expect(drainsAfterFirstTest).not.toBeNull()
    // L'unico codice che puo' aver incrementato il contatore fra A e B e'
    // l'`afterEach` registrato da `src/__tests__/vitest.setup.ts`.
    expect(reactDeferredWorkDrainCount()).toBeGreaterThan(drainsAfterFirstTest ?? 0)
  })

  it("D — il drenaggio ripristina esattamente lo stato precedente della globale", async () => {
    // `IS_REACT_ACT_ENVIRONMENT` viene alzata solo per la durata del drenaggio.
    // Le due precondizioni vanno STABILITE, non osservate: i drenaggi dei test
    // precedenti hanno gia' toccato la globale, quindi un assert di sola
    // invarianza sarebbe verde per inerzia e non proverebbe nulla.

    // Precondizione 1: assente. Ripristinarla col VALORE invece che col
    // DESCRITTORE la creerebbe a `undefined`, lasciando stato globale residuo.
    Reflect.deleteProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT")
    await flushReactDeferredWork()
    expect(Object.hasOwn(globalThis, "IS_REACT_ACT_ENVIRONMENT")).toBe(false)

    // Precondizione 2: presente con un valore proprio, che deve tornare intatto.
    const sentinel = Symbol("valore-precedente")
    Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", sentinel)
    await flushReactDeferredWork()
    expect(Reflect.get(globalThis, "IS_REACT_ACT_ENVIRONMENT")).toBe(sentinel)

    Reflect.deleteProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT")
  })

  it("C — controllo negativo: senza il drenaggio la stessa fixture esplode", async () => {
    const mounted = mountRootOutsideAct()

    // Nessun drenaggio, di proposito: il commit del root resta accodato nel React
    // scheduler ed entra nella finestra senza `window`.
    const errors = await uncaughtWhileWindowIsMissing()

    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toContain(MISSING_WINDOW)

    disposeRoot(mounted)
  })

  it("E — un errore non gestito estraneo non viene inghiottito", async () => {
    // La finestra di osservazione sospende la rilevazione di vitest: se gli errori
    // raccolti venissero solo scartati, questo test sarebbe il posto dove un
    // guasto qualsiasi scompare. Un errore estraneo deve far fallire la chiamata.
    setTimeout(() => {
      throw new Error("guasto estraneo al teardown")
    }, 0)

    await expect(uncaughtWhileWindowIsMissing()).rejects.toThrow("guasto estraneo al teardown")
  })
})
