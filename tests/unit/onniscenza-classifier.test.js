/**
 * Unit tests for onniscenza-classifier.ts (Sprint T iter 37 Atom A2).
 *
 * Validates pre-LLM regex classifier behavior matrix:
 *   - chit_chat (skip onniscenza, save ~500-1000ms latency)
 *   - safety_warning, deep_question, citation_vol_pag, plurale_ragazzi (keep)
 *   - default fallback
 *
 * NO LLM call. Pure regex + word count. Defensive: never throws.
 *
 * Reference: PDR-ITER-37-LATENCY-LIFT-DEPLOY-VERIFY.md §3 Atom A2.
 *
 * (c) Andrea Marro 2026-04-30 — ELAB Tutor
 */

import { describe, it, expect } from 'vitest';

// Use relative import — Deno-style ".ts" suffix is resolvable via vitest's
// TypeScript loader (esbuild). The shared module has zero Deno-only deps so
// it imports cleanly under Node + Vitest.
import {
  classifyPrompt,
  countWords,
  ONNISCENZA_CLASSIFIER_VERSION,
} from '../../supabase/functions/_shared/onniscenza-classifier.ts';

describe('onniscenza-classifier — countWords', () => {
  it('returns 0 for null / undefined / empty', () => {
    expect(countWords(null)).toBe(0);
    expect(countWords(undefined)).toBe(0);
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });

  it('counts simple word boundaries', () => {
    expect(countWords('Ciao ragazzi')).toBe(2);
    expect(countWords('Spiega cos\'è un LED')).toBe(4);
  });

  it('strips AZIONE / INTENT tags before counting', () => {
    expect(countWords('Ciao [AZIONE:loadexp:v3-cap6-esp1] ragazzi')).toBe(2);
    expect(countWords('Spiega [INTENT:{"tool":"x"}] LED')).toBe(2);
  });

  it('strips markdown punctuation before counting', () => {
    expect(countWords('**Ciao** _ragazzi_ `LED`')).toBe(3);
  });
});

describe('onniscenza-classifier — chit_chat (skip onniscenza)', () => {
  it('classifies short greeting as chit_chat with skipOnniscenza=true', () => {
    const r = classifyPrompt('Ciao');
    expect(r.category).toBe('chit_chat');
    expect(r.skipOnniscenza).toBe(true);
    expect(r.topK).toBe(0);
  });

  it('classifies "salve" greeting as chit_chat', () => {
    expect(classifyPrompt('Salve!').category).toBe('chit_chat');
  });

  it('classifies "grazie" as chit_chat', () => {
    expect(classifyPrompt('Grazie mille').category).toBe('chit_chat');
  });

  it('classifies multi-word greeting under 8 words as chit_chat', () => {
    const r = classifyPrompt('Ciao buongiorno come va oggi');
    expect(r.category).toBe('chit_chat');
    expect(r.skipOnniscenza).toBe(true);
  });

  it('handles empty/whitespace as chit_chat (zero words)', () => {
    expect(classifyPrompt('').category).toBe('chit_chat');
    expect(classifyPrompt('   ').category).toBe('chit_chat');
    expect(classifyPrompt(null).category).toBe('chit_chat');
  });

  it('does NOT trigger chit_chat on partial-word match (avoid false positives)', () => {
    // "ciaologico" must NOT match (\b boundary), but it's also clearly
    // not a greeting — falls to default with topK=3.
    const r = classifyPrompt('ciaologico discussione approfondita');
    expect(r.category).not.toBe('chit_chat');
  });
});

describe('onniscenza-classifier — safety_warning (top priority)', () => {
  it('classifies "pericolo" as safety_warning', () => {
    const r = classifyPrompt('Pericolo, sento odore di bruciato');
    expect(r.category).toBe('safety_warning');
    expect(r.skipOnniscenza).toBe(false);
    expect(r.topK).toBe(3);
  });

  it('classifies "scossa" as safety_warning', () => {
    expect(classifyPrompt('Ho preso la scossa').category).toBe('safety_warning');
  });

  it('classifies "bruciato" / "brucia" as safety_warning', () => {
    expect(classifyPrompt('il LED è bruciato').category).toBe('safety_warning');
    expect(classifyPrompt('il filo brucia').category).toBe('safety_warning');
  });

  it('classifies "cortocircuito" as safety_warning', () => {
    expect(classifyPrompt('cortocircuito sulla breadboard').category).toBe('safety_warning');
  });

  it('safety beats short greeting (priority 1)', () => {
    // "Ciao pericolo" — greeting + safety. Safety wins.
    const r = classifyPrompt('Ciao pericolo!');
    expect(r.category).toBe('safety_warning');
    expect(r.skipOnniscenza).toBe(false);
  });
});

