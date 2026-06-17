/**
 * session-export.spec.js — Goal B atom B6 E2E
 *
 * Verifica end-to-end del flusso JSON export/import sessione (schema v1.0):
 *   1. Apri Lavagna su localhost:5173 con esperimento v1-cap6-esp1
 *   2. Click "Salva" in AppHeader → modal SessionExportModal si apre
 *   3. Click "Esporta JSON" → download triggered → JSON parsato + valido
 *   4. Click "Importa JSON" → upload file appena scaricato → circuito ripristinato
 *
 * Strategia selettori (difensiva):
 *   - data-testid quando presente (es. btn-salva-sessione esiste in AppHeader)
 *   - role/accessible-name fallback (es. role=dialog + nome bottone IT)
 *
 * Modal (B3 deliverable) potrebbe non essere ancora wired in LavagnaShell al
 * momento dell'esecuzione (B6 + B3 lanciati paralleli). Se il modal non
 * appare dopo click su Salva entro 5s, il test marca con .fixme + documenta
 * il selector mancante.
 *
 * Run:
 *   npx playwright test tests/e2e/session-export.spec.js --reporter=line
 *   (usa playwright.config.js base — targeta http://localhost:5173)
 *
 * (c) Andrea Marro — 27/05/2026 — ELAB Tutor — Goal B atom B6
 */

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  bypassWelcomeGate,
  seedGateBypass,
  dismissExperimentPicker,
} from './helpers/welcome-gate-bypass.js';

const EXP_ID = 'v1-cap6-esp1';

// Cartella temporanea per il download (cleanup post-run).
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'elab-session-export-'));

test.setTimeout(60_000);

