import { newElementWith } from "@excalidraw/excalidraw"
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types"
import { persistEmbedStateThroughToolHost, type BoardApiLike, type BoardElementLike } from "./caps/board"
import type { AuditStore } from "./audit"

type ActiveEmbeddable = { element: BoardElementLike; state: "active" | "hover" }
type RoomBoardApi = Omit<BoardApiLike, "getAppState" | "updateScene"> & {
  getAppState(): ReturnType<BoardApiLike["getAppState"]> & { activeEmbeddable?: ActiveEmbeddable | null }
  updateScene(scene: { elements: BoardElementLike[]; appState?: { activeEmbeddable: ActiveEmbeddable } }): void
}

export async function persistRoomEmbedStateThroughToolHost(
  api: RoomBoardApi,
  store: AuditStore,
  embedId: string,
  state: unknown,
  toolId: string,
  reportError: (message: string) => void,
): Promise<void> {
  try {
    const board: BoardApiLike = {
      getSceneElements: () => api.getSceneElements(),
      getAppState: () => api.getAppState(),
      updateScene: (scene) => {
        const active = api.getAppState().activeEmbeddable
        const previous = api.getSceneElements().find((element) => element.id === embedId)
        const candidate = scene.elements.find((element) => element.id === embedId)
        // Room's journal observes Excalidraw element versions. Use its mutation
        // API so snapshot edits receive the same version/nonce/time metadata as
        // ordinary board edits and can be reconstructed by the existing replay.
        const updated = previous && candidate
          ? newElementWith(previous as ExcalidrawElement, { customData: candidate.customData })
          : candidate
        const elements = scene.elements.map((element) => element.id === embedId && updated ? updated : element)
        // Excalidraw compares the active element by reference. Write-back replaces
        // that element, so carry its already active state into the same update.
        // Never activate an inactive, locked/deleted or different embed.
        const keepActive = active?.state === "active" && active.element.id === embedId
          && updated && !updated.locked && !updated.isDeleted
        api.updateScene({
          elements,
          ...(keepActive ? { appState: { activeEmbeddable: { ...active, element: updated } } } : {}),
        })
      },
    }
    const ok = await persistEmbedStateThroughToolHost(board, store, embedId, state, { toolId })
    if (!ok) reportError("Write-back ToolHost fallito: richiesta negata")
  } catch (error) {
    reportError(`Write-back ToolHost fallito: ${(error as Error).message}`)
  }
}
