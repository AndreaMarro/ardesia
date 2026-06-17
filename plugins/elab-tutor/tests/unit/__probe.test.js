import { describe, it } from 'vitest';

describe('regex isolated', () => {
  it('check no-boundary', () => {
    const text = 'cosa dice il libro a pagina 12?';
    const re = /(?:cosa\s+dice|leggi(?:amo)?|apri(?:te)?|apriamo|vai\s+a|vado\s+a|portami\s+a|spiega(?:te|mi)?|porta(?:te?ci|mi)?|mostra(?:te|mi|re)?)\s*(?:il\s+|al\s+)?(?:libro\s*)?(?:a\s+|alla\s+)?pag(?:ina)?\.?\s*(\d{1,3})/i;
    const re2 = /pag(?:ina)?\.?\s*(\d{1,3})/i;
    const m1 = text.match(re);
    const m2 = text.match(re2);
    console.log('M1:', m1 ? m1[0] + '|' + m1[1] : 'NO');
    console.log('M2:', m2 ? m2[0] + '|' + m2[1] : 'NO');
    const hasVolNear = /vol(?:ume)?\.?\s*[123]/i.test(text);
    console.log('hasVolNear:', hasVolNear);
  });
});
