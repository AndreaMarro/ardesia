// S2 — plugin essenziali MINIMI ma REALI (Claude product lane, 2026-07-08).
// Non contratti astratti: ogni plugin è una definizione con manifest firmabile
// (stesso ToolManifest dell'installer, validato all'import: fail-closed) ed è
// materializzabile come oggetto post-it sulla board (createPluginPostitObject).
//
// Regole brief §1: least-privilege (solo le capability usate davvero); ogni
// stato iniziale è una FIXTURE dichiarata (mai dato reale spacciato per vero);
// NESSUN internamento del simulatore (import solo da toolhost-protocol/manifest
// e postitObject). Fonte: docs/ops/CLAUDE-ARDESIA-PRODUCT-GAP-AUDIT-...md §M3.

import { ToolManifestSchema } from "../toolhost-protocol/manifest.ts"
import type { ToolManifest } from "../toolhost-protocol/manifest.ts"
import { createPluginPostitObject, type PluginPostitObject, type PostitBounds } from "./postitObject.ts"

// Publisher first-party ARDESIA. pubkey placeholder: la firma ed25519 reale è
// apposta al packaging (.maestrotool), non in questa dichiarazione in-tree
// (stesso pattern del plugin di riferimento).
const ARDESIA_PUBLISHER = { id: "ardesia", pubkey: "ed25519:AAAA" } as const

// Readiness di prodotto (stato "pricing/readiness" del brief), distinto dal
// lifecycle di install: "ready" usabile, "preview" mostrabile ma non definitivo.
export type PluginReadiness = "ready" | "preview" | "planned"

// --- Stati iniziali: SEMPRE fixture. `fixture:true` è un invariante di tipo,
// non un flag rilassabile; il contenuto è un esempio segnaposto "(esempio)". ---
export type ManualEvidenceState = {
  fixture: true
  citation: { manualId: string; page: number; excerpt: string; evidenceRef: string }
}
export type LessonChecklistState = {
  fixture: true
  steps: Array<{ id: string; label: string; done: boolean }>
}
export type ConceptMapState = {
  fixture: true
  readOnly: true
  nodes: Array<{ id: string; label: string }>
  edges: Array<{ from: string; to: string }>
}
export type DrawingHdState = {
  fixture: true
  activeTool: "pen" | "marker" | "ruler"
  strokeColor: string
  layers: Array<{ id: string; label: string; visible: boolean }>
}
export type WebViewState = {
  fixture: true
  url: string
  title: string
  allowedDomains: string[]
}

export type EssentialPluginState =
  | ManualEvidenceState
  | LessonChecklistState
  | ConceptMapState
  | DrawingHdState
  | WebViewState

export type EssentialPluginFamily = "essential" | "drawing-hd" | "web"

export type EssentialPlugin<TState extends EssentialPluginState = EssentialPluginState> = {
  manifest: ToolManifest
  readiness: PluginReadiness
  family?: EssentialPluginFamily
  defaultBounds: PostitBounds
  /** Stato iniziale fixture (esempio didattico), MAI dato reale. */
  fixtureState: TState
}

// Fail-closed: un manifest essenziale fuori schema fa esplodere il modulo
// all'import — mai un plugin mezzo-valido nel catalogo.
function manifest(input: unknown): ToolManifest {
  return ToolManifestSchema.parse(input)
}

// 1) Manual Evidence — estratto citato del manuale con provenienza. Legge la
//    board per contestualizzare; nessuna scrittura. Least-privilege: board.read + ui.
export const MANUAL_EVIDENCE_PLUGIN: EssentialPlugin<ManualEvidenceState> = {
  manifest: manifest({
    manifestVersion: 1,
    id: "com.ardesia.manual-evidence",
    name: "Manual Evidence",
    version: "0.1.0",
    protocol: ">=1.0 <2.0",
    entry: "index.html",
    surfaces: ["board-embed"],
    capabilities: { "board.read": {}, ui: {} },
    publisher: ARDESIA_PUBLISHER,
    privacy: { dataOut: "none" },
    kind: "plugin",
    i18n: {
      it: {
        name: "Citazione dal manuale",
        consentBlurb: "Mostra un estratto citato del manuale con la sua provenienza; legge la lavagna per il contesto.",
      },
    },
  }),
  readiness: "preview",
  defaultBounds: { x: 0, y: 0, width: 320, height: 220 },
  fixtureState: {
    fixture: true,
    citation: {
      manualId: "manual:volN",
      page: 0,
      excerpt: "(esempio) estratto del manuale — segnaposto, non contenuto reale",
      evidenceRef: "manual:volN:p0",
    },
  },
}

// 2) Lesson Checklist — flusso/checklist di lezione legato allo stato board,
//    esportabile. Scrive SOLO i propri embed. board.read + board.write(own) + ui.
export const LESSON_CHECKLIST_PLUGIN: EssentialPlugin<LessonChecklistState> = {
  manifest: manifest({
    manifestVersion: 1,
    id: "com.ardesia.lesson-checklist",
    name: "Lesson Checklist",
    version: "0.1.0",
    protocol: ">=1.0 <2.0",
    entry: "index.html",
    surfaces: ["board-embed"],
    capabilities: { "board.read": {}, "board.write": { scope: "own-embeds" }, ui: {} },
    publisher: ARDESIA_PUBLISHER,
    privacy: { dataOut: "none" },
    kind: "plugin",
    i18n: {
      it: {
        name: "Checklist di lezione",
        consentBlurb: "Tiene una lista di passi della lezione dentro il proprio riquadro; esportabile.",
      },
    },
  }),
  readiness: "preview",
  defaultBounds: { x: 0, y: 0, width: 280, height: 320 },
  fixtureState: {
    fixture: true,
    steps: [
      { id: "s1", label: "(esempio) Introdurre il concetto", done: false },
      { id: "s2", label: "(esempio) Montare il circuito", done: false },
      { id: "s3", label: "(esempio) Verificare con lo studente", done: false },
    ],
  },
}

