/* Andrea Marro — 02/03/2026 */
/**
 * Placement Engine — Deterministic breadboard placement from semantic intents
 *
 * Separates LLM semantic understanding from spatial computation.
 * The LLM emits [INTENT:{json}] with semantic hints ("near r1", "below"),
 * and this module calculates exact breadboard coordinates + wiring.
 *
 * Entry point: resolvePlacement(intent, circuitSnapshot)
 *
 * © Andrea Marro — 02/03/2026 — ELAB Tutor — Tutti i diritti riservati
 */

import { getComponent } from '../components/registry';
import {
  BB_PITCH, BB_PAD_X, BB_Y_SEC_TOP, BB_Y_SEC_BOT,
  BB_COLS, BB_TOP_ROWS, BB_BOT_ROWS,
  analyzePinLayout, findNearestHole, getHolePixelPosition,
} from '../utils/breadboardSnap';

// ═══════════════════════════════════════════════════════════════
//  KNOWN COMPONENT TYPES (validated against registry)
// ═══════════════════════════════════════════════════════════════
const KNOWN_TYPES = new Set([
  'led', 'resistor', 'capacitor', 'diode', 'buzzer-piezo',
  'push-button', 'potentiometer', 'photo-resistor', 'phototransistor',
  'rgb-led', 'motor-dc', 'mosfet-n', 'reed-switch', 'servo',
  'battery9v', 'multimeter',
]);

// ═══════════════════════════════════════════════════════════════
//  INTENT VALIDATION
// ═══════════════════════════════════════════════════════════════

/**
 * Validate an intent JSON object.
 * @param {Object} intent
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateIntent(intent) {
  const errors = [];

  if (!intent || typeof intent !== 'object') {
    return { valid: false, errors: ['Intent must be a non-null object'] };
  }

  if (!intent.action || typeof intent.action !== 'string') {
    errors.push('Missing or invalid "action" field');
  }

  const validActions = ['place_and_wire', 'place', 'wire', 'remove'];
  if (intent.action && !validActions.includes(intent.action)) {
    errors.push(`Unknown action "${intent.action}". Valid: ${validActions.join(', ')}`);
  }

  if (intent.components) {
    if (!Array.isArray(intent.components)) {
      errors.push('"components" must be an array');
    } else {
      for (let i = 0; i < intent.components.length; i++) {
        const comp = intent.components[i];
        if (!comp.type || typeof comp.type !== 'string') {
          errors.push(`components[${i}]: missing or invalid "type"`);
        } else if (!KNOWN_TYPES.has(comp.type) && !getComponent(comp.type)) {
          errors.push(`components[${i}]: unknown type "${comp.type}"`);
        }
        if (comp.near && typeof comp.near !== 'string') {
          errors.push(`components[${i}]: "near" must be a string component ID`);
        }
        if (comp.relation) {
          const validRelations = ['below', 'above', 'left', 'right', 'next-to'];
          if (!validRelations.includes(comp.relation)) {
            errors.push(`components[${i}]: invalid relation "${comp.relation}". Valid: ${validRelations.join(', ')}`);
          }
        }
        if (comp.section) {
          if (!['top', 'bottom'].includes(comp.section)) {
            errors.push(`components[${i}]: section must be "top" or "bottom"`);
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════
//  OCCUPANCY MAP
// ═══════════════════════════════════════════════════════════════

/**
 * Tracks which breadboard holes are occupied.
 * Built from pinAssignments: { "r1:pin1": "bb1:a2" } → hole "a2" occupied
 */
