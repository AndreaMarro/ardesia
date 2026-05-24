/**
 * ELAB Simulator — SimulatorCanvas
 * Canvas SVG principale: rendering componenti, zoom/pan, touch pinch, selezione,
 * drag-and-drop, wire drawing, component rotation, delete, palette drop
 * © Andrea Marro — 10/02/2026
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { getComponent } from '../components/registry';
import WireRenderer, { resolvePinPosition } from './WireRenderer';
import PinOverlay from './PinOverlay';
import Annotation from '../components/Annotation';
import RotationHandle, { snapToNearestQuadrant } from '../overlays/RotationHandle';


// Import componenti (side-effect: si registrano nel registry)
import '../components/Battery9V';
import '../components/Led';
import '../components/RgbLed';
import '../components/Resistor';
import '../components/PushButton';
import '../components/Potentiometer';
import '../components/PhotoResistor';
import '../components/BuzzerPiezo';
import '../components/Capacitor';
import '../components/MosfetN';
import '../components/Phototransistor';
import '../components/MotorDC';
import '../components/Diode';
import '../components/ReedSwitch';
import '../components/Multimeter';
import '../components/Wire';
import '../components/BreadboardHalf';
import '../components/BreadboardFull';
import '../components/NanoR4Board';
import '../components/Servo';
import '../components/LCD16x2';

const DEFAULT_VIEWBOX = { x: 10, y: -15, width: 570, height: 290 };
const MIN_ZOOM = 0.3;  // S116: raised from 0.2 — prevents canvas becoming too small on iPad
const MAX_ZOOM = 3.0;  // S116: lowered from 4 — prevents excessive pixelation on pinch-zoom
const PIN_HIT_TOLERANCE = 16; // LIM-friendly pin hit-test tolerance (px in SVG-space)

// ─── Component approximate bounding boxes (width x height from center) ───
// Used for auto-fit viewbox calculation
const COMP_SIZES = {
  'nano-r4': { w: 167.58, h: 99.0 },  // ELAB breakout V1.1 GP HORIZONTAL: body 139.5w + wing 28.08 overhang = ~167.58 total width, height = 99.0 (BOARD_H)
  'breadboard-half': { w: 253, h: 145 },  // BOARD_W=30*7.5+14*2=253, BOARD_H=145 (from BreadboardHalf.jsx)
  'breadboard-full': { w: 110, h: 469 },  // VERTICAL: W=8*2+14+5*7*2+10=110, H=8*2+6*2+63*7=469 (from BreadboardFull.jsx)
  'battery9v': { w: 40, h: 90 },
  'led': { w: 20, h: 50 },
  'rgb-led': { w: 36, h: 50 },
  'resistor': { w: 60, h: 16 },
  'push-button': { w: 20, h: 20 },
  'potentiometer': { w: 24, h: 50 },
  'photo-resistor': { w: 16, h: 44 },
  'buzzer-piezo': { w: 20, h: 44 },
  'capacitor': { w: 12, h: 40 },
  'mosfet-n': { w: 44, h: 48 },
  'phototransistor': { w: 12, h: 40 },
  'motor-dc': { w: 20, h: 36 },
  'diode': { w: 44, h: 12 },
  'reed-switch': { w: 48, h: 12 },
  'multimeter': { w: 70, h: 100 },
  'servo': { w: 52, h: 66 },
  'lcd16x2': { w: 180, h: 70 },
};

/**
 * Check if a dropped component overlaps with any existing ones.
 * Tinkercad realism: components cannot overlap unless they are small components sitting ON a breadboard.
 */
function isValidDropPosition(compType, dropX, dropY, rot, experiment, ignoreCompId = null) {
  if (!experiment || !experiment.components) return true;

  const getBBox = (type, px, py, rotation) => {
    let size = COMP_SIZES[type] || { w: 40, h: 40 };
    if (rotation === 90 || rotation === 270) size = { w: size.h, h: size.w };

    // Breadboards and Nano draw from top-left, everything else from center
    const isTopLeft = ['breadboard-half', 'breadboard-full', 'nano-r4'].includes(type);
    if (isTopLeft) {
      return { left: px, right: px + size.w, top: py, bottom: py + size.h };
    } else {
      return { left: px - size.w / 2, right: px + size.w / 2, top: py - size.h / 2, bottom: py + size.h / 2 };
    }
  };

  const isArduino = compType === 'nano-r4';
  const isSysBoard = isArduino || compType === 'breadboard-half' || compType === 'breadboard-full';

  const droppedBBox = getBBox(compType, dropX, dropY, rot);
  const SHRINK = 2; // pixel forgiveness

  for (const comp of experiment.components) {
    if (comp.id === ignoreCompId) continue;
    if (comp.type === 'wire') continue; // wires don't overlap

    const pos = experiment.layout?.[comp.id];
    if (!pos) continue;

    const compIsBoard = ['breadboard-half', 'breadboard-full'].includes(comp.type);
    const compIsArduino = comp.type === 'nano-r4';

    // Components sitting ON breadboards are allowed
    if (!isSysBoard && compIsBoard) continue;
    if (compType === 'breadboard-half' || compType === 'breadboard-full') {
      if (!compIsArduino && comp.type !== 'breadboard-half' && comp.type !== 'breadboard-full') continue;
    }

    const bbox = getBBox(comp.type, pos.x, pos.y, pos.rotation || 0);

    const overlapX = (droppedBBox.right - SHRINK) > (bbox.left + SHRINK) && (droppedBBox.left + SHRINK) < (bbox.right - SHRINK);
    const overlapY = (droppedBBox.bottom - SHRINK) > (bbox.top + SHRINK) && (droppedBBox.top + SHRINK) < (bbox.bottom - SHRINK);

    if (overlapX && overlapY) {
      // Allow overlaps for free Tinkercad-style placement as per user request
      return true; // We can show a warning later if needed, but DO NOT prevent drop
    }
  }
  return true;
}

// ─── Snap-to-grid utility (7.5px breadboard pitch) ───
const GRID_PITCH = 7.5;
const snapToGridPoint = (val) => Math.round(val / GRID_PITCH) * GRID_PITCH;

// ─── FIX S112: Snap-to-hole — uses registered component pins as source of truth ───
// Works for ANY breadboard type (Half, Full, or future variants) by reading
// the actual pin positions from the component registry instead of hardcoded constants.
const BB_HOLE_PITCH_DEFAULT = 7.5; // fallback for threshold calc
const SNAP_THRESHOLD_FACTOR = 0.9; // snap within 90% of hole pitch

// Cache pin arrays per breadboard type to avoid re-fetching on every mouse move
const _snapPinCache = {};
function getSnapPins(bbType) {
  if (_snapPinCache[bbType]) return _snapPinCache[bbType];
  const registered = getComponent(bbType);
  if (!registered || !registered.pins) return null;
  // Filter out summary power pins (bus-plus/bus-minus without row number)
  // that share position with bus-plus-1/bus-minus-1
  const pins = registered.pins.filter(p => p.id !== 'bus-plus' && p.id !== 'bus-minus');
  _snapPinCache[bbType] = pins;
  return pins;
}

function getSnapThreshold(bbType) {
  const registered = getComponent(bbType);
  const holeSpacing = registered?.boardDimensions?.holeSpacing || BB_HOLE_PITCH_DEFAULT;
  return holeSpacing * SNAP_THRESHOLD_FACTOR;
}

/**
 * Find the nearest breadboard hole to a given point.
 * Uses the breadboard component's own pin definitions as the grid source of truth,
 * ensuring snap positions always match rendered hole positions.
 * Returns { x, y, pinId } if within snap threshold, or null.
 */
function snapToNearestHole(px, py, bbX, bbY, bbType = 'breadboard-half') {
  const pins = getSnapPins(bbType);
  if (!pins) return null;

  const threshold = getSnapThreshold(bbType);
  let bestDist = threshold;
  let bestPos = null;

  for (const pin of pins) {
    const holeX = bbX + pin.x;
    const holeY = bbY + pin.y;
    const dist = Math.hypot(px - holeX, py - holeY);
    if (dist < bestDist) {
      bestDist = dist;
      bestPos = { x: holeX, y: holeY, pinId: pin.id };
    }
  }

  return bestPos;
}

/**
 * Pin-aware snap: given a component being dragged (with its origin at newX, newY),
 * find the best breadboard hole for ANY of its pins. Returns the adjusted component
 * origin {x, y} so that the closest pin lands exactly on a hole, or null if no snap.
 *
 * This is the key fix for "components detaching from breadboard" — previously we
 * snapped the component CENTER to a hole, but pins are offset from center, so they
 * never actually landed on holes. Now we test each pin's absolute position and snap
 * the component so the best-matching pin lands perfectly on its nearest hole.
 */
function snapComponentToHole(compType, newX, newY, bbX, bbY, bbType = 'breadboard-half') {
  const registered = getComponent(compType);
  if (!registered || !registered.pins || registered.pins.length === 0) {
    return snapToNearestHole(newX, newY, bbX, bbY, bbType);
  }

  const threshold = getSnapThreshold(bbType);
  let bestDist = threshold * 2.5; // generous initial bound — inner snapToNearestHole limits actual catch
  let bestResult = null;

  for (const pin of registered.pins) {
    const pinAbsX = newX + pin.x;
    const pinAbsY = newY + pin.y;

    const snap = snapToNearestHole(pinAbsX, pinAbsY, bbX, bbY, bbType);
    if (snap) {
      const dist = Math.hypot(pinAbsX - snap.x, pinAbsY - snap.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestResult = {
          x: snap.x - pin.x,
          y: snap.y - pin.y,
          pinId: snap.pinId,
          snappedPinId: pin.id
        };
      }
    }
  }

  return bestResult;
}

/**
 * S115: Compute per-pin snap hole positions for visual preview during drag.
 * Returns [{x, y, occupied}] for each pin that would land on a breadboard hole.
 * `occupied` is true if another component already has a pin on that hole.
 */
function getSnapPinHoles(compType, compX, compY, bbX, bbY, bbType, dragCompId, experiment) {
  const registered = getComponent(compType);
  if (!registered || !registered.pins || registered.pins.length === 0) return [];

  const holes = [];
  const threshold = getSnapThreshold(bbType);

  // Build set of occupied hole positions (from other components' layouts)
  const occupiedSet = new Set();
  if (experiment?.components && experiment?.layout) {
    for (const comp of experiment.components) {
      if (comp.id === dragCompId) continue; // skip the dragged component
      const noSnap = ['breadboard-half', 'breadboard-full', 'battery9v', 'nano-r4'];
      if (noSnap.includes(comp.type)) continue;
      const pos = experiment.layout[comp.id];
      if (!pos) continue;
      const reg = getComponent(comp.type);
      if (!reg?.pins) continue;
      for (const pin of reg.pins) {
        const pinAbsX = pos.x + pin.x;
        const pinAbsY = pos.y + pin.y;
        // Snap this pin to nearest hole to determine which hole it occupies
        const snap = snapToNearestHole(pinAbsX, pinAbsY, bbX, bbY, bbType);
        if (snap) {
          occupiedSet.add(`${Math.round(snap.x * 10)},${Math.round(snap.y * 10)}`);
        }
      }
    }
  }

  for (const pin of registered.pins) {
    const pinAbsX = compX + pin.x;
    const pinAbsY = compY + pin.y;
    const snap = snapToNearestHole(pinAbsX, pinAbsY, bbX, bbY, bbType);
    if (snap && Math.hypot(pinAbsX - snap.x, pinAbsY - snap.y) < threshold * 2.5) {
      const key = `${Math.round(snap.x * 10)},${Math.round(snap.y * 10)}`;
      holes.push({ x: snap.x, y: snap.y, occupied: occupiedSet.has(key) });
    }
  }

  return holes;
}

/**
 * Calculate a viewbox that fits all components with padding.
 * Optionally accepts the container DOM element to use its real aspect ratio
 * instead of a hardcoded 4:3. This prevents drift on oddly-shaped containers.
 * Returns { x, y, width, height }.
 */
function calcAutoFitViewbox(experiment, containerEl) {
  if (!experiment || !experiment.components || !experiment.layout) return DEFAULT_VIEWBOX;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let hasComponents = false;

  // Components that render from top-left corner (not centered)
  const TOP_LEFT_ORIGIN = new Set(['breadboard-half', 'breadboard-full', 'nano-r4']);

  experiment.components.forEach(comp => {
    const pos = experiment.layout[comp.id];
    if (!pos) return;
    hasComponents = true;
    const size = COMP_SIZES[comp.type] || { w: 40, h: 40 };

    let left, right, top, bottom;
    if (TOP_LEFT_ORIGIN.has(comp.type)) {
      // These components use translate(x,y) as top-left corner
      // When rotated around (pos.x, pos.y), the bounding box changes
      const rotation = pos.rotation || 0;
      if (rotation === 0) {
        left = pos.x;
        right = pos.x + size.w;
        top = pos.y;
        bottom = pos.y + size.h;
      } else {
        // Transform 4 corners of the unrotated rect through the rotation
        const rad = (rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const corners = [
          { x: 0, y: 0 },
          { x: size.w, y: 0 },
          { x: size.w, y: size.h },
          { x: 0, y: size.h },
        ];
        const xs = corners.map(c => pos.x + c.x * cos - c.y * sin);
        const ys = corners.map(c => pos.y + c.x * sin + c.y * cos);
        left = Math.min(...xs);
        right = Math.max(...xs);
        top = Math.min(...ys);
        bottom = Math.max(...ys);
      }
    } else {
      // Standard centered components
      const hw = size.w / 2;
      const hh = size.h / 2;
      left = pos.x - hw;
      right = pos.x + hw;
      top = pos.y - hh;
      bottom = pos.y + hh;
    }

    if (left < minX) minX = left;
    if (right > maxX) maxX = right;
    if (top < minY) minY = top;
    if (bottom > maxY) maxY = bottom;
  });

  if (!hasComponents) return DEFAULT_VIEWBOX;

  const PAD = 30; // padding around all components
  const w = maxX - minX + PAD * 2;
  const h = maxY - minY + PAD * 2;

  // Use actual container aspect ratio if available, otherwise default to 4:3
  let aspectTarget = 4 / 3;
  if (containerEl) {
    const rect = containerEl.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      aspectTarget = rect.width / rect.height;
    }
  }

  // Ensure minimum viewbox fills the screen nicely — prevents tiny circuits on large displays
  let finalW = Math.max(w, 500);
  let finalH = Math.max(h, 350);
  const currentAspect = finalW / finalH;
  if (currentAspect < aspectTarget) {
    finalW = finalH * aspectTarget;
  } else if (currentAspect > aspectTarget * 1.5) {
    finalH = finalW / aspectTarget;
  }

  return {
    x: minX - PAD - (finalW - w) / 2,
    y: minY - PAD - (finalH - h) / 2,
    width: finalW,
    height: finalH,
  };
}

/**
 * Convert a mouse/client-space point to SVG user-space coordinates
 * using the SVG's current viewBox / CTM.
 */
function clientToSVG(svgEl, clientX, clientY) {
  if (!svgEl) return { x: 0, y: 0 };
  const pt = svgEl.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svgEl.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const svgPt = pt.matrixTransform(ctm.inverse());
  return { x: svgPt.x, y: svgPt.y };
}

// resolvePinPosition imported from WireRenderer (single source of truth)
// Returns { x, y, componentId, pinId, compType } — callers here only use .x and .y

