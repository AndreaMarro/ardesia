import { test, expect } from '@playwright/test';
import { bypassWelcomeGate, seedGateBypass } from './helpers/welcome-gate-bypass.js';

test.setTimeout(90_000);
test.describe.configure({ mode: 'serial' });

const REALISTIC_FUMETTO_SCENARIOS = Array.from({ length: 20 }, (_, index) => {
  const n = index + 1;
  const id = String(n).padStart(2, '0');
  const mistakes = [
    'LED invertito: la gamba lunga non era verso il positivo',
    'resistore dimenticato: la corrente non era limitata',
    'jumper spostato su una riga diversa della breadboard',
    'massa non collegata: il circuito restava aperto',
  ];
  const components = ['LED rosso', 'resistore 470 Ohm', 'breadboard', 'batteria 9V'];
  return {
    id,
    uniquePhrase: `prova realistica ${id}`,
    userText: `Ragazzi chiedono aiuto nella prova realistica ${id}: perche il LED non si accende sul kit fisico?`,
    assistantText:
      `Ragazzi, nella prova realistica ${id} abbiamo osservato il kit fisico: ` +
      `${mistakes[index % mistakes.length]}. Ripartiamo da Vol.1 pag.29 e controlliamo ` +
      `${components[index % components.length]}.`,
    mistake: mistakes[index % mistakes.length],
    action: `controllato ${components[(index + 1) % components.length]} nella prova ${n}`,
  };
});

async function gotoFumettoExperiment(page) {
  const baseUrl = process.env.ELAB_E2E_BASE_URL || 'https://www.elabtutor.school';

  await page.route('https://euqpdueopmlllqjmqnyb.supabase.co/functions/v1/unlim-chat', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        response: 'Ragazzi, continuiamo con il kit fisico ELAB.',
        source: 'e2e-fumetto-stub',
      }),
    });
  });
  await page.route('https://elab-galileo.onrender.com/**', (route) => route.abort());

  await seedGateBypass(page);
  await page.goto(`${baseUrl}/#lavagna?exp=v1-cap6-esp1`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await bypassWelcomeGate(page);

  const start = page.getByRole('button', { name: 'Inizia' });
  if (await start.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await start.click();
  }

  await page.waitForFunction(
    () => Boolean(window.__ELAB_API?.mountExperiment || window.__ELAB_API?.loadExperiment),
    null,
    { timeout: 20_000 }
  );
  await page.evaluate(() => {
    window.__ELAB_API?.loadExperiment?.('v1-cap6-esp1');
    window.__ELAB_API?.mountExperiment?.('v1-cap6-esp1');
    window.location.hash = '#lavagna?exp=v1-cap6-esp1';
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.__ELAB_API?.loadExperiment?.('v1-cap6-esp1');
    window.__ELAB_API?.mountExperiment?.('v1-cap6-esp1');
  });
  const picker = page.locator('[role="dialog"][aria-label="Scegli un esperimento"]');
  if (await picker.isVisible({ timeout: 1_000 }).catch(() => false)) {
    await page.evaluate(() => {
      document
        .querySelector('[role="dialog"][aria-label="Scegli un esperimento"] button[aria-label="Chiudi"]')
        ?.click();
    });
    await page.waitForTimeout(300);
  }

  await expect(
    page.getByRole('button', { name: 'Apri Fumetto Report della sessione' })
  ).toBeVisible({ timeout: 10_000 });
  await expect(
    page.getByRole('button', { name: /Esperimento: .*Accendi il tuo primo LED/i })
  ).toBeVisible({ timeout: 10_000 });
}

async function seedRealisticFumettoSession(page, scenario, experimentId = 'v1-cap6-esp1') {
  await page.evaluate(({ scenario: s, experimentId: expId }) => {
    const now = new Date();
    const start = new Date(now.getTime() - 18 * 60 * 1000).toISOString();
    const end = now.toISOString();
    localStorage.setItem('elab_unlim_sessions', JSON.stringify([{
      id: `sess_realistic_${s.id}_${expId}`,
      experimentId: expId,
      classKey: 'classe-realistica-fumetto',
      studentAlias: 'Classe ELAB',
      startTime: start,
      endTime: end,
      messages: [
        { role: 'user', text: s.userText, timestamp: start },
        { role: 'assistant', text: s.assistantText, timestamp: end },
      ],
      actions: [
        { type: 'experiment_loaded', detail: expId, timestamp: start },
        { type: 'kit_check', detail: s.action, timestamp: end },
      ],
      errors: [
        { type: 'other', detail: s.mistake, timestamp: end },
      ],
      summary: `Sessione realistica ${s.id}`,
    }]));
    localStorage.removeItem('elab_session_history');
  }, { scenario, experimentId });
}

