// © Andrea Marro — 18/05/2026 — ELAB Tutor — Tutti i diritti riservati
import { test, expect } from '@playwright/test';
import { bypassWelcomeGate, seedGateBypass } from './helpers/welcome-gate-bypass.js';

const MORPHIC_EXP_PATH = '/#lavagna?exp=v1-cap6-esp1';

async function gotoPercorsoExperiment(page) {
  await seedGateBypass(page);
  await page.goto(MORPHIC_EXP_PATH);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await bypassWelcomeGate(page);
  await expect(page.getByTestId('modalita-switch')).toBeAttached({ timeout: 15_000 });
}

async function seedMorphic(page, teacherId, classKey, teacherProfile, classProfile, state = 'intro') {
  await page.addInitScript(({ teacherId, classKey, teacherProfile, classProfile, state }) => {
    window.localStorage.setItem('elab-teacher-anon-uuid', teacherId);
    window.localStorage.setItem('elab-class-key', classKey);
    window.localStorage.setItem(`elab-morphic-teacher-profile:${teacherId}`, JSON.stringify(teacherProfile));
    window.localStorage.setItem(`elab-morphic-class-profile:${classKey}`, JSON.stringify(classProfile));
    window.localStorage.setItem('elab-percorso-session-state', state);
    window.localStorage.setItem('elab-lavagna-last-expId', 'v1-cap6-esp1');
  }, { teacherId, classKey, teacherProfile, classProfile, state });
}

test.describe('08 Percorso morfica flow', () => {
  test('docente A esperto rende Percorso con profilo esperto', async ({ page }) => {
    await seedMorphic(page, 'teacher-a', 'classe-led', { experience: 'expert' }, { age: 14, kit: 'advanced', competence: 'expert' }, 'verifica');
    await gotoPercorsoExperiment(page);

    await expect(page.getByTestId('modalita-btn-percorso')).toHaveAttribute('data-morphic-profile', 'esperto');
    await expect(page.getByTestId('modalita-switch')).toHaveAttribute('data-stato-sessione', 'verifica');
  });

  test('docente B primo anno rende Percorso con profilo primo anno', async ({ page }) => {
    await seedMorphic(page, 'teacher-b', 'classe-led', { experience: 'first_year' }, { age: 8, kit: 'base', competence: 'novice' }, 'intro');
    await gotoPercorsoExperiment(page);

    await expect(page.getByTestId('modalita-btn-percorso')).toHaveAttribute('data-morphic-profile', 'primo-anno');
    await expect(page.getByTestId('modalita-switch')).toHaveAttribute('data-stato-sessione', 'intro');
  });

  test('stesso esperimento docente A/B produce cue morfico diverso', async ({ browser }) => {
    // Iter 83 sub-iter 83.5 M3 fix: usa browser.newContext() per isolare localStorage tra pageA/pageB
    // (browser.newPage() condivide default context con localStorage bleeding).
    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await seedMorphic(pageA, 'teacher-a', 'classe-led', { experience: 'expert' }, { age: 14, kit: 'advanced', competence: 'expert' }, 'verifica');
    await gotoPercorsoExperiment(pageA);
    const expertProfile = await pageA.getByTestId('modalita-btn-percorso').getAttribute('data-morphic-profile');
    await contextA.close();

    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await seedMorphic(pageB, 'teacher-b', 'classe-base', { experience: 'first_year' }, { age: 8, kit: 'base', competence: 'novice' }, 'intro');
    await gotoPercorsoExperiment(pageB);
    const firstYearProfile = await pageB.getByTestId('modalita-btn-percorso').getAttribute('data-morphic-profile');
    await contextB.close();

    expect(expertProfile).toBe('esperto');
    expect(firstYearProfile).toBe('primo-anno');
  });

  test('stato sessione costruzione aggiorna il cue visibile', async ({ page }) => {
    await seedMorphic(page, 'teacher-c', 'classe-led', { experience: 'standard' }, { age: 10, kit: 'base' }, 'costruzione');
    await gotoPercorsoExperiment(page);

    await expect(page.getByTestId('modalita-btn-percorso')).toHaveAttribute('data-session-cue', 'costruzione');
  });

  test('Percorso resta default first anche con profilo morfico runtime', async ({ page }) => {
    await seedMorphic(page, 'teacher-a', 'classe-led', { experience: 'expert' }, { age: 14, kit: 'advanced' }, 'report');
    await gotoPercorsoExperiment(page);

    const firstTab = page.getByRole('tab').first();
    await expect(firstTab).toContainText('Percorso');
    await expect(page.getByTestId('modalita-switch')).toHaveAttribute('data-stato-sessione', 'report');
  });
});
