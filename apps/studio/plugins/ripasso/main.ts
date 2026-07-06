// Runtime del TERZO plugin concreto di riferimento: "Ripasso errori", pannello
// SOLA LETTURA sul grafo LessonOS via graph.query (primo consumatore reale del
// metodo wire introdotto dal contratto 1.1.0). Esercita il contratto Layer-0
// usando SOLO la superficie pubblica `src/sdk`:
//   manifest (manifest.ts) · capabilities (grantedCaps) · message-protocol (call)
//   · lifecycle (handlers suspend/restore).
// Il modello vive in ./ripasso.ts (puro, deterministico): qui c'è solo il ponte
// grafo ⇄ modello. Degrada in sicurezza: capability negata dal docente O host
// senza event-log cablato → ripasso vuoto, mai crash del pannello.
import { connectTool, isGranted } from "../../src/sdk/index.ts"
import type { ToolConnection, WindowLike } from "../../src/sdk/index.ts"
import { EMPTY_RIPASSO, buildRipasso, isRipassoModel, renderRipasso } from "./ripasso.ts"
import type { GraphEdgeLike, GraphNodeLike, RipassoModel, RipassoRender } from "./ripasso.ts"

export interface StartOptions {
  /** Finestra su cui attendere host.hello (default globalThis); override nei test. */
  windowRef?: WindowLike
}

/** Controller del plugin montato: il pannello chiama render(); refresh() ri-legge il grafo. */
export interface RipassoPlugin {
  readonly conn: ToolConnection
  /** Ultimo modello calcolato (vuoto finché graph.query non è disponibile). */
  model(): RipassoModel
  /** Righe del pannello dall'ultimo modello. */
  render(): RipassoRender
  /** Ri-interroga il grafo (nodi errore+concetto, archi deriva-da) e ricalcola. */
  refresh(): Promise<RipassoModel>
}

async function queryNodes(conn: ToolConnection, kind: string): Promise<readonly GraphNodeLike[]> {
  const res = (await conn.call("graph.query", { select: "nodes", kind })) as { nodes?: readonly GraphNodeLike[] }
  return res.nodes ?? []
}

async function queryEdges(conn: ToolConnection, kind: string): Promise<readonly GraphEdgeLike[]> {
  const res = (await conn.call("graph.query", { select: "edges", kind })) as { edges?: readonly GraphEdgeLike[] }
  return res.edges ?? []
}

/**
 * Handshake col host e prima lettura. Le chiamate sono gated dalle capability
 * EFFETTIVAMENTE concesse (grantedCaps), non da quelle dichiarate: il docente
 * può negare graph.query e il plugin deve degradare in sicurezza. Anche un
 * host che concede la capability ma non ha l'event-log cablato (INTERNAL)
 * viene assorbito: il ripasso resta vuoto, il pannello vive.
 */
export async function start(opts: StartOptions = {}): Promise<RipassoPlugin> {
  let model: RipassoModel = EMPTY_RIPASSO

  const conn = await connectTool({
    windowRef: opts.windowRef,
    handlers: {
      suspend: () => model,
      restore: (saved: unknown): void => {
        if (isRipassoModel(saved)) model = saved
      },
    },
  })
  const graphOn = isGranted(conn.grantedCaps, "graph.query")

  async function refresh(): Promise<RipassoModel> {
    if (!graphOn) {
      model = EMPTY_RIPASSO
      return model
    }
    try {
      const [errori, concetti, derivaDa] = await Promise.all([
        queryNodes(conn, "errore"),
        queryNodes(conn, "concetto"),
        queryEdges(conn, "deriva-da"),
      ])
      model = buildRipasso([...errori, ...concetti], derivaDa)
    } catch {
      // capability concessa ma metodo non cablato dall'host (INTERNAL) o wire
      // interrotto: degradare, mai far cadere il pannello del docente.
      model = EMPTY_RIPASSO
    }
    return model
  }

  await refresh()

  return {
    conn,
    model: () => model,
    render: () => renderRipasso(model),
    refresh,
  }
}
