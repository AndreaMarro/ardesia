/**
 * Unit tests for Sprint U iter 25 P0-C off-topic category expansion.
 *
 * Two surfaces under test:
 *   1. `classifyPrompt` — new `off_topic` PromptCategory + `offtopicType`
 *      field populated when category matches.
 *   2. `buildOfftopicGentleBridge` — deterministic 3-step template
 *      (acknowledge / bridge / recall|proposta) with PRINCIPIO ZERO
 *      compliance (plurale "Ragazzi," + Vol/pag verbatim + ≤120 parole).
 *
 * Cat D 37.5% regression context (iter 24 dim-1 LIVE prod bench): LLM was
 * answering history/cooking/translation/celebrity content directly instead
 * of applying the gentle bridge. This iter 25 fix short-circuits PRE-LLM
 * via the classifier + template (no LLM call), restoring the canonical
 * 91.80% baseline from iter 5 P3.
 *
 * ZERO LLM call assertion: no `fetch` import, no network mocking required.
 * Pure function tests that complete in <50ms each.
 *
 * (c) Andrea Marro 2026-05-11 — ELAB Tutor
 */

import { describe, it, expect, vi } from 'vitest';
import {
  classifyPrompt,
  classifyOfftopicType,
} from '../../supabase/functions/_shared/onniscenza-classifier.ts';
import {
  buildOfftopicGentleBridge,
  OFFTOPIC_TEMPLATE_VERSION,
} from '../../supabase/functions/_shared/offtopic-template-response.ts';

// ----------------------------------------------------------------------------
// SECTION 1 — off_topic category detection (10 macro-clusters)
// ----------------------------------------------------------------------------

describe('classifier — off_topic category detection', () => {
  it('detects sport (calcio / Serie A / squadre)', () => {
    const r = classifyPrompt('Chi ha vinto la partita di calcio Inter Juventus?');
    expect(r.category).toBe('off_topic');
    expect(r.skipOnniscenza).toBe(true);
    expect(r.topK).toBe(0);
    expect(r.offtopicType).toBe('sport');
  });

  it('detects math arithmetic (quanto fa 5+7 / teorema / equazione)', () => {
    // NB: omit "ragazzi" — plurale_ragazzi check (step 4) runs BEFORE off_topic
    // (step 5.5). This is intentional: plural-addressed prompts should keep
    // top-2 onniscenza, not be redirected.
    const r1 = classifyPrompt('Quanto fa 12+8 nella formula matematica?');
    expect(r1.category).toBe('off_topic');
    expect(r1.offtopicType).toBe('math');

    const r2 = classifyPrompt('Spiegami il teorema di Pitagora');
    expect(r2.category).toBe('off_topic');
    expect(r2.offtopicType).toBe('math');
  });

  it('detects history / geography (presidente / capitale Francia / guerra mondiale)', () => {
    const r1 = classifyPrompt('Chi è il presidente della Repubblica Italiana?');
    expect(r1.category).toBe('off_topic');
    expect(r1.offtopicType).toBe('history');

    const r2 = classifyPrompt('Qual è la capitale Francia?');
    expect(r2.category).toBe('off_topic');
    expect(r2.offtopicType).toBe('history');

    const r3 = classifyPrompt('Quando è iniziata la seconda guerra mondiale?');
    expect(r3.category).toBe('off_topic');
    expect(r3.offtopicType).toBe('history');
  });

  it('detects culture / entertainment (cinema / film Marvel / serie Netflix)', () => {
    const r1 = classifyPrompt('Avete visto il nuovo film Marvel?');
    expect(r1.category).toBe('off_topic');
    expect(r1.offtopicType).toBe('culture');

    const r2 = classifyPrompt('Mi piace la serie Netflix Stranger Things');
    expect(r2.category).toBe('off_topic');
    expect(r2.offtopicType).toBe('culture');
  });

  it('detects cooking (ricetta / cucina / ingredienti)', () => {
    const r = classifyPrompt('Qual è la ricetta della pasta carbonara?');
    expect(r.category).toBe('off_topic');
    expect(r.offtopicType).toBe('cooking');

    const r2 = classifyPrompt('Quali ingredienti servono per la pizza?');
    expect(r2.category).toBe('off_topic');
    expect(r2.offtopicType).toBe('cooking');
  });

  it('detects translation (traduci / come si dice in inglese)', () => {
    const r1 = classifyPrompt('Traduci questa frase in inglese');
    expect(r1.category).toBe('off_topic');
    expect(r1.offtopicType).toBe('translation');

    // NB: avoid "buongiorno" / "ciao" inside the example string — those
    // tokens trigger the chit_chat greeting branch which runs BEFORE
    // off_topic. Test the translation cluster with a clean phrase.
    const r2 = classifyPrompt('Come si dice in francese il colore rosso?');
    expect(r2.category).toBe('off_topic');
    expect(r2.offtopicType).toBe('translation');
  });

  it('detects celebrity / politics (cantante / attore / elezione)', () => {
    const r1 = classifyPrompt('Chi è il cantante più famoso del 2026?');
    expect(r1.category).toBe('off_topic');
    expect(r1.offtopicType).toBe('celebrity');

    const r2 = classifyPrompt('Quando sono le prossime elezioni?');
    expect(r2.category).toBe('off_topic');
    expect(r2.offtopicType).toBe('celebrity');
  });

  it('detects videogames (pokemon / videogiochi)', () => {
    const r1 = classifyPrompt('Avete visto il nuovo Pokemon?');
    expect(r1.category).toBe('off_topic');
    // pokemon → culture cluster
    expect(r1.offtopicType).toBe('culture');
  });

  it('detects social media (tiktok / instagram / youtube)', () => {
    const r1 = classifyPrompt('Mi piace la musica di TikTok');
    expect(r1.category).toBe('off_topic');
    // tiktok matches culture sub-cluster
    expect(r1.offtopicType).toBe('culture');
  });

  it('PRESERVES legit ELAB topics (does NOT misclassify "storia dell elettronica")', () => {
    // Negative lookahead excludes "storia del/della/dei elettronica/arduino"
    const r = classifyPrompt('Raccontami la storia dell elettronica');
    expect(r.category).not.toBe('off_topic');
  });

  it('PRESERVES "teorema di Kirchhoff" (legit ELAB)', () => {
    const r = classifyPrompt('Spiegate il teorema di Kirchhoff');
    expect(r.category).not.toBe('off_topic');
  });
});

