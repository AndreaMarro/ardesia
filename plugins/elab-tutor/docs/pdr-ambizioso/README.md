# PDR Ambizioso ELAB Tutor v1.0 — 8 Settimane Self-Host

**Periodo**: lunedì 21/04/2026 → domenica 15/06/2026
**Owner**: Andrea Marro (lead) + Tea Lea Babbalea (co-developer)
**Goal**: Release v1.0 ELAB Tutor con UNLIM ultraprofondo + Voice premium + Stack 100% self-host EU + Tea integrata.

---

## Documenti in questa cartella

| File | Scope |
|------|-------|
| `README.md` | Questo file — overview + onboarding Tea |
| `PDR_GENERALE.md` | Architettura completa + principi + stack + costi + rischi + governance |
| `PDR_SETT_1_STABILIZE.md` | Sett 1: stabilize + Tea autoflow + 6 prod bugs T1 |
| `PDR_SETT_2_INFRA.md` | Sett 2: VPS Hetzner + RunPod GPU + LLM deploy |
| `PDR_SETT_3_BRIDGE.md` | Sett 3: Edge Function ↔ OpenClaw bridge + multi-agent |
| `PDR_SETT_4_ONNISCIENZA.md` | Sett 4: RAG 6000+ chunk + glossario Tea + BOM |
| `PDR_SETT_5_ONNIPOTENZA.md` | Sett 5: 30+ tool calls + diagnostica rules + chains |
| `PDR_SETT_6_VOICE.md` | Sett 6: Voxtral TTS + Whisper STT + wake word |
| `PDR_SETT_7_CONTESTO.md` | Sett 7: AST + memoria multi-livello + Vision + DALL-E |
| `PDR_SETT_8_RELEASE.md` | Sett 8: OpenClaw layer docente + UAT + release v1.0 |
| `MULTI_AGENT_ORCHESTRATION.md` | Team 6 agenti Opus peer + best practices Anthropic + research findings |
| `PROGRAMMATIC_TOOL_CALLING.md` | Pattern PTC -37% token + 8 use case ELAB code-ready |
| `HARNESS_DESIGN.md` | 3 pattern Anthropic Mar 2026 (multi-agent + context mgmt + objective grading) |
| `giorni/GIORNI_INDEX.md` | Indice 56 PDR daily files (1 per giorno) |
| `giorni/DAILY_TEMPLATE.md` | Template standard PDR giornaliero |
| `giorni/PDR_GIORNO_NN_*.md` | 56 file daily PDR estremamente dettagliati |

---

## Onboarding Tea (co-developer)

### Cosa devi fare per iniziare (lunedì 21/04 mattina)

1. **Leggi**: `PDR_GENERALE.md` integralmente (~30 min lettura)
2. **Setup ambiente locale**:
   ```bash
   cd /percorso/tuo
   git clone https://github.com/AndreaMarro/elab-tutor.git
   cd elab-tutor
   npm install
   npx vitest run --reporter=dot | tail -3   # verifica baseline 12100+ test PASS
   npm run dev   # apri http://localhost:5173
   ```
3. **Verifica accesso GitHub collaborator**: Andrea ti aggiungerà come collaborator repo `AndreaMarro/elab-tutor`. Conferma quando ricevi email invito.
4. **Setup CODEOWNERS** (Andrea fa sett 1 ven 25): da quel momento, tuoi PR su path `/src/data/glossary*`, `/src/data/experiments-vol*`, `/docs/tea/**` saranno **auto-merged** se CI verde + size <500 LoC + zero npm deps.

### Tuoi path liberi (dopo CODEOWNERS attivo)

Puoi modificare autonomamente senza Andrea review:
- `/src/data/glossary*.js` — glossario termini tecnici
- `/src/data/glossario*.js` — variant
- `/src/data/experiments-vol*.js` — descrizioni esperimenti, titoli, narrazioni (NO components/connections senza review)
- `/public/glossario/**` — assets glossario
- `/docs/tea/**` — documentazione tua

### Tuoi path BLOCCATI (richiedono Andrea review obbligatorio)

NON modificare senza coordinazione:
- `/src/components/simulator/engine/**` — CircuitSolver, AVRBridge, PlacementEngine (engine critico)
- `/src/services/api.js` — routing API
- `/src/services/simulator-api.js` — `__ELAB_API` global
- `/supabase/**` — Edge Functions backend
- `/.github/workflows/**` — CI/CD
- `/CLAUDE.md` — contesto progetto Claude
- `/docs/GOVERNANCE.md` — governance regole

