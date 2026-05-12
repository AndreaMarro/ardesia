/**
 * capitoloPromptBuilder — Sprint Q3.C
 * Andrea Marro 2026-04-25
 *
 * Costruisce frammento di prompt LLM dal Capitolo schema, ottimizzato token.
 * Consumed by Edge Function (via Deno-compat shared module) + frontend testing.
 *
 * PRINCIPIO ZERO v3.1:
 * - parla ai RAGAZZI plurale
 * - cita Vol.X pag.Y
 * - max 120 parole risposta (feedback 2026-05-10, analogie opzionali)
 * - dual output classe_display + docente_sidebar
 *
 * Token optimization (50% saving stimato):
 * - selective phase context (active phase only, ~100 tok vs 500)
 * - citation pointers {vol, page, quote 5 words} instead of full chapters
 * - narrative_flow.transitions pre-authored (no LLM regen)
 */

const PRINCIPIO_ZERO_RULES = `
VINCOLI RISPOSTA (PRINCIPIO ZERO v3.2 — feedback 2026-05-10):
- Parla ai RAGAZZI plurale ("Vediamo insieme", "Provate")
- MAI rivolto direttamente al docente come comando
- Max 120 parole ben formattate; analogie OPZIONALI (usa solo se chiariscono)
- CITA Vol.X pag.Y quando rilevante per ancorare al volume cartaceo
- Output dual: classe_display narrative + docente_sidebar nominale
`.trim();

/**
 * Estrae anchor citations dal Capitolo (volume_ref + theory citations).
 * Returns array of {volume, page, quote_short} max 100 chars per quote.
 */
export function extractCitationAnchors(capitolo, options = {}) {
  if (!capitolo) return [];
  const max = options.max ?? 5;
  const anchors = [];
  const volume = capitolo.volume;

  for (const cit of capitolo.theory?.citazioni_volume ?? []) {
    if (anchors.length >= max) break;
    anchors.push({
      volume,
      page: cit.page,
      quote: (cit.quote ?? '').slice(0, 100),
      context: cit.context ?? 'mid_narrative',
    });
  }
  for (const esp of capitolo.esperimenti ?? []) {
    if (anchors.length >= max) break;
    if (esp.volume_ref?.page_start) {
      anchors.push({
        volume,
        page: esp.volume_ref.page_start,
        quote: `Esperimento ${esp.num}: ${esp.title_classe ?? esp.id}`.slice(0, 100),
        context: 'experiment',
      });
    }
  }
  return anchors;
}

/**
 * Selezziona contesto attivo da Capitolo (phase corrente, esperimento corrente).
 * activeExpId opzionale: se null, usa primo esperimento.
 * activePhaseName opzionale: se null, usa PREPARA.
 */
export function selectActiveContext(capitolo, activeExpId = null, activePhaseName = null) {
  if (!capitolo) return null;
  const exp = activeExpId
    ? (capitolo.esperimenti ?? []).find((e) => e.id === activeExpId)
    : capitolo.esperimenti?.[0] ?? null;
  if (!exp) {
    return {
      capitolo_id: capitolo.id,
      capitolo_titolo: capitolo.titolo,
      type: capitolo.type,
      theory_excerpt: (capitolo.theory?.testo_classe ?? '').slice(0, 400),
      esperimento: null,
      phase: null,
    };
  }
  const phase = activePhaseName
    ? (exp.phases ?? []).find((p) => p.name === activePhaseName)
    : exp.phases?.[0] ?? null;
  return {
    capitolo_id: capitolo.id,
    capitolo_titolo: capitolo.titolo,
    type: capitolo.type,
    theory_excerpt: (capitolo.theory?.testo_classe ?? '').slice(0, 400),
    esperimento: {
      id: exp.id,
      num: exp.num,
      title_classe: exp.title_classe,
      title_docente: exp.title_docente,
      page_start: exp.volume_ref?.page_start ?? null,
      build_mode: exp.build_circuit?.mode ?? 'from_scratch',
      components_summary: (exp.components_needed ?? []).map((c) => c.name).slice(0, 6).join(', '),
    },
    phase: phase
      ? {
          name: phase.name,
          classe_text_hook: phase.classe_display?.text_hook ?? null,
          classe_observation: phase.classe_display?.observation_prompt ?? null,
          docente_step: phase.docente_sidebar?.step_corrente ?? null,
          docente_spunto: phase.docente_sidebar?.spunto_per_classe ?? null,
        }
      : null,
  };
}

/**
 * Costruisce frammento di prompt strutturato.
 * Output: stringa Italian-language pronta per system prompt iniezione.
 */
export function buildCapitoloPromptFragment(capitolo, options = {}) {
  if (!capitolo) return '';
  const ctx = selectActiveContext(capitolo, options.activeExpId, options.activePhaseName);
  const anchors = extractCitationAnchors(capitolo, { max: options.maxCitations ?? 4 });

  const parts = [];
  parts.push(`[CONTESTO CAPITOLO ELAB]`);
  parts.push(`Cap: ${ctx.capitolo_titolo} (${ctx.capitolo_id}, Vol.${capitolo.volume})`);
  parts.push(`Tipo: ${ctx.type}`);
  if (ctx.theory_excerpt) {
    parts.push(`Teoria: "${ctx.theory_excerpt}"`);
  }
  if (ctx.esperimento) {
    parts.push(`Esperimento attivo: ${ctx.esperimento.num} — ${ctx.esperimento.title_classe} (Vol.${capitolo.volume} pag.${ctx.esperimento.page_start})`);
    if (ctx.esperimento.components_summary) {
      parts.push(`Componenti: ${ctx.esperimento.components_summary}`);
    }
    parts.push(`Build mode: ${ctx.esperimento.build_mode}`);
  }
  if (ctx.phase) {
    parts.push(`Fase: ${ctx.phase.name}`);
    if (ctx.phase.classe_text_hook) parts.push(`Hook classe: "${ctx.phase.classe_text_hook}"`);
    if (ctx.phase.docente_step) parts.push(`Docente step: ${ctx.phase.docente_step}`);
  }
  if (anchors.length > 0) {
    parts.push(`[ANCHOR CITAZIONI VOLUME]`);
    anchors.forEach((a) => {
      parts.push(`- Vol.${a.volume} pag.${a.page}: "${a.quote}" (${a.context})`);
    });
  }
  parts.push(``);
  parts.push(PRINCIPIO_ZERO_RULES);
  return parts.join('\n');
}

/**
 * Stima token count del frammento (approssimazione Italian: ~4 char/token).
 */
export function estimatePromptTokens(fragment) {
  if (!fragment) return 0;
  return Math.ceil(fragment.length / 4);
}
