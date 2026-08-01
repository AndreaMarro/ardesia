// TOOLHOST-SPEC-v0 §9 T2 — runtime host per UN tool installato: lega manifest +
// grant alle capability REALI (board/storage), all'audit-log e al lifecycle
// suspend/restore. Le superfici (iframe, origin-server) restano fuori: questo
// modulo è headless e testabile con MessageChannel puri.

import { z } from "zod"
import { SuspendResultSchema, isValidToolId } from "../toolhost-protocol/index.ts"
import type { Capabilities, ToolManifest } from "../toolhost-protocol/index.ts"
import { CONTRACT_VERSION } from "../sdk/index.ts"
import { ToolAuditLog } from "./audit.ts"
import type { AuditStore } from "./audit.ts"
import { ToolBoard } from "./caps/board.ts"
import type { BoardApiLike, BoardElementLike } from "./caps/board.ts"
import { ToolGraph } from "./caps/graph.ts"
import type { EventLogReadLike } from "./caps/graph.ts"
import { ToolStorage, purgeInstanceStorage, purgeToolStorage } from "./caps/storage.ts"
import type { StorageDriverLike } from "./caps/storage.ts"
import { assertInstanceId } from "./caps/instance.ts"
import { ToolSimulation } from "./caps/simulation.ts"
import type { SimulationRuntimeApiLike } from "./caps/simulation.ts"
import { assertGrantWithinManifest } from "./policy.ts"
import { checkKillList } from "./killList.ts"
import type { StorageReadWriteDelete } from "./killList.ts"
import { ToolHostSession, createNonce } from "./session.ts"
import type { MethodHandler } from "./router.ts"
import type { PortLike } from "./session.ts"
import type { EventLogStore, LessonOsEvent } from "../lessonos/eventlog.ts"

export function statePath(toolId: string, instanceId?: string): string {
  if (!isValidToolId(toolId)) throw new Error(`invalid tool id: ${toolId}`)
  if (instanceId === undefined) return `tools/${toolId}/state.json`
  // Specchia storagePrefix(): board, storage e simulation erano già namespaced
  // per istanza, lo stato di lifecycle dell'host no — due post-it dello stesso
  // plugin si restituivano lo stato a vicenda. "@instance" non è un instanceId
  // valido (INSTANCE_ID_RE), quindi il segmento non è alias-abile.
  assertInstanceId(instanceId)
  return `tools/${toolId}/@instance/${instanceId}/state.json`
}

/**
 * Superficie minima del PluginManager che l'host consulta prima del mount: lo
 * stato `enabled` del lifecycle deciso dal docente (canMount = vero solo se il
 * plugin è installato, abilitato e non revocato). Strutturale di proposito —
 * l'host non dipende dalla classe concreta, ma il PluginManager la soddisfa.
 */
export interface MountGate {
  canMount(toolId: string): Promise<boolean>
}

// Tetto sul documento di suspend serializzato: lo stato NON passa dalla quota
// storage (vive in state.json), senza tetto sarebbe un bypass della quota.
export const MAX_STATE_BYTES = 1024 * 1024

const StateDocSchema = z.strictObject({ v: z.literal(1), t: z.number(), state: z.unknown() })

export interface ToolHostDeps {
  /** Il workspaceStore reale li soddisfa entrambi strutturalmente. */
  store: StorageDriverLike & AuditStore
  board: BoardApiLike
  /**
   * Event-log LessonOS in SOLA LETTURA per graph.query: senza iniezione il
   * metodo resta concesso-ma-non-cablato (INTERNAL, mai silenzio) — speculare
   * a storage senza quota. L'host non crea mai un log proprio.
   */
  eventLog?: EventLogReadLike
  /**
   * Event-log LessonOS in append controllato per lesson.event.emit. Separato
   * dalla view read-only di graph.query: concedere la lettura non implica mai
   * scrittura, e viceversa.
   */
  lessonEventLog?: EventLogStore
  /**
   * Identità di ISTANZA (P0-C, multi-istanza dello stesso plugin): namespace
   * storage e ownership board diventano per-istanza, così due post-it dello
   * stesso tool non si leggono/scrivono a vicenda. HOST-side: la crea il
   * docente (la superficie), mai il tool — non esiste sul wire.
   */
  instanceId?: string
  /**
   * Simulation Plugin esposto come SERVIZIO (capability service.simulation): un
   * Pack disciplinare lo usa via wire invece di importarne il codice. Iniettato
   * dal composition root — l'host non importa mai `sim/`, così Layer 0 non
   * impara cos'è un circuito. Senza iniezione il metodo resta concesso-ma-non
   * -cablato (INTERNAL, mai silenzio), come graph.query senza eventLog.
   * Richiede `instanceId`: senza identità di istanza non esiste namespace.
   */
  simulation?: SimulationRuntimeApiLike
  makeSkeleton?: (embedId: string) => BoardElementLike
  theme?: "light" | "dark"
  locale?: string
  /** Tetto per le request host→tool (default 10s in session.ts). */
  requestTimeoutMs?: number
  /** Iniettabili SOLO nei test (il runtime è cattura-side, non replay-side). */
  now?: () => number
  bearerToken?: string
}

