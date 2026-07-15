// Core contracts — punto di ingresso unico (ARCHITECTURE-CANON §4).
// Il prodotto dipende da queste astrazioni, non da id concreti (DIP).

export { LessonModeSchema, lessonModeFromBuildMode, type LessonMode } from "./lessonMode"
export {
  ManualSourceSchema,
  ManualRefSchema,
  manualRefToEvidence,
  parseManualEvidence,
  type ManualSource,
  type ManualRef,
} from "./manual"
export {
  BoardCitationSchema,
  boardCitationToEvidence,
  type BoardCitation,
} from "./boardCitation"
export {
  createTypedEventBus,
  type TypedEventBus,
  type ArdesiaEventMap,
  type ArdesiaEventKind,
} from "./eventBus"
// `kind` vive nel manifest (toolhost-protocol possiede il ToolManifest);
// qui viene ri-esportato perché fa parte del vocabolario Core.
export {
  ArdesiaModuleKindSchema,
  type ArdesiaModuleKind,
} from "../../toolhost-protocol/manifest"
export * from "./kernel"
export * from "./kernelIntake"
