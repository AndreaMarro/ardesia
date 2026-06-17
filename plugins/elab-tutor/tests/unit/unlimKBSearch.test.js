/**
 * unlimKBSearch.test.js — Test UNLIM Knowledge Base search
 * Tests: searchKnowledgeBase, searchRAGChunks
 * 55 tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchKnowledgeBase, searchRAGChunks } from '../../src/data/unlim-knowledge-base.js';

describe('searchKnowledgeBase', () => {
  describe('component queries — Italian', () => {
    it('finds LED answer for "come funziona un led"', () => {
      const r = searchKnowledgeBase('come funziona un led');
      expect(r).not.toBeNull();
      expect(r.answer).toContain('LED');
    });

    it('finds LED answer for "il mio led non si accende"', () => {
      const r = searchKnowledgeBase('il mio led non si accende');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('led');
    });

    it('finds LED RGB answer for "led rgb colori"', () => {
      const r = searchKnowledgeBase('led rgb colori');
      expect(r).not.toBeNull();
      expect(r.answer).toContain('RGB');
    });

    it('finds resistor answer for "come funziona una resistenza"', () => {
      const r = searchKnowledgeBase('come funziona una resistenza');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('resist');
    });

    it('finds Ohm law for "legge di ohm"', () => {
      const r = searchKnowledgeBase('legge di ohm');
      expect(r).not.toBeNull();
      expect(r.answer).toContain('V = R');
    });

    it('finds breadboard answer for "come funziona la breadboard"', () => {
      const r = searchKnowledgeBase('come funziona la breadboard');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('breadboard');
    });

    it('finds buzzer answer for "buzzer suono"', () => {
      const r = searchKnowledgeBase('buzzer suono');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('buzzer');
    });

    it('finds photoresistor answer for "fotoresistenza luce"', () => {
      const r = searchKnowledgeBase('fotoresistenza luce');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('fotoresist');
    });

    it('finds servo answer for "servo motore angolo"', () => {
      const r = searchKnowledgeBase('servo motore angolo');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('servo');
    });

    it('finds capacitor answer for "condensatore carica"', () => {
      const r = searchKnowledgeBase('condensatore carica');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('condensatore');
    });

    it('finds LCD answer for "display lcd"', () => {
      const r = searchKnowledgeBase('display lcd');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('lcd');
    });

    it('finds ultrasonic answer for "sensore ultrasuoni distanza"', () => {
      const r = searchKnowledgeBase('sensore ultrasuoni distanza');
      expect(r).not.toBeNull();
      // The answer may use "HC-SR04" instead of "ultrasuoni"
      expect(r.answer.toLowerCase()).toMatch(/ultrasu|hc-sr04|distanza|pipistrello/);
    });
  });

  describe('Arduino programming queries', () => {
    it('finds Arduino answer for "cos e arduino"', () => {
      const r = searchKnowledgeBase('cos e arduino');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('arduino');
    });

    it('finds setup/loop for "struttura programma arduino"', () => {
      const r = searchKnowledgeBase('struttura programma arduino setup loop');
      expect(r).not.toBeNull();
      expect(r.answer).toContain('setup');
    });

    it('finds digitalWrite for "come accendere un pin"', () => {
      const r = searchKnowledgeBase('digitalwrite output accendere');
      expect(r).not.toBeNull();
      expect(r.answer).toContain('digitalWrite');
    });

    it('finds digitalRead for "leggere pulsante"', () => {
      const r = searchKnowledgeBase('digitalread pulsante leggere input');
      expect(r).not.toBeNull();
      expect(r.answer).toContain('digitalRead');
    });

    it('finds analogWrite for "pwm dimmer luminosita"', () => {
      const r = searchKnowledgeBase('analogwrite pwm dimmer luminosita');
      expect(r).not.toBeNull();
      expect(r.answer).toContain('PWM');
    });

    it('finds analogRead for "leggere potenziometro analogico"', () => {
      const r = searchKnowledgeBase('analogread potenziometro analogico');
      expect(r).not.toBeNull();
      expect(r.answer).toContain('analogRead');
    });

    it('finds serial for "serial monitor stampa"', () => {
      const r = searchKnowledgeBase('serial monitor stampa println');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('serial');
    });

    it('finds delay/millis for "delay millis tempo"', () => {
      const r = searchKnowledgeBase('delay millis tempo ritardo');
      expect(r).not.toBeNull();
      expect(r.answer).toContain('delay');
    });

    it('finds if/else for "if else condizione"', () => {
      const r = searchKnowledgeBase('if else condizione confronto');
      expect(r).not.toBeNull();
      expect(r.answer).toContain('if');
    });

    it('finds for loop for "ciclo for ripetere"', () => {
      const r = searchKnowledgeBase('ciclo for ripetere contatore');
      expect(r).not.toBeNull();
      expect(r.answer).toContain('for');
    });

    it('finds map for "map convertire scala"', () => {
      const r = searchKnowledgeBase('map convertire scala range');
      expect(r).not.toBeNull();
      expect(r.answer).toContain('map');
    });

    it('finds variable answer for "variabile int float"', () => {
      const r = searchKnowledgeBase('variabile int float tipo dichiarare');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('variabil');
    });
  });

  describe('general and ELAB queries', () => {
    it('finds compilation errors for "errore compilazione"', () => {
      const r = searchKnowledgeBase('errore compilazione non compila');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('errori');
    });

    it('finds short circuit for "cortocircuito"', () => {
      const r = searchKnowledgeBase('cortocircuito corto circuito');
      expect(r).not.toBeNull();
    });

    it('finds motor DC for "motore dc velocita"', () => {
      const r = searchKnowledgeBase('motore dc velocita transistor');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('motore');
    });

    it('finds pull-up for "pullup resistenza interna"', () => {
      const r = searchKnowledgeBase('pullup resistenza interna flottante');
      expect(r).not.toBeNull();
      expect(r.answer.toLowerCase()).toContain('pull-up');
    });

    it('finds series/parallel for "serie parallelo"', () => {
      const r = searchKnowledgeBase('serie parallelo collegamento');
      expect(r).not.toBeNull();
    });

    it('finds ELAB simulator for "simulatore"', () => {
      const r = searchKnowledgeBase('simulatore virtuale testare');
      expect(r).not.toBeNull();
    });

    it('finds safety for "sicurezza scossa"', () => {
      const r = searchKnowledgeBase('sicurezza scossa pericoloso');
      expect(r).not.toBeNull();
    });

    it('finds temperature for "temperatura termometro"', () => {
      const r = searchKnowledgeBase('temperatura termometro sensore caldo');
      expect(r).not.toBeNull();
    });
  });

  describe('edge cases', () => {
    it('returns null for empty string', () => {
      expect(searchKnowledgeBase('')).toBeNull();
    });

    it('returns null for null', () => {
      expect(searchKnowledgeBase(null)).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(searchKnowledgeBase(undefined)).toBeNull();
    });

    it('returns null for number input', () => {
      expect(searchKnowledgeBase(123)).toBeNull();
    });

    it('returns null for very short meaningless input', () => {
      expect(searchKnowledgeBase('a')).toBeNull();
    });

    it('returns null for only stop words', () => {
      expect(searchKnowledgeBase('il la di del')).toBeNull();
    });

    it('handles very long string without crash', () => {
      const long = 'led '.repeat(500);
      const r = searchKnowledgeBase(long);
      expect(r).not.toBeNull();
    });

    it('handles special characters', () => {
      const r = searchKnowledgeBase('led!!! @#$ %^&*');
      expect(r).not.toBeNull(); // 'led' should still match
    });

    it('returns object with correct shape', () => {
      const r = searchKnowledgeBase('led accende');
      expect(r).toHaveProperty('answer');
      expect(r).toHaveProperty('question');
      expect(r).toHaveProperty('score');
      expect(typeof r.score).toBe('number');
    });

    it('score is above minimum threshold', () => {
      const r = searchKnowledgeBase('led');
      expect(r).not.toBeNull();
      expect(r.score).toBeGreaterThanOrEqual(2.5);
    });

    it('returns null for gibberish', () => {
      expect(searchKnowledgeBase('xyzqwerty asdfgh')).toBeNull();
    });
  });
});

describe('searchRAGChunks', () => {
  it('returns array', () => {
    const r = searchRAGChunks('led circuito');
    expect(Array.isArray(r)).toBe(true);
  });

  it('returns results for "led"', () => {
    const r = searchRAGChunks('led');
    expect(r.length).toBeGreaterThan(0);
  });

  it('returns results for "resistore ohm"', () => {
    const r = searchRAGChunks('resistore ohm');
    expect(r.length).toBeGreaterThan(0);
  });

  it('returns results for "arduino programma"', () => {
    const r = searchRAGChunks('arduino programma');
    expect(r.length).toBeGreaterThan(0);
  });

  it('respects topK parameter', () => {
    const r = searchRAGChunks('elettronica circuito', 2);
    expect(r.length).toBeLessThanOrEqual(2);
  });

  it('returns empty for null', () => {
    expect(searchRAGChunks(null)).toEqual([]);
  });

  it('returns empty for empty string', () => {
    expect(searchRAGChunks('')).toEqual([]);
  });

  it('returns empty for number', () => {
    expect(searchRAGChunks(42)).toEqual([]);
  });

  it('each result has text and score', () => {
    const r = searchRAGChunks('breadboard');
    if (r.length > 0) {
      expect(r[0]).toHaveProperty('text');
      expect(r[0]).toHaveProperty('score');
      expect(r[0].score).toBeGreaterThan(0);
    }
  });

  it('results are sorted by score descending', () => {
    const r = searchRAGChunks('circuito elettronico', 5);
    for (let i = 1; i < r.length; i++) {
      expect(r[i - 1].score).toBeGreaterThanOrEqual(r[i].score);
    }
  });

  it('returns empty for gibberish', () => {
    expect(searchRAGChunks('xyzqwertyu')).toEqual([]);
  });
});
