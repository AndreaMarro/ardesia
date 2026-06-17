# Setup Microsoft Teams Tab ELAB — Andrea 30 minuti

**Goal**: distribuire ELAB come Tab Microsoft Teams installabile da docenti italiani Workspace 365 EDU. Visibilità diretta dentro Teams classe.

## Pre-requisiti

- Microsoft 365 Developer account (gratis): https://developer.microsoft.com/en-us/microsoft-365/dev-program
  - Sandbox tenant EDU per test
- Microsoft Partner Center account ($99/anno) — ONLY se vuoi listing AppSource ufficiale
  - Alternativa GRATIS: distribuzione "side-loading" via manifest .zip diretta a scuole (ZERO costo, ma manuale per ogni scuola)
- Logo ELAB:
  - `icon-192.png` (192×192 colore Navy #1E4D8C)
  - `icon-32-outline.png` (32×32 outline)
  - Genera tu da `LOGO ELAB Tutor` esistente in repo

## Step setup (30 min)

### 1. Frontend: route `/teams/configure` (10 min, Andrea + dev)

Aggiungi route in `src/App.jsx`:
- `/teams/configure` → componente che riceve Teams Context (team/channel ID), chiede docente "scegli classe ELAB", salva mapping in Supabase tabella `teams_class_mapping (teams_team_id, elab_class_key, created_at)`.
- `/lavagna?platform=teams` → componente esistente Lavagna + side-effect comunicazione con Teams SDK
- `/chatbot-only?platform=teams` → componente esistente UNLIM chat + read-only mode (no destructive actions)

Stack richiesto:
- `@microsoft/teams-js` SDK npm install (~50KB)
- Inizializza `microsoftTeams.app.initialize()` in App.jsx mount

### 2. Backend: Supabase tabella + Edge Function (5 min)

```sql
CREATE TABLE teams_class_mapping (
  teams_team_id text PRIMARY KEY,
  elab_class_key text NOT NULL,
  teacher_email text,
  created_at timestamptz DEFAULT now(),
  metadata jsonb
);
ALTER TABLE teams_class_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_own_team" ON teams_class_mapping
  FOR SELECT TO anon USING (true);
```

Edge Function `unlim-chat` accept query param `?platform=teams&team_id=xxx` → lookup class_key in mapping.

### 3. Manifest packaging (5 min)

```bash
cd docs/distribution/microsoft-teams-tab
# Genera UUID
uuidgen | tr '[:upper:]' '[:lower:]' > .uuid
# Sostituisci ELAB-TUTOR-PLACEHOLDER-UUID nel manifest.json con UUID generato
# Aggiungi 2 PNG icone (192px + 32px outline)
zip elab-tutor-teams-app.zip manifest.json icon-192.png icon-32-outline.png
```

### 4. Side-load test sandbox tenant (5 min)

1. Apri https://teams.microsoft.com con account M365 Developer sandbox
2. Apps → Manage your apps → Upload an app → Upload a custom app
3. Seleziona `elab-tutor-teams-app.zip`
4. Aggiungi a un team test
5. Verifica:
   - Tab "Lavagna ELAB" carica `elabtutor.school/lavagna?platform=teams`
   - Tab "Tutor UNLIM" carica `chatbot-only?platform=teams`
   - Configurazione iniziale chiede class_key

### 5. Distribuzione (variable)

**Opzione A — AppSource listing** ($99/anno + ~2 settimane review Microsoft)
- Submit via Partner Center
- Pro: visibile a tutti tenant Microsoft EDU global
- Con: review process, pricing decisions, support obligations

**Opzione B — Side-load manuale** (gratis, immediato)
- Distribuisci `elab-tutor-teams-app.zip` direttamente via email/sito a docenti
- Docente scuola IT admin carica nel proprio tenant (5 min)
- Pro: gratis, controllo distribuzione, pilot rapido
- Con: ogni scuola fa upload manuale

**Raccomandato per pilot**: Opzione B 4-5 scuole pilot. Se trazione → Opzione A.

## Costo Andrea

- M365 Developer: $0
- Partner Center listing: $99/anno (opzionale, solo se decidi listing pubblico)
- Logo + icone: 1h grafico + nuovi assets
- Frontend dev (route + Teams SDK): 1 giornata Andrea OR Tea
- Backend (1 SQL migration + Edge Function param): 30 min

Total: ~1.5 giorni dev + $0 (pilot)

## Telemetria

Teams Admin Center mostra:
- Tab installs per tenant
- Active users per tab
- Time spent in tab

Andrea richiede a docenti pilot screen-share Teams Admin per verificare trazione.

## Decisione gate post-pilot 14gg

- 3+ scuole attive Tab installato → procedi Path 3 completo + Schoolwork iOS + Classroom Add-on
- 0-2 → stop pivot Teams, valuta Google Classroom only o Web app standalone

## Honest caveat

- Teams Tab limit: simulatore canvas LARGE (NanoR4Board SVG 300KB) carica in iframe Teams desktop OK, mobile Teams iOS limit memory possibile
- Teams iOS app NON supporta WebGL pieno → simulatore solo desktop Teams OK
- iPad Teams app limita JS — Lavagna potrebbe non funzionare full features

## File companion in questo repo

- `manifest.json` — Teams app manifest scaffold
- `setup-andrea-30min.md` — questo file
- `icon-192.png` — TODO Andrea genera
- `icon-32-outline.png` — TODO Andrea genera

## Next steps Andrea action

1. Genera UUID + icone (10 min)
2. Frontend route `/teams/configure` (Andrea o Tea, 1 giornata)
3. Side-load test sandbox (5 min)
4. Pilot 3-5 scuole (1 settimana outreach Davide/Giovanni)
5. Decision gate 14gg

Senza Andrea action lato canale distribuzione = manifest resta scaffold senza utenti.
