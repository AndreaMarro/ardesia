/**
 * ELAB Simulator — LED Component (Tinkercad-Identical Style)
  * 5mm LED: small hemispherical dome at top, two long thin wire leads.
 * Pixel-perfect match with Tinkercad Circuits diagrams (ELAB volumes).
 * - Dome: flat-bottom D-shape, small, base at y=0, apex at y≈-12
  * - Leads: long thin lines from under the dome to pins (±3.75, 22.5)
 * - Colors: verified from Tinkercad screenshots (flat fills, no gradients)
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 22/02/2026
 */

import React from 'react';
import { registerComponent } from './registry';

const LED_COLORS = {
  red:    { body: 'var(--elab-hex-cc2222)', tint: 'var(--elab-hex-ff3333)', dark: 'var(--elab-hex-991111)', vf: 1.8 },
  green:  { body: 'var(--elab-hex-4caf50)', tint: 'var(--elab-hex-81c784)', dark: 'var(--elab-hex-2e7d32)', vf: 2.0 },
  blue:   { body: 'var(--elab-hex-1565c0)', tint: 'var(--elab-hex-1976d2)', dark: 'var(--elab-hex-0d47a1)', vf: 3.0 },
  yellow: { body: 'var(--elab-hex-e6a800)', tint: 'var(--elab-hex-ffee58)', dark: 'var(--elab-hex-c17a00)', vf: 2.0 },
  white:  { body: 'var(--elab-hex-bdbdbd)', tint: 'var(--elab-hex-f5f5f5)', dark: 'var(--elab-hex-757575)', vf: 3.2 },
};

