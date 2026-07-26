// Setup globale del gate vitest: dopo OGNI test drena il lavoro React rimandato
// a un macrotask, così nessun file finisce con un task del React scheduler in
// coda. Un task sopravvissuto al file esplode dopo il teardown jsdom con
// "ReferenceError: window is not defined" — test verdi, processo a 1.
// Il perché in dettaglio sta in ./reactWorkDrain.ts.
//
// La difesa è globale perché il rischio è globale, e la misura lo quantifica:
// strumentando `setImmediate` e contando i task ancora in coda in `afterEach`,
// sul candidato di questa modifica i file che finivano con lavoro del React
// scheduler pendente erano 15 su 183 senza questo setup e 0 su 183 con esso.
// Nessun file è speciale: quello che ha perso la corsa per primo è solo il primo.
import { afterEach } from "vitest"
import { flushReactDeferredWork } from "./reactWorkDrain"

afterEach(async () => {
  // I file in ambiente node non montano React: niente da drenare.
  if (typeof document === "undefined") return
  await flushReactDeferredWork()
})
