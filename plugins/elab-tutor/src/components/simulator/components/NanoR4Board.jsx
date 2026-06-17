/**
 * ELAB NanoBreakout V1.1 GP — SVG Component (7-Order Redesign)
 * C-shape PCB with full semicircle left + upper arm + notch + lower tab:
 *   - Left: full semicircle (R = BOARD_H/2 = 49.5), ELAB branding
 *   - Body: Nano socket + header pins (x=0..130, full height)
 *   - Upper arm: wing breakout pins + morsettiera (y=0..25, full width)
 *   - Right: notch cutout (x=130..168, y=25..84)
 *   - Lower tab: +/- power pads (x=130..155, y=84..99)
 * Based on KiCad PCB layout + 3D render ground truth.
 * PIN_PITCH aligned to breadboard grid (7.5). Pin IDs/positions UNCHANGED.
 */

import React, { useMemo } from 'react';
import { registerComponent } from './registry';

// ─── Pin data (IDs UNCHANGED for solver/experiment compatibility) ─────────

const TOP_PINS = [
  { id: 'D13', label: 'D13', type: 'digital', arduino: 13 },
  { id: '3V3', label: '3V3', type: 'power' },
  { id: 'AREF', label: 'AREF', type: 'analog' },
  { id: 'A0', label: 'A0', type: 'analog', arduino: 14 },
  { id: 'A1', label: 'A1', type: 'analog', arduino: 15 },
  { id: 'A2', label: 'A2', type: 'analog', arduino: 16 },
  { id: 'A3', label: 'A3', type: 'analog', arduino: 17 },
  { id: 'A4', label: 'A4', type: 'analog', arduino: 18 },
  { id: 'A5', label: 'A5', type: 'analog', arduino: 19 },
  { id: 'A6', label: 'A6', type: 'analog', arduino: 20 },
  { id: 'A7', label: 'A7', type: 'analog', arduino: 21 },
  { id: '5V', label: '5V', type: 'power' },
  { id: 'MINUS', label: '-', type: 'power' },
  { id: 'GND', label: 'GND', type: 'power' },
  { id: 'VIN', label: 'VIN', type: 'power' },
];

const BOTTOM_PINS = [
  { id: 'D12', label: 'D12', type: 'digital', arduino: 12 },
  { id: 'D11', label: '~D11', type: 'pwm', arduino: 11 },
  { id: 'D10', label: '~D10', type: 'pwm', arduino: 10 },
  { id: 'D9', label: '~D9', type: 'pwm', arduino: 9 },
  { id: 'D8', label: 'D8', type: 'digital', arduino: 8 },
  { id: 'D7', label: 'D7', type: 'digital', arduino: 7 },
  { id: 'D6', label: '~D6', type: 'pwm', arduino: 6 },
  { id: 'D5', label: '~D5', type: 'pwm', arduino: 5 },
  { id: 'D4', label: 'D4', type: 'digital', arduino: 4 },
  { id: 'D3', label: '~D3', type: 'pwm', arduino: 3 },
  { id: 'D2', label: 'D2', type: 'digital', arduino: 2 },
  { id: 'GND_R', label: 'GND', type: 'power' },
  { id: 'RST_R', label: 'RST', type: 'control' },
  { id: 'RX', label: 'D0/RX', type: 'digital', arduino: 0 },
  { id: 'TX', label: 'D1/TX', type: 'digital', arduino: 1 },
];

const WING_PINS = [
  { id: 'W_A0', label: 'A0', type: 'analog', arduino: 14, mapsTo: 'A0' },
  { id: 'W_A1', label: 'A1', type: 'analog', arduino: 15, mapsTo: 'A1' },
  { id: 'W_A2', label: 'A2', type: 'analog', arduino: 16, mapsTo: 'A2' },
  { id: 'W_A3', label: 'A3', type: 'analog', arduino: 17, mapsTo: 'A3' },
  { id: 'W_D3', label: '~D3', type: 'pwm', arduino: 3, mapsTo: 'D3' },
  { id: 'W_D5', label: '~D5', type: 'pwm', arduino: 5, mapsTo: 'D5' },
  { id: 'W_D6', label: '~D6', type: 'pwm', arduino: 6, mapsTo: 'D6' },
  { id: 'W_D9', label: '~D9', type: 'pwm', arduino: 9, mapsTo: 'D9' },
  { id: 'W_A4', label: 'A4/SDA', type: 'analog', arduino: 18, mapsTo: 'A4' },
  { id: 'W_A5', label: 'A5/SCL', type: 'analog', arduino: 19, mapsTo: 'A5' },
  { id: 'W_D0', label: 'D0/RX', type: 'digital', arduino: 0, mapsTo: 'RX' },
  { id: 'W_D1', label: 'D1/TX', type: 'digital', arduino: 1, mapsTo: 'TX' },
  { id: 'W_D13', label: 'D13/SCK', type: 'digital', arduino: 13, mapsTo: 'D13' },
  { id: 'W_D12', label: 'D12/MISO', type: 'digital', arduino: 12, mapsTo: 'D12' },
  { id: 'W_D11', label: '~D11/MOSI', type: 'pwm', arduino: 11, mapsTo: 'D11' },
  { id: 'W_D10', label: '~D10', type: 'pwm', arduino: 10, mapsTo: 'D10' },
  { id: 'W_D8', label: 'D8', type: 'digital', arduino: 8, mapsTo: 'D8' },
  { id: 'W_GND1', label: 'GND', type: 'power', mapsTo: 'GND' },
  { id: 'W_VCC1', label: '5V', type: 'power', mapsTo: '5V' },
  { id: 'W_GND2', label: 'GND', type: 'power', mapsTo: 'GND' },
  { id: 'W_VCC2', label: '5V', type: 'power', mapsTo: '5V' },
];

// ─── Layout constants — IMMUTABLE (pin positions used by all experiments) ──

const PIN_PITCH = 7.5;        // MUST match BB_HOLE_PITCH for grid alignment
const PIN_START_X = 20;       // first header pin X
const BOARD_W = 168;          // matches COMP_SIZES (167.58 rounded)
const BOARD_H = 99;           // matches COMP_SIZES
const TOP_PIN_Y = 35;         // top header row Y
const BOTTOM_PIN_Y = 64;      // bottom header row Y

