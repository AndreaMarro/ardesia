import { cleanAndTruncate } from '../../src/utils/truncateResponse';
import { describe, it, expect } from 'vitest';

describe('cleanAndTruncate', () => {
  it('tronca a 60 parole di default', () => {
    const long = Array(100).fill('parola').join(' ');
    const result = cleanAndTruncate(long);
    const wordCount = result.replace('...', '').trim().split(/\s+/).length;
    expect(wordCount).toBeLessThanOrEqual(60);
    expect(result).toContain('...');
  });

  it('tronca a N parole custom', () => {
    const long = Array(100).fill('parola').join(' ');
    const result = cleanAndTruncate(long, 40);
    const wordCount = result.replace('...', '').trim().split(/\s+/).length;
    expect(wordCount).toBeLessThanOrEqual(40);
  });

  it('rimuove hallucination immagine', () => {
    const text = "Ciao! Ho analizzato l'immagine che hai inviato. Il circuito ha un LED.";
    const result = cleanAndTruncate(text);
    expect(result).not.toContain('immagine');
    expect(result).toContain('Ciao');
    expect(result).toContain('LED');
  });

  it('non tronca testi corti', () => {
    const short = 'Il LED si accende solo in un verso.';
    expect(cleanAndTruncate(short)).toBe(short);
  });

  it('gestisce null/undefined', () => {
    expect(cleanAndTruncate(null)).toBe('');
    expect(cleanAndTruncate(undefined)).toBe('');
    expect(cleanAndTruncate('')).toBe('');
  });

  // iter 45 fix Andrea video2 06/05/2026 B7: AZIONE/INTENT/STRUCTURED tags
  // sono consumati dal browser dispatcher (intentsDispatcher iter 36 +
  // 62-tool registry iter 31). Non DEVONO comparire in UI ("UNLIM SPIEGA
  // L'ESPERIMENTO" mostrava raw tags Andrea screenshot).
  it('STRIP completo tag [AZIONE:...] dal testo visibile (B7 fix iter 45)', () => {
    const text = 'Ragazzi, accendete il LED. [AZIONE:highlight:led1] [AZIONE:play]';
    const result = cleanAndTruncate(text);
    expect(result).not.toContain('[AZIONE:');
    expect(result).not.toContain('AZIONE:highlight');
    expect(result).toContain('Ragazzi');
    expect(result).toContain('accendete il LED');
  });

  it('STRIP tag [INTENT:...] dal testo visibile (B7 fix iter 45)', () => {
    const text = 'Cliccate sul pulsante. [INTENT:{"action":"click","id":"btn1"}]';
    const result = cleanAndTruncate(text);
    expect(result).not.toContain('[INTENT:');
    expect(result).not.toContain('"action"');
    expect(result).toContain('Cliccate sul pulsante');
  });

  it('STRIP tag [STRUCTURED:...] dal testo visibile (B7 fix iter 45)', () => {
    const text = 'Vol.1 pag.32 il resistore limita la corrente. [STRUCTURED:{"type":"citation"}]';
    const result = cleanAndTruncate(text);
    expect(result).not.toContain('[STRUCTURED:');
    expect(result).toContain('Vol.1 pag.32');
  });

  it('tronca testo lungo + strip tags simultaneo (B7 + brevity)', () => {
    const long = Array(80).fill('parola').join(' ') + ' [AZIONE:highlight:led1] [AZIONE:play]';
    const result = cleanAndTruncate(long);
    expect(result).not.toContain('[AZIONE:');
    expect(result).toContain('...');
    const wordCount = result.replace('...', '').trim().split(/\s+/).filter(w => w.length > 0).length;
    expect(wordCount).toBeLessThanOrEqual(60);
  });
});
