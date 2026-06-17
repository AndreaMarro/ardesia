/* Andrea Marro — 12/02/2026 */
/**
 * Breadboard Auto-Assignment — Computes pin-to-hole mappings when
 * components are dropped on a breadboard (Tinkercad-style snap).
 * Extracted from NewElabSimulator.jsx
 *
 * Exports:
 *   computeAutoPinAssignment(compId, compType, dropX, dropY, bbId, bbPos)
 *   generateComponentId(type)
 *   analyzePinLayout(pins)          — re-exported for PlacementEngine
 *   BB geometry constants            — re-exported for PlacementEngine
 *   findNearestHole(lx, ly)          — re-exported for PlacementEngine
 *   getHolePixelPosition(holeId)     — converts hole ID to local pixel coords
 */

import { getComponent } from '../components/registry';

// BreadboardHalf geometry constants (default for backward compat)
const BB_PITCH = 7.5;
const BB_PAD_X = 14;
const BB_PAD_Y_CONST = 10;
const BB_BUS_H = 7.5;
const BB_BUS_GAP = 5;
const BB_SECTION_H = 5 * BB_PITCH; // 37.5
const BB_GAP_H = 10;
const BB_Y_SEC_TOP = BB_PAD_Y_CONST + BB_BUS_H * 2 + BB_BUS_GAP; // 30
const BB_Y_SEC_BOT = BB_Y_SEC_TOP + BB_SECTION_H + BB_GAP_H;     // 77.5
const BB_COLS = 30;
const BB_TOP_ROWS = ['a','b','c','d','e'];
const BB_BOT_ROWS = ['f','g','h','i','j'];
const BB_SNAP_RADIUS = BB_PITCH * 4; // max distance — increased from 3x to 4x for iPad touch precision

// S112: BreadboardFull geometry (vertical layout, 63 rows × 5+5 cols)
const BBF_HOLE_SPACING = 7;
const BBF_ROWS = 63;
const BBF_BOARD_PADDING = 8;
const BBF_BUS_OFFSET = 6;
const BBF_MAIN_OFFSET_X = 14;
const BBF_GAP = 10;
const BBF_COLS_PER_SIDE = 5;
const BBF_SECTION_LEFT_X = BBF_BOARD_PADDING + BBF_MAIN_OFFSET_X; // 22
const BBF_SECTION_RIGHT_X = BBF_SECTION_LEFT_X + BBF_COLS_PER_SIDE * BBF_HOLE_SPACING + BBF_GAP; // 67
const BBF_BUS_PAD_LEFT = 2;
const BBF_BUS_COL_W = 7;
const BBF_BUS_PLUS_X = BBF_BOARD_PADDING + BBF_BUS_PAD_LEFT; // 10
const BBF_BUS_MINUS_X = BBF_BOARD_PADDING + BBF_BUS_PAD_LEFT + BBF_BUS_COL_W; // 17
const BBF_LEFT_LABELS = ['a','b','c','d','e'];
const BBF_RIGHT_LABELS = ['f','g','h','i','j'];
const BBF_SNAP_RADIUS = BBF_HOLE_SPACING * 4;

/**
 * Convert SVG-absolute coords to breadboard-local coords
 */
function svgToBBLocal(svgX, svgY, bbX, bbY) {
  return { lx: svgX - bbX, ly: svgY - bbY };
}

/**
 * Find the nearest hole to a local position on a BreadboardHalf.
 * Returns { row, col, holeId, cx, cy, section } or null if outside board.
 */
export function findNearestHole(lx, ly) {
  let best = null;
  let bestDist = Infinity;

  // Top section (a-e)
  for (let r = 0; r < 5; r++) {
    const cy = BB_Y_SEC_TOP + r * BB_PITCH + BB_PITCH / 2;
    for (let c = 0; c < BB_COLS; c++) {
      const cx = BB_PAD_X + c * BB_PITCH + BB_PITCH / 2;
      const d = Math.hypot(lx - cx, ly - cy);
      if (d < bestDist) {
        bestDist = d;
        best = { row: BB_TOP_ROWS[r], rowIdx: r, col: c, holeId: `${BB_TOP_ROWS[r]}${c + 1}`, cx, cy, section: 'top' };
      }
    }
  }

  // Bottom section (f-j)
  for (let r = 0; r < 5; r++) {
    const cy = BB_Y_SEC_BOT + r * BB_PITCH + BB_PITCH / 2;
    for (let c = 0; c < BB_COLS; c++) {
      const cx = BB_PAD_X + c * BB_PITCH + BB_PITCH / 2;
      const d = Math.hypot(lx - cx, ly - cy);
      if (d < bestDist) {
        bestDist = d;
        best = { row: BB_BOT_ROWS[r], rowIdx: r, col: c, holeId: `${BB_BOT_ROWS[r]}${c + 1}`, cx, cy, section: 'bot' };
      }
    }
  }

  if (bestDist > BB_SNAP_RADIUS) return null;
  return best;
}

