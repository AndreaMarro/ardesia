// Un `?.` collassa «assente» e «negativo»: `x?.on === true` vale `false` sia
// quando il LED è spento sia quando il LED non esiste o il solver non ha
// risposto. Nei due punti dove quel valore diventa una PAROLA mostrata a una
// persona, il collasso presenta «non lo so» come «spento».
//
// Il rimedio non è un `??` in più: è un tipo che non ha modo di collassare.

import { describe, expect, it } from "vitest"
import { LED_READOUT_LABELS, ledReadout } from "../core/contracts/ledReadout.ts"

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

  it("i tre stati sono esattamente tre: nessuna etichetta vuota", () => {
    const stati = Object.keys(LED_READOUT_LABELS).sort()
    expect(stati).toEqual(["off", "on", "unknown"])
    for (const [stato, etichetta] of Object.entries(LED_READOUT_LABELS)) {
      expect(etichetta.trim(), `etichetta vuota per ${stato}`).not.toBe("")
    }
  })
})
