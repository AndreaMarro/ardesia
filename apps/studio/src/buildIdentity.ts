// Identita' del build, leggibile DALL'ESTERNO.
//
// Perche' esiste
// --------------
// Il criterio di accettazione dell'unita' F0-5 e' «SHA del deploy == SHA di
// `main`». Il 2026-07-30 quel criterio era **non verificabile**: la SHA c'era
// gia' nel bundle — `vite.config.ts:74` definisce `__ARDESIA_GIT_SHA__` e
// `eventEnvelope.ts:484` la scrive in ogni envelope — ma nessun percorso la
// esponeva a chi guarda la pagina da fuori.
//
// La conseguenza era misurata, non teorica: `scripts/productionSmoke.mjs`
// eseguito il 2026-07-30 contro `https://ardesia-lavagna.vercel.app` e' uscito
// **0** senza che nessun deploy fosse avvenuto, contro un build del 2026-07-10
// distante 116 commit. Asseriva HTTP 200, un `<title>` statico in `index.html`,
// la presenza della parola «Ardesia» nel body e l'assenza di errori: nessuna di
// queste distingue «ho deployato la SHA giusta» da «non ho deployato affatto».
//
// Un oracolo che non puo' fallire non e' un oracolo.
//
// Perche' NON e' dietro `import.meta.env.DEV`
// -------------------------------------------
// L'harness `window.__MAESTRO_TEST__` lo e', ed e' il motivo per cui il golden
// path non puo' girare contro la produzione. Questo deve valere **soprattutto**
// in produzione: e' la' che serve sapere cosa sta girando.
//
// Non aggiunge esposizione: la stessa stringa e' gia' nel bundle servito, e
// compare in chiaro dentro ogni evento prodotto dall'app.

declare const __ARDESIA_GIT_SHA__: string

/** Chiave globale letta dallo smoke di produzione. Non rinominarla senza
 *  aggiornare `scripts/productionSmoke.mjs`: sono un contratto. */
export const BUILD_IDENTITY_KEY = "__ARDESIA_BUILD__"

export type BuildIdentityV1 = Readonly<{
  schema: 1
  /** SHA del commit da cui questo bundle e' stato costruito, o `null` se il
   *  build non l'ha iniettata. `null` e' un esito legittimo e dichiarato: e'
   *  diverso da «non lo so» e da una stringa inventata. */
  commitSha: string | null
}>

/** Legge la SHA iniettata a build time, senza mai lanciare.
 *
 *  `typeof` e non un accesso diretto: se `define` non ha sostituito il simbolo
 *  — build servito da un percorso che non passa da vite, o configurazione
 *  cambiata — l'accesso diretto darebbe un `ReferenceError` che si porterebbe
 *  via il mount dell'app. Un difetto di osservabilita' non deve poter rompere
 *  il prodotto che osserva. */
export function readBuildCommitSha(): string | null {
  try {
    if (typeof __ARDESIA_GIT_SHA__ !== "string") return null
    const sha = __ARDESIA_GIT_SHA__.trim()
    return sha === "" ? null : sha
  } catch {
    return null
  }
}

export function buildIdentity(): BuildIdentityV1 {
  return Object.freeze({ schema: 1 as const, commitSha: readBuildCommitSha() })
}

/** Pubblica l'identita' su `window`. Idempotente e non lanciante: chiamarla due
 *  volte non e' un errore, e in un ambiente senza `window` (SSR, test node) non
 *  fa nulla invece di rompere. */
export function publishBuildIdentity(target: unknown = globalThis): BuildIdentityV1 {
  const identita = buildIdentity()
  try {
    ;(target as Record<string, unknown>)[BUILD_IDENTITY_KEY] = identita
  } catch {
    /* ambiente senza globale scrivibile: l'identita' resta comunque restituita */
  }
  return identita
}
