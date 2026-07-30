// Tipi per `productionSmoke.mjs`.
//
// Perche' una dichiarazione a mano invece di riscrivere lo script in TypeScript:
// lo smoke gira con `node scripts/productionSmoke.mjs` senza passo di build —
// e' cosi' che lo invoca `bin/monorepo.sh`, ed e' cosi' che deve poter girare
// contro un URL di produzione da qualunque macchina, anche senza toolchain.
// Portare la logica in `.ts` significherebbe o compilarla (un passo in piu' fra
// la misura e chi la esegue) o DUPLICARLA, e due copie di un confronto di SHA
// che divergono sono peggio di nessun confronto.

/**
 * Confronta la SHA attesa con quella servita dal build.
 *
 * @returns `null` se combaciano (o se non c'e' un'attesa); altrimenti il
 *   messaggio di fallimento. Fail-closed: con un'attesa presente e una SHA
 *   servita illeggibile ritorna un messaggio, non `null`.
 */
export declare function shaMismatch(
  expected: string,
  served: string | null | undefined,
): string | null
