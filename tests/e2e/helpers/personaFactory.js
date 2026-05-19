/**
 * persona seed factory iter 83 FASE 1 real-user simulation.
 * 6 personas distinte come da Andrea mandate Sub-project D.
 */

export const PERSONAS = {
  DOCENTE_LIM: {
    id: 'docente-lim',
    label: 'Docente non-tecnico su LIM 65-86"',
    viewport: { width: 3840, height: 2160 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    consent: { age: 35, status: 'accepted' },
    motorAbility: 'normal',
    visionAbility: 'normal',
  },
  DOCENTE_LAPTOP: {
    id: 'docente-laptop',
    label: 'Docente su laptop 1366x768',
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    consent: { age: 35, status: 'accepted' },
    motorAbility: 'normal',
    visionAbility: 'normal',
  },
  STUDENTE_8_14: {
    id: 'studente-8-14',
    label: 'Studente 8-14 guarda LIM',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    consent: { age: 10, status: 'parental_verified' },
    motorAbility: 'normal',
    visionAbility: 'normal',
  },
  KEYBOARD_ONLY: {
    id: 'keyboard-only',
    label: 'Utente solo tastiera',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    consent: { age: 35, status: 'accepted' },
    motorAbility: 'keyboard-only',
    visionAbility: 'normal',
    forbidMouseInput: true,
  },
  LOW_VISION: {
    id: 'low-vision',
    label: 'Utente bassa visione (zoom 200% + high contrast)',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
    consent: { age: 35, status: 'accepted' },
    motorAbility: 'normal',
    visionAbility: 'low-vision',
    zoomLevel: 2.0,
    forceHighContrast: true,
  },
  MOTOR_DIFFICULTY: {
    id: 'motor-difficulty',
    label: 'Utente difficoltà motorie',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: true,
    consent: { age: 35, status: 'accepted' },
    motorAbility: 'limited',
    visionAbility: 'normal',
    requireMinTouchTarget: 44,
  },
};

export async function seedPersonaConsent(page, persona) {
  await page.addInitScript((p) => {
    try {
      localStorage.setItem('elab_gdpr_consent', JSON.stringify({
        status: p.consent.status,
        timestamp: new Date().toISOString(),
        version: '1.0',
      }));
      localStorage.setItem('elab_consent_v2', p.consent.status === 'parental_verified' ? 'accepted' : p.consent.status);
      sessionStorage.setItem('elab_user_age', String(p.consent.age));
    } catch (_) { /* defensive */ }
  }, persona);
}

export async function gotoWithPersona(page, persona, baseUrl) {
  await page.setViewportSize(persona.viewport);
  await seedPersonaConsent(page, persona);
  await page.goto(`${baseUrl}/#compile-home`, { waitUntil: 'domcontentloaded' });
  if (persona.forceHighContrast) {
    await page.emulateMedia({ forcedColors: 'active' });
  }
  if (persona.zoomLevel && persona.zoomLevel > 1.0) {
    await page.evaluate((zoom) => { document.body.style.zoom = String(zoom); }, persona.zoomLevel);
  }
}
