import {
  createElabV1Cap6Esp1CircuitPayload,
  type ElabCircuitSceneAdapterPayload,
} from "./fixtureAdapter.ts"
// Mirror strutturale di BoardElementLike (src/toolhost/caps/board.ts): sim
// emette dati puri e non importa src (gate F4); la compatibilità col toolhost
// è garantita dallo structural typing al punto di consumo in src.
type BoardElementData = {
  id: string
  customData?: Record<string, unknown>
  [k: string]: unknown
}

export const ELAB_V1_CAP6_ESP1_TOOL_ID = "io.maestro.sim-elab-v1-cap6-esp1"
export const ELAB_V1_CAP6_ESP1_EMBED_ID = "elab-v1-cap6-esp1-circuit"

export type ElabV1Cap6Esp1BoardEmbedState = {
  schema: "elab.board-embed-state.v1"
  circuit: ElabCircuitSceneAdapterPayload
  view: {
    mode: "manual-aligned"
    sourceLabel: "Vol.1 pag.29-31"
    selectedManualPage: 29
  }
}

export type ElabV1Cap6Esp1BoardWritePayload = {
  embedId: typeof ELAB_V1_CAP6_ESP1_EMBED_ID
  state: ElabV1Cap6Esp1BoardEmbedState
}

export type ElabV1Cap6Esp1EmbedBounds = {
  x?: number
  y?: number
  width?: number
  height?: number
}

const DEFAULT_BOUNDS = {
  x: 420,
  y: 260,
  width: 640,
  height: 420,
} as const

export function createElabV1Cap6Esp1BoardWritePayload(
  fixture: unknown,
): ElabV1Cap6Esp1BoardWritePayload {
  const circuit = createElabV1Cap6Esp1CircuitPayload(fixture)
  return {
    embedId: ELAB_V1_CAP6_ESP1_EMBED_ID,
    state: {
      schema: "elab.board-embed-state.v1",
      circuit,
      view: {
        mode: "manual-aligned",
        sourceLabel: "Vol.1 pag.29-31",
        selectedManualPage: 29,
      },
    },
  }
}

export function createElabV1Cap6Esp1EmbeddableSkeleton(
  embedId = ELAB_V1_CAP6_ESP1_EMBED_ID,
  bounds: ElabV1Cap6Esp1EmbedBounds = {},
): BoardElementData {
  return {
    id: embedId,
    type: "embeddable",
    x: bounds.x ?? DEFAULT_BOUNDS.x,
    y: bounds.y ?? DEFAULT_BOUNDS.y,
    width: bounds.width ?? DEFAULT_BOUNDS.width,
    height: bounds.height ?? DEFAULT_BOUNDS.height,
  }
}
