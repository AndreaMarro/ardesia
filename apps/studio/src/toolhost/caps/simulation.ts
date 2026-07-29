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
//
// Fail-closed anche sulla RICEVUTA. Invariante del modulo: `_digest` descrive la
// topologia di `_state`, non quella della scena che è stata CHIESTA. Le due cose
// coincidono solo se il servizio ha caricato ciò che gli si è chiesto — e questo
// va provato, non presunto. Dove la prova manca non esce ricevuta.
//
// CONTRO CHI VALE, e contro chi no. Detto qui perché è meno costoso leggerlo che
// riscoprirlo, e perché il titolo della slice che ha introdotto la ricevuta
// prometteva di piu' di quanto una ricevuta possa dare.
//
// L'host NON possiede un oracolo indipendente. `sceneDigest` e `stateSceneDigest`
// arrivano ENTRAMBI dal servizio iniettato, e devono: lo stato è opaco e questo
// modulo non importa nulla da `sim/` — è la stessa proprietà che tiene il Core
// ignorante di cos'è un circuito. Quindi i confronti qui sotto:
//
//   - smascherano un servizio ONESTO che carica, risolve o serializza la scena
//     sbagliata. È il caso reale, ed è ciò che prima non era coperto affatto:
//     il digest finiva nella ricevuta senza decidere nulla.
//   - NON smascherano un servizio che MENTE, perché mentirebbe su entrambi i lati
//     del confronto restituendo due stringhe uguali.
//
// La ricevuta non è quindi una prova CONTRO il servizio: è una prova contro i suoi
// ERRORI. Renderla una prova contro il servizio richiede un oracolo che l'host
// possa calcolare da sé, e quella è una decisione di architettura, non una riga
// da aggiungere qui.
//
// Secondo limite, misurato: `simulationSceneDigest` è FNV-1a a 32 bit, quindi il
// confronto vale 32 bit e non di piu'. Due scene che differiscono solo per l'id
// del componente danno entrambe `22e6771a`, e una collisione contro un bersaglio
// si TROVA in ~640k tentativi (344 ms). Sugli id davvero generati dal prodotto
// (`${type}-libero-${n}`, elabCanvasAdapter.ts) la collisione accidentale non è
// raggiungibile — trovarla richiede una ricerca, che un errore non esegue — ma
// chi si appoggia a questi confronti deve sapere quanto pesano.

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
  /**
   * Digest della topologia CONTENUTA in uno stato. Non è `sceneDigest` con un
   * altro nome: quello hasha ciò che ABBIAMO CHIESTO, questo ciò che il servizio
   * HA DAVVERO CARICATO. Serve perché lo stato resta opaco all'host: solo il
   * servizio sa leggerlo, e l'host si limita a confrontare due stringhe. Senza
   * questo canale nessuna ricevuta può essere legata allo stato che descrive.
   */
  stateSceneDigest(state: unknown): string
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
    // Stato e digest si aggiornano INSIEME o per niente. Non basta: possono
    // essere coerenti FRA LORO e insieme scollegati dai fatti. Un digest preso
    // da `params.scene` descrive la scena CHIESTA, mentre lo stato committato è
    // quello RESTITUITO: un servizio dentro contratto che carica B mentre gli si
    // chiede A produrrebbe hash(A) sopra uno stato che contiene B — la ricevuta
    // che mente sulla topologia, che è esattamente ciò che deve impedire.
    // Quindi il digest della ricevuta DERIVA dallo stato davvero prodotto, e
    // deve coincidere con quello della scena richiesta: se non coincide non c'è
    // ricevuta, perché una ricevuta di cui non ci si può fidare non va emessa.
    const state = this._checkedState(this._api.loadScene({
      instanceId: this._instanceId,
      scene: params.scene,
      ...(params.diagnostics === undefined ? {} : { diagnostics: params.diagnostics }),
    }))
    const loaded = this._checkedDigest(this._api.stateSceneDigest(state))
    const requested = this._checkedDigest(this._api.sceneDigest(params.scene))
    if (loaded !== requested) {
      throw new Error(
        `simulation service loaded scene digest "${loaded}" for requested scene digest "${requested}" ` +
          `on instance "${this._instanceId}"`,
      )
    }
    this._state = state
    this._digest = loaded
    return { receipt: this._receipt(contract, loaded) }
  }

  solve(params: { provider: string; mode: string }): { receipt: SimulationReceipt; result: unknown } {
    const contract = this._contract()
    const solved = this._api.solve(this._requireState(), params)
    // Stessa forma del difetto un passo più in là: `solve` committa uno stato
    // NUOVO e riusa il digest del load. Risolvere non cambia la topologia — se
    // lo stato risolto ne descrive un'altra, il digest tenuto non lo descrive più.
    const digest = this._requireDigest()
    const state = this._checkedState(solved.state)
    const solvedDigest = this._checkedDigest(this._api.stateSceneDigest(state))
    if (solvedDigest !== digest) {
      throw new Error(
        `simulation service returned solved scene digest "${solvedDigest}" for loaded scene digest ` +
          `"${digest}" on instance "${this._instanceId}"`,
      )
    }
    this._state = state
    return { receipt: this._receipt(contract, digest), result: solved.result }
  }

  /**
   * Non muta nulla e non consegna stato: la diagnostica è un resoconto, non una
   * topologia, e non c'è digest da confrontarci. Regge sull'invariante tenuta da
   * loadScene/solve — `_digest` descrive `_state` — e non ne introduce di nuove.
   */
  readDiagnostics(): { receipt: SimulationReceipt; diagnostics: unknown } {
    const contract = this._contract()
    const diagnostics = this._api.readDiagnostics(this._requireState())
    return { receipt: this._receipt(contract, this._requireDigest()), diagnostics }
  }

  serializeState(): { receipt: SimulationReceipt; state: unknown } {
    const contract = this._contract()
    const digest = this._requireDigest()
    // Lo stato TENUTO è corretto per costruzione, ma qui i byte CONSEGNATI li
    // produce il servizio: se la loro topologia non è quella che la ricevuta
    // dichiara, il chiamante persisterebbe una scena sotto il digest di un'altra.
    // Una serializzazione può perdere dettagli — il digest è solo topologia — ma
    // non può cambiare il circuito.
    const state = this._api.serializeState(this._requireState())
    const serializedDigest = this._checkedDigest(this._api.stateSceneDigest(state))
    if (serializedDigest !== digest) {
      throw new Error(
        `simulation service serialized scene digest "${serializedDigest}" for loaded scene digest ` +
          `"${digest}" on instance "${this._instanceId}"`,
      )
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
   * Un digest che non è una stringa non è un digest. Il valore arriva da un
   * servizio iniettato e finisce DENTRO la ricevuta: accettarlo com'è farebbe
   * uscire un receipt fuori da SimulationReceiptSchema, cioè la prova di una
   * topologia che nessuno ha calcolato.
   */
  private _checkedDigest(digest: unknown): string {
    if (typeof digest !== "string" || digest.length === 0) {
      throw new Error(`simulation service returned no scene digest for instance "${this._instanceId}"`)
    }
    return digest
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
