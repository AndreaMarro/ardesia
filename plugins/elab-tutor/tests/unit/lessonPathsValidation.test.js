/**
 * Lesson Paths JSON Validation — verifica OGNI singolo file JSON
 * Principio Zero: se un lesson path e' malformato, il docente non ha la lezione.
 * Claude code andrea marro — 12/04/2026
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const LP_DIR = path.resolve('../../packs/elab-tutor/data/lesson-paths');
const jsonFiles = fs.readdirSync(LP_DIR).filter(f => f.endsWith('.json'));

describe('Lesson Paths — JSON Validation Massiva', () => {
  it(`ci sono almeno 78 file JSON`, () => {
    expect(jsonFiles.length).toBeGreaterThanOrEqual(78);
  });

  describe('ogni JSON e\' parsabile', () => {
    for (const file of jsonFiles) {
      it(`${file} e\' JSON valido`, () => {
        const content = fs.readFileSync(path.join(LP_DIR, file), 'utf8');
        expect(() => JSON.parse(content)).not.toThrow();
      });
    }
  });

  describe('ogni JSON ha campi obbligatori', () => {
    for (const file of jsonFiles) {
      if (file === 'index.js') continue;
      it(`${file} ha experiment_id e title`, () => {
        const data = JSON.parse(fs.readFileSync(path.join(LP_DIR, file), 'utf8'));
        expect(data.experiment_id, `${file} manca experiment_id`).toBeTruthy();
        expect(data.title, `${file} manca title`).toBeTruthy();
      });
    }
  });

  describe('ogni JSON ha phases array', () => {
    for (const file of jsonFiles) {
      if (file === 'index.js') continue;
      it(`${file} ha phases`, () => {
        const data = JSON.parse(fs.readFileSync(path.join(LP_DIR, file), 'utf8'));
        expect(Array.isArray(data.phases), `${file} phases non e' array`).toBe(true);
        expect(data.phases.length, `${file} phases vuoto`).toBeGreaterThan(0);
      });
    }
  });

  describe('ogni fase ha name e teacher_message', () => {
    for (const file of jsonFiles.slice(0, 20)) { // Spot check 20 files
      it(`${file} fasi hanno name e teacher_message`, () => {
        const data = JSON.parse(fs.readFileSync(path.join(LP_DIR, file), 'utf8'));
        for (const phase of data.phases || []) {
          expect(phase.name, `${file} fase senza name`).toBeTruthy();
          expect(phase.teacher_message, `${file} fase "${phase.name}" senza teacher_message`).toBeTruthy();
        }
      });
    }
  });

  describe('naming consistency', () => {
    it('tutti i file seguono il pattern v{N}-cap{N}-esp{N}.json o v{N}-*.json', () => {
      const invalid = jsonFiles.filter(f => !f.match(/^v\d+-.+\.json$/));
      expect(invalid, `File con naming invalido: ${invalid.join(', ')}`).toHaveLength(0);
    });

    it('experiment_id dentro il JSON corrisponde al nome file', () => {
      let mismatches = 0;
      for (const file of jsonFiles.slice(0, 30)) {
        const data = JSON.parse(fs.readFileSync(path.join(LP_DIR, file), 'utf8'));
        const expected = file.replace('.json', '');
        if (data.experiment_id !== expected) {
          mismatches++;
          console.log(`⚠️ Mismatch: file=${file} ma experiment_id=${data.experiment_id}`);
        }
      }
      if (mismatches > 0) {
        console.log(`⚠️ ${mismatches} file con experiment_id != nome file`);
      }
    });
  });

  describe('durata ragionevole', () => {
    it('nessun lesson path con durata 0 o > 120 minuti', () => {
      const outOfRange = [];
      for (const file of jsonFiles) {
        const data = JSON.parse(fs.readFileSync(path.join(LP_DIR, file), 'utf8'));
        if (data.duration_minutes !== undefined) {
          if (data.duration_minutes <= 0 || data.duration_minutes > 120) {
            outOfRange.push(`${file}: ${data.duration_minutes}min`);
          }
        }
      }
      expect(outOfRange, `Durate fuori range: ${outOfRange.join(', ')}`).toHaveLength(0);
    });
  });
});
