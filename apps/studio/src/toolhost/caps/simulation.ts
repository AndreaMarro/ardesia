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
    return this._api.describe()
  }

  loadScene(params: { scene: SimulationScene; diagnostics?: string[] }): { receipt: SimulationReceipt } {
    this._state = this._api.loadScene({
      instanceId: this._instanceId,
      scene: params.scene,
      ...(params.diagnostics === undefined ? {} : { diagnostics: params.diagnostics }),
    })
    this._digest = this._api.sceneDigest(params.scene)
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

  private _receipt(): SimulationReceipt {
    const api = this._api.describe()
    if (this._digest === null) throw new Error(`no scene loaded for instance "${this._instanceId}"`)
    return {
      apiVersion: api.apiVersion as SimulationReceipt["apiVersion"],
      pluginId: api.pluginId as SimulationReceipt["pluginId"],
      instanceId: this._instanceId,
      sceneDigest: this._digest,
    }
  }
}
