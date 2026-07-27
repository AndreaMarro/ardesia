// P0-E — capability `service.simulation`: un consumer di workflow USA il
// Simulation Plugin attraverso l'host, senza importarne il codice. ELABTutor
// resta un Pack di dati/metodo, non un eseguibile parallelo.
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
import { validateRoomId } from "../../store/roomPaths.ts"
import {
  SimulationApplyOperationResultSchema,
  SimulationDescribeResultSchema,
} from "../../toolhost-protocol/index.ts"
import type {
  SimulationApplyOperationParams,
  SimulationApplyOperationResult,
  SimulationReceipt,
  SimulationScene,
} from "../../toolhost-protocol/index.ts"

/** Contratto del servizio dopo la validazione: literal pinnati, mai castati. */
export type SimulationContract = z.infer<typeof SimulationDescribeResultSchema>

type SimulationRuntimeApplyResultLike = {
  state: unknown
  accepted: boolean
  result: unknown
  diagnostics: unknown
}

export type SimulationInitialStateEnvelope = {
  roomId: string
  instanceId: string
  sceneDigest: string
  state: unknown
}

/**
 * Superficie del Simulation Plugin che l'host consuma. La soddisfano le funzioni
 * pure di `simulation-runtime/1`; il composition root le lega, questo modulo no.
 * `state` resta opaco di proposito: il broker lo trasporta, non lo interpreta.
 */
export interface SimulationRuntimeApiLike {
  describe(): { pluginId: string; apiVersion: string; stateSchema: string }
  sceneDigest(scene: SimulationScene): string
  loadScene(input: { instanceId: string; scene: SimulationScene; diagnostics?: string[] }): unknown
  applyOperation?(
    state: unknown,
    operation: SimulationApplyOperationParams["operation"],
  ): SimulationRuntimeApplyResultLike
  solve(state: unknown, request: { provider: string; mode: string }): { state: unknown; result: unknown }
  readDiagnostics(state: unknown): unknown
  serializeState(state: unknown): unknown
  /** Restore host-owned, mai raggiungibile dal wire del plugin. */
  restoreState?(serialized: unknown): unknown
}

export class ToolSimulation {
  private _api: SimulationRuntimeApiLike
  private _instanceId: string
  private _roomId: string | null
  private _state: unknown = null
  private _digest: string | null = null

  constructor(
    api: SimulationRuntimeApiLike,
    instanceId: string,
    options: {
      roomId?: string
      initialState?: SimulationInitialStateEnvelope
    } = {},
  ) {
    assertInstanceId(instanceId)
    if (options.roomId !== undefined) validateRoomId(options.roomId)
    this._api = api
    this._instanceId = instanceId
    this._roomId = options.roomId ?? null

    if (options.initialState !== undefined) {
      this._restoreInitialState(options.initialState)
    }
  }

  describe(): SimulationContract {
    return this._contract()
  }

  loadScene(params: { scene: SimulationScene; diagnostics?: string[] }): { receipt: SimulationReceipt } {
    this._requireRoomId()
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
    this._assertStateInstance(state)
    const digest = this._api.sceneDigest(this._sceneFromState(state))
    this._state = state
    this._digest = digest
    return { receipt: this._receipt(contract, digest) }
  }

  applyOperation(params: SimulationApplyOperationParams): SimulationApplyOperationResult {
    const contract = this._contract()
    const roomId = this._requireRoomId()
    const currentDigest = this._requireDigest()
    if (params.expectedSceneDigest !== currentDigest) {
      throw new Error(
        `scene digest precondition failed: expected "${params.expectedSceneDigest}", current "${currentDigest}"`,
      )
    }

    // L'API runtime è iniettata e quindi non è implicitamente fidata. Le viene
    // consegnato uno snapshot isolato: anche una implementazione che mutasse il
    // proprio argomento non può alterare lo stato committato prima dei check.
    const stateSnapshot = structuredClone(this._requireState())
    const serialized = this._checkedState(
      this._api.serializeState(stateSnapshot),
    )
    const isolatedState = structuredClone(serialized)
    const apply = this._api.applyOperation
    if (apply === undefined) {
      throw new Error("simulation service does not support operation application")
    }
    const applied = apply.call(this._api, isolatedState, params.operation)
    if (typeof applied.accepted !== "boolean") {
      throw new Error("simulation service returned an invalid operation acceptance")
    }
    if (!applied.accepted) {
      throw new Error(`simulation operation "${params.operation.id}" rejected`)
    }

    const state = this._checkedState(applied.state)
    this._assertStateInstance(state)
    const digest = this._api.sceneDigest(this._sceneFromState(state))
    if (digest === currentDigest) {
      throw new Error(
        `simulation operation "${params.operation.id}" did not change the scene digest`,
      )
    }
    const result = SimulationApplyOperationResultSchema.parse({
      receipt: this._receipt(contract, digest),
      roomId,
      operationId: params.operation.id,
      accepted: true,
      solveOutcome: applied.result,
      diagnostics: applied.diagnostics,
    })

    // Unico commit point: ogni validazione, solve, digest e result check è
    // terminato. Qualunque throw precedente lascia stato e digest byte-invariati.
    this._state = state
    this._digest = digest
    return result
  }

