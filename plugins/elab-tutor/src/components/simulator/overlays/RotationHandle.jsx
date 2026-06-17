/**
 * RotationHandle — visible UI affordance per ruotare componenti circuito
 * Sprint S iter 13 R2 — surfaces existing rotation infra (SimulatorCanvas line 2196-2342)
 *
 * Render in SVG come gruppo overlay quando un componente è selezionato.
 * 4 bottoni discreti (0° / 90° / 180° / 270°) con touch target ≥44px (CLAUDE.md regola 9).
 * Snap matematica: rotation normalized via Math.round(angle / 90) * 90 % 360.
 *
 * Props:
 *   - componentId: id del componente selezionato (string)
 *   - currentRotation: rotazione corrente (0/90/180/270, default 0)
 *   - anchorX/anchorY: posizione SVG corner (px) per disegnare l'handle
 *   - onRotate: callback (newRotation: 0|90|180|270) => void
 *   - visible: boolean (mostra solo se selezionato)
 *
 * @returns SVG <g> element
 */
import React from 'react';

export const ROTATION_VALUES = [0, 90, 180, 270];
export const ROTATION_SNAP_THRESHOLD = 45; // continuous-mode snap mid-quadrant

/**
 * Snap arbitrary angle a 0/90/180/270.
 * Pure function exported for tests + future drag-arc continuous mode.
 *
 * @param {number} angle — degrees (any real number, may be negative)
 * @returns {0|90|180|270}
 */
export function snapToNearestQuadrant(angle) {
  if (!Number.isFinite(angle)) return 0;
  // normalize 0..359
  let normalized = ((angle % 360) + 360) % 360;
  // round to nearest 90
  const snapped = (Math.round(normalized / 90) * 90) % 360;
  return snapped;
}

/**
 * Cycle rotation +90 (used da context menu legacy).
 *
 * @param {number} current — current rotation
 * @returns {0|90|180|270}
 */
export function cycleRotationCW(current) {
  const cur = snapToNearestQuadrant(current || 0);
  return (cur + 90) % 360;
}

const BUTTON_SIZE = 44; // CLAUDE.md regola 9: touch target ≥ 44x44 px
const BUTTON_RADIUS = 16; // visual button radius (hit area larger via invisible circle)
const HIT_RADIUS = BUTTON_SIZE / 2; // 22 — invisible hit circle

const RotationHandle = ({
  componentId,
  currentRotation = 0,
  anchorX = 0,
  anchorY = 0,
  onRotate,
  visible = true,
}) => {
  if (!visible || !componentId || typeof onRotate !== 'function') return null;

  const current = snapToNearestQuadrant(currentRotation);

  // iter 45 fix Andrea video2 06/05/2026 B11 "questa cosa della rotazione fatta
  // così è davvero brutta": 4 button stack verticale 0/90/180/270 ingombrante +
  // numeri poco leggibili. Sostituito con SINGLE button "↻" (rotate +90 cycle).
  // Click cicla 0→90→180→270→0. Touch target 44px. Indica direzione visivamente.
  const next = (current + 90) % 360;

  return (
    <g
      data-testid="rotation-handle"
      data-component-id={componentId}
      data-current-rotation={current}
      transform={`translate(${anchorX}, ${anchorY})`}
      role="group"
      aria-label={`Rotazione ${componentId} — attualmente ${current} gradi`}
    >
      {/* iter 45 B11: single rotate button (cycle +90°) sostituisce 4 stacked
           button verticale. Più compatto, icona auto-esplicativa, touch ≥44px. */}
      <g
        data-testid="rotation-handle-btn-cycle"
        data-current-rotation={current}
        style={{ cursor: 'pointer' }}
        onPointerDown={(ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          onRotate(next);
        }}
        role="button"
        aria-label={`Ruota di 90 gradi (prossimo: ${next}°)`}
      >
        {/* Invisible hit area 44px touch */}
        <circle r={HIT_RADIUS} fill="transparent" />
        {/* Visible button Lime accent */}
        <circle
          r={BUTTON_RADIUS}
          fill="var(--color-accent, var(--elab-lime))"
          stroke="#fff"
          strokeWidth="2.5"
          opacity="0.96"
        />
        {/* Rotate icon ↻ — circular arrow indicating clockwise rotation */}
        <path
          d="M -7,-2 A 7,7 0 1 1 -2,7"
          stroke="#fff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          pointerEvents="none"
        />
        <path
          d="M -2,7 L 1,4 M -2,7 L 1,10"
          stroke="#fff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          pointerEvents="none"
        />
        {/* Current degree label sotto */}
        <text
          x="0"
          y={BUTTON_RADIUS + 14}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fontFamily="Oswald, Arial, sans-serif"
          fill="var(--color-primary, var(--elab-navy))"
          pointerEvents="none"
        >
          {current}°
        </text>
      </g>
    </g>
  );
};

export default RotationHandle;
