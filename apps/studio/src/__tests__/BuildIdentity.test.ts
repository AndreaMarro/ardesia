// L'identita' del build, e il confronto che la rende un oracolo.
//
// Promozione a controllo meccanico di un difetto MISURATO il 2026-07-30:
// `node scripts/productionSmoke.mjs` e' uscito **0** contro
// `https://ardesia-lavagna.vercel.app` **senza che nessun deploy fosse
// avvenuto**, su un build di 116 commit prima. Le sue asserzioni — HTTP 200,
// un `<title>` statico dentro `index.html`, la parola «Ardesia» nel body,
// zero errori — non distinguono «ho deployato la SHA giusta» da «non ho
// deployato affatto».
//
// Quel test costa un browser e una rete. Questi costano millisecondi.

import { describe, it, expect } from "vitest"
import {
  BUILD_IDENTITY_KEY,
  buildIdentity,
  publishBuildIdentity,
  readBuildCommitSha,
} from "../buildIdentity"
import { shaMismatch } from "../../scripts/productionSmoke.mjs"

describe("buildIdentity", () => {
  it("legge la SHA iniettata a build time", () => {
    // vitest applica lo stesso `define` di vite.config.ts, quindi qui
    // `__ARDESIA_GIT_SHA__` e' la SHA reale del checkout.
    const sha = readBuildCommitSha()
    expect(sha).not.toBeNull()
    expect(sha).toMatch(/^[0-9a-f]{40}$/)
  })

  it("pubblica l'identita' su un globale, senza lanciare e in modo idempotente", () => {
    const finto: Record<string, unknown> = {}
    const a = publishBuildIdentity(finto)
    const b = publishBuildIdentity(finto)
    expect(finto[BUILD_IDENTITY_KEY]).toEqual(a)
    expect(b).toEqual(a)
    expect(a.schema).toBe(1)
  })

  it("non lancia su un bersaglio non scrivibile: osservare non deve poter rompere", () => {
    const congelato = Object.freeze({})
    expect(() => publishBuildIdentity(congelato)).not.toThrow()
    expect(publishBuildIdentity(congelato).commitSha).toBe(buildIdentity().commitSha)
  })
})

describe("shaMismatch — il confronto che rende lo smoke un oracolo", () => {
  const SHA = "79304d818f4eff4e38feffffdb56cdec6485ce85"

  it("senza attesa non dice niente: retrocompatibile", () => {
    expect(shaMismatch("", null)).toBeNull()
    expect(shaMismatch("", SHA)).toBeNull()
  })

  it("accetta la forma corta e quella lunga", () => {
    expect(shaMismatch("79304d81", SHA)).toBeNull()
    expect(shaMismatch(SHA, SHA)).toBeNull()
    expect(shaMismatch(SHA.toUpperCase(), SHA)).toBeNull()
  })

  it("FALLISCE su una SHA diversa", () => {
    const esito = shaMismatch("2b1ceb22", SHA)
    expect(esito).not.toBeNull()
    expect(esito).toContain("!=")
  })

  it("FALLISCE CHIUSO quando il build non sa dire chi e'", () => {
    // E' il caso reale della produzione del 2026-07-10, che precede
    // l'introduzione di `window.__ARDESIA_BUILD__`. Saltare il controllo qui
    // avrebbe riprodotto il difetto che questo file esiste per chiudere.
    const esito = shaMismatch("79304d81", null)
    expect(esito).not.toBeNull()
    expect(esito).toContain("non dichiara la propria identita'")
  })

  it("rifiuta un'attesa troppo corta invece di combaciare per caso", () => {
    const esito = shaMismatch("7930", SHA)
    expect(esito).not.toBeNull()
    expect(esito).toContain("non e' una SHA valida")
  })

  // I due buchi trovati dalla revisione avversariale del 2026-07-30, entrambi
  // riprodotti eseguendo la funzione. Un «fail-closed» con un buco e' peggio di
  // un controllo assente, perche' viene creduto.

  it("FALLISCE se la SHA SERVITA e' troppo corta: il confronto e' a senso unico", () => {
    // Prima passava: la validazione di lunghezza stava solo sull'attesa, e il
    // confronto simmetrico faceva combaciare `expected.startsWith(served)`.
    const esito = shaMismatch(SHA, "7930")
    expect(esito).not.toBeNull()
    expect(esito).toContain("malformata")
  })

  it("FALLISCE su un'identita' servita che non e' esadecimale", () => {
    const esito = shaMismatch("79304d81", "79304d81-not-a-sha")
    expect(esito).not.toBeNull()
    expect(esito).toContain("malformata")
  })

  it("l'attesa e' il PREFISSO della servita, mai il contrario", () => {
    expect(shaMismatch("79304d81", SHA)).toBeNull()
    // la servita non puo' essere un prefisso dell'attesa
    expect(shaMismatch(SHA, "79304d81")).not.toBeNull()
  })
})
