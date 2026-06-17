/**
 * experimentData.test.js — Validazione integrita 92 esperimenti
 * Campi obbligatori, pinAssignments, connections, IDs validi, estimatedMinutes, buildSteps
 */
import { describe, it, expect } from 'vitest';
import { ALL_EXPERIMENTS, VOLUMES, getTotalExperiments, getExperimentsByVolume, findExperimentById, getChaptersForVolume } from '../../src/data/experiments-index';
import EXPERIMENTS_VOL1 from '../../src/data/experiments-vol1';
import EXPERIMENTS_VOL2 from '../../src/data/experiments-vol2';
import EXPERIMENTS_VOL3 from '../../src/data/experiments-vol3';

describe('experiments-index — exports base', () => {
  it('ALL_EXPERIMENTS e un array', () => {
    expect(Array.isArray(ALL_EXPERIMENTS)).toBe(true);
  });

  it('contiene 88 esperimenti totali', () => {
    expect(ALL_EXPERIMENTS.length).toBe(88);
  });

  it('VOLUMES e un array di 3 volumi', () => {
    expect(Array.isArray(VOLUMES)).toBe(true);
    expect(VOLUMES.length).toBe(3);
  });

  it('getTotalExperiments ritorna 88', () => {
    expect(getTotalExperiments()).toBe(88);
  });

  it('Volume 1 ha 38 esperimenti', () => {
    expect(EXPERIMENTS_VOL1.experiments.length).toBe(38);
  });

  it('Volume 2 ha 27 esperimenti', () => {
    expect(EXPERIMENTS_VOL2.experiments.length).toBe(27);
  });

  it('Volume 3 ha 23 esperimenti', () => {
    expect(EXPERIMENTS_VOL3.experiments.length).toBe(23);
  });
});

describe('Volume metadata', () => {
  it('Volume 1 ha title, subtitle, icon, color', () => {
    expect(EXPERIMENTS_VOL1.title).toBeTruthy();
    expect(EXPERIMENTS_VOL1.subtitle).toBeTruthy();
    expect(EXPERIMENTS_VOL1.icon).toBeTruthy();
    expect(EXPERIMENTS_VOL1.color).toBeTruthy();
  });

  it('Volume 2 ha title, subtitle, icon, color', () => {
    expect(EXPERIMENTS_VOL2.title).toBeTruthy();
    expect(EXPERIMENTS_VOL2.subtitle).toBeTruthy();
    expect(EXPERIMENTS_VOL2.icon).toBeTruthy();
    expect(EXPERIMENTS_VOL2.color).toBeTruthy();
  });

  it('Volume 3 ha title, subtitle, icon, color', () => {
    expect(EXPERIMENTS_VOL3.title).toBeTruthy();
    expect(EXPERIMENTS_VOL3.subtitle).toBeTruthy();
    expect(EXPERIMENTS_VOL3.icon).toBeTruthy();
    expect(EXPERIMENTS_VOL3.color).toBeTruthy();
  });

  it('colori sono HEX validi', () => {
    [EXPERIMENTS_VOL1, EXPERIMENTS_VOL2, EXPERIMENTS_VOL3].forEach(vol => {
      expect(vol.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('Ogni esperimento — campi obbligatori', () => {
  it('ogni esperimento ha id (stringa)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(typeof exp.id, `esperimento senza id`).toBe('string');
      expect(exp.id.length).toBeGreaterThan(0);
    });
  });

  it('ogni esperimento ha title (stringa)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(exp.title, `${exp.id} senza title`).toBeTruthy();
    });
  });

  it('ogni esperimento ha desc (stringa)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(exp.desc, `${exp.id} senza desc`).toBeTruthy();
    });
  });

  it('ogni esperimento ha chapter (stringa)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(typeof exp.chapter, `${exp.id} chapter non string`).toBe('string');
      expect(exp.chapter.length).toBeGreaterThan(0);
    });
  });

  it('ogni esperimento ha difficulty (1-5)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(exp.difficulty, `${exp.id} senza difficulty`).toBeDefined();
      expect(exp.difficulty).toBeGreaterThanOrEqual(1);
      expect(exp.difficulty).toBeLessThanOrEqual(5);
    });
  });

  it('ogni esperimento ha icon (stringa o null)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      const valid = typeof exp.icon === 'string' || exp.icon === null;
      expect(valid, `${exp.id} icon tipo inatteso: ${typeof exp.icon}`).toBe(true);
    });
  });

  it('la maggior parte degli esperimenti ha icon non null', () => {
    const withIcon = ALL_EXPERIMENTS.filter(e => typeof e.icon === 'string' && e.icon.length > 0);
    expect(withIcon.length).toBeGreaterThan(78);
  });

  it('ogni esperimento ha simulationMode (circuit o avr)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(['circuit', 'avr'], `${exp.id} simulationMode ${exp.simulationMode}`).toContain(exp.simulationMode);
    });
  });

  it('ogni esperimento ha components (array)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(Array.isArray(exp.components), `${exp.id} components non array`).toBe(true);
      expect(exp.components.length, `${exp.id} components vuoto`).toBeGreaterThan(0);
    });
  });

  it('ogni esperimento ha observe (stringa)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(exp.observe, `${exp.id} senza observe`).toBeTruthy();
    });
  });

  it('ogni esperimento ha concept (stringa)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(exp.concept, `${exp.id} senza concept`).toBeTruthy();
    });
  });
});

