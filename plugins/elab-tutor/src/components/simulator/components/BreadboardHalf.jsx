/**
 * ELAB Simulator — Breadboard Half (400 tie-points)
 * Tinkercad-identical style: white board, simple dark holes,
 * solid-color power rail lines, clean IC channel.
 * Internal connectivity: columns a-e connected vertically per row,
 *   columns f-j connected vertically per row, gap = no connection
 * Pin positions & exported APIs UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad redesign 21/02/2026
 */

import React, { useMemo } from 'react';
import { registerComponent } from './registry';

// Layout constants — based on real 400-point breadboard (UNCHANGED)
const COLS = 30;
const ROWS_PER_SIDE = 5;
const HOLE_PITCH = 7.5;
const HOLE_R = 1.4;
const HOLE_INNER_R = 0.8;
const BOARD_PAD_X = 14;
const BOARD_PAD_Y = 10;
const BUS_GAP = 5;
const GAP_H = 10;
const BUS_HOLE_PITCH = 7.5;

// Calculated dimensions (UNCHANGED)
const MAIN_W = COLS * HOLE_PITCH;
const SECTION_H = ROWS_PER_SIDE * HOLE_PITCH;
const BUS_ROW_H = HOLE_PITCH;

// Total board size (UNCHANGED)
const BOARD_W = MAIN_W + BOARD_PAD_X * 2;
const BOARD_H = BOARD_PAD_Y + BUS_ROW_H * 2 + BUS_GAP + SECTION_H + GAP_H + SECTION_H + BUS_GAP + BUS_ROW_H * 2 + BOARD_PAD_Y;

// Y-offsets for each section (UNCHANGED)
const Y_BUS_TOP_PLUS = BOARD_PAD_Y;
const Y_BUS_TOP_MINUS = BOARD_PAD_Y + BUS_ROW_H;
const Y_SECTION_TOP = BOARD_PAD_Y + BUS_ROW_H * 2 + BUS_GAP;
const Y_GAP = Y_SECTION_TOP + SECTION_H;
const Y_SECTION_BOT = Y_GAP + GAP_H;
const Y_BUS_BOT_PLUS = Y_SECTION_BOT + SECTION_H + BUS_GAP;
const Y_BUS_BOT_MINUS = Y_BUS_BOT_PLUS + BUS_ROW_H;

// Tinkercad-matched colors — light board, light rim + dark core holes, red + black rails
const BOARD_BG = 'var(--elab-hex-f2f2f2)';
const BOARD_EDGE = 'var(--elab-hex-d2d2d2)';
const HOLE_RIM = 'var(--elab-hex-bdbdbd)';
const HOLE_CORE = 'var(--elab-hex-2f2f2f)';
const BUS_RED = 'var(--elab-hex-d32f2f)';
const BUS_NEG = 'var(--elab-hex-424242)';
const LABEL_COLOR = 'var(--elab-hex-4a4a4a)';
const CHANNEL_BG = 'var(--elab-hex-dadada)';
const CHANNEL_NOTCH = 'var(--elab-hex-cfcfcf)';

// Row labels
const TOP_LABELS = ['a', 'b', 'c', 'd', 'e'];
const BOT_LABELS = ['f', 'g', 'h', 'i', 'j'];

/**
 * Darken a hex color by a factor (0-1). Used for active hole inner ring.
 */