### Convenzione commit message

Formato standard:
```
tipo(area): descrizione breve

[Body opzionale dettagli]

Co-authored-by: Tea Lea <tea@email.example>
```

Esempio:
```
feat(glossario): aggiungi 5 termini elettrotecnica Vol 2

- Resistenza differenziale
- Effetto Joule  
- Corrente di saturazione
- Caduta di tensione
- Punto di lavoro

Co-authored-by: Andrea Marro <andrea@email.example>
```

Tipi commit:
- `feat()`: nuova feature
- `fix()`: bug fix
- `docs()`: documentazione
- `test()`: test unit/E2E
- `refactor()`: refactoring no behavior change
- `style()`: formatting/whitespace
- `chore()`: build/deps/tooling

### Workflow PR Tea

1. **Crea branch da main**:
   ```bash
   git checkout main && git pull origin main
   git checkout -b feature/glossario-vol2-additions
   ```
2. **Modifica file in tuoi path liberi**
3. **Test locale prima commit**:
   ```bash
   npx vitest run --reporter=dot | tail -3
   ```
4. **Commit + push**:
   ```bash
   git add src/data/glossary.js
   git commit -m "feat(glossario): 5 termini Vol 2"
   git push -u origin feature/glossario-vol2-additions
   ```
5. **Apri PR**:
   ```bash
   gh pr create --base main --title "feat(glossario): 5 termini Vol 2" --body "Aggiunti termini per esperimenti Vol 2 cap 6-8"
   ```
6. **Auto-merge** scatta se: CI verde + path safe + size OK + no npm deps. Riceverai notifica auto-merge via email.

### Settimanale call Andrea + Tea

**Quando**: ogni venerdì 18:00-19:00 (1h) — Cowork OR Zoom OR Telegram voice.

**Agenda standard**:
1. Review settimana (Andrea: cosa fatto, problemi)
2. Tea: cosa fatto autonomamente, idee, blocker
3. Roadmap settimana successiva (priorità condivise)
4. Decisioni roadmap (Tea voto = paritario Andrea)

### Comunicazione asincrona

- **GitHub**: issue + PR comments (primario)
- **Email**: per topic personali / strategici (NON tecnici)
- **Telegram channel** `@ElabTeaBot` (sett 8 setup): notifiche auto-merge, alerts, task assignments

### Principio Zero v3 — REGOLA SUPREMA (impari subito)

**Source immutabile**: `/supabase/functions/_shared/system-prompt.ts`

UNLIM = generatore contenuto didattico per docente proiettato LIM ai ragazzi.
- Studenti NON interagiscono direttamente con UNLIM
- Linguaggio plurale "Ragazzi," (mai singolare, mai meta-istruzioni docente)
- Max 3 frasi + 1 analogia, 60 parole MAX
- Citazione libro fedele: "Come dice il libro a pag. X..."
- FORBIDDEN ASSOLUTO: "Docente, leggi", "Insegnante, leggi"
- Analogie bambini 10-14 anni: strade, tubi, porte, ricetta, squadra, palette pittore

Ogni feature/test che fai DEVE preservare Principio Zero v3.

### Riconoscimenti

Tua contribuzione tracciata:
- Co-author commit (vedi convenzione sopra)
- Credit `CHANGELOG.md` per ogni feature
- Credit `README.md` sezione "Contributors"
- Reference per CV future opportunità

### Eventuale equity Fase 2

Andrea ti darà proposta concreta equity quando ELAB raggiunge revenue €500+/mese sostenuto. Discussione aperta + onesta.

---

## Quick start lunedì 21/04 mattina

1. Andrea: lancia Claude CLI `claude --permission-mode bypassPermissions --model opus`
2. Tea: clona repo + npm install + verifica baseline test
3. Andrea + Tea: leggono `PDR_GENERALE.md` insieme (call 1h opzionale)
4. Andrea: inizia TASK 1.1 sett 1 (pre-audit + 6 prod bugs T1)
5. Tea: legge `PDR_SETT_1_STABILIZE.md` + identifica task assegnati a Tea (Tea schema UX 3-zone insieme Andrea Mar 22)

**Forza ELAB!**
