/**
 * ELAB Simulator — LCD 16x2 Component (Fritzing-identical)
 * 16 columns x 2 rows character display with 5x7 dot-matrix font.
 * 3D green PCB with depth shading, metallic bezel, green backlight.
 * Matches Fritzing illustrations in ELAB volumes.
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 12/02/2026, book-style redesign 22/02/2026
 */

import React, { useMemo } from 'react';
import { registerComponent } from './registry';

// ─── 5x7 Bitmap Font ────────────────────────────────────────────
// Each character is 5 columns, each column is a 7-bit bitmask (LSB = top row).
// Covers ASCII 32-126. Each entry is an array of 5 bytes (columns).
const FONT_5x7 = {
  32: [0x00,0x00,0x00,0x00,0x00], // space
  33: [0x00,0x00,0x5F,0x00,0x00], // !
  34: [0x00,0x07,0x00,0x07,0x00], // "
  35: [0x14,0x7F,0x14,0x7F,0x14], // #
  36: [0x24,0x2A,0x7F,0x2A,0x12], // $
  37: [0x23,0x13,0x08,0x64,0x62], // %
  38: [0x36,0x49,0x55,0x22,0x50], // &
  39: [0x00,0x05,0x03,0x00,0x00], // '
  40: [0x00,0x1C,0x22,0x41,0x00], // (
  41: [0x00,0x41,0x22,0x1C,0x00], // )
  42: [0x14,0x08,0x3E,0x08,0x14], // *
  43: [0x08,0x08,0x3E,0x08,0x08], // +
  44: [0x00,0x50,0x30,0x00,0x00], // ,
  45: [0x08,0x08,0x08,0x08,0x08], // -
  46: [0x00,0x60,0x60,0x00,0x00], // .
  47: [0x20,0x10,0x08,0x04,0x02], // /
  48: [0x3E,0x51,0x49,0x45,0x3E], // 0
  49: [0x00,0x42,0x7F,0x40,0x00], // 1
  50: [0x42,0x61,0x51,0x49,0x46], // 2
  51: [0x21,0x41,0x45,0x4B,0x31], // 3
  52: [0x18,0x14,0x12,0x7F,0x10], // 4
  53: [0x27,0x45,0x45,0x45,0x39], // 5
  54: [0x3C,0x4A,0x49,0x49,0x30], // 6
  55: [0x01,0x71,0x09,0x05,0x03], // 7
  56: [0x36,0x49,0x49,0x49,0x36], // 8
  57: [0x06,0x49,0x49,0x29,0x1E], // 9
  58: [0x00,0x36,0x36,0x00,0x00], // :
  59: [0x00,0x56,0x36,0x00,0x00], // ;
  60: [0x08,0x14,0x22,0x41,0x00], // <
  61: [0x14,0x14,0x14,0x14,0x14], // =
  62: [0x00,0x41,0x22,0x14,0x08], // >
  63: [0x02,0x01,0x51,0x09,0x06], // ?
  64: [0x32,0x49,0x79,0x41,0x3E], // @
  65: [0x7E,0x11,0x11,0x11,0x7E], // A
  66: [0x7F,0x49,0x49,0x49,0x36], // B
  67: [0x3E,0x41,0x41,0x41,0x22], // C
  68: [0x7F,0x41,0x41,0x22,0x1C], // D
  69: [0x7F,0x49,0x49,0x49,0x41], // E
  70: [0x7F,0x09,0x09,0x09,0x01], // F
  71: [0x3E,0x41,0x49,0x49,0x7A], // G
  72: [0x7F,0x08,0x08,0x08,0x7F], // H
  73: [0x00,0x41,0x7F,0x41,0x00], // I
  74: [0x20,0x40,0x41,0x3F,0x01], // J
  75: [0x7F,0x08,0x14,0x22,0x41], // K
  76: [0x7F,0x40,0x40,0x40,0x40], // L
  77: [0x7F,0x02,0x0C,0x02,0x7F], // M
  78: [0x7F,0x04,0x08,0x10,0x7F], // N
  79: [0x3E,0x41,0x41,0x41,0x3E], // O
  80: [0x7F,0x09,0x09,0x09,0x06], // P
  81: [0x3E,0x41,0x51,0x21,0x5E], // Q
  82: [0x7F,0x09,0x19,0x29,0x46], // R
  83: [0x46,0x49,0x49,0x49,0x31], // S
  84: [0x01,0x01,0x7F,0x01,0x01], // T
  85: [0x3F,0x40,0x40,0x40,0x3F], // U
  86: [0x1F,0x20,0x40,0x20,0x1F], // V
  87: [0x3F,0x40,0x38,0x40,0x3F], // W
  88: [0x63,0x14,0x08,0x14,0x63], // X
  89: [0x07,0x08,0x70,0x08,0x07], // Y
  90: [0x61,0x51,0x49,0x45,0x43], // Z
  91: [0x00,0x7F,0x41,0x41,0x00], // [
  92: [0x02,0x04,0x08,0x10,0x20], // backslash
  93: [0x00,0x41,0x41,0x7F,0x00], // ]
  94: [0x04,0x02,0x01,0x02,0x04], // ^
  95: [0x40,0x40,0x40,0x40,0x40], // _
  96: [0x00,0x01,0x02,0x04,0x00], // `
  97: [0x20,0x54,0x54,0x54,0x78], // a
  98: [0x7F,0x48,0x44,0x44,0x38], // b
  99: [0x38,0x44,0x44,0x44,0x20], // c
  100:[0x38,0x44,0x44,0x48,0x7F], // d
  101:[0x38,0x54,0x54,0x54,0x18], // e
  102:[0x08,0x7E,0x09,0x01,0x02], // f
  103:[0x0C,0x52,0x52,0x52,0x3E], // g
  104:[0x7F,0x08,0x04,0x04,0x78], // h
  105:[0x00,0x44,0x7D,0x40,0x00], // i
  106:[0x20,0x40,0x44,0x3D,0x00], // j
  107:[0x7F,0x10,0x28,0x44,0x00], // k
  108:[0x00,0x41,0x7F,0x40,0x00], // l
  109:[0x7C,0x04,0x18,0x04,0x78], // m
  110:[0x7C,0x08,0x04,0x04,0x78], // n
  111:[0x38,0x44,0x44,0x44,0x38], // o
  112:[0x7C,0x14,0x14,0x14,0x08], // p
  113:[0x08,0x14,0x14,0x18,0x7C], // q
  114:[0x7C,0x08,0x04,0x04,0x08], // r
  115:[0x48,0x54,0x54,0x54,0x20], // s
  116:[0x04,0x3F,0x44,0x40,0x20], // t
  117:[0x3C,0x40,0x40,0x20,0x7C], // u
  118:[0x1C,0x20,0x40,0x20,0x1C], // v
  119:[0x3C,0x40,0x30,0x40,0x3C], // w
  120:[0x44,0x28,0x10,0x28,0x44], // x
  121:[0x0C,0x50,0x50,0x50,0x3C], // y
  122:[0x44,0x64,0x54,0x4C,0x44], // z
  123:[0x00,0x08,0x36,0x41,0x00], // {
  124:[0x00,0x00,0x7F,0x00,0x00], // |
  125:[0x00,0x41,0x36,0x08,0x00], // }
  126:[0x10,0x08,0x08,0x10,0x10], // ~
};

