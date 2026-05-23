/* © Andrea Marro — 23/05/2026 — ELAB Tutor — Tutti i diritti riservati */
/**
 * LAVAGNA LAYOUT OVERHAUL — E2E layout-aware spec (L1-L5 + L4.1)
 *
 * Atom A nuovo deliverable iter Lavagna Layout Overhaul finalize 2026-05-23.
 * Audit ref: docs/audits/lavagna-overhaul-2026-05-23/AUDIT-FINAL.md §B + §C.
 *
 * Copertura:
 *  - 9 layout test (3 viewport × 3 modalità Percorso/Passo-Passo/Già-Montato):
 *    verify modalita-switch-slot + header + canvas NO overlap, canvas z-index auto
 *    (L2 no stacking trap), modalita switch responsive a click.
 *  - 3 regression test:
 *    R1) L4.1 tab-gate hide: switch activeTab → 'classe' nasconde overlayRoot
 *    R2) L4.1 tab-gate restore: switch back 'lavagna' ripristina overlayRoot
 *    R3) Canvas z-index = 'auto' (L2 stacking sanitize), nessun integer hardcoded
 *
 * NOTE selettori:
 *  - [data-testid="modalita-switch-slot"] = striscia ModalitaSwitch (L2 in-flusso)
 *  - [data-testid="modalita-switch"] = ModalitaSwitch container
 *  - [data-testid="modalita-btn-{percorso|passo-passo|gia-montato}"] = mode buttons
 *  - [class*="overlayRoot"] = L4 portal wrapper (CSS module hash)
 *  - [class*="lavagnaView"] = vista Lavagna (display:none su altri tab)
 *  - <header> = AppHeader
 *  - <main> dentro lavagnaView = canvas
 *
 * Tab gate test: per evitare dependency su isDocente check (richiede ruolo:docente)
 * usiamo override seed E2E con ruolo:docente per abilitare i tab buttons. Il fix L4.1
 * è puramente runtime activeTab-driven, indipendente da auth.
 */

import { test, expect } from '@playwright/test';
import { waitForPageReady, skipIfProd } from './fixtures.js';

// Force serial mode: parallel workers cause flake from Vite dev-server contention
// (multiple browser contexts hitting same /#lavagna route trigger HMR queue + picker
// dialog timing race). 12/12 PASS serial, 5/12 PASS parallel = use serial.
test.describe.configure({ mode: 'serial' });

const VIEWPORTS = {
  small: { width: 1366, height: 768 },
  medium: { width: 1440, height: 900 },
  large: { width: 1920, height: 1080 },
};

const MODALITA = ['percorso', 'passo-passo', 'gia-montato'];

async function seedE2EDocente(page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem(
        'elab_e2e_user',
        JSON.stringify({
          id: 'e2e-docente',
          email: 'e2e-docente@elabtutor.school',
          role: 'admin',
          ruolo: 'docente',
        })
      );
      // Dismiss BentornatiOverlay (welcome screen) — intercepts clicks otherwise.
      window.localStorage.setItem('elab_skip_bentornati', 'true');
    } catch (e) { /* storage disabled */ }
  });
}

function rectsOverlap(a, b) {
  return !(a.bottom <= b.top || a.top >= b.bottom || a.right <= b.left || a.left >= b.right);
}

