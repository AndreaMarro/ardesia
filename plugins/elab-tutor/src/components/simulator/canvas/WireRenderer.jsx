/**
 * ELAB Simulator — WireRenderer V8 (Book + Flexible)
 * Renderizza fili in due modalita:
 * - book: percorso ortogonale pulito (stile Fritzing/libro, senza sag)
 * - flex: Catmull-Rom + sag gravitazionale (wire malleabili)
 * Supporta: Arduino→BB, BB→BB, power bus, free-air
 * © Andrea Marro — 20/02/2026, book-style redesign 22/02/2026, flexible V7 24/02/2026
 */

import React, { useMemo, useRef, useState } from 'react';
import { getComponent } from '../components/registry';
import { WIRE_COLORS } from '../components/Wire';

// ─── Breadboard geometry constants (must match BreadboardHalf.jsx) ────────────
const BB_HOLE_PITCH = 7.5;
const BB_PAD_X = 14;
const BB_BUS_ROW_H = 7.5;
const BB_BUS_GAP = 5;
const BB_SECTION_H = 5 * BB_HOLE_PITCH; // 37.5
const BB_GAP_H = 10;
const BB_PAD_Y = 10;

// Y offsets within breadboard (relative to bb origin)
const BB_Y_SECTION_TOP = BB_PAD_Y + BB_BUS_ROW_H * 2 + BB_BUS_GAP; // 30
const BB_Y_GAP = BB_Y_SECTION_TOP + BB_SECTION_H;                    // 67.5
const BB_Y_SECTION_BOT = BB_Y_GAP + BB_GAP_H;                        // 77.5

// Row Y positions (center of hole, relative to bb origin)
const ROW_Y = {
  a: BB_Y_SECTION_TOP + 0 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,  // 33.75
  b: BB_Y_SECTION_TOP + 1 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,  // 41.25
  c: BB_Y_SECTION_TOP + 2 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,  // 48.75
  d: BB_Y_SECTION_TOP + 3 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,  // 56.25
  e: BB_Y_SECTION_TOP + 4 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,  // 63.75
  f: BB_Y_SECTION_BOT + 0 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,  // 81.25
  g: BB_Y_SECTION_BOT + 1 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,  // 88.75
  h: BB_Y_SECTION_BOT + 2 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,  // 96.25
  i: BB_Y_SECTION_BOT + 3 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,  // 103.75
  j: BB_Y_SECTION_BOT + 4 * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,  // 111.25
};

// Bus row Y positions (relative to bb origin)
const BUS_Y = {
  'bus-top-plus': BB_PAD_Y + BB_BUS_ROW_H / 2,                                          // 13.75
  'bus-top-minus': BB_PAD_Y + BB_BUS_ROW_H + BB_BUS_ROW_H / 2,                            // 21.25
  'bus-bot-plus': BB_Y_SECTION_BOT + BB_SECTION_H + BB_BUS_GAP + BB_BUS_ROW_H / 2,        // 120.25
  'bus-bot-minus': BB_Y_SECTION_BOT + BB_SECTION_H + BB_BUS_GAP + BB_BUS_ROW_H + BB_BUS_ROW_H / 2, // 127.75
};

// S52: Reverse SVG path correctly for Bezier curves (M, L, Q, C)
function reverseSvgPath(pathStr) {
  const segs = [];
  const re = /([MLQC])\s*([\d.\-e,\s]+)/gi;
  let m;
  while ((m = re.exec(pathStr)) !== null) {
    const cmd = m[1].toUpperCase();
    const nums = m[2].trim().split(/[\s,]+/).map(Number);
    segs.push({ cmd, nums });
  }
  if (segs.length === 0) return pathStr;
  // New M = endpoint of last segment
  const last = segs[segs.length - 1].nums;
  const sx = last[last.length - 2];
  const sy = last[last.length - 1];
  let out = `M ${sx} ${sy}`;
  for (let i = segs.length - 1; i >= 1; i--) {
    const seg = segs[i];
    const prev = segs[i - 1].nums;
    const px = prev[prev.length - 2];
    const py = prev[prev.length - 1];
    if (seg.cmd === 'L' || seg.cmd === 'M') {
      out += ` L ${px} ${py}`;
    } else if (seg.cmd === 'Q') {
      // Q cx cy ex ey -> Q cx cy (prev endpoint)
      out += ` Q ${seg.nums[0]} ${seg.nums[1]} ${px} ${py}`;
    } else if (seg.cmd === 'C') {
      // C c1x c1y c2x c2y ex ey -> C c2x c2y c1x c1y (prev endpoint)
      out += ` C ${seg.nums[2]} ${seg.nums[3]} ${seg.nums[0]} ${seg.nums[1]} ${px} ${py}`;
    }
  }
  return out;
}

// Check if a pinId is a bus pin (e.g. "bus-top-plus-5")
function isBusPin(pinId) {
  return pinId && pinId.startsWith('bus-');
}

// Get bus rail name from pinId (e.g. "bus-top-plus-5" → "bus-top-plus")
// Also accepts legacy "bus-bottom-plus/minus" format, normalizing to "bus-bot-plus/minus"
function getBusRail(pinId) {
  if (!pinId) return null;
  const fullMatch = pinId.match(/^(bus-(?:plus|minus))-\d+$/);
  if (fullMatch) return fullMatch[1];
  const match = pinId.match(/^(bus-(?:top|bot|bottom)-(?:plus|minus))-\d+$/);
  if (!match) return null;
  // Normalize legacy "bus-bottom-" to "bus-bot-"
  return match[1].replace('bus-bottom-', 'bus-bot-');
}

function normalizePinIdForComponent(compType, pinId) {
  // Compatibility: some legacy experiments use half-breadboard rail names
  // (bus-top/bot-plus/minus) on breadboard-full, whose pins are bus-plus/minus.
  if (compType === 'breadboard-full') {
    const m = pinId.match(/^bus-(?:top|bot|bottom)-(plus|minus)-(\d+)$/);
    if (m) {
      return `bus-${m[1]}-${m[2]}`;
    }
  }
  return pinId;
}

// Absolute hole position given bb origin + col (1-based) + row letter
function bbHoleAbs(bbX, bbY, col, rowLetter) {
  return {
    x: bbX + BB_PAD_X + (col - 1) * BB_HOLE_PITCH + BB_HOLE_PITCH / 2,
    y: bbY + ROW_Y[rowLetter],
  };
}

// Find the nearest breadboard column for an absolute X coordinate
function nearestBBCol(absX, bbX) {
  const relX = absX - bbX - BB_PAD_X - BB_HOLE_PITCH / 2;
  const col = Math.round(relX / BB_HOLE_PITCH) + 1;
  return Math.max(1, Math.min(30, col));
}

