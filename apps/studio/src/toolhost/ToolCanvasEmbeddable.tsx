/* eslint-disable react-refresh/only-export-components */
import type { ReactElement } from "react";
import { getSimulationTool, type ToolEmbedLike as EmbedLike, type ToolLinkRef as ToolLink, type SimulationToolHost } from "./simulationPluginRegistry";
import { renderPluginPostitBoardEmbeddable } from "./pluginPostitBoardRender";
export const TOOL_EMBED_SCHEME = "maestro-tool://";
export const REFERENCE_SIM_TOOL_ID = "io.ardesia.simulation";
export function parseToolLink(link: string | null | undefined): ToolLink | null {
  if (!link?.startsWith(TOOL_EMBED_SCHEME)) return null;
  try {
    const parsed = new URL(link);
    const embedId = parsed.pathname.replace(/^\/+/, "");
    if (!parsed.hostname || !embedId) return null;
    return { toolId: parsed.hostname, embedId };
  } catch {
    return null;
  }
}

// Duplicated embeds receive an independent instance identity.
export function normalizeDuplicatedToolEmbeds(
  elements: readonly EmbedLike[],
): { elements: EmbedLike[]; changed: boolean } {
  let changed = false;
  const next = elements.map((element) => {
    const parsed = parseToolLink(element.link);
    if (parsed === null || element.id === undefined || element.id === parsed.embedId) {
      return element;
    }
    changed = true;
    return {
      ...element,
      link: `${TOOL_EMBED_SCHEME}${parsed.toolId}/${element.id}`,
      customData: element.customData ? structuredClone(element.customData) : element.customData,
    };
  });
  return changed ? { elements: next, changed } : { elements: [...elements], changed };
}

// P0-C multi-istanza: identità del prossimo post-it. Il primo inserimento usa
// l'embedId storico (scene salvate ed e2e invariati); i successivi suffissano
// "--n" scegliendo il primo libero (mai un id già in scena, anche con buchi).
export function nextSimulationEmbedId(existingIds: readonly string[], baseEmbedId: string): string {
  const taken = new Set(existingIds);
  if (!taken.has(baseEmbedId)) return baseEmbedId;
  for (let n = 2; ; n += 1) {
    const candidate = `${baseEmbedId}--${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

/** Insert only an explicitly registered tool. Removed experiments have no fallback. */
export function buildSimulationInsert(currentElements: readonly { id?: string }[], toolId: string = REFERENCE_SIM_TOOL_ID): { embed: { id: string } & Record<string, unknown>; embedId: string } | null {
  const entry = getSimulationTool(toolId);
  if (!entry) return null;
  const ids = currentElements.flatMap((element) => typeof element.id === "string" ? [element.id] : []);
  const embedId = nextSimulationEmbedId(ids, entry.embedId);
  return { embed: entry.createEmbed(embedId), embedId };
}
export function renderToolCanvasEmbeddable(
  element: EmbedLike,
  host?: SimulationToolHost,
): ReactElement | null {
  const pluginPostitBoard = renderPluginPostitBoardEmbeddable(element);
  if (pluginPostitBoard !== null) return pluginPostitBoard;

  const toolLink = parseToolLink(element.link);
  if (!toolLink) return null;
  const entry = getSimulationTool(toolLink.toolId);
  if (entry) return entry.render(element, toolLink, host);
  return <UnknownToolCanvasTool toolLink={toolLink} />;
}

function UnknownToolCanvasTool({ toolLink }: { toolLink: ToolLink }) {
  return <div role="status" data-tool-unavailable={toolLink.toolId}>Plugin non disponibile.</div>;
}