/**
 * S112: Find the nearest hole on a BreadboardFull (vertical layout, 63 rows × 5+5 cols + bus).
 * Returns { row, col, holeId, cx, cy, section } or null if outside board.
 */
export function findNearestHoleFull(lx, ly) {
  let best = null;
  let bestDist = Infinity;
  const yStart = BBF_BOARD_PADDING + BBF_BUS_OFFSET; // 14

  // Left section (a-e): 5 columns × 63 rows
  for (let c = 0; c < BBF_COLS_PER_SIDE; c++) {
    const cx = BBF_SECTION_LEFT_X + c * BBF_HOLE_SPACING;
    for (let r = 0; r < BBF_ROWS; r++) {
      const cy = yStart + r * BBF_HOLE_SPACING;
      const d = Math.hypot(lx - cx, ly - cy);
      if (d < bestDist) {
        bestDist = d;
        best = { row: BBF_LEFT_LABELS[c], rowIdx: c, col: r, holeId: `${BBF_LEFT_LABELS[c]}${r + 1}`, cx, cy, section: 'left' };
      }
    }
  }

  // Right section (f-j): 5 columns × 63 rows
  for (let c = 0; c < BBF_COLS_PER_SIDE; c++) {
    const cx = BBF_SECTION_RIGHT_X + c * BBF_HOLE_SPACING;
    for (let r = 0; r < BBF_ROWS; r++) {
      const cy = yStart + r * BBF_HOLE_SPACING;
      const d = Math.hypot(lx - cx, ly - cy);
      if (d < bestDist) {
        bestDist = d;
        best = { row: BBF_RIGHT_LABELS[c], rowIdx: c, col: r, holeId: `${BBF_RIGHT_LABELS[c]}${r + 1}`, cx, cy, section: 'right' };
      }
    }
  }

  // Bus columns (plus and minus): 63 rows each
  for (let r = 0; r < BBF_ROWS; r++) {
    const cy = yStart + r * BBF_HOLE_SPACING;
    // Plus bus
    const dplu = Math.hypot(lx - BBF_BUS_PLUS_X, ly - cy);
    if (dplu < bestDist) {
      bestDist = dplu;
      best = { row: 'bus-plus', rowIdx: 0, col: r, holeId: `bus-plus-${r + 1}`, cx: BBF_BUS_PLUS_X, cy, section: 'bus' };
    }
    // Minus bus
    const dmin = Math.hypot(lx - BBF_BUS_MINUS_X, ly - cy);
    if (dmin < bestDist) {
      bestDist = dmin;
      best = { row: 'bus-minus', rowIdx: 0, col: r, holeId: `bus-minus-${r + 1}`, cx: BBF_BUS_MINUS_X, cy, section: 'bus' };
    }
  }

  if (bestDist > BBF_SNAP_RADIUS) return null;
  return best;
}

/**
 * Given a component's pin definitions, determine the orientation.
 * - 'horizontal': pins differ mainly in X (e.g. Resistor, Diode)
 * - 'vertical': pins differ mainly in Y (e.g. LED, Capacitor, Pot)
 * Returns { orientation, pinSpans }
 */
export function analyzePinLayout(pins) {
  if (!pins || pins.length < 2) return { orientation: 'vertical', pinSpans: [] };

  // Sort pins by their position
  const sorted = [...pins].sort((a, b) => {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    // Determine dominant axis
    if (dx > dy) return a.x - b.x;
    return a.y - b.y;
  });

  // Calculate total span
  const xs = pins.map(p => p.x);
  const ys = pins.map(p => p.y);
  const spanX = Math.max(...xs) - Math.min(...xs);
  const spanY = Math.max(...ys) - Math.min(...ys);

  const orientation = spanX >= spanY ? 'horizontal' : 'vertical';

  // Calculate pin-to-pin offsets in terms of breadboard columns
  const pinSpans = sorted.map(pin => {
    if (orientation === 'horizontal') {
      return { id: pin.id, offset: Math.round(pin.x / BB_PITCH) };
    } else {
      return { id: pin.id, offset: Math.round(pin.y / BB_PITCH) };
    }
  });

  // Normalize: make smallest offset = 0
  const minOff = Math.min(...pinSpans.map(p => p.offset));
  pinSpans.forEach(p => { p.offset -= minOff; });

  return { orientation, pinSpans };
}