// ─── Character Cell Renderer ─────────────────────────────────────
const DOT_SIZE = 1.2;
const DOT_GAP = 0.3;
const DOT_PITCH = DOT_SIZE + DOT_GAP;
const CHAR_W = 5 * DOT_PITCH + 1;
const CHAR_H = 7 * DOT_PITCH + 1;
const CHAR_GAP_X = 1.5;
const CHAR_GAP_Y = 3;

const CharCell = React.memo(({ char, col, row, onColor, offColor }) => {
  const code = char.charCodeAt(0);
  const bitmap = FONT_5x7[code] || FONT_5x7[32];

  const cellX = col * (CHAR_W + CHAR_GAP_X);
  const cellY = row * (CHAR_H + CHAR_GAP_Y);

  const dots = [];
  for (let c = 0; c < 5; c++) {
    const colBits = bitmap[c];
    for (let r = 0; r < 7; r++) {
      const isOn = (colBits >> r) & 1;
      dots.push(
        <rect
          key={`${c}-${r}`}
          x={cellX + c * DOT_PITCH}
          y={cellY + r * DOT_PITCH}
          width={DOT_SIZE}
          height={DOT_SIZE}
          rx={0.2}
          fill={isOn ? onColor : offColor}
        />
      );
    }
  }

  return <>{dots}</>;
});

