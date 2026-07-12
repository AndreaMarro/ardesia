// Simulation Plugin — registry di dispatch dei tool canvas.
// Sostituisce il Set letterale `referenceToolIds`: render e comandi tipati sono
// dispatchabili SOLO verso entry registrate, capability dichiarate e istanze
// con owner marker coerente (deny-by-default).

import type { ReactElement } from "react";
import type { SolveOptions, SolveResult, SolverExperiment } from "../../sim/solver/elabSolver";
import type { LessonOsEvent } from "../lessonos/eventlog";
import { EMBED_DATA_KEY } from "./caps/board";

export const SIMULATION_COMMAND_CAPABILITY = "simulation.command" as const;

export type SimulationCommandRequest = {
  command: "simulation.command";
  operation: "explain-next-fix";
  capability: typeof SIMULATION_COMMAND_CAPABILITY;
  sourcePluginId: string;
  sourceInstanceId: string;
  targetPluginId: string;
  targetInstanceId: string;
  causationId: string;
  issuedAt: number;
};

export type SimulationCommandBlockReason =
  | "host_unavailable"
  | "target_missing"
  | "target_plugin_mismatch"
  | "capability_denied"
  | "handler_missing"
  | "target_state_invalid"
  | "handler_failed"
  | "receipt_invalid";

export type SimulationCommandReceipt = {
  status: "issued" | "blocked";
  command: "simulation.command";
  capability: typeof SIMULATION_COMMAND_CAPABILITY;
  targetPluginId: string;
  targetInstanceId: string;
  causationId: string;
  handledAt: number;
  result: string;
  reason?: SimulationCommandBlockReason;
  evidence: string[];
};

export type SimulationCommandHandlerResult =
  | { accepted: true; result: string; evidence: string[] }
  | { accepted: false; reason: "target_state_invalid" | "handler_failed"; result: string };

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
  invokeSimulationCommand?: (request: SimulationCommandRequest) => SimulationCommandReceipt;
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
  capabilities?: readonly string[];
  invokeCommand?(request: SimulationCommandRequest, target: ToolEmbedLike): SimulationCommandHandlerResult;
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

function blockedReceipt(
  request: SimulationCommandRequest,
  reason: SimulationCommandBlockReason,
  result: string,
): SimulationCommandReceipt {
  return {
    status: "blocked",
    command: request.command,
    capability: request.capability,
    targetPluginId: request.targetPluginId,
    targetInstanceId: request.targetInstanceId,
    causationId: request.causationId,
    handledAt: Date.now(),
    result,
    reason,
    evidence: [],
  };
}

export function dispatchSimulationCommand(
  elements: readonly ToolEmbedLike[],
  request: SimulationCommandRequest,
): SimulationCommandReceipt {
  const target = elements.find((element) => element.id === request.targetInstanceId);
  if (!target) return blockedReceipt(request, "target_missing", "Simulation target non trovato.");

  const marker = target.customData?.[EMBED_DATA_KEY];
  const owner = typeof marker === "object" && marker !== null
    ? (marker as { owner?: unknown }).owner
    : undefined;
  if (owner !== request.targetPluginId) {
    return blockedReceipt(request, "target_plugin_mismatch", "Simulation target appartiene a un altro plugin.");
  }

  const entry = getSimulationTool(request.targetPluginId);
  if (!entry) return blockedReceipt(request, "handler_missing", "Simulation plugin non registrato.");
  if (!entry.capabilities?.includes(request.capability)) {
    return blockedReceipt(request, "capability_denied", "Capability Simulation non concessa.");
  }
  if (!entry.invokeCommand) return blockedReceipt(request, "handler_missing", "Simulation command handler assente.");

  let outcome: SimulationCommandHandlerResult;
  try {
    outcome = entry.invokeCommand(request, target);
  } catch {
    return blockedReceipt(request, "handler_failed", "Simulation command handler fallito.");
  }
  if (!outcome.accepted) return blockedReceipt(request, outcome.reason, outcome.result);
  if (outcome.evidence.length === 0) {
    return blockedReceipt(request, "receipt_invalid", "Simulation command handler senza evidenza.");
  }
  return {
    status: "issued",
    command: request.command,
    capability: request.capability,
    targetPluginId: request.targetPluginId,
    targetInstanceId: request.targetInstanceId,
    causationId: request.causationId,
    handledAt: Date.now(),
    result: outcome.result,
    evidence: outcome.evidence,
  };
}

export function isSimulationCommandReceiptForRequest(
  request: SimulationCommandRequest,
  receipt: SimulationCommandReceipt,
): boolean {
  return receipt?.status === "issued"
    && receipt.command === request.command
    && receipt.capability === request.capability
    && receipt.targetPluginId === request.targetPluginId
    && receipt.targetInstanceId === request.targetInstanceId
    && receipt.causationId === request.causationId
    && Array.isArray(receipt.evidence)
    && receipt.evidence.length > 0;
}
