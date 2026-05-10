import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const profiles = await import('../../supabase/functions/_shared/unlim-ai-profiles.ts');
const systemPrompt = await import('../../supabase/functions/_shared/system-prompt.ts');

describe('UNLIM multi-AI profiles', () => {
  it('declares two AI profiles for every classroom mode', () => {
    for (const mode of ['percorso', 'passopasso', 'montato', 'libero']) {
      expect(profiles.UNLIM_AI_PROFILES[`${mode}_total`]).toMatchObject({
        mode,
        depth: 'total',
        contextBudget: 'full',
      });
      expect(profiles.UNLIM_AI_PROFILES[`${mode}_compact`]).toMatchObject({
        mode,
        depth: 'compact',
        contextBudget: 'compressed',
      });
    }
  });

  it('includes the named total/general/control/Pixtral profiles Andrea requested', () => {
    expect(profiles.UNLIM_AI_PROFILES.knowledge_total.role).toMatch(/conoscitore totale/i);
    expect(profiles.UNLIM_AI_PROFILES.general_purpose_compact.role).toMatch(/general purpose/i);
    expect(profiles.UNLIM_AI_PROFILES.control_total.mode).toBe('controllo');
    expect(profiles.UNLIM_AI_PROFILES.pixtral_total).toMatchObject({
      mode: 'vision',
      depth: 'total',
      visionProvider: 'pixtral',
      canCaptureScreenshot: true,
    });
    expect(profiles.UNLIM_AI_PROFILES.pixtral_essential).toMatchObject({
      mode: 'vision',
      depth: 'compact',
      visionProvider: 'pixtral',
      canCaptureScreenshot: true,
    });
  });

  it('declares 3x2 volume expert profiles: fast + deep for every ELAB volume', () => {
    for (const volume of [1, 2, 3]) {
      expect(profiles.UNLIM_AI_PROFILES[`volume${volume}_fast`]).toMatchObject({
        mode: `volume${volume}`,
        depth: 'compact',
        volume,
        contextBudget: 'compressed',
      });
      expect(profiles.UNLIM_AI_PROFILES[`volume${volume}_deep`]).toMatchObject({
        mode: `volume${volume}`,
        depth: 'total',
        volume,
        contextBudget: 'full',
      });
    }
  });

  it('routes by active experiment volume and chooses deep only when the request asks for reasoning', () => {
    const fastVol1 = profiles.selectUnlimAiProfile('cosa faccio adesso?', {
      experimentId: 'v1-cap6-primo-circuito',
    });
    const deepVol3 = profiles.selectUnlimAiProfile('perche il blink non funziona? analizza bene', {
      experimentId: 'v3-cap6-led-blink',
    });

    expect(fastVol1.id).toBe('volume1_fast');
    expect(deepVol3.id).toBe('volume3_deep');
  });

  it('injects the selected volume pack and the full 3-volume map into expert prompts', () => {
    const vol2 = profiles.UNLIM_AI_PROFILES.volume2_deep;
    const prompt = profiles.buildUnlimAiProfilePrompt(vol2);

    expect(prompt).toContain('ESPERTO VOLUME 2');
    expect(prompt).toContain('CONOSCENZA COMPLETA DEI TRE VOLUMI');
    expect(prompt).toContain('VOL1');
    expect(prompt).toContain('VOL2');
    expect(prompt).toContain('VOL3');
  });

  it('routes screen understanding to Pixtral total unless the user asks for essential/brief', () => {
    const total = profiles.selectUnlimAiProfile('guarda lo schermo e capisci cosa succede', { hasImages: true });
    const essential = profiles.selectUnlimAiProfile('guarda essenziale solo il circuito', { hasImages: true });

    expect(total.id).toBe('pixtral_total');
    expect(essential.id).toBe('pixtral_essential');
  });

  // 2026-05-10 — live prod probe P3 hallucination fix:
  // "guarda" keyword + images:[] empty array activated pixtral_total → Pixtral
  // hallucinated "Vedo un LED rosso" without input. Vision profile must require hasImages.
  it('does NOT route to Pixtral when vision keyword present but images empty (regression P3)', () => {
    const profile = profiles.selectUnlimAiProfile('Guarda il circuito che vedi', { hasImages: false });
    expect(profile.id).not.toBe('pixtral_total');
    expect(profile.id).not.toBe('pixtral_essential');
    // Falls through to general/volume routing
    expect(['general_purpose_compact', 'knowledge_total', 'volume1_fast', 'volume2_fast', 'volume3_fast'])
      .toContain(profile.id);
  });

  it('does NOT route to Pixtral when "screenshot" keyword present without images', () => {
    const profile = profiles.selectUnlimAiProfile('fai screenshot dello schermo per favore', { hasImages: false });
    expect(profile.visionProvider).not.toBe('pixtral');
  });

  it('routes to Pixtral when vision keyword AND hasImages true', () => {
    const profile = profiles.selectUnlimAiProfile('guarda il circuito', { hasImages: true });
    expect(profile.visionProvider).toBe('pixtral');
  });

  it('injects software knowledge and ELAB language style into the system prompt', () => {
    const profile = profiles.UNLIM_AI_PROFILES.knowledge_total;
    const prompt = systemPrompt.buildSystemPrompt(null, null, null, '', false, profile);

    expect(prompt).toContain('REGIA MULTI-AI UNLIM');
    expect(prompt).toContain('CONOSCENZA SOFTWARE ELAB');
    expect(prompt).toContain('REGIA PARALLELA 3x2');
    expect(prompt).toContain('LINGUAGGIO ELAB');
    expect(prompt).toMatch(/analogie o metafore/i);
    expect(prompt).toContain('VOLUMI ELAB KNOWLEDGE PACK');
  });

  it('wires chat and vision endpoints to the profile selector', () => {
    const chatSource = fs.readFileSync(path.join(ROOT, 'supabase/functions/unlim-chat/index.ts'), 'utf8');
    const visionSource = fs.readFileSync(path.join(ROOT, 'supabase/functions/unlim-vision/index.ts'), 'utf8');
    const apiSource = fs.readFileSync(path.join(ROOT, 'src/services/api.js'), 'utf8');

    expect(chatSource).toContain('selectUnlimAiProfile');
    expect(chatSource).toContain('aiProfile: activeAiProfile.id');
    expect(visionSource).toContain('selectUnlimAiProfile');
    expect(visionSource).toContain('buildUnlimAiProfilePrompt');
    expect(apiSource).toContain('inferAiProfileHint');
    expect(apiSource).toContain('aiProfile: options.aiProfile || (preferPixtral ?');
  });
});