/**
 * Hit-test: given an SVG coordinate, find the closest pin within a tolerance.
 * Returns "componentId:pinId" or null.
 */
/** S88: Check if a pinRef belongs to a breadboard component */
function isBreadboardPin(pinRef, components) {
  if (!pinRef) return false;
  const compId = pinRef.split(':')[0];
  const comp = components?.find(c => c.id === compId);
  return comp && (comp.type === 'breadboard-half' || comp.type === 'breadboard-full');
}

function hitTestPin(svgX, svgY, components, layout, tolerance = PIN_HIT_TOLERANCE) {
  let best = null;
  let bestDist = tolerance;

  for (const comp of components) {
    const registered = getComponent(comp.type);
    if (!registered || !registered.pins) continue;
    const pos = layout?.[comp.id];
    if (!pos) continue;

    const rotation = pos.rotation || 0;
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    for (const pin of registered.pins) {
      let px = pin.x;
      let py = pin.y;
      if (rotation !== 0) {
        const rx = px * cos - py * sin;
        const ry = px * sin + py * cos;
        px = rx;
        py = ry;
      }
      const absX = pos.x + px;
      const absY = pos.y + py;
      const dist = Math.hypot(absX - svgX, absY - svgY);
      if (dist < bestDist) {
        bestDist = dist;
        best = `${comp.id}:${pin.id}`;
      }
    }
  }
  return best;
}

/**
 * Task 5: Resolve pin info from a "componentId:pinId" ref.
 * Returns { label, details } or null.
 */
function getPinInfo(pinRef, components, componentStates) {
  if (!pinRef) return null;
  const [compId, pinId] = pinRef.split(':');
  const comp = components?.find(c => c.id === compId);
  if (!comp) return null;
  const registered = getComponent(comp.type);
  if (!registered?.pins) return null;
  const pinDef = registered.pins.find(p => p.id === pinId);
  if (!pinDef) return null;
  const label = pinDef.label || pinId;
  const state = componentStates?.[compId];
  let details = '';
  if (state?.voltage !== undefined && state.voltage !== null) {
    const v = typeof state.voltage === 'object' ? state.voltage[pinId] : state.voltage;
    if (v !== undefined && v !== null) details = `${Number(v).toFixed(1)}V`;
  }
  return { label, details };
}

