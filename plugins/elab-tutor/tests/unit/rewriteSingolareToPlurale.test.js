/**
 * Unit tests rewriteSingolareToPlurale (Sprint V iter 40).
 *
 * Validates runtime singolare → plurale post-LLM rewriter:
 *   - 22 transformations (pronouns + verbs + compounds)
 *   - Protected regions: «book quotes», [AZIONE:...], [INTENT:...], ```code```
 *   - Case preservation (capital → capital)
 *   - Word boundary respect (don't rewrite "ti" in "tipologia")
 *
 * Reference: Andrea screenshot 2026-05-12 PM "Con Arduino puoi dosare"
 * CLAUDE.md iter 21+ mandate carryover 200 violations files-codemod.
 * (c) Andrea Marro — 2026-05-12 — ELAB Tutor Sprint V iter 40
 */

import { describe, it, expect } from 'vitest';
import { rewriteSingolareToPlurale } from '../../supabase/functions/_shared/principio-zero-validator.ts';

describe('rewriteSingolareToPlurale — pronouns', () => {
  it('tu → voi', () => {
    expect(rewriteSingolareToPlurale('tu sei bravo')).toBe('voi siete bravo');
  });
  it('ti → vi', () => {
    expect(rewriteSingolareToPlurale('ti aiuto')).toBe('vi aiuto');
  });
  it('te → voi', () => {
    expect(rewriteSingolareToPlurale('te lo dico')).toBe('voi lo dico');
  });
  it('tuo → vostro', () => {
    expect(rewriteSingolareToPlurale('il tuo kit')).toBe('il vostro kit');
  });
  it('tua → vostra', () => {
    expect(rewriteSingolareToPlurale('la tua scheda')).toBe('la vostra scheda');
  });
  it('tuoi → vostri', () => {
    expect(rewriteSingolareToPlurale('i tuoi LED')).toBe('i vostri LED');
  });
  it('tue → vostre', () => {
    expect(rewriteSingolareToPlurale('le tue resistenze')).toBe('le vostre resistenze');
  });
});

describe('rewriteSingolareToPlurale — verbs 2sg present', () => {
  it('hai → avete', () => {
    expect(rewriteSingolareToPlurale('hai capito?')).toBe('avete capito?');
  });
  it('sei → siete', () => {
    expect(rewriteSingolareToPlurale('sei pronto')).toBe('siete pronto');
  });
  it('puoi → potete (Andrea screenshot evidence)', () => {
    expect(rewriteSingolareToPlurale('Con Arduino puoi dosare da 0 a 255')).toBe('Con Arduino potete dosare da 0 a 255');
  });
  it('vai → andate', () => {
    expect(rewriteSingolareToPlurale('vai avanti')).toBe('andate avanti');
  });
  it('fai → fate', () => {
    expect(rewriteSingolareToPlurale('fai così')).toBe('fate così');
  });
  it('stai → state', () => {
    expect(rewriteSingolareToPlurale('stai attento')).toBe('state attento');
  });
  it('vedi → vedete', () => {
    expect(rewriteSingolareToPlurale('vedi il LED')).toBe('vedete il LED');
  });
});

describe('rewriteSingolareToPlurale — verbs future 2sg', () => {
  it('vedrai → vedrete', () => {
    expect(rewriteSingolareToPlurale('vedrai il risultato')).toBe('vedrete il risultato');
  });
  it('dovrai → dovrete', () => {
    expect(rewriteSingolareToPlurale('dovrai aspettare')).toBe('dovrete aspettare');
  });
  it('potrai → potrete', () => {
    expect(rewriteSingolareToPlurale('potrai accendere')).toBe('potrete accendere');
  });
});

describe('rewriteSingolareToPlurale — imperative 2sg', () => {
  it('prova → provate', () => {
    expect(rewriteSingolareToPlurale('prova a girare')).toBe('provate a girare');
  });
  it('guarda → guardate', () => {
    expect(rewriteSingolareToPlurale('guarda il circuito')).toBe('guardate il circuito');
  });
  it('scegli → scegliete', () => {
    expect(rewriteSingolareToPlurale('scegli un colore')).toBe('scegliete un colore');
  });
  it('does NOT double-transform already-plural "provate"', () => {
    expect(rewriteSingolareToPlurale('provate il LED')).toBe('provate il LED');
  });
  it('does NOT double-transform already-plural "guardate"', () => {
    expect(rewriteSingolareToPlurale('guardate il LED')).toBe('guardate il LED');
  });
});

