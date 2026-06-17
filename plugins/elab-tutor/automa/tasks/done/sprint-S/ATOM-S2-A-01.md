---
id: ATOM-S2-A-01
parent_task: A
sprint: S
iter: 2
assignee: generator-app-opus
depends_on: []
est_hours: 1.5
files_owned:
  - supabase/functions/_shared/capitoli-loader.ts
acceptance_criteria:
  - Function buildCapitoloPromptFragment(capitolo, esperimento?) exported in capitoli-loader.ts
  - Returns string fragment with: titolo capitolo, narrative_flow segment for active esperimento, citazioni_volume formatted as quotes Vol.N pag.X, figure_refs as fig.X.Y captions, transition_text if present
  - Max 800 char output (token economy), truncate with ellipsis if longer
  - Returns empty string if capitolo or esperimento undefined (graceful)
  - Pure function: no IO, no Deno globals
  - JSDoc with @example showing typical usage from unlim-chat/index.ts
references:
  - docs/strategy/2026-04-26-master-plan-v2-comprehensive.md §4.3 + §5.1 (TheorySchema fields)
  - docs/adrs/ADR-008-buildCapitoloPromptFragment-design.md (architect-opus delivers in parallel)
  - existing getCapitoloByExperimentId at supabase/functions/_shared/capitoli-loader.ts:64
---

## Task

Implement `buildCapitoloPromptFragment(capitolo: Capitolo, esperimento?: Esperimento): string` in `supabase/functions/_shared/capitoli-loader.ts`.

This converts the Capitolo schema (Q1) into a compact prompt fragment to inject into UNLIM system prompt, enabling capitolo-aware responses without requiring full schema in token budget.

## Implementation outline

```ts
export function buildCapitoloPromptFragment(
  capitolo: Capitolo,
  esperimento?: { id: string; title?: string; theory?: TheorySchema }
): string {
  if (!capitolo) return '';
  const lines: string[] = [];
  lines.push(`CAPITOLO ATTIVO: ${capitolo.titolo} (Vol.${capitolo.volume})`);
  if (esperimento?.title) lines.push(`Esperimento corrente: ${esperimento.title}`);
  if (esperimento?.theory?.testo_classe) {
    lines.push(`Narrativa: ${truncate(esperimento.theory.testo_classe, 200)}`);
  }
  if (esperimento?.theory?.citazioni_volume?.length) {
    const cite = esperimento.theory.citazioni_volume[0];
    lines.push(`Citazione disponibile: «${truncate(cite.quote, 120)}» Vol.${capitolo.volume} pag.${cite.page}`);
  }
  // ... (figure_refs, transition_text, etc.)
  return truncate(lines.join('\n'), 800);
}
```

## CoV before claim done

- 3x `npx vitest run tests/unit/supabase/capitoli-loader.test.ts` PASS (test scaffold by ATOM-S2-A-02)
- `npx vitest run` baseline ≥12498 PASS preserved
- `npm run build` PASS (Edge Function bundles)
