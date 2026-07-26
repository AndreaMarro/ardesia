// Sotto Node il React scheduler lega `setImmediate` AL CARICAMENTO del modulo
// (node_modules/scheduler/cjs/scheduler.development.js:210, `localSetImmediate`)
// e lo usa per schedulare il proprio lavoro (stessa fonte, riga 218).
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
// DENTRO quella finestra il lavoro React rimandato a un macrotask. Il caso
// generale e' uno SMONTAGGIO DIFFERITO: React vieta di chiamare `root.unmount()`
// in modo sincrono dentro il cleanup di un effect, quindi chi monta un root
// annidato deve rimandare lo smontaggio al task successivo, e quel commit finisce
// fuori da qualunque finestra act().
import { act } from "react"

let drains = 0

/**
 * Quante volte `flushReactDeferredWork` e' arrivata a termine dentro questo file
 * di test. Serve a un solo scopo: rendere OSSERVABILE che il setup globale del
 * gate ha davvero drenato, invece di dedurlo da una stringa in
 * `vitest.config.ts`. Un corpo di setup svuotato lascia questo contatore a zero.
 */
export function reactDeferredWorkDrainCount(): number {
  return drains
}

/**
 * Porta a termine, entro la vita del test, il lavoro React rimandato a un
 * macrotask. Da chiamare dopo lo smontaggio (cleanup()/root.unmount()).
 */
export async function flushReactDeferredWork(): Promise<void> {
  // act() senza ambiente dichiarato stampa un warning: lo si dichiara solo per
  // la durata del drenaggio, cosi' i test non cambiano comportamento. Si salva il
  // DESCRITTORE, non il valore: se la proprieta' non esisteva, riassegnarla a
  // `undefined` la CREEREBBE, lasciando stato globale residuo fra i test.
  const previous = Object.getOwnPropertyDescriptor(globalThis, "IS_REACT_ACT_ENVIRONMENT")
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true)
  try {
    await act(async () => {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 0)
      })
    })
  } finally {
    if (previous === undefined) {
      Reflect.deleteProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT")
    } else {
      Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", previous)
    }
  }
  drains += 1
}