// ─── C-shape geometry (ORDINE 1) ──────────────────────────────────────────

const R = 6;                    // corner radius (all corners, per spec)
const SEMI_R = BOARD_H / 2;    // 49.5 — semicircle radius = half board height
const NOTCH_LEFT = 130;         // notch left edge (right of last header pin x=125 + margin)
const ARM_H = 25;               // upper arm height (~25% of BOARD_H)
const NOTCH_BOT = 84;           // notch bottom edge (BOARD_H - 15%)
const TAB_RIGHT = 155;          // lower tab right extent

// Nano module socket area — between header pin rows, right of semicircle branding area
const SOCKET_X = 14;
const SOCKET_Y = 36;
const SOCKET_W = 114;
const SOCKET_H = 27;

// Nano module visual (navy board inside socket)
const NANO_X = 16;
const NANO_Y = 37;
const NANO_W = 110;
const NANO_H = 25;

// USB-C connector (protrudes from semicircle left edge)
const USB_W = 8;
const USB_H = 8;
const USB_X = -4;
const USB_Y = BOARD_H / 2 - USB_H / 2;

// Wing connector pins (ORDINE 2 — on upper arm)
const WING_PIN_PITCH = 4.2;
const WING_PIN_START_X = 76;    // after morsettiera (ends at x=72)
const WING_PIN_Y = 13;          // center of arm height
const WING_HOUSING_PAD = 4;

// VIN morsettiera (ORDINE 5 — far left of upper arm)
const JACK_X = 52;
const JACK_Y = 4;

// ─── Colors (ORDINE 3 + user spec) ────────────────────────────────────────

const PCB_FILL = '#EEEEF5';           // light lavender PCB (ORDINE 1)
const PCB_FILL_DARK = 'var(--elab-hex-d5d5df)';
const PCB_FILL_LIGHT = 'var(--elab-hex-f5f5fb)';
const PCB_BORDER = '#1a1a2e';          // dark navy border (ORDINE 1)
const PAD_GOLD = '#c8a84b';            // gold pads (ORDINE 3)
const PAD_STROKE = 'var(--elab-hex-8b7430)';
const BOARD_BLUE = '#1a3a6e';          // Nano body navy (ORDINE 3)
const BOARD_BLUE_DARK = 'var(--elab-hex-0d2a52)';
const BOARD_BLUE_LIGHT = 'var(--elab-hex-3a6a9e)';
const HOLE_DARK = 'var(--elab-hex-2a2e33)';
const CHIP_BLACK = '#111111';          // central chip (ORDINE 3)
const SILK_DARK = '#1a1a2e';           // silkscreen (matches border)
const SILK_GRAY = '#333';
const CONNECTOR_BODY = 'var(--elab-hex-2c2f33)';
const CONNECTOR_DARK = 'var(--elab-hex-1a1c1f)';
const LED_BLUE = '#4488ff';            // power LED (ORDINE 3)
const LED_BLUE_GLOW = 'var(--elab-hex-6699ff)';
const SOCKET_BG = 'var(--elab-hex-3a3d42)';

// ─── SVG Defs sub-component (gradients, patterns, filters) ───────────

