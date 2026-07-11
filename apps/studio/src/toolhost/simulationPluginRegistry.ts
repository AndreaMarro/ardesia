// Simulation Plugin — registry di dispatch dei tool canvas.
// Sostituisce il Set letterale `referenceToolIds`: un tool è dispatchabile SOLO
// se registrato qui (deny-by-default). Nessuna superficie di sicurezza toccata:
// il registry governa solo il render dell'embed, non capability/protocollo.

import type { ReactElement } from "react";
import type { SolveOptions, SolveResult, SolverExperiment } from "../../sim/solver/elabSolver";
import type { LessonOsEvent } from "../lessonos/eventlog";

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

/**
 * Servizi che l'host offre al tool renderizzato (tutti opzionali: un tool
 * senza host resta funzionante, fail-soft). persistEmbedState scrive lo state
 * del PROPRIO embed in scena — la persistenza segue quella della scena.
 */
export type SimulationToolHost = {
  persistEmbedState?: (embedId: string, state: unknown, toolId: string) => void;
  /**
   * host-observes-solve: il tool riporta l'esito del solve come evento LessonOS
   * tipato; l'host lo accoda al log. Opzionale/fail-soft: senza host, il tool
   * resta funzionante e semplicemente non registra eventi.
   */
  emitLessonEvent?: (event: LessonOsEvent) => void;
};

export type ToolCanvasPresentation = "postit" | "runtime";

export interface SimulationToolEntry {
  /** EmbedId BASE del tool: prima istanza; le successive suffissano (P0-C). */
  embedId: string;
  /** Render del tool dentro l'embed Excalidraw. */
  render(
    element: ToolEmbedLike,
    toolLink: ToolLinkRef,
    host?: SimulationToolHost,
    presentation?: ToolCanvasPresentation,
  ): ReactElement | null;
  /**
   * Crea l'elemento embeddable Excalidraw completo del tool. embedId opzionale
   * per le istanze successive alla prima (P0-C multi-istanza): id e link
   * dell'elemento devono seguire l'identità richiesta.
   */
  createEmbed(embedId?: string): { id: string; type: string } & Record<string, unknown>;
  /** Validazione opzionale dello stato/scena del tool. */
  validate?(state: unknown): { ok: boolean; errors: string[] };
  /**
   * Solve elettrico opzionale (Fase 2 simulature, confine P2): il motore
   * reale dietro il dispatch del registry. Entry senza solve → nessun
   * calcolo elettrico dispatchabile (deny-by-default, come il render).
   */
  solve?(experiment: SolverExperiment, options?: SolveOptions): SolveResult;
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