// Find the nearest breadboard row for an absolute Y coordinate
// Clamps results to valid breadboard bounds: 'a' (topmost) to 'j' (bottommost)
function nearestBBRow(absY, bbY) {
  const relY = absY - bbY;

  // Clamp: if above the top section, return 'a'
  if (relY <= ROW_Y['a']) return 'a';
  // Clamp: if below the bottom section, return 'j'
  if (relY >= ROW_Y['j']) return 'j';

  let bestRow = 'a';
  let bestDist = Infinity;
  for (const [letter, ry] of Object.entries(ROW_Y)) {
    const dist = Math.abs(relY - ry);
    if (dist < bestDist) {
      bestDist = dist;
      bestRow = letter;
    }
  }
  return bestRow;
}

// Check if a point is within the breadboard area
function isOnBreadboard(absX, absY, bbX, bbY) {
  const relX = absX - bbX;
  const relY = absY - bbY;
  const bbW = BB_PAD_X * 2 + 30 * BB_HOLE_PITCH;
  const bbH = BB_PAD_Y + BB_BUS_ROW_H * 2 + BB_BUS_GAP + BB_SECTION_H + BB_GAP_H + BB_SECTION_H + BB_BUS_GAP + BB_BUS_ROW_H * 2 + BB_PAD_Y;
  return relX >= -5 && relX <= bbW + 5 && relY >= -5 && relY <= bbH + 5;
}

// Check if a point is ABOVE the breadboard (Arduino position)
function isAboveBreadboard(absY, bbY) {
  return absY < bbY + BB_Y_SECTION_TOP;
}

/**
 * Resolve absolute pin position with rotation support
 */
function resolvePinPosition(pinRef, components, layout) {
  const [componentId, pinId] = pinRef.split(':');
  if (!componentId || !pinId) return null;

  const comp = components.find(c => c.id === componentId);
  if (!comp) return null;

  const pos = layout?.[componentId];
  if (!pos) return null;

  const registered = getComponent(comp.type);
  if (!registered || !registered.pins) return null;

  const normalizedPinId = normalizePinIdForComponent(comp.type, pinId);
  const pinDef = registered.pins.find(p => p.id === normalizedPinId);
  if (!pinDef) return null;

  const rotation = pos.rotation || 0;
  let px = pinDef.x;
  let py = pinDef.y;

  // Apply component-level rotation (handles wing pins on NanoR4 and other rotated components)
  // SVG renders with rotate(angle, pos.x, pos.y) — equivalent to rotating pin offsets around (0,0)
  // For components with boardDimensions offsets, account for any breakout offset
  if (rotation !== 0) {
    const bd = registered.boardDimensions;
    const offsetX = bd?.breakoutOffsetX || 0;
    const offsetY = bd?.breakoutOffsetY || 0;
    // Translate pin to rotation center, rotate, translate back
    const cx = px - offsetX;
    const cy = py - offsetY;
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    px = cx * cos - cy * sin + offsetX;
    py = cx * sin + cy * cos + offsetY;
  }

  return {
    x: pos.x + px,
    y: pos.y + py,
    componentId,
    pinId,
    compType: comp.type,
  };
}

/**
 * Build a wire path through waypoints.
 * - style "orthogonal": polyline secca (M/L), no sag
 * - style "smooth": Catmull-Rom + Bézier, opzionale gravity sag sui segmenti a 2 punti
 */
const WIRE_SAG_FACTOR = 0.03;  // Minimal gravity sag — Tinkercad wires are nearly straight
const MAX_SAG = 8;              // Very low max sag for subtle natural droop
const CR_TENSION = 0.2;         // Low Catmull-Rom tension — gentle curves through waypoints

function buildRoutedPath(points, opts = {}) {
  if (points.length < 2) return '';

  const style = opts.style || 'smooth'; // 'smooth' | 'orthogonal'
  const enableSag = opts.enableSag !== false;
  // sagDirection: +1 (right) or -1 (left) for polarity-aware lateral sag.
  // Prevents battery +/- wires from overlapping by sagging in opposite directions.
  const sagDirection = opts.sagDirection || 1;
  // polarity: +1 (positive), -1 (negative), 0 (none) — controls sag depth separation
  const polarity = opts.polarity || 0;

  // ── Book/Fritzing style: hard polyline path ──
  if (style === 'orthogonal') {
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
    }
    return d;
  }

  // ── 2-point wire: quadratic Bézier with natural gravity sag ──
  if (points.length === 2) {
    const p0 = points[0];
    const p1 = points[1];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Straight line for very short wires or when sag is disabled
    if (dist < 3 || !enableSag) {
      return `M ${p0.x} ${p0.y} L ${p1.x} ${p1.y}`;
    }

    // Natural gravity sag (catenary approximation)
    const sag = Math.min(MAX_SAG, dist * WIRE_SAG_FACTOR);
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    let sagX = 0;
    let sagY = sag; // Default: droop downward (gravity)

    if (absDx < absDy * 0.3) {
      // Nearly vertical: lateral sag — direction controlled by sagDirection
      sagX = sag * 0.5 * sagDirection;
      sagY = 0;
    } else if (absDx < absDy) {
      // Steep diagonal: mixed sag
      sagX = sag * 0.3 * sagDirection;
      sagY = sag * 0.7;
    } else if (polarity !== 0) {
      // Horizontal/diagonal with polarity: vary sag depth + small lateral offset
      // Positive wires droop more, negative wires droop less → visible vertical separation
      sagX = sag * 0.2 * sagDirection;
      sagY = polarity > 0 ? sag * 1.4 : sag * 0.4;
    }

    return `M ${p0.x} ${p0.y} Q ${(midX + sagX).toFixed(1)} ${(midY + sagY).toFixed(1)} ${p1.x} ${p1.y}`;
  }

  // ── 3+ points: Orthogonal with Rounded Corners and Subtle Sag ──
  // Replaces Catmull-Rom (which overshoots corners and causes component overlapping)
  const n = points.length;
  const R = 15; // Increased corner radius for a more natural, gentle curve (un po' incurvati)
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  let prevEndX = points[0].x;
  let prevEndY = points[0].y;

  for (let i = 1; i < n - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    // Distances
    const d10x = prevEndX - p1.x;
    const d10y = prevEndY - p1.y;
    const len10 = Math.sqrt(d10x * d10x + d10y * d10y);

    const d12x = p2.x - p1.x;
    const d12y = p2.y - p1.y;
    const len12 = Math.sqrt(d12x * d12x + d12y * d12y);

    // Dynamic radius based on segment lengths
    const r = Math.min(R, len10 / 2, len12 / 2);

    // Curve start (on segment leaving prevEnd towards p1)
    const startX = p1.x + (d10x / len10) * r;
    const startY = p1.y + (d10y / len10) * r;

    // Curve end (on segment leaving p1 towards p2)
    const endX = p1.x + (d12x / len12) * r;
    const endY = p1.y + (d12y / len12) * r;

    // Draw segment from prevEnd to startX with subtle sag
    const segDist = len10 - r;
    if (segDist > 3 && enableSag) {
      const sag = Math.min(MAX_SAG, segDist * WIRE_SAG_FACTOR);
      const midX = (prevEndX + startX) / 2;
      const midY = (prevEndY + startY) / 2 + sag;
      d += ` Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${startX.toFixed(1)} ${startY.toFixed(1)}`;
    } else {
      d += ` L ${startX.toFixed(1)} ${startY.toFixed(1)}`;
    }

    // Draw rounded corner
    d += ` Q ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;

    prevEndX = endX;
    prevEndY = endY;
  }

  // Draw final segment to the last point
  const last = points[n - 1];
  const finalDist = Math.sqrt(Math.pow(last.x - prevEndX, 2) + Math.pow(last.y - prevEndY, 2));

  if (finalDist > 3 && enableSag) {
    const sag = Math.min(MAX_SAG, finalDist * WIRE_SAG_FACTOR);
    const midX = (prevEndX + last.x) / 2;
    const midY = (prevEndY + last.y) / 2 + sag;
    d += ` Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  } else {
    d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  }

  return d;
}