function BoardDefs({ id }) {
  return (
    <defs>
      {/* Board clip path */}
      <clipPath id={`board-clip-${id}`}>
        <path d={BOARD_PATH} />
      </clipPath>

      {/* PCB fiberglass texture pattern */}
      <pattern id={`pcb-texture-${id}`} width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="4" fill={PCB_FILL} />
        <line x1="0" y1="0" x2="4" y2="0" stroke={PCB_FILL_DARK} strokeWidth="0.15" opacity="0.3" />
        <line x1="0" y1="2" x2="4" y2="2" stroke={PCB_FILL_DARK} strokeWidth="0.1" opacity="0.2" />
        <line x1="0" y1="0" x2="0" y2="4" stroke={PCB_FILL_DARK} strokeWidth="0.15" opacity="0.3" />
        <line x1="2" y1="0" x2="2" y2="4" stroke={PCB_FILL_DARK} strokeWidth="0.1" opacity="0.2" />
      </pattern>

      {/* PCB surface gradient (subtle top-to-bottom lighting) */}
      <linearGradient id={`pcb-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={PCB_FILL_LIGHT} />
        <stop offset="50%" stopColor={PCB_FILL} />
        <stop offset="100%" stopColor={PCB_FILL_DARK} />
      </linearGradient>

      {/* Gold metallic gradient for pads */}
      <linearGradient id={`gold-pad-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--elab-hex-e8d06a)" />
        <stop offset="40%" stopColor="var(--elab-hex-d4b84e)" />
        <stop offset="60%" stopColor="var(--elab-hex-c8a84b)" />
        <stop offset="100%" stopColor="var(--elab-hex-9e8235)" />
      </linearGradient>

      {/* Nano board navy gradient */}
      <linearGradient id={`nano-board-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--elab-hex-2a5a8e)" />
        <stop offset="30%" stopColor={BOARD_BLUE} />
        <stop offset="100%" stopColor={BOARD_BLUE_DARK} />
      </linearGradient>

      {/* Chip gradient (subtle sheen) */}
      <linearGradient id={`chip-grad-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="var(--elab-hex-222222)" />
        <stop offset="30%" stopColor={CHIP_BLACK} />
        <stop offset="70%" stopColor="var(--elab-hex-0a0a0a)" />
        <stop offset="100%" stopColor="var(--elab-hex-1a1a1a)" />
      </linearGradient>

      {/* USB-C metallic gradient */}
      <linearGradient id={`usb-metal-${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--elab-hex-d8dee4)" />
        <stop offset="30%" stopColor="var(--elab-hex-c0c6cc)" />
        <stop offset="70%" stopColor="var(--elab-hex-a8aeb4)" />
        <stop offset="100%" stopColor="var(--elab-hex-888e96)" />
      </linearGradient>

      {/* Drop shadow filter for board depth */}
      <filter id={`board-shadow-${id}`} x="-5%" y="-5%" width="115%" height="120%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
        <feOffset dx="1.5" dy="2.5" result="offsetBlur" />
        <feFlood floodColor="var(--elab-hex-000000)" floodOpacity="0.18" result="color" />
        <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

// ─── Important pins to label ──────────────────────────────────────────────

const IMPORTANT_PIN_IDS = new Set([
  '5V', 'GND', 'GND_R', 'VIN', 'D13', 'D12', 'D11', 'D10', 'D9', 'D8',
  'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'A0', 'A1', 'A2', 'A3', 'A4',
  'A5', 'A6', 'A7', '3V3', 'AREF', 'RST_R', 'MINUS',
]);

// ─── Pin coordinate helpers (UNCHANGED) ───────────────────────────────────

function xAt(index) {
  return PIN_START_X + index * PIN_PITCH;
}

function computePinRow(pins, side) {
  const y = side === 'top' ? TOP_PIN_Y : BOTTOM_PIN_Y;
  return pins.map((pin, index) => ({
    ...pin,
    x: xAt(index),
    y,
    side,
    index,
  }));
}

function computeWingPinPositions() {
  return WING_PINS.map((pin, index) => ({
    ...pin,
    x: WING_PIN_START_X + index * WING_PIN_PITCH,
    y: WING_PIN_Y,
    side: 'wing',
    index,
  }));
}

// ─── Board outline path (C-shape with full semicircle) ────────────────────
// Clockwise from top of semicircle:
//   top edge → arm right → arm bottom → notch left → notch bottom →
//   tab right → tab bottom → bottom edge → semicircle arc back to top

const BOARD_PATH = (() => {
  const r = R;          // 6
  const sr = SEMI_R;    // 49.5
  const W = BOARD_W;    // 168
  const H = BOARD_H;    // 99
  const NL = NOTCH_LEFT; // 130
  const AH = ARM_H;     // 25
  const NB = NOTCH_BOT;  // 84
  const TR = TAB_RIGHT;  // 155

  return `
    M ${sr} 0
    L ${W - r} 0
    Q ${W} 0 ${W} ${r}
    L ${W} ${AH - r}
    Q ${W} ${AH} ${W - r} ${AH}
    L ${NL + r} ${AH}
    Q ${NL} ${AH} ${NL} ${AH + r}
    L ${NL} ${NB - r}
    Q ${NL} ${NB} ${NL + r} ${NB}
    L ${TR - r} ${NB}
    Q ${TR} ${NB} ${TR} ${NB + r}
    L ${TR} ${H - r}
    Q ${TR} ${H} ${TR - r} ${H}
    L ${sr} ${H}
    A ${sr} ${sr} 0 1 1 ${sr} 0
    Z
  `.trim();
})();

// ─── Pin pad subcomponents ────────────────────────────────────────────────

function HeaderPinPad({ pin, stateValue, boardId }) {
  const isHigh = stateValue === 'HIGH' || stateValue === 1 || stateValue === true;
  const isActive = stateValue !== undefined && stateValue !== null;

  const isPower5V = pin.id === '5V' || pin.id === '3V3' || pin.id === 'VIN';
  const isGround = pin.id === 'GND' || pin.id === 'GND_R' || pin.id === 'MINUS';
  const padColor = isPower5V ? 'var(--elab-hex-e85040)' : isGround ? '#333' : `url(#gold-pad-${boardId})`;
  const padStroke = isPower5V ? 'var(--elab-hex-b53030)' : isGround ? 'var(--elab-hex-1a1a1a)' : PAD_STROKE;

  return (
    <g data-pin={pin.id} className="pin-pad">
      {/* Pad shadow for depth */}
      <rect
        x={pin.x - 2.2} y={pin.y - 2.0} width="4.8" height="4.8" rx="0.7"
        fill="#00000015"
      />
      {/* Main pad with gradient */}
      <rect
        x={pin.x - 2.4} y={pin.y - 2.4} width="4.8" height="4.8" rx="0.7"
        fill={padColor} stroke={padStroke} strokeWidth="0.4"
      />
      {/* Top highlight for metallic sheen */}
      <rect
        x={pin.x - 1.8} y={pin.y - 2.2} width="3.6" height="1.8" rx="0.5"
        fill="var(--elab-hex-ffffff)" opacity="0.12"
      />
      <circle
        cx={pin.x} cy={pin.y} r="1.0"
        fill={isHigh ? 'var(--elab-hex-f3a500)' : HOLE_DARK}
        stroke={isActive ? 'var(--elab-hex-f5c244)' : '#555'}
        strokeWidth={isActive ? '0.35' : '0.2'}
      />
      {isHigh && <circle cx={pin.x} cy={pin.y} r="3.6" fill="var(--elab-hex-f3c65c)" opacity="0.25" />}
      <text
        x={pin.x}
        y={pin.side === 'top' ? pin.y - 4.5 : pin.y + 6.0}
        textAnchor="middle"
        fontSize="1.8"
        fontFamily="Fira Code, monospace"
        fill={SILK_DARK}
        opacity="0.95"
        fontWeight="700"
      >
        {pin.label}
      </text>
    </g>
  );
}

function WingPinPad({ pin, stateValue, boardId, textCounterRot = 270 }) {
  const isHigh = stateValue === 'HIGH' || stateValue === 1 || stateValue === true;
  const isActive = stateValue !== undefined && stateValue !== null;

  const isPowerVCC = pin.id === 'W_VCC1' || pin.id === 'W_VCC2';
  const isPowerGND = pin.id === 'W_GND1' || pin.id === 'W_GND2';
  const padFill = isPowerVCC ? 'var(--elab-hex-e85040)' : isPowerGND ? '#333' : `url(#gold-pad-${boardId})`;

  return (
    <g data-pin={pin.id} className="pin-pad">
      {/* Pad shadow */}
      <circle cx={pin.x + 0.3} cy={pin.y + 0.4} r="2.5" fill="#00000012" />
      {/* Circular through-hole pad (real hardware) */}
      <circle
        cx={pin.x} cy={pin.y} r="2.5"
        fill={padFill} stroke={PAD_STROKE} strokeWidth="0.3"
      />
      {/* Metallic highlight */}
      <ellipse cx={pin.x - 0.3} cy={pin.y - 0.6} rx="1.5" ry="1.0"
        fill="var(--elab-hex-ffffff)" opacity="0.1" />
      <circle
        cx={pin.x} cy={pin.y} r="1.0"
        fill={isHigh ? 'var(--elab-hex-f3a500)' : HOLE_DARK}
        stroke={isActive ? 'var(--elab-hex-f5c244)' : '#555'}
        strokeWidth="0.2"
      />
      {isHigh && <circle cx={pin.x} cy={pin.y} r="3.5" fill="var(--elab-hex-f3c65c)" opacity="0.25" />}
      {/* Label rotated -90° above pin (ORDINE 2) — iter 13 R1: counter-rotate when parent rotated */}
      <text
        x={pin.x}
        y={pin.y - 5}
        textAnchor="start"
        fontSize="1.5"
        fontFamily="Fira Code, monospace"
        fill={SILK_DARK}
        opacity="0.9"
        fontWeight="600"
        transform={`rotate(${textCounterRot}, ${pin.x}, ${pin.y - 5})`}
      >
        {pin.label}
      </text>
    </g>
  );
}

// ─── Sub-component: Nano socket outline (dark recess in PCB) ──────────────

function NanoSocket() {
  return (
    <g>
      {/* Socket shadow (inner recess effect) */}
      <rect x={SOCKET_X + 0.5} y={SOCKET_Y + 0.5} width={SOCKET_W} height={SOCKET_H} rx="2"
        fill="#00000015" />
      {/* Main socket body */}
      <rect x={SOCKET_X} y={SOCKET_Y} width={SOCKET_W} height={SOCKET_H} rx="2"
        fill={SOCKET_BG} stroke="var(--elab-hex-2a2d31)" strokeWidth="0.8" />
      {/* Inner bevel highlight (top edge catches light) */}
      <rect x={SOCKET_X + 0.8} y={SOCKET_Y + 0.5}
        width={SOCKET_W - 1.6} height="1.2" rx="0.6"
        fill="var(--elab-hex-ffffff)" opacity="0.06" />
      {/* Inner bevel shadow (bottom edge) */}
      <rect x={SOCKET_X + 0.8} y={SOCKET_Y + SOCKET_H - 1.5}
        width={SOCKET_W - 1.6} height="1.2" rx="0.6"
        fill="var(--elab-hex-000000)" opacity="0.15" />
      {/* Inner border */}
      <rect x={SOCKET_X + 0.8} y={SOCKET_Y + 0.8}
        width={SOCKET_W - 1.6} height={SOCKET_H - 1.6} rx="1.5"
        fill="none" stroke="#555" strokeWidth="0.3" opacity="0.4" />
      {/* Retention clips */}
      {[SOCKET_Y + 8, SOCKET_Y + SOCKET_H - 8].map((ny, i) => (
        <rect key={`notch-${i}`}
          x={SOCKET_X - 1} y={ny - 1.5} width="2" height="3" rx="0.5"
          fill="#555" opacity="0.3" />
      ))}
    </g>
  );
}

// ─── Sub-component: USB-C connector (rendered outside clipPath) ───────────

function UsbConnector({ boardId }) {
  return (
    <g>
      {/* Shadow */}
      <rect x={USB_X + 0.4} y={USB_Y + 0.6} width={USB_W} height={USB_H} rx="1.8"
        fill="#00000018" />
      {/* Outer shell with metallic gradient */}
      <rect x={USB_X} y={USB_Y} width={USB_W} height={USB_H} rx="1.8"
        fill={`url(#usb-metal-${boardId})`} stroke="var(--elab-hex-7a8088)" strokeWidth="0.6" />
      {/* Top bevel highlight */}
      <rect x={USB_X + 0.6} y={USB_Y + 0.4} width={USB_W - 1.2} height="1.5" rx="0.8"
        fill="var(--elab-hex-ffffff)" opacity="0.2" />
      {/* Inner recess */}
      <rect x={USB_X + 0.8} y={USB_Y + 1.2} width={USB_W - 1.6} height={USB_H - 2.4} rx="1.0"
        fill="var(--elab-hex-888e96)" />
      {/* Port opening */}
      <rect x={USB_X + 1.8} y={USB_Y + 2.0} width={USB_W - 3.6} height={USB_H - 4.0} rx="0.6"
        fill="var(--elab-hex-1a1e22)" />
      {/* Inner tongue (USB-C has center tongue) */}
      <rect x={USB_X + 2.2} y={USB_Y + 2.6} width={USB_W - 4.4} height={USB_H - 5.2} rx="0.3"
        fill="var(--elab-hex-555d65)" />
    </g>
  );
}

// ─── Sub-component: Arduino Nano R4 module (navy board in socket) ─────────

function NanoModule({ leds, running, onReset, boardId }) {
  const x = NANO_X;
  const y = NANO_Y;
  const w = NANO_W;
  const h = NANO_H;
  const { power = false, d13 = false, tx = false, rx = false } = leds;
  const cy = y + h / 2; // vertical center

  return (
    <g>
      {/* Board shadow */}
      <rect x={x + 0.5} y={y + 0.8} width={w} height={h} rx="1.5"
        fill="#00000020" />
      {/* Nano R4 board (ORDINE 3 — navy gradient) */}
      <rect x={x} y={y} width={w} height={h} rx="1.5"
        fill={`url(#nano-board-${boardId})`} stroke={BOARD_BLUE_DARK} strokeWidth="0.6" />
      {/* Top edge highlight */}
      <rect x={x + 1} y={y + 0.4} width={w - 2} height="1.5" rx="0.8"
        fill="var(--elab-hex-ffffff)" opacity="0.08" />
      {/* Bottom edge shadow */}
      <rect x={x + 1} y={y + h - 1.5} width={w - 2} height="1.2" rx="0.6"
        fill="var(--elab-hex-000000)" opacity="0.12" />

      {/* MCU — RA4M1 (ORDINE 3 — chip gradient) */}
      <rect x={x + 30} y={y + 3} width={22} height={h - 6} rx="0.8"
        fill={`url(#chip-grad-${boardId})`} stroke="var(--elab-hex-2a2f35)" strokeWidth="0.35" />
      {/* Chip pin legs (left and right edges) */}
      {Array.from({length: 5}, (_, i) => {
        const py = y + 5 + i * ((h - 10) / 4);
        return (
          <React.Fragment key={`chip-pin-${i}`}>
            <rect x={x + 29.2} y={py - 0.4} width="1.2" height="0.8" fill="#888" />
            <rect x={x + 51.6} y={py - 0.4} width="1.2" height="0.8" fill="#888" />
          </React.Fragment>
        );
      })}
      <circle cx={x + 32} cy={y + 5} r="0.5" fill="#444" />
      <text x={x + 41} y={cy - 1}
        textAnchor="middle" fontSize="1.4" fill="#555" fontFamily="Arial, sans-serif" fontWeight="700">
        RA4M1
      </text>
      <text x={x + 41} y={cy + 1.5}
        textAnchor="middle" fontSize="0.9" fill="#444" fontFamily="Arial, sans-serif">
        RENESAS
      </text>

      {/* WiFi module — ESP32-S3 */}
      <rect x={x + 60} y={y + 4} width={12} height={h - 8} rx="0.6"
        fill="var(--elab-hex-b0b8c0)" stroke="var(--elab-hex-7c8893)" strokeWidth="0.25" />
      <text x={x + 66} y={cy - 0.5}
        textAnchor="middle" fontSize="0.8" fill="#555" fontFamily="Arial, sans-serif">
        ESP32
      </text>
      <text x={x + 66} y={cy + 1.5}
        textAnchor="middle" fontSize="0.6" fill="#666" fontFamily="Arial, sans-serif">
        S3
      </text>

      {/* Crystal oscillator */}
      <rect x={x + 10} y={cy - 4} width={5} height={8} rx="0.6"
        fill="var(--elab-hex-c4ccd3)" stroke="var(--elab-hex-7c8893)" strokeWidth="0.2" />

      {/* Voltage regulator */}
      <rect x={x + 80} y={cy - 4} width={5} height={8} rx="0.4"
        fill={CHIP_BLACK} stroke="#333" strokeWidth="0.2" />

      {/* Capacitors */}
      {[-3, 0, 3].map((dy, i) => (
        <rect key={`cap-${i}`} x={x + 55} y={cy + dy - 0.5} width={2} height={1} rx="0.2"
          fill="var(--elab-hex-a08860)" stroke="var(--elab-hex-806840)" strokeWidth="0.12" opacity="0.7" />
      ))}

      {/* Reset button */}
      <g style={{ cursor: 'pointer' }} onClick={() => onReset && onReset({ action: 'reset' })}>
        <rect x={x + 22} y={cy - 2} width="4" height="4" rx="0.5"
          fill="var(--elab-hex-c7ccd2)" stroke="var(--elab-hex-7b838d)" strokeWidth="0.3" />
        <circle cx={x + 24} cy={cy} r="1.0"
          fill="var(--elab-hex-9da5ad)" stroke="var(--elab-hex-666e77)" strokeWidth="0.2" />
      </g>

      {/* LEDs */}
      <g>
        <circle cx={x + 4} cy={y + 4} r="0.8"
          fill={power ? 'var(--elab-hex-49d35c)' : 'var(--elab-hex-2b5a34)'} />
        {power && <circle cx={x + 4} cy={y + 4} r="2" fill="var(--elab-hex-6dff85)" opacity="0.25" />}
        <text x={x + 7} y={y + 4.5} fontSize="0.7" fill="var(--elab-hex-0d6b40)"
          fontFamily="Fira Code, monospace" fontWeight="600">PWR</text>

        <circle cx={x + w - 6} cy={y + 4} r="0.8"
          fill={d13 ? 'var(--elab-hex-f3a500)' : 'var(--elab-hex-6a4a1f)'} />
        {d13 && <circle cx={x + w - 6} cy={y + 4} r="2" fill="var(--elab-hex-f9c75d)" opacity="0.25" />}
        <text x={x + w - 9} y={y + 4.5} fontSize="0.7" fill="var(--elab-hex-553c1a)"
          fontFamily="Fira Code, monospace" fontWeight="600">L</text>

        <circle cx={x + 4} cy={y + h - 4} r="0.6"
          fill={tx ? 'var(--elab-hex-f28f2d)' : 'var(--elab-hex-6a4a1f)'} />
        <text x={x + 6.5} y={y + h - 3.5} fontSize="0.6" fill="var(--elab-hex-6a4a1f)"
          fontFamily="Fira Code, monospace">TX</text>

        <circle cx={x + 14} cy={y + h - 4} r="0.6"
          fill={rx ? 'var(--elab-hex-f28f2d)' : 'var(--elab-hex-6a4a1f)'} />
        <text x={x + 16.5} y={y + h - 3.5} fontSize="0.6" fill="var(--elab-hex-6a4a1f)"
          fontFamily="Fira Code, monospace">RX</text>
      </g>

      {/* Board text */}
      <text x={x + w / 2} y={y + 4.5} textAnchor="middle"
        fontSize="2.2" fill="var(--elab-hex-ddf4fa)" fontFamily="Oswald, Arial, sans-serif"
        fontWeight="700" letterSpacing="0.6">
        ARDUINO
      </text>
      <text x={x + w / 2} y={y + 7.5} textAnchor="middle"
        fontSize="1.3" fill="var(--elab-hex-b0dce8)" fontFamily="Oswald, Arial, sans-serif"
        fontWeight="500" letterSpacing="0.4">
        NANO R4
      </text>

      {/* Side pin contacts (gold traces connecting to header pins) */}
      {Array.from({length: 15}, (_, i) => {
        const px = x + 5 + i * ((w - 10) / 14);
        return (
          <React.Fragment key={`nano-pin-${i}`}>
            <rect x={px - 0.8} y={y} width="1.6" height="2.5" rx="0.2"
              fill={PAD_GOLD} stroke={PAD_STROKE} strokeWidth="0.1" />
            <rect x={px - 0.8} y={y + h - 2.5} width="1.6" height="2.5" rx="0.2"
              fill={PAD_GOLD} stroke={PAD_STROKE} strokeWidth="0.1" />
          </React.Fragment>
        );
      })}
    </g>
  );
}

// ─── Sub-component: Wing breakout connector (ORDINE 2 — on upper arm) ─────

function WingConnector({ wingPins, pinStateFor, boardId, textCounterRot = 270 }) {
  const midX = WING_PIN_START_X + (WING_PINS.length - 1) * WING_PIN_PITCH / 2;

  return (
    <g>
      {/* Subtle label below pin row */}
      <text x={midX} y={WING_PIN_Y + 8} textAnchor="middle"
        fontSize="1.0" fill={SILK_DARK} fontFamily="Fira Code, monospace"
        opacity="0.4">
        BREAKOUT PINS
      </text>
      {wingPins.map((pin) => (
        <WingPinPad key={pin.id} pin={pin} stateValue={pinStateFor(pin)} boardId={boardId} textCounterRot={textCounterRot} />
      ))}
    </g>
  );
}

// ─── Sub-component: VIN Morsettiera (ORDINE 5 — green terminal on arm) ────

function PowerSection() {
  return (
    <g>
      {/* Green 2-pole screw terminal (20x14px, fill #2d6a2d) */}
      <rect x={JACK_X} y={JACK_Y} width="20" height="14" rx="1"
        fill="var(--elab-hex-2d6a2d)" stroke="var(--elab-hex-1e4d1e)" strokeWidth="0.6" />
      {/* Top edge highlight */}
      <rect x={JACK_X + 0.5} y={JACK_Y + 0.5} width="19" height="1.5" rx="0.5"
        fill="var(--elab-hex-3a8a3a)" opacity="0.5" />
      {/* Screw hole 1 */}
      <circle cx={JACK_X + 6} cy={JACK_Y + 8} r="3"
        fill="var(--elab-hex-1e4d1e)" stroke="var(--elab-hex-0f3a0f)" strokeWidth="0.3" />
      <circle cx={JACK_X + 6} cy={JACK_Y + 8} r="1.2"
        fill="var(--elab-hex-8a8a8a)" stroke="#666" strokeWidth="0.2" />
      <line x1={JACK_X + 5} y1={JACK_Y + 8} x2={JACK_X + 7} y2={JACK_Y + 8}
        stroke="#555" strokeWidth="0.4" />
      <line x1={JACK_X + 6} y1={JACK_Y + 7} x2={JACK_X + 6} y2={JACK_Y + 9}
        stroke="#555" strokeWidth="0.4" />
      {/* Screw hole 2 */}
      <circle cx={JACK_X + 14} cy={JACK_Y + 8} r="3"
        fill="var(--elab-hex-1e4d1e)" stroke="var(--elab-hex-0f3a0f)" strokeWidth="0.3" />
      <circle cx={JACK_X + 14} cy={JACK_Y + 8} r="1.2"
        fill="var(--elab-hex-8a8a8a)" stroke="#666" strokeWidth="0.2" />
      <line x1={JACK_X + 13} y1={JACK_Y + 8} x2={JACK_X + 15} y2={JACK_Y + 8}
        stroke="#555" strokeWidth="0.4" />
      <line x1={JACK_X + 14} y1={JACK_Y + 7} x2={JACK_X + 14} y2={JACK_Y + 9}
        stroke="#555" strokeWidth="0.4" />
      {/* VIN 5-20V label */}
      <text x={JACK_X + 10} y={JACK_Y - 1} textAnchor="middle"
        fontSize="1.5" fill={SILK_DARK} fontFamily="Fira Code, monospace"
        fontWeight="700" opacity="0.8">
        VIN 5-20V
      </text>
    </g>
  );
}

// ─── Sub-component: Board silkscreen & PCB details ────────────────────────

function BoardSilkscreen({ textCounterRot = 270 }) {
  return (
    <g>
      {/* ORDINE 4 — ELAB branding on semicircle — iter 13 R1: counter-rotate when parent rotated */}
      {/* Positioned at x=8 to stay on exposed PCB (socket starts at x=14) */}
      <text
        x={8} y={BOARD_H / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize="12" fill={PCB_BORDER} fontFamily="Oswald, Arial, sans-serif"
        fontWeight="800" letterSpacing="1.5"
        transform={`rotate(${textCounterRot}, 8, ${BOARD_H / 2})`}
      >
        ELAB
      </text>
      {/* "Electronics Laboratory" — iter 13 R1: counter-rotate when parent rotated */}
      <text
        x={3} y={BOARD_H / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize="4" fill={SILK_GRAY} fontFamily="Fira Code, monospace"
        fontWeight="400"
        transform={`rotate(${textCounterRot}, 3, ${BOARD_H / 2})`}
      >
        Electronics Laboratory
      </text>

      {/* Version text on arm area */}
      <text x={NOTCH_LEFT - 2} y={ARM_H - 3} textAnchor="end"
        fontSize="1.5" fill={SILK_DARK} fontFamily="Fira Code, monospace"
        fontWeight="600" opacity="0.6">
        NANO BREAKOUT V1.1 GP
      </text>

      {/* Mounting holes (body corners + arm corner + tab corner) */}
      {[
        [SEMI_R + 5, 8],           // top-left body (right of semicircle)
        [NOTCH_LEFT - 5, 8],       // top-right body
        [SEMI_R + 5, BOARD_H - 8], // bottom-left body
        [BOARD_W - 8, 8],          // arm far-right
        [TAB_RIGHT - 5, BOARD_H - 8], // tab corner
      ].map(([hx, hy], i) => (
        <g key={`pcb-mount-${i}`}>
          <circle cx={hx} cy={hy} r="2.0" fill={PAD_GOLD} stroke={PAD_STROKE}
            strokeWidth="0.3" opacity="0.4" />
          <circle cx={hx} cy={hy} r="1.0" fill={HOLE_DARK} opacity="0.5" />
        </g>
      ))}

      {/* PCB traces (subtle connections from header to wing) */}
      <g opacity="0.10" stroke={PCB_FILL_DARK} strokeWidth="0.5">
        {[35, 42, 49.5, 57, 64].map((ty, i) => (
          <line key={`trace-h-${i}`}
            x1={SOCKET_X + SOCKET_W + 2} y1={ty}
            x2={NOTCH_LEFT - 2} y2={ty} />
        ))}
        {[70, 80, 90, 100, 110, 120].map((tx, i) => (
          <line key={`trace-v-${i}`}
            x1={tx} y1={BOTTOM_PIN_Y + 4}
            x2={tx} y2={BOARD_H - 10} />
        ))}
      </g>

      {/* Board status LEDs (decorative, on PCB surface) */}
      {[[SOCKET_X + SOCKET_W + 6, ARM_H + 8], [SOCKET_X + SOCKET_W + 6, NOTCH_BOT - 8]].map(([lx, ly], i) => (
        <g key={`brd-led-${i}`}>
          <circle cx={lx} cy={ly} r="1.2" fill="var(--elab-hex-3498db)" opacity="0.5" />
          <circle cx={lx} cy={ly} r="0.5" fill="var(--elab-hex-5dade2)" />
        </g>
      ))}
    </g>
  );
}

// ─── Sub-component: Power LED (ORDINE 3 — blue #4488ff with glow) ─────────

function PowerLed({ on }) {
  const ledX = NOTCH_LEFT - 10;
  const ledY = ARM_H + 8;

  return (
    <g>
      <circle cx={ledX} cy={ledY} r="2.5" fill={PCB_BORDER} opacity="0.3" />
      <circle cx={ledX} cy={ledY} r="2.0"
        fill={on ? LED_BLUE : 'var(--elab-hex-1e3a6e)'}
        stroke="var(--elab-hex-0d2a52)"
        strokeWidth="0.4"
      />
      {on && (
        <>
          <circle cx={ledX} cy={ledY} r="3.5" fill={LED_BLUE_GLOW} opacity="0.4" />
          <circle cx={ledX} cy={ledY} r="5.0" fill={LED_BLUE_GLOW} opacity="0.2" />
        </>
      )}
      <text x={ledX} y={ledY - 4} textAnchor="middle" fontSize="1.0"
        fill={SILK_DARK} fontFamily="Fira Code, monospace" opacity="0.7">
        POWER
      </text>
    </g>
  );
}

// ─── Sub-component: ON/OFF switch (ORDINE 7) ──────────────────────────────

function SwitchOnOff() {
  const sx = 85;
  const sy = 76;

  return (
    <g>
      <rect x={sx} y={sy} width="10" height="5" rx="1"
        fill="#444" stroke="#333" strokeWidth="0.3" />
      {/* Slider track */}
      <rect x={sx + 0.8} y={sy + 0.8} width="8.4" height="3.4" rx="0.6"
        fill="var(--elab-hex-1a1c1f)" />
      {/* Slider knob (ON position) */}
      <rect x={sx + 5} y={sy + 1} width="3.8" height="3" rx="0.4"
        fill="#888" stroke="#666" strokeWidth="0.2" />
      {/* Labels */}
      <text x={sx + 3} y={sy - 1.5} textAnchor="middle"
        fontSize="1.0" fill={SILK_DARK} fontFamily="Fira Code, monospace"
        fontWeight="600" opacity="0.6">ON</text>
      <text x={sx + 7.5} y={sy - 1.5} textAnchor="middle"
        fontSize="1.0" fill={SILK_DARK} fontFamily="Fira Code, monospace"
        fontWeight="600" opacity="0.6">OFF</text>
    </g>
  );
}

// ─── Sub-component: Tab power pads (ORDINE 6) ─────────────────────────────

function TabPads({ boardId }) {
  const tabCX = (NOTCH_LEFT + TAB_RIGHT) / 2; // center of tab
  const tabCY = (NOTCH_BOT + BOARD_H) / 2;    // center of tab vertically

  return (
    <g>
      {/* + pad (gold gradient, r=3) */}
      <circle cx={tabCX - 6 + 0.3} cy={tabCY + 0.4} r="3" fill="#00000012" />
      <circle cx={tabCX - 6} cy={tabCY} r="3"
        fill={`url(#gold-pad-${boardId})`} stroke="var(--elab-hex-d32f2f)" strokeWidth="0.5" />
      <ellipse cx={tabCX - 6.3} cy={tabCY - 0.8} rx="1.8" ry="1.2" fill="var(--elab-hex-ffffff)" opacity="0.1" />
      <circle cx={tabCX - 6} cy={tabCY} r="1.2" fill={HOLE_DARK} />
      <text x={tabCX - 6} y={tabCY - 5} textAnchor="middle"
        fontSize="5" fill="var(--elab-hex-d32f2f)" fontFamily="Arial, sans-serif" fontWeight="700">+</text>

      {/* - pad (gold gradient, r=3) */}
      <circle cx={tabCX + 6 + 0.3} cy={tabCY + 0.4} r="3" fill="#00000012" />
      <circle cx={tabCX + 6} cy={tabCY} r="3"
        fill={`url(#gold-pad-${boardId})`} stroke="var(--elab-hex-212121)" strokeWidth="0.5" />
      <ellipse cx={tabCX + 5.7} cy={tabCY - 0.8} rx="1.8" ry="1.2" fill="var(--elab-hex-ffffff)" opacity="0.1" />
      <circle cx={tabCX + 6} cy={tabCY} r="1.2" fill={HOLE_DARK} />
      <text x={tabCX + 6} y={tabCY - 5} textAnchor="middle"
        fontSize="5" fill="var(--elab-hex-212121)" fontFamily="Arial, sans-serif" fontWeight="700">{'\u2212'}</text>
    </g>
  );
}

// ─── Main component ──────────────────────────────────────────────────────

/**
 * iter 13 R1: counter-rotate text labels when parent component rotates.
 * Pin labels are hardcoded `rotate(-90, ...)` so when parent rotates 90/180/270
 * the text becomes upside-down or sideways. Counter-rotate computes the text
 * delta angle so absolute screen orientation stays readable.
 *
 * @param {number} parentRot — parent rotation in degrees (0/90/180/270)
 * @returns {number} text counter-rotation degrees
 */
function computeCounterRotation(parentRot) {
  const p = ((Number(parentRot) || 0) % 360 + 360) % 360;
  // Original text angle is -90 (pin labels) — we want absolute screen angle = -90
  // text_absolute = parent_rot + text_local => text_local = -90 - parent_rot
  // Snap to nearest 90 to avoid float precision issues
  const target = -90 - p;
  // Normalize 0..359
  return ((target % 360) + 360) % 360;
}

const NanoR4Board = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, id, parentRotation = 0 }) => {
  const { running = false, pinStates = {}, leds = {} } = state;

  const topPins = useMemo(() => computePinRow(TOP_PINS, 'top'), []);
  const bottomPins = useMemo(() => computePinRow(BOTTOM_PINS, 'bottom'), []);
  const wingPins = useMemo(() => computeWingPinPositions(), []);

  // iter 13 R1: parentRotation prop for text counter-rotate (pin labels + ELAB branding)
  const textCounterRot = computeCounterRotation(parentRotation);

  const pinStateFor = (pin) => {
    if (pinStates[pin.id] !== undefined) return pinStates[pin.id];
    if (pin.mapsTo && pinStates[pin.mapsTo] !== undefined) return pinStates[pin.mapsTo];
    return undefined;
  };

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="nano-r4" role="img"
       aria-label={`Arduino Nano R4 ${id}`}>

      {/* All SVG gradients, patterns, filters, clipPath */}
      <BoardDefs id={id} />

      {/* Board drop shadow (rendered under main board) */}
      <g filter={`url(#board-shadow-${id})`}>
        {/* PCB board — C-shape with texture + gradient overlay */}
        <path d={BOARD_PATH} fill={`url(#pcb-texture-${id})`} stroke={PCB_BORDER} strokeWidth="2" />
        {/* Gradient overlay for lighting effect */}
        <path d={BOARD_PATH} fill={`url(#pcb-grad-${id})`} opacity="0.35" />
      </g>

      {/* PCB edge bevel — inner highlight for 3D edge */}
      <path d={BOARD_PATH} fill="none" stroke="var(--elab-hex-ffffff)" strokeWidth="0.5" opacity="0.2"
        transform="translate(0.3, 0.3)" />

      {/* USB-C connector (outside clipPath — protrudes from semicircle) */}
      <UsbConnector boardId={id} />

      {/* All board content clipped to C-shape */}
      <g clipPath={`url(#board-clip-${id})`}>

        {/* Nano socket recess */}
        <NanoSocket />

        {/* Arduino Nano R4 module */}
        <NanoModule leds={leds} running={running} onReset={onInteract} boardId={id} />

        {/* Header pin rows (IMMUTABLE positions) */}
        {topPins.map((pin) => (
          <HeaderPinPad key={pin.id} pin={pin} stateValue={pinStateFor(pin)} boardId={id} />
        ))}
        {bottomPins.map((pin) => (
          <HeaderPinPad key={pin.id} pin={pin} stateValue={pinStateFor(pin)} boardId={id} />
        ))}

        {/* Wing breakout connector (ORDINE 2 — on upper arm) — iter 13 R1 textCounterRot threaded */}
        <WingConnector wingPins={wingPins} pinStateFor={pinStateFor} boardId={id} textCounterRot={textCounterRot} />

        {/* VIN morsettiera (ORDINE 5 — far left of arm) */}
        <PowerSection />

        {/* PCB silkscreen & details (ORDINE 4 — branding) — iter 13 R1 textCounterRot threaded */}
        <BoardSilkscreen textCounterRot={textCounterRot} />

        {/* Power LED (ORDINE 3 — blue with glow) */}
        <PowerLed on={leds.power || running} />

        {/* ON/OFF switch (ORDINE 7) */}
        <SwitchOnOff />

        {/* Tab +/- power pads (ORDINE 6) */}
        <TabPads boardId={id} />

      </g>{/* end clipPath group */}

      {/* Running indicator */}
      {running && (
        <circle cx={BOARD_W - 10} cy={12} r="1.3" fill="var(--elab-hex-89e86f)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Highlight outline (selection/hover) */}
      {highlighted && (
        <path
          d={BOARD_PATH}
          fill="none"
          stroke="var(--color-accent, #4A7A25)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          transform="translate(-1.5, -1.5) scale(1.018)"
        >
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </path>
      )}
    </g>
  );
};

// ─── Static pin export (UNCHANGED coordinates) ──────────────────────────

const allTopPins = computePinRow(TOP_PINS, 'top');
const allBottomPins = computePinRow(BOTTOM_PINS, 'bottom');
const allWingPins = computeWingPinPositions();

NanoR4Board.pins = [
  ...allTopPins.map((p) => ({
    id: p.id, label: p.label, x: p.x, y: p.y,
    type: p.type, side: p.side, arduino: p.arduino,
  })),
  ...allBottomPins.map((p) => ({
    id: p.id, label: p.label, x: p.x, y: p.y,
    type: p.type, side: p.side, arduino: p.arduino,
  })),
  ...allWingPins.map((p) => ({
    id: p.id, label: p.label, x: p.x, y: p.y,
    type: p.type, side: p.side, arduino: p.arduino, mapsTo: p.mapsTo,
  })),
];

NanoR4Board.defaultState = {
  running: false,
  pinStates: {},
  leds: {
    power: false,
    d13: false,
    rgb: [0, 0, 0],
    tx: false,
    rx: false,
  },
};

NanoR4Board.boardDimensions = {
  width: BOARD_W,
  height: BOARD_H,
  breakoutWidth: BOARD_W,
  breakoutHeight: BOARD_H,
  breakoutOffsetX: 0,
  breakoutOffsetY: 0,
  wingWidth: BOARD_W - WING_PIN_START_X + WING_HOUSING_PAD,
  wingHeight: 10,
  wingStartX: WING_PIN_START_X - WING_HOUSING_PAD,
  wingY: WING_PIN_Y - 5,
  boardWidth: BOARD_W,
  boardHeight: BOARD_H,
  version: 'NanoBreakout V1.1 GP',
  scale: 1,
  pinPitch: PIN_PITCH,
  aspectRatio: BOARD_W / BOARD_H,
};

registerComponent('nano-r4', {
  component: NanoR4Board,
  pins: NanoR4Board.pins,
  defaultState: NanoR4Board.defaultState,
  category: 'board',
  label: 'ELAB NanoBreakout V1.1 GP',
  icon: '\uD83D\uDCDF',
  boardDimensions: NanoR4Board.boardDimensions,
  volumeAvailableFrom: 3,
});

export default NanoR4Board;
