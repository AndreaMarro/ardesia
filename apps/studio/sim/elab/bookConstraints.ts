// Vincoli topologici del TESTO del manuale (Vol.1 cap.6 esp.1, pp.29-31) resi
// eseguibili: `bookMatch` smette di essere una stringa auto-asserita in
// provenance.checks e diventa un verdetto calcolato e falsificabile.
// Il testo lascia liberi i fori esatti ("un punto qualsiasi della striscia
// rossa", "un punto qualsiasi della zona sotto"): qui si verifica SOLO ciò che
// il libro impone, al livello delle net (tie-strip/rail), non dei fori.
import { parseBreadboardRef, type ParsedBreadboardRef } from "../breadboard/simulationBreadboard.ts"
import type { ElabScene } from "./elabScene.ts"

export type BookConstraintResult = {
  id: string
  ok: boolean
  detail: string
  bookRef: string
}

export type BookConstraintsReport = {
  ok: boolean
  results: BookConstraintResult[]
}

const BOOK_REF_P29 = "Vol.1 pag.29"
const BOOK_REF_P30 = "Vol.1 pag.30"
const BOOK_REF_P31 = "Vol.1 pag.31"
const BOOK_REF_P32 = "Vol.1 pag.32"

function isPlusRail(parsed: ParsedBreadboardRef | null): boolean {
  return parsed?.kind === "rail" && (parsed.rail === "bus-top-plus" || parsed.rail === "bus-bot-plus")
}

function isTerminalHole(parsed: ParsedBreadboardRef | null): parsed is ParsedBreadboardRef & { kind: "terminal" } {
  return parsed?.kind === "terminal"
}

/** Estremo opposto di un wire rispetto a un pin componente (`bat1:positive`). */
function wireEndpointOpposite(scene: ElabScene, componentPinRef: string): string | null {
  for (const wire of scene.wires) {
    if (wire.from === componentPinRef) return wire.to
    if (wire.to === componentPinRef) return wire.from
  }
  return null
}