/**
 * Compute routed wire path between two resolved pin positions
 * Routes through breadboard holes for realistic appearance
 * @param {string} [fromRef] - source pin reference (e.g. "battery1:positive")
 * @param {string} [toRef] - destination pin reference (e.g. "bb1:bus-top-plus-5")
 */
function computeRoutedWire(fromPos, toPos, components, layout, fromRef, toRef) {
  // BUG FIX: Find breadboard in layout — support both half and full breadboard types
  const bbComp = components.find(c => c.type === 'breadboard-half' || c.type === 'breadboard-full');
  const bbLayout = bbComp ? layout[bbComp.id] : null;

  // If no breadboard, direct path
  if (!bbLayout) {
    return [fromPos, toPos];
  }

  const bbX = bbLayout.x;
  const bbY = bbLayout.y;

  // Check if endpoints are breadboard pins (bus or main section)
  const fromIsBBPin = fromPos.compType === 'breadboard-half' || fromPos.compType === 'breadboard-full';
  const toIsBBPin = toPos.compType === 'breadboard-half' || toPos.compType === 'breadboard-full';

  // Case 0: Both endpoints are on the SAME breadboard — jumper wire (bus↔main, bus↔bus, main↔main)
  if (fromIsBBPin && toIsBBPin && fromPos.componentId === toPos.componentId) {
    return routeJumperWire(fromPos, toPos, bbX, bbY);
  }

  const fromOnBB = isOnBreadboard(fromPos.x, fromPos.y, bbX, bbY);
  const toOnBB = isOnBreadboard(toPos.x, toPos.y, bbX, bbY);
  const isFromNano = fromPos.compType === 'nano-r4';
  const isToNano = toPos.compType === 'nano-r4';

  // Case 1: Arduino pin → component on breadboard
  if (isFromNano && (toOnBB || !isToNano)) {
    return routeFromArduino(fromPos, toPos, bbX, bbY, isFromNano);
  }

  // Case 2: Component on breadboard → Arduino pin (reverse)
  if (isToNano && (fromOnBB || !isFromNano)) {
    const reversed = routeFromArduino(toPos, fromPos, bbX, bbY, isToNano);
    return reversed.reverse();
  }

  // Case 3: Both on breadboard (non-bb pins, e.g. two components placed on BB)
  if (fromOnBB && toOnBB) {
    return routeOnBreadboard(fromPos, toPos, bbX, bbY);
  }

  // Case 4: Off-board (battery) → breadboard pin
  if (toIsBBPin && !fromIsBBPin) {
    return routeToBreadboardPin(fromPos, toPos, bbX, bbY);
  }
  if (fromIsBBPin && !toIsBBPin) {
    const reversed = routeToBreadboardPin(toPos, fromPos, bbX, bbY);
    return reversed.reverse();
  }

  // Case 5: Power source to non-BB component on/near breadboard
  if (!isFromNano && !isToNano) {
    if (toOnBB && !fromOnBB) {
      return routeToBreadboard(fromPos, toPos, bbX, bbY);
    }
    if (fromOnBB && !toOnBB) {
      const reversed = routeToBreadboard(toPos, fromPos, bbX, bbY);
      return reversed.reverse();
    }
  }

  // Fallback: direct path
  return [fromPos, toPos];
}

/**
 * Route a jumper wire between two breadboard holes (bus↔bus, bus↔main, main↔main)
 * Simple L-shaped or straight wire, like real jumper wires
 */
function routeJumperWire(fromPos, toPos, bbX, bbY) {
  // Flex mode: all jumper wires are direct 2-point paths → natural Bézier curve with sag
  return [fromPos, toPos];
}

/**
 * Determine edge routing lane from pin Y position (rail-based)
 * Lane 0 = plus rail (closest to breadboard)
 * Lane 1 = minus rail
 * Lane 2 = row pins (furthest from breadboard)
 */
function getEdgeLane(pinY, bbY) {
  const offset = pinY - bbY;
  if (Math.abs(offset - BUS_Y['bus-top-plus']) < 4 || Math.abs(offset - BUS_Y['bus-bot-plus']) < 4) return 0;
  if (Math.abs(offset - BUS_Y['bus-top-minus']) < 4 || Math.abs(offset - BUS_Y['bus-bot-minus']) < 4) return 1;
  return 2;
}

/**
 * Route from off-board component (battery) directly to a breadboard pin (bus or main section)
 * V5 Lane-separated L-shape routing:
 *   - Each battery wire (+/−) routes through its own "lane" (vertical or horizontal riser)
 *   - Lanes are separated by LANE_SEP pixels, preventing overlap and crossings
 *   - Positive wire uses the inner lane (closer to breadboard)
 *   - Negative wire uses the outer lane (closer to battery)
 *   - Path adapts to battery position relative to breadboard (left/right/above/below)
 *   - 4-point path → orthogonal-with-rounded-corners rendering in buildRoutedPath
 */
function routeToBreadboardPin(offPos, bbPinPos, bbX, bbY) {
  // S112: Direct 2-point Bézier for ALL off-board to bus wires.
  // Polarity-based sag in buildRoutedPath naturally separates + and − wires.
  // The old 4-point L-shape lane system created wide roundabout arcs.
  return [offPos, bbPinPos];
}

