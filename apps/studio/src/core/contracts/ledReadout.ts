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