/**
 * Compute pin assignment for TO-220 style components.
 * TO-220 has 3 pins arranged horizontally (or L-shaped) - map to adjacent columns on same row.
 */
function computeTO220Assignment(compId, pins, anchor, bbId, bbPos) {
  const pinAssignments = {};
  const holePositions = [];
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  
  // Sort pins by X position (left to right)
  const sortedPins = [...pins].sort((a, b) => a.x - b.x);
  // Clamp anchorCol so all pins fit within column bounds
  let anchorCol = anchor.col;
  if (anchorCol + sortedPins.length - 1 >= BB_COLS) anchorCol = BB_COLS - sortedPins.length;
  if (anchorCol < 0) anchorCol = 0;
  const anchorRow = anchor.row;
  const rowLabels = anchor.section === 'top' ? BB_TOP_ROWS : BB_BOT_ROWS;
  const rowIdx = rowLabels.indexOf(anchorRow);
  const sectionY = anchor.section === 'top' ? BB_Y_SEC_TOP : BB_Y_SEC_BOT;
  
  // Map each pin to adjacent columns on the same row
  for (let i = 0; i < sortedPins.length; i++) {
    const col = anchorCol + i;
    if (col < 0 || col >= BB_COLS) return null;
    
    const pin = sortedPins[i];
    const holeId = `${anchorRow}${col + 1}`;
    const holeCx = BB_PAD_X + col * BB_PITCH + BB_PITCH / 2;
    const holeCy = sectionY + rowIdx * BB_PITCH + BB_PITCH / 2;
    
    pinAssignments[`${compId}:${pin.id}`] = `${bbId}:${holeId}`;
    holePositions.push({ cx: holeCx, cy: holeCy, pinId: pin.id });
  }
  
  if (holePositions.length === 0) return null;
  
  // Compute component position based on first pin
  const firstPin = sortedPins[0];
  const componentX = bbPos.x + holePositions[0].cx - firstPin.x;
  const componentY = bbPos.y + holePositions[0].cy - firstPin.y;
  
  return { componentX, componentY, pinAssignments };
}

/**
 * Compute auto-pin assignments for a component dropped on a breadboard.
 *
 * @param {string} compId - Generated component ID
 * @param {string} compType - Component type (e.g. 'led', 'resistor')
 * @param {number} dropX - SVG X of drop point
 * @param {number} dropY - SVG Y of drop point
 * @param {string} bbId - Breadboard component ID
 * @param {{ x: number, y: number }} bbPos - Breadboard position in SVG
 * @returns {{ componentX, componentY, pinAssignments }} or null
 */
/**
 * Check if component has TO-220 style pin layout (3 pins in L/T shape).
 * Returns true if pins have mixed X/Y offsets characteristic of TO-220.
 */
function isTO220Style(pins) {
  if (pins.length !== 3) return false;
  
  // Check if pins have both X and Y variation (not purely horizontal or vertical)
  const xs = pins.map(p => p.x);
  const ys = pins.map(p => p.y);
  const spanX = Math.max(...xs) - Math.min(...xs);
  const spanY = Math.max(...ys) - Math.min(...ys);
  
  // TO-220 has both X and Y spans significant
  return spanX > BB_PITCH && spanY > BB_PITCH;
}

/**
 * S112: Auto-pin assignment for BreadboardFull (vertical layout, 63 rows × 5+5 cols).
 * In BreadboardFull, the axes are swapped vs BreadboardHalf:
 *   - "horizontal" components span column letters (a→b→c) in same row number
 *   - "vertical" components span row numbers (1→2→3) in same column letter
 */