describe('Ogni esperimento — pinAssignments', () => {
  const withPinAssignments = ALL_EXPERIMENTS.filter(e => e.pinAssignments);

  it('esperimenti simulabili hanno pinAssignments (oggetto)', () => {
    ALL_EXPERIMENTS.filter(e => e.simulable !== false).forEach(exp => {
      if (exp.pinAssignments) {
        expect(typeof exp.pinAssignments, `${exp.id} pinAssignments non oggetto`).toBe('object');
      }
    });
  });

  it('la maggior parte degli esperimenti ha pinAssignments', () => {
    expect(withPinAssignments.length).toBeGreaterThan(68);
  });

  it('pinAssignment keys sono nel formato componentId:pinName', () => {
    withPinAssignments.forEach(exp => {
      Object.keys(exp.pinAssignments).forEach(key => {
        expect(key, `${exp.id} pin key "${key}" non ha :`).toContain(':');
      });
    });
  });

  it('pinAssignment values sono stringhe non vuote', () => {
    withPinAssignments.forEach(exp => {
      Object.values(exp.pinAssignments).forEach(val => {
        expect(typeof val).toBe('string');
        expect(val.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Ogni esperimento — connections', () => {
  it('ogni esperimento ha connections (array)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(Array.isArray(exp.connections), `${exp.id} connections non array`).toBe(true);
    });
  });

  it('ogni connessione ha from e to (stringhe)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      exp.connections.forEach((conn, i) => {
        expect(conn.from, `${exp.id} conn[${i}] senza from`).toBeTruthy();
        expect(conn.to, `${exp.id} conn[${i}] senza to`).toBeTruthy();
      });
    });
  });

  it('ogni connessione ha color (stringa)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      exp.connections.forEach((conn, i) => {
        expect(typeof conn.color, `${exp.id} conn[${i}] color non string`).toBe('string');
      });
    });
  });
});

describe('Ogni esperimento — layout', () => {
  it('ogni esperimento ha layout (oggetto)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(typeof exp.layout, `${exp.id} layout non oggetto`).toBe('object');
      expect(exp.layout, `${exp.id} layout null`).not.toBeNull();
    });
  });

  it('layout contiene coordinate x,y per ogni componente', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      Object.entries(exp.layout).forEach(([compId, pos]) => {
        expect(typeof pos.x, `${exp.id} layout ${compId} x non number`).toBe('number');
        expect(typeof pos.y, `${exp.id} layout ${compId} y non number`).toBe('number');
      });
    });
  });
});