// Total display dimensions
const DISPLAY_W = 16 * (CHAR_W + CHAR_GAP_X) - CHAR_GAP_X;
const DISPLAY_H = 2 * (CHAR_H + CHAR_GAP_Y) - CHAR_GAP_Y;
const PADDING = 5;
const PCB_W = DISPLAY_W + PADDING * 2 + 10;
const PCB_H = DISPLAY_H + PADDING * 2 + 24;

const LCD16x2 = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, id }) => {
  const text = state.text || ['                ', '                '];
  const displayOn = state.displayOn !== false;
  const backlight = state.backlight !== false;
  const cursorPos = state.cursorPos || { row: 0, col: 0 };
  const cursorVisible = state.cursorVisible || false;
  const uid = `lcd-${id}`;

  // Memoize character grid rendering
  const charGrid = useMemo(() => {
    if (!displayOn) return null;

    const cells = [];
    for (let row = 0; row < 2; row++) {
      const line = (text[row] || '').padEnd(16, ' ').substring(0, 16);
      for (let col = 0; col < 16; col++) {
        cells.push(
          <CharCell
            key={`${row}-${col}`}
            char={line[col]}
            col={col}
            row={row}
            onColor="var(--elab-hex-1a2a1a)"
            offColor={backlight ? 'var(--elab-hex-7bbf5c)' : 'var(--elab-hex-556b44)'}
          />
        );
      }
    }
    return cells;
  }, [text, displayOn, backlight]);

  // Pin spacing for 8 pins along the bottom
  const pinSpacing = PCB_W / 9;

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="lcd16x2" role="img"
       aria-label={`LCD 16x2 ${id}`}>
      <rect x="-25" y="-25" width="50" height="50" fill="transparent" pointerEvents="all" onClick={onInteract} />
      {/* PCB Board — Fritzing 3D */}
      <rect x={-PCB_W/2} y={-PCB_H/2} width={PCB_W} height={PCB_H} rx="2"
        fill="var(--elab-hex-2e7d32)" stroke="var(--elab-hex-0d3b0d)" strokeWidth="0.6" />


      {/* Mounting holes (corners) — Fritzing 3D with metallic ring */}
      {[
        { cx: -PCB_W/2 + 4, cy: -PCB_H/2 + 4 },
        { cx: PCB_W/2 - 4, cy: -PCB_H/2 + 4 },
        { cx: -PCB_W/2 + 4, cy: PCB_H/2 - 4 },
        { cx: PCB_W/2 - 4, cy: PCB_H/2 - 4 },
      ].map((h, i) => (
        <g key={`mh-${i}`}>
          <circle cx={h.cx} cy={h.cy} r="2.5" fill="var(--elab-hex-0d3b0d)" stroke="#555" strokeWidth="0.4" />
          <circle cx={h.cx} cy={h.cy} r="2" fill="var(--elab-hex-0a2a0a)" />
          <circle cx={h.cx} cy={h.cy} r="1.2" fill="var(--elab-hex-1b5e20)" />
        </g>
      ))}

      {/* LCD Bezel (metal frame) — Fritzing 3D metallic */}
      <rect
        x={-DISPLAY_W/2 - PADDING - 0.5}
        y={-PCB_H/2 + 3.5}
        width={DISPLAY_W + PADDING * 2 + 1}
        height={DISPLAY_H + PADDING * 2 + 1}
        rx="1.5"
        fill="var(--elab-hex-808080)" stroke="var(--elab-hex-505050)" strokeWidth="0.5"
      />

      {/* LCD Screen */}
      <rect
        x={-DISPLAY_W/2}
        y={-PCB_H/2 + 4 + PADDING}
        width={DISPLAY_W}
        height={DISPLAY_H}
        rx="0.5"
        fill={backlight ? 'var(--elab-hex-9ccc65)' : 'var(--elab-hex-6b8b4a)'}
      />

      {/* Character Grid */}
      <g transform={`translate(${-DISPLAY_W/2}, ${-PCB_H/2 + 4 + PADDING})`}>
        {charGrid}

        {/* Blinking cursor */}
        {displayOn && cursorVisible && (
          <rect
            x={cursorPos.col * (CHAR_W + CHAR_GAP_X)}
            y={cursorPos.row * (CHAR_H + CHAR_GAP_Y) + 6 * DOT_PITCH}
            width={5 * DOT_PITCH}
            height={DOT_SIZE}
            fill="var(--elab-hex-1a2a1a)"
          >
            <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
          </rect>
        )}
      </g>

      {/* Display OFF overlay */}
      {!displayOn && (
        <rect
          x={-DISPLAY_W/2}
          y={-PCB_H/2 + 4 + PADDING}
          width={DISPLAY_W}
          height={DISPLAY_H}
          rx="0.5"
          fill="var(--elab-hex-3a4a2a)"
          opacity="0.8"
        />
      )}

      {/* Pin Headers (bottom edge) */}
      {['RS', 'E', 'D4', 'D5', 'D6', 'D7', 'V+', 'GND'].map((label, i) => {
        const px = -PCB_W/2 + pinSpacing * (i + 1);
        const py = PCB_H/2;
        return (
          <g key={label}>
            {/* Pin body */}
            <rect x={px - 1.5} y={py - 1} width="3" height="5" rx="0.5"
              fill="var(--elab-hex-c0a030)" stroke="var(--elab-hex-a08020)" strokeWidth="0.4" />
          </g>
        );
      })}

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect
          x={-PCB_W/2 - 4}
          y={-PCB_H/2 - 10}
          width={PCB_W + 8}
          height={PCB_H + 24}
          rx="5"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="5 3">
          <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

// Pin positions (relative to component center, at bottom edge of PCB)
const pinSpacing = PCB_W / 9;
LCD16x2.pins = [
  { id: 'rs',  label: 'RS',  x: -PCB_W/2 + pinSpacing * 1, y: PCB_H/2 + 4, type: 'digital' },
  { id: 'e',   label: 'E',   x: -PCB_W/2 + pinSpacing * 2, y: PCB_H/2 + 4, type: 'digital' },
  { id: 'd4',  label: 'D4',  x: -PCB_W/2 + pinSpacing * 3, y: PCB_H/2 + 4, type: 'digital' },
  { id: 'd5',  label: 'D5',  x: -PCB_W/2 + pinSpacing * 4, y: PCB_H/2 + 4, type: 'digital' },
  { id: 'd6',  label: 'D6',  x: -PCB_W/2 + pinSpacing * 5, y: PCB_H/2 + 4, type: 'digital' },
  { id: 'd7',  label: 'D7',  x: -PCB_W/2 + pinSpacing * 6, y: PCB_H/2 + 4, type: 'digital' },
  { id: 'vcc', label: 'VCC', x: -PCB_W/2 + pinSpacing * 7, y: PCB_H/2 + 4, type: 'power' },
  { id: 'gnd', label: 'GND', x: -PCB_W/2 + pinSpacing * 8, y: PCB_H/2 + 4, type: 'power' },
];

LCD16x2.defaultState = {
  text: ['                ', '                '],
  cursorPos: { row: 0, col: 0 },
  cursorVisible: false,
  displayOn: true,
  backlight: true,
};

registerComponent('lcd16x2', {
  component: LCD16x2,
  pins: LCD16x2.pins,
  defaultState: LCD16x2.defaultState,
  category: 'output',
  label: 'LCD 16x2',
  icon: '\u{1F4DF}',
  volumeAvailableFrom: 3,
});

export default LCD16x2;