function computeAutoPinAssignmentFull(compId, compType, dropX, dropY, bbId, bbPos) {
  const registered = getComponent(compType);
  if (!registered || !registered.pins || registered.pins.length === 0) return null;

  const pins = registered.pins;
  const { orientation, pinSpans } = analyzePinLayout(pins);
  const yStart = BBF_BOARD_PADDING + BBF_BUS_OFFSET;

  // Find anchor using closest pin to any hole
  let anchor = null;
  let anchorPinId = null;
  let bestAnchorDist = Infinity;
  for (const pin of pins) {
    const { lx, ly } = svgToBBLocal(dropX + pin.x, dropY + pin.y, bbPos.x, bbPos.y);
    const hole = findNearestHoleFull(lx, ly);
    if (hole) {
      const dist = Math.hypot(lx - hole.cx, ly - hole.cy);
      if (dist < bestAnchorDist) {
        bestAnchorDist = dist;
        anchor = hole;
        anchorPinId = pin.id;
      }
    }
  }
  if (!anchor) return null;

  // Skip bus holes for pin assignment (components don't snap to bus)
  if (anchor.section === 'bus') return null;

  const anchorPinSpan = pinSpans.find(ps => ps.id === anchorPinId);
  const anchorOffset = anchorPinSpan ? anchorPinSpan.offset : 0;

  const pinAssignments = {};
  const holePositions = [];

  // anchor.row = column label (a-e or f-j), anchor.col = row index (0-based)
  const colLabel = anchor.row;
  const isLeft = BBF_LEFT_LABELS.includes(colLabel);
  const labels = isLeft ? BBF_LEFT_LABELS : BBF_RIGHT_LABELS;
  const colIdx = labels.indexOf(colLabel);
  const sectionX = isLeft ? BBF_SECTION_LEFT_X : BBF_SECTION_RIGHT_X;

  if (orientation === 'horizontal') {
    // Pins span across column letters (a→b→c) in the same row number
    let baseColIdx = colIdx - anchorOffset;
    const rowIdx = anchor.col;

    // Clamp so all pins stay within column bounds
    const maxOffset = Math.max(...pinSpans.map(ps => ps.offset));
    if (baseColIdx + maxOffset >= BBF_COLS_PER_SIDE) baseColIdx = BBF_COLS_PER_SIDE - 1 - maxOffset;
    if (baseColIdx < 0) baseColIdx = 0;

    for (const ps of pinSpans) {
      const ci = baseColIdx + ps.offset;
      if (ci < 0 || ci >= BBF_COLS_PER_SIDE) return null;
      const holeId = `${labels[ci]}${rowIdx + 1}`;
      const holeCx = sectionX + ci * BBF_HOLE_SPACING;
      const holeCy = yStart + rowIdx * BBF_HOLE_SPACING;
      pinAssignments[`${compId}:${ps.id}`] = `${bbId}:${holeId}`;
      holePositions.push({ cx: holeCx, cy: holeCy, pinId: ps.id });
    }
  } else {
    // Vertical: pins span across row numbers (1→2→3) in the same column letter
    const anchorRowIdx = anchor.col;
    let baseRowIdx = anchorRowIdx - anchorOffset;
    const holeCx = sectionX + colIdx * BBF_HOLE_SPACING;

    // Clamp so all pins stay within row bounds
    const maxRowOffset = Math.max(...pinSpans.map(ps => ps.offset));
    if (baseRowIdx + maxRowOffset >= BBF_ROWS) baseRowIdx = BBF_ROWS - 1 - maxRowOffset;
    if (baseRowIdx < 0) baseRowIdx = 0;

    for (const ps of pinSpans) {
      const rowIdx = baseRowIdx + ps.offset;
      if (rowIdx < 0 || rowIdx >= BBF_ROWS) return null;
      const holeId = `${colLabel}${rowIdx + 1}`;
      const holeCy = yStart + rowIdx * BBF_HOLE_SPACING;
      pinAssignments[`${compId}:${ps.id}`] = `${bbId}:${holeId}`;
      holePositions.push({ cx: holeCx, cy: holeCy, pinId: ps.id });
    }
  }

  if (holePositions.length === 0) return null;

  const firstPin = pins.find(p => p.id === holePositions[0].pinId);
  if (!firstPin) return null;

  const componentX = bbPos.x + holePositions[0].cx - firstPin.x;
  const componentY = bbPos.y + holePositions[0].cy - firstPin.y;

  return { componentX, componentY, pinAssignments };
}