// ----------------------------------------------------------------------------
// SECTION 2 — buildOfftopicGentleBridge 3-step template (7 type variants)
// ----------------------------------------------------------------------------

describe('buildOfftopicGentleBridge — 7 type variants 3-step pattern', () => {
  const types = [
    'sport',
    'math',
    'history',
    'culture',
    'cooking',
    'translation',
    'celebrity',
  ];

  for (const t of types) {
    it(`type=${t} emits acknowledge + bridge + recall/proposta (3 steps)`, () => {
      const out = buildOfftopicGentleBridge(t);
      // Step 1: acknowledge — plurale "Ragazzi,"
      expect(out).toMatch(/^Ragazzi,/);
      // Step 2: bridge — canonical sentence
      expect(out).toContain('Però adesso siamo dentro il nostro percorso ELAB');
      expect(out).toContain('elettronica e Arduino');
      // Step 3: proposta fallback (no session → first LED Vol.1 cap.6)
      expect(out).toContain('Vol.1 cap.6');
    });
  }

  it('type-specific acknowledge differs (sport vs cooking vs translation)', () => {
    const sport = buildOfftopicGentleBridge('sport');
    const cooking = buildOfftopicGentleBridge('cooking');
    const translation = buildOfftopicGentleBridge('translation');

    expect(sport).toContain('passione per lo sport');
    expect(cooking).toContain('cucina');
    expect(translation).toContain('linguistica');
    // All three differ
    expect(sport).not.toBe(cooking);
    expect(cooking).not.toBe(translation);
  });
});

// ----------------------------------------------------------------------------
// SECTION 3 — sessionContext recall vs fallback
// ----------------------------------------------------------------------------

describe('buildOfftopicGentleBridge — session context handling', () => {
  it('emits recall with Vol/cap citation when sessionContext is full', () => {
    const out = buildOfftopicGentleBridge('sport', {
      lastExperimentId: 'v1-cap6-esp1',
      currentVolume: 1,
      currentChapter: 6,
    });
    expect(out).toContain('Stavamo lavorando su v1-cap6-esp1');
    expect(out).toContain('Vol.1 cap.6');
    expect(out).toContain('[AZIONE:loadexp:v1-cap6-esp1]');
    // No fallback proposta
    expect(out).not.toContain('Volete iniziare un esperimento');
  });

  it('emits fallback LED Vol.1 cap.6 when sessionContext is absent', () => {
    const out = buildOfftopicGentleBridge('math', null);
    expect(out).toContain('Volete iniziare un esperimento sul kit ELAB');
    expect(out).toContain('primo LED del Vol.1 cap.6');
    expect(out).not.toContain('Stavamo lavorando');
  });

  it('emits fallback when sessionContext lacks lastExperimentId', () => {
    const out = buildOfftopicGentleBridge('history', { currentVolume: 2 });
    expect(out).toContain('Volete iniziare un esperimento');
    expect(out).toContain('Vol.1 cap.6');
  });

  it('uses "?" placeholder when volume/chapter missing but experiment present', () => {
    const out = buildOfftopicGentleBridge('culture', {
      lastExperimentId: 'v2-cap3-esp2',
    });
    expect(out).toContain('Stavamo lavorando su v2-cap3-esp2');
    expect(out).toContain('Vol.? cap.?');
  });
});

