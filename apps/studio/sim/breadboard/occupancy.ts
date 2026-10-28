// P0-A validator falsificabile — occupazione fisica dei fori (modalità
// "montaggi liberi"). Regola del kit reale: UN foro ospita UN solo terminale
// (gamba di componente o capo di cavo). Stessa TIE su fori diversi =
// collegamento legittimo; stesso FORO ESATTO = montaggio fisicamente
// impossibile → conflitto.
//
// È un REPORT diagnostico completo (tutti i conflitti, ordinati), non un
// throw-first: l'autorità fail-closed sul percorso di solve resta
// adapter di scena. Qui si serve chi sta montando liberamente e deve vedere
// TUTTO ciò che non sta in piedi, non solo il primo errore.

import { isBreadboardHole, isBreadboardRail } from "./geometry.ts"
import type { BreadboardCircuit } from "./geometry.ts"

export type OccupantKind = "pin" | "wire"

export type BreadboardOccupant = {
  kind: OccupantKind
  /** pin: chiave di pinAssignments (es. "r1:pin1"); wire: "wire[<i>].from" | "wire[<i>].to". */
  at: string
}

export type OccupancyConflict = {
  /** Ref breadboard ESATTO conteso (foro "bb1:c5" o rail indicizzata "bb1:bus-top-plus-3"). */
  ref: string
  /** Tutti gli occupanti del ref, ordinati (pin prima dei wire, poi per `at`). */
  occupants: BreadboardOccupant[]
}

export type OccupancyReport = {
  ok: boolean
  /** Conflitti ordinati per ref: report deterministico, adatto a snapshot/UI. */
  conflicts: OccupancyConflict[]
}

function isExactBreadboardRef(ref: string): boolean {
  return isBreadboardHole(ref) || isBreadboardRail(ref)
}

/**
 * Analizza l'occupazione dei fori: ogni ref breadboard esatto usato da più di
 * un terminale è un conflitto. Ref non-breadboard (pin di componente, es.
 * "bat1:positive") non occupano fori e sono ignorati.
 */
export function analyzeBreadboardOccupancy(circuit: BreadboardCircuit): OccupancyReport {
  const occupantsByRef = new Map<string, BreadboardOccupant[]>()

  const occupy = (ref: string, occupant: BreadboardOccupant): void => {
    if (!isExactBreadboardRef(ref)) return
    const existing = occupantsByRef.get(ref)
    if (existing === undefined) {
      occupantsByRef.set(ref, [occupant])
    } else {
      existing.push(occupant)
    }
  }

  for (const [pin, ref] of Object.entries(circuit.pinAssignments)) {
    occupy(ref, { kind: "pin", at: pin })
  }
  circuit.wires.forEach((wire, index) => {
    occupy(wire.from, { kind: "wire", at: `wire[${index}].from` })
    occupy(wire.to, { kind: "wire", at: `wire[${index}].to` })
  })

  const conflicts: OccupancyConflict[] = []
  for (const [ref, occupants] of occupantsByRef) {
    if (occupants.length < 2) continue
    const sorted = [...occupants].sort(
      (a, b) => a.kind.localeCompare(b.kind) || a.at.localeCompare(b.at),
    )
    conflicts.push({ ref, occupants: sorted })
  }
  conflicts.sort((a, b) => a.ref.localeCompare(b.ref))

  return { ok: conflicts.length === 0, conflicts }
}
