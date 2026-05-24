/**
 * ELAB Simulator — Battery 9V Component (Pixel-Perfect Tinkercad/Book Style)
 * Batteria 9V PP3 — HORIZONTAL layout matching book Fritzing diagrams exactly.
 * - Body: landscape (wide), dark black left (~60%) + orange/copper right (~40%)
 * - Snap connector: TWO SEPARATE gray metallic clips (top & bottom) with gap
 * - Terminals/signs: (+) upper, (−) lower — pins aligned to minimize wire crossing
 * - "9V" text: upright on the dark body section
 * - Wire leads: red (+) and black (−) from connector to pins
 * Pin names: positive / negative — UNCHANGED (solver-safe).
 * © Andrea Marro — 10/02/2026, pixel-perfect book redesign 24/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const Battery9V = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, id }) => {
  const voltage = state.voltage || 9;
  const isConnected = state.connected !== false;

  /* ── Dimensions (Tinkercad-matching horizontal battery) ── */
  /* Body extends LEFT from origin. Snap connector starts at x=0 (right edge). */
  const DARK_W = 44;      /* dark black section width */
  const ORANGE_W = 26;    /* orange/copper section width */
  const BODY_W = DARK_W + ORANGE_W; /* = 70 total */
  const BODY_H = 36;      /* body height */
  const BODY_LEFT = -BODY_W; /* = -70 — left edge */
  const BODY_TOP = -38;   /* body top edge */
  const BODY_BOT = BODY_TOP + BODY_H; /* = -2 */
  const BODY_MID_Y = BODY_TOP + BODY_H / 2; /* vertical center */

  /* Separator strip between body and clips */
  const SEP_X = 0;
  const SEP_W = 3;

  /* Two separate snap connector clips — upper (+) and lower (−) */
  const CLIP_X = SEP_X + SEP_W;  /* = 3 */
  const CLIP_W = 10;
  const CLIP_GAP = 5;            /* gap between the two clips */
  const CLIP_H = (BODY_H - CLIP_GAP) / 2; /* each clip height */
  const CLIP_TOP_Y = BODY_TOP;   /* upper clip top — (+) */
  const CLIP_BOT_Y = BODY_MID_Y + CLIP_GAP / 2; /* lower clip top — (−) */

  /* Terminal positions — centered on each clip face */
  const TERM_X = CLIP_X + CLIP_W * 0.35;
  const TERM_PLUS_Y = CLIP_TOP_Y + CLIP_H / 2;   /* (+) on upper clip */
  const TERM_MINUS_Y = CLIP_BOT_Y + CLIP_H / 2;  /* (−) on lower clip */

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="battery9v" role="img"
       aria-label={`Batteria 9V ${id}: ${voltage}V`}>

      {/* ── BODY: Dark section (left ~63%) ── */}
      <rect x={BODY_LEFT} y={BODY_TOP} width={DARK_W} height={BODY_H} rx="2"
        fill="var(--elab-hex-1a1a1a)" stroke="#111" strokeWidth="0.5" />

      {/* ── BODY: Orange/copper band (right ~37%) ── */}
      <rect x={BODY_LEFT + DARK_W} y={BODY_TOP} width={ORANGE_W} height={BODY_H}
        fill="var(--elab-hex-c9884b)" stroke="var(--elab-hex-a06830)" strokeWidth="0.5" />
      {/* Right edge rounding cover */}
      <rect x={BODY_LEFT + BODY_W - 2.5} y={BODY_TOP + 0.25} width="2.5" height={BODY_H - 0.5}
        fill="var(--elab-hex-c9884b)" />

      {/* ── Orange section: (+) upper and (−) lower imprint ── */}
      <circle cx={BODY_LEFT + DARK_W + ORANGE_W * 0.55} cy={BODY_TOP + BODY_H * 0.28} r="3.4"
        fill="none" stroke="var(--elab-hex-a06830)" strokeWidth="0.6" opacity="0.6" />
      <text x={BODY_LEFT + DARK_W + ORANGE_W * 0.55} y={BODY_TOP + BODY_H * 0.28 + 2}
        textAnchor="middle" fontSize="6.5" fill="var(--elab-hex-8b5e28)" fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif">+</text>

      <circle cx={BODY_LEFT + DARK_W + ORANGE_W * 0.55} cy={BODY_TOP + BODY_H * 0.72} r="3.4"
        fill="none" stroke="var(--elab-hex-a06830)" strokeWidth="0.6" opacity="0.6" />
      <text x={BODY_LEFT + DARK_W + ORANGE_W * 0.55} y={BODY_TOP + BODY_H * 0.72 + 1.8}
        textAnchor="middle" fontSize="5.5" fill="var(--elab-hex-8b5e28)" fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif">{'\u2212'}</text>

      {/* ── "9V" text — upright on dark body ── */}
      <text
        x={BODY_LEFT + DARK_W * 0.5}
        y={BODY_TOP + BODY_H * 0.55}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="20" fontWeight="bold"
        fill="var(--elab-hex-e8e8e8)"
        fontFamily="Arial Black, Impact, sans-serif"
        letterSpacing="-0.5"
      >
        9V
      </text>

      {/* ── Dark separator strip between body and clips ── */}
      <rect x={SEP_X} y={BODY_TOP} width={SEP_W} height={BODY_H}
        fill="var(--elab-hex-0e0e0e)" />

      {/* ── UPPER CLIP (+) — gray metallic tab ── */}
      <rect x={CLIP_X} y={CLIP_TOP_Y} width={CLIP_W} height={CLIP_H} rx="1.5"
        fill="var(--elab-hex-a0a0a0)" stroke="var(--elab-hex-808080)" strokeWidth="0.5" />
      <line x1={CLIP_X + 1} y1={CLIP_TOP_Y + CLIP_H * 0.35}
        x2={CLIP_X + CLIP_W - 1} y2={CLIP_TOP_Y + CLIP_H * 0.35}
        stroke="var(--elab-hex-909090)" strokeWidth="0.4" opacity="0.5" />
      <line x1={CLIP_X + 1} y1={CLIP_TOP_Y + CLIP_H * 0.65}
        x2={CLIP_X + CLIP_W - 1} y2={CLIP_TOP_Y + CLIP_H * 0.65}
        stroke="var(--elab-hex-909090)" strokeWidth="0.4" opacity="0.5" />

      {/* (+) Terminal — larger ring/socket on upper clip */}
      <circle cx={TERM_X} cy={TERM_PLUS_Y} r="5.5"
        fill="var(--elab-hex-808080)" stroke="var(--elab-hex-6a6a6a)" strokeWidth="0.4" />
      <circle cx={TERM_X} cy={TERM_PLUS_Y} r="4.2"
        fill="var(--elab-hex-a0a0a0)" />
      <circle cx={TERM_X} cy={TERM_PLUS_Y} r="2.8"
        fill="var(--elab-hex-606060)" stroke="#555" strokeWidth="0.3" />
      <circle cx={TERM_X} cy={TERM_PLUS_Y} r="1.5"
        fill="var(--elab-hex-1a1a1a)" />

      {/* ── LOWER CLIP (−) — gray metallic tab ── */}
      <rect x={CLIP_X} y={CLIP_BOT_Y} width={CLIP_W} height={CLIP_H} rx="1.5"
        fill="var(--elab-hex-a0a0a0)" stroke="var(--elab-hex-808080)" strokeWidth="0.5" />
      <line x1={CLIP_X + 1} y1={CLIP_BOT_Y + CLIP_H * 0.35}
        x2={CLIP_X + CLIP_W - 1} y2={CLIP_BOT_Y + CLIP_H * 0.35}
        stroke="var(--elab-hex-909090)" strokeWidth="0.4" opacity="0.5" />
      <line x1={CLIP_X + 1} y1={CLIP_BOT_Y + CLIP_H * 0.65}
        x2={CLIP_X + CLIP_W - 1} y2={CLIP_BOT_Y + CLIP_H * 0.65}
        stroke="var(--elab-hex-909090)" strokeWidth="0.4" opacity="0.5" />

      {/* (−) Terminal — smaller metallic nub on lower clip */}
      <circle cx={TERM_X} cy={TERM_MINUS_Y} r="4.5"
        fill="var(--elab-hex-808080)" stroke="var(--elab-hex-6a6a6a)" strokeWidth="0.4" />
      <circle cx={TERM_X} cy={TERM_MINUS_Y} r="3.5"
        fill="var(--elab-hex-b0b0b0)" />
      <circle cx={TERM_X} cy={TERM_MINUS_Y} r="2"
        fill="var(--elab-hex-d0d0d0)" stroke="#999" strokeWidth="0.3" />

      {/* Red wire (+) — from upper clip down to pin positive (0, 32) */}
      <path
        d={`M ${TERM_X} ${CLIP_TOP_Y + CLIP_H + 1} C ${TERM_X} 5, 2 20, 0 32`}
        stroke="var(--elab-hex-8b1b1b)" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.2"
      />
      <path
        d={`M ${TERM_X} ${CLIP_TOP_Y + CLIP_H + 1} C ${TERM_X} 5, 2 20, 0 32`}
        stroke="var(--elab-hex-d32f2f)" strokeWidth="2.4" fill="none" strokeLinecap="round"
      />

      {/* Black wire (−) — from lower clip down to pin negative (0, 58) */}
      <path
        d={`M ${TERM_X} ${CLIP_BOT_Y + CLIP_H + 1} C ${TERM_X} 20, 2 42, 0 58`}
        stroke="#000" strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.2"
      />
      <path
        d={`M ${TERM_X} ${CLIP_BOT_Y + CLIP_H + 1} C ${TERM_X} 20, 2 42, 0 58`}
        stroke="var(--elab-hex-1a1a1a)" strokeWidth="2.4" fill="none" strokeLinecap="round"
      />

      {/* ── Interaction area ── */}
      <rect
        x={BODY_LEFT - 4} y={BODY_TOP - 6}
        width={BODY_W + CLIP_W + SEP_W + 8} height={BODY_H + 72}
        rx="4" fill="transparent" cursor="pointer"
        onClick={() => onInteract && onInteract(id, 'toggle')}
      />

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x={BODY_LEFT - 6} y={BODY_TOP - 8}
          width={BODY_W + CLIP_W + SEP_W + 12} height={BODY_H + 78}
          rx="5" fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="5 3">
          <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

Battery9V.pins = [
  { id: 'positive', label: '+ (9V)', x: 0, y: 32, type: 'power' },
  { id: 'negative', label: '\u2212 (GND)', x: 0, y: 58, type: 'power' },
];

Battery9V.defaultState = { voltage: 9, connected: true };

registerComponent('battery9v', {
  component: Battery9V,
  pins: Battery9V.pins,
  defaultState: Battery9V.defaultState,
  category: 'power',
  label: 'Batteria 9V',
  icon: '',
  volumeAvailableFrom: 1,
});

export default Battery9V;