/**
 * Route from Arduino (above breadboard) to a component on/near the breadboard
 * © Andrea Marro — 25/02/2026 — ELAB Tutor — Tutti i diritti riservati
 */
function routeFromArduino(nanoPos, targetPos, bbX, bbY, isNano = false) {
  // Flex mode: ALL Arduino wires use direct 2-point path → natural Bézier catenary
  return [nanoPos, targetPos];
}

/**
 * Route between two points on the breadboard
 */
function routeOnBreadboard(fromPos, toPos, bbX, bbY) {
  // Flex mode: ALL on-breadboard wires use direct 2-point path → natural Bézier catenary
  return [fromPos, toPos];
}

/**
 * Route from an off-breadboard component (battery etc.) to the breadboard
 */
function routeToBreadboard(offPos, onPos, bbX, bbY) {
  // Flex mode: ALL off-board to breadboard wires use direct 2-point path → natural Bézier catenary
  return [offPos, onPos];
}

/**
 * Remove consecutive points that are very close together
 */
function deduplicatePoints(points) {
  if (points.length < 2) return points;
  const result = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    if (Math.sqrt(dx * dx + dy * dy) > 1.5) {
      result.push(curr);
    }
  }
  return result;
}

function deduplicateColinear(points) {
  if (points.length < 3) return points;
  const res = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = res[res.length - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const isHorizontal = Math.abs(p0.y - p1.y) < 1 && Math.abs(p1.y - p2.y) < 1;
    const isVertical = Math.abs(p0.x - p1.x) < 1 && Math.abs(p1.x - p2.x) < 1;
    if (!isHorizontal && !isVertical) {
      res.push(p1);
    }
  }
  res.push(points[points.length - 1]);
  return res;
}

/**
 * Ensures wires route AROUND components ("di fianco") instead of over them.
 * Uses A* Pathfinding on a 7.5px grid for Manhattan orthogonal routing.
 * S112: Tuned for more direct paths — reduced turn penalty, tighter obstacle
 * boxes, fast-path skip when direct line is obstacle-free.
 */
function applyComponentAvoidance(waypoints, components, layout) {
  if (waypoints.length < 2) return waypoints;

  const GRID = 7.5; // Breadboard pitch

  // Collect obstacle bounding boxes (only breadboard-snappable elements)
  const avoidTypes = new Set(['resistor', 'capacitor', 'led', 'diode', 'mosfet-n', 'motor-dc', 'buzzer-piezo', 'phototransistor', 'push-button', 'nano-r4']);

  const obstacles = components
    .filter(c => avoidTypes.has(c.type))
    .map(c => {
      const pos = layout[c.id];
      if (!pos) return null;
      // S112: Tighter boxes — component body only, minimal clearance
      let w = 18; // Was 28 — reduced to actual component footprint + small margin
      let h = (c.type === 'nano-r4') ? 50 : 28; // Was 60/38 — tighter fit

      // S112: No grid expansion — the box width already provides sufficient clearance
      const minX = Math.floor((pos.x - w) / GRID);
      const maxX = Math.ceil((pos.x + w) / GRID);
      const minY = Math.floor((pos.y - h) / GRID);
      const maxY = Math.ceil((pos.y + h) / GRID);
      return { minX, maxX, minY, maxY, cx: pos.x, cy: pos.y };
    })
    .filter(Boolean);

  if (obstacles.length === 0) return waypoints;

  const isBlocked = (gx, gy) => {
    for (const obs of obstacles) {
      if (gx >= obs.minX && gx <= obs.maxX && gy >= obs.minY && gy <= obs.maxY) return true;
    }
    return false;
  };

  // S112: Fast-path — check if direct line between endpoints is obstacle-free.
  // Uses Bresenham-style ray march on grid to test line-of-sight.
  const directPathClear = (sx, sy, ex, ey) => {
    const dx = Math.abs(ex - sx);
    const dy = Math.abs(ey - sy);
    const stepX = sx < ex ? 1 : -1;
    const stepY = sy < ey ? 1 : -1;
    // March along both axes, checking each grid cell the line crosses
    let x = sx, y = sy;
    let err = dx - dy;
    const maxSteps = dx + dy + 2;
    for (let i = 0; i < maxSteps; i++) {
      if (x === ex && y === ey) return true;
      // Skip checking start and end cells (always valid)
      if (!((x === sx && y === sy) || (x === ex && y === ey))) {
        if (isBlocked(x, y)) return false;
      }
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += stepX; }
      if (e2 < dx) { err += dx; y += stepY; }
    }
    return true;
  };

  const getNeighbors = (gx, gy) => [
    { x: gx + 1, y: gy }, { x: gx - 1, y: gy },
    { x: gx, y: gy + 1 }, { x: gx, y: gy - 1 }
  ];

  const heuristic = (ax, ay, bx, by) => Math.abs(ax - bx) + Math.abs(ay - by);

  let result = [waypoints[0]];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];

    // Convert endpoints to grid
    const sx = Math.round(start.x / GRID);
    const sy = Math.round(start.y / GRID);
    const ex = Math.round(end.x / GRID);
    const ey = Math.round(end.y / GRID);

    // S112: Skip A* if direct path is clear — most common case for short wires
    if (directPathClear(sx, sy, ex, ey)) {
      result.push(end);
      continue;
    }

    // Unblock the start and end cells explicitly so the router can reach them
    const blocked = (gx, gy) => {
      if ((gx === sx && gy === sy) || (gx === ex && gy === ey)) return false;
      return isBlocked(gx, gy);
    };

    // A* implementation
    const openSet = [{ x: sx, y: sy, g: 0, f: heuristic(sx, sy, ex, ey), parent: null }];
    const closedSet = new Set();
    const hash = (x, y) => `${x},${y}`;

    let endNode = null;
    let iterations = 0;

    while (openSet.length > 0 && iterations < 3000) {
      iterations++;

      // Pop lowest f (simple array sort is fast enough for ~1000 items)
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift();
      const hStr = hash(current.x, current.y);

      if (current.x === ex && current.y === ey) {
        endNode = current;
        break;
      }

      closedSet.add(hStr);

      for (const n of getNeighbors(current.x, current.y)) {
        if (blocked(n.x, n.y)) continue;
        const nHash = hash(n.x, n.y);
        if (closedSet.has(nHash)) continue;

        // S112: Reduced turn penalty from 5.0 → 1.5
        // Lower penalty allows shorter paths with more corners instead of long detours
        let cost = 1.0;
        if (current.parent) {
          const dirCurrent = { dx: current.x - current.parent.x, dy: current.y - current.parent.y };
          const dirNext = { dx: n.x - current.x, dy: n.y - current.y };
          if (dirCurrent.dx !== dirNext.dx || dirCurrent.dy !== dirNext.dy) {
            cost += 1.5; // Was 5.0 — gentler turn penalty, prefers shorter total path
          }
        }

        const g = current.g + cost;
        const existingIdx = openSet.findIndex(o => o.x === n.x && o.y === n.y);

        if (existingIdx === -1 || g < openSet[existingIdx].g) {
          const newNode = { x: n.x, y: n.y, g, f: g + heuristic(n.x, n.y, ex, ey), parent: current };
          if (existingIdx === -1) {
            openSet.push(newNode);
          } else {
            openSet[existingIdx] = newNode;
          }
        }
      }
    }

    if (endNode) {
      const path = [];
      let curr = endNode;
      while (curr) {
        path.push({ x: curr.x * GRID, y: curr.y * GRID });
        curr = curr.parent;
      }
      path.reverse();

      // De-duplicate the junction with previous segment
      if (path.length > 0) {
        const lastRes = result[result.length - 1];
        if (Math.abs(lastRes.x - path[0].x) < 1 && Math.abs(lastRes.y - path[0].y) < 1) {
          path.shift();
        }
      }

      const simplified = deduplicateColinear(path);
      for (const p of simplified) {
        // Prevent subpixel displacement at final connector
        if (p === simplified[simplified.length - 1] && Math.abs(p.x - end.x) < GRID && Math.abs(p.y - end.y) < GRID) {
          result.push(end);
        } else {
          result.push(p);
        }
      }
    } else {
      // Fallback: direct line if totally blocked
      result.push(end);
    }
  }

  return deduplicatePoints(result);
}

