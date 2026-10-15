// Tre stati, non due. `x?.on === true` vale `false` sia per «spento» sia per
// «non lo so» (componente assente dalla scena, solver che non ha risposto,
// vista non ancora calcolata): dove quel booleano diventa una parola letta da
// una persona, il collasso presenta l'ignoto come un fatto.
//
// Il tipo di ingresso ammette `null` e `undefined` DI PROPOSITO: chi chiama non
// deve appiattirli prima, altrimenti il collasso torna al punto di chiamata.

export type LedReadoutState = "on" | "off" | "unknown"

export const LED_READOUT_LABELS: Readonly<Record<LedReadoutState, string>> = Object.freeze({
  on: "ON",
  off: "OFF",
  // Non una stringa vuota: uno spazio bianco al posto del valore si legge come
  // «non c'è niente da dire», che è un'altra affermazione ancora.
  unknown: "?",
})

/** `null`/`undefined` = nessuna risposta, che non è una risposta negativa. */
export function ledReadout(lit: boolean | null | undefined): LedReadoutState {
  if (lit === null || lit === undefined) return "unknown"
  return lit ? "on" : "off"
}

/**
 * Lo stesso principio sui NUMERI. `valore ?? 0` trasforma «non misurato» in
 * «misurato zero», che è un fatto inventato: un LED senza corrente e un LED di
 * cui non conosciamo la corrente si leggono entrambi «0.0 mA».
 *
 * Copre anche `NaN` e infinito, che `?? 0` non intercetta nemmeno: sono esiti
 * di un solver che non ha convergiuto, non misure.
 *
 * `cifre: null` rende il valore GREZZO. Serve perché non tutti i punti
 * formattavano: imporre un decimale dove prima si stampava `0.0153` sarebbe una
 * regressione travestita da riparazione — ed è successo davvero il 2026-08-01
 * alle 23:14, intercettato da quattro test.
 */
export function measureReadout(
  valore: number | null | undefined,
  cifre: number | null = 1,
): string {
  if (valore === null || valore === undefined || !Number.isFinite(valore)) {
    return LED_READOUT_LABELS.unknown
  }
  return cifre === null ? String(valore) : valore.toFixed(cifre)
}
