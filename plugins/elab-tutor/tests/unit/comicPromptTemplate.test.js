import { describe, expect, it } from 'vitest';

import {
  buildComicGenerationPrompt,
  buildComicMetadata,
  COMIC_PROMPT_REQUIRED_FIELDS,
} from '../../src/services/comicPromptTemplate.js';

describe('comicPromptTemplate', () => {
  const base = {
    volume: 3,
    chapter: 6,
    chapterTitle: 'Programmare le luci',
    experimentId: 'v3-cap6-semaforo',
    experimentTitle: 'Semaforo con Arduino',
    page: 42,
    components: ['Arduino Nano', 'LED rosso', 'LED giallo', 'LED verde', 'resistori'],
    circuitState: 'tre LED collegati ai pin D5, D6, D3; compilazione OK',
    didacticConcept: 'sequenza temporizzata e output digitali',
    cliffhanger: 'E se il semaforo reagisse a un pulsante?',
    styleReference: 'fumetti v2: mascotte UNLIM coerente, colori ELAB, balloon brevi',
    sessionScreenshot: 'data:image/png;base64,SESSIONE',
    sessionContext: 'La classe ha montato tre LED e corretto un filo sul GND.',
    sessionMessages: [
      { role: 'student', content: 'Non va il giallo' },
      { role: 'unlim', content: 'Controlliamo il collegamento al pin D6.' },
    ],
    unlimMemory: {
      mistakesOvercome: ['filo-gnd-mancante'],
      preferredAnalogy: 'semaforo della strada',
    },
    teaMaterial: {
      narrativeMap: 'story arc Cap.6, next_id v3-cap7-esp1',
      cliffhangerTable: 'E se il semaforo reagisse a un pulsante?',
      metadata94: 'target_age 10-14, analogy_kind strade',
      albumSpec: 'timeline narrativa volume/capitolo',
      styleBible: 'mascotte UNLIM canonica, fumetti v2, palette ELAB',
    },
  };

  it('requires every editorial field needed by the fumetti v2 pipeline', () => {
    expect(COMIC_PROMPT_REQUIRED_FIELDS).toEqual([
      'volume',
      'chapter',
      'experimentId',
      'experimentTitle',
      'page',
      'components',
      'circuitState',
      'didacticConcept',
      'cliffhanger',
      'styleReference',
      'sessionScreenshot',
      'sessionContext',
      'sessionMessages',
      'unlimMemory',
      'teaMaterial',
    ]);
  });

  it('builds a prompt capped at 6 panels, 10-14 language, continuity and no live generation', () => {
    const prompt = buildComicGenerationPrompt(base);

    expect(prompt).toContain('Massimo 6 pannelli');
    expect(prompt).toContain('10-14 anni');
    expect(prompt).toContain('niente rigenerazione live durante la lezione');
    expect(prompt).toContain('continuita narrativa');
    expect(prompt).toContain('Leonardo AI');
    expect(prompt).toContain('screenshot della sessione');
    expect(prompt).toContain('cronologia messaggi');
    expect(prompt).toContain('memoria UNLIM');
    expect(prompt).toContain('materiale Tea');
    expect(prompt).toContain('story arc Cap.6');
    expect(prompt).toContain('v3-cap6-semaforo');
    expect(prompt).toContain('tre LED collegati');
  });

  it('builds stable metadata that links a generated asset to narrative_map', () => {
    const metadata = buildComicMetadata({
      ...base,
      assetUrl: 'https://storage.example/elab/v3-cap6-semaforo.pdf',
      storageProvider: 'supabase-storage',
    });

    expect(metadata).toEqual(expect.objectContaining({
      experiment_id: 'v3-cap6-semaforo',
      narrative_map_id: 'v3-cap6-semaforo',
      storage_provider: 'supabase-storage',
      asset_url: 'https://storage.example/elab/v3-cap6-semaforo.pdf',
      runtime_policy: 'read-pre-generated-asset-only',
      generation_provider: 'leonardo-ai',
    }));
    expect(metadata.session_sources.tea_material).toBe(true);
    expect(metadata.panel_limit).toBe(6);
  });
});