export function computeAutoPinAssignment(compId, compType, dropX, dropY, bbId, bbPos, bbType = 'breadboard-half') {
  // S112: Route to BreadboardFull-specific logic if needed
  if (bbType === 'breadboard-full') {
    return computeAutoPinAssignmentFull(compId, compType, dropX, dropY, bbId, bbPos);
  }

  const registered = getComponent(compType);
  if (!registered || !registered.pins || registered.pins.length === 0) return null;

  const pins = registered.pins;

  // Special case: TO-220 style components (MOSFET) - pins in horizontal row
  if (isTO220Style(pins)) {
    const sortedPins = [...pins].sort((a, b) => a.x - b.x);
    const refPin = sortedPins[0];
    const { lx, ly } = svgToBBLocal(dropX + refPin.x, dropY + refPin.y, bbPos.x, bbPos.y);
    const anchor = findNearestHole(lx, ly);
    if (!anchor) return null;
    return computeTO220Assignment(compId, pins, anchor, bbId, bbPos);
  }

  const { orientation, pinSpans } = analyzePinLayout(pins);

  let anchor = null;
  let anchorPinId = null;
  let bestAnchorDist = Infinity;
  for (const pin of pins) {
    const { lx: plx, ly: ply } = svgToBBLocal(dropX + pin.x, dropY + pin.y, bbPos.x, bbPos.y);
    const hole = findNearestHole(plx, ply);
    if (hole) {
      const dist = Math.hypot(plx - hole.cx, ply - hole.cy);
      if (dist < bestAnchorDist) {
        bestAnchorDist = dist;
        anchor = hole;
        anchorPinId = pin.id;
      }
    }
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  }
  if (!anchor) return null;

  const anchorPinSpan = pinSpans.find(ps => ps.id === anchorPinId);
  const anchorOffset = anchorPinSpan ? anchorPinSpan.offset : 0;

  const pinAssignments = {};
  const holePositions = [];

  if (orientation === 'horizontal') {
    let baseCol = anchor.col - anchorOffset;
    const anchorRow = anchor.row;
    const rowLabels = anchor.section === 'top' ? BB_TOP_ROWS : BB_BOT_ROWS;
    const rowIdx = rowLabels.indexOf(anchorRow);
    const sectionY = anchor.section === 'top' ? BB_Y_SEC_TOP : BB_Y_SEC_BOT;

    // Clamp baseCol so all pins stay within column bounds (fixes column 30 edge case)
    const maxOffset = Math.max(...pinSpans.map(ps => ps.offset));
    if (baseCol + maxOffset >= BB_COLS) baseCol = BB_COLS - 1 - maxOffset;
    if (baseCol < 0) baseCol = 0;

    for (const ps of pinSpans) {
      const col = baseCol + ps.offset;
      if (col < 0 || col >= BB_COLS) return null;
      const holeId = `${anchorRow}${col + 1}`;
      const holeCx = BB_PAD_X + col * BB_PITCH + BB_PITCH / 2;
      const holeCy = sectionY + rowIdx * BB_PITCH + BB_PITCH / 2;
      pinAssignments[`${compId}:${ps.id}`] = `${bbId}:${holeId}`;
      holePositions.push({ cx: holeCx, cy: holeCy, pinId: ps.id });
    }
  } else {
    const anchorCol = anchor.col;
    const rowLabels = anchor.section === 'top' ? BB_TOP_ROWS : BB_BOT_ROWS;
    const sectionY = anchor.section === 'top' ? BB_Y_SEC_TOP : BB_Y_SEC_BOT;
    const anchorRowIdx = rowLabels.indexOf(anchor.row);
    const baseRowIdx = anchorRowIdx - anchorOffset;

    for (const ps of pinSpans) {
      const rowIdx = baseRowIdx + ps.offset;
      if (rowIdx < 0 || rowIdx >= 5) {
        if (anchor.section === 'top' && rowIdx >= 5) {
          const botRowIdx = rowIdx - 5;
          if (botRowIdx < 0 || botRowIdx >= 5) return null;
          const holeId = `${BB_BOT_ROWS[botRowIdx]}${anchorCol + 1}`;
          const holeCx = BB_PAD_X + anchorCol * BB_PITCH + BB_PITCH / 2;
          const holeCy = BB_Y_SEC_BOT + botRowIdx * BB_PITCH + BB_PITCH / 2;
          pinAssignments[`${compId}:${ps.id}`] = `${bbId}:${holeId}`;
          holePositions.push({ cx: holeCx, cy: holeCy, pinId: ps.id });
          continue;
        } else if (anchor.section === 'bot' && rowIdx < 0) {
          const topRowIdx = rowIdx + 5;
          if (topRowIdx < 0 || topRowIdx >= 5) return null;
          const holeId = `${BB_TOP_ROWS[topRowIdx]}${anchorCol + 1}`;
          const holeCx = BB_PAD_X + anchorCol * BB_PITCH + BB_PITCH / 2;
          const holeCy = BB_Y_SEC_TOP + topRowIdx * BB_PITCH + BB_PITCH / 2;
          pinAssignments[`${compId}:${ps.id}`] = `${bbId}:${holeId}`;
          holePositions.push({ cx: holeCx, cy: holeCy, pinId: ps.id });
          continue;
        }
        return null;
      }
      const holeId = `${rowLabels[rowIdx]}${anchorCol + 1}`;
      const holeCx = BB_PAD_X + anchorCol * BB_PITCH + BB_PITCH / 2;
      const holeCy = sectionY + rowIdx * BB_PITCH + BB_PITCH / 2;
      pinAssignments[`${compId}:${ps.id}`] = `${bbId}:${holeId}`;
      holePositions.push({ cx: holeCx, cy: holeCy, pinId: ps.id });
    }
  }

  if (holePositions.length === 0) return null;

  // Compute where to place the component in SVG space
  // The component's (0,0) should align so that each pin lands on its assigned hole
  // Use the first pin as reference
  const firstPin = pins.find(p => p.id === holePositions[0].pinId);
  if (!firstPin) return null;

  const componentX = bbPos.x + holePositions[0].cx - firstPin.x;
  const componentY = bbPos.y + holePositions[0].cy - firstPin.y;

  return { componentX, componentY, pinAssignments };
}

