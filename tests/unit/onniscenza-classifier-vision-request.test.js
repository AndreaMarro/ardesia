/**
 * Unit tests for Sprint V iter 43 ATOM A3 — vision_request category.
 *
 * Validates the new "guarda lavagna / vedi circuito / controlla breadboard"
 * regex pattern in onniscenza-classifier.ts. Bug 3 fix: docente asks UNLIM to
 * LOOK at the live lavagna and the classifier must:
 *   1. set category='vision_request',
 *   2. flag triggers_vision_chain=true so chat handler captures screenshot,
 *   3. force topK=2 (kit-anchored focused fetch, not exploratory).
 *
 * 30 fixtures: 15 vision-positive + 15 non-vision controls. Target 30/30 PASS.
 *
 * (c) Andrea Marro 2026-05-06 — ELAB Tutor
 */

import { describe, it, expect } from 'vitest';
import {
  classifyPrompt,
  ONNISCENZA_CLASSIFIER_VERSION,
} from '../../supabase/functions/_shared/onniscenza-classifier.ts';

// ────────────────────────────────────────────────────────────────────────────
// Vision-positive fixtures (15) — must classify as 'vision_request'
// ────────────────────────────────────────────────────────────────────────────

const VISION_POSITIVE = [
  'Guarda la lavagna',
  'Guarda lavagna',
  'Vedi il circuito',
  'Vediamo il circuito sulla breadboard',
  'Controlla la breadboard',
  'Verifica lo schema',
  'Guardate la lavagna ragazzi',
  'Controlliamo il circuito insieme',
  'Verifica il cablaggio',
  'Vedi se il montaggio è giusto',
  'Guarda il kit montato',
  'Verificate lo schema del circuito',
  'Controlla i circuiti collegati',
  'Vedi gli schemi sulla lavagna',
  'Guardiamo la breadboard',
];

// ────────────────────────────────────────────────────────────────────────────
// Non-vision control fixtures (15) — must NOT classify as 'vision_request'
// ────────────────────────────────────────────────────────────────────────────

const NON_VISION = [
  // chit_chat (greeting + short)
  'Ciao',
  'Buongiorno ragazzi',
  // citation
  'Spiega Vol.1 pag.27',
  'Apriamo il Volume 2 pagina 45',
  // plurale_ragazzi (without vision verb+target)
  'Ragazzi adesso montiamo il LED sulla breadboard',
  // deep_question (long + ?)
  'Mi puoi spiegare in dettaglio come funziona la legge di Ohm e perché è importante usare il resistore prima del LED quando colleghiamo la batteria?',
  // safety_warning
  'Pericolo, sento odore di bruciato',
  'Cortocircuito sulla breadboard',
  // default fallback (medium-length statements)
  'Spiega cosa fa la breadboard nei nostri esperimenti',
  'Mostrami il prossimo passo',
  // verbs in non-vision context — must NOT trigger
  'Verifica formale del codice Arduino',     // verifica + non-target
  'Controllo automatico del compilatore',     // controllo (not "controlla")
  'Vedi tu cosa preferisci',                  // vedi + non-target
  'Guarda quanto è bello il colore rosso',    // guarda + non-target
  'Schema scolastico generale',               // schema without verb prefix
];

describe('onniscenza-classifier iter 43 — vision_request positive (15)', () => {
  for (const prompt of VISION_POSITIVE) {
    it(`classifies "${prompt}" as vision_request`, () => {
      const r = classifyPrompt(prompt);
      expect(r.category).toBe('vision_request');
      expect(r.triggers_vision_chain).toBe(true);
      expect(r.skipOnniscenza).toBe(false);
      expect(r.topK).toBe(2);
    });
  }
});

describe('onniscenza-classifier iter 43 — vision_request controls (15 non-vision)', () => {
  for (const prompt of NON_VISION) {
    it(`does NOT classify "${prompt}" as vision_request`, () => {
      const r = classifyPrompt(prompt);
      expect(r.category).not.toBe('vision_request');
      // triggers_vision_chain must be falsy (undefined or false) on non-vision
      expect(Boolean(r.triggers_vision_chain)).toBe(false);
    });
  }
});

describe('onniscenza-classifier iter 43 — version marker preserved', () => {
  it('keeps "iter37" substring in version (test-contract invariant)', () => {
    // tests/unit/onniscenza-classifier.test.js asserts /iter37/ — must hold.
    expect(ONNISCENZA_CLASSIFIER_VERSION).toMatch(/iter37/);
  });

  it('exposes "iter43" marker for vision_request', () => {
    expect(ONNISCENZA_CLASSIFIER_VERSION).toMatch(/iter43/);
  });
});

describe('onniscenza-classifier iter 43 — priority order preserved', () => {
  it('safety_warning still beats vision_request (priority 1)', () => {
    // "Guarda la lavagna pericolo!" — safety wins.
    const r = classifyPrompt('Guarda la lavagna, pericolo!');
    expect(r.category).toBe('safety_warning');
    expect(r.triggers_vision_chain).toBeFalsy();
  });

  it('vision_request beats citation_vol_pag when both present', () => {
    // "Guarda la lavagna a Vol.1 pag.27" — vision wins because the verb
    // explicitly asks to LOOK; citation is contextual reference.
    const r = classifyPrompt('Guarda la lavagna a Vol.1 pag.27');
    expect(r.category).toBe('vision_request');
    expect(r.triggers_vision_chain).toBe(true);
  });
});