export class OccupancyMap {
  constructor(pinAssignments = {}) {
    /** @type {Map<string, Set<string>>} bbId → Set of occupied holeIds */
    this._occupied = new Map();
    /** @type {Map<string, string>} "bbId:holeId" → "compId:pinId" (reverse lookup) */
    this._reverseMap = new Map();

    for (const [compPin, bbHole] of Object.entries(pinAssignments)) {
      if (!bbHole || typeof bbHole !== 'string') continue; // null/undefined/non-string = skip
      const [bbId, holeId] = bbHole.split(':');
      if (!bbId || !holeId) continue;

      if (!this._occupied.has(bbId)) this._occupied.set(bbId, new Set());
      this._occupied.get(bbId).add(holeId);
      this._reverseMap.set(`${bbId}:${holeId}`, compPin);
    }
  }

  /**
   * Check if a specific hole is free
   * @param {string} bbId - Breadboard ID (e.g. "bb1")
   * @param {string} holeId - Hole ID (e.g. "a2")
   * @returns {boolean}
   */
  isHoleFree(bbId, holeId) {
    const set = this._occupied.get(bbId);
    return !set || !set.has(holeId);
  }

  /**
   * Check if ALL given holes are free
   * @param {string} bbId
   * @param {string[]} holeIds
   * @returns {boolean}
   */
  areHolesFree(bbId, holeIds) {
    return holeIds.every(id => this.isHoleFree(bbId, id));
  }

  /**
   * Find a free column in a section that has enough consecutive free rows.
   * Scans outward from a preferred start column.
   * @param {string} bbId
   * @param {'top'|'bot'} section
   * @param {number} requiredRows - How many rows the component needs
   * @param {number} startCol - Preferred column (0-based)
   * @param {number} [maxDistance=15] - Max columns to search in each direction
   * @returns {number|null} - Free column index (0-based) or null
   */
  findFreeColumn(bbId, section, requiredRows, startCol, maxDistance = 15) {
    const rows = section === 'top' ? BB_TOP_ROWS : BB_BOT_ROWS;

    // Scan outward from startCol: 0, +1, -1, +2, -2, ...
    for (let offset = 0; offset <= maxDistance; offset++) {
      for (const dir of offset === 0 ? [0] : [1, -1]) {
        const col = startCol + offset * dir;
        if (col < 0 || col >= BB_COLS) continue;

        const holeIds = [];
        for (let r = 0; r < requiredRows && r < rows.length; r++) {
          holeIds.push(`${rows[r]}${col + 1}`);
        }

        if (this.areHolesFree(bbId, holeIds)) {
          return col;
        }
      }
    }

    return null;
  }

  /**
   * Find a free column that spans ACROSS the gap (top e + bottom f)
   * for components that need gap crossing (e.g. ICs, tall components).
   * @param {string} bbId
   * @param {number} requiredTopRows - Rows needed in top section (from bottom, e.g. row e)
   * @param {number} requiredBotRows - Rows needed in bottom section (from top, e.g. row f)
   * @param {number} startCol
   * @returns {number|null}
   */
  findFreeGapColumn(bbId, requiredTopRows, requiredBotRows, startCol) {
    for (let offset = 0; offset <= 15; offset++) {
      for (const dir of offset === 0 ? [0] : [1, -1]) {
        const col = startCol + offset * dir;
        if (col < 0 || col >= BB_COLS) continue;

        const holeIds = [];
        // Top section rows from bottom (e, d, c, ...)
        for (let r = 0; r < requiredTopRows; r++) {
          const rowIdx = BB_TOP_ROWS.length - 1 - r; // e=4, d=3, c=2, ...
          if (rowIdx < 0) break;
          holeIds.push(`${BB_TOP_ROWS[rowIdx]}${col + 1}`);
        }
        // Bottom section rows from top (f, g, h, ...)
        for (let r = 0; r < requiredBotRows; r++) {
          if (r >= BB_BOT_ROWS.length) break;
          holeIds.push(`${BB_BOT_ROWS[r]}${col + 1}`);
        }

        if (this.areHolesFree(bbId, holeIds)) {
          return col;
        }
      }
    }
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    return null;
  }