// ----------------------------------------------------------------------------
// SECTION 4 — PRINCIPIO ZERO compliance enforcement
// ----------------------------------------------------------------------------

describe('buildOfftopicGentleBridge — PRINCIPIO ZERO compliance', () => {
  it('ALWAYS opens with plurale "Ragazzi," (all 8 types)', () => {
    const allTypes = ['sport', 'math', 'history', 'culture', 'cooking', 'translation', 'celebrity', 'generic'];
    for (const t of allTypes) {
      const out = buildOfftopicGentleBridge(t);
      expect(out.startsWith('Ragazzi,'), `type=${t} missing Ragazzi opener`).toBe(true);
    }
  });

  it('respects 120-word max on every variant (with session recall)', () => {
    const allTypes = ['sport', 'math', 'history', 'culture', 'cooking', 'translation', 'celebrity', 'generic'];
    for (const t of allTypes) {
      const out = buildOfftopicGentleBridge(t, {
        lastExperimentId: 'v3-cap8-serial',
        currentVolume: 3,
        currentChapter: 8,
      });
      const wc = out.split(/\s+/).filter((w) => w.length > 0).length;
      expect(wc, `type=${t} exceeded 120 words (${wc})`).toBeLessThanOrEqual(120);
    }
  });

  it('contains Vol/pag citation VERBATIM in recall path', () => {
    const out = buildOfftopicGentleBridge('sport', {
      lastExperimentId: 'v2-cap4-esp3',
      currentVolume: 2,
      currentChapter: 4,
    });
    // Strict verbatim pattern "Vol.X cap.Y"
    expect(out).toMatch(/Vol\.2 cap\.4/);
  });
});

// ----------------------------------------------------------------------------
// SECTION 5 — ZERO LLM call assertion (deterministic)
// ----------------------------------------------------------------------------

describe('buildOfftopicGentleBridge — ZERO LLM call', () => {
  it('does NOT invoke global fetch (pure template substitution)', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      throw new Error('fetch should NEVER be called by template');
    });
    try {
      const out = buildOfftopicGentleBridge('sport', {
        lastExperimentId: 'v1-cap6-esp1',
        currentVolume: 1,
        currentChapter: 6,
      });
      expect(out).toBeTruthy();
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('is deterministic — same input → same output', () => {
    const a = buildOfftopicGentleBridge('math', null);
    const b = buildOfftopicGentleBridge('math', null);
    const c = buildOfftopicGentleBridge('math', null);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });
});

// ----------------------------------------------------------------------------
// SECTION 6 — edge cases (defensive)
// ----------------------------------------------------------------------------

describe('buildOfftopicGentleBridge — edge cases', () => {
  it('degrades unknown type to generic acknowledge', () => {
    const out = buildOfftopicGentleBridge('unknown-future-type');
    expect(out).toContain('Ragazzi, è una bella curiosità');
  });

  it('handles null offtopicType → generic', () => {
    const out = buildOfftopicGentleBridge(null);
    expect(out.startsWith('Ragazzi,')).toBe(true);
  });

  it('handles undefined offtopicType → generic', () => {
    const out = buildOfftopicGentleBridge(undefined);
    expect(out.startsWith('Ragazzi,')).toBe(true);
  });

  it('classifyOfftopicType returns generic for empty string', () => {
    expect(classifyOfftopicType('')).toBe('generic');
  });

  it('classifyOfftopicType returns generic for whitespace', () => {
    expect(classifyOfftopicType('   ')).toBe('generic');
  });

  it('classifyOfftopicType is case-insensitive (mixed case)', () => {
    expect(classifyOfftopicType('CALCIO INTER')).toBe('sport');
    expect(classifyOfftopicType('Ricetta Carbonara')).toBe('cooking');
    expect(classifyOfftopicType('TRADUCI questa frase')).toBe('translation');
  });

  it('classifier returns off_topic for mixed-case input', () => {
    const r = classifyPrompt('CHI HA VINTO LA PARTITA DELL INTER?');
    expect(r.category).toBe('off_topic');
    expect(r.offtopicType).toBe('sport');
  });

  it('exposes template version marker', () => {
    expect(OFFTOPIC_TEMPLATE_VERSION).toMatch(/iter25/);
  });
});