/**
 * Detect polarity from pin references for sag direction.
 * Returns +1 for positive/VCC (sag right), -1 for negative/GND (sag left), 0 for neutral.
 */
function detectPolarity(fromRef, toRef) {
  const refs = [fromRef, toRef];
  for (const ref of refs) {
    if (!ref) continue;
    // Bus rails
    if (ref.includes('bus-') && ref.includes('-plus')) return 1;
    if (ref.includes('bus-') && ref.includes('-minus')) return -1;
    // Component pins
    const pinId = (ref.split(':')[1] || '').toLowerCase();
    if (pinId.includes('positive') || pinId.includes('plus') || pinId === 'vcc'
      || pinId === '5v' || pinId === '3v3' || pinId === 'vin') return 1;
    if (pinId.includes('negative') || pinId.includes('minus') || pinId === 'gnd') return -1;
  }
  return 0;
}

/**
 * Infer wire color from pin references when no explicit color is set.
 * VCC/positive/plus → red, GND/negative/minus → black, digital → orange, analog → blue
 */
function getAutoWireColor(fromRef, toRef) {
  const refs = [fromRef, toRef];
  for (const ref of refs) {
    if (!ref) continue;
    // Bus rails
    if (ref.includes('bus-') && ref.includes('-plus')) return 'red';
    if (ref.includes('bus-') && ref.includes('-minus')) return 'black';
    // Component pins
    const pinId = ref.split(':')[1] || '';
    const lower = pinId.toLowerCase();
    if (lower.includes('positive') || lower.includes('plus') || lower === 'vcc'
      || lower === '5v' || lower === '3v3' || lower === 'vin') return 'red';
    if (lower.includes('negative') || lower.includes('minus') || lower === 'gnd') return 'black';
  }
  // Arduino pins
  for (const ref of refs) {
    if (!ref) continue;
    const pinId = ref.split(':')[1] || '';
    if (/^D\d+$/.test(pinId) || /^W_D\d+$/.test(pinId)) return 'orange';
    if (/^A\d+$/.test(pinId) || /^W_A\d+$/.test(pinId)) return 'blue';
  }
  return 'green'; // default signal color
}

function inferWireColorHex(fromRef, toRef) {
  const name = getAutoWireColor(fromRef, toRef);
  return WIRE_COLORS[name] || name;
}

/**
 * TINKERCAD REALISM: Wire collision avoidance system
 * Detects overlapping wire segments and adds offset to prevent visual clutter
 */
class WireCollisionDetector {
  constructor() {
    this.existingSegments = []; // Array of {x1, y1, x2, y2, wireIdx}
    this.minDistance = 8; // Minimum distance between parallel wires (increased for clarity)
  }

  /**
   * Check if a segment overlaps with existing wires
   * Returns recommended offset to avoid collision
   */
  checkCollision(x1, y1, x2, y2, currentWireIdx) {
    let offsetX = 0;
    let offsetY = 0;
    let collisionCount = 0;

    for (const seg of this.existingSegments) {
      if (seg.wireIdx === currentWireIdx) continue;

      // Check if segments are parallel and close
      const isHorizontal1 = Math.abs(y1 - y2) < 1;
      const isHorizontal2 = Math.abs(seg.y1 - seg.y2) < 1;
      const isVertical1 = Math.abs(x1 - x2) < 1;
      const isVertical2 = Math.abs(seg.x1 - seg.x2) < 1;

      if (isHorizontal1 && isHorizontal2) {
        // Both horizontal - check Y proximity and X overlap
        const yDist = Math.abs(((y1 + y2) / 2) - ((seg.y1 + seg.y2) / 2));
        if (yDist < this.minDistance) {
          // Check X overlap
          const xOverlap = this.segmentsOverlap(
            Math.min(x1, x2) - 5, Math.max(x1, x2) + 5,
            Math.min(seg.x1, seg.x2) - 5, Math.max(seg.x1, seg.x2) + 5
          );
          if (xOverlap) {
            collisionCount++;
            offsetY += this.minDistance * (collisionCount % 2 === 0 ? 1 : -1) * Math.ceil(collisionCount / 2);
          }
        }
      } else if (isVertical1 && isVertical2) {
        // Both vertical - check X proximity and Y overlap
        const xDist = Math.abs(((x1 + x2) / 2) - ((seg.x1 + seg.x2) / 2));
        if (xDist < this.minDistance) {
          // Check Y overlap
          const yOverlap = this.segmentsOverlap(
            Math.min(y1, y2) - 5, Math.max(y1, y2) + 5,
            Math.min(seg.y1, seg.y2) - 5, Math.max(seg.y1, seg.y2) + 5
          );
          if (yOverlap) {
            collisionCount++;
            offsetX += this.minDistance * (collisionCount % 2 === 0 ? 1 : -1) * Math.ceil(collisionCount / 2);
          }
        }
      }
    }

    return { offsetX, offsetY };
  }

