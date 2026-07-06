// P0-LIVE — mount di PRODUZIONE del plugin ripasso su ToolHost reale.
// Fino a qui graph.query (contratto 1.1.0, #116) girava solo con event-log
// iniettati nei test: questo helper porta lo stesso wire (host.hello →
// tool.ready → graph.query → audit) in una superficie montata, passando
// l'event-log LessonOS VERO alla creazione ToolHost.
//
// Il plugin è first-party e gira same-realm: la porta è un MessageChannel
// in-page, non un iframe. La fiducia non cambia rispetto al codice del
// cruscotto che lo ospita; l'isolamento origin dei tool TERZI resta il gate
// ADR-0001 (ToolLab non viene toccato). Il valore qui è il protocollo: ogni
// lettura del grafo passa da policy (grant reale) e audit-log, mai da una
// chiamata diretta al materializer.

import { ToolHost } from "./host.ts"
import { resolveGrant } from "./policy.ts"
import { readAuditLog } from "./audit.ts"
import type { AuditReadResult, AuditStore } from "./audit.ts"
import type { StorageDriverLike, StorageEntryLike } from "./caps/storage.ts"
import type { BoardApiLike, BoardElementLike } from "./caps/board.ts"
import type { EventLogReadLike } from "./caps/graph.ts"
import { manifest as ripassoManifest } from "../../plugins/ripasso/manifest.ts"
import { start } from "../../plugins/ripasso/main.ts"
import type { RipassoPlugin } from "../../plugins/ripasso/main.ts"
import type { CapabilityName, WindowLike } from "../sdk/index.ts"

/**
 * Store in-memory per audit-log del pannello: il ripasso non ha la capability
 * `storage` (least-privilege), quindi qui atterra SOLO l'audit della sessione.
 * L'event-log LessonOS NON passa di qua: resta l'unica memoria (mai un
 * secondo store).
 */
class PanelMemStore implements StorageDriverLike, AuditStore {
  private _m = new Map<string, Blob>()
  async read(p: string): Promise<Blob | null> {
    return this._m.get(p) ?? null
  }
  async write(p: string, d: Blob): Promise<void> {
    this._m.set(p, d)
  }
  async delete(p: string): Promise<void> {
    this._m.delete(p)
  }
  async list(prefix?: string): Promise<StorageEntryLike[]> {
    return [...this._m.entries()]
      .filter(([k]) => prefix === undefined || k.startsWith(prefix))
      .map(([path, data]) => ({ path, data }))
  }
}

/** Board inerte: il manifest ripasso non dichiara board.*, la policy rifiuta
 *  ogni chiamata prima di arrivare qui — questa esiste solo per il tipo deps. */
const INERT_BOARD: BoardApiLike = {
  getSceneElements: (): readonly BoardElementLike[] => [],
  getAppState: () => ({ selectedElementIds: {} }),
  updateScene: () => {},
}

/** Consegna in-page di host.hello al plugin (stesso wire di un iframe, same-realm). */
class InPageToolWindow implements WindowLike {
  private _listeners = new Set<(ev: { data: unknown; ports?: readonly unknown[] }) => void>()
  addEventListener(_t: "message", l: (ev: { data: unknown; ports?: readonly unknown[] }) => void): void {
    this._listeners.add(l)
  }
  removeEventListener(_t: "message", l: (ev: { data: unknown; ports?: readonly unknown[] }) => void): void {
    this._listeners.delete(l)
  }
  deliver(data: unknown, ports: readonly unknown[]): void {
    for (const l of [...this._listeners]) l({ data, ports })
  }
}

export interface MountRipassoPanelOptions {
  /** Event-log LessonOS in sola lettura; assente = graph non cablato (il plugin degrada a vuoto). */
  eventLog?: EventLogReadLike
  /** Capability approvate dal docente (default: graph.query, l'unica dichiarata). */
  approved?: readonly CapabilityName[]
}

export interface RipassoPanelHandle {
  plugin: RipassoPlugin
  /** Audit della sessione: ogni graph.query rispondibile è una entry (wire reale). */
  readAudit(): Promise<AuditReadResult>
  /** Chiude sessione, porte e host: da chiamare allo smontaggio del pannello. */
  close(): void
}

export async function mountRipassoPanel(opts: MountRipassoPanelOptions = {}): Promise<RipassoPanelHandle> {
  const store = new PanelMemStore()
  const host = new ToolHost(
    ripassoManifest,
    resolveGrant(ripassoManifest, opts.approved ?? ["graph.query"]),
    {
      store,
      board: INERT_BOARD,
      ...(opts.eventLog === undefined ? {} : { eventLog: opts.eventLog }),
    },
  )
  const channel = new MessageChannel()
  const session = host.mount(channel.port1)
  const win = new InPageToolWindow()
  const pluginP = start({ windowRef: win })
  win.deliver(session.hello, [channel.port2])
  const plugin = await pluginP

  return {
    plugin,
    readAudit: () => readAuditLog(store, ripassoManifest.id),
    close: () => {
      plugin.conn.close()
      host.unmount()
      channel.port1.close()
      channel.port2.close()
    },
  }
}
