// Setup globale del gate vitest: dopo OGNI test drena il lavoro React rimandato
// a un macrotask, così nessun file finisce con un task del React scheduler in
// coda. Un task sopravvissuto al file esplode dopo il teardown jsdom con
// "ReferenceError: window is not defined" — test verdi, processo a 1.
// Il perché in dettaglio sta in ./reactWorkDrain.ts.
//
// La difesa è globale perché il rischio è globale: la misura su ad8f0f9f
// (setImmediate strumentato) dava 17 file su 180 che finivano con un task del
// React scheduler in coda, e ElabExperimentVisibility.test.tsx è solo quello
// che ha perso la corsa per primo.
import { afterEach } from "vitest"
import { flushReactDeferredWork } from "./reactWorkDrain"

afterEach(async () => {
  // I file in ambiente node non montano React: niente da drenare.
  if (typeof document === "undefined") return
  await flushReactDeferredWork()
})