  solve(params: { provider: string; mode: string }): { receipt: SimulationReceipt; result: unknown } {
    this._requireRoomId()
    const contract = this._contract()
    const solved = this._api.solve(this._requireState(), params)
    const state = this._checkedState(solved.state)
    this._assertStateInstance(state)
    this._state = state
    return { receipt: this._receipt(contract, this._requireDigest()), result: solved.result }
  }

  readDiagnostics(): { receipt: SimulationReceipt; diagnostics: unknown } {
    this._requireRoomId()
    const contract = this._contract()
    const diagnostics = this._api.readDiagnostics(this._requireState())
    return { receipt: this._receipt(contract, this._requireDigest()), diagnostics }
  }

  serializeState(): { receipt: SimulationReceipt; state: unknown } {
    this._requireRoomId()
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

  private _requireRoomId(): string {
    if (this._roomId === null) {
      throw new Error(`simulation mutation requires a host-owned roomId for instance "${this._instanceId}"`)
    }
    return this._roomId
  }

  private _restoreInitialState(initial: SimulationInitialStateEnvelope): void {
    const roomId = this._requireRoomId()
    if (initial.roomId !== roomId || initial.instanceId !== this._instanceId) {
      throw new Error(
        `simulation restore scope mismatch for room "${roomId}" and instance "${this._instanceId}"`,
      )
    }
    const restore = this._api.restoreState
    if (restore === undefined) {
      throw new Error("simulation service does not support host-owned state restore")
    }
    this._contract()
    const state = this._checkedState(
      restore.call(this._api, structuredClone(initial.state)),
    )
    this._assertStateInstance(state)
    const digest = this._api.sceneDigest(this._sceneFromState(state))
    if (
      typeof initial.sceneDigest !== "string" ||
      initial.sceneDigest.length === 0 ||
      initial.sceneDigest !== digest
    ) {
      throw new Error(
        `simulation restore digest mismatch for room "${roomId}" and instance "${this._instanceId}"`,
      )
    }
    // Il contract check sopra impedisce di idratare uno stato con un provider
    // fuori versione; stato e digest entrano insieme come per load/apply.
    this._state = state
    this._digest = digest
  }

  private _assertStateInstance(state: unknown): void {
    if (!isRecord(state) || state.instanceId !== this._instanceId) {
      throw new Error(
        `simulation service returned state outside instance "${this._instanceId}"`,
      )
    }
  }

  private _sceneFromState(state: unknown): SimulationScene {
    if (!isRecord(state) || !isRecord(state.scene)) {
      throw new Error(`simulation state has no scene for instance "${this._instanceId}"`)
    }
    const scene = state.scene
    if (!Array.isArray(scene.components) || !Array.isArray(scene.connections)) {
      throw new Error(`simulation state scene is malformed for instance "${this._instanceId}"`)
    }
    for (const component of scene.components) {
      if (
        !isRecord(component) ||
        typeof component.id !== "string" ||
        typeof component.type !== "string"
      ) {
        throw new Error(`simulation state contains a malformed component`)
      }
    }
    for (const connection of scene.connections) {
      if (
        !isRecord(connection) ||
        typeof connection.from !== "string" ||
        typeof connection.to !== "string"
      ) {
        throw new Error(`simulation state contains a malformed connection`)
      }
    }
    if (
      scene.pinAssignments !== undefined &&
      (!isRecord(scene.pinAssignments) ||
        Object.values(scene.pinAssignments).some((value) => typeof value !== "string"))
    ) {
      throw new Error(`simulation state contains malformed pin assignments`)
    }
    return scene as SimulationScene
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
