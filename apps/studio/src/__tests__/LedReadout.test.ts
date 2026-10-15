// Un `?.` collassa «assente» e «negativo»: `x?.on === true` vale `false` sia
// quando il LED è spento sia quando il LED non esiste o il solver non ha
// risposto. Nei due punti dove quel valore diventa una PAROLA mostrata a una
// persona, il collasso presenta «non lo so» come «spento».
//
// Il rimedio non è un `??` in più: è un tipo che non ha modo di collassare.

import { describe, expect, it } from "vitest"
import { LED_READOUT_LABELS, ledReadout, measureReadout } from "../core/contracts/ledReadout.ts"

describe("ledReadout: acceso, spento e ignoto sono TRE stati", () => {
  it("acceso e spento restano distinti", () => {
    expect(ledReadout(true)).toBe("on")
    expect(ledReadout(false)).toBe("off")
  })

  it("assente non vale spento — è la proprietà per cui questo modulo esiste", () => {
    expect(ledReadout(undefined)).toBe("unknown")
    expect(ledReadout(null)).toBe("unknown")
    expect(ledReadout(undefined)).not.toBe(ledReadout(false))
  })

  it("l'etichetta dell'ignoto non è l'etichetta dello spento", () => {
    expect(LED_READOUT_LABELS.unknown).not.toBe(LED_READOUT_LABELS.off)
    expect(LED_READOUT_LABELS.on).toBe("ON")
    expect(LED_READOUT_LABELS.off).toBe("OFF")
  })

  it("una misura assente non è uno zero", () => {
    // Il CARDINE (P1-3, 2026-07-31) nomina l'espressione esatta:
    // «calcola `currents.led ?? 0`, che può trasformare un valore assente in
    // uno zero apparente». Riparata la PAROLA in questa stessa PR e lasciato il
    // NUMERO, la striscia mostrava «LED ?» accanto a «0.0 mA»: due affermazioni
    // contraddittorie sullo stesso circuito, una prudente e una inventata.
    expect(measureReadout(null)).toBe(LED_READOUT_LABELS.unknown)
    expect(measureReadout(undefined)).toBe(LED_READOUT_LABELS.unknown)
    expect(measureReadout(null)).not.toBe("0.0")
  })

  it("uno zero VERO resta uno zero, e i decimali sono quelli chiesti", () => {
    expect(measureReadout(0)).toBe("0.0")
    expect(measureReadout(15.28)).toBe("15.3")
    expect(measureReadout(15.28, 2)).toBe("15.28")
  })

  it("`cifre: null` non formatta — perché non tutti i punti formattavano", () => {
    // Regressione vera, intercettata da quattro test il 2026-08-01 alle 23:14:
    // il post-it stampava `led current 0.0153` e la prima stesura di questo
    // helper, col default a un decimale, lo aveva ridotto a `0.0`. Riparare un
    // difetto imponendo un formato che nessuno aveva chiesto è una regressione
    // travestita da riparazione.
    expect(measureReadout(0.0153, null)).toBe("0.0153")
    expect(measureReadout(0.0153)).toBe("0.0")
    expect(measureReadout(null, null)).toBe(LED_READOUT_LABELS.unknown)
  })

  it("NaN e infinito non sono misure — `?? 0` non li avrebbe nemmeno visti", () => {
    expect(measureReadout(Number.NaN)).toBe(LED_READOUT_LABELS.unknown)
    expect(measureReadout(Number.POSITIVE_INFINITY)).toBe(LED_READOUT_LABELS.unknown)
  })

  it("i tre stati sono esattamente tre: nessuna etichetta vuota", () => {
    const stati = Object.keys(LED_READOUT_LABELS).sort()
    expect(stati).toEqual(["off", "on", "unknown"])
    for (const [stato, etichetta] of Object.entries(LED_READOUT_LABELS)) {
      expect(etichetta.trim(), `etichetta vuota per ${stato}`).not.toBe("")
    }
  })
})
