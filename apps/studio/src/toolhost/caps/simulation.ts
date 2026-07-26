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

import { assertInstanceId } from "./instance.ts"
import { SimulationDescribeResultSchema } from "../../toolhost-protocol/index.ts"
import type { SimulationReceipt, SimulationScene } from "../../toolhost-protocol/index.ts"

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

  describe(): { pluginId: string; apiVersion: string; stateSchema: string } {
    return this._contract()
  }

  loadScene(params: { scene: SimulationScene; diagnostics?: string[] }): { receipt: SimulationReceipt } {
    // Contratto prima di tutto: un servizio fuori contratto non deve poter
    // scrivere nulla nell'istanza.
    this._contract()
    // Stato e digest si aggiornano INSIEME o per niente: uno stato nuovo con un
    // digest vecchio produrrebbe una ricevuta che mente sulla topologia, ed è
    // esattamente ciò che la ricevuta esiste per impedire.
    const state = this._api.loadScene({
      instanceId: this._instanceId,
      scene: params.scene,
      ...(params.diagnostics === undefined ? {} : { diagnostics: params.diagnostics }),
    })
    const digest = this._api.sceneDigest(params.scene)
    this._state = state
    this._digest = digest
    return { receipt: this._receipt() }
  }

  solve(params: { provider: string; mode: string }): { receipt: SimulationReceipt; result: unknown } {
    const state = this._requireState()
    const solved = this._api.solve(state, params)
    this._state = solved.state
    return { receipt: this._receipt(), result: solved.result }
  }

  readDiagnostics(): { receipt: SimulationReceipt; diagnostics: unknown } {
    return { receipt: this._receipt(), diagnostics: this._api.readDiagnostics(this._requireState()) }
  }

  serializeState(): { receipt: SimulationReceipt; state: unknown } {
    return { receipt: this._receipt(), state: this._api.serializeState(this._requireState()) }
  }

  private _requireState(): unknown {
    if (this._state === null) {
      throw new Error(`no scene loaded for instance "${this._instanceId}"`)
    }
    return this._state
  }

  /**
   * Il wire NON valida i `result` degli handler: `routeRequest` inoltra il
   * payload così com'è. Se il receipt copiasse `apiVersion`/`pluginId` con un
   * cast, un servizio iniettato malformato o compromesso potrebbe far uscire
   * una ricevuta fuori dal contratto che la capability ha pinnato a manifest —
   * cioè un badge che non deriva da una prova. Qui si valida, non si casta.
   */
  private _contract(): { pluginId: string; apiVersion: string; stateSchema: string } {
    return SimulationDescribeResultSchema.parse(this._api.describe())
  }

  private _receipt(): SimulationReceipt {
    const api = SimulationDescribeResultSchema.parse(this._api.describe())
    if (this._digest === null) throw new Error(`no scene loaded for instance "${this._instanceId}"`)
    return {
      apiVersion: api.apiVersion,
      pluginId: api.pluginId,
      instanceId: this._instanceId,
      sceneDigest: this._digest,
    }
  }
}