  /**
   * Mark holes as occupied (after successful placement)
   * @param {string} bbId
   * @param {Object} pinAssignments - { "comp:pin": "bb:hole" }
   */
  markOccupied(pinAssignments) {
    for (const [compPin, bbHole] of Object.entries(pinAssignments)) {
      if (!bbHole) continue;
      const [bbId, holeId] = bbHole.split(':');
      if (!bbId || !holeId) continue;
      if (!this._occupied.has(bbId)) this._occupied.set(bbId, new Set());
      this._occupied.get(bbId).add(holeId);
      this._reverseMap.set(`${bbId}:${holeId}`, compPin);
    }
  }

  /**
   * Get component occupying a hole (reverse lookup)
   * @param {string} bbId
   * @param {string} holeId
   * @returns {string|null} "componentId:pinId" or null
   */
  getOccupant(bbId, holeId) {
    return this._reverseMap.get(`${bbId}:${holeId}`) || null;
  }

  /**
   * Get all occupied holes for a breadboard
   * @param {string} bbId
   * @returns {Set<string>}
   */
  getOccupiedHoles(bbId) {
    return this._occupied.get(bbId) || new Set();
  }
}

// ═══════════════════════════════════════════════════════════════
//  RELATION RESOLVER — "near r1", "below", "right of" etc.
// ═══════════════════════════════════════════════════════════════

/**
 * Find the breadboard position of a reference component.
 * @param {string} refCompId - e.g. "r1"
 * @param {Object} pinAssignments - e.g. { "r1:pin1": "bb1:a5", "r1:pin2": "bb1:a8" }
 * @returns {{ bbId: string, col: number, section: 'top'|'bot', rowIdx: number }|null}
 */
function findComponentPosition(refCompId, pinAssignments) {
  const prefix = `${refCompId}:`;
  const entries = Object.entries(pinAssignments)
    .filter(([k, v]) => k.startsWith(prefix) && v && v !== null);

  if (entries.length === 0) return null;

  // Use first pin as anchor
  const [, bbHole] = entries[0];
  const [bbId, holeId] = bbHole.split(':');
  if (!bbId || !holeId) return null;

  const row = holeId[0].toLowerCase();
  const col = parseInt(holeId.slice(1), 10) - 1; // 0-based

  let section = 'top';
  let rowIdx = BB_TOP_ROWS.indexOf(row);
  if (rowIdx === -1) {
    section = 'bot';
    rowIdx = BB_BOT_ROWS.indexOf(row);
  }

  // Also compute the column span (max col across all pins)
  let maxCol = col;
  let minCol = col;
  for (const [, v] of entries) {
    const c = parseInt(v.split(':')[1]?.slice(1), 10) - 1;
    if (!isNaN(c)) {
      maxCol = Math.max(maxCol, c);
      minCol = Math.min(minCol, c);
    }
  }

  return { bbId, col, minCol, maxCol, section, rowIdx };
}

/**
 * Resolve relation hints into a preferred column + section.
 * @param {Object} compIntent - { near, relation, section }
 * @param {Object} pinAssignments
 * @returns {{ bbId: string, preferredCol: number, section: 'top'|'bot' }}
 */
function resolveRelation(compIntent, pinAssignments) {
  const defaults = { bbId: 'bb1', preferredCol: 5, section: 'top' };

  if (!compIntent.near) {
    // No reference component — use default or section hint
    if (compIntent.section === 'bottom') defaults.section = 'bot';
    return defaults;
  }

  const refPos = findComponentPosition(compIntent.near, pinAssignments);
  if (!refPos) {
    // Reference component not found on breadboard — fall back to default
    return defaults;
  }

  let preferredCol = refPos.col;
  let section = refPos.section;

  switch (compIntent.relation) {
    case 'right':
      preferredCol = refPos.maxCol + 2; // 1 column gap
      break;
    case 'left':
      preferredCol = refPos.minCol - 2;
      // If left would put us at/past column 0 and there's no room,
      // the findFreeColumn scan will naturally search rightward as fallback
      break;
    case 'below':
      // Same column, opposite section
      section = refPos.section === 'top' ? 'bot' : 'top';
      break;
    case 'above':
      section = refPos.section === 'bot' ? 'top' : 'bot';
      break;
    case 'next-to':
    default:
      // Adjacent column (right side preferred)
      preferredCol = refPos.maxCol + 2;
      break;
  }

  // Override section if explicitly requested
  if (compIntent.section === 'top') section = 'top';
  if (compIntent.section === 'bottom') section = 'bot';

  // Clamp column to valid range
  preferredCol = Math.max(0, Math.min(BB_COLS - 1, preferredCol));

  return { bbId: refPos.bbId, preferredCol, section };
}

