import { persistEmbedStateThroughToolHost, type BoardApiLike } from "./caps/board"
import type { AuditStore } from "./audit"

export async function persistRoomEmbedStateThroughToolHost(
  api: BoardApiLike,
  store: AuditStore,
  embedId: string,
  state: unknown,
  toolId: string,
  reportError: (message: string) => void,
): Promise<boolean> {
  try {
    const ok = await persistEmbedStateThroughToolHost(api, store, embedId, state, { toolId })
    if (!ok) reportError("Write-back ToolHost fallito: richiesta negata")
    return ok
  } catch (error) {
    reportError(`Write-back ToolHost fallito: ${(error as Error).message}`)
    return false
  }
}
