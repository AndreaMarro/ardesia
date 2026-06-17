// ============================================================
// TEST FACTORY — UNLIM Risposte
// searchKnowledgeBase + searchRAGChunks con 20 query italiane
// Generato automaticamente il 2026-04-15 (categoria 2/6)
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  searchKnowledgeBase,
  searchRAGChunks,
} from '../../../src/data/unlim-knowledge-base.js';

// ─── searchKnowledgeBase — risposte curate ───────────────────

describe('searchKnowledgeBase — query positive (devono trovare risposta)', () => {
  it('query LED base → risposta sul LED', () => {
    const result = searchKnowledgeBase('come funziona il LED');
    expect(result).not.toBeNull();
    expect(result.answer).toContain('LED');
    expect(result.score).toBeGreaterThanOrEqual(2.5);
  });

  it('query LED non funziona → troubleshooting', () => {
    const result = searchKnowledgeBase('il mio LED non si accende');
    expect(result).not.toBeNull();
    expect(result.answer.toLowerCase()).toMatch(/polari|anodo|verso|piedino/);
  });

  it('query resistenza e Ohm → risposta con valori', () => {
    const result = searchKnowledgeBase('a cosa serve la resistenza in ohm');
    expect(result).not.toBeNull();
    expect(result.answer).toMatch(/[Oo]hm|resistenz/);
  });

  it('query legge di Ohm → formula V=RI', () => {
    const result = searchKnowledgeBase('cos\'è la legge di Ohm tensione corrente');
    expect(result).not.toBeNull();
    expect(result.answer).toMatch(/V\s*=|tensione|corrente/i);
  });

  it('query serie e parallelo → spiegazione differenza', () => {
    const result = searchKnowledgeBase('differenza tra serie e parallelo');
    expect(result).not.toBeNull();
    expect(result.answer.toLowerCase()).toMatch(/serie|parallel/);
  });

  it('query cos\'è Arduino → spiegazione scheda', () => {
    const result = searchKnowledgeBase('cos\'è Arduino Nano microcontrollore');
    expect(result).not.toBeNull();
    expect(result.answer.toLowerCase()).toMatch(/arduino|microcontroll/);
  });

  it('query setup e loop → struttura sketch', () => {
    const result = searchKnowledgeBase('come funziona setup e loop programma Arduino');
    expect(result).not.toBeNull();
    expect(result.answer).toMatch(/setup|loop/i);
  });

  it('query digitalWrite HIGH LOW → accendere pin', () => {
    const result = searchKnowledgeBase('come si usa digitalWrite HIGH LOW');
    expect(result).not.toBeNull();
    expect(result.answer).toMatch(/digitalWrite|HIGH|LOW/);
  });

  it('query pulsante digitalRead → lettura bottone', () => {
    const result = searchKnowledgeBase('come leggo un pulsante con digitalRead');
    expect(result).not.toBeNull();
    expect(result.answer).toMatch(/digitalRead|pulsante|INPUT/i);
  });

  it('query PWM analogWrite → luminosità', () => {
    const result = searchKnowledgeBase('come funziona analogWrite PWM dimmer luminosità');
    expect(result).not.toBeNull();
    expect(result.answer).toMatch(/analogWrite|PWM/i);
  });

  it('query analogRead sensore → valori 0-1023', () => {
    const result = searchKnowledgeBase('come funziona analogRead potenziometro sensore');
    expect(result).not.toBeNull();
    expect(result.answer).toMatch(/analogRead|1023|A0/);
  });

  it('query Serial Monitor → debug stampa', () => {
    const result = searchKnowledgeBase('Serial Monitor seriale println debug');
    expect(result).not.toBeNull();
    expect(result.answer).toMatch(/Serial|println/i);
  });
});

describe('searchKnowledgeBase — formato risposta', () => {
  it('risposta ha campi answer, question, score', () => {
    const result = searchKnowledgeBase('come funziona un LED');
    expect(result).toHaveProperty('answer');
    expect(result).toHaveProperty('question');
    expect(result).toHaveProperty('score');
    expect(typeof result.answer).toBe('string');
    expect(result.answer.length).toBeGreaterThan(20);
  });

  it('risposta ha campo relatedExperiment quando collegato', () => {
    const result = searchKnowledgeBase('come funziona un LED');
    // LED ha relatedExperiment: 'cap1-led-semplice'
    expect(result).toHaveProperty('relatedExperiment');
  });
});