export function checkBookConstraintsV1Cap6Esp1(scene: ElabScene): BookConstraintsReport {
  const battery = scene.components.find((component) => component.type === "battery9v")
  const resistor = scene.components.find((component) => component.type === "resistor")
  const led = scene.components.find((component) => component.type === "led")
  const breadboard = scene.components.find((component) => component.type === "breadboard-half")

  const results: BookConstraintResult[] = []

  // C1 — "Collega il positivo della batteria alla striscia rossa superiore
  // della breadboard" (p30): esiste un wire da bat:positive a una rail plus.
  {
    const target = battery ? wireEndpointOpposite(scene, `${battery.id}:positive`) : null
    const parsed = target === null ? null : parseBreadboardRef(target)
    const ok = isPlusRail(parsed)
    results.push({
      id: "battery-positive-to-red-rail",
      ok,
      detail: ok
        ? `bat+ collegato al rail rosso (${target})`
        : `bat+ non arriva a una striscia rossa (endpoint: ${target ?? "assente"})`,
      bookRef: `${BOOK_REF_P30} — "Collega il positivo della batteria alla striscia rossa superiore della breadboard"`,
    })
  }

  // C2 — "Collega il resistore da 470 Ohm tra un punto qualsiasi della
  // striscia rossa e un punto qualsiasi della zona sotto" (p30): dei due pin
  // del resistore, esattamente uno su una rail plus e uno su un foro zona.
  const resistorZonePin = (() => {
    if (!resistor) return null
    const pin1 = parseBreadboardRef(scene.pinAssignments[`${resistor.id}:pin1`] ?? "")
    const pin2 = parseBreadboardRef(scene.pinAssignments[`${resistor.id}:pin2`] ?? "")
    const railCount = [pin1, pin2].filter((pin) => isPlusRail(pin)).length
    const zonePins = [pin1, pin2].filter((pin) => isTerminalHole(pin))
    if (railCount === 1 && zonePins.length === 1) return zonePins[0]!
    return null
  })()
  results.push({
    id: "resistor-bridges-rail-and-zone",
    ok: resistorZonePin !== null,
    detail:
      resistorZonePin !== null
        ? `resistore a cavallo rail/zona (gamba zona: ${resistorZonePin.row}${resistorZonePin.column})`
        : "il resistore non ha esattamente una gamba nella striscia rossa e una nella zona fori",
    bookRef: `${BOOK_REF_P30} — "Collega il resistore da 470 Ohm tra un punto qualsiasi della striscia rossa e un punto qualsiasi della zona sotto"`,
  })

  // C3 — "Collega la gambetta lunga del LED verso il resistore e la gambetta
  // corta in un punto qualsiasi della parte sotto dopo la divisione centrale"
  // (p30): anodo sulla stessa tie-strip della gamba-zona del resistore, catodo
  // su una tie-strip dell'altra metà (oltre il canale centrale).
  {
    const anode = led ? parseBreadboardRef(scene.pinAssignments[`${led.id}:anode`] ?? "") : null
    const cathode = led ? parseBreadboardRef(scene.pinAssignments[`${led.id}:cathode`] ?? "") : null
    const anodeTowardResistor =
      resistorZonePin !== null && isTerminalHole(anode) && anode.nodeId === resistorZonePin.nodeId
    const cathodePastChannel =
      isTerminalHole(anode) &&
      isTerminalHole(cathode) &&
      // nodeId codifica la metà (tie-top-N / tie-bottom-N): metà diverse,
      // stessa colonna NON richiesta dal testo per il catodo.
      anode.nodeId.includes("-top-") !== cathode.nodeId.includes("-top-")
    const ok = anodeTowardResistor && cathodePastChannel
    results.push({
      id: "led-anode-toward-resistor-cathode-past-channel",
      ok,
      detail: ok
        ? "anodo sulla strip del resistore, catodo oltre il canale centrale"
        : `LED non conforme (anodo verso resistore: ${anodeTowardResistor}, catodo oltre il canale: ${cathodePastChannel})`,
      bookRef: `${BOOK_REF_P30} — "Collega la gambetta lunga del LED verso il resistore e la gambetta corta in un punto qualsiasi della parte sotto dopo la divisione centrale"`,
    })
  }

  // C4 — "Collega il negativo della batteria in un punto qualsiasi della
  // stessa colonna della gambetta corta del LED" (p31): l'endpoint del filo
  // nero condivide la tie-strip del catodo.
  {
    const cathode = led ? parseBreadboardRef(scene.pinAssignments[`${led.id}:cathode`] ?? "") : null
    const target = battery ? wireEndpointOpposite(scene, `${battery.id}:negative`) : null
    const parsed = target === null ? null : parseBreadboardRef(target)
    const ok =
      isTerminalHole(parsed) && isTerminalHole(cathode) && parsed.nodeId === cathode.nodeId
    results.push({
      id: "battery-negative-same-column-as-cathode",
      ok,
      detail: ok
        ? `bat- nella colonna del catodo (${target})`
        : `bat- non condivide la colonna del catodo (endpoint: ${target ?? "assente"})`,
      bookRef: `${BOOK_REF_P31} — "Collega il negativo della batteria in un punto qualsiasi della stessa colonna della gambetta corta del LED"`,
    })
  }

  // C5 — BOM del libro (p29, elenco materiali): esattamente batteria 9V,
  // breadboard, resistore 470 Ohm, LED rosso. La clip è parte della batteria.
  {
    const types = scene.components.map((component) => component.type).sort()
    const expected = ["battery9v", "breadboard-half", "led", "resistor"]
    const bomOk =
      types.length === expected.length &&
      types.every((type, index) => type === expected[index]) &&
      battery !== undefined &&
      breadboard !== undefined &&
      resistor?.value === 470 &&
      led?.color === "red"
    results.push({
      id: "bom-matches-book",
      ok: bomOk,
      detail: bomOk
        ? "componenti = LED rosso, breadboard, batteria 9V, resistore 470 Ohm"
        : `BOM diversa dal libro (trovati: ${types.join(", ") || "nessuno"}; r=${String(resistor?.value)}, led=${String(led?.color)})`,
      bookRef: `${BOOK_REF_P29} — elenco materiali dell'esperimento 1`,
    })
  }

  return { ok: results.every((result) => result.ok), results }
}

