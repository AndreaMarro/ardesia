import JSZip from "jszip"
import type { LibraryItems } from "@excalidraw/excalidraw/types"
import { libraryFromScene } from "./libraryScene"

/**
 * Validate this optional scene extension before the canonical import commits.
 * WorkspaceStore still owns paths, identity, manifest, transaction and restore;
 * this does not approve the archive or replace its existing validation.
 */
export async function validateLibraryLesson(blob: Blob): Promise<LibraryItems> {
  const zip = await JSZip.loadAsync(blob)
  const board = zip.file("raw/board.excalidraw")
  if (!board) throw new Error("board.excalidraw non trovato nel bundle")
  return libraryFromScene(JSON.parse(await board.async("text")))
}
