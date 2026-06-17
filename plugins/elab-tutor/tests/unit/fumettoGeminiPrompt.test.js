import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('fumetto Gemini system prompt', () => {
  it('defines a dedicated Gemini prompt for written panels and image prompts', async () => {
    const mod = await import('../../supabase/functions/_shared/fumetto-prompt.ts');

    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toContain('UNLIM');
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toContain('storyline');
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toContain('imagePrompts');
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toContain('problema');
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toContain('ipotesi');
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toContain('errore');
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toContain('correzione');
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toContain('risultato');
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toContain('prossima sfida');
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toMatch(/8-14 anni/);
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toContain('quiz');
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toContain('diario');
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toMatch(/tutto basato sulla sessione|sessione/i);
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toMatch(/NON inventare|non inventare/i);
    expect(mod.FUMETTO_GEMINI_SYSTEM_PROMPT).toMatch(/JSON valido/i);
  });

  it('builds the Gemini user message from session evidence, not generic experiment text', async () => {
    const mod = await import('../../supabase/functions/_shared/fumetto-prompt.ts');
    const message = mod.buildFumettoGeminiMessage({
      experiment: { id: 'v3-cap8-esp3', title: 'Dati sul Monitor Seriale', volume: 3 },
      componentsUsed: ['Nano R4', 'sensore luce', 'cavo USB'],
      sessionStoryline: {
        anchors: [
          'passo 4/7',
          'modalita codice',
          'compilazione riuscita (38120 byte)',
          'Serial Monitor: luce=710',
          'domanda a UNLIM: cosa significa 710?',
        ],
      },
      messages: [{ role: 'user', text: 'UNLIM, cosa significa 710?' }],
      volumeContext: { volume: 3, page: 124, verbatimText: 'Stampare analogRead sul Monitor Seriale' },
    });

    expect(message).toContain('v3-cap8-esp3');
    expect(message).toContain('Nano R4, sensore luce, cavo USB');
    expect(message).toContain('passo 4/7');
    expect(message).toContain('compilazione riuscita (38120 byte)');
    expect(message).toContain('Serial Monitor: luce=710');
    expect(message).toContain('UNLIM, cosa significa 710?');
    expect(message).toContain('quiz');
    expect(message).toContain('diario');
    expect(message).toContain('Restituisci SOLO JSON');
  });

  it('Edge Function unlim-fumetto uses Gemini through callLLM with the dedicated system prompt', () => {
    const source = fs.readFileSync(path.join(ROOT, 'supabase/functions/unlim-fumetto/index.ts'), 'utf8');

    expect(source).toContain("from '../_shared/llm-client.ts'");
    expect(source).toContain('FUMETTO_GEMINI_SYSTEM_PROMPT');
    expect(source).toMatch(/callLLM\(\{/);
    expect(source).toContain("model: 'gemini-2.5-flash'");
    expect(source).toContain('preferFastProvider: true');
    expect(source).toMatch(/JSON\.parse/);
  });
});
