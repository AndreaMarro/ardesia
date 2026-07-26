// Sotto Node il React scheduler schedula il proprio lavoro con setImmediate
// (node_modules/scheduler/cjs/scheduler.development.js:216, localSetImmediate).
// Quel task NON appartiene a jsdom: sopravvive al teardown dell'ambiente. La
// callback che React accoda dopo un commit legge come PRIMA istruzione la
// globale nuda `window` (react-dom-client.development.js:17920,
// `schedulerEvent = window.event`). Il teardown jsdom di vitest cancella
// `window` da globalThis (vitest/dist/chunks/index.*.js: `keys.forEach((key) =>
// delete global[key])`): se un file finisce con quel task ancora in coda, il
// task esplode DOPO il teardown con
//     ReferenceError: window is not defined
// come "unhandled error". I test restano verdi e il processo esce 1.
//
// Dentro act() lo scheduling passa per actQueue invece che per lo scheduler
// reale (react-dom-client.development.js:18748) e act svuota la coda prima di
// tornare: nessun setImmediate resta in volo. Il timeout a 0 serve a far girare
// DENTRO quella finestra i dispose differiti a un macrotask — per esempio
// plugins/elab-tutor/src/plugin/renderEmbeddable.jsx:44, che rimanda
// root.unmount() del root dell'embed al task successivo perché l'unmount
// sincrono dentro il cleanup di un effect è vietato da React.
import { act } from "react"

/**
 * Porta a termine, entro la vita del test, il lavoro React rimandato a un
 * macrotask. Da chiamare dopo lo smontaggio (cleanup()/root.unmount()).
 */
export async function flushReactDeferredWork(): Promise<void> {
  // act() senza ambiente dichiarato stampa un warning: lo si dichiara solo per
  // la durata del drenaggio, così i test non cambiano comportamento.
  const previous = Reflect.get(globalThis, "IS_REACT_ACT_ENVIRONMENT")
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true)
  try {
    await act(async () => {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0)
      })
    })
  } finally {
    Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", previous)
  }
}