/**
 * Vincoli del TESTO/FIGURA di Vol.1 cap.6 esp.2 (p.32) — "LED senza resistore
 * (cosa NON fare!)". L'esperimento è dimostrativo: il libro mostra il LED
 * collegato DIRETTAMENTE alla batteria (nessun resistore nel percorso) e
 * avverte che così il LED si brucia. bookMatch qui = "la scena riproduce
 * l'errore del libro", non "il circuito è sano".
 */
export function checkBookConstraintsV1Cap6Esp2(scene: ElabScene): BookConstraintsReport {
  const battery = scene.components.find((component) => component.type === "battery9v")
  const led = scene.components.find((component) => component.type === "led")
  const breadboard = scene.components.find((component) => component.type === "breadboard-half")
  const resistors = scene.components.filter((component) => component.type === "resistor")

  const results: BookConstraintResult[] = []

  const anode = led ? parseBreadboardRef(scene.pinAssignments[`${led.id}:anode`] ?? "") : null
  const cathode = led ? parseBreadboardRef(scene.pinAssignments[`${led.id}:cathode`] ?? "") : null

  // E1 — figura p.32: il filo rosso porta bat+ alla striscia rossa.
  {
    const target = battery ? wireEndpointOpposite(scene, `${battery.id}:positive`) : null
    const parsed = target === null ? null : parseBreadboardRef(target)
    const ok = isPlusRail(parsed)
    results.push({
      id: "battery-positive-to-red-rail",
      ok,
      detail: ok
        ? `bat+ collegato al rail rosso (${target})`
        : `bat+ non arriva a una striscia rossa (endpoint: ${target ?? "assente"})`,
      bookRef: `${BOOK_REF_P32} — figura: filo rosso dalla batteria alla striscia rossa`,
    })
  }

  // E2 — "il LED direttamente alla batteria" (p.32): NESSUN resistore in
  // scena E un filo che porta la striscia rossa direttamente alla tie-strip
  // dell'anodo. È il cuore dell'errore dimostrato dal libro.
  {
    const noResistor = resistors.length === 0
    const directWire = scene.wires.some((wire) => {
      const from = parseBreadboardRef(wire.from)
      const to = parseBreadboardRef(wire.to)
      const railEnd = isPlusRail(from) ? from : isPlusRail(to) ? to : null
      const holeEnd = isTerminalHole(from) ? from : isTerminalHole(to) ? to : null
      return (
        railEnd !== null &&
        holeEnd !== null &&
        isTerminalHole(anode) &&
        holeEnd.nodeId === anode.nodeId
      )
    })
    const ok = noResistor && directWire
    results.push({
      id: "led-direct-to-battery-no-resistor",
      ok,
      detail: ok
        ? "nessun resistore in scena; striscia rossa collegata direttamente alla strip dell'anodo"
        : `percorso non diretto (resistori in scena: ${resistors.length}; filo rail→strip anodo: ${directWire})`,
      bookRef: `${BOOK_REF_P32} — "Se infatti colleghi per errore il LED direttamente alla batteria, il LED si brucia"`,
    })
  }

  // E3 — figura p.32: LED a cavallo della divisione centrale (anodo e catodo
  // su metà opposte della breadboard).
  {
    const ok =
      isTerminalHole(anode) &&
      isTerminalHole(cathode) &&
      anode.nodeId.includes("-top-") !== cathode.nodeId.includes("-top-")
    results.push({
      id: "led-straddles-central-channel",
      ok,
      detail: ok
        ? "LED a cavallo della divisione centrale"
        : `LED non a cavallo del canale (anodo: ${String(anode?.nodeId)}, catodo: ${String(cathode?.nodeId)})`,
      bookRef: `${BOOK_REF_P32} — figura: LED a cavallo della divisione centrale`,
    })
  }

  // E4 — figura p.32: il filo nero porta bat- alla tie-strip del catodo.
  {
    const target = battery ? wireEndpointOpposite(scene, `${battery.id}:negative`) : null
    const parsed = target === null ? null : parseBreadboardRef(target)
    const ok =
      isTerminalHole(parsed) && isTerminalHole(cathode) && parsed.nodeId === cathode.nodeId
    results.push({
      id: "battery-negative-same-column-as-cathode",
      ok,
      detail: ok
        ? `bat- nella colonna del catodo (${target})`
        : `bat- non condivide la colonna del catodo (endpoint: ${target ?? "assente"})`,
      bookRef: `${BOOK_REF_P32} — figura: filo nero dalla batteria alla colonna del catodo`,
    })
  }

  // E5 — componenti della dimostrazione: SOLO batteria 9V, breadboard e LED.
  // Un resistore in scena significherebbe "esperimento 1", non l'errore
  // dimostrato a p.32.
  {
    const types = scene.components.map((component) => component.type).sort()
    const expected = ["battery9v", "breadboard-half", "led"]
    const ok =
      types.length === expected.length &&
      types.every((type, index) => type === expected[index]) &&
      battery !== undefined &&
      breadboard !== undefined &&
      led !== undefined
    results.push({
      id: "bom-demo-no-resistor",
      ok,
      detail: ok
        ? "componenti = batteria 9V, breadboard, LED (nessun resistore)"
        : `BOM diversa dalla dimostrazione p.32 (trovati: ${types.join(", ") || "nessuno"})`,
      bookRef: `${BOOK_REF_P32} — dimostrazione: LED collegato direttamente alla batteria`,
    })
  }

  return { ok: results.every((result) => result.ok), results }
}

