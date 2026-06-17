/**
 * Auto-placement engine for UNLIM Onnipotente
 * Finds an empty breadboard position for new components added via voice/AI.
 *
 * Strategy:
 *  1. Scan breadboard columns left→right, starting from col 1 (leave col 0 for wires)
 *  2. For each candidate column, check if any existing pinAssignment uses that column range
 *  3. Return the SVG coordinate of the first free column
 *
 * Component column widths (number of breadboard columns occupied):
 *  - resistor, diode, led, capacitor, rgb-led: 2 cols (pins span ~7 holes = 7 cols but physical component ~2)
 *  - pushbutton: 3 cols
 *  - potentiometer: 3 cols
 *  - buzzer, motor-dc, photoresistor, ldr: 2 cols
 *  - servo: 3 cols
 *
 * © Andrea Marro — 31/03/2026 — ELAB Tutor
 */

// BreadboardHalf geometry (matches breadboardSnap.js constants)
const BB_PITCH = 7.5;
const BB_PAD_X = 14;
const BB_PAD_Y = 10;
const BB_BUS_H = 7.5;
const BB_BUS_GAP = 5;
const BB_Y_SEC_TOP = BB_PAD_Y + BB_BUS_H * 2 + BB_BUS_GAP; // 30 — row 'a' top section
const BB_COLS = 30;

/** Number of breadboard columns each component type occupies */
const COMP_COLUMN_WIDTHS = {
  'resistor': 7,
  'diode': 7,
  'led': 2,
  'rgb-led': 3,
  'capacitor': 2,
  'pushbutton': 3,
  'potentiometer': 3,
  'buzzer': 3,
  'motor-dc': 4,
  'photoresistor': 3,
  'ldr': 3,
  'servo': 3,
  'transistor': 3,
  'mosfet-n': 3,
  'reed-switch': 3,
};

const DEFAULT_COL_WIDTH = 4;

/**
 * Get the column numbers (0-based) occupied by an existing pin assignment entry.
 * Pin assignment keys look like "r1:pin1" → "bb1:a5" → column index = 4 (5-1)
 * @param {Object} pinAssignments - { "r1:pin1": "bb1:a5", ... }
 * @returns {Set<number>} set of occupied column indices
 */
function getOccupiedColumns(pinAssignments) {
  const occupied = new Set();
  for (const val of Object.values(pinAssignments || {})) {
    // val format: "bb1:a5" or "bb1:bus-top-plus-3"
    const holeId = val.split(':')[1]; // e.g. "a5"
    if (!holeId) continue;
    const match = holeId.match(/[a-j](\d+)/);
    if (match) {
      occupied.add(parseInt(match[1], 10) - 1); // convert to 0-based col index
    }
  }
  return occupied;
}

/**
 * Find the best SVG drop position for a new component on a breadboard.
 * Returns { x, y } in SVG coordinates, relative to the SVG origin (NOT the breadboard).
 *
 * @param {string} componentType - e.g. 'led', 'resistor'
 * @param {Object} pinAssignments - current pinAssignments from mergedExperiment
 * @param {{ x: number, y: number }} bbPos - breadboard position in SVG coords
 * @returns {{ x: number, y: number }} - SVG coordinate to drop the component
 */
export function findBestPosition(componentType, pinAssignments, bbPos) {
  const colWidth = COMP_COLUMN_WIDTHS[componentType] || DEFAULT_COL_WIDTH;
  const occupied = getOccupiedColumns(pinAssignments);

  // Scan columns left-to-right, trying to find a run of `colWidth` free columns
  for (let startCol = 1; startCol <= BB_COLS - colWidth; startCol++) {
    let free = true;
    for (let c = startCol; c < startCol + colWidth; c++) {
      if (occupied.has(c)) { free = false; break; }
    }
    if (free) {
      // Convert breadboard column to SVG X coordinate
      const localX = BB_PAD_X + (startCol + Math.floor(colWidth / 2)) * BB_PITCH;
      // Use middle of top section for Y
      const localY = BB_Y_SEC_TOP + BB_PITCH; // row 'b' (middle of top section)
      return {
        x: (bbPos?.x || 0) + localX,
        y: (bbPos?.y || 0) + localY,
      };
    }
  }

  // Fallback: right of the breadboard, a bit below
  return {
    x: (bbPos?.x || 0) + 280,
    y: (bbPos?.y || 0) + 60,
  };
}

/**
 * Find the best position using experiment layout data.
 * Convenience wrapper for use from simulator-api / voice commands.
 *
 * @param {string} componentType
 * @param {Object} mergedExperiment - current merged experiment from simulator
 * @returns {{ x: number, y: number }}
 */
export function findBestPositionInExperiment(componentType, mergedExperiment) {
  if (!mergedExperiment) return { x: 200, y: 150 };

  // Find first breadboard in the experiment
  const bb = (mergedExperiment.components || []).find(
    c => c.type === 'breadboard-half' || c.type === 'breadboard-full'
  );

  if (!bb) {
    // No breadboard — place in an open area, offset from existing components
    const comps = mergedExperiment.components || [];
    const maxX = Math.max(...comps.map(c => (mergedExperiment.layout?.[c.id]?.x || 0) + 60), 100);
    return { x: maxX + 30, y: 150 };
  }

  const bbPos = mergedExperiment.layout?.[bb.id] || { x: 0, y: 0 };
  const pinAssignments = {
    ...(mergedExperiment.pinAssignments || {}),
    ...(mergedExperiment.customPinAssignments || {}),
  };

  return findBestPosition(componentType, pinAssignments, bbPos);
}