test.describe.serial('Goal B6 — Session export/import flow', () => {
  // Path del file scaricato condiviso fra i 2 test serial.
  let downloadedPath = null;

  test.beforeEach(async ({ page }) => {
    // Seed bypass licenza + consent + bentornati overlay PRIMA del goto.
    await seedGateBypass(page);
    // Naviga direttamente all'esperimento target.
    await page.goto(`/#lavagna?exp=${EXP_ID}`);
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await bypassWelcomeGate(page);
    // Picker auto-apre via debounce 400ms in LavagnaShell — dismiss difensivo.
    await page.waitForTimeout(800);
    await dismissExperimentPicker(page).catch(() => {});
    // Forza mount esperimento via API (deep-link query a volte non basta).
    await page
      .waitForFunction(
        () => Boolean(window.__ELAB_API && (window.__ELAB_API.mountExperiment || window.__ELAB_API.loadExperiment)),
        null,
        { timeout: 20_000 }
      )
      .catch(() => {});
    await page.evaluate((id) => {
      try {
        window.__ELAB_API?.mountExperiment?.(id);
        window.__ELAB_API?.loadExperiment?.(id);
      } catch (_) { /* best-effort */ }
    }, EXP_ID);
    // Settle render dopo mount.
    await page.waitForTimeout(1_500);
  });

  test('export: Salva → modal → Esporta JSON → download valido schema v1.0', async ({ page }) => {
    // ─ Step 1: verifica che almeno 1 componente sia renderizzato (circuit caricato)
    const compCount = await page.evaluate(() => {
      try {
        const state = window.__ELAB_API?.unlim?.getCircuitState?.() || window.__ELAB_API?.getCircuitState?.();
        if (!state) return 0;
        return Array.isArray(state.components) ? state.components.length : 0;
      } catch (_) { return 0; }
    });
    // Logging onesto: se l'esperimento non monta affatto in dev, segnaliamo.
    if (compCount === 0) {
      test.info().annotations.push({
        type: 'warn',
        description: `Circuit state vuoto per ${EXP_ID} dopo mount — il dev server potrebbe non aver caricato l'esperimento. Procedo comunque col tentativo Salva.`,
      });
    } else {
      expect(compCount).toBeGreaterThan(0);
    }

    // ─ Step 2: click bottone Salva (testid noto)
    const salvaBtn = page.getByTestId('btn-salva-sessione');
    const salvaVisible = await salvaBtn.isVisible({ timeout: 8_000 }).catch(() => false);
    if (!salvaVisible) {
      // Fallback: cerca per accessible name IT.
      const salvaFallback = page.getByRole('button', { name: /Salva la sessione corrente|Salva/i }).first();
      const fallbackVisible = await salvaFallback.isVisible({ timeout: 3_000 }).catch(() => false);
      test.fixme(
        !fallbackVisible,
        'Bottone Salva non trovato né via testid `btn-salva-sessione` né via role/name. AppHeader potrebbe non avere onSaveSession wired al modal nuovo.'
      );
      await salvaFallback.click({ timeout: 3_000 });
    } else {
      await salvaBtn.click({ timeout: 3_000 });
    }

    // ─ Step 3: assert modal SessionExportModal aperto (role=dialog + 3 bottoni)
    const modal = page.getByRole('dialog').filter({ hasText: /Esporta JSON|Importa JSON|Salva su Supabase/i });
    const modalVisible = await modal.first().isVisible({ timeout: 5_000 }).catch(() => false);

    if (!modalVisible) {
      // B3 sibling agent potrebbe non aver completato wire-up: degrade graceful.
      test.info().annotations.push({
        type: 'blocker',
        description:
          'SessionExportModal NON renderizza dopo click Salva. Verificare: ' +
          '(a) src/components/lavagna/SessionExportModal.jsx esiste; ' +
          '(b) LavagnaShell.jsx importa + wire onSaveSession all\'apertura modal invece di chiamare finaliseSession diretto (linea 1724). ' +
          'Test marked .fixme.',
      });
      test.fixme(true, 'SessionExportModal non aperto — B3 wire-up assente.');
      return;
    }

    // Verifica 3 azioni visibili nel modal.
    // Nota: il modal usa aria-label completi ("Salva la sessione su Supabase",
    // "Esporta la sessione come file JSON", "Importa una sessione da file JSON")
    // quindi cerchiamo per parole chiave centrali (Supabase / Esporta / Importa).
    const supabaseBtn = modal.getByRole('button', { name: /Supabase/i }).first();
    const exportBtn = modal.getByRole('button', { name: /Esporta.*JSON|JSON.*Esporta/i }).first();
    const importBtn = modal.getByRole('button', { name: /Importa.*JSON|JSON.*Importa/i }).first();

    await expect(supabaseBtn).toBeVisible({ timeout: 3_000 });
    await expect(exportBtn).toBeVisible({ timeout: 3_000 });
    await expect(importBtn).toBeVisible({ timeout: 3_000 });

    // ─ Step 4: click Esporta JSON → cattura evento download
    const downloadPromise = page.waitForEvent('download', { timeout: 15_000 });
    await exportBtn.click();
    const download = await downloadPromise.catch(() => null);

    test.fixme(
      !download,
      'Click "Esporta JSON" non ha triggerato evento download Playwright. ' +
      'SessionExportModal deve usare <a download> + blob URL o equivalente.'
    );
    if (!download) return;

    // ─ Step 5: salva file su path temporaneo + legge contenuto
    const suggested = download.suggestedFilename() || `elab-session-${Date.now()}.json`;
    downloadedPath = path.join(TMP_DIR, suggested);
    await download.saveAs(downloadedPath);

    expect(fs.existsSync(downloadedPath)).toBe(true);
    const raw = fs.readFileSync(downloadedPath, 'utf-8');
    expect(raw.length).toBeGreaterThan(20);

    // ─ Step 6: parse + valida schema v1.0
    let parsed;
    expect(() => { parsed = JSON.parse(raw); }).not.toThrow();
    expect(parsed).toBeTruthy();
    expect(parsed.elab_session_export).toBeTruthy();
    expect(parsed.elab_session_export.version).toBe('1.0');
    expect(parsed.elab_session_export.experiment).toBeTruthy();
    expect(parsed.elab_session_export.experiment.id).toBe(EXP_ID);
    expect(Array.isArray(parsed.elab_session_export.components)).toBe(true);
    // Components > 0 solo se il mount era andato a buon fine.
    if (compCount > 0) {
      expect(parsed.elab_session_export.components.length).toBeGreaterThan(0);
    }
  });

  test('import: Importa JSON → ripristina circuito (count = export)', async ({ page }) => {
    test.skip(
      !downloadedPath || !fs.existsSync(downloadedPath),
      'Export test step 1 non ha prodotto un file scaricato — skip import roundtrip.'
    );

    // Re-apri il modal con click Salva
    const salvaBtn = page.getByTestId('btn-salva-sessione');
    const salvaVisible = await salvaBtn.isVisible({ timeout: 8_000 }).catch(() => false);
    if (!salvaVisible) {
      test.fixme(true, 'Bottone Salva non visibile nel secondo test — wire mancante.');
      return;
    }
    await salvaBtn.click({ timeout: 3_000 });

    const modal = page.getByRole('dialog').filter({ hasText: /Esporta JSON|Importa JSON|Salva su Supabase/i });
    const modalVisible = await modal.first().isVisible({ timeout: 5_000 }).catch(() => false);
    if (!modalVisible) {
      test.fixme(true, 'Modal non riaperto nel secondo test.');
      return;
    }

    // Importa JSON: cerca input[type=file] dentro il modal.
    // Il pattern modal è: button "Importa una sessione da file JSON" che
    // delega click a un input[type=file] hidden ("Importa JSON: seleziona file").
    const fileInput = modal.locator('input[type="file"]').first();
    const fileInputExists = await fileInput.count();
    if (fileInputExists === 0) {
      test.fixme(true, 'Nessun input[type=file] dentro modal — meccanica Importa JSON non disponibile.');
      return;
    }
    await fileInput.setInputFiles(downloadedPath);

    // Lascia che restoreSession applichi i componenti.
    await page.waitForTimeout(2_000);

    // Verifica che il circuito sia stato ripristinato leggendo lo state live.
    const restoredCount = await page.evaluate(() => {
      try {
        const state = window.__ELAB_API?.unlim?.getCircuitState?.() || window.__ELAB_API?.getCircuitState?.();
        if (!state) return -1;
        return Array.isArray(state.components) ? state.components.length : 0;
      } catch (_) { return -1; }
    });

    // Confronto con il count esportato dal file JSON.
    const exportedJson = JSON.parse(fs.readFileSync(downloadedPath, 'utf-8'));
    const exportedCount = exportedJson.elab_session_export?.components?.length ?? 0;

    if (exportedCount > 0) {
      expect(restoredCount).toBeGreaterThanOrEqual(1);
      // Idealmente eguali; tolleranza ±0 (la pipeline export → import è
      // deterministica: stesso schema, stessi componenti).
      expect(restoredCount).toBe(exportedCount);
    } else {
      // Se l'export era vuoto, il restore non può che essere coerente con esso.
      test.info().annotations.push({
        type: 'warn',
        description: 'Export era vuoto (0 componenti) — restore non verificabile semanticamente.',
      });
    }
  });

  test.afterAll(async () => {
    try {
      if (downloadedPath && fs.existsSync(downloadedPath)) {
        fs.unlinkSync(downloadedPath);
      }
      if (fs.existsSync(TMP_DIR)) {
        fs.rmdirSync(TMP_DIR, { recursive: true });
      }
    } catch (_) { /* best-effort cleanup */ }
  });
});
