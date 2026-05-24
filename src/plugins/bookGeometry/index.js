// © Andrea Marro — 24/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * src/plugins/bookGeometry/index.js — Public API
 *
 * Bridge runtime tra bookGeometry JSON canonical (src/data/book-geometry/)
 * e simulator React rendering.
 *
 * Workflow-v2 mandate Andrea: ogni esperimento demo nasce dal libro, NON dal simulatore.
 * bookGeometry = source-of-truth visiva. BookGeometryRenderer = bridge runtime.
 */

export { BookGeometryRenderer, default as BookGeometryRendererDefault } from './BookGeometryRenderer.jsx';
export { resolveBookPoint, __test__ as __resolveBookPointTest } from './resolveBookPoint.js';