const SimulatorCanvas = ({
  experiment = null,
  componentStates = {},
  highlightedComponents = [],
  highlightedPins = [],
  onComponentClick,
  onComponentValueChange,
  onPinClick,
  onLayoutChange,
  onConnectionAdd,
  onComponentDelete,
  onComponentAdd,
  onWireClick,
  onWireDelete,
  onWireUpdate, // New prop: (wireIndex, newConnectionData) => void
  selectedWireIndex = -1,
  wireMode: wireModeExternal = false,
  onWireModeChange,
  // V3: undo/redo push callback
  onSnapshotPush,
  // V1: probe connection change callback (multimeter probe drag)
  onProbeConnectionChange,
  // Session 30: Build validation for "Monta tu!" mode
  buildValidation = null,
  onBuildValidationResult,
  // Session 30: Snap-to-grid for sandbox mode (7.5px breadboard grid)
  snapToGrid = false,
  // Sprint 3: Annotations
  annotations = [],
  selectedAnnotation = null,
  onAnnotationSelect,
  onAnnotationTextChange,
  onAnnotationDelete,
  onAnnotationPositionChange,
  onSendToUNLIM,
  // Task 3: Selection change callback (for ControlBar delete/rotate buttons)
  onSelectionChange,
  electronViewEnabled = false,
  className = '',
  style = {}
}) => {
  const svgRef = useRef(null);
  const [viewBox, setViewBox] = useState(DEFAULT_VIEWBOX);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const touchRef = useRef({ lastDist: 0, lastMid: null });

  // --- DRAG STATE ---
  const [isDragging, setIsDragging] = useState(false);
  const [dragCompId, setDragCompId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragMovedRef = useRef(false); // true if mouse moved during drag (prevents click)
  const lastDragPosRef = useRef(null); // true real-time coord to fix stale react state on drop
  const compClickedRef = useRef(false); // true when a component was clicked (prevents background deselect)
  const panDistRef = useRef(0); // S72 P2-DESELECT-1: total pan distance to filter accidental deselect
  // S101: Touch drag dead zone — prevents accidental drags on tap
  const dragDeadZonePassedRef = useRef(false);
  const dragStartClientRef = useRef(null); // { clientX, clientY } at drag start
  // S115: Touch-aware dead zone — touch is less precise than mouse
  const DRAG_DEAD_ZONE_MOUSE = 5; // px in screen space (mouse/pen)
  const DRAG_DEAD_ZONE_TOUCH = 10; // px in screen space (touch — prevents accidental drags)

  // --- WIRE DRAG STATE (V4) ---
  // { wireIndex, waypointIndex, action: 'move-waypoint' | 'split-segment', originalWaypoints }
  const [wireDragState, setWireDragState] = useState(null);

  // --- POTENTIOMETER KNOB ROTATION STATE ---
  const potRotatingRef = useRef(null); // { componentId, centerX, centerY } during knob drag

  // --- CLICK RESOLUTION STATE (drag-vs-click disambiguation) ---
  const pendingClickRef = useRef(null); // { componentId, compType, wasAlreadySelected }

  // --- WIRE MODE STATE (controlled by parent or internal) ---
  const [wireModeInternal, setWireModeInternal] = useState(false);
  const wireMode = wireModeExternal || wireModeInternal;
  const setWireMode = onWireModeChange || setWireModeInternal;
  const [wireStart, setWireStart] = useState(null); // "componentId:pinId"
  const [wireStartPos, setWireStartPos] = useState(null); // { x, y } SVG coords
  const [wirePreviewEnd, setWirePreviewEnd] = useState(null); // { x, y } SVG coords
  const wireAutoRef = useRef(false); // true when wire mode was auto-activated by clicking a pin

  // --- DRAG PREVIEW STATE (ghost component from palette) ---
  const [dragPreview, setDragPreview] = useState(null); // { type, x, y } or null
  const [dropError, setDropError] = useState(false); // Build validation: flash red on wrong component
  const [dropSuccess, setDropSuccess] = useState(false); // Build validation: flash green on correct placement
  // Sprint 2 Task 2.3: Auto-correction animation { fromX, fromY, toX, toY, type, phase: 'red'|'slide'|'green' }
  const [autoCorrection, setAutoCorrection] = useState(null);
  // Sprint 2 Task 2.4: Highlighted breadboard holes during guided drag
  const [highlightedHoles, setHighlightedHoles] = useState([]); // Guided mode holes
  const [snapGhost, setSnapGhost] = useState(null); // { x, y, w, h } — snap ghost preview
  const [snapPinHoles, setSnapPinHoles] = useState([]); // S115: [{x, y, occupied}] — per-pin hole highlights during drag
  const dragStartPosRef = useRef(null); // Track starting point to revert invalid drops

  // --- PIN HOVER TOOLTIP STATE (Task 5: touch-friendly) ---
  const [hoveredPin, setHoveredPin] = useState(null); // { clientX, clientY, label, details, ref } or null
  const hoveredPinRef = useRef(null); // ref mirror for use in callbacks without dep-array re-render
  const hoverThrottleRef = useRef(0); // throttle pin hover checks
  const pinTooltipTimerRef = useRef(null); // auto-dismiss timer for touch/pen

  // Keep hoveredPinRef in sync (avoids hoveredPin in useCallback deps)
  useEffect(() => { hoveredPinRef.current = hoveredPin; }, [hoveredPin]);

  // --- V1: MULTIMETER PROBE DRAG STATE ---
  const [probePositions, setProbePositions] = useState({}); // { mmId: { positive: {x,y}, negative: {x,y} } }
  const [probeConnections, setProbeConnections] = useState({}); // { mmId: { positive: 'led1:anode', negative: null } }
  const [probeSnapped, setProbeSnapped] = useState({}); // { mmId: { positive: true, negative: false } }
  const probeDragRef = useRef(null); // { mmId, probeId }
  // CoVe Fix #5: Traccia listener per cleanup su unmount
  const probeListenersRef = useRef({ drag: null, up: null });
  // G42: Traccia pending pointerup release handler per cleanup su unmount
  const pendingReleaseRef = useRef(null);

  // --- V1: Notify parent when probe connections change ---
  useEffect(() => {
    if (onProbeConnectionChange && Object.keys(probeConnections).length > 0) {
      onProbeConnectionChange(probeConnections);
    }
  }, [probeConnections, onProbeConnectionChange]);

  // --- V2: MULTI-SELECT STATE ---
  const [selectedComponents, setSelectedComponents] = useState(new Set());
  const [selectionBox, setSelectionBox] = useState(null); // { startX, startY, endX, endY }
  const selectionStartRef = useRef(null); // SVG coords of selection drag start

  // --- V3: CLIPBOARD STATE ---
  const [clipboard, setClipboard] = useState(null);
  const lastMousePosRef = useRef({ x: 200, y: 150 });

  // --- POINTER EVENTS STATE (iPad + Apple Pencil migration) ---
  const pointerTypeRef = useRef('mouse'); // 'mouse' | 'touch' | 'pen'
  const activeTouchesRef = useRef(new Map()); // Map<pointerId, {x, y}> for multi-touch tracking
  const [isPinching, setIsPinching] = useState(false);
  const pinchStartDistRef = useRef(0);
  const pinchStartZoomRef = useRef(1);
  const pinchEndTimeRef = useRef(0); // S116: timestamp when pinch ended — debounce pinch→drag

  // S101: Double-tap to reset zoom (touch only)
  const lastTapRef = useRef({ time: 0, x: 0, y: 0 });
  const resetViewRef = useRef(null); // ref wrapper to avoid TDZ in handlePointerUp

  // --- TASK 3: LONG-PRESS CONTEXT MENU STATE ---
  const [contextMenu, setContextMenu] = useState(null); // { x, y, componentId } in SVG coords, or null
  const longPressTimerRef = useRef(null);
  const longPressStartRef = useRef(null); // { clientX, clientY } to detect movement > 10px
  // S101: Long-press ripple animation feedback
  const [longPressRipple, setLongPressRipple] = useState(null); // { clientX, clientY } or null

  // --- TASK 3: Notify parent when selected component changes ---
  useEffect(() => {
    if (onSelectionChange) onSelectionChange(selectedComponent);
  }, [selectedComponent, onSelectionChange]);

  // --- TAP-TO-PLACE STATE (iPad: tap chip → tap canvas → place component) ---
  const [pendingPlacement, setPendingPlacement] = useState(null); // { type: string } or null

  useEffect(() => {
    const handler = (e) => {
      const type = e.detail?.type;
      if (type) setPendingPlacement({ type });
    };
    window.addEventListener('elab-component-selected', handler);
    return () => window.removeEventListener('elab-component-selected', handler);
  }, []);

  // B9 fix: Reset pendingPlacement when experiment changes
  useEffect(() => {
    setPendingPlacement(null);
    window.__elabPendingComponent = null;
  }, [experiment]);

  // Calcola viewbox in base al zoom (usa le dimensioni dello stato viewBox, non DEFAULT)
  const currentViewBox = useMemo(() => {
    const w = viewBox.width / zoom;
    const h = viewBox.height / zoom;
    return `${viewBox.x} ${viewBox.y} ${w} ${h}`;
  }, [viewBox.x, viewBox.y, viewBox.width, viewBox.height, zoom]);

  // === V4 WIRE DRAG HANDLERS ===
  const handleWireDragStart = useCallback((e) => {
    const target = e.target;
    // Check if clicking a wire handle
    const action = target.getAttribute('data-action');
    const wireIdx = parseInt(target.getAttribute('data-wire-index'));

    if (action && !isNaN(wireIdx) && experiment && experiment.connections) {
      e.stopPropagation(); // Stop pan/selection
      e.preventDefault();

      const conn = experiment.connections[wireIdx];
      let waypoints = conn.waypoints ? [...conn.waypoints] : [];

      // If no waypoints exist yet (auto-routed), we must "freeze" the current path 
      // into waypoints before modifying it. But since we don't have the auto-route 
      // result here easily, ideally WireRenderer should have passed it up.
      // Simplify: Assuming WireRenderer passes "initial" waypoints? No.
      // BETTER APPROACH: If waypoints is empty, we act as if we are creating new ones 
      // from the start/end positions + the click point.

      if (waypoints.length === 0) {
        // "Freeze" auto-route into basic 2-point line to start with
        // (WireRenderer handles complex routing, but for manual edits we start simple)
        // Or better: ask WireRenderer to return current waypoints? Hard in React.
        // Fallback: Start with straight line [start, end]
        const fromPos = resolvePinPosition(conn.from, experiment.components, experiment.layout);
        const toPos = resolvePinPosition(conn.to, experiment.components, experiment.layout);
        if (fromPos && toPos) {
          waypoints = [fromPos, toPos];
        }
      }

      let wpIdx = parseInt(target.getAttribute('data-waypoint-index'));
      const segIdx = parseInt(target.getAttribute('data-segment-index'));

      if (action === 'split-segment' && !isNaN(segIdx)) {
        // Insert new waypoint at midpoint of segment
        const start = waypoints[segIdx];
        const end = waypoints[segIdx + 1];
        const newPoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
        waypoints.splice(segIdx + 1, 0, newPoint);
        wpIdx = segIdx + 1; // The new point is the one we are dragging
      }

      setWireDragState({
        wireIndex: wireIdx,
        waypointIndex: wpIdx,
        action: 'move-waypoint', // once split, it becomes a move action
        originalWaypoints: waypoints // keep reference
      });
    }
  }, [experiment]);

  // Logic moved to handleMouseMove

  // ... (rest of component) ...

  // === V2/V3 HELPER: get bounding box of a component ===
  const getBoundingBox = useCallback((comp) => {
    if (!experiment) return null;
    const pos = experiment.layout?.[comp.id];
    if (!pos) return null;
    const size = COMP_SIZES[comp.type] || { w: 40, h: 40 };
    const TOP_LEFT_ORIGIN = new Set(['breadboard-half', 'breadboard-full', 'nano-r4']);
    if (TOP_LEFT_ORIGIN.has(comp.type)) {
      const rotation = pos.rotation || 0;
      if (rotation === 0) {
        return { x: pos.x, y: pos.y, w: size.w, h: size.h };
      }
      // Compute rotated bounding box
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const corners = [
        { x: 0, y: 0 },
        { x: size.w, y: 0 },
        { x: size.w, y: size.h },
        { x: 0, y: size.h },
      ];
      const xs = corners.map(c => pos.x + c.x * cos - c.y * sin);
      const ys = corners.map(c => pos.y + c.x * sin + c.y * cos);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      return { x: minX, y: minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY };
    }
    return { x: pos.x - size.w / 2, y: pos.y - size.h / 2, w: size.w, h: size.h };
  }, [experiment]);

  // === KEYBOARD (Delete + Copy/Paste/Duplicate) ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Do not capture if user is typing in an input/textarea or CodeMirror
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.target.closest && e.target.closest('.cm-editor')) return;

      const platform = (typeof navigator !== 'undefined' && navigator.platform) ? navigator.platform : '';
      const isMac = platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // --- V3: Copy (Ctrl+C) ---
      if (mod && e.key === 'c' && !e.shiftKey) {
        const selSet = selectedComponents.size > 0 ? selectedComponents : (selectedComponent ? new Set([selectedComponent]) : new Set());
        if (selSet.size > 0 && experiment) {
          e.preventDefault();
          const selComps = experiment.components.filter(c => selSet.has(c.id));
          const selConns = (experiment.connections || []).filter(conn => {
            const fromId = conn.from.split(':')[0];
            const toId = conn.to.split(':')[0];
            return selSet.has(fromId) && selSet.has(toId);
          });
          // Calculate bounding box of selection
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          selComps.forEach(c => {
            const pos = experiment.layout?.[c.id];
            if (pos) { minX = Math.min(minX, pos.x); minY = Math.min(minY, pos.y); maxX = Math.max(maxX, pos.x); maxY = Math.max(maxY, pos.y); }
          });
          setClipboard({
            components: selComps.map(c => ({ ...c, _origPos: experiment.layout?.[c.id] })),
            connections: selConns,
            boundingBox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
          });
          return;
        }
      }

      // --- V3: Paste (Ctrl+V) ---
      if (mod && e.key === 'v' && !e.shiftKey && clipboard && experiment && onComponentAdd) {
        e.preventDefault();
        const offset = 20;
        const idMap = {}; // old id -> new id
        const newCompIds = [];
        clipboard.components.forEach(c => {
          const origPos = c._origPos || { x: 200, y: 150 };
          const newPos = { x: origPos.x + offset, y: origPos.y + offset };
          const newId = onComponentAdd(c.type, newPos);
          if (newId) {
            idMap[c.id] = newId;
            newCompIds.push(newId);
          }
        });
        // Re-create internal connections with new IDs
        if (onConnectionAdd) {
          clipboard.connections.forEach(conn => {
            const fromParts = conn.from.split(':');
            const toParts = conn.to.split(':');
            const newFrom = idMap[fromParts[0]];
            const newTo = idMap[toParts[0]];
            if (newFrom && newTo) {
              onConnectionAdd(`${newFrom}:${fromParts[1]}`, `${newTo}:${toParts[1]}`);
            }
          });
        }
        // Select the newly pasted components
        setSelectedComponents(new Set(newCompIds));
        setSelectedComponent(null);
        return;
      }

      // --- V3: Duplicate (Ctrl+D) ---
      if (mod && e.key === 'd' && !e.shiftKey) {
        const selSet = selectedComponents.size > 0 ? selectedComponents : (selectedComponent ? new Set([selectedComponent]) : new Set());
        if (selSet.size > 0 && experiment && onComponentAdd) {
          e.preventDefault();
          const selComps = experiment.components.filter(c => selSet.has(c.id));
          const selConns = (experiment.connections || []).filter(conn => {
            const fromId = conn.from.split(':')[0];
            const toId = conn.to.split(':')[0];
            return selSet.has(fromId) && selSet.has(toId);
          });
          const offset = 20;
          const idMap = {};
          const newCompIds = [];
          selComps.forEach(c => {
            const origPos = experiment.layout?.[c.id] || { x: 200, y: 150 };
            const newPos = { x: origPos.x + offset, y: origPos.y + offset };
            const newId = onComponentAdd(c.type, newPos);
            if (newId) {
              idMap[c.id] = newId;
              newCompIds.push(newId);
            }
          });
          if (onConnectionAdd) {
            selConns.forEach(conn => {
              const fromParts = conn.from.split(':');
              const toParts = conn.to.split(':');
              const newFrom = idMap[fromParts[0]];
              const newTo = idMap[toParts[0]];
              if (newFrom && newTo) {
                onConnectionAdd(`${newFrom}:${fromParts[1]}`, `${newTo}:${toParts[1]}`);
              }
            });
          }
          setSelectedComponents(new Set(newCompIds));
          setSelectedComponent(null);
          return;
        }
      }

      // --- S107: Arrow key movement for keyboard accessibility (WCAG 2.1 A) ---
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && !mod) {
        const compId = selectedComponent || (selectedComponents.size === 1 ? [...selectedComponents][0] : null);
        if (compId && experiment && onLayoutChange) {
          e.preventDefault();
          const STEP = e.shiftKey ? 1 : 7.5; // Shift = fine 1px, default = 1 breadboard hole
          const pos = experiment.layout?.[compId] || { x: 0, y: 0 };
          const dx = e.key === 'ArrowRight' ? STEP : e.key === 'ArrowLeft' ? -STEP : 0;
          const dy = e.key === 'ArrowDown' ? STEP : e.key === 'ArrowUp' ? -STEP : 0;
          onLayoutChange(compId, { ...pos, x: pos.x + dx, y: pos.y + dy }, true);
          return;
        }
      }

      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        // Delete selected wire first (priority over component)
        if (selectedWireIndex >= 0 && onWireDelete) {
          e.preventDefault();
          onWireDelete(selectedWireIndex);
          return;
        }

        // V2: Multi-delete — delete all selected components + their wires
        if (selectedComponents.size > 0 && onComponentDelete) {
          e.preventDefault();
          for (const compId of selectedComponents) {
            onComponentDelete(compId);
          }
          setSelectedComponents(new Set());
          setSelectedComponent(null);
          return;
        }

        // Delete single selected component
        if (selectedComponent) {
          e.preventDefault();
          if (onComponentDelete) {
            onComponentDelete(selectedComponent);
          }
          setSelectedComponent(null);
        }
      }
      // Escape exits wire mode, closes context menu, or deselects
      if (e.key === 'Escape') {
        // Task 3: Close context menu first
        if (contextMenu) {
          setContextMenu(null);
          return;
        }
        if (wireMode) {
          // S83: Reset BOTH state paths to prevent stuck wire mode
          if (onWireModeChange) onWireModeChange(false);
          setWireModeInternal(false);
          setWireStart(null);
          setWireStartPos(null);
          setWirePreviewEnd(null);
          wireAutoRef.current = false;
        }
        setSelectedComponent(null);
        setSelectedComponents(new Set());
        // Deselect wire too
        if (selectedWireIndex >= 0 && onWireClick) onWireClick(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, selectedComponents, selectedWireIndex, wireMode, clipboard, experiment, onComponentDelete, onWireDelete, onWireClick, onWireModeChange, onComponentAdd, onConnectionAdd, contextMenu]);

  // === V1: PROBE DRAG HANDLER (called from Multimeter onProbeMove) ===
  const handleProbeMove = useCallback((multimeterId, probeId, action, e) => {
    if (action === 'start') {
      e.stopPropagation();
      probeDragRef.current = { mmId: multimeterId, probeId };
      document.body.style.cursor = 'grabbing';
      // Register global mouse move/up for probe drag
      const handleProbeDrag = (moveEvt) => {
        const ref = probeDragRef.current;
        if (!ref) return;
        const svgPt = clientToSVG(svgRef.current, moveEvt.clientX, moveEvt.clientY);
        const mmPos = experiment?.layout?.[ref.mmId] || { x: 0, y: 0 };
        // Convert to local coords (relative to multimeter component origin)
        const localX = svgPt.x - mmPos.x;
        const localY = svgPt.y - mmPos.y;

        // Check if hovering a valid snap target (pin or breadboard hole)
        const currentTolerance = (pointerTypeRef.current === 'touch' || pointerTypeRef.current === 'pen') ? 20 : PIN_HIT_TOLERANCE;
        const pinTolerance = Math.max(currentTolerance, currentTolerance * 2 / zoom);
        const snapPin = hitTestPin(svgPt.x, svgPt.y, experiment?.components || [], experiment?.layout || {}, pinTolerance);

        setProbePositions(prev => ({
          ...prev,
          [ref.mmId]: {
            ...(prev[ref.mmId] || {}),
            [ref.probeId]: { x: localX, y: localY },
          },
        }));
        setProbeSnapped(prev => ({
          ...prev,
          [ref.mmId]: {
            ...(prev[ref.mmId] || {}),
            [ref.probeId]: !!snapPin,
          },
        }));
      };

      const handleProbeUp = (upEvt) => {
        const ref = probeDragRef.current;
        if (!ref) return;
        // Snap to nearest pin on drop
        const svgPt = clientToSVG(svgRef.current, upEvt.clientX, upEvt.clientY);
        const currentTolerance = (pointerTypeRef.current === 'touch' || pointerTypeRef.current === 'pen') ? 20 : PIN_HIT_TOLERANCE;
        const pinTolerance = Math.max(currentTolerance, currentTolerance * 2 / zoom);
        const snapPin = hitTestPin(svgPt.x, svgPt.y, experiment?.components || [], experiment?.layout || {}, pinTolerance);
        if (snapPin) {
          // Snap the probe to the pin position
          const pinPos = resolvePinPosition(snapPin, experiment?.components || [], experiment?.layout || {});
          const mmPos = experiment?.layout?.[ref.mmId] || { x: 0, y: 0 };
          if (pinPos) {
            setProbePositions(prev => ({
              ...prev,
              [ref.mmId]: {
                ...(prev[ref.mmId] || {}),
                [ref.probeId]: { x: pinPos.x - mmPos.x, y: pinPos.y - mmPos.y },
              },
            }));
          }
          setProbeConnections(prev => ({
            ...prev,
            [ref.mmId]: {
              ...(prev[ref.mmId] || {}),
              [ref.probeId]: snapPin,
            },
          }));
        } else {
          // No snap — clear connection for this probe
          setProbeConnections(prev => ({
            ...prev,
            [ref.mmId]: {
              ...(prev[ref.mmId] || {}),
              [ref.probeId]: null,
            },
          }));
        }
        setProbeSnapped(prev => ({
          ...prev,
          [ref.mmId]: { ...(prev[ref.mmId] || {}), [ref.probeId]: false },
        }));
        probeDragRef.current = null;
        document.body.style.cursor = '';
        window.removeEventListener('pointermove', handleProbeDrag);
        window.removeEventListener('pointerup', handleProbeUp);
      };

      // CoVe Fix #5: Salva riferimenti per cleanup
      probeListenersRef.current.drag = handleProbeDrag;
      probeListenersRef.current.up = handleProbeUp;

      window.addEventListener('pointermove', handleProbeDrag);
      window.addEventListener('pointerup', handleProbeUp);
    }
  }, [experiment, zoom]);

  // CoVe Fix #5 + G42: Cleanup listener su unmount
  useEffect(() => {
    return () => {
      if (probeListenersRef.current.drag) {
        window.removeEventListener('pointermove', probeListenersRef.current.drag);
      }
      if (probeListenersRef.current.up) {
        window.removeEventListener('pointerup', probeListenersRef.current.up);
      }
      // G42: Cleanup pending release handler
      if (pendingReleaseRef.current) {
        window.removeEventListener('pointerup', pendingReleaseRef.current);
      }
      // G42: Cleanup pending timers (longPress, pinTooltip)
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (pinTooltipTimerRef.current) clearTimeout(pinTooltipTimerRef.current);
    };
  }, []);

  // === UNIFIED POINTER DOWN (replaces handleMouseDown + handleTouchStart) ===
  const handlePointerDown = useCallback((e) => {
    pointerTypeRef.current = e.pointerType || 'mouse';

    // S116: Palm rejection — ignore large-area touches (palm resting on iPad screen)
    // radiusX > 20px indicates a wide contact area (palm/wrist), force > 0.5 indicates heavy press
    if (e.pointerType === 'touch' && ((e.radiusX && e.radiusX > 20) || (e.force && e.force > 0.5))) {
      return; // Ignore palm touches
    }

    // S116: Debounce pinch→drag — ignore single-touch events within 200ms after pinch end
    if (e.pointerType === 'touch' && pinchEndTimeRef.current && (Date.now() - pinchEndTimeRef.current < 200)) {
      return;
    }

    // Track all touch pointers for pinch-zoom detection
    if (e.pointerType === 'touch') {
      activeTouchesRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Second finger → start pinch zoom
      if (activeTouchesRef.current.size === 2) {
        setIsPinching(true);
        setIsPanning(false);
        // Cancel any in-progress drag
        if (isDragging) {
          setIsDragging(false);
          setDragCompId(null);
          setDragOffset({ x: 0, y: 0 });
          dragMovedRef.current = false;
        }
        const pts = [...activeTouchesRef.current.values()];
        pinchStartDistRef.current = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        pinchStartZoomRef.current = zoom;
        e.preventDefault();
        return;
      }
    }

    // Palm rejection: ignore non-primary pointers (not part of pinch)
    if (!e.isPrimary) return;

    // Capture pointer on SVG for reliable move/up tracking
    if (e.target && e.target.setPointerCapture) {
      try { e.target.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    }

    const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);

    // --- TAP-TO-PLACE: if a component is pending, place it here ---
    if (pendingPlacement && e.button === 0 && !e.altKey && onComponentAdd && !wireMode) {
      const dropX = snapToGrid ? snapToGridPoint(svgPt.x) : Math.round(svgPt.x);
      const dropY = snapToGrid ? snapToGridPoint(svgPt.y) : Math.round(svgPt.y);

      // Build validation for guided mode
      if (buildValidation && buildValidation.currentStep >= 0) {
        const step = buildValidation.buildSteps[buildValidation.currentStep];
        if (step && step.componentType === pendingPlacement.type) {
          const targetPos = experiment?.layout?.[step.componentId];
          if (targetPos) {
            const dx = Math.abs(dropX - targetPos.x);
            const dy = Math.abs(dropY - targetPos.y);
            const CLOSE_THRESHOLD = GRID_PITCH * 3;
            if (dx <= CLOSE_THRESHOLD && dy <= CLOSE_THRESHOLD) {
              setDropSuccess(true);
              setTimeout(() => setDropSuccess(false), 600);
              if (onBuildValidationResult) {
                onBuildValidationResult({ valid: true, stepIndex: buildValidation.currentStep });
              }
            } else {
              // Auto-correct: slide to correct position
              setAutoCorrection({
                type: pendingPlacement.type, fromX: dropX, fromY: dropY,
                toX: targetPos.x, toY: targetPos.y, phase: 'red',
              });
              setTimeout(() => {
                setAutoCorrection(prev => prev ? { ...prev, phase: 'slide' } : null);
                setTimeout(() => {
                  setAutoCorrection(prev => prev ? { ...prev, phase: 'green' } : null);
                  setTimeout(() => {
                    setAutoCorrection(null);
                    setDropSuccess(true);
                    setTimeout(() => setDropSuccess(false), 400);
                    if (onBuildValidationResult) {
                      onBuildValidationResult({ valid: true, stepIndex: buildValidation.currentStep });
                    }
                  }, 500);
                }, 300);
              }, 500);
            }
          } else {
            setDropSuccess(true);
            setTimeout(() => setDropSuccess(false), 600);
            if (onBuildValidationResult) {
              onBuildValidationResult({ valid: true, stepIndex: buildValidation.currentStep });
            }
          }
        } else {
          // Wrong component
          setDropError(true);
          setTimeout(() => setDropError(false), 800);
        }
      } else {
        // Normal sandbox mode: validate and place
        if (!isValidDropPosition(pendingPlacement.type, dropX, dropY, 0, experiment)) {
          setDropError(true);
          setTimeout(() => setDropError(false), 800);
        } else {
          onComponentAdd(pendingPlacement.type, { x: dropX, y: dropY });
        }
      }

      setPendingPlacement(null);
      window.__elabPendingComponent = null;
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    // Pan with middle button or Alt+left (mouse only)
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      return;
    }

    // S89: Wire creation ONLY when wireMode is explicitly enabled via "Filo" button
    // Removed auto-activation: clicking pins no longer auto-enables wire mode
    if (e.button === 0 && !e.altKey && experiment && wireMode) {
      const currentTolerance = (pointerTypeRef.current === 'touch' || pointerTypeRef.current === 'pen') ? 20 : PIN_HIT_TOLERANCE;
      const pinTolerance = Math.max(currentTolerance, currentTolerance * 2 / zoom);
      const pinRef = hitTestPin(svgPt.x, svgPt.y, experiment.components, experiment.layout, pinTolerance);
      if (pinRef) {
        if (!wireStart) {
          const pos = resolvePinPosition(pinRef, experiment.components, experiment.layout);
          setWireStart(pinRef);
          setWireStartPos(pos);
          setWirePreviewEnd(pos);
        } else if (pinRef !== wireStart) {
          if (onConnectionAdd) {
            onConnectionAdd(wireStart, pinRef);
          }
          setWireStart(null);
          setWireStartPos(null);
          setWirePreviewEnd(null);
        }
        e.stopPropagation();
        return;
      }

      // No pin hit: cancel pending wire on empty canvas click
      if (wireStart) {
        setWireStart(null);
        setWireStartPos(null);
        setWirePreviewEnd(null);
        return;
      }
    }

    // CHECK FOR WIRE HANDLES (V4)
    if (e.target.getAttribute && e.target.getAttribute('data-action') && !wireMode) {
      handleWireDragStart(e);
      return;
    }

    // Touch/pen on empty canvas → pan (single finger)
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      // S110+: Prevent text selection on iPad during pan/drag
      e.preventDefault();
      // Task 5: Pin tooltip on tap (touch/pen) — check before pan
      if (experiment?.components && !compClickedRef.current) {
        const pinTolerance = Math.max(PIN_HIT_TOLERANCE, 20 / zoom);
        const pinRef = hitTestPin(svgPt.x, svgPt.y, experiment.components, experiment.layout, pinTolerance);
        if (pinRef) {
          const info = getPinInfo(pinRef, experiment.components, componentStates);
          if (info) {
            const pinPos = resolvePinPosition(pinRef, experiment.components, experiment.layout);
            setHoveredPin({ clientX: e.clientX, clientY: e.clientY, label: info.label, details: info.details, ref: pinRef, svgPos: pinPos });
            // Auto-dismiss after 2s on touch/pen
            if (pinTooltipTimerRef.current) clearTimeout(pinTooltipTimerRef.current);
            pinTooltipTimerRef.current = setTimeout(() => {
              setHoveredPin(null);
              pinTooltipTimerRef.current = null;
            }, 2000);
          }
        } else {
          // Tapped away from pin — dismiss any open tooltip
          if (hoveredPinRef.current) setHoveredPin(null);
          if (pinTooltipTimerRef.current) { clearTimeout(pinTooltipTimerRef.current); pinTooltipTimerRef.current = null; }
        }
      }
      if (!wireMode || !wireStart) {
        // Single touch that didn't hit a pin or wire handle → pan
        if (!compClickedRef.current) {
          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY });
          panDistRef.current = 0; // S72: reset pan distance tracker
        }
      } else if (wireMode && wireStart) {
        // In wire mode with active wire: prevent scroll for preview
        e.preventDefault();
      }
      return;
    }

    // V2: Start selection box on empty canvas (left click without modifier on background) — mouse only
    if (e.button === 0 && !e.altKey && !wireMode && !compClickedRef.current) {
      selectionStartRef.current = { x: svgPt.x, y: svgPt.y };
      // Don't start selection box immediately — wait for pointermove to distinguish click from drag
    }
  }, [wireMode, wireStart, experiment, onConnectionAdd, zoom, isDragging, pendingPlacement, onComponentAdd, buildValidation, onBuildValidationResult, snapToGrid, componentStates]);

  // === UNIFIED POINTER MOVE (replaces handleMouseMove + handleTouchMove) ===
  const handlePointerMove = useCallback((e) => {
    // S116: Palm rejection on move — ignore large-area touches
    if (e.pointerType === 'touch' && ((e.radiusX && e.radiusX > 20) || (e.force && e.force > 0.5))) return;

    // Track pointer position for paste
    if (svgRef.current) {
      const mp = clientToSVG(svgRef.current, e.clientX, e.clientY);
      lastMousePosRef.current = { x: mp.x, y: mp.y };
    }

    // Update tracked touch position for pinch
    if (e.pointerType === 'touch') {
      activeTouchesRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // --- PINCH ZOOM (two-finger touch) ---
    if (isPinching && e.pointerType === 'touch' && activeTouchesRef.current.size >= 2) {
      const pts = [...activeTouchesRef.current.values()];
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      if (pinchStartDistRef.current > 0) {
        const scale = dist / pinchStartDistRef.current;
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoomRef.current * scale));
        // Zoom toward pinch midpoint
        const svg = svgRef.current;
        if (svg) {
          const rect = svg.getBoundingClientRect();
          const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
          const mouseXRatio = (mid.x - rect.left) / rect.width;
          const mouseYRatio = (mid.y - rect.top) / rect.height;
          setViewBox(vb => {
            const oldW = vb.width / zoom;
            const oldH = vb.height / zoom;
            const newW = vb.width / newZoom;
            const newH = vb.height / newZoom;
            return { ...vb, x: vb.x + (oldW - newW) * mouseXRatio, y: vb.y + (oldH - newH) * mouseYRatio };
          });
        }
        setZoom(newZoom);
      }

      // Also pan with two fingers (midpoint tracking)
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      if (touchRef.current.lastMid) {
        const pdx = (mid.x - touchRef.current.lastMid.x) / zoom;
        const pdy = (mid.y - touchRef.current.lastMid.y) / zoom;
        setViewBox(prev => ({ ...prev, x: prev.x - pdx, y: prev.y - pdy }));
      }
      touchRef.current.lastMid = mid;
      e.preventDefault();
      return;
    }

    // Ignore non-primary pointer moves (palm rejection) unless pinching
    if (!e.isPrimary) return;

    // Task 3: Cancel long-press if finger/pen moved >10px from start
    if (longPressTimerRef.current && longPressStartRef.current) {
      const dx = e.clientX - longPressStartRef.current.clientX;
      const dy = e.clientY - longPressStartRef.current.clientY;
      if (Math.hypot(dx, dy) > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
        longPressStartRef.current = null;
        setLongPressRipple(null); // S101: cancel ripple
      }
    }

    // --- DRAG MOVE (single or multi-move) ---
    if (isDragging && dragCompId && experiment) {
      // S101+S115: Dead zone check — touch uses larger threshold to prevent accidental drags
      if (!dragDeadZonePassedRef.current && dragStartClientRef.current) {
        const ddx = e.clientX - dragStartClientRef.current.clientX;
        const ddy = e.clientY - dragStartClientRef.current.clientY;
        const deadZone = (pointerTypeRef.current === 'touch') ? DRAG_DEAD_ZONE_TOUCH : DRAG_DEAD_ZONE_MOUSE;
        if (Math.hypot(ddx, ddy) < deadZone) return;
        dragDeadZonePassedRef.current = true;
      }
      dragMovedRef.current = true;
      const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
      let newX = svgPt.x - dragOffset.x;
      let newY = svgPt.y - dragOffset.y;

      // Pin-aware snap-to-hole breadboard
      let snapFound = false;
      let snappedBbId = null;
      const draggedComp = experiment.components?.find(c => c.id === dragCompId);
      const noSnapTypes = ['breadboard-half', 'breadboard-full', 'battery9v', 'nano-r4'];
      if (draggedComp && !noSnapTypes.includes(draggedComp.type)) {
        const breadboards = (experiment.components || []).filter(
          c => c.type === 'breadboard-half' || c.type === 'breadboard-full'
        );
        for (const bb of breadboards) {
          const bbPos = experiment.layout?.[bb.id] || { x: 0, y: 0 };
          const snap = snapComponentToHole(draggedComp.type, newX, newY, bbPos.x, bbPos.y, bb.type);
          if (snap) {
            newX = snap.x;
            newY = snap.y;
            snapFound = true;
            snappedBbId = bb.id;
            const sz = COMP_SIZES[draggedComp.type] || { w: 30, h: 30 };
            setSnapGhost({ x: newX, y: newY, w: sz.w, h: sz.h });
            // S115: Compute per-pin hole highlights
            const pinHoles = getSnapPinHoles(draggedComp.type, newX, newY, bbPos.x, bbPos.y, bb.type, dragCompId, experiment);
            setSnapPinHoles(pinHoles);
            break;
          }
        }
      }
      if (!snapFound) {
        setSnapGhost(null);
        setSnapPinHoles([]);
      }

      if (onLayoutChange) {
        const existingPos = experiment.layout?.[dragCompId] || { x: 0, y: 0 };
        const newRenderX = Math.round(newX * 4) / 4;
        const newRenderY = Math.round(newY * 4) / 4;
        const dx = newRenderX - existingPos.x;
        const dy = newRenderY - existingPos.y;

        // S114: Child cascade is handled by handleLayoutChange (geometric detection).
        // No duplicate parentId-based cascade here — prevents double-movement.

        lastDragPosRef.current = { ...existingPos, x: newRenderX, y: newRenderY };
        if (snappedBbId) {
          lastDragPosRef.current.parentId = snappedBbId;
        } else if (!snapFound && lastDragPosRef.current.parentId) {
          delete lastDragPosRef.current.parentId;
        }

        // V2: Multi-move
        if (selectedComponents.has(dragCompId) && selectedComponents.size > 1) {
          for (const compId of selectedComponents) {
            const cPos = experiment.layout?.[compId] || { x: 0, y: 0 };
            const newPos = { ...cPos, x: cPos.x + dx, y: cPos.y + dy };
            if (compId === dragCompId) {
              if (snappedBbId) newPos.parentId = snappedBbId;
              else if (!snapFound && newPos.parentId) delete newPos.parentId;
            }
            onLayoutChange(compId, newPos, false);
          }
        } else {
          onLayoutChange(dragCompId, lastDragPosRef.current, false);
        }
      }
      return;
    }

    // --- V7: WIRE WAYPOINT DRAG ---
    if (wireDragState && svgRef.current) {
      const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
      const newX = svgPt.x;
      const newY = svgPt.y;
      const { wireIndex, waypointIndex, originalWaypoints } = wireDragState;
      const newWaypoints = [...originalWaypoints];
      if (waypointIndex > 0 && waypointIndex < newWaypoints.length - 1) {
        newWaypoints[waypointIndex] = { ...newWaypoints[waypointIndex], x: newX, y: newY };
        if (onWireUpdate) {
          onWireUpdate(wireIndex, { ...experiment.connections[wireIndex], waypoints: newWaypoints });
        }
      }
      return;
    }

    // --- V2: SELECTION BOX DRAG (mouse only) ---
    if (selectionStartRef.current && !isDragging && !isPanning && !wireMode) {
      const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
      const dx = Math.abs(svgPt.x - selectionStartRef.current.x);
      const dy = Math.abs(svgPt.y - selectionStartRef.current.y);
      if (dx > 4 || dy > 4) {
        setSelectionBox({
          startX: selectionStartRef.current.x,
          startY: selectionStartRef.current.y,
          endX: svgPt.x,
          endY: svgPt.y,
        });
      }
    }

    // --- PAN MOVE ---
    if (isPanning) {
      const dx = (e.clientX - panStart.x) / zoom;
      const dy = (e.clientY - panStart.y) / zoom;
      // S72 P2-DESELECT-1: accumulate pan distance for click filtering
      panDistRef.current += Math.hypot(dx, dy);
      setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // --- WIRE PREVIEW ---
    if (wireMode && wireStart && svgRef.current) {
      const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
      setWirePreviewEnd({ x: svgPt.x, y: svgPt.y });
    }

    // --- Task 5: PIN HOVER TOOLTIP (mouse only — touch/pen use tap in handlePointerDown) ---
    if (e.pointerType === 'mouse' && experiment?.components && svgRef.current && !isDragging && !isPanning) {
      const now = Date.now();
      if (now - hoverThrottleRef.current > 80) {
        hoverThrottleRef.current = now;
        const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
        const pinTolerance = Math.max(PIN_HIT_TOLERANCE, 20 / zoom);
        const pinRef = hitTestPin(svgPt.x, svgPt.y, experiment.components, experiment.layout, pinTolerance);
        if (pinRef) {
          const info = getPinInfo(pinRef, experiment.components, componentStates);
          if (info) {
            const pinPos = resolvePinPosition(pinRef, experiment.components, experiment.layout);
            setHoveredPin({ clientX: e.clientX, clientY: e.clientY, label: info.label, details: info.details, ref: pinRef, svgPos: pinPos });
          } else {
            setHoveredPin(null);
          }
        } else {
          setHoveredPin(null);
        }
      }
    }
  }, [isDragging, dragCompId, dragOffset, experiment, onLayoutChange, zoom, wireMode, wireStart, selectedComponents, wireDragState, onWireUpdate, isPinching, isPanning, panStart, componentStates]);

  // === UNIFIED POINTER UP (replaces handleMouseUp + handleTouchEnd) ===
  const handlePointerUp = useCallback((e) => {
    // Release pointer capture
    if (e && e.target && e.target.releasePointerCapture) {
      try { e.target.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    }

    // Task 3: Cancel long-press timer on pointer up
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      longPressStartRef.current = null;
      setLongPressRipple(null); // S101: cancel ripple
    }

    // Remove touch from tracking
    if (e && e.pointerType === 'touch') {
      activeTouchesRef.current.delete(e.pointerId);
      // End pinch when fewer than 2 fingers
      if (activeTouchesRef.current.size < 2 && isPinching) {
        setIsPinching(false);
        touchRef.current.lastMid = null;
        pinchStartDistRef.current = 0;
        pinchEndTimeRef.current = Date.now(); // S116: record pinch end for debounce
      }
      // If fingers still down, don't finalize anything yet
      if (activeTouchesRef.current.size > 0) return;
    }

    // --- V4: WIRE DRAG END ---
    if (wireDragState) {
      setWireDragState(null);
      return;
    }

    // V2: Finalize selection box
    if (selectionBox && experiment) {
      const boxX = Math.min(selectionBox.startX, selectionBox.endX);
      const boxY = Math.min(selectionBox.startY, selectionBox.endY);
      const boxW = Math.abs(selectionBox.endX - selectionBox.startX);
      const boxH = Math.abs(selectionBox.endY - selectionBox.startY);

      if (boxW > 4 && boxH > 4) {
        const newSelection = new Set();
        experiment.components.forEach(comp => {
          const bb = getBoundingBox(comp);
          if (!bb) return;
          const overlapX = bb.x < boxX + boxW && bb.x + bb.w > boxX;
          const overlapY = bb.y < boxY + boxH && bb.y + bb.h > boxY;
          if (overlapX && overlapY) {
            newSelection.add(comp.id);
          }
        });
        setSelectedComponents(newSelection);
        setSelectedComponent(null);
      }
      setSelectionBox(null);
      selectionStartRef.current = null;
      return;
    }

    selectionStartRef.current = null;

    // S101+S116: Double-tap zoom toggle (touch only, on background — no component drag)
    // S116: Toggle between 1.0 → 1.5 → 1.0 instead of resetting to fit
    if (e && (e.pointerType === 'touch') && !compClickedRef.current && panDistRef.current < 15) {
      const now = Date.now();
      const last = lastTapRef.current;
      const tapDist = Math.hypot(e.clientX - last.x, e.clientY - last.y);
      if (now - last.time < 300 && tapDist < 30) {
        // Double-tap detected → toggle zoom 1.0 ↔ 1.5
        const targetZoom = zoom < 1.25 ? 1.5 : 1.0;
        // Zoom toward tap position
        const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
        setViewBox(prev => {
          const oldW = prev.width / zoom;
          const oldH = prev.height / zoom;
          const newW = prev.width / targetZoom;
          const newH = prev.height / targetZoom;
          return { ...prev, x: prev.x + (svgPt.x - prev.x) * (1 - newW / oldW), y: prev.y + (svgPt.y - prev.y) * (1 - newH / oldH) };
        });
        setZoom(targetZoom);
        lastTapRef.current = { time: 0, x: 0, y: 0 };
        setIsPanning(false);
        return;
      }
      lastTapRef.current = { time: now, x: e.clientX, y: e.clientY };
    }

    setIsPanning(false);

    // Save drag state BEFORE reset for click resolution
    const didDragMove = dragMovedRef.current;
    const pending = pendingClickRef.current;

    setIsDragging(false);
    setDragCompId(null);
    setSnapGhost(null);
    setSnapPinHoles([]); // S115: clear per-pin hole highlights
    setDragOffset({ x: 0, y: 0 });
    dragMovedRef.current = false;
    potRotatingRef.current = null;
    pendingClickRef.current = null;

    // --- V2: Overlap Prevention (Revert to dragStartPos if invalid) ---
    if (didDragMove && pending && onLayoutChange && experiment) {
      const finalPos = lastDragPosRef.current || experiment.layout?.[pending.componentId];
      lastDragPosRef.current = null;

      if (finalPos && dragStartPosRef.current) {
        if (!isValidDropPosition(pending.compType, finalPos.x, finalPos.y, finalPos.rotation || 0, experiment, pending.componentId)) {
          onLayoutChange(pending.componentId, dragStartPosRef.current, true);
          setDropError(true);
          setTimeout(() => setDropError(false), 800);
        } else {
          // S114: handleLayoutChange cascades children for containers automatically
          onLayoutChange(pending.componentId, finalPos, true);
        }
      } else if (finalPos) {
        // S114: handleLayoutChange cascades children for containers automatically
        onLayoutChange(pending.componentId, finalPos, true);
      }
    }

    // --- CLICK RESOLUTION: no drag movement → handle as click ---
    if (pending && !didDragMove) {
      const isToggleComponent = (
        pending.compType === 'mosfet-n' ||
        pending.compType === 'reed-switch'
      );

      const isInteractiveOnClick = (
        isToggleComponent ||
        pending.compType === 'photo-resistor' ||
        pending.compType === 'phototransistor' ||
        pending.compType === 'potentiometer'
      );

      if (pending.wasAlreadySelected) {
        if (isInteractiveOnClick) {
          if (onComponentClick) onComponentClick(pending.componentId);
        } else {
          setSelectedComponent(null);
        }
      } else {
        if (isInteractiveOnClick) {
          if (onComponentClick) onComponentClick(pending.componentId);
        }
      }
    }

    // Wire mode: on pointer up, try to complete wire at final position
    if (wireMode && wireStart && experiment && e) {
      const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
      const currentTolerance = (pointerTypeRef.current === 'touch' || pointerTypeRef.current === 'pen') ? 20 : PIN_HIT_TOLERANCE;
      const pinTolerance = Math.max(currentTolerance, currentTolerance * 2 / zoom);
      const pinRef = hitTestPin(svgPt.x, svgPt.y, experiment.components, experiment.layout, pinTolerance);
      if (pinRef && pinRef !== wireStart) {
        if (onConnectionAdd) {
          onConnectionAdd(wireStart, pinRef);
        }
        setWireStart(null);
        setWireStartPos(null);
        setWirePreviewEnd(null);
      }
    }
  }, [wireDragState, selectionBox, experiment, getBoundingBox, onWireClick, onComponentClick, isPinching, wireMode, wireStart, onConnectionAdd, zoom, onLayoutChange]);

  // === MOUSE WHEEL ZOOM (attached via useEffect for passive:false) ===
  const handleWheelRef = useRef(null);
  handleWheelRef.current = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => {
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev * delta));
      // Adjust viewBox to zoom centered on mouse position
      const svg = svgRef.current;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const mouseXRatio = (e.clientX - rect.left) / rect.width;
        const mouseYRatio = (e.clientY - rect.top) / rect.height;
        setViewBox(vb => {
          const oldW = vb.width / prev;
          const oldH = vb.height / prev;
          const newW = vb.width / newZoom;
          const newH = vb.height / newZoom;
          return {
            ...vb,
            x: vb.x + (oldW - newW) * mouseXRatio,
            y: vb.y + (oldH - newH) * mouseYRatio,
          };
        });
      }
      return newZoom;
    });
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handler = (e) => handleWheelRef.current?.(e);
    svg.addEventListener('wheel', handler, { passive: false });
    return () => svg.removeEventListener('wheel', handler);
  }, []);

  // === RESIZE OBSERVER: auto-update viewBox width/height to match container aspect ratio ===
  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          // Update viewBox dimensions to match the container's aspect ratio.
          // This keeps the SVG coordinate system stable when the container resizes,
          // preventing components from appearing to shift relative to the breadboard.
          setViewBox(prev => {
            const currentAR = prev.width / prev.height;
            const newAR = width / height;
            // Only adjust if aspect ratio changed significantly (>5%)
            if (Math.abs(currentAR - newAR) / currentAR > 0.05) {
              const centerX = prev.x + (prev.width / zoom) / 2;
              const centerY = prev.y + (prev.height / zoom) / 2;
              // Scale the viewBox to match new aspect ratio while keeping same center
              let newW = prev.width;
              let newH = prev.height;
              if (newAR > currentAR) {
                newW = prev.height * newAR;
              } else {
                newH = prev.width / newAR;
              }
              return {
                x: centerX - (newW / zoom) / 2,
                y: centerY - (newH / zoom) / 2,
                width: newW,
                height: newH,
              };
            }
            return prev;
          });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [zoom]);

  // Reset view — auto-fit to experiment components, using actual container aspect ratio
  const resetView = useCallback(() => {
    const container = svgRef.current?.parentElement;
    const autoVB = calcAutoFitViewbox(experiment, container);
    setViewBox(autoVB);
    setZoom(1);
  }, [experiment]);
  resetViewRef.current = resetView; // S101: keep ref in sync for handlePointerUp

  // Auto-reset view on experiment change — use actual container aspect ratio
  // Delay one frame so the container is fully laid out (fixes iPad first-render clipping)
  useEffect(() => {
    if (experiment) {
      const rafId = requestAnimationFrame(() => {
        const container = svgRef.current?.parentElement;
        const autoVB = calcAutoFitViewbox(experiment, container);
        setViewBox(autoVB);
        setZoom(1);
      });
      setSelectedComponent(null);
      // S83: Reset BOTH state paths on experiment change
      if (onWireModeChange) onWireModeChange(false);
      setWireModeInternal(false);
      setWireStart(null);
      setWireStartPos(null);
      setWirePreviewEnd(null);
      wireAutoRef.current = false;
      return () => cancelAnimationFrame(rafId);
    }
  }, [experiment?.id]);

  // === KEYBOARD SHORTCUTS (additional — F key etc) ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F key — fit-to-view (like Tinkercad)
      if (e.key === 'f' || e.key === 'F') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.target.closest && e.target.closest('.cm-editor')) return;
        e.preventDefault();
        resetView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetView]);

  // === COMPONENT POINTER DOWN (select + start drag) ===
  // Unified handler for mouse, touch, and Apple Pencil
  const handleComponentPointerDown = useCallback((componentId, e) => {
    // Right-click handled by context menu handler
    if (e.button !== 0) return;
    // S116: Palm rejection — large-area touch (palm/wrist on iPad screen)
    if (e.pointerType === 'touch' && ((e.radiusX && e.radiusX > 20) || (e.force && e.force > 0.5))) return;
    // S116: Debounce pinch→drag transition
    if (e.pointerType === 'touch' && pinchEndTimeRef.current && (Date.now() - pinchEndTimeRef.current < 200)) return;
    // Palm rejection: ignore non-primary pointers, BUT allow if it is the only active touch
    // (iOS may briefly report isPrimary=false for a valid single-finger touch or Apple Pencil)
    if (!e.isPrimary && !((e.pointerType === 'touch' || e.pointerType === 'pen') && activeTouchesRef.current.size <= 1)) return;
    e.stopPropagation();
    // S110+: Prevent text selection on iPad during component drag (touch + Apple Pencil)
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      e.preventDefault();
    }
    compClickedRef.current = true; // Prevent background click from deselecting
    pointerTypeRef.current = e.pointerType || 'mouse';

    // Capture pointer for reliable tracking across SVG boundaries
    if (e.target && e.target.setPointerCapture) {
      try { e.target.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    }

    // Task 3: Close any open context menu on new pointerdown
    if (contextMenu) {
      setContextMenu(null);
    }

    // S72 P1-TOOLTIP-1: Pin tooltip on touch/pen — check here because compClickedRef
    // blocks the same check in the SVG background handler
    if ((e.pointerType === 'touch' || e.pointerType === 'pen') && experiment?.components) {
      const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
      const pinTolerance = Math.max(PIN_HIT_TOLERANCE, 20 / zoom);
      const pinRef = hitTestPin(svgPt.x, svgPt.y, experiment.components, experiment.layout, pinTolerance);
      if (pinRef) {
        const info = getPinInfo(pinRef, experiment.components, componentStates);
        if (info) {
          const pinPos = resolvePinPosition(pinRef, experiment.components, experiment.layout);
          setHoveredPin({ clientX: e.clientX, clientY: e.clientY, label: info.label, details: info.details, ref: pinRef, svgPos: pinPos });
          if (pinTooltipTimerRef.current) clearTimeout(pinTooltipTimerRef.current);
          pinTooltipTimerRef.current = setTimeout(() => {
            setHoveredPin(null);
            pinTooltipTimerRef.current = null;
          }, 2000);
        }
      }
    }

    // Task 3: Start long-press timer for touch/pen (500ms → show context menu)
    // Mouse users have right-click; touch/pen users need long-press
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      longPressStartRef.current = { clientX: e.clientX, clientY: e.clientY };
      clearTimeout(longPressTimerRef.current);
      const cid = componentId;
      const cx = e.clientX;
      const cy = e.clientY;
      // S101: Show ripple animation during long-press
      setLongPressRipple({ clientX: cx, clientY: cy });
      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null;
        longPressStartRef.current = null;
        setLongPressRipple(null);
        // Cancel drag so the component does not move on release
        setIsDragging(false);
        setDragCompId(null);
        dragMovedRef.current = false;
        pendingClickRef.current = null;
        // S101: Haptic feedback on long-press context menu
        if (navigator.vibrate) navigator.vibrate(50);
        // Show context menu at client coordinates (HTML overlay, zoom-independent)
        setContextMenu({ clientX: cx, clientY: cy, componentId: cid });
        setSelectedComponent(cid);
      }, 500);
    }

    // S89: Wire creation from component pins — ONLY when wireMode is explicitly ON
    if (experiment && wireMode) {
      const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
      const currentTolerance = (pointerTypeRef.current === 'touch' || pointerTypeRef.current === 'pen') ? 20 : PIN_HIT_TOLERANCE;
      const pinTolerance = Math.max(currentTolerance, currentTolerance * 2 / zoom);
      const pinRef = hitTestPin(svgPt.x, svgPt.y, experiment.components, experiment.layout, pinTolerance);
      if (pinRef) {
        if (!wireStart) {
          const pos = resolvePinPosition(pinRef, experiment.components, experiment.layout);
          setWireStart(pinRef);
          setWireStartPos(pos);
          setWirePreviewEnd(pos);
        } else if (pinRef !== wireStart) {
          if (onConnectionAdd) {
            onConnectionAdd(wireStart, pinRef);
          }
          setWireStart(null);
          setWireStartPos(null);
          setWirePreviewEnd(null);
        }
        return;
      }
    }

    // V2: Shift+Click — toggle component in/out of multi-selection
    if (e.shiftKey) {
      setSelectedComponents(prev => {
        const next = new Set(prev);
        if (next.has(componentId)) {
          next.delete(componentId);
        } else {
          next.add(componentId);
        }
        return next;
      });
      setSelectedComponent(null);
      return;
    }

    // Clear multi-selection when clicking without Shift
    if (selectedComponents.size > 0) {
      setSelectedComponents(new Set());
    }

    // Track if component was already selected (toggle deselect deferred to pointerUp)
    const wasAlreadySelected = selectedComponent === componentId;

    // Identify component type
    const comp = experiment?.components?.find(c => c.id === componentId);
    const compType = comp?.type;

    // FIX P0-2: Push-button — press on pointerdown, release on pointerup
    // Also supports drag-to-move: if pointer moves during press, drag the button instead.
    if (compType === 'push-button') {
      setSelectedComponent(componentId);
      if (onComponentClick) onComponentClick(componentId, 'press');
      dragMovedRef.current = false;
      pendingClickRef.current = { componentId, compType, wasAlreadySelected };

      // Set up drag (position move) alongside press/release
      if (!wireMode || !wireStart) {
        const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
        const pos = experiment?.layout?.[componentId] || { x: 0, y: 0 };
        dragStartPosRef.current = pos;
        setDragOffset({ x: svgPt.x - pos.x, y: svgPt.y - pos.y });
        setDragCompId(componentId);
        setIsDragging(true);
        // S101: Initialize dead zone tracking
        dragDeadZonePassedRef.current = false;
        dragStartClientRef.current = { clientX: e.clientX, clientY: e.clientY };
      }

      // Release handler: only fire release if NOT dragged (click vs drag)
      // G42: Clean up any stale pending release before adding new one
      if (pendingReleaseRef.current) {
        window.removeEventListener('pointerup', pendingReleaseRef.current);
      }
      const handleRelease = () => {
        if (!dragMovedRef.current) {
          if (onComponentClick) onComponentClick(componentId, 'release');
        }
        window.removeEventListener('pointerup', handleRelease);
        pendingReleaseRef.current = null;
      };
      pendingReleaseRef.current = handleRelease;
      window.addEventListener('pointerup', handleRelease);
      return;
    }

    // FIX P0-5: Potentiometer — drag moves component, click opens overlay
    // In free mode, potentiometer behaves like any other component: drag to move,
    // click to interact (opens PotOverlay for knob rotation).
    if (compType === 'potentiometer') {
      setSelectedComponent(componentId);
      dragMovedRef.current = false;
      pendingClickRef.current = { componentId, compType, wasAlreadySelected };

      // Set up drag-to-move (same as other components)
      if (!wireMode || !wireStart) {
        const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
        const pos = experiment?.layout?.[componentId] || { x: 0, y: 0 };
        dragStartPosRef.current = pos;
        setDragOffset({ x: svgPt.x - pos.x, y: svgPt.y - pos.y });
        setDragCompId(componentId);
        setIsDragging(true);
        // S101: Initialize dead zone tracking
        dragDeadZonePassedRef.current = false;
        dragStartClientRef.current = { clientX: e.clientX, clientY: e.clientY };
      }
      return;
    }

    // ALL OTHER COMPONENTS (LED, resistor, photo-resistor, phototransistor,
    // reed-switch, buzzer, capacitor, mosfet, motor, diode, servo, LCD, etc.)
    // → Always select + start drag. Click actions deferred to pointerUp.
    setSelectedComponent(componentId);
    dragMovedRef.current = false;
    pendingClickRef.current = { componentId, compType, wasAlreadySelected };

    // Start drag (unless in wire mode with active wire)
    if (!wireMode || !wireStart) {
      const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
      const pos = experiment?.layout?.[componentId] || { x: 0, y: 0 };
      dragStartPosRef.current = pos;
      setDragOffset({ x: svgPt.x - pos.x, y: svgPt.y - pos.y });
      setDragCompId(componentId);
      setIsDragging(true);
      // S101: Initialize dead zone tracking
      dragDeadZonePassedRef.current = false;
      dragStartClientRef.current = { clientX: e.clientX, clientY: e.clientY };
    }
  }, [wireMode, wireStart, experiment, onComponentClick, onComponentValueChange, onConnectionAdd, zoom, selectedComponent, selectedComponents, contextMenu]);

  // === RIGHT-CLICK: Show context menu (replaces direct rotate) ===
  const handleComponentContextMenu = useCallback((componentId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!experiment) return;
    setContextMenu({ clientX: e.clientX, clientY: e.clientY, componentId });
    setSelectedComponent(componentId);
  }, [experiment]);

  // Deseleziona (background click)
  const handleBackgroundClick = useCallback(() => {
    // Task 3: Close context menu on background click
    if (contextMenu) {
      setContextMenu(null);
      return;
    }
    // If a component was just clicked (mousedown), don't deselect
    if (compClickedRef.current) {
      compClickedRef.current = false;
      return;
    }
    // S72 P2-DESELECT-1: suppress deselect if user panned > 5px (was trying to scroll, not click)
    if (panDistRef.current > 5) {
      panDistRef.current = 0;
      return;
    }
    panDistRef.current = 0;
    if (!isDragging) {
      setSelectedComponent(null);
      setSelectedComponents(new Set());
    }
  }, [isDragging, contextMenu]);

  // === DRAG-AND-DROP FROM PALETTE (onDrop) ===

  // Sprint 2 Task 2.4: Compute target hole positions for guided mode drop zones
  const guidedTargetHoles = useMemo(() => {
    if (!buildValidation || buildValidation.currentStep < 0 || !experiment) return [];
    const step = buildValidation.buildSteps[buildValidation.currentStep];
    if (!step || !step.targetPins) return [];
    const holes = [];
    for (const targetRef of Object.values(step.targetPins)) {
      // targetRef format: "bb1:e5" — resolve to absolute SVG coordinates
      const pos = resolvePinPosition(targetRef, experiment.components, experiment.layout);
      if (pos && pos.x != null && pos.y != null) {
        holes.push({ x: pos.x, y: pos.y });
      }
    }
    return holes;
  }, [buildValidation, experiment]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    // Show ghost preview at cursor position with actual component type
    if (svgRef.current) {
      const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);
      const previewX = snapToGrid ? snapToGridPoint(svgPt.x) : Math.round(svgPt.x);
      const previewY = snapToGrid ? snapToGridPoint(svgPt.y) : Math.round(svgPt.y);
      // Read component type from global (dataTransfer.getData unavailable during dragOver)
      const dragType = window.__elabDragType || '_pending';
      setDragPreview(prev => ({
        type: dragType,
        x: previewX,
        y: previewY,
      }));
    }

    // Sprint 2 Task 2.4: Show highlighted target holes during guided drag
    if (guidedTargetHoles.length > 0) {
      setHighlightedHoles(guidedTargetHoles);
    }
  }, [snapToGrid, guidedTargetHoles]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragPreview(null); // Clear ghost preview
    setHighlightedHoles([]); // Clear drop zone highlights

    // Try JSON payload first (from ComponentPalette/ComponentDrawer), then plain type string
    let componentType = null;
    const jsonRaw = e.dataTransfer.getData('application/elab-component');
    if (jsonRaw) {
      try { componentType = JSON.parse(jsonRaw).type; } catch { /* ignore */ }
    }
    if (!componentType) {
      componentType = e.dataTransfer.getData('application/elab-component-type');
    }
    if (!componentType) return;

    // Calculate SVG position from mouse
    const svgPt = clientToSVG(svgRef.current, e.clientX, e.clientY);

    // Build validation for "Monta tu!" guided mode
    if (buildValidation && buildValidation.currentStep >= 0) {
      const step = buildValidation.buildSteps[buildValidation.currentStep];
      if (step && step.componentType === componentType) {
        // Correct component — find target position from layout
        const targetPos = experiment?.layout?.[step.componentId];
        const dropX = snapToGridPoint(svgPt.x);
        const dropY = snapToGridPoint(svgPt.y);

        if (targetPos) {
          const dx = Math.abs(dropX - targetPos.x);
          const dy = Math.abs(dropY - targetPos.y);
          const CLOSE_THRESHOLD = GRID_PITCH * 3; // within ~3 holes = close enough

          if (dx <= CLOSE_THRESHOLD && dy <= CLOSE_THRESHOLD) {
            // Close enough — advance step with green flash
            // NOTE: component is already in filteredComponents via buildStepIndex — NO onComponentAdd here
            setDropSuccess(true);
            setTimeout(() => setDropSuccess(false), 600);
            if (onBuildValidationResult) {
              onBuildValidationResult({ valid: true, stepIndex: buildValidation.currentStep });
            }
          } else {
            // Sprint 2 Task 2.3: Auto-correction animation
            // Phase 1: Red flash at drop point (500ms)
            // Phase 2: Slide to correct position (300ms)
            // Phase 3: Green flash + advance step (500ms)
            setAutoCorrection({
              type: componentType, fromX: dropX, fromY: dropY,
              toX: targetPos.x, toY: targetPos.y, phase: 'red',
            });
            setTimeout(() => {
              setAutoCorrection(prev => prev ? { ...prev, phase: 'slide' } : null);
              setTimeout(() => {
                setAutoCorrection(prev => prev ? { ...prev, phase: 'green' } : null);
                setTimeout(() => {
                  setAutoCorrection(null);
                  setDropSuccess(true);
                  setTimeout(() => setDropSuccess(false), 400);
                  if (onBuildValidationResult) {
                    onBuildValidationResult({ valid: true, stepIndex: buildValidation.currentStep });
                  }
                  // NOTE: no onComponentAdd — component already revealed by buildStepIndex
                }, 500);
              }, 300);
            }, 500);
          }
        } else {
          // No target position in layout — fallback: just advance step with green flash
          setDropSuccess(true);
          setTimeout(() => setDropSuccess(false), 600);
          if (onBuildValidationResult) {
            onBuildValidationResult({ valid: true, stepIndex: buildValidation.currentStep });
          }
        }
      } else {
        // Wrong component — flash red feedback, do NOT place
        setDropError(true);
        setTimeout(() => setDropError(false), 800);
      }
      return; // Skip normal drop logic in build mode
    }

    if (onComponentAdd) {
      const dropX = snapToGrid ? snapToGridPoint(svgPt.x) : Math.round(svgPt.x);
      const dropY = snapToGrid ? snapToGridPoint(svgPt.y) : Math.round(svgPt.y);

      // Verify that this new component drop doesn't overlap existing components
      if (!isValidDropPosition(componentType, dropX, dropY, 0, experiment)) {
        setDropError(true);
        setTimeout(() => setDropError(false), 800);
        return;
      }

      onComponentAdd(componentType, { x: dropX, y: dropY });
    }
  }, [onComponentAdd, buildValidation, onBuildValidationResult, snapToGrid, experiment]);

  // === PIN CLICK HANDLER (used by PinOverlay, also triggers wire logic) ===
  const handlePinClick = useCallback((pinRef) => {
    if (wireMode && experiment) {
      if (!wireStart) {
        const pos = resolvePinPosition(pinRef, experiment.components, experiment.layout);
        setWireStart(pinRef);
        setWireStartPos(pos);
        setWirePreviewEnd(pos);
      } else if (pinRef !== wireStart) {
        if (onConnectionAdd) {
          onConnectionAdd(wireStart, pinRef);
        }
        setWireStart(null);
        setWireStartPos(null);
        setWirePreviewEnd(null);
      }
    }
    // Also call external handler
    if (onPinClick) onPinClick(pinRef);
  }, [wireMode, wireStart, experiment, onPinClick, onConnectionAdd]);

  // Compute wire current data (direction + magnitude) from solver state for each wire
  const wireCurrents = useMemo(() => {
    if (!experiment?.connections || !componentStates) return {};
    const result = {};
    experiment.connections.forEach((conn, index) => {
      const [fromCompId, fromPinId] = conn.from.split(':');
      const [toCompId, toPinId] = conn.to.split(':');
      const fromState = componentStates[fromCompId] || {};
      const toState = componentStates[toCompId] || {};

      // Determine current magnitude from either endpoint's state
      const magnitude = Math.max(
        Math.abs(fromState.current || 0),
        Math.abs(toState.current || 0)
      );

      if (magnitude < 0.0001 && !fromState.on && !toState.on) return;

      // Direction: conventional current flows from higher voltage to lower
      // Positive pin refs → source (direction = 1 means from→to)
      const isFromPositive = (fromPinId || '').match(/positive|plus|vcc|5v|3v3|vin|anode/i);
      const isToPositive = (toPinId || '').match(/positive|plus|vcc|5v|3v3|vin|anode/i);
      const fromIsBusPlus = conn.from.includes('bus-') && conn.from.includes('-plus');
      const toIsBusPlus = conn.to.includes('bus-') && conn.to.includes('-plus');

      let direction = 1; // default: forward (from→to)
      if (isToPositive || toIsBusPlus) {
        direction = -1; // current flows from "to" end toward "from" end
      } else if (isFromPositive || fromIsBusPlus) {
        direction = 1;
      }

      // Use voltage data from solver if available
      if (fromState.voltage !== undefined && toState.voltage !== undefined) {
        direction = fromState.voltage >= toState.voltage ? 1 : -1;
      }

      result[index] = {
        direction,
        magnitude: magnitude * 1000, // convert A to mA
      };
    });
    return result;
  }, [experiment?.connections, componentStates]);

  // Renderizza componenti dell'esperimento
  const renderComponentGroup = (componentsList) => {
    return componentsList.map((comp) => {
      const registered = getComponent(comp.type);
      const rawPos = experiment.layout?.[comp.id] || {};
      const pos = { x: Number.isFinite(rawPos.x) ? rawPos.x : 0, y: Number.isFinite(rawPos.y) ? rawPos.y : 0, rotation: rawPos.rotation, parentId: rawPos.parentId };
      const rotation = pos.rotation || 0;

      if (!registered) {
        return (
          <g key={comp.id} transform={`translate(${pos.x}, ${pos.y})${rotation ? ` rotate(${rotation})` : ''}`}>
            <rect x="-25" y="-12" width="50" height="24" rx="3"
              fill="#FFF3CD" stroke="#FFC107" strokeWidth="1" strokeDasharray="3 2" />
            <text x="0" y="5" textAnchor="middle" fontSize="14" fill="#856404"
              fontFamily="Open Sans, sans-serif">
              {comp.type}
            </text>
          </g>
        );
      }

      const Component = registered.component;
      let state = componentStates[comp.id] || registered.defaultState;

      // Build nano-r4 state from root _pins data (pin states + LED indicators)
      if (comp.type === 'nano-r4' && componentStates._pins) {
        const rootPins = componentStates._pins;
        state = {
          ...state,
          running: !!componentStates._avrRunning,
          pinStates: rootPins,
          leds: {
            power: !!componentStates._avrRunning,
            d13: !!(rootPins.D13),
            rgb: state.leds?.rgb || [0, 0, 0],
            tx: !!componentStates._txActive,
            rx: !!componentStates._rxActive,
          },
        };
      }

      const isHighlighted = highlightedComponents.includes(comp.id);
      const isSelected = selectedComponent === comp.id;
      const isMultiSelected = selectedComponents.has(comp.id);

      const isBeingDragged = isDragging && dragCompId === comp.id && dragDeadZonePassedRef.current;

      return (
        <g
          key={comp.id}
          data-component-id={comp.id}
          tabIndex={0}
          role="group"
          aria-label={`${comp.type} ${comp.id}`}
          onPointerDown={(e) => handleComponentPointerDown(comp.id, e)}
          onContextMenu={(e) => handleComponentContextMenu(comp.id, e)}
          onFocus={() => { if (!selectedComponent) handleComponentPointerDown(comp.id, { button: 0, stopPropagation: () => {}, preventDefault: () => {} }); }}
          style={{
            cursor: isBeingDragged ? 'grabbing' : 'grab',
            // S101: Visual drag feedback — scale + shadow + opacity
            opacity: isBeingDragged ? 0.85 : 1,
            filter: isBeingDragged ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' : 'none',
            transform: isBeingDragged ? 'scale(1.03)' : undefined,
            transformOrigin: isBeingDragged ? `${pos.x}px ${pos.y}px` : undefined,
            transition: isBeingDragged ? 'none' : 'opacity 150ms ease, filter 150ms ease, transform 150ms ease',
            outline: 'none', // SVG uses visual ring below instead
          }}
        >
          {/* V2: Multi-selection highlight — blue dashed outline */}
          {isMultiSelected && !isSelected && (() => {
            const size = COMP_SIZES[comp.type] || { w: 40, h: 40 };
            const pad = 4;
            const isTopLeft = comp.type === 'breadboard-half' || comp.type === 'breadboard-full' || comp.type === 'nano-r4';
            const rectX = isTopLeft ? pos.x - pad : pos.x - size.w / 2 - pad;
            const rectY = isTopLeft ? pos.y - pad : pos.y - size.h / 2 - pad;
            return (
              <rect
                x={rectX} y={rectY}
                width={size.w + pad * 2} height={size.h + pad * 2} rx="4"
                fill="none" stroke="var(--color-primary, #1E4D8C)" strokeWidth="2"
                strokeDasharray="5 3" opacity="0.8"
                pointerEvents="none"
              />
            );
          })()}

          {/* Selection highlight glow + delete button — sized to component */}
          {isSelected && (() => {
            const size = COMP_SIZES[comp.type] || { w: 40, h: 40 };
            const pad = 6;
            const isTopLeft = comp.type === 'breadboard-half' || comp.type === 'breadboard-full' || comp.type === 'nano-r4';
            // For TOP_LEFT_ORIGIN: rect from (-pad, -pad) to (size.w+pad, size.h+pad)
            // For centered: rect from (-size.w/2-pad, -size.h/2-pad) to (size.w/2+pad, size.h/2+pad)
            const rectX = isTopLeft ? -pad : -(size.w / 2 + pad);
            const rectY = isTopLeft ? -pad : -(size.h / 2 + pad);
            const rectW = size.w + pad * 2;
            const rectH = size.h + pad * 2;
            const noDelete = []; // Tinkercad style: Everything can be deleted!
            const canDelete = true;
            // Button positions: top-right and top-left of the highlight rect
            const btnDeleteX = rectX + rectW - 2;
            const btnDeleteY = rectY + 2;
            const btnRotateX = rectX + 2;
            const btnRotateY = rectY + 2;
            return (
              <g transform={`translate(${pos.x}, ${pos.y})${rotation ? ` rotate(${rotation})` : ''}`}>
                <rect
                  x={rectX} y={rectY} width={rectW} height={rectH} rx="5"
                  fill="none"
                  stroke="var(--color-accent, #4A7A25)"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                  opacity="0.9"
                  style={{ filter: 'drop-shadow(0 0 4px #4A7A25)' }}
                >
                  <animate
                    attributeName="stroke-opacity"
                    values="0.5;1;0.5"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </rect>
                {/* Delete button (top-right corner) */}
                {canDelete && onComponentDelete && (
                  <g
                    transform={`translate(${btnDeleteX}, ${btnDeleteY})`}
                    style={{ cursor: 'pointer' }}
                    onPointerDown={(ev) => {
                      ev.stopPropagation();
                      ev.preventDefault();
                      onComponentDelete(comp.id);
                      setSelectedComponent(null);
                    }}
                  >
                    {/* Invisible hit area for 44px touch target (r=22 in SVG units) */}
                    <circle r="16" fill="transparent" stroke="none" />
                    <circle r="8" fill="var(--color-vol3, #E54B3D)" stroke="#fff" strokeWidth="1.2" opacity="0.9" />
                    <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  </g>
                )}
                {/* Rotate hint icon (top-left corner) — quick +90 cycle (legacy keyboard-friendly path) */}
                {canDelete && onLayoutChange && (
                  <g
                    transform={`translate(${btnRotateX}, ${btnRotateY})`}
                    style={{ cursor: 'pointer' }}
                    onPointerDown={(ev) => {
                      ev.stopPropagation();
                      ev.preventDefault();
                      const currentRotation = pos.rotation || 0;
                      const newRotation = (currentRotation + 90) % 360;
                      onLayoutChange(comp.id, { ...pos, rotation: newRotation });
                    }}
                  >
                    {/* Invisible hit area for 44px touch target */}
                    <circle r="16" fill="transparent" stroke="none" />
                    <circle r="8" fill="var(--color-primary, #1E4D8C)" stroke="#fff" strokeWidth="1.2" opacity="0.9" />
                    <text x="0" y="5" textAnchor="middle" fontSize="14" fill="#fff" fontFamily="sans-serif">↻</text>
                  </g>
                )}
              </g>
            );
          })()}

          {/* iter 13 R2: RotationHandle visible affordance — 4 buttons 0/90/180/270 snap discrete */}
          {isSelected && onLayoutChange && (() => {
            const size = COMP_SIZES[comp.type] || { w: 40, h: 40 };
            const isTopLeft = comp.type === 'breadboard-half' || comp.type === 'breadboard-full' || comp.type === 'nano-r4';
            // Anchor handle to the right of component bounding box, vertically centered
            const handleX = isTopLeft ? pos.x + size.w + 28 : pos.x + size.w / 2 + 28;
            const handleY = isTopLeft ? pos.y + 8 : pos.y - 75;
            return (
              <RotationHandle
                componentId={comp.id}
                currentRotation={pos.rotation || 0}
                anchorX={handleX}
                anchorY={handleY}
                visible={true}
                onRotate={(newRot) => {
                  const snapped = snapToNearestQuadrant(newRot);
                  onLayoutChange(comp.id, { ...pos, rotation: snapped });
                }}
              />
            );
          })()}

          {/* The actual component — wrapped in rotation transform */}
          <g transform={rotation ? `rotate(${rotation}, ${pos.x}, ${pos.y})` : undefined}>
            <Component
              x={pos.x}
              y={pos.y}
              state={state}
              highlighted={isHighlighted}
              id={comp.id}
              onInteract={onComponentClick ? (compId, action) => onComponentClick(compId, action) : undefined}
              {...(comp.value !== undefined ? { value: comp.value } : {})}
              {...(comp.color !== undefined ? { color: comp.color } : {})}
              {...((comp.type === 'breadboard-half' || comp.type === 'breadboard-full') && wireMode
                ? { onHoleClick: (holeId) => handlePinClick(`${comp.id}:${holeId}`) }
                : {})}
              {...(comp.type === 'multimeter' ? {
                probePositions: probePositions[comp.id] || null,
                probeSnapped: probeSnapped[comp.id] || null,
                onProbeMove: (probeId, action, ev) => handleProbeMove(comp.id, probeId, action, ev),
              } : {})}
              {...(comp.type === 'nano-r4' ? { parentRotation: rotation } : {})}
            />
          </g>

          {/* Component label (R1, LED1, C1 etc) */}
          {!['breadboard-half', 'breadboard-full', 'nano-r4', 'wire', 'battery9v'].includes(comp.type) && (() => {
            const size = COMP_SIZES[comp.type] || { w: 40, h: 40 };
            const labelY = pos.y + size.h / 2 + 10;
            return (
              <text
                x={pos.x}
                y={labelY}
                textAnchor="middle"
                fontSize="14"
                fill="#666"
                fontFamily="Open Sans, sans-serif"
                fontWeight="600"
                pointerEvents="none"
                opacity="0.8"
              >
                {comp.id.toUpperCase()}
              </text>
            );
          })()}

          {/* S99: Disconnected pin indicators — orange pulsing circles */}
          {state.disconnectedPins && state.disconnectedPins.length > 0 && (
            state.disconnectedPins.map(pinName => {
              const pinRef = `${comp.id}:${pinName}`;
              const pinPos = resolvePinPosition(pinRef, experiment.components, experiment.layout);
              if (!pinPos) return null;
              return (
                <circle
                  key={`disc-${pinRef}`}
                  cx={pinPos.x} cy={pinPos.y} r={5}
                  fill="none"
                  stroke="var(--color-vol2, #E8941C)"
                  strokeWidth={2}
                  opacity={0.9}
                  pointerEvents="none"
                >
                  <animate attributeName="r" values="4;7;4" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.2s" repeatCount="indefinite" />
                </circle>
              );
            })
          )}

          {/* S99: Overcurrent warning — yellow pulsing border on LED */}
          {state.warning === 'overcurrent' && (() => {
            const size = COMP_SIZES[comp.type] || { w: 40, h: 40 };
            return (
              <rect
                x={pos.x - size.w / 2 - 3} y={pos.y - size.h / 2 - 3}
                width={size.w + 6} height={size.h + 6}
                rx={4} fill="none"
                stroke="#FFD600" strokeWidth={2}
                pointerEvents="none"
              >
                <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
              </rect>
            );
          })()}
        </g>
      );
    });
  };

  const { baseComponents, topComponents } = useMemo(() => {
    if (!experiment || !experiment.components) return { baseComponents: null, topComponents: null };
    const baseTypes = ['breadboard-half', 'breadboard-full', 'nano-r4'];
    const baseList = experiment.components.filter(c => baseTypes.includes(c.type));
    const topList = experiment.components.filter(c => !baseTypes.includes(c.type));

    return {
      baseComponents: renderComponentGroup(baseList),
      topComponents: renderComponentGroup(topList)
    };
  }, [
    experiment,
    componentStates,
    highlightedComponents,
    selectedComponent,
    selectedComponents,
    handleComponentPointerDown,
    handleComponentContextMenu,
    isDragging,
    dragCompId,
    wireMode,
    handlePinClick,
    onComponentDelete,
    onComponentClick,
    onLayoutChange,
    probePositions,
    probeSnapped,
    handleProbeMove,
  ]);

  // Determine the cursor for the SVG
  const svgCursor = useMemo(() => {
    if (isDragging) return 'grabbing';
    if (isPanning) return 'grabbing';
    if (wireMode) return 'crosshair';
    return 'default';
  }, [isDragging, isPanning, wireMode]);

  if (!experiment) {
    return (
      <div className={`elab-simulator-canvas ${className}`} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-gray-300, #737373)', fontFamily: "var(--font-sans, 'Open Sans', sans-serif)" }}>
          Seleziona un esperimento per iniziare
        </p>
      </div>
    );
  }

  return (
    <div
      className={`elab-simulator-canvas ${className}`}
      style={{ position: 'relative', touchAction: 'none', ...style }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={() => { setDragPreview(null); setHighlightedHoles([]); }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={currentViewBox}
        style={{
          background: 'var(--color-bg-secondary, #FAFAF7)',
          borderRadius: '8px',
          cursor: svgCursor,
          touchAction: 'none'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={(e) => {
          handlePointerUp(e);
          setHoveredPin(null);
          if (pinTooltipTimerRef.current) { clearTimeout(pinTooltipTimerRef.current); pinTooltipTimerRef.current = null; }
        }}
        onPointerCancel={handlePointerUp}
        onClick={handleBackgroundClick}
      >
        {/* Griglia di fondo — dot grid professionale stile Figma/Tinkercad */}
        <defs>
          <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.8" fill="rgba(30,77,140,0.08)" />
          </pattern>
        </defs>
        <rect x="-5000" y="-5000" width="10000" height="10000" fill="#FAFAFA" />
        <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#dotGrid)" style={{ pointerEvents: 'none' }} />

        {/* Layer 1: Base Boards (Breadboard, Arduino) */}
        {baseComponents}

        {/* Layer 2: Wires (on top of boards, below small components) */}
        {experiment.connections && (
          <WireRenderer
            connections={experiment.connections}
            components={experiment.components}
            layout={experiment.layout}
            componentStates={componentStates}
            wireCurrents={wireCurrents}
            selectedWireIndex={selectedWireIndex}
            onWireClick={onWireClick}
            onWireDelete={onWireDelete}
            routingMode={experiment.wireRouting || 'flex'}
            electronViewEnabled={electronViewEnabled}
          />
        )}

        {/* Layer 3: Components (LEDs, Resistors, ICs — safely covering wires) */}
        {topComponents}

        {/* Visual feedback for hovered/tapped pin */}
        {hoveredPin?.svgPos && (
          <circle
            cx={hoveredPin.svgPos.x}
            cy={hoveredPin.svgPos.y}
            r="6"
            fill="none"
            stroke="var(--color-primary, #1E4D8C)"
            strokeWidth="1.5"
            opacity="0.8"
            pointerEvents="none"
          >
            <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}

        {/* CoVe Fix #10: Wire preview con bezier (consistente con WireRenderer) */}
        {wireMode && wireStart && wireStartPos && wirePreviewEnd && (() => {
          // Calcola path bezier come WireRenderer
          const dx = wirePreviewEnd.x - wireStartPos.x;
          const dy = wirePreviewEnd.y - wireStartPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const CORNER_RADIUS = 5;
          const r = Math.min(CORNER_RADIUS, dist * 0.4);

          // Punti intermedi per path multi-segmento
          const midX = (wireStartPos.x + wirePreviewEnd.x) / 2;
          const midY = (wireStartPos.y + wirePreviewEnd.y) / 2;

          // Path: start → bezier → end
          // Usiamo una curva cubica per transizione smooth
          const cp1x = wireStartPos.x + (dx > 0 ? r : -r);
          const cp1y = wireStartPos.y;
          const cp2x = wirePreviewEnd.x - (dx > 0 ? r : -r);
          const cp2y = wirePreviewEnd.y;

          const path = `M ${wireStartPos.x} ${wireStartPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${wirePreviewEnd.x} ${wirePreviewEnd.y}`;

          return (
            <path
              d={path}
              stroke="#999"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
              fill="none"
              pointerEvents="none"
              opacity="0.7"
            />
          );
        })()}

        {/* Drag preview ghost — shows actual component SVG during drag */}
        {dragPreview && (() => {
          const registered = dragPreview.type !== '_pending' ? getComponent(dragPreview.type) : null;
          if (registered) {
            const PreviewComp = registered.component;
            return (
              <g transform={`translate(${dragPreview.x}, ${dragPreview.y})`} opacity="0.5" pointerEvents="none">
                <PreviewComp
                  id="__drag_preview__"
                  state={registered.defaultState}
                  value={registered.defaultState?.value}
                  color={registered.defaultState?.color}
                  selected={false}
                />
              </g>
            );
          }
          return (
            <g transform={`translate(${dragPreview.x}, ${dragPreview.y})`} opacity="0.45" pointerEvents="none">
              <rect x="-40" y="-14" width="80" height="42" rx="6"
                fill="var(--color-accent, #4A7A25)" stroke="var(--color-accent, #4A7A25)" strokeWidth="1.5" strokeDasharray="4 2" fillOpacity="0.15" />
              <text x="0" y="1" textAnchor="middle" fontSize="16" fill="var(--color-accent, #4A7A25)" fontWeight="bold">+</text>
              <text x="0" y="22" textAnchor="middle" fontSize="14" fill="var(--color-accent, #4A7A25)"
                fontFamily="Open Sans, sans-serif">rilascia qui</text>
            </g>
          );
        })()}

        {/* V2: Selection box rectangle */}
        {selectionBox && (() => {
          const x = Math.min(selectionBox.startX, selectionBox.endX);
          const y = Math.min(selectionBox.startY, selectionBox.endY);
          const w = Math.abs(selectionBox.endX - selectionBox.startX);
          const h = Math.abs(selectionBox.endY - selectionBox.startY);
          return (
            <rect
              x={x} y={y} width={w} height={h}
              fill="var(--color-primary, #1E4D8C)" fillOpacity="0.08"
              stroke="var(--color-primary, #1E4D8C)" strokeWidth="1"
              strokeDasharray="4 2" pointerEvents="none"
            />
          );
        })()}

        {/* Pin overlay (sopra tutto) */}
        <PinOverlay
          components={experiment.components}
          layout={experiment.layout}
          highlightedPins={highlightedPins}
          onPinClick={handlePinClick}
        />

        {/* Annotations (Sprint 3) */}
        {annotations.map((note) => (
          <Annotation
            key={note.id}
            id={note.id}
            x={note.x}
            y={note.y}
            text={note.text}
            isSelected={selectedAnnotation === note.id}
            onTextChange={onAnnotationTextChange}
            onSelect={onAnnotationSelect}
            onDelete={onAnnotationDelete}
            onPositionChange={(noteId, x, y) => {
              if (onAnnotationPositionChange) onAnnotationPositionChange(noteId, x, y);
            }}
            onSendToUNLIM={onSendToUNLIM}
          />
        ))}

        {/* Pin hover tooltip — Task 5: moved to HTML overlay (outside SVG) for touch support */}

        {/* Build validation: red flash on wrong component drop */}
        {dropError && (
          <rect x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height}
            fill="var(--color-vol3, #E54B3D)" opacity="0.12" style={{ pointerEvents: 'none' }}>
            <animate attributeName="opacity" from="0.15" to="0" dur="0.8s" fill="freeze" />
          </rect>
        )}

        {/* Sprint 2 Task 2.3: Green flash on correct placement */}
        {dropSuccess && (
          <rect x={viewBox.x} y={viewBox.y} width={viewBox.width} height={viewBox.height}
            fill="var(--color-accent, #4A7A25)" opacity="0.1" style={{ pointerEvents: 'none' }}>
            <animate attributeName="opacity" from="0.15" to="0" dur="0.6s" fill="freeze" />
          </rect>
        )}

        {/* Sprint 2 Task 2.3: Auto-correction animation */}
        {autoCorrection && (() => {
          const { fromX, fromY, toX, toY, phase } = autoCorrection;
          const isSliding = phase === 'slide' || phase === 'green';
          const cx = isSliding ? toX : fromX;
          const cy = isSliding ? toY : fromY;
          const color = phase === 'red' ? '#E54B3D' : phase === 'green' ? '#4A7A25' : '#E8941C';
          const fillOpacity = phase === 'slide' ? 0.35 : 0.5;
          return (
            <g pointerEvents="none" style={{
              transition: phase === 'slide' ? 'none' : undefined,
            }}>
              <g style={{
                transform: `translate(${cx}px, ${cy}px)`,
                transition: isSliding ? 'transform 0.3s ease-in-out' : 'none',
              }}>
                <rect x="-20" y="-14" width="40" height="28" rx="6"
                  fill={color} fillOpacity={fillOpacity}
                  stroke={color} strokeWidth="1.5" />
                {phase === 'red' && (
                  <text x="0" y="4" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">✗</text>
                )}
                {phase === 'green' && (
                  <text x="0" y="4" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">✓</text>
                )}
                {phase === 'slide' && (
                  <text x="0" y="4" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">→</text>
                )}
              </g>
              {/* Dashed path from drop point to target */}
              {phase === 'red' && (
                <line x1={fromX} y1={fromY} x2={toX} y2={toY}
                  stroke="#E8941C" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
              )}
            </g>
          );
        })()}

        {/* Antigravity Phase 2: Drop zone highlight on breadboards */}
        {isDragging && dragCompId && experiment?.components && (() => {
          const dragComp = experiment.components.find(c => c.id === dragCompId);
          if (!dragComp || dragComp.type === 'breadboard-half' || dragComp.type === 'breadboard-full' || dragComp.type === 'nano-r4' || dragComp.type === 'battery9v') return null;

          return experiment.components
            .filter(c => c.type === 'breadboard-half' || c.type === 'breadboard-full')
            .map(bb => {
              const bbPos = experiment.layout?.[bb.id] || { x: 0, y: 0 };
              const isHalf = bb.type === 'breadboard-half';
              return (
                <rect
                  key={`dropzone-${bb.id}`}
                  x={bbPos.x}
                  y={bbPos.y}
                  width={isHalf ? 253 : 110}
                  height={isHalf ? 145 : 469}
                  rx={4}
                  fill="var(--color-accent, #4A7A25)"
                  opacity={0.07}
                  stroke="var(--color-accent, #4A7A25)"
                  strokeWidth={1}
                  strokeDasharray="6,3"
                  strokeOpacity={0.3}
                  pointerEvents="none"
                />
              );
            });
        })()}

        {/* Antigravity Phase 2: Snap ghost preview */}
        {snapGhost && isDragging && (
          <rect
            x={snapGhost.x - snapGhost.w / 2}
            y={snapGhost.y - snapGhost.h / 2}
            width={snapGhost.w}
            height={snapGhost.h}
            rx={3}
            fill="none"
            stroke="var(--color-accent, #4A7A25)"
            strokeWidth={1.5}
            strokeDasharray="4,3"
            opacity={0.6}
            pointerEvents="none"
          />
        )}

        {/* S115: Per-pin snap hole highlights during drag */}
        {snapPinHoles.length > 0 && isDragging && (
          <g pointerEvents="none">
            {snapPinHoles.map((hole, i) => (
              <circle
                key={`snap-pin-${i}`}
                cx={hole.x}
                cy={hole.y}
                r={3.5}
                fill={hole.occupied ? '#E54B3D' : '#4A7A25'}
                fillOpacity={hole.occupied ? 0.5 : 0.6}
                stroke={hole.occupied ? '#E54B3D' : '#4A7A25'}
                strokeWidth={1.2}
                strokeOpacity={0.8}
              />
            ))}
          </g>
        )}

        {/* Sprint 2 Task 2.4: Drop zone highlighted holes */}
        {highlightedHoles.length > 0 && (
          <g pointerEvents="none">
            {highlightedHoles.map((hole, i) => (
              <g key={i}>
                <circle cx={hole.x} cy={hole.y} r="4.5"
                  fill="var(--color-accent, #4A7A25)" fillOpacity="0.25" stroke="var(--color-accent, #4A7A25)" strokeWidth="1">
                  <animate attributeName="r" values="3.5;5;3.5" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="fillOpacity" values="0.15;0.35;0.15" dur="1.2s" repeatCount="indefinite" />
                </circle>
                <circle cx={hole.x} cy={hole.y} r="1.5"
                  fill="var(--color-accent, #4A7A25)" fillOpacity="0.7" />
              </g>
            ))}
          </g>
        )}

      </svg>

      {/* S101: Long-press ripple animation */}
      {longPressRipple && (() => {
        const containerEl = svgRef.current?.parentElement;
        if (!containerEl) return null;
        const rect = containerEl.getBoundingClientRect();
        return (
          <div
            className="elab-longpress-ripple"
            style={{
              position: 'absolute',
              left: longPressRipple.clientX - rect.left,
              top: longPressRipple.clientY - rect.top,
              pointerEvents: 'none', zIndex: 55,
            }}
          />
        );
      })()}

      {/* Task 3 (B2+B3 fix): Context Menu HTML Overlay — zoom-independent, 44px touch targets */}
      {contextMenu && (() => {
        const containerEl = svgRef.current?.parentElement;
        if (!containerEl) return null;
        const rect = containerEl.getBoundingClientRect();
        const left = contextMenu.clientX - rect.left;
        const top = contextMenu.clientY - rect.top;
        const items = [
          {
            label: 'Ruota', icon: '\u21BB', color: 'var(--color-primary, #1E4D8C)', action: () => {
              if (experiment && onLayoutChange) {
                const pos = experiment.layout?.[contextMenu.componentId] || { x: 0, y: 0, rotation: 0 };
                const newRot = ((pos.rotation || 0) + 90) % 360;
                onLayoutChange(contextMenu.componentId, { ...pos, rotation: newRot });
              }
              setContextMenu(null);
            }
          },
          {
            label: 'Elimina', icon: 'X', color: 'var(--color-vol3, #E54B3D)', action: () => {
              if (onComponentDelete) onComponentDelete(contextMenu.componentId);
              setSelectedComponent(null);
              setContextMenu(null);
            }
          },
          {
            label: 'Proprieta', icon: '\u2699', color: 'var(--color-primary, #1E4D8C)', action: () => {
              if (onComponentClick) onComponentClick(contextMenu.componentId);
              setContextMenu(null);
            }
          },
          {
            label: 'Collega Filo', icon: '\u26A1', color: 'var(--color-accent, #4A7A25)', action: () => {
              // S101: Enter wire mode from context menu
              if (onWireModeChange) onWireModeChange(true);
              setWireModeInternal(true);
              // Try to auto-start wire from this component's first pin
              const comp = experiment?.components?.find(c => c.id === contextMenu.componentId);
              if (comp) {
                const pinDefs = comp.pins || [];
                if (pinDefs.length > 0) {
                  const firstPinRef = `${contextMenu.componentId}:${pinDefs[0].id || pinDefs[0].name || pinDefs[0]}`;
                  const pinPos = resolvePinPosition(firstPinRef, experiment.components, experiment.layout);
                  if (pinPos) {
                    setWireStart(firstPinRef);
                    setWireStartPos(pinPos);
                    setWirePreviewEnd(pinPos);
                  }
                }
              }
              setContextMenu(null);
            }
          },
        ];
        return (
          <>
            {/* Click catcher to close menu */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 59 }}
              onPointerDown={(ev) => { ev.stopPropagation(); setContextMenu(null); }}
            />
            {/* Menu card */}
            <div
              role="menu"
              aria-label="Menu azioni componente"
              style={{
                position: 'absolute', left, top, zIndex: 60,
                background: 'var(--color-bg-secondary, #FAFAF7)', border: '1px solid var(--color-border, #D4C9B0)', borderRadius: 8,
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)', padding: '4px 0',
                fontFamily: "var(--font-sans, 'Open Sans', sans-serif)", minWidth: 130,
              }}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  role="menuitem"
                  aria-label={item.label}
                  onPointerDown={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    item.action();
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', minHeight: 44, padding: '0 12px',
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    fontSize: 14, fontWeight: 600, color: 'var(--color-text-gray-700, #333)',
                    fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
                  }}
                  className="elab-ctx-item-html"
                >
                  <span style={{ color: item.color, fontWeight: 'bold', fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </>
        );
      })()}

      {/* Tap-to-place banner — iPad: shows selected component, tap canvas to place */}
      {pendingPlacement && (
        <div role="alert" style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-primary, #1E4D8C)', color: 'var(--color-text-inverse, #fff)', padding: '8px 20px',
          borderRadius: 20, fontSize: 14, fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
          fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 2px 12px rgba(30,77,140,0.25)', zIndex: 40,
          pointerEvents: 'auto', whiteSpace: 'nowrap',
        }}>
          <span>Tocca il canvas per piazzare: {(getComponent(pendingPlacement.type)?.label) || pendingPlacement.type}</span>
          <button
            onClick={() => { setPendingPlacement(null); window.__elabPendingComponent = null; }}
            aria-label="Annulla piazzamento"
            style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', color: 'var(--color-text-inverse, #fff)',
              borderRadius: 22, width: 44, height: 44, cursor: 'pointer',
              fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center',
              justifyContent: 'center', padding: 0, flexShrink: 0,
            }}
            title="Annulla"
          >&times;</button>
        </div>
      )}

      {/* Controlli zoom + wire mode (overlay HTML) — S74 B2: raised from bottom:8 to bottom:56 to avoid overlap with guide bottom-sheet */}
      <div style={{
        position: 'absolute', bottom: 56, left: 8,
        display: 'flex', gap: 4, opacity: 0.8, zIndex: 25,
      }}>
        {/* Wire mode toggle */}
        <button
          onClick={() => {
            // S83: Always reset BOTH states on manual toggle to prevent stuck wire mode
            const newVal = !wireMode;
            if (onWireModeChange) onWireModeChange(newVal);
            setWireModeInternal(newVal);
            setWireStart(null);
            setWireStartPos(null);
            setWirePreviewEnd(null);
            setPendingPlacement(null);
            window.__elabPendingComponent = null;
            wireAutoRef.current = false; // manual toggle resets auto flag
          }}
          style={{
            ...zoomBtnStyle,
            background: wireMode ? 'var(--color-accent, #4A7A25)' : 'var(--color-bg-secondary, #FAFAF7)',
            color: wireMode ? '#fff' : 'var(--color-text-gray-500, #555)',
            width: 'auto',
            paddingLeft: 10,
            paddingRight: 10,
            fontSize: 14,
            fontWeight: wireMode ? 'bold' : 'normal',
          }}
          title={wireMode ? 'Disattiva collegamento fili' : 'Attiva collegamento fili'}
        >
          {wireMode ? 'Filo ON' : 'Filo'}
        </button>

        <button
          onClick={() => {
            setZoom(prev => {
              const newZoom = Math.min(MAX_ZOOM, prev * 1.25);
              // Zoom toward viewport center
              setViewBox(vb => {
                const oldW = vb.width / prev;
                const oldH = vb.height / prev;
                const newW = vb.width / newZoom;
                const newH = vb.height / newZoom;
                return { ...vb, x: vb.x + (oldW - newW) * 0.5, y: vb.y + (oldH - newH) * 0.5 };
              });
              return newZoom;
            });
          }}
          style={zoomBtnStyle}
          title="Ingrandisci"
        >+</button>
        <button
          onClick={resetView}
          style={zoomBtnStyle}
          title="Centra e adatta la vista"
        >{Math.round(zoom * 100)}%</button>
        <button
          onClick={() => {
            setZoom(prev => {
              const newZoom = Math.max(MIN_ZOOM, prev * 0.8);
              // Zoom toward viewport center
              setViewBox(vb => {
                const oldW = vb.width / prev;
                const oldH = vb.height / prev;
                const newW = vb.width / newZoom;
                const newH = vb.height / newZoom;
                return { ...vb, x: vb.x + (oldW - newW) * 0.5, y: vb.y + (oldH - newH) * 0.5 };
              });
              return newZoom;
            });
          }}
          style={zoomBtnStyle}
          title="Riduci"
        >&minus;</button>
      </div>

      {/* Wire mode indicator (top-left) */}
      {wireMode && (
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: wireStart ? 'var(--color-vol2, #E8941C)' : 'var(--color-accent, #4A7A25)',
          color: 'var(--color-text, #1A1A2E)',
          padding: '6px 12px',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
          fontWeight: 'bold',
          pointerEvents: 'none',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}>
          {wireStart ? 'Clicca un secondo pin per collegare' : 'Clicca un pin per iniziare il filo'}
        </div>
      )}

      {/* Selected component hint (bottom-left) */}
      {selectedComponent && !wireMode && selectedComponents.size === 0 && (
        <div style={{
          position: 'absolute', bottom: 8, left: 8,
          background: 'var(--color-bg-secondary, #FAFAF7)',
          border: '1px solid var(--color-border, #D4C9B0)',
          color: 'var(--color-text-gray-500, #555)',
          padding: '5px 10px',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
          pointerEvents: 'none',
          opacity: 0.85,
        }}>
          {selectedComponent} — ↻ ruota · ✕ elimina · Esc deseleziona · click = toggle
        </div>
      )}

      {/* V2: Multi-selection hint (bottom-left) */}
      {selectedComponents.size > 0 && !wireMode && (
        <div style={{
          position: 'absolute', bottom: 8, left: 8,
          background: 'var(--color-bg-secondary, #FAFAF7)',
          border: '1px solid var(--color-primary, #1E4D8C)',
          color: 'var(--color-primary, #1E4D8C)',
          padding: '5px 10px',
          borderRadius: 8,
          fontSize: 14,
          fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
          pointerEvents: 'none',
          opacity: 0.85,
        }}>
          {selectedComponents.size} componenti selezionati — Delete = elimina · Ctrl+C = copia · Ctrl+D = duplica · Esc = deseleziona
        </div>
      )}

      {/* S101: Long-press ripple animation (HTML overlay — expanding circle during 500ms hold) */}
      {longPressRipple && (() => {
        const containerEl = svgRef.current?.parentElement;
        if (!containerEl) return null;
        const rect = containerEl.getBoundingClientRect();
        const left = longPressRipple.clientX - rect.left;
        const top = longPressRipple.clientY - rect.top;
        return (
          <div
            style={{
              position: 'absolute', left: left - 24, top: top - 24,
              width: 48, height: 48, borderRadius: '50%',
              border: '2px solid var(--color-primary, #1E4D8C)',
              pointerEvents: 'none', zIndex: 55,
              animation: 'elabLongPressRipple 500ms ease-out forwards',
            }}
          />
        );
      })()}

      {/* Task 5: Pin tooltip (HTML overlay — touch tap + mouse hover) */}
      {/* B6 fix: flip below pin when near top edge */}
      {hoveredPin && (() => {
        const containerEl = svgRef.current?.parentElement;
        if (!containerEl) return null;
        const rect = containerEl.getBoundingClientRect();
        const left = hoveredPin.clientX - rect.left;
        const top = hoveredPin.clientY - rect.top;
        const TOOLTIP_H = 50; // approx height including margin
        const flipBelow = top < TOOLTIP_H;
        return (
          <div
            className={`elab-pin-tooltip${flipBelow ? ' elab-pin-tooltip--below' : ''}`}
            aria-label={`Pin: ${hoveredPin.label}`}
            style={{ left, top }}
          >
            <span className="elab-pin-tooltip__label">{hoveredPin.label}</span>
            {hoveredPin.details && <span className="elab-pin-tooltip__detail">{hoveredPin.details}</span>}
          </div>
        );
      })()}
    </div>
  );
};

const zoomBtnStyle = {
  width: 44, height: 44,
  border: '1px solid var(--color-border, #D4C9B0)',
  borderRadius: 8,
  background: 'var(--color-bg-secondary, #FAFAF7)',
  cursor: 'pointer',
  fontSize: 16,
  fontFamily: "var(--font-sans, 'Open Sans', sans-serif)",
  color: 'var(--color-text-gray-500, #555)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 44,
};

export default SimulatorCanvas;