// ═══════════════════════════════════════════════════════════════
//  COMPONENT PLACEMENT
// ═══════════════════════════════════════════════════════════════

function getUsablePins(pins = []) {
  return pins.filter(pin =>
    pin
    && typeof pin.id === 'string'
    && Number.isFinite(pin.x)
    && Number.isFinite(pin.y)
  );
}

function placeVisualOnlyComponent(compIntent, bbId, preferredCol, section, snapshot) {
  const bbPos = snapshot.layout?.[bbId] || { x: 0, y: 0 };
  const sectionY = section === 'top' ? BB_Y_SEC_TOP : BB_Y_SEC_BOT;
  const anchorRowIdx = 2;
  const x = bbPos.x + BB_PAD_X + preferredCol * BB_PITCH + BB_PITCH / 2;
  const y = bbPos.y + sectionY + anchorRowIdx * BB_PITCH + BB_PITCH / 2;

  return {
    success: true,
    x,
    y,
    pinAssignments: {},
    bbId,
    pinless: true,
    componentType: compIntent.type,
  };
}

/**
 * Place a single component on the breadboard.
 * @param {Object} compIntent - { type, near, relation, section, color, value }
 * @param {string} compId - Generated component ID
 * @param {OccupancyMap} occupancy
 * @param {Object} snapshot - { pinAssignments, layout }
 * @returns {{ success: boolean, x: number, y: number, pinAssignments: Object, error?: string }}
 */
