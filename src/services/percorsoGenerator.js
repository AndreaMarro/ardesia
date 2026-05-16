// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * percorsoGenerator — Sprint Q6
 * Andrea Marro 2026-04-25
 *
 * Service generativo di Percorso Capitolo dinamico per classe specifica.
 * Combina:
 * - Capitolo schema base (theory + esperimenti + narrative_flow)
 * - Memoria compounding classe (livello, errori_ricorrenti)
 * - Memoria compounding docente (stile_didattico)
 * - Wiki L2 concept relevance (RAG-style)
 * - Live state (circuit attivo)
 *
 * Output: Percorso JSON enriched con:
 * - intro_text contestualizzato
 * - esperimenti ordinati per livello classe
 * - transitions narrative adapted
 * - sidebar docente personalizzata stile
 * - citazioni Vol.X pag.Y inline
 *
 * Architecture: pure function. LLM client iniettato (mockable).
 */

import { buildCapitoloPromptFragment, estimatePromptTokens } from './capitoloPromptBuilder.js';

/**
 * Default LLM caller stub (mock-friendly). Real impl deve chiamare Edge Function.
 */
async function defaultLLMCall(prompt) {
  return {
    content: '[Generated narrative would appear here]',
    tokens_used: estimatePromptTokens(prompt) + 100,
    model: 'mock',
  };
}

/**
 * Genera Percorso JSON dinamico.
 *
 * @param {Object} params
 * @param {Object} params.capitolo - Capitolo schema da percorsoService.getCapitolo()
 * @param {Object} params.classMemory - student memory parsed (livello, errori_ricorrenti)
 * @param {Object} params.teacherMemory - teacher memory parsed (stile_didattico)
 * @param {Object} params.liveState - circuit state attuale
 * @param {Function} [params.llmCall=defaultLLMCall] - injected LLM client
 * @param {Object} [params.options]
 * @returns {Promise<Object>} Percorso enriched
 */
export async function generatePercorso({
  capitolo,
  classMemory = null,
  teacherMemory = null,
  liveState = null,
  llmCall = defaultLLMCall,
  options = {},
}) {
  if (!capitolo) {
    return { success: false, error: 'capitolo required' };
  }

  const livello = classMemory?.livello ?? 'principiante';
  const stile = teacherMemory?.stile_didattico ?? 'da-osservare';
  const erroriRicorrenti = classMemory?.errori_ricorrenti ?? [];

  const promptFragment = buildCapitoloPromptFragment(capitolo, {
    activeExpId: options.activeExpId,
    activePhaseName: options.activePhaseName,
    maxCitations: options.maxCitations ?? 4,
  });

  const fullPrompt = [
    promptFragment,
    '',
    `[CONTEXT CLASSE]`,
    `livello: ${livello}`,
    `errori ricorrenti: [${erroriRicorrenti.join(', ')}]`,
    '',
    `[CONTEXT DOCENTE]`,
    `stile: ${stile}`,
    '',
    liveState ? `[LIVE CIRCUIT]\n${JSON.stringify(liveState).slice(0, 300)}` : '[LIVE CIRCUIT] (none)',
    '',
    `Genera percorso narrativo PRINCIPIO ZERO v3.1 in italiano.`,
  ].join('\n');

  let llmResult;
  try {
    llmResult = await llmCall(fullPrompt);
  } catch (err) {
    return {
      success: false,
      error: 'llm_call_failed',
      detail: err.message,
      fallback: buildStaticFallback(capitolo),
    };
  }

  const esperimentiOrdered = orderEsperimentiByLivello(capitolo.esperimenti ?? [], livello, erroriRicorrenti);

  return {
    success: true,
    capitolo_id: capitolo.id,
    livello,
    stile,
    intro_text: capitolo.narrative_flow?.intro_text ?? `Vediamo insieme il Capitolo ${capitolo.capitolo}.`,
    esperimenti_ordered: esperimentiOrdered.map((e) => ({
      id: e.id,
      num: e.num,
      title_classe: e.title_classe,
      page: e.volume_ref?.page_start ?? null,
      complexity: estimateComplexity(e),
    })),
    transitions: capitolo.narrative_flow?.transitions ?? [],
    citations: extractCitationPointers(capitolo),
    teacher_sidebar_summary: buildTeacherSidebarSummary(stile, esperimentiOrdered),
    closing: capitolo.narrative_flow?.closing_text ?? `Riassunto Capitolo ${capitolo.capitolo} completato.`,
    llm_meta: {
      content_preview: (llmResult.content ?? '').slice(0, 200),
      tokens_used: llmResult.tokens_used ?? null,
      model: llmResult.model ?? 'unknown',
    },
  };
}

export function orderEsperimentiByLivello(esperimenti, livello, erroriRicorrenti = []) {
  const sorted = [...esperimenti];
  if (livello === 'principiante') {
    sorted.sort((a, b) => (a.num ?? 0) - (b.num ?? 0));
  } else if (livello === 'avanzato') {
    sorted.sort((a, b) => estimateComplexity(b) - estimateComplexity(a));
  }
  if (erroriRicorrenti.length > 0) {
    sorted.sort((a, b) => {
      const aMatch = (a.assessment_invisible ?? []).some((s) => erroriRicorrenti.some((e) => s.includes(e)));
      const bMatch = (b.assessment_invisible ?? []).some((s) => erroriRicorrenti.some((e) => s.includes(e)));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }
  return sorted;
}

export function estimateComplexity(esp) {
  if (!esp) return 0;
  const components = esp.components_needed?.length ?? 0;
  const phases = esp.phases?.length ?? 0;
  const incremental = esp.build_circuit?.mode === 'incremental_from_prev' ? 1 : 0;
  return components * 2 + phases + incremental;
}

export function extractCitationPointers(capitolo) {
  if (!capitolo) return [];
  const pointers = [];
  for (const cit of capitolo.theory?.citazioni_volume ?? []) {
    pointers.push({ volume: capitolo.volume, page: cit.page, type: 'theory' });
  }
  for (const esp of capitolo.esperimenti ?? []) {
    if (esp.volume_ref?.page_start) {
      pointers.push({ volume: capitolo.volume, page: esp.volume_ref.page_start, type: 'experiment', esp_id: esp.id });
    }
  }
  return pointers;
}

export function buildTeacherSidebarSummary(stile, esperimentiOrdered) {
  const stileMap = {
    'hands-on': 'Approccio hands-on: lasciare scoperta autonoma classe.',
    narrativo: 'Approccio narrativo: leggere ad alta voce passaggi volume.',
    visivo: 'Approccio visivo: usare passo-passo simulatore.',
    'da-osservare': 'Stile docente da osservare. Default percorso lineare.',
  };
  return {
    stile_label: stileMap[stile] ?? stileMap['da-osservare'],
    next_action: esperimentiOrdered[0]
      ? `Prossimo: Esp ${esperimentiOrdered[0].num}`
      : 'Caricamento Capitolo',
    total_esperimenti: esperimentiOrdered.length,
  };
}

export function buildStaticFallback(capitolo) {
  return {
    capitolo_id: capitolo?.id ?? null,
    intro_text: capitolo?.narrative_flow?.intro_text ?? 'Caricamento Capitolo standard.',
    esperimenti_ordered: (capitolo?.esperimenti ?? []).map((e) => ({ id: e.id, num: e.num, title_classe: e.title_classe })),
    citations: extractCitationPointers(capitolo),
  };
}