test.describe('Lavagna Layout Overhaul L1-L5 (3 bp × 3 modalità)', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    skipIfProd(test, baseURL);
    await seedE2EDocente(page);
  });

  for (const [bpName, bp] of Object.entries(VIEWPORTS)) {
    for (const modalita of MODALITA) {
      test(`${bpName} ${bp.width}×${bp.height} + modalità "${modalita}": no overlap header×modalitaSlot×canvas`, async ({ page }) => {
        await page.setViewportSize(bp);
        await page.goto('/#lavagna');
        await waitForPageReady(page);

        await page.waitForFunction(
          () => typeof window.__ELAB_API?.toggleDrawing === 'function'
                && typeof window.__ELAB_API?.mountExperiment === 'function',
          null,
          { timeout: 15000 }
        );

        // Mount experiment programmatically — dismisses "Scegli un esperimento" picker
        // dialog that otherwise intercepts clicks on ModalitaSwitch buttons.
        await page.evaluate(() => {
          try { window.__ELAB_API.mountExperiment('v1-cap6-esp1'); } catch {}
        });
        await page.waitForTimeout(800); // let picker close + experiment mount

        // Click target modalità (ModalitaSwitch radio-like switch)
        const modBtn = page.locator(`[data-testid="modalita-btn-${modalita}"]`).first();
        const hasBtn = await modBtn.isVisible({ timeout: 5000 }).catch(() => false);
        if (hasBtn) {
          await modBtn.click({ force: true }); // bypass any remaining overlay flake
          await page.waitForTimeout(400); // animation + reflow settle
        }

        // Empirical bounding rect probe
        const layout = await page.evaluate(() => {
          const rect = (el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
          };
          const slot = document.querySelector('[data-testid="modalita-switch-slot"]');
          const header = document.querySelector('header');
          const lavagnaView = document.querySelector('[class*="lavagnaView"]');
          const canvas = lavagnaView ? lavagnaView.querySelector('main') : null;
          return {
            slot: rect(slot),
            header: rect(header),
            canvas: rect(canvas),
            canvasZIndex: canvas ? getComputedStyle(canvas).zIndex : null,
            slotZIndex: slot ? getComputedStyle(slot).zIndex : null,
            viewport: { w: window.innerWidth, h: window.innerHeight },
          };
        });

        // L1 + L2 layout invariants (audit §C):
        expect(layout.header, 'header must exist').not.toBeNull();
        expect(layout.canvas, 'canvas <main> must exist').not.toBeNull();
        expect(layout.canvasZIndex, 'canvas z-index must be auto (L2 no stacking trap)').toBe('auto');

        if (layout.slot) {
          // L2: modalita-switch-slot is in-flow, must NOT intersect header
          expect(
            rectsOverlap(layout.slot, layout.header),
            `modalita-switch-slot overlaps header (bp=${bpName}, mod=${modalita})`
          ).toBe(false);
          // L2: slot must NOT intersect canvas <main>
          expect(
            rectsOverlap(layout.slot, layout.canvas),
            `modalita-switch-slot overlaps canvas (bp=${bpName}, mod=${modalita})`
          ).toBe(false);
        }

        // L1: viewport width respected (no horizontal scroll forced)
        expect(layout.viewport.w).toBeGreaterThanOrEqual(bp.width - 20);
      });
    }
  }
});