export function placeComponent(compIntent, compId, occupancy, snapshot) {
  const registered = getComponent(compIntent.type);
  if (!registered) {
    return { success: false, error: `Unknown component type: ${compIntent.type}` };
  }

  // Resolve where to place relative to reference component
  const { bbId, preferredCol, section } = resolveRelation(compIntent, snapshot.pinAssignments || {});

  const pins = getUsablePins(registered.pins);
  if (pins.length < 2) {
    if (!KNOWN_TYPES.has(compIntent.type)) {
      return { success: false, error: `pinless component type without ELAB placement fallback: ${compIntent.type}` };
    }
    return placeVisualOnlyComponent(compIntent, bbId, preferredCol, section, snapshot);
  }

  const { orientation, pinSpans } = analyzePinLayout(pins);

  // Get breadboard position in SVG space
  const bbPos = snapshot.layout?.[bbId] || { x: 0, y: 0 };

  const sectionY = section === 'top' ? BB_Y_SEC_TOP : BB_Y_SEC_BOT;
  const rowLabels = section === 'top' ? BB_TOP_ROWS : BB_BOT_ROWS;

  if (orientation === 'horizontal') {
    // Component spans multiple columns on the same row
    const requiredCols = pinSpans.length > 0 ?
      Math.max(...pinSpans.map(p => p.offset)) + 1 : 1;

    // Pick a row (default: middle of section)
    const anchorRowIdx = 2; // row c (top) or h (bot)
    const anchorRow = rowLabels[anchorRowIdx];

    // Find a free column range — scan outward from preferred, checking ALL required columns
    let startCol = null;
    for (let offset = 0; offset <= 15; offset++) {
      for (const dir of offset === 0 ? [0] : [1, -1]) {
        const candidateStart = preferredCol + offset * dir;
        const candidateEnd = candidateStart + requiredCols - 1;
        if (candidateStart < 0 || candidateEnd >= BB_COLS) continue;

        // Check ALL columns in the span are free on the anchor row
        const holeIds = [];
        for (let c = candidateStart; c <= candidateEnd; c++) {
          holeIds.push(`${anchorRow}${c + 1}`);
        }
        if (occupancy.areHolesFree(bbId, holeIds)) {
          startCol = candidateStart;
          break;
        }
      }
      if (startCol !== null) break;
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
    }

    if (startCol === null) {
      return { success: false, error: `No free column range on ${section} section for ${compIntent.type} (needs ${requiredCols} columns)` };
    }

    const pinAssignments = {};
    const holePositions = [];

    for (const ps of pinSpans) {
      const col = startCol + ps.offset;
      const holeId = `${anchorRow}${col + 1}`;
      const holeCx = BB_PAD_X + col * BB_PITCH + BB_PITCH / 2;
      const holeCy = sectionY + anchorRowIdx * BB_PITCH + BB_PITCH / 2;
      pinAssignments[`${compId}:${ps.id}`] = `${bbId}:${holeId}`;
      holePositions.push({ cx: holeCx, cy: holeCy, pinId: ps.id });
    }

    // Compute SVG position
    const firstPin = pins.find(p => p.id === holePositions[0]?.pinId);
    if (!firstPin) return { success: false, error: 'Cannot resolve first pin position' };

    const x = bbPos.x + holePositions[0].cx - firstPin.x;
    const y = bbPos.y + holePositions[0].cy - firstPin.y;

    return { success: true, x, y, pinAssignments, bbId };

  } else {
    // Vertical: component spans multiple rows in the same column
    const requiredRows = pinSpans.length > 0 ?
      Math.max(...pinSpans.map(p => p.offset)) + 1 : 1;

    // Check if component needs gap crossing (more rows than available in one section)
    const needsGapCross = requiredRows > 5;

    let anchorCol;
    if (needsGapCross) {
      // Find a column that's free across the gap
      const topRows = Math.min(requiredRows, 5);
      const botRows = requiredRows - topRows;
      anchorCol = occupancy.findFreeGapColumn(bbId, topRows, botRows, preferredCol);
    } else {
      anchorCol = occupancy.findFreeColumn(bbId, section, requiredRows, preferredCol);
    }

    if (anchorCol === null) {
      return { success: false, error: `No free space for ${compIntent.type} (needs ${requiredRows} rows)` };
    }

    const pinAssignments = {};
    const holePositions = [];

    // Anchor row: for vertical components, start from the first row of the section
    const anchorRowIdx = 0;

    for (const ps of pinSpans) {
      let rowIdx = anchorRowIdx + ps.offset;
      let actualSection = section;
      let actualSectionY = sectionY;
      let actualRowLabels = rowLabels;

      // Handle gap crossing (bidirectional)
      if (rowIdx >= 5 && section === 'top') {
        // Top → Bottom gap crossing
        rowIdx -= 5;
        actualSection = 'bot';
        actualSectionY = BB_Y_SEC_BOT;
        actualRowLabels = BB_BOT_ROWS;
      } else if (rowIdx >= 5 && section === 'bot') {
        // Bottom section overflow → wrap to top (bot→top crossing)
        rowIdx -= 5;
        actualSection = 'top';
        actualSectionY = BB_Y_SEC_TOP;
        actualRowLabels = BB_TOP_ROWS;
      } else if (rowIdx >= 5) {
        return { success: false, error: 'Component exceeds breadboard bounds' };
      }

      const holeId = `${actualRowLabels[rowIdx]}${anchorCol + 1}`;
      const holeCx = BB_PAD_X + anchorCol * BB_PITCH + BB_PITCH / 2;
      const holeCy = actualSectionY + rowIdx * BB_PITCH + BB_PITCH / 2;
      pinAssignments[`${compId}:${ps.id}`] = `${bbId}:${holeId}`;
      holePositions.push({ cx: holeCx, cy: holeCy, pinId: ps.id });
    }

    const firstPin = pins.find(p => p.id === holePositions[0]?.pinId);
    if (!firstPin) return { success: false, error: 'Cannot resolve first pin position' };

    const x = bbPos.x + holePositions[0].cx - firstPin.x;
    const y = bbPos.y + holePositions[0].cy - firstPin.y;

    return { success: true, x, y, pinAssignments, bbId };
  }
}

