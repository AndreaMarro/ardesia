# UNLIM Lesson Preparation — Architettura

## Visione (parole di Andrea, 02/04/2026)

> UNLIM prepara le lezioni in base al contesto precedente e agli esperimenti dei volumi ELAB.
> Struttura della lezione variabile in base a cosa succede.
> UNLIM guida, risponde, usa linguaggio 10-14 anni.
> Minimale, estetica ELAB, tutti gli strumenti disponibili.
> Totalmente interfacciato allo stato e agli stati passati del sistema.
> Screenshot, onnipotente, onnisciente, linguaggio naturale.
> **FONDAMENTALE**: UNLIM DEVE PREPARARE LE LEZIONI in base agli esperimenti dei volumi
> e al contesto delle lezioni passate. GUIDA INVISIBILE. PRINCIPIO ZERO.

## Architettura

```
┌─────────────────────────────────────────────┐
│  DOCENTE dice: "prepara la lezione"         │
│  (linguaggio naturale → isLessonPrepCommand) │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  useGalileoChat.js                          │
│  Rileva il comando → chiama prepareLesson() │
└──────────────────┬──────────────────────────┘
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
    ┌──────────┐ ┌──────────┐ ┌──────────────┐
    │ Lesson   │ │ Past     │ │ RAG          │
    │ Paths    │ │ Sessions │ │ (246 chunk   │
    │ (62 JSON)│ │ (memory) │ │  dai volumi) │
    └────┬─────┘ └────┬─────┘ └──────┬───────┘
         │            │              │
         └────────────┼──────────────┘
                      ▼
         ┌──────────────────────┐
         │ Gemini API           │
         │ (personalizzazione)  │
         │ Prompt: lesson path  │
         │ + context + RAG      │
         └──────────┬───────────┘
                    ▼
         ┌──────────────────────┐
         │ Piano Lezione        │
         │ - Intro personalizzato│
         │ - 5 fasi (PREPARA→   │
         │   MOSTRA→CHIEDI→     │
         │   OSSERVA→CONCLUDI)  │
         │ - Suggerimenti AI    │
         │ - Adattamento errori │
         └──────────────────────┘
```

## File coinvolti

| File | Ruolo |
|------|-------|
| `src/services/lessonPrepService.js` | Servizio preparazione lezione |
| `src/components/lavagna/useGalileoChat.js` | Hook chat (rileva comando, chiama servizio) |
| `src/data/lesson-paths/*.json` | 62 percorsi lezione strutturati (5 fasi ciascuno) |
| `src/hooks/useSessionTracker.js` | Dati sessioni passate (localStorage) |
| `supabase/functions/_shared/rag.ts` | RAG semantico dai volumi (246 chunk) |
| `supabase/functions/unlim-chat/index.ts` | Backend AI con RAG iniettato |
| `data/rag/all-chunks.json` | 246 chunk testo dai 3 volumi PDF |
| `data/rag/embeddings-cache.json` | 246 embeddings Gemini (3072 dim) |

## Comandi naturali supportati

Il docente puo dire:
- "Prepara la lezione"
- "Pianifica la lezione"
- "Cosa facciamo oggi?"
- "Preparami la lezione"
- "Suggerisci un esperimento"
- "Lezione di oggi"

## Come funziona la personalizzazione

1. **Prima volta**: UNLIM saluta, presenta l'obiettivo, lista componenti
2. **Sessione precedente recente**: Continua da dove si era rimasti
3. **Errori frequenti**: Anticipa i problemi comuni e prepara il docente
4. **Pausa lunga (>7 giorni)**: Suggerisce un ripasso prima di proseguire

## Principio Zero

Solo il DOCENTE interagisce con UNLIM. Gli studenti lavorano sul simulatore.
UNLIM e la guida invisibile del docente — prepara, suggerisce, adatta.
Il docente poi guida la classe usando le indicazioni di UNLIM.

## Prossimi step

1. **RAG live su Supabase**: Caricare i 246 embeddings per ricerca semantica
2. **Fase per fase**: UNLIM guida il docente attraverso ogni fase della lezione in tempo reale
3. **Screenshot automatici**: UNLIM cattura lo stato del simulatore per documentare
4. **Report post-lezione**: Fumetto generato automaticamente con le foto
5. **Suggerimento prossimo esperimento**: Basato su cosa e andato bene/male