const Led = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, color = 'red', id }) => {
  const burned = state.burned || false;
  const brightness = burned ? 0 : (state.brightness || 0);
  const isOn = !burned && brightness > 0.01;
  const c = LED_COLORS[color] || LED_COLORS.red;
  const uid = `led-${id}`;
  // Glow intensity scales with brightness (0→1), clamped
  const glowOpacity = Math.min(brightness, 1);

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="led" role="img"
       aria-label={`LED ${id}: ${color}${burned ? ', bruciato' : isOn ? ', acceso' : ''}`}>
      {/* S115: Hit area — 44px minimum on both dimensions for WCAG touch target */}
      <rect x="-22" y="-22" width="44" height="50" fill="transparent" pointerEvents="all" onClick={onInteract} />

       {/* SVG defs — glow filter + dome gradient */}
       <defs>
         <filter id={`${uid}-glow`} x="-200%" y="-200%" width="500%" height="500%">
           <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
           <feComposite in="blur" in2="SourceGraphic" operator="over" />
         </filter>
         {/* Radial gradient for glass dome effect */}
         <radialGradient id={`${uid}-dome`} cx="35%" cy="30%" r="65%">
           <stop offset="0%" stopColor={isOn ? 'var(--elab-hex-ffffff)' : c.tint} stopOpacity={isOn ? 0.6 : 0.3} />
           <stop offset="40%" stopColor={isOn ? c.tint : c.body} />
           <stop offset="100%" stopColor={c.dark} />
         </radialGradient>
         {/* Wire lead gradient for metallic effect */}
         <linearGradient id={`${uid}-wire`} x1="0" y1="0" x2="1" y2="0">
           <stop offset="0%" stopColor="var(--elab-hex-b0b0b0)" />
           <stop offset="50%" stopColor="var(--elab-hex-9e9e9e)" />
           <stop offset="100%" stopColor="var(--elab-hex-808080)" />
         </linearGradient>
       </defs>

       {/* Radial glow halo when LED is ON — dramatic bloom with soft filter */}
       {isOn && (
         <g filter={`url(#${uid}-glow)`}>
           <circle cx="0" cy="-5" r="32" fill={c.tint} opacity={glowOpacity * 0.08}>
             <animate attributeName="r" values="30;35;30" dur="2.5s" repeatCount="indefinite" />
             <animate attributeName="opacity" values={`${glowOpacity * 0.08};${glowOpacity * 0.14};${glowOpacity * 0.08}`} dur="2.5s" repeatCount="indefinite" />
           </circle>
           <circle cx="0" cy="-5" r="24" fill={c.tint} opacity={glowOpacity * 0.20} />
           <circle cx="0" cy="-5" r="16" fill={c.tint} opacity={glowOpacity * 0.35} />
           <circle cx="0" cy="-5" r="10" fill={c.tint} opacity={glowOpacity * 0.52} />
           <circle cx="0" cy="-5" r="5" fill="var(--elab-hex-ffffff)" opacity={glowOpacity * 0.40} />
         </g>
       )}

       {/* Wire leads — Andrea 23/05/2026 PM "gambe dei led devono essere più divaricate".
            Anode (lunga, sx) diverges DIAGONALLY left from dome base (-2.4,0) → bend at (-5.0,8)
            then straight down to pin (-3.75, 22.5). Cathode (corta, dx) diverges DIAGONALLY
            right from (2.4,0) → bend at (5.0,8) → KINK at 14 → pin (3.75, 22.5).
            Splay angle ~20° dal dome rende gambe visivamente divaricate book-style. */}
       {/* Anode lead — diagonal splay sx + vertical bottom */}
       <polyline points="-2.4,0 -5.0,8 -3.75,22.5"
         fill="none" stroke={`url(#${uid}-wire)`} strokeWidth="1.4"
         strokeLinecap="round" strokeLinejoin="round" />
       {/* Cathode lead — diagonal splay dx + KINK indicating shorter physical lead */}
       <polyline points="2.4,0 5.0,8 4.5,12 5.6,14 3.75,15.5 3.75,22.5"
         fill="none" stroke={`url(#${uid}-wire)`} strokeWidth="1.4"
         strokeLinecap="round" strokeLinejoin="round" />
       {/* Pin connection markers at breadboard level */}
       <circle cx="-3.75" cy="22.5" r="1.0" fill="#888" opacity="0.3" />
       <circle cx="3.75" cy="22.5" r="1.0" fill="#888" opacity="0.3" />
       {/* Subtle polarity labels: + (left, anode) and small flat-bar (right, cathode).
            Drawn under the dome shadow so they don't dominate visually. */}
       <text x="-7.5" y="6" fontSize="3.2" fill="var(--elab-hex-cc0000)"
         fontFamily="Arial, sans-serif" fontWeight="700" textAnchor="middle"
         opacity="0.55">+</text>
       <line x1="6.2" y1="5" x2="9.0" y2="5"
         stroke="var(--elab-hex-1a1a1a)" strokeWidth="0.7"
         strokeLinecap="round" opacity="0.55" />

       {/* LED dome shadow */}
       <path
         d="M -5.4 0.6 L -5.4 -1.2 A 5.4 8.8 0 0 1 5.4 -1.2 L 5.4 0.6 Z"
         fill="var(--elab-hex-000000)" opacity="0.08"
       />

       {/* LED dome — D-shape with radial gradient for glass look */}
       <path
         d="M -5.8 0 L -5.8 -1.8 A 5.8 9.4 0 0 1 5.8 -1.8 L 5.8 0 Z"
         fill={`url(#${uid}-dome)`}
         stroke={c.dark} strokeWidth="0.5"
       />

       {/* Bright center dome highlight when ON — makes it look lit up */}
       {isOn && (
         <path
           d="M -3.5 -1.2 A 3.5 6.2 0 0 1 3.5 -1.2 L 3.5 -0.5 L -3.5 -0.5 Z"
           fill="var(--elab-hex-ffffff)" opacity={glowOpacity * 0.55}
         />
       )}

       {/* Glass specular highlight (top-left) */}
       <path
         d="M -4.2 -2 A 4 7 0 0 1 -0.5 -9.2 L -1.8 -8 A 3.2 5.5 0 0 0 -4.2 -2.5 Z"
         fill="var(--elab-hex-ffffff)" opacity={isOn ? 0.28 : 0.18}
       />

       {/* Small flat base line to show LED sitting on breadboard */}
       <line x1="-5.8" y1="0" x2="5.8" y2="0" stroke={c.dark} strokeWidth="0.5" />

      {/* Burned state overlay */}
      {burned && (
         <>
           <path d="M -5.8 0 L -5.8 -1.8 A 5.8 9.4 0 0 1 5.8 -1.8 L 5.8 0 Z"
             fill="var(--elab-hex-1a1a1a)" opacity={0.88} />
           <line x1="-5" y1="-8" x2="5" y2="0" stroke="var(--elab-hex-ff3333)" strokeWidth="1.8" strokeLinecap="round" />
           <line x1="5" y1="-8" x2="-5" y2="0" stroke="var(--elab-hex-ff3333)" strokeWidth="1.8" strokeLinecap="round" />
          <text x="0" y="-16" textAnchor="middle" fontSize="4.5" fill="var(--elab-hex-ff3333)"
            fontFamily="Oswald, sans-serif" fontWeight="700" letterSpacing="0.5">
            BRUCIATO!
          </text>
        </>
      )}

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-12" y="-16" width="24" height="46" rx="3"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="4 2" opacity="0.8">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

Led.pins = [
  { id: 'anode',   label: 'A (+)',      x: -3.75, y: 22.5, type: 'digital' },
  { id: 'cathode', label: 'K (\u2212)', x:  3.75, y: 22.5, type: 'digital' },
];

Led.defaultState = { on: false, brightness: 0 };

registerComponent('led', {
  component: Led,
  pins: Led.pins,
  defaultState: Led.defaultState,
  category: 'output',
  label: 'LED',
  icon: '\u{1F4A1}',
  vfByColor: LED_COLORS,
  volumeAvailableFrom: 1,
});

/* \u2500\u2500\u2500 LED-BRIDGE variant (Andrea 23/05/2026) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
 * Gambe divaricate per attraversare il gap centrale della breadboard.
 * Stesso dome, ma legs verticali a stessa X (col allineata) e diversa Y
 * (riga e top \u2194 riga f bot, 17.5px = 1 row pitch + gap).
 *
 * Uso: experiment.components: { type:'led-bridge', id:'led1', color:'red' }
 * pinAssignments: led1:anode \u2192 bb1:e7, led1:cathode \u2192 bb1:f7
 *
 * Render: legs visivamente paralleli che attraversano il gap,
 * anode (sx, gamba lunga) sopra \u2192 e row, cathode (dx, gamba corta) sotto \u2192 f row.
 */
const LedBridge = (props) => {
  const { x = 0, y = 0, state = {}, highlighted = false, onInteract, color = 'red', id } = props;
  const burned = state.burned || false;
  const brightness = burned ? 0 : (state.brightness || 0);
  const isOn = !burned && brightness > 0.01;
  const c = LED_COLORS[color] || LED_COLORS.red;
  const uid = `ledbridge-${id}`;
  const glowOpacity = Math.min(brightness, 1);

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="led-bridge" role="img"
       aria-label={`LED ${id} a cavallo del gap: ${color}${burned ? ', bruciato' : isOn ? ', acceso' : ''}`}>
      <rect x="-22" y="-22" width="44" height="44" fill="transparent" pointerEvents="all" onClick={onInteract} />
      <defs>
        <filter id={`${uid}-glow`} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feComposite in="blur" in2="SourceGraphic" operator="over" />
        </filter>
        <radialGradient id={`${uid}-dome`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={isOn ? 'var(--elab-hex-ffffff)' : c.tint} stopOpacity={isOn ? 0.6 : 0.3} />
          <stop offset="40%" stopColor={isOn ? c.tint : c.body} />
          <stop offset="100%" stopColor={c.dark} />
        </radialGradient>
        <linearGradient id={`${uid}-wire`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--elab-hex-b0b0b0)" />
          <stop offset="50%" stopColor="var(--elab-hex-9e9e9e)" />
          <stop offset="100%" stopColor="var(--elab-hex-808080)" />
        </linearGradient>
      </defs>

      {isOn && (
        <g filter={`url(#${uid}-glow)`}>
          <circle cx="0" cy="-3" r="32" fill={c.tint} opacity={glowOpacity * 0.08} />
          <circle cx="0" cy="-3" r="20" fill={c.tint} opacity={glowOpacity * 0.32} />
          <circle cx="0" cy="-3" r="10" fill={c.tint} opacity={glowOpacity * 0.52} />
          <circle cx="0" cy="-3" r="5" fill="var(--elab-hex-ffffff)" opacity={glowOpacity * 0.40} />
        </g>
      )}

      {/* Legs divaricate: anode (sinistra, gamba lunga) va verso -y (riga e/top),
          cathode (destra, gamba corta con kink) va verso +y (riga f/bot).
          Pin anode: (-3.75, -8.75), cathode: (3.75, +8.75) divergono dal dome verso direzioni opposte. */}
      {/* Anode lead - pins x=0 stessa col, splay diagonale UP poi pin (0,-8.75) */}
      <polyline points="-1.5,0 -3.0,-3 -1.5,-6 0,-8.75"
        fill="none" stroke={`url(#${uid}-wire)`} strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" />
      {/* Cathode lead - splay DOWN diagonale + KINK shorter physical lead \u2192 pin (0,8.75) */}
      <polyline points="1.5,0 3.0,2 2.4,4 3.6,5.5 0,8.75"
        fill="none" stroke={`url(#${uid}-wire)`} strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="0" cy="-8.75" r="1.0" fill="#888" opacity="0.3" />
      <circle cx="0" cy="8.75" r="1.0" fill="#888" opacity="0.3" />

      {/* Polarity markers + (anode), small bar (cathode) */}
      <text x="-7" y="-7" fontSize="3" fill="var(--elab-hex-cc0000)"
        fontFamily="Arial, sans-serif" fontWeight="700" textAnchor="middle" opacity="0.6">+</text>
      <line x1="5.5" y1="7" x2="8" y2="7" stroke="var(--elab-hex-1a1a1a)" strokeWidth="0.7" opacity="0.55" />

      {/* Dome shadow */}
      <path d="M -5.4 0.6 L -5.4 -1.2 A 5.4 8.8 0 0 1 5.4 -1.2 L 5.4 0.6 Z"
        fill="var(--elab-hex-000000)" opacity="0.08" />
      {/* Dome */}
      <path d="M -5.8 0 L -5.8 -1.8 A 5.8 9.4 0 0 1 5.8 -1.8 L 5.8 0 Z"
        fill={`url(#${uid}-dome)`} stroke={c.dark} strokeWidth="0.5" />
      {isOn && (
        <path d="M -3.5 -1.2 A 3.5 6.2 0 0 1 3.5 -1.2 L 3.5 -0.5 L -3.5 -0.5 Z"
          fill="var(--elab-hex-ffffff)" opacity={glowOpacity * 0.55} />
      )}
      <path d="M -4.2 -2 A 4 7 0 0 1 -0.5 -9.2 L -1.8 -8 A 3.2 5.5 0 0 0 -4.2 -2.5 Z"
        fill="var(--elab-hex-ffffff)" opacity={isOn ? 0.28 : 0.18} />
      <line x1="-5.8" y1="0" x2="5.8" y2="0" stroke={c.dark} strokeWidth="0.5" />

      {burned && (
        <>
          <path d="M -5.8 0 L -5.8 -1.8 A 5.8 9.4 0 0 1 5.8 -1.8 L 5.8 0 Z"
            fill="var(--elab-hex-1a1a1a)" opacity={0.88} />
          <line x1="-5" y1="-8" x2="5" y2="0" stroke="var(--elab-hex-ff3333)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="5" y1="-8" x2="-5" y2="0" stroke="var(--elab-hex-ff3333)" strokeWidth="1.8" strokeLinecap="round" />
          <text x="0" y="-16" textAnchor="middle" fontSize="4.5" fill="var(--elab-hex-ff3333)"
            fontFamily="Oswald, sans-serif" fontWeight="700">BRUCIATO!</text>
        </>
      )}

      {highlighted && (
        <rect x="-12" y="-14" width="24" height="28" rx="3"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="4 2" opacity="0.8">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

// Bridge: pins stessa colonna (dx=0), diversa riga (dy=17.5 = row e \u2194 row f gap)
// Permette mount across gap centrale breadboard: anode in top section (e7),
// cathode in bot section (f7), same col \u2192 solver vede stessa colonna nodi.
LedBridge.pins = [
  { id: 'anode',   label: 'A (+)',      x: 0, y: -8.75, type: 'digital' },
  { id: 'cathode', label: 'K (\u2212)', x: 0, y:  8.75, type: 'digital' },
];

LedBridge.defaultState = { on: false, brightness: 0 };

registerComponent('led-bridge', {
  component: LedBridge,
  pins: LedBridge.pins,
  defaultState: LedBridge.defaultState,
  category: 'output',
  label: 'LED (gap)',
  icon: '\u{1F4A1}',
  vfByColor: LED_COLORS,
  volumeAvailableFrom: 1,
});

export { LED_COLORS, LedBridge };
export default Led;
