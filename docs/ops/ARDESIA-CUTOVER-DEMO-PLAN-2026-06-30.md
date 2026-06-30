# ARDESIA — piano di cutover monorepo e demo toccabile

Data: 2026-06-30
Tipo: piano operativo conservativo

## 0. Obiettivo

Mettere insieme i pezzi gia' fatti senza distruggere cio' che funziona, arrivando a una demo Vercel toccabile e a una fabbrica che capisce dove lavorare.

## 1. Principio di migrazione

La migrazione deve essere incrementale:

```text
inventario -> scelta candidato -> import o link -> gate -> demo -> cutover -> archiviazione opzionale
```

Non saltare direttamente a eliminare repo o deploy.

## 2. Fasi GitHub

### Fase G0 — congelare la mappa

Creare e mantenere nel monorepo:

- `ARDESIA-MAP.md` come mappa umana;
- `docs/ops/ARDESIA-TOTAL-INVENTORY-*.md` come mappa verificata;
- `docs/ops/VERCEL-MAP.md` quando Vercel e' accessibile;
- `docs/ops/CUTOVER-LOG.md` per ogni migrazione.

### Fase G1 — classificare repository

Ogni repository deve avere una classe:

- CANONICAL;
- LINEAGE;
- PROTOTYPE;
- DEPLOY-SURFACE;
- ARCHIVE-CANDIDATE;
- UNKNOWN.

### Fase G2 — decidere cosa importare

Candidati probabili:

| Pezzo | Da | A | Criterio |
|---|---|---|---|
| lavagna/plugin/lezione demo | `ardesia-lavagna` | `apps/studio` o demo package monorepo | build + browser pass |
| simulator plugin | `ardesia-simulator` | plugin first-party | monta via ToolHost |
| factory tools | `ardesia-tools` | `ops/tools` | parity con run live |
| governance | `ardesia-vault` | link dal monorepo, non copia totale | mantenere SoT strategico |

### Fase G3 — chiudere loop di branch/PR

Regola:

- una PR = una classe di lavoro;
- docs-only separata da ops/script;
- ops separata da product UI;
- demo deploy separata da marketplace/security.

PR #6 e' un esperimento utile ma sporco. Non usarla come base del cutover stabile: va rifatta pulita oppure chiusa dopo aver salvato le idee buone.

## 3. Fasi prodotto

### Fase P0 — demo minima

La demo minima deve dimostrare piattaforma, non solo app ELAB:

1. pagina con lavagna;
2. plugin/tool visibile e interattivo;
3. stato della lezione esportabile;
4. stato reimportabile;
5. nessuna dipendenza da dati reali studenti;
6. nessun segreto nel bundle.

### Fase P1 — plugin host reale

1. ToolHost montato in route prodotto;
2. plugin installato o registrato via manifest;
3. firma/hash o gate equivalente attivo;
4. kill-list o fail-closed testato;
5. snapshot stato plugin.

### Fase P2 — ELAB come pack/plugin

1. estrarre solo simulation/plugin surface;
2. vietare shell/app standalone dentro plugin;
3. portare 88 lesson-path come pack data;
4. aggiungere provenance/gating;
5. usare Core per auth/memoria/report/AI metodologica.

### Fase P3 — marketplace locale

Prima marketplace locale, non pubblico:

- registry locale;
- manifest con `kind`;
- plugin privati;
- versioni;
- install/remove;
- no-modify;
- snapshot;
- zero pagamenti finche' la demo prodotto non e' stabile.

## 4. Fasi Vercel

### Fase V0 — inventario live

Quando il connector Vercel o CLI locale funzionano:

| Campo | Richiesto |
|---|---|
| team | id/slug |
| project | nome/id |
| repo collegato | owner/repo |
| branch | production/preview |
| ultimo deploy | status + commit |
| URL | production/preview |
| accesso | pubblico, SSO, gated, rotto |
| categoria | canonical-demo, preview, stale, broken, unknown |

### Fase V1 — scegliere una demo primaria

Candidato probabile: `ardesia-lavagna`, perche' e' Vite, ha `vercel.json`, e sembra orientato a canvas/plugin/lesson.

Criteri minimi:

- `npm run build` passa;
- deploy Vercel ready;
- pagina caricabile da browser;
- interazione minima documentata;
- README demo spiega cosa si vede e cosa manca.

### Fase V2 — demo non equivale canon

Un deploy demo non rende automaticamente il repo canonico. Se la demo parte da `ardesia-lavagna`, il monorepo deve contenere una nota:

```text
Questa demo usa il prototipo X; stato = preview; migrazione verso monorepo pianificata.
```

## 5. Fasi fabbrica

### Fase F0 — riparare la leggibilita'

La fabbrica deve avere pochi file da leggere:

- `README.md`;
- `ARDESIA-MAP.md`;
- `docs/CANON-INDEX.md`;
- `docs/ops/ARDESIA-TOTAL-INVENTORY-*`;
- `docs/ops/CUTOVER-DEMO-PLAN-*`;
- `COORDINATION.md` per task attivi.

### Fase F1 — usare i modelli con routing

Default:

- MiniMax/Hermes per audit e docs;
- Codex/OpenAI high-headroom per bug/gate/driver;
- builder costoso solo per task pinned con criteri verificabili.

### Fase F2 — riduzione token tipo Headroom

Fino a verifica del repository esterno preciso, implementare principio:

- repo map prima;
- file/line ranges, non repo intero;
- context packet breve;
- AgentMemory per risultati;
- gate + COV per ogni claim.

### Fase F3 — automiglioramento

Ogni run deve scrivere:

- task;
- repo;
- lane/modello;
- perche' quel modello;
- memoria richiamata;
- file letti;
- esito;
- gate/review;
- next action;
- cosa ricordare.

## 6. Non-regressione

Prima di ogni merge che tocca prodotto/fabbrica:

- non toccare `eval/gate.sh` senza decisione esplicita;
- non introdurre segreti;
- non confondere demo con canon;
- non rendere Vercel fonte di verita';
- non far scrivere due lane sullo stesso repo contemporaneamente;
- non reimportare ELAB standalone come plugin;
- non dichiarare marketplace se c'e' solo registry locale;
- non dichiarare prodotto se manca vertical slice toccabile.

## 7. Definition of done per la demo

Una demo Vercel e' fatta solo se:

1. URL raggiungibile;
2. browser check documentato;
3. screenshot o log di verifica;
4. commit collegato;
5. README spiega lo stato;
6. limitazioni dichiarate;
7. percorso utente minimo scritto;
8. rollback possibile.

## 8. Chain of verification

- Questo documento non dichiara alcun deploy live come funzionante.
- Questo documento non archivia repo.
- Questo documento non modifica driver o automazioni.
- Questo documento definisce l'ordine con cui farlo senza perdere pezzi buoni.