function darkenColor(hex, factor) {
  const m = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return hex;
  const r = Math.round(parseInt(m[1], 16) * factor);
  const g = Math.round(parseInt(m[2], 16) * factor);
  const b = Math.round(parseInt(m[3], 16) * factor);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Single hole — Tinkercad style: simple dark circle with depth
 * `active` can be:
 *   - falsy → default dark hole
 *   - true / 'var(--elab-hex-6aaf35)' → green (component pin inserted)
 *   - any other color string → wire endpoint color
 * When onClick is provided (wire mode), the hole becomes clickable
 */
const Hole = React.memo(({ cx, cy, active, onClick }) => {
  const isActive = !!active;
  const activeColor = typeof active === 'string' ? active : 'var(--elab-hex-6aaf35)';
  const innerColor = isActive ? darkenColor(activeColor, 0.45) : HOLE_CORE;
  const outerColor = isActive ? activeColor : HOLE_RIM;

  return (
    <g
      onClick={onClick || undefined}
      style={onClick ? { cursor: 'crosshair' } : undefined}
    >
      {isActive && (
        <circle cx={cx} cy={cy} r={HOLE_R + 1.5} fill={activeColor} opacity={0.3} />
      )}
      {/* Hole rim (light) */}
      <circle cx={cx} cy={cy} r={HOLE_R} fill={outerColor} />
      {/* Hole core (dark) */}
      <circle cx={cx} cy={cy} r={HOLE_INNER_R} fill={innerColor} />
      {/* Subtle highlight */}
      {!isActive && (
        <circle cx={cx - 0.35} cy={cy - 0.35} r={HOLE_INNER_R * 0.65} fill="var(--elab-hex-ffffff)" opacity={0.18} />
      )}
      {/* Clickable hit area for iPad (slightly overlapping to remove deadzones) */}
      {onClick && (
        <circle cx={cx} cy={cy} r={HOLE_PITCH * 0.65} fill="transparent" />
      )}
    </g>
  );
});

/**
 * Power bus row — Tinkercad style: solid colored line + holes
 */
const BusRow = React.memo(({ y, color, label, activeHoles = {}, onHoleClick }) => {
  const holes = [];
  for (let col = 0; col < COLS; col++) {
    const cx = BOARD_PAD_X + col * HOLE_PITCH + HOLE_PITCH / 2;
    const holeId = `bus-${label}-${col + 1}`;
    holes.push(
      <Hole key={holeId} cx={cx} cy={y + BUS_ROW_H / 2} active={activeHoles[holeId]}
        onClick={onHoleClick ? (e) => { e.stopPropagation(); onHoleClick(holeId); } : undefined} />
    );
  }

  return (
    <g>
      {/* Solid colored line running full width (Tinkercad style) */}
      <line
        x1={BOARD_PAD_X} y1={y + BUS_ROW_H / 2}
        x2={BOARD_PAD_X + MAIN_W} y2={y + BUS_ROW_H / 2}
        stroke={color} strokeWidth={1.25} opacity={0.85}
      />
      {/* Label */}
      {(() => {
        const sign = (label === 'top-plus' || label === 'bot-plus') ? '+' : '\u2212';
        return (
          <>
            <text x={BOARD_PAD_X - 8} y={y + BUS_ROW_H / 2 + 1.6}
              textAnchor="middle" fontSize="5" fill={color} fontWeight="bold"
              fontFamily="Arial, Helvetica, sans-serif">
              {sign}
            </text>
            <text x={BOARD_PAD_X + MAIN_W + 8} y={y + BUS_ROW_H / 2 + 1.6}
              textAnchor="middle" fontSize="5" fill={color} fontWeight="bold"
              fontFamily="Arial, Helvetica, sans-serif">
              {sign}
            </text>
          </>
        );
      })()}
      {holes}
    </g>
  );
});

/**
 * Main hole section (5 rows x 30 columns)
 */
const HoleSection = React.memo(({ yStart, rowLabels, activeHoles = {}, onHoleClick }) => {
  const elements = [];

  for (let row = 0; row < ROWS_PER_SIDE; row++) {
    const cy = yStart + row * HOLE_PITCH + HOLE_PITCH / 2;
    const rowLabel = rowLabels[row];

    elements.push(
      <text key={`lbl-${rowLabel}`} x={BOARD_PAD_X - 6} y={cy + 1.5}
        textAnchor="middle" fontSize="3.9" fill={LABEL_COLOR}
        fontFamily="Arial, Helvetica, sans-serif">
        {rowLabel}
      </text>
    );

    elements.push(
      <text key={`lbl-r-${rowLabel}`} x={BOARD_PAD_X + MAIN_W + 6} y={cy + 1.5}
        textAnchor="middle" fontSize="3.9" fill={LABEL_COLOR}
        fontFamily="Arial, Helvetica, sans-serif">
        {rowLabel}
      </text>
    );

    for (let col = 0; col < COLS; col++) {
      const cx = BOARD_PAD_X + col * HOLE_PITCH + HOLE_PITCH / 2;
      const holeId = `${rowLabel}${col + 1}`;
      elements.push(
        <Hole key={holeId} cx={cx} cy={cy} active={activeHoles[holeId]}
          onClick={onHoleClick ? (e) => { e.stopPropagation(); onHoleClick(holeId); } : undefined} />
      );
    }
  }

  return <g>{elements}</g>;
});

const BreadboardHalf = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, onHoleClick, id }) => {
  const activeHoles = state.activeHoles || {};

  const colLabels = useMemo(() => {
    const labels = [];
    for (let col = 0; col < COLS; col++) {
      const cx = BOARD_PAD_X + col * HOLE_PITCH + HOLE_PITCH / 2;
      labels.push(
        <text key={`cn-${col}`} x={cx} y={Y_SECTION_TOP - 2.2}
          textAnchor="middle" fontSize="3.5" fill={LABEL_COLOR}
          fontFamily="Arial, Helvetica, sans-serif">
          {col + 1}
        </text>
      );
      labels.push(
        <text key={`cn-b-${col}`} x={cx} y={Y_SECTION_BOT + SECTION_H + 4.7}
          textAnchor="middle" fontSize="3.5" fill={LABEL_COLOR}
          fontFamily="Arial, Helvetica, sans-serif">
          {col + 1}
        </text>
      );
    }
    return labels;
  }, []);

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="breadboard-half" role="img"
       aria-label={`Breadboard Half ${id}`}>
      <defs>
        <linearGradient id={`${id}-bbh-surface`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--elab-hex-ffffff)" />
          <stop offset="40%" stopColor="var(--elab-hex-f5f5f5)" />
          <stop offset="100%" stopColor="var(--elab-hex-e8e8e8)" />
        </linearGradient>
        <pattern id={`${id}-bbh-texture`} width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" x="0" y="0" fill="#000" opacity="0.02" />
          <rect width="1" height="1" x="2" y="1" fill="#000" opacity="0.03" />
          <rect width="1" height="1" x="1" y="2" fill="#000" opacity="0.025" />
        </pattern>
        <filter id={`${id}-bbh-shadow`}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
          <feOffset dx="1" dy="1.5" />
          <feComposite in2="SourceAlpha" operator="out" />
          <feComponentTransfer><feFuncA type="linear" slope="0.1" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Board body with gradient + texture */}
      <rect x="0" y="0" width={BOARD_W} height={BOARD_H} rx="3"
        fill={`url(#${id}-bbh-surface)`} stroke={BOARD_EDGE} strokeWidth="0.6"
        filter={`url(#${id}-bbh-shadow)`} />
      <rect x="0" y="0" width={BOARD_W} height={BOARD_H} rx="3"
        fill={`url(#${id}-bbh-texture)`} />

      {/* Top edge highlight bevel */}
      <line x1="4" y1="0.5" x2={BOARD_W - 4} y2="0.5" stroke="var(--elab-hex-ffffff)" strokeWidth="0.5" opacity="0.6" />
      {/* Bottom edge shadow */}
      <line x1="4" y1={BOARD_H - 0.3} x2={BOARD_W - 4} y2={BOARD_H - 0.3} stroke="var(--elab-hex-c0c0c0)" strokeWidth="0.4" opacity="0.5" />

      {/* === TOP POWER BUS === */}
      <BusRow y={Y_BUS_TOP_PLUS} color={BUS_RED} label="top-plus" activeHoles={activeHoles} onHoleClick={onHoleClick} />
      <BusRow y={Y_BUS_TOP_MINUS} color={BUS_NEG} label="top-minus" activeHoles={activeHoles} onHoleClick={onHoleClick} />

      {/* Column number labels */}
      {colLabels}

      {/* === TOP SECTION (a-e) === */}
      <HoleSection yStart={Y_SECTION_TOP} rowLabels={TOP_LABELS} activeHoles={activeHoles} onHoleClick={onHoleClick} />

      {/* === CENTRAL IC CHANNEL === */}
      <rect x={BOARD_PAD_X - 2} y={Y_GAP + 1} width={MAIN_W + 4} height={GAP_H - 2}
        rx="1" fill={CHANNEL_BG} />
      {/* Channel notches */}
      {[0, 10, 20].map(col => {
        const cx = BOARD_PAD_X + col * HOLE_PITCH + HOLE_PITCH / 2;
        return (
          <circle key={`notch-${col}`} cx={cx} cy={Y_GAP + GAP_H / 2} r="2"
            fill={CHANNEL_NOTCH} />
        );
      })}

      {/* === BOTTOM SECTION (f-j) === */}
      <HoleSection yStart={Y_SECTION_BOT} rowLabels={BOT_LABELS} activeHoles={activeHoles} onHoleClick={onHoleClick} />

      {/* === BOTTOM POWER BUS === */}
      <BusRow y={Y_BUS_BOT_PLUS} color={BUS_RED} label="bot-plus" activeHoles={activeHoles} onHoleClick={onHoleClick} />
      <BusRow y={Y_BUS_BOT_MINUS} color={BUS_NEG} label="bot-minus" activeHoles={activeHoles} onHoleClick={onHoleClick} />

      {/* Highlight for AI tutoring */}
      {highlighted && (
        <rect x="-3" y="-3" width={BOARD_W + 6} height={BOARD_H + 6} rx="6"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="6 3">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

// Pin definitions — programmatically generated (UNCHANGED)
// Total: 300 main holes (a-j x 30) + 120 bus holes (4 rails x 30) + 2 legacy aliases = 422 pins
const _generatedPins = (() => {
  const pins = [];

  pins.push(
    { id: 'bus-plus', label: '+ Bus', x: BOARD_PAD_X - 8, y: Y_BUS_TOP_PLUS + BUS_ROW_H / 2, type: 'power' },
    { id: 'bus-minus', label: '- Bus', x: BOARD_PAD_X - 8, y: Y_BUS_TOP_MINUS + BUS_ROW_H / 2, type: 'power' },
  );

  for (let row = 0; row < ROWS_PER_SIDE; row++) {
    const rowLabel = TOP_LABELS[row];
    const cy = Y_SECTION_TOP + row * HOLE_PITCH + HOLE_PITCH / 2;
    for (let col = 0; col < COLS; col++) {
      const cx = BOARD_PAD_X + col * HOLE_PITCH + HOLE_PITCH / 2;
      pins.push({ id: `${rowLabel}${col + 1}`, label: `${rowLabel}${col + 1}`, x: cx, y: cy, type: 'hole' });
    }
  }

  for (let row = 0; row < ROWS_PER_SIDE; row++) {
    const rowLabel = BOT_LABELS[row];
    const cy = Y_SECTION_BOT + row * HOLE_PITCH + HOLE_PITCH / 2;
    for (let col = 0; col < COLS; col++) {
      const cx = BOARD_PAD_X + col * HOLE_PITCH + HOLE_PITCH / 2;
      pins.push({ id: `${rowLabel}${col + 1}`, label: `${rowLabel}${col + 1}`, x: cx, y: cy, type: 'hole' });
    }
  }

  const busRails = [
    { prefix: 'bus-top-plus', y: Y_BUS_TOP_PLUS + BUS_ROW_H / 2, type: 'power' },
    { prefix: 'bus-top-minus', y: Y_BUS_TOP_MINUS + BUS_ROW_H / 2, type: 'power' },
    { prefix: 'bus-bot-plus', y: Y_BUS_BOT_PLUS + BUS_ROW_H / 2, type: 'power' },
    { prefix: 'bus-bot-minus', y: Y_BUS_BOT_MINUS + BUS_ROW_H / 2, type: 'power' },
  ];
  for (const rail of busRails) {
    for (let col = 0; col < COLS; col++) {
      const cx = BOARD_PAD_X + col * HOLE_PITCH + HOLE_PITCH / 2;
      const pinId = `${rail.prefix}-${col + 1}`;
      pins.push({ id: pinId, label: pinId, x: cx, y: rail.y, type: rail.type });
    }
  }

  return pins;
})();

BreadboardHalf.pins = _generatedPins;

BreadboardHalf.defaultState = { activeHoles: {} };

BreadboardHalf.boardDimensions = {
  width: BOARD_W,
  height: BOARD_H,
  cols: COLS,
  rowsPerSide: ROWS_PER_SIDE,
  holePitch: HOLE_PITCH,
  padX: BOARD_PAD_X,
  padY: BOARD_PAD_Y,
  sectionTopY: Y_SECTION_TOP,
  sectionBotY: Y_SECTION_BOT,
  gapY: Y_GAP,
  gapH: GAP_H,
  busTopPlusY: Y_BUS_TOP_PLUS,
  busTopMinusY: Y_BUS_TOP_MINUS,
  busBotPlusY: Y_BUS_BOT_PLUS,
  busBotMinusY: Y_BUS_BOT_MINUS,
  busRowH: BUS_ROW_H,
};

BreadboardHalf.getHolePosition = function (holeId) {
  if (holeId.startsWith('bus-')) {
    const parts = holeId.split('-');
    const col = parseInt(parts[parts.length - 1]) - 1;
    if (isNaN(col) || col < 0 || col >= COLS) return null;
    const cx = BOARD_PAD_X + col * HOLE_PITCH + HOLE_PITCH / 2;
    if (holeId.includes('top-plus')) return { x: cx, y: Y_BUS_TOP_PLUS + BUS_ROW_H / 2 };
    if (holeId.includes('top-minus')) return { x: cx, y: Y_BUS_TOP_MINUS + BUS_ROW_H / 2 };
    if (holeId.includes('bot-plus')) return { x: cx, y: Y_BUS_BOT_PLUS + BUS_ROW_H / 2 };
    if (holeId.includes('bot-minus')) return { x: cx, y: Y_BUS_BOT_MINUS + BUS_ROW_H / 2 };
    return null;
  }

  const rowChar = holeId.charAt(0).toLowerCase();
  const col = parseInt(holeId.slice(1)) - 1;
  if (isNaN(col) || col < 0 || col >= COLS) return null;

  const cx = BOARD_PAD_X + col * HOLE_PITCH + HOLE_PITCH / 2;
  const topIdx = TOP_LABELS.indexOf(rowChar);
  const botIdx = BOT_LABELS.indexOf(rowChar);

  if (topIdx >= 0) {
    return { x: cx, y: Y_SECTION_TOP + topIdx * HOLE_PITCH + HOLE_PITCH / 2 };
  }
  if (botIdx >= 0) {
    return { x: cx, y: Y_SECTION_BOT + botIdx * HOLE_PITCH + HOLE_PITCH / 2 };
  }
  return null;
};

BreadboardHalf.getInternalConnections = function () {
  const nets = [];

  for (let col = 0; col < COLS; col++) {
    nets.push({
      id: `net-top-${col + 1}`,
      holes: TOP_LABELS.map(r => `${r}${col + 1}`)
    });
  }

  for (let col = 0; col < COLS; col++) {
    nets.push({
      id: `net-bot-${col + 1}`,
      holes: BOT_LABELS.map(r => `${r}${col + 1}`)
    });
  }

  nets.push({
    id: 'net-bus-top-plus',
    holes: Array.from({ length: COLS }, (_, i) => `bus-top-plus-${i + 1}`)
  });
  nets.push({
    id: 'net-bus-top-minus',
    holes: Array.from({ length: COLS }, (_, i) => `bus-top-minus-${i + 1}`)
  });
  nets.push({
    id: 'net-bus-bot-plus',
    holes: Array.from({ length: COLS }, (_, i) => `bus-bot-plus-${i + 1}`)
  });
  nets.push({
    id: 'net-bus-bot-minus',
    holes: Array.from({ length: COLS }, (_, i) => `bus-bot-minus-${i + 1}`)
  });

  return nets;
};

registerComponent('breadboard-half', {
  component: BreadboardHalf,
  pins: BreadboardHalf.pins,
  defaultState: BreadboardHalf.defaultState,
  category: 'passive',
  label: 'Breadboard (Half)',
  icon: '\u{1F4CB}',
  boardDimensions: BreadboardHalf.boardDimensions,
  getInternalConnections: BreadboardHalf.getInternalConnections,
  getHolePosition: BreadboardHalf.getHolePosition,
  volumeAvailableFrom: 1,
});

export default BreadboardHalf;
