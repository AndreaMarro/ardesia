/**
 * monitoring.test.js
 * Verifica che heartbeat.sh produca un heartbeat.json valido.
 *
 * Il test presuppone che automa/scripts/heartbeat.sh sia già stato eseguito
 * almeno una volta (o che heartbeat.json esista già).
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HEARTBEAT_PATH = resolve(__dirname, '../../automa/state/heartbeat.json');

const VALID_STATUSES = new Set(['ok', 'down']);

describe('monitoring — heartbeat.json', () => {
  it('il file automa/state/heartbeat.json esiste', () => {
    expect(existsSync(HEARTBEAT_PATH)).toBe(true);
  });

  it('il file è JSON valido', () => {
    const raw = readFileSync(HEARTBEAT_PATH, 'utf-8');
    expect(() => JSON.parse(raw)).not.toThrow();
  });

  describe('struttura campi', () => {
    let data;
    beforeAll(() => {
      const raw = readFileSync(HEARTBEAT_PATH, 'utf-8');
      data = JSON.parse(raw);
    });

    it('ha il campo timestamp', () => {
      expect(data).toHaveProperty('timestamp');
      expect(typeof data.timestamp).toBe('string');
      expect(data.timestamp.length).toBeGreaterThan(0);
    });

    it('timestamp è una data ISO 8601 valida', () => {
      const d = new Date(data.timestamp);
      expect(isNaN(d.getTime())).toBe(false);
    });

    it('ha il campo services', () => {
      expect(data).toHaveProperty('services');
      expect(typeof data.services).toBe('object');
    });

    it('ha services.frontend con status valido', () => {
      expect(data.services).toHaveProperty('frontend');
      expect(data.services.frontend).toHaveProperty('status');
      expect(VALID_STATUSES.has(data.services.frontend.status)).toBe(true);
    });

    it('ha services.nanobot con status valido', () => {
      expect(data.services).toHaveProperty('nanobot');
      expect(data.services.nanobot).toHaveProperty('status');
      expect(VALID_STATUSES.has(data.services.nanobot.status)).toBe(true);
    });

    it('ha services.edgeTTS con status valido', () => {
      expect(data.services).toHaveProperty('edgeTTS');
      expect(data.services.edgeTTS).toHaveProperty('status');
      expect(VALID_STATUSES.has(data.services.edgeTTS.status)).toBe(true);
    });

    it('i valori status sono esclusivamente "ok" o "down"', () => {
      const serviceKeys = Object.keys(data.services);
      expect(serviceKeys.length).toBeGreaterThanOrEqual(3);
      for (const key of serviceKeys) {
        const status = data.services[key].status;
        expect(
          VALID_STATUSES.has(status),
          `services.${key}.status deve essere "ok" o "down", trovato: "${status}"`
        ).toBe(true);
      }
    });

    it('ha il campo overall con valore valido', () => {
      expect(data).toHaveProperty('overall');
      expect(['ok', 'degraded']).toContain(data.overall);
    });
  });
});