/**
 * Vincoli del TESTO/FIGURE di Vol.1 cap.6 esp.3 (p.33) — "Cambia luminosità
 * con resistenze diverse". Le due figure (220 Ohm / 1 kOhm) condividono il
 * layout di esp1; il testo aggiunge UN vincolo di sicurezza esplicito:
 * "NON scendere mai al di sotto dei 100 Ohm". La scena canonica è la
 * figura 1 (220 Ohm, LED verde). Il conflitto motore↔libro sulla soglia di
 * burn (30 mA) NON si giudica qui: bookMatch = fedeltà al libro, il verdetto
 * elettrico resta gate-Andrea D4-2.
 */
export function checkBookConstraintsV1Cap6Esp3(scene: ElabScene): BookConstraintsReport {
  const battery = scene.components.find((component) => component.type === "battery9v")
  const resistor = scene.components.find((component) => component.type === "resistor")
  const led = scene.components.find((component) => component.type === "led")
  const breadboard = scene.components.find((component) => component.type === "breadboard-half")

  const results: BookConstraintResult[] = []
  const BOOK_REF_P33 = "Vol.1 pag.33"

  // F1 — figura p.33: bat+ alla striscia rossa.
  {
    const target = battery ? wireEndpointOpposite(scene, `${battery.id}:positive`) : null
    const parsed = target === null ? null : parseBreadboardRef(target)
    const ok = isPlusRail(parsed)
    results.push({
      id: "battery-positive-to-red-rail",
      ok,
      detail: ok
        ? `bat+ collegato al rail rosso (${target})`
        : `bat+ non arriva a una striscia rossa (endpoint: ${target ?? "assente"})`,
      bookRef: `${BOOK_REF_P33} — figura: filo rosso dalla batteria alla striscia rossa`,
    })
  }

  // F2 — figura p.33: resistore a cavallo rail-rosso/zona fori (come esp1).
  const resistorZonePin = (() => {
    if (!resistor) return null
    const pin1 = parseBreadboardRef(scene.pinAssignments[`${resistor.id}:pin1`] ?? "")
    const pin2 = parseBreadboardRef(scene.pinAssignments[`${resistor.id}:pin2`] ?? "")
    const railCount = [pin1, pin2].filter((pin) => isPlusRail(pin)).length
    const zonePins = [pin1, pin2].filter((pin) => isTerminalHole(pin))
    if (railCount === 1 && zonePins.length === 1) return zonePins[0]!
    return null
  })()
  results.push({
    id: "resistor-bridges-rail-and-zone",
    ok: resistorZonePin !== null,
    detail:
      resistorZonePin !== null
        ? `resistore a cavallo rail/zona (gamba zona: ${resistorZonePin.row}${resistorZonePin.column})`
        : "il resistore non ha esattamente una gamba nella striscia rossa e una nella zona fori",
    bookRef: `${BOOK_REF_P33} — figura: resistore tra la striscia rossa e la zona fori`,
  })

  // F3 — figura p.33: anodo sulla strip del resistore, catodo oltre il canale.
  {
    const anode = led ? parseBreadboardRef(scene.pinAssignments[`${led.id}:anode`] ?? "") : null
    const cathode = led ? parseBreadboardRef(scene.pinAssignments[`${led.id}:cathode`] ?? "") : null
    const anodeTowardResistor =
      resistorZonePin !== null && isTerminalHole(anode) && anode.nodeId === resistorZonePin.nodeId
    const cathodePastChannel =
      isTerminalHole(anode) &&
      isTerminalHole(cathode) &&
      anode.nodeId.includes("-top-") !== cathode.nodeId.includes("-top-")
    const ok = anodeTowardResistor && cathodePastChannel
    results.push({
      id: "led-anode-toward-resistor-cathode-past-channel",
      ok,
      detail: ok
        ? "anodo sulla strip del resistore, catodo oltre il canale centrale"
        : `LED non conforme (anodo verso resistore: ${anodeTowardResistor}, catodo oltre il canale: ${cathodePastChannel})`,
      bookRef: `${BOOK_REF_P33} — figura: LED a cavallo del divisorio, gambetta lunga verso il resistore`,
    })
  }

  // F4 — figura p.33: bat- sulla tie-strip del catodo.
  {
    const cathode = led ? parseBreadboardRef(scene.pinAssignments[`${led.id}:cathode`] ?? "") : null
    const target = battery ? wireEndpointOpposite(scene, `${battery.id}:negative`) : null
    const parsed = target === null ? null : parseBreadboardRef(target)
    const ok =
      isTerminalHole(parsed) && isTerminalHole(cathode) && parsed.nodeId === cathode.nodeId
    results.push({
      id: "battery-negative-same-column-as-cathode",
      ok,
      detail: ok
        ? `bat- nella colonna del catodo (${target})`
        : `bat- non condivide la colonna del catodo (endpoint: ${target ?? "assente"})`,
      bookRef: `${BOOK_REF_P33} — figura: filo nero dalla batteria alla colonna del catodo`,
    })
  }

  // F5 — "Basta cambiare il resistore da 470 Ohm con uno da 220 Ohm" (p.33):
  // BOM = batteria, breadboard, LED, resistore; scena canonica = 220 Ohm.
  {
    const types = scene.components.map((component) => component.type).sort()
    const expected = ["battery9v", "breadboard-half", "led", "resistor"]
    const ok =
      types.length === expected.length &&
      types.every((type, index) => type === expected[index]) &&
      battery !== undefined &&
      breadboard !== undefined &&
      resistor?.value === 220
    results.push({
      id: "bom-canonical-220",
      ok,
      detail: ok
        ? "componenti = batteria 9V, breadboard, LED, resistore 220 Ohm (figura 1)"
        : `BOM diversa dalla figura 1 p.33 (trovati: ${types.join(", ") || "nessuno"}; r=${String(resistor?.value)})`,
      bookRef: `${BOOK_REF_P33} — "Basta cambiare il resistore da 470 Ohm con uno da 220 Ohm"`,
    })
  }

  // F6 — "Prova ora a cambiare il valore del resistore, ma NON scendere mai
  // al di sotto dei 100 Ohm" (p.33): guardia di sicurezza del libro.
  {
    const ok = typeof resistor?.value === "number" && resistor.value >= 100
    results.push({
      id: "resistor-not-below-100-ohm",
      ok,
      detail: ok
        ? `resistore ${String(resistor?.value)} Ohm >= 100 Ohm`
        : `resistore sotto il minimo del libro (${String(resistor?.value)} Ohm < 100 Ohm)`,
      bookRef: `${BOOK_REF_P33} — "NON scendere mai al di sotto dei 100 Ohm"`,
    })
  }

  return { ok: results.every((result) => result.ok), results }
}