/**
 * Host runtime di un tool. Una istanza per tool installato; ogni mount (iframe)
 * apre una NUOVA sessione con nonce fresco. Gli handler wire usano le capability
 * costruite dal GRANT (che non eccede mai il manifest, vedi policy.ts) e ogni
 * request rispondibile finisce nell'audit-log del tool.
 */
export class ToolHost {
  /** Versione del contratto SDK implementato da questo host (SemVer): un registro
   *  o un plugin può interrogarla per decidere la compatibilità prima del mount. */
  static readonly contractVersion = CONTRACT_VERSION

  readonly manifest: ToolManifest
  readonly audit: ToolAuditLog

  private _grant: Capabilities
  private _deps: ToolHostDeps
  private _board: ToolBoard
  private _storage: ToolStorage | null
  private _graph: ToolGraph | null
  private _simulation: ToolSimulation | null
  private _session: ToolHostSession | null = null
  // suspend/restore serializzati: due suspend concorrenti non devono poter
  // atterrare su state.json fuori ordine (last-write-wins con stato VECCHIO).
  private _lifecycle: Promise<unknown> = Promise.resolve()
  // kill-switch a runtime: una volta revocato, l'host non può più montare il
  // tool (irreversibile per questa istanza; la riabilitazione crea una nuova istanza).
  private _revoked = false

  constructor(manifest: ToolManifest, grantedCaps: Capabilities, deps: ToolHostDeps) {
    // difesa in profondità: il grant non può MAI eccedere il manifest, anche se
    // il chiamante ha scavalcato resolveGrant (capability-gating alla radice).
    assertGrantWithinManifest(manifest, grantedCaps)
    this.manifest = manifest
    this._grant = grantedCaps
    this._deps = deps
    this.audit = new ToolAuditLog(deps.store, manifest.id, deps.now)
    this._board = new ToolBoard(deps.board, manifest.id, deps.makeSkeleton, deps.instanceId)
    const quota = grantedCaps.storage?.quotaMB
    this._storage =
      quota === undefined ? null : new ToolStorage(deps.store, manifest.id, quota, deps.instanceId)
    this._graph = deps.eventLog === undefined ? null : new ToolGraph(deps.eventLog)
    // Nessuna identità di istanza → nessun servizio: nel dubbio non si cabla.
    this._simulation =
      deps.simulation === undefined || deps.instanceId === undefined
        ? null
        : new ToolSimulation(deps.simulation, deps.instanceId)
  }

  /** Sessione viva (mount corrente), o null se il tool non è montato. */
  get session(): ToolHostSession | null {
    return this._session
  }

  /** true dopo revoke(): il tool è stato ucciso e non può più essere montato. */
  get revoked(): boolean {
    return this._revoked
  }

  /**
   * Kill-switch (spec §3): revoca a runtime. Chiude IMMEDIATAMENTE la sessione
   * viva — uccidendo un tool già in esecuzione — e blocca ogni mount successivo.
   * Idempotente. La kill-list persistente (killList.ts) è la fonte di verità; per
   * legarla a un host vivo usa syncKillSwitch(). Distinto da unmount(): unmount
   * chiude la sessione ma permette il re-mount; revoke è terminale.
   */
  revoke(): void {
    this._revoked = true
    this.unmount()
  }

