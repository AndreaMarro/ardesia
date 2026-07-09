// Vincoli topologici del TESTO del manuale (Vol.1 cap.6 esp.1, pp.29-31) resi
// eseguibili: `bookMatch` smette di essere una stringa auto-asserita in
// provenance.checks e diventa un verdetto calcolato e falsificabile.
// Il testo lascia liberi i fori esatti ("un punto qualsiasi della striscia
// rossa", "un punto qualsiasi della zona sotto"): qui si verifica SOLO ciò che
// il libro impone, al livello delle net (tie-strip/rail), non dei fori.
import {
  parseBreadboardRef,
  resolveNet,
  type ParsedBreadboardRef,
} from "../breadboard/simulationBreadboard.ts"
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

function isMinusRail(parsed: ParsedBreadboardRef | null): boolean {
  return parsed?.kind === "rail" && (parsed.rail === "bus-top-minus" || parsed.rail === "bus-bot-minus")
}

function isTerminalHole(parsed: ParsedBreadboardRef | null): parsed is ParsedBreadboardRef & { kind: "terminal" } {
  return parsed?.kind === "terminal"
}

function isVerticalBreadboardRotation(rotationDeg: number | undefined): boolean {
  if (rotationDeg === undefined) return false
  const normalized = ((rotationDeg % 360) + 360) % 360
  return normalized === 90 || normalized === 270
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
 * Vincoli del TESTO di Vol.1 cap.9 esp.6 (pp.71-74) — "Lampada RGB con 3
 * potenziometri". Primo esperimento multi-pin: i vincoli lavorano al livello
 * delle NET (resolveNet su pinAssignments+wires), come impone il metodo del
 * canon — il testo prescrive i collegamenti, non i fori esatti. Il verso
 * "resistenza tra il positivo e il piedino del potenziometro" (p.73) è reso
 * onesto al livello di catena: un 470 per canale in serie tra il divider del
 * pot e il pin colore del LED RGB, col positivo che alimenta ogni pot.
 */
export function checkBookConstraintsV1Cap9Esp6(scene: ElabScene): BookConstraintsReport {
  const battery = scene.components.find((component) => component.type === "battery9v")
  const breadboard = scene.components.find((component) => component.type === "breadboard-half")
  const pots = scene.components.filter((component) => component.type === "potentiometer")
  const resistors = scene.components.filter((component) => component.type === "resistor")
  const rgb = scene.components.find((component) => component.type === "rgb-led")

  const results: BookConstraintResult[] = []
  const BOOK_REF_P71 = "Vol.1 pag.71"
  const BOOK_REF_P72 = "Vol.1 pag.72"
  const BOOK_REF_P73 = "Vol.1 pag.73"
  const BOOK_REF_P74 = "Vol.1 pag.74"

  // Le net si calcolano sulla stessa grammatica del solve serie: pin→foro
  // (pinAssignments) + fili (wires) collassano su tie-strip/rail.
  const netScene = {
    components: scene.components.map((component) => ({
      id: component.id,
      type: component.type,
      ...(typeof component.value === "number" ? { value: component.value } : {}),
    })),
    pinAssignments: scene.pinAssignments,
    connections: scene.wires.map((wire) => ({ from: wire.from, to: wire.to })),
  }
  const net = (ref: string): string => resolveNet(ref, netScene)

  // G1 — BOM p.71 (elenco materiali): batteria 9V, breadboard, 3 potenziometri
  // da 10k, 3 resistenze da 470 Ohm, 1 LED RGB.
  {
    const potsOk = pots.length === 3 && pots.every((pot) => pot.value === 10000)
    const resistorsOk = resistors.length === 3 && resistors.every((resistor) => resistor.value === 470)
    const ok =
      battery !== undefined &&
      breadboard !== undefined &&
      rgb !== undefined &&
      potsOk &&
      resistorsOk &&
      scene.components.length === 9
    results.push({
      id: "bom-matches-book",
      ok,
      detail: ok
        ? "componenti = batteria 9V, breadboard, 3 pot 10k, 3 resistori 470 Ohm, LED RGB"
        : `BOM diversa dal libro (pot: ${pots.length}, r470: ${resistors.filter((r) => r.value === 470).length}, rgb: ${rgb ? 1 : 0})`,
      bookRef: `${BOOK_REF_P71} — elenco materiali dell'esperimento 6`,
    })
  }

  // G2 — "Collega il negativo della batteria alla striscia nera della
  // breadboard" (p.72): il filo da bat- termina su una rail minus.
  {
    const target = battery ? wireEndpointOpposite(scene, `${battery.id}:negative`) : null
    const parsed = target === null ? null : parseBreadboardRef(target)
    const ok = isMinusRail(parsed)
    results.push({
      id: "battery-negative-to-black-rail",
      ok,
      detail: ok
        ? `bat- collegato alla striscia nera (${target})`
        : `bat- non arriva a una striscia nera (endpoint: ${target ?? "assente"})`,
      bookRef: `${BOOK_REF_P72} — "Collega il negativo della batteria alla striscia nera della breadboard"`,
    })
  }

  // G3 — "Collega il catodo del LED RGB (la gambetta lunga) al negativo della
  // batteria con un filo" (p.72): net(common) = net(bat-).
  {
    const ok =
      battery !== undefined && rgb !== undefined && net(`${rgb.id}:common`) === net(`${battery.id}:negative`)
    results.push({
      id: "rgb-common-to-battery-negative",
      ok,
      detail: ok
        ? "catodo comune del LED RGB sulla net del negativo batteria"
        : "il catodo comune del LED RGB NON raggiunge il negativo della batteria",
      bookRef: `${BOOK_REF_P72} — "Collega il catodo del LED RGB (la gambetta lunga) al negativo della batteria con un filo"`,
    })
  }

  // G4 — "Inserisci il primo/secondo/terzo potenziometro nella breadboard"
  // (pp.73-74): ogni pot ha i 3 pin su fori di zona, su 3 tie-strip DISTINTE
  // (un pot con due gambe nella stessa strip sarebbe cortocircuitato).
  {
    const bad = pots.find((pot) => {
      const pins = ["vcc", "signal", "gnd"].map((pin) =>
        parseBreadboardRef(scene.pinAssignments[`${pot.id}:${pin}`] ?? ""),
      )
      if (!pins.every((pin) => isTerminalHole(pin))) return true
      const strips = new Set(pins.map((pin) => pin!.nodeId))
      return strips.size !== 3
    })
    const ok = pots.length === 3 && bad === undefined
    results.push({
      id: "pots-on-three-distinct-strips",
      ok,
      detail: ok
        ? "ogni potenziometro ha vcc/signal/gnd su 3 tie-strip distinte"
        : `potenziometro mal inserito: ${bad?.id ?? "conteggio pot diverso da 3"}`,
      bookRef: `${BOOK_REF_P73} — "Inserisci il primo potenziometro nella breadboard" (e il 2°/3°, p.74)`,
    })
  }

  // G5 — "il positivo della batteria" alimenta ogni potenziometro (p.73,
  // "tra il positivo della batteria e il piedino del potenziometro"; p.72
  // figura: striscia rossa): net(vcc di ogni pot) = net(bat+).
  {
    const ok =
      battery !== undefined &&
      pots.length === 3 &&
      pots.every((pot) => net(`${pot.id}:vcc`) === net(`${battery.id}:positive`))
    results.push({
      id: "pots-vcc-on-battery-positive",
      ok,
      detail: ok
        ? "il positivo della batteria alimenta i 3 potenziometri"
        : "almeno un potenziometro non raggiunge il positivo della batteria",
      bookRef: `${BOOK_REF_P73} — "Inserisci una resistenza da 470 Ohm tra il positivo della batteria e il piedino del potenziometro"`,
    })
  }

  // G6 — un 470 Ohm per canale, in serie tra il pot e il pin colore (p.73-74
  // + p.71 "Collega il pin 2 del terzo potenziometro al LED blu..."): per ogni
  // canale {red,green,blue} esiste ESATTAMENTE un resistore con una gamba
  // sulla net del canale e l'altra sulla net del signal di UN pot; la mappa
  // pot↔resistore↔canale è una biiezione.
  {
    const usedResistors = new Set<string>()
    const usedPots = new Set<string>()
    const channels = ["red", "green", "blue"] as const
    let chainsOk = rgb !== undefined && resistors.length === 3 && pots.length === 3
    if (chainsOk) {
      for (const channel of channels) {
        const channelNet = net(`${rgb!.id}:${channel}`)
        const resistor = resistors.find(
          (candidate) =>
            !usedResistors.has(candidate.id) &&
            (net(`${candidate.id}:pin1`) === channelNet || net(`${candidate.id}:pin2`) === channelNet),
        )
        if (resistor === undefined) {
          chainsOk = false
          break
        }
        const otherPinNet =
          net(`${resistor.id}:pin1`) === channelNet ? net(`${resistor.id}:pin2`) : net(`${resistor.id}:pin1`)
        const pot = pots.find(
          (candidate) => !usedPots.has(candidate.id) && net(`${candidate.id}:signal`) === otherPinNet,
        )
        if (pot === undefined) {
          chainsOk = false
          break
        }
        usedResistors.add(resistor.id)
        usedPots.add(pot.id)
      }
    }
    results.push({
      id: "one-470-per-pot-channel",
      ok: chainsOk,
      detail: chainsOk
        ? "3 catene indipendenti pot → 470 Ohm → canale RGB (biiezione completa)"
        : "catena pot→470→canale mancante o duplicata per almeno un colore",
      bookRef: `${BOOK_REF_P74} — "Inserisci il 3° potenzometro con la sua resistenza da 470r" + collegamenti canale (pin 2 → LED rosso/verde/blu)`,
    })
  }

  // G7 — la figura finale p.74 mostra la breadboard in verticale. Questo non
  // e' un vincolo elettrico: e' un gate di book-fidelity per impedire che la
  // scena resti su fallback orizzontale quando viene venduta come fedele al
  // libro. Il renderer attuale non consuma ancora la rotazione: visualMatch
  // resta unknown finche' il passaggio visuale non viene estratto.
  {
    const boardRotation = scene.board.pose.rotationDeg
    const breadboardRotation = breadboard?.pose?.rotationDeg
    const ok =
      scene.board.orientation === "manual-figure-vertical" &&
      isVerticalBreadboardRotation(boardRotation) &&
      isVerticalBreadboardRotation(breadboardRotation)
    results.push({
      id: "manual-breadboard-vertical",
      ok,
      detail: ok
        ? `breadboard verticale dichiarata (board ${boardRotation}°, bb1 ${breadboardRotation}°)`
        : `breadboard non verticale (orientation=${scene.board.orientation}, board=${boardRotation}°, bb1=${breadboardRotation ?? "missing"}°)`,
      bookRef: `${BOOK_REF_P74} — figura finale: breadboard ruotata verticalmente nella pagina del manuale`,
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