describe('rewriteSingolareToPlurale — protected regions', () => {
  it('preserves text inside «book quote»', () => {
    const input = 'Ragazzi, «tu sei bravo» dice il libro';
    expect(rewriteSingolareToPlurale(input)).toBe('Ragazzi, «tu sei bravo» dice il libro');
  });

  it('preserves text inside [AZIONE:...]', () => {
    const input = 'Provate questo [AZIONE:setcode:int tuo=5; puoi=10]';
    expect(rewriteSingolareToPlurale(input)).toBe('Provate questo [AZIONE:setcode:int tuo=5; puoi=10]');
  });

  it('preserves text inside [INTENT:...]', () => {
    const input = 'Ecco [INTENT:{"args":{"label":"tuo led"}}] guarda';
    expect(rewriteSingolareToPlurale(input)).toBe('Ecco [INTENT:{"args":{"label":"tuo led"}}] guardate');
  });

  it('preserves text inside ```code blocks```', () => {
    const input = 'Codice: ```int tu = 5; if (puoi) {}``` adesso prova';
    expect(rewriteSingolareToPlurale(input)).toBe('Codice: ```int tu = 5; if (puoi) {}``` adesso provate');
  });

  it('rewrites text BETWEEN protected regions', () => {
    const input = 'prova «tu sei» fai così';
    expect(rewriteSingolareToPlurale(input)).toBe('provate «tu sei» fate così');
  });
});

describe('rewriteSingolareToPlurale — case preservation', () => {
  it('preserves uppercase first letter', () => {
    expect(rewriteSingolareToPlurale('Tu sei pronto')).toBe('Voi siete pronto');
  });
  it('preserves uppercase imperative', () => {
    expect(rewriteSingolareToPlurale('Prova ora')).toBe('Provate ora');
  });
});

describe('rewriteSingolareToPlurale — word boundary safety', () => {
  it('does NOT rewrite "tu" inside "tutto"', () => {
    expect(rewriteSingolareToPlurale('Tutto bene')).toBe('Tutto bene');
  });
  it('does NOT rewrite "ti" inside "tipologia"', () => {
    expect(rewriteSingolareToPlurale('La tipologia del LED')).toBe('La tipologia del LED');
  });
  it('does NOT rewrite "te" inside "Italia"', () => {
    expect(rewriteSingolareToPlurale('Italia centrale')).toBe('Italia centrale');
  });
  it('does NOT rewrite "hai" inside "haiti"', () => {
    expect(rewriteSingolareToPlurale('Haiti is a country')).toBe('Haiti is a country');
  });
});

describe('rewriteSingolareToPlurale — null safety', () => {
  it('returns null on null', () => {
    expect(rewriteSingolareToPlurale(null)).toBe(null);
  });
  it('returns undefined on undefined', () => {
    expect(rewriteSingolareToPlurale(undefined)).toBe(undefined);
  });
  it('returns empty string on empty', () => {
    expect(rewriteSingolareToPlurale('')).toBe('');
  });
  it('returns whitespace-only as-is', () => {
    expect(rewriteSingolareToPlurale('   ')).toBe('   ');
  });
  it('does not throw on number-like input', () => {
    expect(() => rewriteSingolareToPlurale(42)).not.toThrow();
  });
});

describe('rewriteSingolareToPlurale — real-world Andrea screenshot scenario', () => {
  it('fixes Andrea screenshot 2026-05-12 PM RGB experiment response', () => {
    const input = "Il LED RGB è come un mini-dipingitore di luce: ha 3 LED piccolissimi dentro (Rosso, Verde, Blu) e mescolandoli crei qualsiasi colore! Ha 4 piedini: uno comune (il più lungo) e uno per ogni colore. Pensalo come i 3 rubinetti della pittura: apri il rosso + verde e viene giallo! Con Arduino puoi dosare da 0 a 255 ogni colore.";
    const out = rewriteSingolareToPlurale(input);
    expect(out).toContain('potete dosare');
    expect(out).not.toContain('puoi dosare');
  });

  it('rewrites multiple violations in single response', () => {
    const input = 'Hai il LED? Puoi accenderlo. Vedrai la luce. Prova ora.';
    const out = rewriteSingolareToPlurale(input);
    expect(out).toContain('Avete il LED');
    expect(out).toContain('Potete accenderlo');
    expect(out).toContain('Vedrete la luce');
    expect(out).toContain('Provate ora');
  });
});

