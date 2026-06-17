# ELAB Distribution — pivot Path 3 hybrid pilot

**Scope**: distribuzione ELAB Tutor su superfici dove docenti italiani scuole 8-14 anni già lavorano (Workspace EDU, Microsoft 365 EDU, ChatGPT Plus EDU).

**Decisione strategica iter 10 (2026-05-10 Andrea critique brutale)**:
- Patch incrementali Edge Function R5 81→91.70% PASS = quality OK ma INVISIBILE
- ELAB web app standalone = nessun docente arriva senza marketing
- Pivot raccomandato: integrate dove docenti ESISTONO già

## Path 3 hybrid 2 superfici pilot

| Superficie | File guide | Effort | Cost Andrea | Distribuzione |
|---|---|---|---|---|
| **Custom Gem Workspace EDU** | `gemini-custom-gem/` | 10 min | $19.99/mese (Gemini Advanced) | Workspace EDU 70% scuole IT |
| **Microsoft Teams Tab EDU** | `microsoft-teams-tab/` | 1.5 giorni | $0 pilot ($99/anno listing AppSource opt) | M365 EDU 50%+ scuole IT PNRR |

**Tempo totale pilot**: 2-3 giorni dev + 14 giorni outreach = **17 giorni TOTAL**.

## Sequenza pilot 14 giorni

### Giorno 1 (Andrea, 10 min)
- Setup Custom Gem Gemini → `gemini-custom-gem/setup-andrea-10min.md`
- Test conversation 5 prompt
- Share link a Davide + Giovanni

### Giorno 2-3 (Andrea + Tea, ~1.5 giornate)
- Frontend route `/teams/configure` + Teams SDK init → `microsoft-teams-tab/setup-andrea-30min.md`
- Genera UUID + icone 192px + 32px
- Package zip + side-load sandbox tenant test
- Verifica simulatore + chat dentro Teams desktop

### Giorno 4-5 (Andrea + Davide/Giovanni outreach)
- Email 5 docenti early adopter Davide list (PNRR scuole)
- Allegato: zip Teams app + link Custom Gem
- Email pitch:
  > "Provate ELAB Tutor direttamente in Microsoft Teams (zip allegato 5min IT setup) o come Custom Gem Gemini (link diretto). Zero onboarding nuovo, zero abbonamento per la scuola. Free pilot 14 giorni con feedback."

### Giorno 6-13 (passive)
- Telemetria daily check Teams Admin + Gem analytics
- Email mid-pilot: "come sta andando? Domande?"

### Giorno 14 (decision gate)
- 3+ scuole attive 1+ tab Teams + Gem usato 5+ volte = **GO Path 3 completo** (Schoolwork iOS + Classroom Add-on + ChatGPT Apps SDK + listing AppSource)
- 0-2 attivi = **STOP pivot, valuta web app pure marketing direct**

## Honest caveat

- Pilot ha bisogno di outreach attivo Davide/Giovanni — senza nominativi docenti reali = tutto inutile
- Custom Gem richiede Gemini Advanced anche destinatari? VERIFICA breaking
- Teams Tab iOS limita WebGL simulatore = solo desktop full features
- 14 giorni pilot è MOLTO breve per scuole — cycle decisione PA tipico 3-6 mesi

## File companion

- `gemini-custom-gem/instructions.md` — system prompt + welcome + esempi
- `gemini-custom-gem/setup-andrea-10min.md` — step-by-step setup Gem
- `microsoft-teams-tab/manifest.json` — Teams app scaffold
- `microsoft-teams-tab/setup-andrea-30min.md` — step-by-step setup Tab + side-load

## Cosa serve da Andrea

1. **Decisione**: pilot 14gg OR continua iter 10+ patch incrementali?
2. **Workspace + Gemini Advanced** subscription ($19.99/mese)
3. **5 nominativi docenti pilot** (chiedere Davide PNRR network)
4. **1.5 giornate dev Tea** (route /teams/configure + manifest packaging)
5. **Email outreach** a docenti pilot

Senza azioni 1-5 = files in repo restano scaffold inutilizzati.
