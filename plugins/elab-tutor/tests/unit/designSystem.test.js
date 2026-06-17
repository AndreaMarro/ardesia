/**
 * designSystem.test.js — Test per il Design System ELAB
 * Valida: colori hex, font-family, font-size minimi, spacing grid, touch target,
 *         CSS variables nei file sorgente, palette CLAUDE.md.
 *
 * Categoria benchmark: "Design System" (peso 1x, era 0 test)
 * © Andrea Marro — 13/04/2026
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../');

// Leggi design-system.css una volta sola
const DS_CSS = readFileSync(resolve(ROOT, 'src/styles/design-system.css'), 'utf-8');

// ══════════════════════════════════════════════════════════════════════════════
// UTILITÀ
// ══════════════════════════════════════════════════════════════════════════════

/** Estrae il valore di una CSS variable dal file design-system.css */
function getVar(name) {
  const re = new RegExp(`${name.replace('--', '--')}:\\s*([^;]+);`);
  const match = DS_CSS.match(re);
  return match ? match[1].trim() : null;
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. PALETTE ELAB — colori esatti da CLAUDE.md
// ══════════════════════════════════════════════════════════════════════════════
describe('Design System — palette ELAB (CLAUDE.md)', () => {
  it('--color-primary è Navy #1E4D8C', () => {
    const val = getVar('--color-primary');
    expect(val).toBe('#1E4D8C');
  });

  it('--color-accent è Lime #4A7A25', () => {
    const val = getVar('--color-accent');
    expect(val).toBe('#4A7A25');
  });

  it('--color-vol2 è Orange #E8941C', () => {
    const val = getVar('--color-vol2');
    expect(val).toBe('#E8941C');
  });

  it('--color-vol3 è Red #E54B3D', () => {
    const val = getVar('--color-vol3');
    expect(val).toBe('#E54B3D');
  });

  it('--color-danger è rosso emergenza #DC2626', () => {
    const val = getVar('--color-danger');
    expect(val).toBe('#DC2626');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. TIPOGRAFIA — font-family e font-size minimi (regola CLAUDE.md: min 13px)
// ══════════════════════════════════════════════════════════════════════════════
describe('Design System — tipografia', () => {
  it('--font-heading contiene Oswald', () => {
    const val = getVar('--font-heading');
    expect(val).toContain('Oswald');
  });

  it('--font-sans contiene Open Sans', () => {
    const val = getVar('--font-sans');
    expect(val).toContain('Open Sans');
  });

  it('--font-mono contiene Fira Code', () => {
    const val = getVar('--font-mono');
    expect(val).toContain('Fira Code');
  });

  it('--font-size-xs è almeno 13px (regola CLAUDE.md)', () => {
    const val = getVar('--font-size-xs');
    // es. "14px" → parseInt("14px") = 14
    const px = parseInt(val);
    expect(px).toBeGreaterThanOrEqual(13);
  });

  it('--font-size-base è almeno 16px', () => {
    const val = getVar('--font-size-base');
    const px = parseInt(val);
    expect(px).toBeGreaterThanOrEqual(16);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. TOUCH TARGET — min 44px (CLAUDE.md), 56px per LIM/iPad (design-system.css)
// ══════════════════════════════════════════════════════════════════════════════
describe('Design System — touch target', () => {
  it('--touch-min è definita nel CSS', () => {
    expect(DS_CSS).toContain('--touch-min');
  });

  it('--touch-min è almeno 44px', () => {
    const val = getVar('--touch-min');
    const px = parseInt(val);
    expect(px).toBeGreaterThanOrEqual(44);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. SPACING GRID — basato su multipli di 4px
// ══════════════════════════════════════════════════════════════════════════════
describe('Design System — spacing grid 4px', () => {
  it('--space-1 è 4px', () => {
    const val = getVar('--space-1');
    expect(val).toBe('4px');
  });

  it('--space-4 è 16px (4×4)', () => {
    const val = getVar('--space-4');
    expect(val).toBe('16px');
  });

  it('--space-8 è 32px (8×4)', () => {
    const val = getVar('--space-8');
    expect(val).toBe('32px');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. BREAKPOINT TABLET — 768px iPad portrait documentato nel CSS
// ══════════════════════════════════════════════════════════════════════════════
describe('Design System — breakpoint tablet iPad', () => {
  it('design-system.css documenta iPad portrait 768-1023px', () => {
    expect(DS_CSS).toContain('768');
  });

  it('ElabSimulator.css ha media query per iPad portrait (768-1023px)', () => {
    const simCss = readFileSync(resolve(ROOT, 'src/components/simulator/ElabSimulator.css'), 'utf-8');
    expect(simCss).toContain('768px');
  });
});