  /**
   * Consulta la kill-list PERSISTENTE con lo store di questo host e applica il
   * kill-switch (revoke se elencato). Pensata per essere chiamata sul percorso di
   * mount (ToolFrame) PRIMA di consegnare l'hello: un tool revocato dopo l'install
   * non deve mai ripartire. true = revocato.
   */
  refreshKillSwitch(): Promise<boolean> {
    return syncKillSwitch(this._deps.store, this)
  }

  /**
   * Monta il tool su una porta (l'altra estremità va alla finestra del tool con
   * postHello). Chiude l'eventuale sessione precedente: un mount = una sessione.
   */
  mount(port: PortLike): ToolHostSession {
    if (this._revoked) {
      throw new Error(`tool "${this.manifest.id}" is revoked: mount denied`)
    }
    this._session?.close()
    const session = new ToolHostSession({
      grantedCaps: this._grant,
      handlers: this._handlers(),
      isOwnEmbed: this._board.isOwnEmbed,
      // fire-and-forget consapevole: un audit-sink rotto non blocca il tool
      // (policy ST2); l'errore resta osservabile da audit.idle() nei test.
      onAudit: (event) => void this.audit.append(event).catch(() => {}),
      bearerToken: this._deps.bearerToken ?? createNonce(),
      requestTimeoutMs: this._deps.requestTimeoutMs,
      theme: this._deps.theme,
      locale: this._deps.locale,
    })
    session.attach(port)
    this._session = session
    return session
  }

  /**
   * Gate di INTENTO pre-mount (spec §3): delega a PluginManager.canMount — lo
   * stato `enabled` del lifecycle deciso dal docente — e monta SOLO se il plugin
   * è abilitato. Un plugin `disabled` (o revocato / non installato) NON viene
   * montato: ritorna null e l'host resta non montato (nessuna porta consumata,
   * nessuna sessione aperta). È il pendant sull'asse INTENTO ("il docente lo
   * vuole acceso?") del kill-switch refreshKillSwitch (asse SICUREZZA): qui la
   * decisione di lifecycle del PluginManager nega il mount alla radice.
   */
  async mountIfEnabled(gate: MountGate, port: PortLike): Promise<ToolHostSession | null> {
    if (!(await gate.canMount(this.manifest.id))) return null
    return this.mount(port)
  }

  unmount(): void {
    this._session?.close()
    this._session = null
  }

  /** host.suspend: chiede lo stato al tool e lo persiste in tools/<id>/state.json. */
  suspend(): Promise<void> {
    return this._serializeLifecycle(async () => {
      const session = this._requireSession()
      const result = SuspendResultSchema.parse(await session.request("host.suspend", {}))
      const now = this._deps.now ?? (() => Date.now())
      const doc = JSON.stringify({ v: 1, t: now(), state: result.state ?? null })
      const blob = new Blob([doc], { type: "application/json" })
      if (blob.size > MAX_STATE_BYTES) {
        throw new Error(`suspend state too large (${blob.size} > ${MAX_STATE_BYTES} bytes)`)
      }
      await this._deps.store.write(statePath(this.manifest.id, this._deps.instanceId), blob)
    })
  }

  /** host.restore: consegna al tool l'ultimo stato persistito. false = nessuno stato. */
  restore(): Promise<boolean> {
    return this._serializeLifecycle(async () => {
      const session = this._requireSession()
      const instanceId = this._deps.instanceId
      const percorso = statePath(this.manifest.id, instanceId)
      let letto = percorso
      let blob = await this._deps.store.read(percorso)
      if (blob === null && instanceId !== undefined) {
        // Migrazione esplicita dal percorso senza istanza (CARDINE 3, P0-3).
        // Prima di questa riparazione lo stato viveva in tools/<id>/state.json:
        // senza fallback un post-it aggiornato si riaprirebbe VUOTO, e nessun
        // errore lo direbbe — il silenzio è il difetto, non la perdita.
        //
        // Il legacy si LEGGE e non si cancella: finché un'altra istanza non ha
        // ancora un proprio stato, quello è l'unico che ha. La migrazione si
        // completa da sé al primo suspend, che scrive sempre sul percorso di
        // istanza.
        letto = statePath(this.manifest.id)
        blob = await this._deps.store.read(letto)
      }
      if (blob === null) return false
      let doc: z.infer<typeof StateDocSchema>
      try {
        doc = StateDocSchema.parse(JSON.parse(await blob.text()))
      } catch {
        // mai consegnare spazzatura al tool: meglio un errore esplicito al docente
        throw new Error(`corrupted tool state: ${letto}`)
      }
      await session.request("host.restore", { state: doc.state })
      return true
    })
  }