describe('Ogni esperimento — components', () => {
  it('ogni componente ha type e id', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      exp.components.forEach((comp, i) => {
        expect(comp.type, `${exp.id} comp[${i}] senza type`).toBeTruthy();
        expect(comp.id, `${exp.id} comp[${i}] senza id`).toBeTruthy();
      });
    });
  });

  it('nessun componente ID duplicato nello stesso esperimento', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      const compIds = exp.components.map(c => c.id);
      const unique = new Set(compIds);
      expect(unique.size, `${exp.id} ha componenti duplicati`).toBe(compIds.length);
    });
  });
});

describe('Ogni esperimento — IDs validi e unici', () => {
  it('tutti gli ID esperimento sono unici', () => {
    const ids = ALL_EXPERIMENTS.map(e => e.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('ID seguono pattern vN-capN-espN o vN-capN-* o vN-extra-*', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(exp.id).toMatch(/^v[123]-(?:cap\d+-|extra-)/);
    });
  });

  it('Vol1 IDs iniziano con v1-', () => {
    EXPERIMENTS_VOL1.experiments.forEach(exp => {
      expect(exp.id).toMatch(/^v1-/);
    });
  });

  it('Vol2 IDs iniziano con v2-', () => {
    EXPERIMENTS_VOL2.experiments.forEach(exp => {
      expect(exp.id).toMatch(/^v2-/);
    });
  });

  it('Vol3 IDs iniziano con v3-', () => {
    EXPERIMENTS_VOL3.experiments.forEach(exp => {
      expect(exp.id).toMatch(/^v3-/);
    });
  });
});

describe('Ogni esperimento — estimatedMinutes', () => {
  it('ogni esperimento ha estimatedMinutes (numero)', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(typeof exp.estimatedMinutes, `${exp.id} estimatedMinutes non number`).toBe('number');
    });
  });

  it('estimatedMinutes tra 5 e 120', () => {
    ALL_EXPERIMENTS.forEach(exp => {
      expect(exp.estimatedMinutes, `${exp.id} estimatedMinutes troppo basso`).toBeGreaterThanOrEqual(5);
      expect(exp.estimatedMinutes, `${exp.id} estimatedMinutes troppo alto`).toBeLessThanOrEqual(120);
    });
  });
});

describe('Esperimenti — simulationMode coerenza volume', () => {
  it('Vol1 e Vol2 sono tutti circuit mode', () => {
    [...EXPERIMENTS_VOL1.experiments, ...EXPERIMENTS_VOL2.experiments].forEach(exp => {
      expect(exp.simulationMode, `${exp.id} dovrebbe essere circuit`).toBe('circuit');
    });
  });

  it('Vol3 sono tutti avr mode', () => {
    EXPERIMENTS_VOL3.experiments.forEach(exp => {
      expect(exp.simulationMode, `${exp.id} dovrebbe essere avr`).toBe('avr');
    });
  });
});

describe('getExperimentsByVolume', () => {
  it('ritorna 38 esperimenti per Volume 1', () => {
    expect(getExperimentsByVolume(1).length).toBe(38);
  });

  it('ritorna 27 esperimenti per Volume 2', () => {
    expect(getExperimentsByVolume(2).length).toBe(27);
  });

  it('ritorna 14 esperimenti per Volume 3', () => {
    expect(getExperimentsByVolume(3).length).toBe(23);
  });

  it('ritorna array vuoto per volume inesistente', () => {
    expect(getExperimentsByVolume(99).length).toBe(0);
  });
});

describe('findExperimentById', () => {
  it('trova v1-cap6-esp1', () => {
    const exp = findExperimentById('v1-cap6-esp1');
    expect(exp).not.toBeNull();
    expect(exp.id).toBe('v1-cap6-esp1');
  });

  it('ritorna null per ID inesistente', () => {
    expect(findExperimentById('non-esiste')).toBeNull();
  });
});

describe('getChaptersForVolume', () => {
  it('ritorna capitoli per Volume 1', () => {
    const chapters = getChaptersForVolume(1);
    expect(chapters.length).toBeGreaterThan(0);
    chapters.forEach(ch => expect(typeof ch).toBe('string'));
  });

  it('ritorna capitoli per Volume 3', () => {
    const chapters = getChaptersForVolume(3);
    expect(chapters.length).toBeGreaterThan(0);
  });
});
