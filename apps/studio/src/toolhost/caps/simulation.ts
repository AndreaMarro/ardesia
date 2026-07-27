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
  SimulationLoadSceneParamsSchema,
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
    const state = this._isolatedState(this._api.loadScene({
      instanceId: this._instanceId,
      scene: params.scene,
      ...(params.diagnostics === undefined ? {} : { diagnostics: params.diagnostics }),
    }))
    this._assertStateInstance(state)
    const digest = this._digestForState(state)
    this._state = state
    this._digest = digest
    return { receipt: this._receipt(contract, digest) }
  }

  applyOperation(params: SimulationApplyOperationParams): SimulationApplyOperationResult {
    const roomId = this._requireRoomId()
    const contract = this._contract()
    const currentDigest = this._requireDigest()
    const apply = this._api.applyOperation
    if (apply === undefined) {
      throw new Error("simulation service does not support operation application")
    }
    if (params.expectedSceneDigest !== currentDigest) {
      throw new Error(
        `scene digest precondition failed: expected "${params.expectedSceneDigest}", current "${currentDigest}"`,
      )
    }

    // L'API runtime è iniettata e quindi non è implicitamente fidata. Le viene
    // consegnato uno snapshot isolato: anche una implementazione che mutasse il
    // proprio argomento non può alterare lo stato committato prima dei check.
    const stateSnapshot = structuredClone(this._requireState())
    const previousScene = this._sceneFromState(stateSnapshot)
    const applied: unknown = apply.call(
      this._api,
      stateSnapshot,
      structuredClone(params.operation),
    )
    if (!isRecord(applied) || typeof applied.accepted !== "boolean") {
      throw new Error("simulation service returned an invalid operation result")
    }
    if (!applied.accepted) {
      throw new Error(`simulation operation "${params.operation.id}" rejected`)
    }

    const state = this._isolatedState(applied.state)
    this._assertStateInstance(state)
    const digest = this._digestForState(state)
    if (digest === currentDigest) {
      throw new Error(
        `simulation operation "${params.operation.id}" did not change the scene digest`,
      )
    }
    this._assertAppliedOperation(previousScene, state, params.operation)
    const result = SimulationApplyOperationResultSchema.parse({
      receipt: this._receipt(contract, digest),
      roomId,
      operationId: params.operation.id,
      accepted: true,
      solveOutcome: this._isolatedPayload(applied.result),
      diagnostics: this._isolatedPayload(applied.diagnostics),
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
    const currentDigest = this._requireDigest()
    // Il provider è iniettato e può essere difettoso o malevolo: riceve una
    // copia, così una mutazione prima di un throw non può corrompere lo stato
    // committato. Solve può aggiornare diagnostica/output, non la topologia.
    const solved: unknown = this._api.solve(
      structuredClone(this._requireState()),
      params,
    )
    if (!isRecord(solved) || !("state" in solved) || !("result" in solved)) {
      throw new Error("simulation service returned an invalid solve result")
    }
    const state = this._isolatedState(solved.state)
    this._assertStateInstance(state)
    const digest = this._digestForState(state)
    if (digest !== currentDigest) {
      throw new Error("simulation solve altered the scene digest")
    }
    const result = this._isolatedPayload(solved.result)
    this._state = state
    return {
      receipt: this._receipt(contract, digest),
      result,
    }
  }

  readDiagnostics(): { receipt: SimulationReceipt; diagnostics: unknown } {
    this._requireRoomId()
    const contract = this._contract()
    const diagnostics = this._api.readDiagnostics(
      structuredClone(this._requireState()),
    )
    return {
      receipt: this._receipt(contract, this._requireDigest()),
      diagnostics: this._isolatedPayload(diagnostics),
    }
  }

  serializeState(): { receipt: SimulationReceipt; state: unknown } {
    this._requireRoomId()
    const contract = this._contract()
    const currentDigest = this._requireDigest()
    const state = this._isolatedState(
      this._api.serializeState(structuredClone(this._requireState())),
    )
    this._assertStateInstance(state)
    const digest = this._digestForState(state)
    if (digest !== currentDigest) {
      throw new Error("simulation serializer altered the scene digest")
    }
    return { receipt: this._receipt(contract, digest), state }
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

  /**
   * Ogni oggetto restituito dal runtime resta di proprietà del runtime finché
   * non viene clonato. L'host committa o espone solo snapshot propri: il
   * provider non può trattenere un riferimento e mutarlo dopo il receipt.
   */
  private _isolatedState(state: unknown): unknown {
    return structuredClone(this._checkedState(state))
  }

  private _isolatedPayload(payload: unknown): unknown {
    return structuredClone(payload)
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
      throw new Error(`simulation state access requires a host-owned roomId for instance "${this._instanceId}"`)
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
    const state = this._isolatedState(
      restore.call(this._api, structuredClone(initial.state)),
    )
    this._assertStateInstance(state)
    const digest = this._digestForState(state)
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
    const malformed = (): never => {
      throw new Error(
        `simulation state scene is malformed for instance "${this._instanceId}"`,
      )
    }
    const components = scene.components.map((value) => {
      if (!isRecord(value)) return malformed()
      return {
        id: value.id,
        type: value.type,
        ...(value.label === undefined ? {} : { label: value.label }),
        ...(value.value === undefined ? {} : { value: value.value }),
      }
    })
    const connections = scene.connections.map((value) => {
      if (!isRecord(value)) return malformed()
      if (value.kind !== undefined && value.kind !== "wire") return malformed()
      return {
        ...(value.id === undefined ? {} : { id: value.id }),
        from: value.from,
        to: value.to,
      }
    })
    const parsed = SimulationLoadSceneParamsSchema.safeParse({
      scene: {
        components,
        connections,
        ...(scene.pinAssignments === undefined
          ? {}
          : { pinAssignments: scene.pinAssignments }),
      },
    })
    if (!parsed.success) return malformed()
    return parsed.data.scene
  }

  /**
   * Anche il digest provider è iniettato: riceve una copia della scena, mai il
   * riferimento che l'host potrebbe committare dopo la verifica.
   */
  private _digestForState(state: unknown): string {
    return this._api.sceneDigest(
      structuredClone(this._sceneFromState(state)),
    )
  }

  /**
   * Un receipt attesta l'operazione richiesta, non soltanto "qualche" cambio di
   * digest. Il runtime iniettato può quindi aggiungere esclusivamente il wire
   * del connect-wire validato, lasciando invariato tutto il resto della scena.
   */
  private _assertAppliedOperation(
    previousScene: SimulationScene,
    nextState: unknown,
    operation: SimulationApplyOperationParams["operation"],
  ): void {
    const wire = operation.operation.wire
    const nextScene = this._sceneFromState(nextState)
    const previousConnections = previousScene.connections
    const retainedConnections = nextScene.connections.slice(0, -1)
    const addedConnection = nextScene.connections.at(-1)
    const retainedTopologyMatches =
      retainedConnections.length === previousConnections.length &&
      retainedConnections.every((connection, index) => {
        const previous = previousConnections[index]
        return (
          previous !== undefined &&
          connection.from === previous.from &&
          connection.to === previous.to &&
          (previous.id === undefined || connection.id === previous.id)
        )
      })
    const addedWireMatches =
      addedConnection?.id === wire.id &&
      addedConnection.from === wire.from &&
      addedConnection.to === wire.to
    const connectionIds = nextScene.connections.flatMap((connection) =>
      connection.id === undefined ? [] : [connection.id],
    )
    const idsAreUnique = new Set(connectionIds).size === connectionIds.length
    const componentsMatch =
      canonicalJson(nextScene.components) === canonicalJson(previousScene.components)
    const pinAssignmentsMatch =
      canonicalJson(nextScene.pinAssignments ?? {}) ===
      canonicalJson(previousScene.pinAssignments ?? {})
    if (
      !componentsMatch ||
      !pinAssignmentsMatch ||
      !retainedTopologyMatches ||
      !addedWireMatches ||
      !idsAreUnique
    ) {
      throw new Error(
        `simulation operation "${operation.id}" changed the scene outside requested connect-wire`,
      )
    }
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

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value)
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("simulation scene contains a non-finite number")
    return Object.is(value, -0) ? "0" : String(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalJson(entry)).join(",")}]`
  }
  if (!isRecord(value)) {
    throw new Error("simulation scene contains a non-JSON value")
  }
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`
}