  /**
   * Uninstall (spec §2): via storage/ e state.json del tool; l'audit-log
   * SOPRAVVIVE (il docente deve poter rispondere a "cosa ha letto questo tool?").
   */
  async uninstall(): Promise<void> {
    this.unmount()
    // drena le mutazioni storage in coda: una set in-flight che atterrasse
    // DOPO il purge resusciterebbe dati che dovevano sparire.
    await this._storage?.idle()
    // Un'istanza disinstalla SOLO se stessa: il purge totale del tool
    // svuoterebbe i post-it gemelli dello stesso plugin ancora sulla lavagna.
    const instanceId = this._deps.instanceId
    if (instanceId === undefined) {
      await purgeToolStorage(this._deps.store, this.manifest.id)
    } else {
      await purgeInstanceStorage(this._deps.store, this.manifest.id, instanceId)
    }
    await this._deps.store.delete(statePath(this.manifest.id, instanceId))
  }

  private _requireSession(): ToolHostSession {
    if (this._session === null) throw new Error("tool not mounted")
    return this._session
  }

  private _serializeLifecycle<T>(op: () => Promise<T>): Promise<T> {
    const p = this._lifecycle.then(op, op)
    this._lifecycle = p.then(
      () => {},
      () => {},
    )
    return p
  }

  private _handlers(): Partial<Record<string, MethodHandler>> {
    const handlers: Partial<Record<string, MethodHandler>> = {
      "board.read": (p) => this._board.read((p as { target: "scene" | "selection" }).target),
      "board.write": (p) => {
        const { embedId, state } = p as { embedId: string; state: unknown }
        return this._board.write(embedId, state)
      },
    }
    const storage = this._storage
    if (storage !== null) {
      handlers["storage.get"] = (p) => storage.get((p as { key: string }).key)
      handlers["storage.set"] = (p) => {
        const { key, value } = p as { key: string; value: string }
        return storage.set(key, value)
      }
      handlers["storage.delete"] = (p) => storage.delete((p as { key: string }).key)
      handlers["storage.list"] = (p) => storage.list((p as { prefix?: string }).prefix)
    }
    const graph = this._graph
    if (graph !== null) {
      handlers["graph.query"] = (p) => graph.query(p as Parameters<ToolGraph["query"]>[0])
    }
    const simulation = this._simulation
    if (simulation !== null) {
      handlers["simulation.describe"] = () => simulation.describe()
      handlers["simulation.loadScene"] = (p) =>
        simulation.loadScene(p as Parameters<ToolSimulation["loadScene"]>[0])
      handlers["simulation.solve"] = (p) => simulation.solve(p as Parameters<ToolSimulation["solve"]>[0])
      handlers["simulation.readDiagnostics"] = () => simulation.readDiagnostics()
      handlers["simulation.serializeState"] = () => simulation.serializeState()
    }
    const lessonEventLog = this._deps.lessonEventLog
    if (lessonEventLog !== undefined) {
      handlers["lesson.event.emit"] = async (p) => {
        const { event } = p as { event: LessonOsEvent }
        const appended = await lessonEventLog.append(event)
        return { seq: appended.seq }
      }
    }
    return handlers
  }
}

/**
 * Lega la kill-list PERSISTENTE (killList.ts) al kill-switch a runtime di un host
 * vivo: se il tool è revocato, lo uccide subito (sessione chiusa + mount bloccati)
 * e ritorna true. Da invocare all'avvio e quando la kill-list cambia (revoca dal
 * pannello docente / kill-switch remoto futuro). Una kill-list corrotta propaga
 * l'errore: meglio bloccare che eseguire un tool il cui stato di revoca è ignoto.
 */
export async function syncKillSwitch(store: StorageReadWriteDelete, host: ToolHost): Promise<boolean> {
  const killed = await checkKillList(store, host.manifest.id)
  if (killed) host.revoke()
  return killed
}
