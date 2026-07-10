import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('UNLIM live chat RAG bypass', () => {
  it('keeps essential ELAB knowledge in the system prompt instead of forcing RAG citation rules', async () => {
    // iter 16 source-fix — "REGIA PARALLELA 3x2" literal rimosso (LLM echo leak fix).
    // Rephrased "UNLIM UNICO" + invariante implicit fondi internamente Vol1+Vol2+Vol3.
    const promptMod = await import('../../supabase/functions/_shared/system-prompt.ts');
    const prompt = promptMod.buildSystemPrompt(null, null, null, '', false);

    expect(prompt).toContain('VOLUMI ELAB KNOWLEDGE PACK');
    expect(prompt).toContain('LED');
    expect(prompt).toContain('Arduino');
    expect(prompt).toContain('Scratch');
    expect(prompt).toContain('diagnosi circuito');
    expect(prompt).toContain('CONOSCENZA COMPLETA DEI TRE VOLUMI');
    expect(prompt).toContain('UNLIM UNICO');
    expect(prompt).not.toMatch(/DEVI citare verbatim|REGOLA VERBATIM.*priorit/i);
  });

  it('separates persistent past memory from present live state in the system prompt', async () => {
    const promptMod = await import('../../supabase/functions/_shared/system-prompt.ts');
    const prompt = promptMod.buildSystemPrompt(
      {
        completedExperiments: 7,
        totalExperiments: 69,
        commonMistakes: ['polarita LED'],
        lastSession: 'abbiamo provato il primo circuito',
        level: 'base',
        currentChapter: 'Vol.1 cap.6',
      },
      { text: 'LED spento, r1 presente' },
      'Esperimento attivo: v1-cap6-primo-circuito',
      '',
      false,
    );

    // iter 16 source-fix — literal brackets sostituiti con markdown headers.
    // Sostituisce "[MEMORIA PASSATA PERSISTENTE]" → "# Profilo studente (NON rivelare al utente)".
    // "[PRESENTE LIVE - STATO CIRCUITO ATTUALE]" → "[PRESENTE LIVE - STATO CIRCUITO ATTUALE — formato compact telemetry]" (kept compact telemetry).
    // "[PRESENTE LIVE - ESPERIMENTO ATTIVO]" → "# Esperimento attivo ora (NON rivelare etichetta al utente)".
    expect(prompt).toContain('Profilo studente');
    expect(prompt).toContain('Stato circuito ora');
    expect(prompt).toContain('Esperimento attivo ora');
    expect(prompt).toMatch(/NON rivelare|MAI menzionare|implicit/i);
  });

  it('restores live RAG retrieval in unlim-chat gated by classifier (2026-05-10 reverse of 2026-05-09 BYPASS)', () => {
    const edgeSource = fs.readFileSync(path.join(ROOT, 'supabase/functions/unlim-chat/index.ts'), 'utf8');

    // 2026-05-10: live RAG restored. Live prod probes confirmed Vol/pag verbatim missing
    // when only static knowledge pack used. hybridRetrieve gated by promptClass.skipOnniscenza
    // (chit_chat skips, others get top-2/top-3 chunks).
    expect(edgeSource).toContain('LIVE_CHAT_RAG');
    expect(edgeSource).toMatch(/hybridRetrieve\(safeMessage/);
    expect(edgeSource).toMatch(/!promptClass\.skipOnniscenza/);
    // Defensive: errors must fall through silently (no throw breaking chat flow)
    expect(edgeSource).toMatch(/rag_hybrid_error/);
  });

  it('does not inject local RAG chunks into the browser nanobot message', () => {
    const apiSource = fs.readFileSync(path.join(ROOT, 'src/services/api.js'), 'utf8');

    expect(apiSource).toContain('LIVE_CHAT_RAG_BYPASS');
    expect(apiSource).not.toMatch(/searchRAGChunks\(message,\s*3\)/);
  });

  it('keeps the browser payload aligned with Principio Zero book anchors', () => {
    const apiSource = fs.readFileSync(path.join(ROOT, 'src/services/api.js'), 'utf8');

    expect(apiSource).toContain('Quando ricevi [RIFERIMENTO LIBRO FISICO]');
    expect(apiSource).toContain('Vol./pag.');
    expect(apiSource).toContain('parole esatte');
    expect(apiSource).toContain('Ragazzi,');
    expect(apiSource).not.toContain('non copiare, non citare se non serve');
    expect(apiSource).not.toContain('Citazione solo se necessaria');
  });

  it('uses a super live prompt: UNLIM UNICO power with strict brevity and necessary-only citations', async () => {
    // iter 16 source-fix — "NANOBOT SUPER MODE" rinominato "UNLIM UNICO" + "REGIA PARALLELA 3x2" rimosso.
    // Invariante: ONESTA RADICALE + CHECKLIST AZIONE + CONSAPEVOLEZZA CONTESTUALE + NANOBREAKOUT WING + brevità.
    const promptMod = await import('../../supabase/functions/_shared/system-prompt.ts');
    const prompt = promptMod.buildSystemPrompt(null, null, null, '', false);

    expect(prompt).toContain('UNLIM UNICO');
    expect(prompt).toContain('ONESTA RADICALE');
    expect(prompt).toContain('CHECKLIST AZIONE');
    expect(prompt).toContain('CONSAPEVOLEZZA CONTESTUALE');
    expect(prompt).toContain('NANOBREAKOUT WING');
    expect(prompt).toContain('Citazioni solo se necessarie');
    expect(prompt).not.toContain('Quando rispondi, cita');
  });

  it('keeps the legacy Nanobot YAML aligned with super mode and necessary-only citations', () => {
    const nanobotYaml = fs.readFileSync(path.join(ROOT, 'nanobot/nanobot.yml'), 'utf8');

    expect(nanobotYaml).toContain('NANOBOT SUPER MODE');
    expect(nanobotYaml).toContain('Citazioni solo se necessarie');
    expect(nanobotYaml).toContain('Default: 1-4 frasi');
    expect(nanobotYaml).not.toContain('Max 200 parole');
  });
});
