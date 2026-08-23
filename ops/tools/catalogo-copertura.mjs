#!/usr/bin/env node
/**
 * catalogo-copertura — quante scene ELAB il motore elettrico sa risolvere, e
 * quale componente ne sbloccherebbe di piu'.
 *
 * PERCHE' ESISTE
 * --------------
 * Misurato il 2026-08-23: il solver e' fail-closed sui tipi non catalogati
 * (`apps/studio/sim/solver/elabSolver.ts`, «Fail-closed sui tipi non
 * catalogati»), il catalogo elettrico ne registra SETTE, e QUATTRO delle otto
 * scene visibili contengono componenti fuori catalogo. Il docente vede un alert
 * visibile che dice quale tipo manca, e nessun verdetto elettrico.
 *
 * La domanda che ne segue non e' «e' un difetto» — non lo e', il rifiuto e'
 * dichiarato — ma «quanto costa cambiarlo, e da dove si comincia». Questo
 * comando risponde con due numeri e una tabella, invece che con un'impressione.
 *
 * ⚠️ NON dice che catalogare un tipo sia facile. Un catalogo non e' un elenco
 * di nomi: e' un modello. Registrare `capacitor` o `nano-r4` senza la fisica
 * corrispondente darebbe un solve che RISPONDE invece di rifiutare — l'opposto
 * esatto di cio' che quel `throw` protegge. Questo comando misura la
 * COPERTURA, non la difficolta'.
 *
 * L'ordine e' GREEDY, non ottimo: a ogni passo sceglie il tipo che sblocca piu'
 * scene. E' l'ordine che serve per decidere «da dove comincio», non una
 * partizione minima.
 *
 * USO
 *   node ops/tools/catalogo-copertura.mjs
 *
 * EXIT
 *   0  misura eseguita
 *   1  i dati o il catalogo non sono leggibili — non degrada, fallisce
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const RADICE = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

/** I tipi registrati, letti dal catalogo vero e non ricopiati qui. */
function catalogoRegistrato() {
  const sorgente = readFileSync(join(RADICE, "apps/studio/sim/solver/catalog.ts"), "utf8")
  const tipi = [...sorgente.matchAll(/registerComponent\("([a-z0-9-]+)"/g)].map((m) => m[1])
  if (tipi.length === 0) throw new Error("catalog.ts non contiene registerComponent: catalogo non leggibile")
  return new Set(tipi)
}

async function esperimenti() {
  const moduli = await Promise.all(
    ["vol1", "vol2", "vol3"].map((v) =>
      import(join(RADICE, `plugins/elab-tutor/src/data/experiments-${v}.js`)),
    ),
  )
  const tutti = moduli
    .map((m) => m.default)
    .flatMap((v) => (Array.isArray(v) ? v : Object.values(v ?? {}).flat()))
    .filter((e) => e && e.id)
  if (tutti.length === 0) throw new Error("nessun esperimento caricato: dati non leggibili")
  return tutti
}

const catalogo = catalogoRegistrato()
const tutti = await esperimenti()

const mancantiDi = new Map()
for (const e of tutti) {
  const tipi = [...new Set((e.components ?? []).map((c) => c.type))]
  mancantiDi.set(e.id, new Set(tipi.filter((t) => !catalogo.has(t))))
}

const usoPerTipo = new Map()
for (const s of mancantiDi.values()) for (const t of s) usoPerTipo.set(t, (usoPerTipo.get(t) ?? 0) + 1)

const risolvibili = (cat) =>
  [...mancantiDi.values()].filter((s) => [...s].every((t) => cat.has(t))).length

console.log("tipo fuori catalogo · scene che lo usano")
for (const [t, n] of [...usoPerTipo.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t.padEnd(18)} ${n}`)
}

console.log("")
console.log("ordine greedy: quale tipo sblocca piu' scene, uno alla volta")
const cat = new Set(catalogo)
let prima = risolvibili(cat)
console.log(`  catalogo attuale (${cat.size} tipi)    ${prima} risolvibili su ${tutti.length}`)
for (;;) {
  const candidati = new Set()
  for (const s of mancantiDi.values()) for (const t of s) if (!cat.has(t)) candidati.add(t)
  if (candidati.size === 0) break
  let migliore = null
  let guadagno = -1
  for (const t of candidati) {
    cat.add(t)
    const g = risolvibili(cat)
    cat.delete(t)
    if (g > guadagno) {
      guadagno = g
      migliore = t
    }
  }
  cat.add(migliore)
  console.log(`  +${migliore.padEnd(18)} ${guadagno} risolvibili (+${guadagno - prima})`)
  prima = guadagno
}

// I conteggi IN FONDO: measure.sh incide le ultime 40 righe, e una somma
// stampata per prima sparisce dal record.
console.log("")
console.log(`esperimenti nel corpus: ${tutti.length}`)
console.log(`tipi nel catalogo elettrico: ${catalogo.size}`)
console.log(`tipi fuori catalogo usati dal corpus: ${usoPerTipo.size}`)
console.log(`risolvibili col catalogo attuale: ${risolvibili(catalogo)}`)
