// P0-A aggregatore "montaggi liberi" — UN report per la vista.
//
// occupancy (breadboard/occupancy.ts) e pinVocabulary (solver/pinVocabulary.ts)
// restano i validator falsificabili sorgente, ciascuno con il proprio report
// completo. Qui si compongono in un unico FreeAssemblyReport deterministico:
// findings ordinati (prima l'impossibilità fisica dei fori, poi la coerenza
// col catalogo), ognuno con messaggio tecnico-neutro + dato strutturato.
// La FORMULAZIONE didattica ("Ragazzi, …") appartiene al plugin ELABTutor,
// non a questo modulo (confine ADR: qui strumento tecnico riusabile).
//
// Auto-sufficiente: registra il catalogo elettrico da sé (idempotente), così
// la vista non deve conoscere l'ordine di inizializzazione dei validator.

import { analyzeBreadboardOccupancy } from "./breadboard/occupancy.ts"
import type { BreadboardOccupant, OccupancyReport } from "./breadboard/occupancy.ts"
import { registerElectricalCatalog } from "./solver/catalog.ts"
import { analyzePinVocabulary } from "./solver/pinVocabulary.ts"
import type {
  PinVocabularyFlag,
  PinVocabularyReport,
  PinVocabularySceneSlice,
} from "./solver/pinVocabulary.ts"

/** Slice di scena sufficiente per ENTRAMBI i validator aggregati. */
export type FreeAssemblyScene = PinVocabularySceneSlice

export type FreeAssemblyFinding =
  | {
      source: "occupancy"
      /** Ref breadboard esatto conteso (es. "bb1:c5"). */
      ref: string
      occupants: readonly BreadboardOccupant[]
      message: string
    }
  | {
      source: "pin-vocabulary"
      flag: PinVocabularyFlag
      message: string
    }

export type FreeAssemblyReport = {
  ok: boolean
  occupancy: OccupancyReport
  pinVocabulary: PinVocabularyReport
  /**
   * Findings ordinati e deterministici: prima i conflitti di occupazione
   * (ordinati per ref dal validator), poi i flag di vocabolario (ordinati
   * per sede). Adatti a snapshot e rendering diretto.
   */
  findings: FreeAssemblyFinding[]
}

function occupancyMessage(ref: string, occupants: readonly BreadboardOccupant[]): string {
  const terminals = occupants.map((occupant) => occupant.at).join(", ")
  return `Foro ${ref} conteso da ${occupants.length} terminali (${terminals}): un foro ospita un solo terminale.`
}

function pinFlagMessage(flag: PinVocabularyFlag): string {
  switch (flag.kind) {
    case "component-unknown":
      return `${flag.at}: componente "${flag.componentId}" non dichiarato nella scena.`
    case "type-unregistered":
      return `${flag.at}: tipo "${flag.type}" di "${flag.componentId}" non registrato nel catalogo elettrico (deny-by-default sul solve).`
    case "pin-unknown":
      return `${flag.at}: pin "${flag.pin}" inesistente nel vocabolario di "${flag.componentId}" (tipo "${flag.type}").`
  }
}

/**
 * Analizza una scena in modalità montaggi liberi: occupazione fisica dei
 * fori + coerenza pin ↔ catalogo elettrico, in un unico report per la vista.
 */
export function analyzeFreeAssembly(scene: FreeAssemblyScene): FreeAssemblyReport {
  registerElectricalCatalog()

  const occupancy = analyzeBreadboardOccupancy(scene)
  const pinVocabulary = analyzePinVocabulary(scene)

  const findings: FreeAssemblyFinding[] = [
    ...occupancy.conflicts.map((conflict) => ({
      source: "occupancy" as const,
      ref: conflict.ref,
      occupants: conflict.occupants,
      message: occupancyMessage(conflict.ref, conflict.occupants),
    })),
    ...pinVocabulary.flags.map((flag) => ({
      source: "pin-vocabulary" as const,
      flag,
      message: pinFlagMessage(flag),
    })),
  ]

  return {
    ok: occupancy.ok && pinVocabulary.ok,
    occupancy,
    pinVocabulary,
    findings,
  }
}