// ═══════════════════════════════════════════════════════════════
//  AUTO-WIRING
// ═══════════════════════════════════════════════════════════════

/**
 * Wiring templates by component type.
 * Each template defines typical wiring patterns.
 */
// S73 FIX-4: Complete wiring templates for ALL 14 component types
const WIRING_TEMPLATES = {
  led: {
    patterns: [
      { pin: 'anode', connectTo: 'signal' },
      { pin: 'cathode', connectTo: 'bus-minus' },
    ],
  },
  resistor: {
    patterns: [
      { pin: 'pin1', connectTo: 'signal-in' },
      { pin: 'pin2', connectTo: 'signal-out' },
    ],
  },
  'push-button': {
    patterns: [
      { pin: 'pin1', connectTo: 'signal' },
      { pin: 'pin2', connectTo: 'bus-minus' },
    ],
  },
  'buzzer-piezo': {
    patterns: [
      { pin: 'positive', connectTo: 'signal' },
      { pin: 'negative', connectTo: 'bus-minus' },
    ],
  },
  capacitor: {
    patterns: [
      { pin: 'positive', connectTo: 'signal' },
      { pin: 'negative', connectTo: 'bus-minus' },
    ],
  },
  potentiometer: {
    patterns: [
      { pin: 'vcc', connectTo: 'bus-plus' },
      { pin: 'gnd', connectTo: 'bus-minus' },
      { pin: 'signal', connectTo: 'signal' },  // analog pin
    ],
  },
  'photo-resistor': {
    patterns: [
      { pin: 'pin1', connectTo: 'bus-plus' },
      { pin: 'pin2', connectTo: 'signal' },  // voltage divider mid-point
    ],
  },
  diode: {
    patterns: [
      { pin: 'anode', connectTo: 'signal' },
      { pin: 'cathode', connectTo: 'bus-minus' },
    ],
  },
  'mosfet-n': {
    patterns: [
      { pin: 'gate', connectTo: 'signal' },
      { pin: 'source', connectTo: 'bus-minus' },
      { pin: 'drain', connectTo: 'signal-out' },  // load side
    ],
  },
  'rgb-led': {
    patterns: [
      { pin: 'common', connectTo: 'bus-minus' },  // common cathode
      { pin: 'red', connectTo: 'signal' },
      { pin: 'green', connectTo: 'signal' },
      { pin: 'blue', connectTo: 'signal' },
    ],
  },
  'motor-dc': {
    patterns: [
      { pin: 'positive', connectTo: 'signal' },
      { pin: 'negative', connectTo: 'bus-minus' },
    ],
  },
  servo: {
    patterns: [
      { pin: 'vcc', connectTo: 'bus-plus' },
      { pin: 'gnd', connectTo: 'bus-minus' },
      { pin: 'signal', connectTo: 'signal' },
    ],
  },
  'reed-switch': {
    patterns: [
      { pin: 'pin1', connectTo: 'signal' },
      { pin: 'pin2', connectTo: 'bus-minus' },
    ],
  },
  phototransistor: {
    patterns: [
      { pin: 'collector', connectTo: 'bus-plus' },
      { pin: 'emitter', connectTo: 'signal' },  // connects to signal/analog read point
    ],
  },
  battery9v: {
    patterns: [
      { pin: 'positive', connectTo: 'bus-plus' },
      { pin: 'negative', connectTo: 'bus-minus' },
    ],
  },
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
};