describe('onniscenza-classifier — citation_vol_pag (top-2)', () => {
  it('classifies "Vol.1 pag.27" as citation_vol_pag with topK=2', () => {
    const r = classifyPrompt('Spiega Vol.1 pag.27');
    expect(r.category).toBe('citation_vol_pag');
    expect(r.skipOnniscenza).toBe(false);
    expect(r.topK).toBe(2);
  });

  it('matches "Volume 2 pagina 45" prose form', () => {
    const r = classifyPrompt('Apriamo il Volume 2 pagina 45');
    expect(r.category).toBe('citation_vol_pag');
  });

  it('matches "vol 3" without dot', () => {
    expect(classifyPrompt('vediamo vol 3 esercizio').category).toBe('citation_vol_pag');
  });

  it('matches "p. 12" abbreviation', () => {
    // Note: SAFETY_RE has priority; avoid safety keywords in fixture.
    expect(classifyPrompt('rileggi p. 12 con calma').category).toBe('citation_vol_pag');
  });
});

describe('onniscenza-classifier — plurale_ragazzi (top-2)', () => {
  it('classifies "ragazzi" plural marker as plurale_ragazzi with topK=2', () => {
    const r = classifyPrompt('Adesso ragazzi montiamo il LED sulla breadboard');
    expect(r.category).toBe('plurale_ragazzi');
    expect(r.skipOnniscenza).toBe(false);
    expect(r.topK).toBe(2);
  });

  it('matches "ragazze" feminine plural too', () => {
    // Sprint V iter 43 ATOM A3 — vision_request beats plurale when prompt has both
    // (guardate + circuito triggers vision_request first). Non-vision context tests plurale.
    expect(classifyPrompt('Ragazze e ragazzi oggi facciamo elettronica insieme').category).toBe('plurale_ragazzi');
  });

  it('does NOT match singular "ragazzo" / "ragazza"', () => {
    const r = classifyPrompt('Quel ragazzo ha collegato male il filo');
    expect(r.category).not.toBe('plurale_ragazzi');
  });
});

describe('onniscenza-classifier — deep_question (top-3)', () => {
  it('classifies long question as deep_question with topK=3', () => {
    const text =
      'Mi puoi spiegare in dettaglio come funziona la legge di Ohm e perché ' +
      'è importante usare il resistore prima del LED quando colleghiamo ' +
      'la batteria nove volt al circuito sulla breadboard?';
    const r = classifyPrompt(text);
    expect(r.category).toBe('deep_question');
    expect(r.topK).toBe(3);
    expect(r.skipOnniscenza).toBe(false);
  });

  it('does NOT classify short question as deep_question', () => {
    const r = classifyPrompt('Cos\'è un LED?');
    // Short question → default (5 words, has '?' but <20 words)
    expect(r.category).not.toBe('deep_question');
  });

  it('long statement WITHOUT "?" is NOT deep_question', () => {
    const text =
      'Stiamo costruendo un circuito completo con LED resistore e batteria ' +
      'come spiegato in classe seguendo le istruzioni del libro stampato.';
    const r = classifyPrompt(text);
    expect(r.category).not.toBe('deep_question');
    expect(r.category).toBe('default');
  });
});

describe('onniscenza-classifier — default fallback (top-3)', () => {
  it('classifies medium-length statement as default with topK=3', () => {
    const r = classifyPrompt('Spiega cosa fa la breadboard nei nostri esperimenti');
    expect(r.category).toBe('default');
    expect(r.topK).toBe(3);
    expect(r.skipOnniscenza).toBe(false);
  });

  it('preserves topK=3 on uncertain inputs (safer default)', () => {
    const r = classifyPrompt('Mostrami il prossimo passo');
    expect(r.topK).toBe(3);
  });
});

describe('onniscenza-classifier — defensive', () => {
  it('never throws on weird inputs', () => {
    expect(() => classifyPrompt('🎉🎊🚀')).not.toThrow();
    expect(() => classifyPrompt('a'.repeat(10000))).not.toThrow();
    expect(() => classifyPrompt('\n\t   \r\n')).not.toThrow();
  });

  it('classifies pure emoji as chit_chat (zero word count)', () => {
    // Emoji-only is essentially silence — treat as chit_chat skip.
    // Word boundary regex sees \w+ — emoji are not word chars.
    const r = classifyPrompt('🎉');
    expect(r.skipOnniscenza).toBe(true);
  });

  it('exposes version marker', () => {
    expect(ONNISCENZA_CLASSIFIER_VERSION).toMatch(/iter37/);
  });
});