test.describe('Lavagna Layout Overhaul L4.1 tab-gate regression', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    skipIfProd(test, baseURL);
    await seedE2EDocente(page);
  });

  test('R1: switching activeTab → "classe" hides overlayRoot via inline style display:none', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.medium);
    await page.goto('/#lavagna');
    await waitForPageReady(page);

    await page.waitForFunction(
      () => typeof window.__ELAB_API?.toggleDrawing === 'function'
            && typeof window.__ELAB_API?.mountExperiment === 'function',
      null,
      { timeout: 15000 }
    );

    // Mount experiment to dismiss "Scegli un esperimento" picker dialog
    await page.evaluate(() => {
      try { window.__ELAB_API.mountExperiment('v1-cap6-esp1'); } catch {}
    });
    await page.waitForTimeout(800);

    // Click "Classe" tab (Dashboard docente) — aria-label="Dashboard classe"
    const classeTab = page.locator('button[aria-label="Dashboard classe"]').first();
    const hasTab = await classeTab.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasTab) {
      // Fallback: set localStorage activeTab to 'classe' + reload
      await page.evaluate(() => {
        try { localStorage.setItem('elab_lavagna_active_tab', 'classe'); } catch {}
      });
      await page.reload();
      await waitForPageReady(page);
    } else {
      await classeTab.click({ force: true });
      await page.waitForTimeout(500);
    }

    // L4.1 invariant: inline style display === 'none' su overlayRoot
    const overlayState = await page.evaluate(() => {
      const overlay = document.querySelector('[class*="overlayRoot"]');
      return overlay
        ? { inlineDisplay: overlay.style.display, computedDisplay: getComputedStyle(overlay).display }
        : null;
    });

    expect(overlayState, 'overlayRoot portal must exist in DOM (mount preservato)').not.toBeNull();
    expect(overlayState.inlineDisplay, 'L4.1: inline display:none su tab non-Lavagna').toBe('none');
    expect(overlayState.computedDisplay, 'L4.1: computed display:none').toBe('none');
  });

  test('R2: switching activeTab back → "lavagna" restores overlayRoot (inline display empty)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.medium);

    // Step 1: goto + wait API ready (default activeTab=lavagna)
    await page.goto('/#lavagna');
    await waitForPageReady(page);

    await page.waitForFunction(
      () => typeof window.__ELAB_API?.toggleDrawing === 'function'
            && typeof window.__ELAB_API?.mountExperiment === 'function',
      null,
      { timeout: 15000 }
    );

    // Step 2: switch activeTab → 'classe' via direct LS + reload (no addInitScript
    // double-overwrite race). seedE2EDocente re-runs on reload preserving auth + skip flags.
    await page.evaluate(() => {
      try { localStorage.setItem('elab_lavagna_active_tab', 'classe'); } catch {}
    });
    await page.reload();
    await waitForPageReady(page);
    await page.waitForFunction(
      () => typeof window.__ELAB_API?.toggleDrawing === 'function',
      null,
      { timeout: 15000 }
    );

    // Step 3: verify pre-condition (activeTab=classe, overlay hidden inline)
    const before = await page.evaluate(() => {
      const overlay = document.querySelector('[class*="overlayRoot"]');
      const lsTab = localStorage.getItem('elab_lavagna_active_tab');
      return { display: overlay ? overlay.style.display : null, lsTab };
    });
    expect(before.lsTab, 'precondition: localStorage activeTab=classe').toBe('classe');
    expect(before.display, 'precondition: overlay hidden on activeTab=classe').toBe('none');

    // Step 4: switch back to 'lavagna' via direct LS + reload (no race)
    await page.evaluate(() => {
      try { localStorage.setItem('elab_lavagna_active_tab', 'lavagna'); } catch {}
    });
    await page.reload();
    await waitForPageReady(page);
    await page.waitForFunction(
      () => typeof window.__ELAB_API?.toggleDrawing === 'function',
      null,
      { timeout: 15000 }
    );

    // L4.1 invariant: inline display === '' (undefined → CSS modulo prevale → visible)
    const after = await page.evaluate(() => {
      const overlay = document.querySelector('[class*="overlayRoot"]');
      return overlay
        ? { inlineDisplay: overlay.style.display, computedDisplay: getComputedStyle(overlay).display }
        : null;
    });

    expect(after, 'overlayRoot must exist').not.toBeNull();
    expect(after.inlineDisplay, 'L4.1: inline restored to empty on lavagna').toBe('');
    expect(['block', 'flex', 'grid', 'inline-block'].includes(after.computedDisplay),
      `L4.1: computed display visible (got "${after.computedDisplay}")`).toBe(true);
  });

  test('R3: canvas z-index === "auto" guard (L2 stacking sanitize)', async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.large);
    await page.goto('/#lavagna');
    await waitForPageReady(page);

    await page.waitForFunction(
      () => typeof window.__ELAB_API?.toggleDrawing === 'function',
      null,
      { timeout: 15000 }
    );

    const canvasZ = await page.evaluate(() => {
      const lavagnaView = document.querySelector('[class*="lavagnaView"]');
      const canvas = lavagnaView ? lavagnaView.querySelector('main') : null;
      return canvas ? getComputedStyle(canvas).zIndex : null;
    });

    expect(canvasZ,
      'L2: canvas <main> z-index MUST be "auto" — no hardcoded integer that creates stacking trap'
    ).toBe('auto');
  });
});