/**
 * Generate auto-wiring for a placed component.
 * Connects to power buses and nearby signal paths.
 *
 * @param {Object} compIntent - { type, connectTo }
 * @param {string} compId - Component ID
 * @param {Object} newPinAssignments - Pin assignments from placeComponent
 * @param {string} bbId - Breadboard ID
 * @param {Object} snapshot - Circuit snapshot
 * @returns {Array<{from: string, to: string, color?: string}>} Wire definitions
 */
export function resolveAutoWiring(compIntent, compId, newPinAssignments, bbId, snapshot) {
  const wires = [];
  const existingConnections = snapshot.connections || [];

  // Helper: check if a wire already exists
  const wireExists = (from, to) => {
    return existingConnections.some(c =>
      (c.from === from && c.to === to) || (c.from === to && c.to === from)
    );
  };

  // Helper: find the GND bus hole in the same column
  const findBusHole = (holeId, busType) => {
    const col = parseInt(holeId.slice(1), 10);
    // Bus naming: "bus-bot-plus" / "bus-bot-minus" / "bus-top-plus" / "bus-top-minus"
    const row = holeId[0].toLowerCase();
    const isBot = BB_BOT_ROWS.includes(row);
    const busPrefix = isBot ? 'bus-bot' : 'bus-top';
    return `${bbId}:${busPrefix}-${busType === 'gnd' ? 'minus' : 'plus'}`;
  };

  // If component specifies an Arduino pin to connect to
  if (compIntent.connectTo) {
    // Find the "signal" pin of this component
    const registered = getComponent(compIntent.type);
    if (registered?.pins) {
      const signalPin = registered.pins.find(p =>
        ['anode', 'positive', 'pin1', 'signal', 'vcc', 'emitter', 'gate', 'collector'].includes(p.id)
      );
      if (signalPin) {
        const compPinRef = `${compId}:${signalPin.id}`;
        const arduinoPin = compIntent.connectTo; // e.g. "W_D3"

        // Find Arduino component ID in snapshot
        const arduinoComp = (snapshot.components || []).find(c =>
          c.type === 'nano-r4-board' || c.type === 'arduino-nano'
        );
        if (arduinoComp) {
          const from = `${arduinoComp.id}:${arduinoPin}`;
          const to = compPinRef;
          if (!wireExists(from, to)) {
            wires.push({ from, to, color: '#22B14C' }); // green signal wire
          }
        }
      }
    }
  }

  // Auto-connect GND pin to bus minus
  const template = WIRING_TEMPLATES[compIntent.type];
  if (template) {
    for (const pattern of template.patterns) {
      if (pattern.connectTo === 'bus-minus') {
        const pinRef = `${compId}:${pattern.pin}`;
        const bbHole = newPinAssignments[pinRef];
        if (bbHole) {
          const holeId = bbHole.split(':')[1];
          if (holeId) {
            const busRef = findBusHole(holeId, 'gnd');
            if (!wireExists(pinRef, busRef)) {
              wires.push({ from: pinRef, to: busRef, color: '#1B1B1B' }); // black GND wire
            }
          }
        }
      }
    }
  }

  // Auto-detect gap crossing need
  // If one pin is in top section and another in bottom, add bridge wire
  const pinHoles = Object.entries(newPinAssignments);
  let hasTop = false, hasBot = false;
  for (const [, bbHole] of pinHoles) {
    const holeId = bbHole.split(':')[1];
    if (!holeId) continue;
    const row = holeId[0].toLowerCase();
    if (BB_TOP_ROWS.includes(row)) hasTop = true;
    if (BB_BOT_ROWS.includes(row)) hasBot = true;
  }

  // If component spans the gap, we DON'T need a bridge wire — it IS the bridge
  // Bridge wires are only needed for separate components that need to connect across

  return wires;
}

