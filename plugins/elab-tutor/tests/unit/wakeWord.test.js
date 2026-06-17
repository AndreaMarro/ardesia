import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test wake word detection patterns (SpeechRecognition mocked)
const WAKE_PHRASES = [
  'ehi unlim', 'hey unlim', 'ei unlim', 'ehi un lim',
  'hey un lim', 'ei un lim', 'e unlim', 'ehi anelim',
  'hey anelim', 'ehi online', 'hey online',
];

function detectWakeWord(transcript) {
  const lower = transcript.toLowerCase().trim();
  return WAKE_PHRASES.some(phrase => lower.includes(phrase));
}

function extractCommandAfterWake(transcript) {
  const lower = transcript.toLowerCase().trim();
  for (const phrase of WAKE_PHRASES) {
    const idx = lower.indexOf(phrase);
    if (idx >= 0) return lower.substring(idx + phrase.length).trim();
  }
  return '';
}

describe('Wake Word — Ehi UNLIM', () => {
  it('1. rileva "ehi unlim"', () => {
    expect(detectWakeWord('ehi unlim')).toBe(true);
  });

  it('2. rileva "hey unlim"', () => {
    expect(detectWakeWord('hey unlim')).toBe(true);
  });

  it('3. rileva "ei unlim"', () => {
    expect(detectWakeWord('ei unlim')).toBe(true);
  });

  it('4. rileva con spazio extra', () => {
    expect(detectWakeWord('ehi un lim')).toBe(true);
  });

  it('5. rileva con testo prima', () => {
    expect(detectWakeWord('ok ehi unlim avvia')).toBe(true);
  });

  it('6. non rileva testo random', () => {
    expect(detectWakeWord('ciao come stai')).toBe(false);
  });

  it('7. non rileva parziale', () => {
    expect(detectWakeWord('ehi')).toBe(false);
  });

  it('8. case insensitive', () => {
    expect(detectWakeWord('EHI UNLIM')).toBe(true);
  });

  it('9. estrae comando dopo wake', () => {
    expect(extractCommandAfterWake('ehi unlim avvia il circuito')).toBe('avvia il circuito');
  });

  it('10. comando vuoto se solo wake', () => {
    expect(extractCommandAfterWake('ehi unlim')).toBe('');
  });

  it('11. rileva "ehi online" (misrecognition comune)', () => {
    expect(detectWakeWord('ehi online')).toBe(true);
  });

  it('12. rileva "ehi anelim" (misrecognition)', () => {
    expect(detectWakeWord('ehi anelim')).toBe(true);
  });
});
