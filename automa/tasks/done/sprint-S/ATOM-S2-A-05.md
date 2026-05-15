---
id: ATOM-S2-A-05
parent_task: A
sprint: S
iter: 2
assignee: generator-app-opus
depends_on: []
est_hours: 1
files_owned:
  - supabase/functions/_shared/system-prompt.ts
acceptance_criteria:
  - BASE_PROMPT lines 14-86 replaced with revised text per master plan §4.4 (PRINCIPIO ZERO + USO DELLE FONTI 4 sources A/B/C/D + REGOLA SINTESI vs CITAZIONE rules + format citazione + SE DEVI CITARE FONTE)
  - buildSystemPrompt signature extended with optional capitoloFragment param (default empty)
  - When capitoloFragment provided, injected after PRINCIPIO ZERO block, before STATO LIVE
  - Existing call sites (only unlim-chat/index.ts:234) MUST keep working with no capitoloFragment passed (backward compat)
  - Wire-up A-06 will pass capitoloFragment from A-01
  - Word budget: BASE_PROMPT total <1500 char (token economy)
references:
  - docs/strategy/2026-04-26-master-plan-v2-comprehensive.md §4.4 verbatim revision text
  - existing supabase/functions/_shared/system-prompt.ts lines 14-86 (CURRENT verbatim mandate to REPLACE)
  - ATOM-S2-A-01 (capitoloFragment input shape)
---

## Task

Replace BASE_PROMPT in `supabase/functions/_shared/system-prompt.ts` per master plan §4.4. Extend `buildSystemPrompt()` signature.

## Replacement text (verbatim from master plan §4.4)

```
PRINCIPIO ZERO — REGOLA SUPREMA:
CHIUNQUE apre ELAB Tutor deve essere in grado di spiegare ai ragazzi senza conoscenze pregresse.
Tu (UNLIM) prepari il contenuto in linguaggio 10-14 anni che il docente proietta sulla LIM.

USO DELLE FONTI:
Hai accesso a 4 fonti di sapere:
A. WIKI LLM (concept md compiled): definizioni precise, analogie validate, errori comuni
B. RAG VOLUMI (chunk dei 3 volumi cartacei): testo originale, autorevolezza
C. MEMORIA CLASSE/DOCENTE: livello, esperimenti fatti, errori ricorrenti
D. STATO LIVE: circuito attuale, codice attuale, esperimento attivo

REGOLA SINTESI vs CITAZIONE:
- DEFAULT: SINTETIZZA. Combina A+B+C+D + tuo sapere generale → risposta in linguaggio 10-14 anni.
- CITAZIONE FEDELE quando: la domanda è "cosa dice il libro su X" OPPURE "leggi pagina N" OPPURE durante introduzione concetto cardine in Modalità Percorso.
- Format citazione: «...frase esatta libro...» — Vol.N pag.X
- MAI copia 3+ frasi di seguito dal libro. Citazione = ancora autorevolezza, non sostituto sintesi.

SE DEVI CITARE FONTE:
- Volume cartaceo → «testo» Vol.N pag.X (sempre)
- Wiki concept → "Dal nostro glossario: [concept]" + frase chiave (raro)
- Memoria classe → "Ricordate quando avete provato [esperimento]?" (medio)
- Sapere generale → nessuna fonte esplicita (default)
```

## Signature change

```ts
// FROM:
export function buildSystemPrompt(
  studentContext: StudentContext,
  circuitState: CircuitState | null,
  experimentContext: ExperimentContext
): string

// TO:
export function buildSystemPrompt(
  studentContext: StudentContext,
  circuitState: CircuitState | null,
  experimentContext: ExperimentContext,
  capitoloFragment?: string  // NEW optional, injected if provided
): string
```

## CoV

- baseline ≥12498
- npm run build PASS
- existing tests/integration/* still PASS (no breaking change)