  segmentsOverlap(min1, max1, min2, max2) {
    return Math.max(min1, min2) < Math.min(max1, max2);
  }

  /**
   * Register a wire segment for collision detection
   */
  addSegment(x1, y1, x2, y2, wireIdx) {
    this.existingSegments.push({ x1, y1, x2, y2, wireIdx });
  }

  /**
   * Clear all segments (call at start of new wire batch)
   */
  clear() {
    this.existingSegments = [];
  }
}

/**
 * Apply collision avoidance to wire waypoints
 * Returns adjusted waypoints with offset to avoid overlapping other wires
 */
function applyCollisionAvoidance(waypoints, wireIdx, collisionDetector) {
  if (waypoints.length < 2) return waypoints;

  const adjusted = [...waypoints];
  const lastIdx = adjusted.length - 1;

  // Process each segment
  for (let i = 0; i < adjusted.length - 1; i++) {
    const start = adjusted[i];
    const end = adjusted[i + 1];

    // Check collision for this segment
    const offset = collisionDetector.checkCollision(
      start.x, start.y, end.x, end.y, wireIdx
    );

    if (offset.offsetX !== 0 || offset.offsetY !== 0) {
      // Keep physical anchors fixed: first and last waypoint must stay exactly
      // on the source/destination pad.
      const touchesStartAnchor = i === 0;
      const touchesEndAnchor = i + 1 === lastIdx;

      if (!touchesStartAnchor) {
        adjusted[i] = { ...start, x: start.x + offset.offsetX, y: start.y + offset.offsetY };
      }
      if (!touchesEndAnchor) {
        adjusted[i + 1] = { ...end, x: end.x + offset.offsetX, y: end.y + offset.offsetY };
      }
    }

    // Register the (potentially adjusted) segment
    collisionDetector.addSegment(
      adjusted[i].x, adjusted[i].y,
      adjusted[i + 1].x, adjusted[i + 1].y,
      wireIdx
    );
  }

  return adjusted;
}

/**
 * Build net membership: Union-Find over wire endpoints + breadboard internal strips.
 * Returns a Set of wire indices that share the same net as the selected wire.
 */
function computeNetHighlight(connections, selectedIdx) {
  if (selectedIdx < 0 || selectedIdx >= connections.length) return new Set();

  // Simple Union-Find (inline, lightweight)
  const parent = {};
  const find = (x) => { if (!parent[x]) parent[x] = x; return parent[x] === x ? x : (parent[x] = find(parent[x])); };
  const union = (a, b) => { parent[find(a)] = find(b); };

  // Breadboard internal connections: same column top section (a-e) or bottom section (f-j)
  // and bus rails connect all 30 holes per rail.
  // Normalize pin refs: "bb1:a5" → net key "bb1:col5-top", bus pins stay as-is
  const normalize = (ref) => {
    if (!ref) return ref;
    const [compId, pinId] = ref.split(':');
    if (!pinId) return ref;
    // Bus pins: bus-top-plus-5 etc. — all pins on same rail are connected
    // Also handles legacy "bus-bottom-" format by normalizing to "bus-bot-"
    if (pinId.startsWith('bus-')) {
      const rail = pinId.replace(/-\d+$/, '').replace('bus-bottom-', 'bus-bot-');
      return `${compId}:${rail}`;
    }
    // Main section: letter + number → group by column + section
    const letter = pinId.charAt(0);
    const num = pinId.substring(1);
    if (/^[a-e]/.test(letter) && /^\d+$/.test(num)) {
      return `${compId}:col${num}-top`;
    }
    if (/^[f-j]/.test(letter) && /^\d+$/.test(num)) {
      return `${compId}:col${num}-bot`;
    }
    return ref;
  };

  // Union all wire endpoints (using normalized refs for breadboard grouping)
  connections.forEach(conn => {
    const a = normalize(conn.from);
    const b = normalize(conn.to);
    if (a && b) union(a, b);
  });

  // Find the net of the selected wire
  const selConn = connections[selectedIdx];
  if (!selConn) return new Set();
  const selNet = find(normalize(selConn.from));

  // Collect all wires in the same net
  const result = new Set();
  connections.forEach((conn, i) => {
    const a = find(normalize(conn.from));
    const b = find(normalize(conn.to));
    if (a === selNet || b === selNet) result.add(i);
  });
  return result;
}

