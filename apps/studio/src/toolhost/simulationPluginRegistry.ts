// Simulation Plugin — registry di dispatch dei tool canvas.
// Sostituisce il Set letterale `referenceToolIds`: un tool è dispatchabile SOLO
// se registrato qui (deny-by-default). Nessuna superficie di sicurezza toccata:
// il registry governa solo il render dell'embed, non capability/protocollo.

import type { ReactElement } from "react";

/** Forma strutturale dell'elemento embeddable Excalidraw (twin di EmbedLike). */
export type ToolEmbedLike = {
  id?: string;
  link?: string | null;
  customData?: Record<string, unknown> | null;
};

/** Identità del tool parsata dal link maestro-tool:// (twin di ToolLink). */
export type ToolLinkRef = {
  toolId: string;
  embedId: string;
};

export interface SimulationToolEntry {
  /** Id dell'embeddable creato da createEmbed (per idempotenza inserimento). */
  embedId: string;
  /** Render del tool dentro l'embed Excalidraw. */
  render(element: ToolEmbedLike, toolLink: ToolLinkRef): ReactElement | null;
  /** Crea l'elemento embeddable Excalidraw completo del tool. */
  createEmbed(): { id: string; type: string } & Record<string, unknown>;
  /** Validazione opzionale dello stato/scena del tool. */
  validate?(state: unknown): { ok: boolean; errors: string[] };
}

const registry = new Map<string, SimulationToolEntry>();

/** Registra (o sovrascrive) un tool per il dispatch degli embed maestro-tool://. */
export function registerSimulationTool(toolId: string, entry: SimulationToolEntry): void {
  registry.set(toolId, entry);
}

/** Entry del tool, o undefined se non registrato (deny-by-default). */
export function getSimulationTool(toolId: string): SimulationToolEntry | undefined {
  return registry.get(toolId);
}