async function clickCliffhangerAndAssertNextExperiment(page, modal) {
  await page
    .getByRole('button', { name: /Andiamo al prossimo esperimento Vol\.1 cap\.6/i })
    .click();

  await expect(modal).toHaveCount(0);
  await expect.poll(
    () => page.evaluate(() => window.location.hash),
    { timeout: 20_000 }
  ).toContain('exp=v1-cap6-esp2');
}

test.describe('Fumetto flow iter 36 Atom A7 (gate refactor iter 37 Phase 3)', () => {
  test('Fumetto button renders visible in-page comic and cliffhanger mounts next experiment', async ({ page }) => {
    await gotoFumettoExperiment(page);
    await seedRealisticFumettoSession(page, REALISTIC_FUMETTO_SCENARIOS[0]);

    await page.getByRole('button', { name: 'Apri Fumetto Report della sessione' }).click({ force: true });

    const modal = page.getByTestId('session-report-comic-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Ragazzi, ecco cosa abbiamo fatto oggi!');
    await expect(modal).toContainText('Esercizi sul kit fisico');
    await expect(modal).toContainText('Domande a crocette');
    await expect(modal).toContainText('Spazio appunti');
    await expect(modal).toContainText('Pagina diario della classe');
    await expect(modal).toContainText('Ragazzi, il fumetto non finisce qui.');
    await expect(modal.locator('figure[aria-label*="ancora da svolgere"]')).toHaveCount(0);

    await clickCliffhangerAndAssertNextExperiment(page, modal);
  });

  test('Fumetto disabled when 0 messages (graceful)', async ({ page }) => {
    // edge case — should disable button OR show stub fallback
    await gotoFumettoExperiment(page);
    await page.evaluate(() => {
      try {
        // Surgical: drop only chat-state, keep gate seeds (license/consent).
        localStorage.removeItem('elab_unlim_sessions');
        localStorage.removeItem('elab_session_history');
      } catch (_e) { /* */ }
    });

    const fumettoBtn = page.getByRole('button', { name: 'Apri Fumetto Report della sessione' });
    const isDisabled = await fumettoBtn.isDisabled().catch(() => false);

    // Either disabled (graceful) OR generates stub (acceptable)
    if (!isDisabled) {
      await fumettoBtn.click({ force: true });
      await expect(page.getByText('Ragazzi, ecco cosa abbiamo fatto oggi!')).toBeVisible();
      await expect(page.getByText('Errore nella generazione del Fumetto')).toHaveCount(0);
    }
  });

  test('Fumetto ignores saved sessions from a different experiment', async ({ page }) => {
    await gotoFumettoExperiment(page);
    await seedRealisticFumettoSession(page, {
      id: 'alien',
      uniquePhrase: 'prova aliena da non mostrare',
      userText: 'Ragazzi, questa sessione appartiene a un altro esperimento.',
      assistantText: 'Ragazzi, prova aliena da non mostrare nel fumetto corrente.',
      mistake: 'errore di un altro esperimento',
      action: 'azione di un altro esperimento',
    }, 'v1-cap6-esp2');

    await page.getByRole('button', { name: 'Apri Fumetto Report della sessione' }).click({ force: true });

    const modal = page.getByTestId('session-report-comic-modal');
    await expect(modal).toBeVisible();
    await expect(modal).not.toContainText('prova aliena da non mostrare');
    await expect(modal).toContainText('Accendi il tuo primo LED');
    await expect(modal.locator('figure[aria-label*="ancora da svolgere"]')).toHaveCount(0);
  });
});

test.describe('Fumetto flow — 20 realistic unique session scenarios', () => {
  for (const scenario of REALISTIC_FUMETTO_SCENARIOS) {
    test(`unique didactic comic from saved session ${scenario.id}`, async ({ page }) => {
      await gotoFumettoExperiment(page);
      await seedRealisticFumettoSession(page, scenario);

      await page.getByRole('button', { name: 'Apri Fumetto Report della sessione' }).click({ force: true });

      const modal = page.getByTestId('session-report-comic-modal');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Ragazzi, ecco cosa abbiamo fatto oggi!');
      await expect(modal).toContainText(scenario.uniquePhrase);
      await expect(modal).toContainText('Esercizi sul kit fisico');
      await expect(modal).toContainText('Domande a crocette');
      await expect(modal).toContainText('Spazio appunti');
      await expect(modal).toContainText('Pagina diario della classe');
      await expect(modal).toContainText('UNLIM');
      await expect(modal).toContainText('Ragazzi, il fumetto non finisce qui.');
      await expect(modal.locator('figure[aria-label*="ancora da svolgere"]')).toHaveCount(0);
      await expect(page.getByText('Errore nella generazione del Fumetto')).toHaveCount(0);

      await clickCliffhangerAndAssertNextExperiment(page, modal);
    });
  }
});
