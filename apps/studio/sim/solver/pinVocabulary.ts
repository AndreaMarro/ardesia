// P0-A validator falsificabile — coerenza scena ↔ catalogo elettrico.
// elabSceneAdapter verifica che il componente di un ref sia DICHIARATO, ma non
// che il pin esista nel vocabolario del suo tipo: "bat1:posittive" (typo)
// arriva fino al solve. Questo report lo intercetta prima, con diagnosi
// completa (tutti i flag, non throw-first) per la modalità montaggi liberi.
//
// Fonte del vocabolario: il component-registry elettrico vendored (catalog.ts
// deve essere registrato dal chiamante — registerElectricalCatalog è
// idempotente). Tipi non registrati = deny-by-default sul solve, quindi
// flaggati come type-unregistered, una volta per sede d'uso, senza
// pin-unknown a cascata.

import { getComponent } from "./components/registry.js"

export type PinVocabularySceneSlice = {
  components: ReadonlyArray<{ id: string; type: string }>
  wires: ReadonlyArray<{ from: string; to: string }>
  pinAssignments: Record<string, string>
}

export type PinVocabularyFlag =
  | { kind: "component-unknown"; componentId: string; at: string }
  | { kind: "type-unregistered"; componentId: string; type: string; at: string }
  | { kind: "pin-unknown"; componentId: string; type: string; pin: string; at: string }

export type PinVocabularyReport = {
  ok: boolean
  /** Flag ordinati per sede (`at`): report deterministico, adatto a snapshot/UI. */
  flags: PinVocabularyFlag[]
}

type PinResolver = (type: string) => ReadonlySet<string> | null

function registryPinResolver(): PinResolver {
  const cache = new Map<string, ReadonlySet<string> | null>()
  return (type: string) => {
    if (cache.has(type)) return cache.get(type) ?? null
    const entry = getComponent(type)
    const pins = entry?.pins === undefined ? null : new Set(entry.pins.map((pin) => pin.id))
    cache.set(type, pins)
    return pins
  }
}

/**
 * Verifica che ogni ref `componente:pin` della scena usi un pin ESISTENTE nel
 * vocabolario del tipo secondo il catalogo elettrico. Controlla ENTRAMBI i
 * lati di pinAssignments (la chiave è un pin di componente, il valore un foro
 * della breadboard — che nel catalogo è a sua volta un pin) e i capi dei wire.
 * Ref senza ":" non sono ref pin e vengono ignorati.
 */
export function analyzePinVocabulary(
  scene: PinVocabularySceneSlice,
  resolvePins: PinResolver = registryPinResolver(),
): PinVocabularyReport {
  const typeById = new Map(scene.components.map((component) => [component.id, component.type]))
  const flags: PinVocabularyFlag[] = []

  const checkRef = (ref: string, at: string): void => {
    const separator = ref.indexOf(":")
    if (separator === -1) return
    const componentId = ref.slice(0, separator)
    const pin = ref.slice(separator + 1)

    const type = typeById.get(componentId)
    if (type === undefined) {
      flags.push({ kind: "component-unknown", componentId, at })
      return
    }
    const pins = resolvePins(type)
    if (pins === null) {
      flags.push({ kind: "type-unregistered", componentId, type, at })
      return
    }
    if (!pins.has(pin)) {
      flags.push({ kind: "pin-unknown", componentId, type, pin, at })
    }
  }

  for (const [pin, ref] of Object.entries(scene.pinAssignments)) {
    const at = `pinAssignments ${pin}`
    checkRef(pin, at)
    checkRef(ref, at)
  }
  scene.wires.forEach((wire, index) => {
    checkRef(wire.from, `wire[${index}].from`)
    checkRef(wire.to, `wire[${index}].to`)
  })

  flags.sort((a, b) => a.at.localeCompare(b.at) || a.kind.localeCompare(b.kind))
  return { ok: flags.length === 0, flags }
}