// Module-level ID counter — high-entropy seed prevents HMR/reload collisions
let _idCounter = Math.floor(Math.random() * 900000) + 100000;

/**
 * Generate a unique component ID for user-dropped components.
 * Uses random-seeded counter to avoid collisions on HMR reload.
 */
export function generateComponentId(type, existingIds) {
  const prefix = type.replace(/[^a-z0-9]/gi, '').slice(0, 6).toLowerCase();
  const existing = existingIds instanceof Set ? existingIds : new Set(existingIds || []);
  let id;
  do {
    _idCounter += 1;
    id = `${prefix}_${_idCounter}`;
  } while (existing.has(id));
  return id;
}

/**
 * Convert a hole ID (e.g. "a1", "f15") to local pixel coordinates
 * on the breadboard. Returns { cx, cy } or null if invalid.
 */
export function getHolePixelPosition(holeId) {
  if (!holeId || holeId.length < 2) return null;
  const row = holeId[0].toLowerCase();
  const col = parseInt(holeId.slice(1), 10) - 1; // 1-based to 0-based
  if (isNaN(col) || col < 0 || col >= BB_COLS) return null;

  let sectionY;
  let rowIdx;
  if (BB_TOP_ROWS.includes(row)) {
    sectionY = BB_Y_SEC_TOP;
    rowIdx = BB_TOP_ROWS.indexOf(row);
  } else if (BB_BOT_ROWS.includes(row)) {
    sectionY = BB_Y_SEC_BOT;
    rowIdx = BB_BOT_ROWS.indexOf(row);
  } else {
    return null;
  }

  return {
    cx: BB_PAD_X + col * BB_PITCH + BB_PITCH / 2,
    cy: sectionY + rowIdx * BB_PITCH + BB_PITCH / 2,
  };
}

// ── Exported geometry constants for PlacementEngine ──
export {
  BB_PITCH, BB_PAD_X, BB_Y_SEC_TOP, BB_Y_SEC_BOT,
  BB_COLS, BB_TOP_ROWS, BB_BOT_ROWS, BB_SECTION_H,
  BB_GAP_H, BB_SNAP_RADIUS,
  // S112: BreadboardFull constants
  BBF_HOLE_SPACING, BBF_ROWS, BBF_COLS_PER_SIDE,
  BBF_SECTION_LEFT_X, BBF_SECTION_RIGHT_X,
  BBF_BUS_PLUS_X, BBF_BUS_MINUS_X,
  BBF_LEFT_LABELS, BBF_RIGHT_LABELS, BBF_SNAP_RADIUS,
};
