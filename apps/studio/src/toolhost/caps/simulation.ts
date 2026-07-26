// P0-E — capability `service.simulation`: un modulo (ELABTutor Pack eseguibile)
// USA il Simulation Plugin attraverso l'host, senza importarne il codice.
//
// Questo file NON importa nulla da `sim/`: il servizio arriva iniettato come
// interfaccia strutturale. È la ragione per cui la famiglia `service.*` può
// crescere — il Core non impara mai cos'è un circuito, e Layer 0 resta generico.
// Speculare a ToolGraph (che consuma { readAll() }) e a ToolBoard/ToolStorage:
// l'identità di ISTANZA la possiede l'host, non arriva mai dal wire.
//
// Fail-closed: nessuna scena implicita. Chiamare solve/read/serialize prima di
// loadScene è un errore esplicito, mai una scena vuota che "sembra funzionare".

import type { z } from "zod"

import { assertInstanceId } from "./instance.ts"
import { SimulationDescribeResultSchema } from "../../toolhost-protocol/index.ts"
import type { SimulationReceipt, SimulationScene } from "../../toolhost-protocol/index.ts"

/** Contratto del servizio dopo la validazione: literal pinnati, mai castati. */
export type SimulationContract = z.infer<typeof SimulationDescribeResultSchema>

/**
 * Superficie del Simulation Plugin che l'host consuma. La soddisfano le funzioni
 * pure di `simulation-runtime/1`; il composition root le lega, questo modulo no.
 * `state` resta opaco di proposito: il broker lo trasporta, non lo interpreta.
 */
export interface SimulationRuntimeApiLike {
  describe(): { pluginId: string; apiVersion: string; stateSchema: string }
  sceneDigest(scene: SimulationScene): string
  loadScene(input: { instanceId: string; scene: SimulationScene; diagnostics?: string[] }): unknown
  solve(state: unknown, request: { provider: string; mode: string }): { state: unknown; result: unknown }
  readDiagnostics(state: unknown): unknown
  serializeState(state: unknown): unknown
}

export class ToolSimulation {
  private _api: SimulationRuntimeApiLike
  private _instanceId: string
  private _state: unknown = null
  private _digest: string | null = null

  constructor(api: SimulationRuntimeApiLike, instanceId: string) {
    assertInstanceId(instanceId)
    this._api = api
    this._instanceId = instanceId
  }

  describe(): SimulationContract {
    return this._contract()
  }

  loadScene(params: { scene: SimulationScene; diagnostics?: string[] }): { receipt: SimulationReceipt } {
    // Contratto prima di tutto: un servizio fuori contratto non deve poter
    // scrivere nulla nell'istanza. Validato UNA volta e riusato: richiamare
    // describe() a fine operazione lascerebbe una finestra in cui il servizio
    // risponde dentro contratto al primo giro e fuori al secondo.
    const contract = this._contract()
    // Stato e digest si aggiornano INSIEME o per niente: uno stato nuovo con un
    // digest vecchio produrrebbe una ricevuta che mente sulla topologia, ed è
    // esattamente ciò che la ricevuta esiste per impedire.
    const state = this._checkedState(this._api.loadScene({
      instanceId: this._instanceId,
      scene: params.scene,
      ...(params.diagnostics === undefined ? {} : { diagnostics: params.diagnostics }),
    }))
    const digest = this._api.sceneDigest(params.scene)
    this._state = state
    this._digest = digest
    return { receipt: this._receipt(contract, digest) }
  }

  solve(params: { provider: string; mode: string }): { receipt: SimulationReceipt; result: unknown } {
    const contract = this._contract()
    const solved = this._api.solve(this._requireState(), params)
    this._state = this._checkedState(solved.state)
    return { receipt: this._receipt(contract, this._requireDigest()), result: solved.result }
  }

  readDiagnostics(): { receipt: SimulationReceipt; diagnostics: unknown } {
    const contract = this._contract()
    const diagnostics = this._api.readDiagnostics(this._requireState())
    return { receipt: this._receipt(contract, this._requireDigest()), diagnostics }
  }

  serializeState(): { receipt: SimulationReceipt; state: unknown } {
    const contract = this._contract()
    const state = this._api.serializeState(this._requireState())
    return { receipt: this._receipt(contract, this._requireDigest()), state }
  }

  /**
   * Uno stato assente non è uno stato: committerlo produrrebbe una ricevuta di
   * successo per un'istanza che al passo dopo dichiara "nessuna scena caricata".
   */
  private _checkedState(state: unknown): unknown {
    if (state === null || state === undefined) {
      throw new Error(`simulation service returned no state for instance "${this._instanceId}"`)
    }
    return state
  }

  private _requireState(): unknown {
    if (this._state === null) {
      throw new Error(`no scene loaded for instance "${this._instanceId}"`)
    }
    return this._state
  }

  private _requireDigest(): string {
    if (this._digest === null) {
      throw new Error(`no scene loaded for instance "${this._instanceId}"`)
    }
    return this._digest
  }

  /**
   * Il wire NON valida i `result` degli handler: `routeRequest` inoltra il
   * payload così com'è. Se il receipt copiasse `apiVersion`/`pluginId` con un
   * cast, un servizio iniettato malformato o compromesso potrebbe far uscire
   * una ricevuta fuori dal contratto che la capability ha pinnato a manifest —
   * cioè un badge che non deriva da una prova. Qui si valida, non si casta.
   */
  private _contract(): SimulationContract {
    return SimulationDescribeResultSchema.parse(this._api.describe())
  }

  private _receipt(contract: SimulationContract, sceneDigest: string): SimulationReceipt {
    return {
      apiVersion: contract.apiVersion,
      pluginId: contract.pluginId,
      instanceId: this._instanceId,
      sceneDigest,
    }
  }
}
