// Skeleton runtime del plugin di riferimento ELAB. Esercita i quattro pilastri
// del contratto SDK Layer-0 usando SOLO la superficie pubblica `src/sdk`:
//   manifest (manifest.ts) · capabilities (grantedCaps) · message-protocol (call)
//   · lifecycle (handlers suspend/restore).
// Non monta nulla da solo: espone start() che l'host invoca dentro l'iframe.
import { connectTool, isGranted } from "../../src/sdk/index.ts"
import type { Capabilities, ToolConnection } from "../../src/sdk/index.ts"
import { manifest } from "./manifest.ts"

interface ElabState {
  ledOn: boolean
}

const EMBED_ID = `${manifest.id}:main`

/** Stato locale del plugin, serializzato al suspend e ripristinato al restore. */
let state: ElabState = { ledOn: false }

/**
 * Handshake col host e prima sincronizzazione sulla lavagna. Tutte le chiamate
 * sono gated dalle capability EFFETTIVAMENTE concesse (grantedCaps), non da
 * quelle dichiarate nel manifest: il docente può negarne alcune.
 */
export async function start(): Promise<ToolConnection> {
  const conn = await connectTool({
    handlers: {
      suspend: (): ElabState => state,
      restore: (saved: unknown): void => {
        if (isElabState(saved)) state = saved
      },
    },
  })

  await syncBoard(conn, conn.grantedCaps)
  return conn
}

/** Disegna lo stato corrente sul proprio embed, se le capability lo permettono. */
async function syncBoard(conn: ToolConnection, caps: Capabilities): Promise<void> {
  if (isGranted(caps, "board.read")) {
    await conn.call("board.read", { target: "selection" })
  }
  if (isGranted(caps, "board.write")) {
    await conn.call("board.write", { embedId: EMBED_ID, state })
  }
}

function isElabState(value: unknown): value is ElabState {
  return typeof value === "object" && value !== null && typeof (value as ElabState).ledOn === "boolean"
}
