# Setup Custom Gem ELAB — Andrea 10 minuti

**Goal**: distribuire ELAB tutor come Custom Gem Gemini gratuito visibile a docenti scuole con Workspace EDU + Gemini Advanced personali.

## Pre-requisiti

- Account Google personale OR Workspace
- Gemini Advanced subscription ($19.99/mese) — NECESSARIO per Custom Gems
  - Alternativa free: Gemini base permette solo "Gem" condivisi con link, non distribuzione pubblica
  - Decisione Andrea: paghi $19.99 personale, le scuole usano gratis tramite link
- 3 PDF volumi pronti (cartella `/VOLUME 3/ELAB - TRES JOLIE/{1,2,3}/`)

## Step setup (10 min)

### 1. Apri Gem Manager (1 min)

```
https://gemini.google.com/gems
```

Click "+ New Gem" o "Create Gem".

### 2. Nome + descrizione (1 min)

- **Name**: `ELAB Tutor — Elettronica Arduino Scuole`
- **Description**: `Tutor AI per docenti italiani scuola media inferiore. Lezioni elettronica + Arduino dai 3 volumi ELAB Tutor. Compagno Gem per https://www.elabtutor.school`

### 3. Instructions (3 min)

Copia incolla SYSTEM PROMPT da `instructions.md` (questo repo). 8000 char limit OK.

### 4. Knowledge files upload (3 min)

Upload 3 PDF da:
- `/VOLUME 3/ELAB - TRES JOLIE/1 ELAB VOLUME UNO/2 MANUALE VOLUME 1/MANUALE VOLUME 1 ITALIANO.pdf`
- `/VOLUME 3/ELAB - TRES JOLIE/2 ELAB VOLUME DUE/2 MANUALE VOLUME  2/MANUALE VOLUME 2 ITALIANO.pdf`
- `/VOLUME 3/ELAB - TRES JOLIE/3 ELAB VOLUME TRE/2 MANUALE VOLUME 3/<file>.pdf` (verifica esistenza)

Verifica: Gem riconosce 3 file, totale ~52MB, limit 100MB OK.

### 5. Test conversation (2 min)

Prompt test:
```
"Spiegami il LED del Vol.1 cap.6 ai ragazzi di 4ª elementare"
```

Risposta attesa:
- Inizia "Ragazzi,"
- Cita Vol.1 pag.X
- Analogia (porta girevole / lampadina)
- Max 120 parole
- Termina con invito kit fisico O link `elabtutor.school`

Se fallisce: ritorna step 3 instructions, regola system prompt.

### 6. Share + distribute (intuitivo)

Click "Share" → toggle public link OR specific email list. URL `https://gemini.google.com/gem/<id>`.

**Lista distribuzione iniziale**:
- Davide Fagherazzi (per MePA pitch + scuole network)
- Giovanni Fagherazzi (per Arduino global sales contacts EDU)
- 3-5 docenti early adopter via email (chiedere a Davide nominativi PNRR)

## Telemetria

Gemini Gem manager mostra:
- Conversation count
- Active users
- Common questions (se permesso)

Andrea controlla settimanale: trazione = decidere pivot Path 3 completo (Teams Tab + Schoolwork) o stop.

## Costo Andrea

- $19.99/mese Gemini Advanced personale (necessario per creare/usare Gem custom)
- $0 per docenti utilizzatori (basta loro account Google free per accedere shared Gem? VERIFICA — alcune fonti dicono che Gem condiviso richiede destinatari Advanced anche loro)

⚠️ **Verify breakpoint**: se Gem condiviso richiede destinatari pure Gemini Advanced = barrier $19.99/docente. Soluzione alt: Gem condiviso via Workspace EDU = gratuito per scuole con EDU plan attivo (verificare anche tier EDU Fundamentals OK).

## Decisione gate

Se trazione 14 giorni:
- 3+ docenti attivi → procedi Path 3 completo (Teams Tab + Schoolwork)
- 0-2 docenti attivi → stop pivot, riprova Path 1 o 2

Honest: senza distribuzione attiva (Davide/Giovanni email outreach), Gem creato resta invisibile.

## File companion in questo repo

- `instructions.md` — system prompt completo
- `setup-andrea-10min.md` — questo file
- `welcome-card.md` — testo welcome message Gem
- `test-prompts.md` — 10 prompt test verifica qualità (TODO)
