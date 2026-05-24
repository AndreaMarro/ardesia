// © Andrea Marro — 24/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * resolveBookPoint — utility per convertire pseudo-pin reference (es. "bb1:e7")
 * a coordinate cartesiane (x, y) usabili dal renderer SVG.
 *
 * Workflow-v2 fase 6 mandate: relative anchor system (bb1) → coords assoluti.
 *
 * Convention pin spec:
 *   "componentId:pinName"
 *
 * Esempi:
 *   "bb1:e7"                      → foro bb fila e colonna 7
 *   "bb1:f10"                     → foro bb fila f colonna 10
 *   "bb1:topPlusRail-col1"        → rail superiore positivo colonna 1
 *   "bb1:topPlusRail-col30"       → rail superiore positivo colonna 30
 *   "bb1:bottomMinusRail-col5"    → rail inferiore negativo colonna 5
 *   "bat1:positive"               → terminal positivo batteria
 *   "bat1:negative"               → terminal negativo batteria
 *   "led1:anode"                  → anodo LED
 *   "led1:cathode"                → catodo LED
 *
 * Coords return assume scena ancorata a bb1.x/bb1.y.
 * Sprint B fase 4 breadboard-calibrator refining queste coordinate.
 *
 * @param {string} pinSpec - "componentId:pinName"
 * @param {object} components - mappa componentId → component spec (bookGeometry.components)
 * @returns {{x: number, y: number} | null} coords assolute o null se irrisolvibile
 */

const BB_HOLE_PITCH = 7.5;        // px per colonna (CLAUDE.md regola immutabile)
const BB_ROW_PITCH = 7.5;          // px per riga
const BB_RAIL_OFFSET_TOP = -15;    // top rail (positivo + negativo) sopra section top
const BB_RAIL_OFFSET_BOTTOM = 85;  // bot rail sotto section bot
const BB_TOP_SECTION_ORIGIN_Y = 0; // riga 'a' offset Y dal bb anchor
const BB_GAP_HEIGHT = 25;          // gap centrale tra section top + bot
const BB_BOTTOM_SECTION_ORIGIN_Y = BB_TOP_SECTION_ORIGIN_Y + 5 * BB_ROW_PITCH + BB_GAP_HEIGHT;

const ROW_LETTER_INDEX = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 0, g: 1, h: 2, i: 3, j: 4 };

/**
 * Risolve foro bb formato "a..j" + colonna 1..30
 * @param {string} pinName - es "e7" o "f10"
 * @returns {{x: number, y: number} | null}
 */
function resolveBreadboardHole(pinName) {
  // Regex foro normale: letter + colonna
  const m = pinName.match(/^([a-j])(\d+)$/i);
  if (!m) return null;
  const row = m[1].toLowerCase();
  const col = parseInt(m[2], 10);
  if (col < 1 || col > 30) return null;
  if (!(row in ROW_LETTER_INDEX)) return null;

  const isTopSection = ['a', 'b', 'c', 'd', 'e'].includes(row);
  const rowIndex = ROW_LETTER_INDEX[row];
  const sectionOriginY = isTopSection ? BB_TOP_SECTION_ORIGIN_Y : BB_BOTTOM_SECTION_ORIGIN_Y;

  return {
    x: (col - 1) * BB_HOLE_PITCH,
    y: sectionOriginY + rowIndex * BB_ROW_PITCH,
  };
}

/**
 * Risolve rail bb formato "topPlusRail-col1" etc
 * @param {string} pinName
 * @returns {{x: number, y: number} | null}
 */
function resolveBreadboardRail(pinName) {
  const m = pinName.match(/^(topPlus|topMinus|bottomPlus|bottomMinus)Rail-col(\d+)$/i);
  if (!m) return null;
  const rail = m[1];
  const col = parseInt(m[2], 10);
  if (col < 1 || col > 30) return null;

  let y;
  switch (rail) {
    case 'topPlus':
      y = BB_RAIL_OFFSET_TOP;
      break;
    case 'topMinus':
      y = BB_RAIL_OFFSET_TOP - BB_ROW_PITCH;
      break;
    case 'bottomPlus':
      y = BB_RAIL_OFFSET_BOTTOM;
      break;
    case 'bottomMinus':
      y = BB_RAIL_OFFSET_BOTTOM + BB_ROW_PITCH;
      break;
    default:
      return null;
  }
  return {
    x: (col - 1) * BB_HOLE_PITCH,
    y,
  };
}

/**
 * Risolve pin generico di componente (battery, LED, etc).
 * Usa offset dichiarati nel component spec se presente.
 * @param {string} pinName
 * @param {object} component - component spec
 * @returns {{x: number, y: number} | null}
 */
function resolveGenericPin(pinName, component) {
  // Se component ha pins esplicit con coords, lookup
  if (component.pins && typeof component.pins === 'object') {
    const pinValue = component.pins[pinName];
    if (typeof pinValue === 'object' && 'x' in pinValue && 'y' in pinValue) {
      return { x: component.x + pinValue.x, y: component.y + pinValue.y };
    }
  }
  // Battery convention: positive top-right, negative bottom-right (clip exits right)
  if (component.type === 'battery9v') {
    if (pinName === 'positive') return { x: component.x + 70, y: component.y + 10 };
    if (pinName === 'negative') return { x: component.x + 70, y: component.y + 30 };
  }
  // LED convention
  if (component.type === 'led' || component.type === 'led-bridge') {
    if (pinName === 'anode') return { x: component.x - 4, y: component.y + 5 };
    if (pinName === 'cathode') return { x: component.x + 4, y: component.y + 5 };
  }
  return null;
}

export function resolveBookPoint(pinSpec, components) {
  if (typeof pinSpec !== 'string' || !pinSpec.includes(':')) return null;
  if (!components || typeof components !== 'object') return null;

  const [compId, ...pinParts] = pinSpec.split(':');
  const pinName = pinParts.join(':');
  const component = components[compId];
  if (!component) return null;

  // Breadboard: try hole then rail
  if (component.type === 'breadboard') {
    const hole = resolveBreadboardHole(pinName);
    if (hole) return { x: component.x + hole.x, y: component.y + hole.y };
    const rail = resolveBreadboardRail(pinName);
    if (rail) return { x: component.x + rail.x, y: component.y + rail.y };
    return null;
  }

  // Other components: generic pin lookup
  return resolveGenericPin(pinName, component);
}

export const __test__ = {
  BB_HOLE_PITCH,
  BB_ROW_PITCH,
  resolveBreadboardHole,
  resolveBreadboardRail,
  resolveGenericPin,
};