describe('rewriteSingolareToPlurale — gerund + clitic suffix iter 40 hotfix', () => {
  it('permettendoti → permettendovi (Andrea live smoke evidence)', () => {
    expect(rewriteSingolareToPlurale('Il LED, permettendoti di vedere')).toBe('Il LED, permettendovi di vedere');
  });
  it('mostrandoti → mostrandovi', () => {
    expect(rewriteSingolareToPlurale('Sto mostrandoti il circuito')).toBe('Sto mostrandovi il circuito');
  });
  it('aiutandoti → aiutandovi', () => {
    expect(rewriteSingolareToPlurale('aiutandoti capire')).toBe('aiutandovi capire');
  });
  it('does NOT change "tipologia" (no -ando/-endo prefix)', () => {
    expect(rewriteSingolareToPlurale('tipologia generale')).toBe('tipologia generale');
  });
});

describe('rewriteSingolareToPlurale — noun-imperative disambiguation iter 40', () => {
  it('preserves "banco di prova" (noun: test bench, NOT imperative)', () => {
    expect(rewriteSingolareToPlurale('Sul banco di prova vedete il LED')).toBe('Sul banco di prova vedete il LED');
  });
  it('preserves "la prova" (noun)', () => {
    expect(rewriteSingolareToPlurale('La prova è positiva')).toBe('La prova è positiva');
  });
  it('preserves "una prova" (noun)', () => {
    expect(rewriteSingolareToPlurale('Una prova rapida')).toBe('Una prova rapida');
  });
  it('STILL rewrites bare imperative "prova" (no article)', () => {
    expect(rewriteSingolareToPlurale('Prova questo circuito')).toBe('Provate questo circuito');
  });
  it('preserves "in conta" / "la conta" (noun count)', () => {
    expect(rewriteSingolareToPlurale('la conta dei componenti')).toBe('la conta dei componenti');
  });
  it('STILL rewrites bare "conta"', () => {
    expect(rewriteSingolareToPlurale('Conta i pin')).toBe('Contate i pin');
  });
});

describe('rewriteSingolareToPlurale — iter 41 expanded imperatives', () => {
  it('pensa → pensate (Andrea live smoke "Pensa a una piccola lampadina")', () => {
    expect(rewriteSingolareToPlurale('Pensa a una piccola lampadina')).toBe('Pensate a una piccola lampadina');
  });
  it('pensalo → pensatelo', () => {
    expect(rewriteSingolareToPlurale('pensalo bene')).toBe('pensatelo bene');
  });
  it('ricorda → ricordate', () => {
    expect(rewriteSingolareToPlurale('ricorda il pin')).toBe('ricordate il pin');
  });
  it('ricordi → ricordate (interrogative)', () => {
    expect(rewriteSingolareToPlurale('ricordi il pin?')).toBe('ricordate il pin?');
  });
  it('immagina → immaginate', () => {
    expect(rewriteSingolareToPlurale('Immagina un fiume')).toBe('Immaginate un fiume');
  });
  it('osserva → osservate', () => {
    expect(rewriteSingolareToPlurale('Osserva il LED')).toBe('Osservate il LED');
  });
  it('clicca → cliccate', () => {
    expect(rewriteSingolareToPlurale('Clicca Play')).toBe('Cliccate Play');
  });
  it('premi → premete', () => {
    expect(rewriteSingolareToPlurale('Premi il pulsante')).toBe('Premete il pulsante');
  });
  it('apri → aprite', () => {
    expect(rewriteSingolareToPlurale('Apri il manuale')).toBe('Aprite il manuale');
  });
  it('considera → considerate', () => {
    expect(rewriteSingolareToPlurale('considera il fatto')).toBe('considerate il fatto');
  });
  it('preserves noun "pensa" preceded by article (rare but defensive)', () => {
    expect(rewriteSingolareToPlurale('la pensa diversa')).toBe('la pensa diversa');
  });
  it('collega → collegate (imperative)', () => {
    expect(rewriteSingolareToPlurale('Collega il filo')).toBe('Collegate il filo');
  });
  it('preserves "la collega" noun (colleague)', () => {
    expect(rewriteSingolareToPlurale('la collega di Anna')).toBe('la collega di Anna');
  });
});