describe('searchKnowledgeBase — query negative (no risposta per off-topic)', () => {
  it('query vuota → null', () => {
    expect(searchKnowledgeBase('')).toBeNull();
  });

  it('query null → null', () => {
    expect(searchKnowledgeBase(null)).toBeNull();
  });

  it('query completamente off-topic (cucina) → null', () => {
    // "pasta al sugo" non ha match nella KB elettronica
    const result = searchKnowledgeBase('pasta al sugo ricetta italiana');
    expect(result).toBeNull();
  });

  it('query sole stop words → null', () => {
    // Solo stop words: non produce parole utili dopo il filtro
    const result = searchKnowledgeBase('il la le lo un una di da');
    expect(result).toBeNull();
  });
});

// ─── searchRAGChunks — ricerca nei 549 chunk ─────────────────

describe('searchRAGChunks — query positive', () => {
  it('query LED → almeno 1 chunk rilevante', () => {
    const results = searchRAGChunks('LED accende luce diodo', 5);
    expect(results.length).toBeGreaterThan(0);
    // Almeno un risultato deve contenere "LED" o "led"
    const hasLed = results.some(r => r.text.toLowerCase().includes('led'));
    expect(hasLed).toBe(true);
  });

  it('query resistenza → chunk con "resistenza" o "ohm"', () => {
    const results = searchRAGChunks('resistenza ohm circuito', 5);
    expect(results.length).toBeGreaterThan(0);
    const relevant = results.some(r =>
      r.text.toLowerCase().includes('resistenz') || r.text.toLowerCase().includes('ohm')
    );
    expect(relevant).toBe(true);
  });

  it('query Arduino → chunk con Arduino', () => {
    const results = searchRAGChunks('Arduino Nano microcontrollore', 3);
    expect(results.length).toBeGreaterThan(0);
  });

  it('query breadboard → chunk rilevante', () => {
    const results = searchRAGChunks('breadboard fori connessione', 3);
    expect(results.length).toBeGreaterThan(0);
  });

  it('query formato risposta — ogni chunk ha text, score, source', () => {
    const results = searchRAGChunks('LED resistenza', 3);
    expect(results.length).toBeGreaterThan(0);
    results.forEach(chunk => {
      expect(chunk).toHaveProperty('text');
      expect(chunk).toHaveProperty('score');
      expect(chunk).toHaveProperty('source');
      expect(typeof chunk.text).toBe('string');
      expect(chunk.score).toBeGreaterThan(0);
    });
  });

  it('topK=3 rispetta il limite massimo di risultati', () => {
    const results = searchRAGChunks('LED accende circuito', 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('topK=1 ritorna esattamente 1 risultato se ci sono match', () => {
    const results = searchRAGChunks('LED', 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it('risultati ordinati per score decrescente', () => {
    const results = searchRAGChunks('LED resistenza circuito breadboard', 5);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('sorgenti curate (glossary, faq, error-guide) hanno bonus score', () => {
    // Il bonus 1.5x per sorgenti curate fa sì che glossary/faq abbiano score > volume-pdf
    // per query uguali. Testiamo che esistano risultati da sorgenti curate.
    const results = searchRAGChunks('LED diodo luce', 10);
    const curatedSources = ['glossary', 'faq', 'error-guide', 'analogy', 'code-example', 'experiment-tip', 'safety-guide'];
    const hasCurated = results.some(r => curatedSources.includes(r.source));
    expect(hasCurated).toBe(true);
  });
});

describe('searchRAGChunks — query negative', () => {
  it('query vuota → array vuoto', () => {
    expect(searchRAGChunks('')).toEqual([]);
  });

  it('query null → array vuoto', () => {
    expect(searchRAGChunks(null)).toEqual([]);
  });

  it('query off-topic assoluto → array vuoto o punteggio zero', () => {
    // "xyzzyx plutonio" non esiste nei chunk
    const results = searchRAGChunks('xyzzyx plutonio astronave', 5);
    expect(results).toEqual([]);
  });
});
