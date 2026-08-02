// Composition root di un POST-IT VIVO: l'unico punto in cui una PluginInstance
// diventa insieme SITUATA (board), IDENTIFICATA (instanceId) e PERSISTENTE
// (store che sopravvive alla sessione).
//
// panelHost.ts monta un pannello effimero: PanelMemStore in memoria, board
// inerte, nessun instanceId. Serviva a provare il wire, non a tenere in vita un
// oggetto sulla lavagna. Qui l'istanza sopravvive alla chiusura della lezione,
// ed è il presupposto della riapertura senza perdita.
//
// Il modulo resta headless: nessun DOM, nessun iframe. Chi monta decide come
// agganciare il tool al canale (iframe in produzione, tool in-page nei test),
// così la stessa cucitura si porta su una superficie nativa senza riscriverla.

import { ToolHost } from "./host.ts"
import type { MountGate } from "./host.ts"
import { resolveGrant } from "./policy.ts"
import type { CapabilityName, ToolManifest } from "../toolhost-protocol/index.ts"
import type { AuditStore } from "./audit.ts"
import type { StorageDriverLike } from "./caps/storage.ts"
import type { BoardApiLike } from "./caps/board.ts"

export interface LivePostit {
  readonly instanceId: string
  readonly host: ToolHost
  /** Persiste lo stato del tool e chiude la sessione: è la chiusura della lezione. */
  close(): Promise<void>
}

export interface MountLivePostitOptions {
  manifest: ToolManifest
  /** Identità dell'istanza: la crea la superficie, mai il tool. */
  instanceId: string
  store: StorageDriverLike & AuditStore
  board: BoardApiLike
  approved: readonly CapabilityName[]
  /** Gate lifecycle/sicurezza: nega plugin non installati, disabilitati o revocati. */
  gate: MountGate
  /** Aggancia il tool al canale: iframe in produzione, tool in-page nei test. */
  connect(hello: unknown, port: MessagePort): Promise<void>
  now?: () => number
}

export async function mountLivePostit(opts: MountLivePostitOptions): Promise<LivePostit> {
  // instanceId malformato: il costruttore di ToolHost fallisce chiuso via
  // ToolBoard/ToolStorage, quindi nessun canale viene aperto e non resta niente
  // da chiudere.
  const host = new ToolHost(opts.manifest, resolveGrant(opts.manifest, opts.approved), {
    store: opts.store,
    board: opts.board,
    instanceId: opts.instanceId,
    ...(opts.now === undefined ? {} : { now: opts.now }),
  })

  const channel = new MessageChannel()
  let mounted = false
  try {
    const session = await host.mountIfEnabled(opts.gate, channel.port1)
    if (session === null) {
      throw new Error(`tool "${opts.manifest.id}" is not mountable`)
    }
    mounted = true
    await opts.connect(session.hello, channel.port2)
  } catch (err) {
    if (mounted) host.unmount()
    channel.port1.close()
    channel.port2.close()
    throw err
  }

  return {
    instanceId: opts.instanceId,
    host,
    close: async () => {
      // Ordine non commutativo: lo stato si chiede al tool mentre la sessione è
      // VIVA. Smontare prima perderebbe lo stato in silenzio, ed è esattamente
      // ciò che rende una riapertura "quasi giusta".
      try {
        await host.suspend()
      } finally {
        host.unmount()
        channel.port1.close()
        channel.port2.close()
      }
    },
  }
}