// 3) Concept Map — piccolo grafo di concetti della lezione. READ-ONLY prima
//    versione: legge il grafo (graph.query), nessuna proposta di claim, nessuna
//    scrittura board. graph.query + board.read + ui.
export const CONCEPT_MAP_PLUGIN: EssentialPlugin<ConceptMapState> = {
  manifest: manifest({
    manifestVersion: 1,
    id: "com.ardesia.concept-map",
    name: "Concept Map",
    version: "0.1.0",
    protocol: ">=1.0 <2.0",
    entry: "index.html",
    surfaces: ["board-embed"],
    capabilities: { "board.read": {}, "graph.query": {}, ui: {} },
    publisher: ARDESIA_PUBLISHER,
    privacy: { dataOut: "none" },
    kind: "plugin",
    i18n: {
      it: {
        name: "Mappa dei concetti",
        consentBlurb: "Mostra una piccola mappa di concetti della lezione (sola lettura dal grafo).",
      },
    },
  }),
  readiness: "preview",
  defaultBounds: { x: 0, y: 0, width: 360, height: 260 },
  fixtureState: {
    fixture: true,
    readOnly: true,
    nodes: [
      { id: "c1", label: "(esempio) Tensione" },
      { id: "c2", label: "(esempio) Corrente" },
      { id: "c3", label: "(esempio) Resistenza" },
    ],
    edges: [
      { from: "c1", to: "c2" },
      { from: "c2", to: "c3" },
    ],
  },
}

// 4) Drawing HD — taccuino tecnico nel proprio post-it. Scrive solo i propri
//    embed e non apre rete/grafo: board.write(own) + ui.
export const DRAWING_HD_PLUGIN: EssentialPlugin<DrawingHdState> = {
  manifest: manifest({
    manifestVersion: 1,
    id: "com.ardesia.drawing-hd",
    name: "HD Drawing",
    version: "0.1.0",
    protocol: ">=1.0 <2.0",
    entry: "index.html",
    surfaces: ["board-embed"],
    capabilities: { "board.write": { scope: "own-embeds" }, ui: {} },
    publisher: ARDESIA_PUBLISHER,
    privacy: { dataOut: "none" },
    kind: "plugin",
    i18n: {
      it: {
        name: "Disegno HD",
        consentBlurb: "Apre un taccuino tecnico ad alta precisione nel proprio post-it.",
      },
    },
  }),
  readiness: "preview",
  family: "drawing-hd",
  defaultBounds: { x: 0, y: 0, width: 520, height: 360 },
  fixtureState: {
    fixture: true,
    activeTool: "pen",
    strokeColor: "#1d4ed8",
    layers: [
      { id: "layer-grid", label: "(esempio) Griglia", visible: true },
      { id: "layer-notes", label: "(esempio) Annotazioni", visible: true },
    ],
  },
}

// 5) Web View — consultazione web dichiarata. Non scrive sulla board e limita
//    la rete ai domini dichiarati nel manifest: board.read + net.fetch + ui.
export const WEB_VIEW_PLUGIN: EssentialPlugin<WebViewState> = {
  manifest: manifest({
    manifestVersion: 1,
    id: "com.ardesia.web-view",
    name: "Web View",
    version: "0.1.0",
    protocol: ">=1.0 <2.0",
    entry: "index.html",
    surfaces: ["board-embed"],
    capabilities: { "board.read": {}, "net.fetch": { domains: ["example.edu"] }, ui: {} },
    publisher: ARDESIA_PUBLISHER,
    privacy: { dataOut: "declared-domains" },
    kind: "plugin",
    i18n: {
      it: {
        name: "Web",
        consentBlurb: "Mostra una risorsa web dichiarata e limitata ai domini consentiti.",
      },
    },
  }),
  readiness: "preview",
  family: "web",
  defaultBounds: { x: 0, y: 0, width: 420, height: 300 },
  fixtureState: {
    fixture: true,
    url: "https://example.edu/risorsa",
    title: "(esempio) Risorsa web dichiarata",
    allowedDomains: ["example.edu"],
  },
}

export const ESSENTIAL_PLUGINS: readonly EssentialPlugin[] = [
  MANUAL_EVIDENCE_PLUGIN,
  LESSON_CHECKLIST_PLUGIN,
  CONCEPT_MAP_PLUGIN,
  DRAWING_HD_PLUGIN,
  WEB_VIEW_PLUGIN,
]

export function essentialPluginById(pluginId: string): EssentialPlugin | undefined {
  return ESSENTIAL_PLUGINS.find((plugin) => plugin.manifest.id === pluginId)
}

export type MountEssentialPluginInput = {
  instanceId: string
  bounds?: PostitBounds
  zIndex?: number
}

/**
 * Materializza un plugin essenziale come oggetto post-it sulla board. L'host
 * (Room/superficie) fornisce l'instanceId; il tool non se lo auto-assegna.
 */
export function mountEssentialPluginPostit(
  plugin: EssentialPlugin,
  input: MountEssentialPluginInput,
): PluginPostitObject<EssentialPluginState> {
  return createPluginPostitObject<EssentialPluginState>({
    instanceId: input.instanceId,
    pluginId: plugin.manifest.id,
    bounds: input.bounds ?? plugin.defaultBounds,
    zIndex: input.zIndex ?? 0,
    pluginState: plugin.fixtureState,
  })
}