// ═══════════════════════════════════════════════════════════════
//  ACTION GENERATOR — produces [AZIONE:...] tag strings
// ═══════════════════════════════════════════════════════════════

/**
 * Generate an AZIONE tag string for adding a component.
 * @param {string} type
 * @param {number} x - SVG X position
 * @param {number} y - SVG Y position
 * @returns {string}
 */
function generateAddComponentTag(type, x, y) {
  return `[AZIONE:addcomponent:${type}:${Math.round(x)}:${Math.round(y)}]`;
}

/**
 * Generate an AZIONE tag string for adding a wire.
 * @param {string} from - "compId:pin"
 * @param {string} to - "compId:pin"
 * @param {string} [color]
 * @returns {string}
 */
function generateAddWireTag(from, to, color) {
  if (color) {
    return `[AZIONE:addwire:${from}:${to}:${color}]`;
  }
  return `[AZIONE:addwire:${from}:${to}]`;
}

// ═══════════════════════════════════════════════════════════════
//  MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════

/**
 * Resolve a semantic placement intent into concrete AZIONE tags.
 *
 * @param {Object} intent - Parsed JSON from [INTENT:{...}]
 * @param {Object} circuitSnapshot - {
 *   components: Array, connections: Array, layout: Object, pinAssignments: Object
 * }
 * @returns {{
 *   success: boolean,
 *   actions: Array<{type: string, tag: string, pinAssignments?: Object}>,
 *   errors: string[],
 *   debug: Object
 * }}
 */
export function resolvePlacement(intent, circuitSnapshot) {
  const debug = { startTime: Date.now(), steps: [] };
  const errors = [];
  const actions = [];

  // 1. Validate intent
  const validation = validateIntent(intent);
  if (!validation.valid) {
    return { success: false, actions: [], errors: validation.errors, debug };
  }
  debug.steps.push('validated');

  // 2. Build occupancy map
  const occupancy = new OccupancyMap(circuitSnapshot.pinAssignments || {});
  debug.steps.push(`occupancy built: ${occupancy.getOccupiedHoles('bb1')?.size || 0} holes occupied on bb1`);

  // 3. Process each component in the intent
  const components = intent.components || [];
  let componentCounter = 0;

  for (const compIntent of components) {
    componentCounter++;
    const compId = `pe_${compIntent.type.replace(/[^a-z0-9]/gi, '').slice(0, 4)}_${componentCounter}`;

    // Place the component
    const placement = placeComponent(compIntent, compId, occupancy, circuitSnapshot);

    if (!placement.success) {
      errors.push(`Failed to place ${compIntent.type}: ${placement.error}`);
      debug.steps.push(`FAIL: ${compIntent.type} — ${placement.error}`);
      continue;
    }

    debug.steps.push(`placed ${compIntent.type} at (${Math.round(placement.x)}, ${Math.round(placement.y)})`);

    // Generate addcomponent AZIONE tag
    actions.push({
      type: 'addcomponent',
      tag: generateAddComponentTag(compIntent.type, placement.x, placement.y),
      pinAssignments: placement.pinAssignments,
      componentId: compId,
    });

    // Mark holes as occupied for subsequent placements
    occupancy.markOccupied(placement.pinAssignments);

    // Generate auto-wiring if requested
    if (intent.wires === 'auto' || intent.action === 'place_and_wire') {
      const wires = resolveAutoWiring(
        compIntent, compId, placement.pinAssignments,
        placement.bbId, circuitSnapshot
      );

      for (const wire of wires) {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        actions.push({
          type: 'addwire',
          tag: generateAddWireTag(wire.from, wire.to, wire.color),
        });
        debug.steps.push(`wire: ${wire.from} → ${wire.to}`);
      }
    }
  }

  debug.totalTime = Date.now() - debug.startTime;

  return {
    success: actions.length > 0, // partial success: place what we can, report errors separately
    actions,
    errors,
    debug,
  };
}