const WireRenderer = ({
  connections = [],
  components = [],
  layout = {},
  componentStates = {},
  wireCurrents = {},
  selectedWireIndex = -1,
  onWireClick = null,
  onWireDelete = null,
  routingMode = 'flex', // 'flex' | 'book'
  electronViewEnabled = false, // Electron View PoC: enhanced particle animation
}) => {
  const [hoveredWireIndex, setHoveredWireIndex] = useState(-1);

  // S107: useRef instead of useMemo — instance is stable, .clear() resets per render (P2-WIR-2)
  const collisionDetectorRef = useRef(new WireCollisionDetector());
  const collisionDetector = collisionDetectorRef.current;

  // Compute net highlight for selected wire (shows connected wires in same net)
  const netHighlight = useMemo(
    () => computeNetHighlight(connections, selectedWireIndex),
    [connections, selectedWireIndex]
  );

  const { wires, wirePathData } = useMemo(() => {
    // Clear collision detector at start of wire computation
    collisionDetector.clear();
    const pathData = {};

    const wireElements = connections.map((conn, index) => {
      const fromPos = resolvePinPosition(conn.from, components, layout);
      const toPos = resolvePinPosition(conn.to, components, layout);

      if (!fromPos || !toPos) {
        return null;
      }

      // Auto wire color: if no color specified, infer from pin function
      let wireColor;
      if (conn.color) {
        wireColor = WIRE_COLORS[conn.color] || conn.color;
      } else {
        wireColor = inferWireColorHex(conn.from, conn.to);
      }

      // Compute routed path through breadboard
      const hasCustomWaypoints = Array.isArray(conn.waypoints) && conn.waypoints.length > 0;
      const baseWaypoints = hasCustomWaypoints
        ? conn.waypoints
        : computeRoutedWire(fromPos, toPos, components, layout, conn.from, conn.to);

      // Battery wires (off-board → bus rail) skip component avoidance to keep clean
      // 2-point Bézier catenary. A* waypoints tangle with polarity-based sag separation.
      const isBatteryWire = conn.from.startsWith('bat') || conn.to.startsWith('bat');
      const shouldAvoidCollisions = !hasCustomWaypoints && routingMode !== 'book';
      const hasComponentAvoidance = !hasCustomWaypoints && !isBatteryWire;

      let waypoints = hasComponentAvoidance
        ? applyComponentAvoidance(baseWaypoints, components, layout)
        : baseWaypoints;

      waypoints = shouldAvoidCollisions
        ? applyCollisionAvoidance(waypoints, index, collisionDetector)
        : waypoints;

      const pathStyle = conn.pathStyle || 'smooth'; // Always smooth curves — rounder, more usable
      // Detect polarity for sag direction: positive wires sag right, negative sag left
      const polarity = detectPolarity(conn.from, conn.to);
      const path = buildRoutedPath(waypoints, {
        style: pathStyle,
        enableSag: true,
        sagDirection: polarity !== 0 ? polarity : 1,
        polarity,
      });

      if (!path) return null;

      // Current data from solver (direction, magnitude)
      const wireCurrent = wireCurrents[index] || null;
      const currentDirection = wireCurrent?.direction ?? 0;   // 1=forward, -1=reverse, 0=none
      const currentMagnitude = wireCurrent?.magnitude ?? 0;   // mA

      // BUG FIX: Check BOTH endpoints for current (not just "from")
      const [fromCompId] = conn.from.split(':');
      const [toCompId] = conn.to.split(':');
      const fromState = componentStates[fromCompId] || {};
      const toState = componentStates[toCompId] || {};
      const hasCurrent = currentDirection !== 0
        || (fromState.current || 0) > 0.0001 || (toState.current || 0) > 0.0001
        || (fromState.on && fromState.brightness > 0) || (toState.on && toState.brightness > 0);

      const isSelected = index === selectedWireIndex;
      const isInNet = !isSelected && netHighlight.has(index);
      const elements = [];

      // Invisible hit area — thick transparent stroke for easy clicking
      if (onWireClick) {
        elements.push(
          <path
            key="hit-area"
            d={path}
            stroke="transparent"
            strokeWidth={routingMode === 'book' ? 32 : 40}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
            onClick={(e) => {
              e.stopPropagation();
              onWireClick(index);
            }}
            onMouseEnter={() => setHoveredWireIndex(index)}
            onMouseLeave={() => setHoveredWireIndex((prev) => prev === index ? -1 : prev)}
          />
        );
      }


      // Selection glow (when wire is selected)
      if (isSelected) {
        elements.push(
          <path
            key="selection-glow"
            d={path}
            stroke="var(--color-accent)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
            strokeDasharray="8 4"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1s" repeatCount="indefinite" />
          </path>
        );
      }

      // Net highlight glow (same electrical net as selected wire)
      if (isInNet) {
        elements.push(
          <path
            key="net-highlight-glow"
            d={path}
            stroke="var(--color-accent)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
        );
      }

      // Main wire — slightly thicker for usability
      const baseStrokeWidth = routingMode === 'book' ? 2.5 : 2.8;
      elements.push(
        <path
          key="main-wire"
          d={path}
          stroke={isSelected || isInNet ? 'var(--color-accent)' : wireColor}
          strokeWidth={isSelected ? 4 : isInNet ? 3 : baseStrokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isSelected || isInNet ? 1 : (routingMode === 'book' ? 0.94 : 1)}
        />
      );

      // Wire endpoint dots — insertion tips at breadboard holes
      if (waypoints && waypoints.length > 0) {
        const start = waypoints[0];
        const end = waypoints[waypoints.length - 1];
        const fromIsBB = fromPos?.compType === 'breadboard-half' || fromPos?.compType === 'breadboard-full';
        const toIsBB = toPos?.compType === 'breadboard-half' || toPos?.compType === 'breadboard-full';

        if (fromIsBB) {
          elements.push(
            <g key="start-endpoint-bb">
              <circle cx={start.x} cy={start.y} r="1.6" fill="var(--color-wire-endpoint)" />
              <circle cx={start.x} cy={start.y} r="1.0" fill={wireColor} />
            </g>
          );
        } else {
          elements.push(<circle key="start-endpoint" cx={start.x} cy={start.y} r="1.8" fill={wireColor} opacity="0.7" />);
        }

        if (toIsBB) {
          elements.push(
            <g key="end-endpoint-bb">
              <circle cx={end.x} cy={end.y} r="1.6" fill="var(--color-wire-endpoint)" />
              <circle cx={end.x} cy={end.y} r="1.0" fill={wireColor} />
            </g>
          );
        } else {
          elements.push(<circle key="end-endpoint" cx={end.x} cy={end.y} r="1.8" fill={wireColor} opacity="0.7" />);
        }
      }

      // Current flow animation — direction-aware dots with speed/color coding
      if (hasCurrent) {
        const mag = currentMagnitude || 0;
        const dir = currentDirection || 1;

        // Skip animation for very low current
        if (mag > 0 && mag < 0.1) { /* do nothing */ } else {
          // Speed: duration = 1.2 / clamp(mA/10, 0.5, 3)
          const speedFactor = mag > 0 ? Math.max(0.5, Math.min(3, mag / 10)) : 1;
          const duration = 1.2 / speedFactor;

          // Color coding: normal=golden, high(>20mA)=orange, short circuit(>100mA)=red
          let dotColor = 'var(--color-current-normal)';
          let dotOpacity = 0.7;
          let isShortCircuit = false;
          if (mag > 100) {
            dotColor = 'var(--color-current-short)';
            isShortCircuit = true;
          } else if (mag > 20) {
            dotColor = 'var(--color-current-high)';
          }

          // CoVe Fix #11 + S52 Bezier-safe reverse
          const reversePath = dir < 0 ? reverseSvgPath(path) : path;

          if (electronViewEnabled) {
            // ── ELECTRON VIEW: Enhanced particle system ──
            // More particles, glow effect, color by magnitude thresholds
            const evColor = mag > 50 ? 'var(--elab-hex-f44336)' : mag > 5 ? 'var(--elab-hex-ff9800)' : 'var(--elab-hex-ffd54f)';
            const evParticleCount = Math.min(12, Math.max(3, Math.round(mag / 8)));
            const evRadius = mag > 50 ? 2.5 : mag > 5 ? 2.0 : 1.6;
            const evDuration = duration * 0.8; // slightly faster for drama

            elements.push(
              <g key="electron-view-animation">
                {Array.from({ length: evParticleCount }, (_, di) => {
                  const offset = di / evParticleCount;
                  return (
                    <g key={`ev-${di}`}>
                      {/* Glow halo */}
                      <circle r={evRadius * 2.5} fill={evColor} opacity="0.12">
                        <animateMotion
                          path={dir < 0 ? reversePath : path}
                          dur={`${evDuration}s`}
                          begin={`${offset * evDuration}s`}
                          repeatCount="indefinite"
                          calcMode="linear"
                        />
                      </circle>
                      {/* Core particle */}
                      <circle r={evRadius} fill={evColor} opacity="0.9">
                        <animateMotion
                          path={dir < 0 ? reversePath : path}
                          dur={`${evDuration}s`}
                          begin={`${offset * evDuration}s`}
                          repeatCount="indefinite"
                          calcMode="linear"
                        />
                        {isShortCircuit && (
                          <animate
                            attributeName="opacity"
                            values="0.5;1;0.5"
                            dur="0.3s"
                            repeatCount="indefinite"
                          />
                        )}
                      </circle>
                      {/* Bright center dot */}
                      <circle r={evRadius * 0.4} fill="var(--elab-hex-ffffff)" opacity="0.7">
                        <animateMotion
                          path={dir < 0 ? reversePath : path}
                          dur={`${evDuration}s`}
                          begin={`${offset * evDuration}s`}
                          repeatCount="indefinite"
                          calcMode="linear"
                        />
                      </circle>
                    </g>
                  );
                })}
              </g>
            );
          } else {
            // ── Standard mode: 3 subtle dots ──
            elements.push(
              <g key="current-animation">
                {[0, 0.33, 0.66].map((offset, di) => (
                  <circle key={`dot-${di}`} r="1.3" fill={dotColor} opacity={dotOpacity}>
                    <animateMotion
                      path={dir < 0 ? reversePath : path}
                      dur={`${duration}s`}
                      begin={`${offset * duration}s`}
                      repeatCount="indefinite"
                      calcMode="linear"
                    />
                    {isShortCircuit && (
                      <animate
                        attributeName="opacity"
                        values="0.4;1;0.4"
                        dur="0.4s"
                        repeatCount="indefinite"
                      />
                    )}
                  </circle>
                ))}
              </g>
            );
          }
        }
      }

      // ─── INTERACTION HANDLES (only for selected wire) ───
      if (selectedWireIndex === index) {
        // 1. Anchor waypoints (first/last — locked to pins, not draggable)
        [0, waypoints.length - 1].forEach((wpIdx) => {
          const wp = waypoints[wpIdx];
          elements.push(
            <circle
              key={`anchor-${index}-${wpIdx}`}
              cx={wp.x} cy={wp.y}
              r={3}
              fill="var(--color-primary)"
              stroke="var(--color-text-inverse)"
              strokeWidth="1.5"
              opacity="0.7"
              style={{ cursor: 'default', pointerEvents: 'none' }}
            />
          );
        });

        // 2. Handles for draggable middle waypoints (large touch-friendly hit area)
        const handleRadius = 5;
        const hitRadius = 18; // Touch-friendly: ~36px diameter in SVG space
        waypoints.forEach((wp, wpIdx) => {
          if (wpIdx === 0 || wpIdx === waypoints.length - 1) return;

          elements.push(
            <g key={`handle-${index}-${wpIdx}`}>
              {/* Invisible touch-friendly hit area */}
              <circle
                cx={wp.x} cy={wp.y}
                r={hitRadius}
                fill="transparent"
                style={{ cursor: 'move', pointerEvents: 'all' }}
                data-wire-index={index}
                data-waypoint-index={wpIdx}
                data-action="move-waypoint"
              />
              {/* Visual handle (smaller, on top) */}
              <circle
                cx={wp.x} cy={wp.y}
                r={handleRadius}
                fill="var(--color-text-inverse)"
                stroke="var(--color-accent)"
                strokeWidth="2"
                style={{ pointerEvents: 'none' }}
              />
            </g>
          );
        });

        // 3. "Split" handles on segments (to create new waypoints)
        for (let i = 0; i < waypoints.length - 1; i++) {
          const start = waypoints[i];
          const end = waypoints[i + 1];
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;

          // Invisible click/drag target (wider for easier touch)
          elements.push(
            <line
              key={`segment-hit-${index}-${i}`}
              x1={start.x} y1={start.y} x2={end.x} y2={end.y}
              stroke="transparent"
              strokeWidth="24"
              style={{ cursor: 'crosshair', pointerEvents: 'all' }}
              data-wire-index={index}
              data-segment-index={i}
              data-action="split-segment"
            />
          );

          // Visual hint dot at midpoint (larger for discoverability)
          elements.push(
            <circle
              key={`midpoint-${index}-${i}`}
              cx={midX} cy={midY}
              r={5}
              fill="var(--color-accent)"
              opacity="0.45"
              style={{ pointerEvents: 'none' }}
            />
          );
        }

        // 3. Delete button for touch/mobile (centered on middle segment)
        if (onWireDelete) {
          const midSegmentIdx = Math.floor((waypoints.length - 1) / 2);
          const segStart = waypoints[midSegmentIdx];
          const segEnd = waypoints[midSegmentIdx + 1];
          const delX = (segStart.x + segEnd.x) / 2;
          const delY = (segStart.y + segEnd.y) / 2;
          elements.push(
            <g
              key={`delete-wire-${index}`}
              transform={`translate(${delX}, ${delY - 14})`}
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWireDelete(index);
              }}
              onTouchEnd={(e) => { // Support both click and touchEnd
                e.preventDefault();
                e.stopPropagation();
                onWireDelete(index);
              }}
            >
              <circle r="18" fill="transparent" stroke="none" />
              <circle r="9" fill="var(--color-vol3)" stroke="var(--color-text-inverse)" strokeWidth="1.2" opacity="0.95" />
              <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="var(--color-text-inverse)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="var(--color-text-inverse)" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          );
        }
      }

      // Store path data for hover overlay (rendered outside useMemo)
      pathData[index] = { path, color: wireColor };

      return (
        <g key={index} className="wire-group">
          {elements}
        </g>
      );
    }).filter(Boolean);
    return { wires: wireElements, wirePathData: pathData };
  }, [connections, components, layout, componentStates, wireCurrents, selectedWireIndex, netHighlight, routingMode]);

  // Hover glow overlay — rendered outside useMemo to avoid expensive recomputation
  const hoverGlow = hoveredWireIndex >= 0
    && hoveredWireIndex !== selectedWireIndex
    && wirePathData[hoveredWireIndex]
    ? (
      <path
        d={wirePathData[hoveredWireIndex].path}
        stroke={wirePathData[hoveredWireIndex].color}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.25"
        pointerEvents="none"
      />
    ) : null;

  return (
    <g className="wires-layer">
      {wires}
      {hoverGlow}
    </g>
  );
};

export {
  resolvePinPosition,
  computeRoutedWire,
  applyCollisionAvoidance,
  WireCollisionDetector,
  getAutoWireColor,
};
export default WireRenderer;
