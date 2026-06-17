# PDR — Orchestratore ELAB Automa V3
## Product Design Requirements — Piano Definitivo

**Versione**: 3.0
**Data**: 2026-03-24
**Autore**: Andrea Marro (con supporto Claude Code)
**Basato su**: AUDIT-2026-03-24.md + HANDOFF-2026-03-24.md + Visione Andrea
**Stato**: DOCUMENTO NORMATIVO — sostituisce PDR.md per tutto ciò che riguarda l'orchestratore

---

> **Questo documento descrive cosa il sistema DEVE essere, non cosa è.**
> Lo stato attuale è documentato nell'AUDIT. Questo PDR è la destinazione.
> Ogni discrepanza tra PDR e codice reale è un bug da risolvere.

---

## SEZIONE 1: PRINCIPIO ZERO E VISIONE

### 1.1 Principio Zero (immutabile)

> **"ELAB Tutor deve permettere a TUTTI di poter insegnare i contenuti ELAB e non solo. Persone totalmente inesperte possono mettersi alla LIM e poter spiegare subito, anche appassionandosi. Apprendimento orizzontale."**

Il Principio Zero non è un tagline. È il filtro decisionale di ogni ciclo. Prima di eseguire qualsiasi task, l'orchestratore si chiede:

> *"Questa modifica avvicina o allontana un insegnante completamente inesperto dal poter stare alla LIM e spiegare elettronica ai bambini?"*

Se la risposta è "allontana" o "irrilevante", il task non viene eseguito. Viene rimesso in coda o tombstonato.

**Casi concreti di applicazione:**
- Un fix lighthouse_perf che migliora il punteggio ma rallenta la UI: **REVERT**
- Un bottone piccolo (< 44px) su una schermata principale: **FIX IMMEDIATO P0**
- Un'animazione bella ma che distrae dalla spiegazione: **RIMUOVI**
- Un testo troppo tecnico nel flusso principale: **SEMPLIFICA** (Gulpease ≥ 85)
- Una feature per bambini che non serve all'insegnante: **P3 (bassa priorità)**

### 1.2 Visione di Andrea (testo originale, immutabile)

> "Io voglio che anche Claude faccia ricerca con DeepSeek e kimi (nel ciclo parallelo), che vengano usati tutti i plugin e connettori, che il contesto sia veramente mantenuto e che si usino le tecniche migliori per il mantenimento del contesto, la ricerca di vertire su ogni campo (in particolare studiare i difetti di elabtutor, ma cercare anche nuove idee da qualunque ambito) che vengano usati moltissimo screenshot e video. Deve funzionare una volta per tutto bene deve potere controllare vercel, netifly, render. Deve rendere il simulatore perfetto e proseguire in modo naturale, geniale, veloce la history di elab tutor. Deve essere autoconsapevole e lavorare in modo logico. Usare il github è l'idea di Autoresearch. Kimi deve essere preparato. Le ricerche devono vertere su risoluzione di problemi concreti e innovazione concreta. Elabtutor deve trasformarsi velocemente, progredire e con lui l'orchestratore. I cicli devono parlarsi. Deve esserci un flusso logico di lavoro. Usare tutte le skill plugin e risorse date. Rispettare il principio zero. Deve fare guadagnare i miei incaricatori moltissimo. Deve essere geniale, tenere conto della tecnologia presente nelle scuole italiane in primis, puntare a ottimizzare l'utilizzo dei token, usare prompt perfetti come quelli delle foto caricate, puntare a usare o creare modelli proprietari altamente veloci e allenati provenienti da buoni modelli open source. Deve essere davvero autonomo e produrre veramente risultati in modo esponenziale. Usa tanto Claude in modo agentico e orchestrato per ricerca e sviluppo. Simula lezioni vere, simula utenti veri, fai tanti esperimenti. Innova e fai soldi. Sii brutalmente onesto, sistematico e rendi l'orchestratore severo e severo con se stesso."
>
> — Andrea Marro, 2026-03-24

### 1.3 Direttiva "Come Fossi Andrea"

Ogni prompt inviato a Claude Opus 4.6 deve includere questo paragrafo:

```
Sei Andrea Marro — il creatore di ELAB Tutor. Lavori con la passione di chi
ha costruito questo prodotto da zero per i bambini italiani. Sei pragmatico,
geniale, veloce. Non accetti scuse. Se qualcosa non funziona, lo dici chiaramente
e lo risolvi. Ogni riga di codice che scrivi avvicina un insegnante inesperto
alla LIM. Questo è il tuo standard.
```

Questa direttiva NON è opzionale. È presente in ogni ciclo IMPROVE e AUDIT.

---

## SEZIONE 2: ARCHITETTURA DEL CICLO (8 Step)

### 2.1 Il Ciclo Perfetto

```
┌─────────────────────────────────────────────────────────────┐
│                    CICLO AUTOMA V3                          │
│                   (target: ~15 min)                         │
└─────────────────────────────────────────────────────────────┘

STEP 1 ── CHECK ──────────────────────────────────────────────
  Esegue: checks.py (7 check: health, build, galileo, content,
          gulpease, browser, ipad)
  + evaluate.py → composite_score
  Output: dict con scores, flag failed, delta vs. prev score
  Scrive: state/last-eval.json
  Critico: se build_pass=False → STOP ciclo, task solo su fix build

STEP 2 ── ANALISI ────────────────────────────────────────────
  Input: scores da step 1 + cycles-history.md (ultimi 5 cicli)
         + project-history.md (storia ELAB)
  Esegue: DeepSeek R1 root-cause sulla metrica PEGGIORE
  Query: "Metrica [X] = [Y]. Causa più probabile. Top 3 fix concreti
          con stima impatto. Formato JSON."
  Output: root_cause, top_fixes[], estimated_impact
  Scrive: ai-feedback.log

STEP 3 ── RICERCA ────────────────────────────────────────────
  Parallelo (thread separato, non blocca):
    A. Kimi K2.5 — ricerca su topic DINAMICI basati su metriche basse
       (NON RESEARCH_AGENDA statica)
       Es: se lighthouse < 0.80 → query "React lazy loading best practices 2026"
    B. Gemini 2.5 Flash — analisi contesto lungo (research-log.md)
       + summary strategico delle ultime N ricerche
    C. Web search mirata su GitHub issues, paper recenti
  Output: parallel-research.json (findings con id, text, severity, actioned)
  Soglia: findings con score > 0.7 → task YAML in coda automaticamente

STEP 4 ── PIANIFICA ──────────────────────────────────────────
  Input: queue tasks + impact scores da step 2-3
  Logica:
    - Legge task dalla coda (priorità P0 > P1 > P2 > P3)
    - Filtra task bloccati da frozen_metrics
    - Seleziona task con highest impact_score × priority_weight
    - Se nessun task → genera task da root_cause step 2
  Output: task selezionato + contesto task (history tentimenti falliti)
  Nota: legge get_failed_approaches() per evitare loop su errori noti

STEP 5 ── ESEGUI ─────────────────────────────────────────────
  Comando: claude -p --dangerously-skip-permissions
           --model claude-opus-4-6
           --max-turns 30
  Prompt: PRINCIPIO ZERO + "come fossi Andrea" + contesto 10 layer +
          task specifico + failed_approaches (per evitare pattern falliti)
  Timeout: 1200s (20 min) — mai sopra
  Output tracking: add_attempt() scrive in context_db.attempts
  Se max_turns_reached → force_summary() + fail_task() + re-queue(priority-1)

STEP 6 ── DEPLOYA ────────────────────────────────────────────
  Condizioni per deploy:
    1. build_pass = True
    2. score non sceso rispetto a pre-ciclo
    3. Token NETLIFY/VERCEL/RENDER presenti
  Targets:
    - Vetrina → Netlify (funny-pika-3d1029) via netlify deploy --prod
    - App React → Vercel via vercel --prod o git push origin main
    - Nanobot → Render via git push render main
  Fallback: se deploy fallisce → log error + non bloccare il ciclo

STEP 7 ── VERIFICA ───────────────────────────────────────────
  Ri-esegue: evaluate.py (timeout 600s — non 300s)
  Confronta: score_after vs score_before (da cycle-snapshot.json)
  Calcola: delta = score_after - score_before
  Screenshot: Playwright → screenshot homepage + simulatore
              → salva in state/screenshots/YYYY-MM-DD-cycle-N.png

STEP 8 ── KEEP/REVERT ────────────────────────────────────────
  Pattern Karpathy:
    if delta > 0:
      git add -A && git commit -m "cycle-N: +{delta:.4f} [{task_name}]"
      complete_task(task_id)
      append cycles-history.md
    elif delta < -0.002:  # soglia: non revertire micro-delta
      git checkout -- .   # revert tutto
      fail_task(task_id)
      log "REVERT: score sceso da {before} a {after}"
    else:
      # delta neutro: commit ma segnala
      git commit -m "cycle-N: neutral [{task_name}]"
      complete_task(task_id)
```

### 2.2 Gestione Eccezioni

```
build_fail:         → STOP ciclo, task emergenziale "fix build"
evaluate_timeout:   → retry con timeout×2, se fallisce ancora → skip keep/discard
deploy_fail:        → log error, continua (non bloccante)
max_turns_reached:  → force_summary(), re-queue con priorità ridotta
llm_fail:           → fallback al modello successivo nella catena
budget_exhausted:   → switch a modelli gratuiti, alert in state.json
```

---

## SEZIONE 3: RUOLI LLM

### 3.1 Claude Opus 4.6 — Agente Principale

**Ruolo**: Implementatore. Scrive codice, fix, articoli, ricerche.
**Attivazione**: Ogni ciclo (IMPROVE, WRITE, AUDIT)
**Invocazione**: `claude -p --dangerously-skip-permissions --model claude-opus-4-6`
**Prompt structure**: 10 layer (vedi Sezione 4)
**Max turns**: 30 (mai di più — spezzare il task se richiede di più)
**Limitazioni**: Non fare root-cause analysis. Non fare routing. Non fare scoring.

### 3.2 DeepSeek R1 — Reasoning Profondo

**Ruolo**: Root-cause analysis. Identifica PERCHÉ una metrica è bassa.
**Attivazione**: Ogni ciclo (Step 2) + ogni 5 cicli (scoring quality)
**Output richiesto**: JSON strutturato con `root_cause`, `fixes[]`, `confidence`
**Non usare per**: generazione di codice diretto
**Costo**: ~$0.14/M token — usare prompt concisi (< 500 token input)

```python
# Prompt template DeepSeek root-cause:
DEEPSEEK_ROOT_CAUSE = """
Metrica peggiore: {metric_name} = {metric_value} (target: {target})
Trend ultimi 5 cicli: {trend}
Stack: React 19 + Vite, deploy Vercel/Netlify, Playwright check.

Analizza causa root. Rispondi in JSON:
{
  "root_cause": "...",
  "confidence": 0.0-1.0,
  "fixes": [
    {"action": "...", "file": "...", "estimated_impact": 0.0-1.0},
    ...
  ]
}
"""
```

### 3.3 Gemini 2.5 Pro/Flash — Contesto Lungo + Strategia

**Ruolo**: Analisi di documenti lunghi (research-log.md 789+ righe), summary strategici.
**Gemini Pro**: ogni 10 cicli per analisi mercato/competitor
**Gemini Flash**: ogni 3 cicli per summary veloci
**Vantaggi**: finestra contesto 1M token → può leggere tutta la storia del progetto
**Output**: strategic_summary in ai-feedback.log + priority per prossimo ciclo

### 3.4 Kimi K2.5 — Ricerca Parallela

**Ruolo**: Ricerca web in parallelo (NON blocca il ciclo principale).
**Preparazione obbligatoria**: Kimi riceve sempre questo contesto prima della ricerca:

```
CONTESTO PROGETTO:
- ELAB Tutor: tutor Arduino per bambini 8-12 anni, LIM italiana
- Principio Zero: chiunque può insegnare
- Stack: React 19, Vite, avr8js, n8n, Qwen3.5-2B (Brain)
- Score attuale: composite={score}, problema principale: {worst_metric}
- URL: elabtutor.school | elab-galileo.onrender.com
- Cosa NON funziona: {current_blockers}
```

**Query**: DINAMICHE basate su metriche basse (non lista fissa)
**Output**: findings in parallel-research.json (id, text, severity, source_url, actioned=false)

### 3.5 Brain V13 (Qwen3.5-2B) — Routing Galileo

**Ruolo**: Routing richieste Galileo nel nanobot (sempre attivo, non nel loop automa)
**VPS**: http://72.60.129.50:11434
**Non coinvolto** nel loop automa direttamente — solo via check galileo_identity

### 3.6 Cost Router

```python
def select_model(task_type, budget_remaining_pct):
    if budget_remaining_pct < 0.20:
        # Sotto 20% budget → solo modelli gratuiti
        return "gemini-flash" if task_type in ["summary", "research"] else "claude-opus-4-6"

    if task_type == "root_cause":
        return "deepseek-r1"
    elif task_type in ["summary", "strategic"]:
        return "gemini-flash"
    elif task_type == "research_parallel":
        return "kimi-k2.5"
    else:
        return "claude-opus-4-6"  # default
```

---

## SEZIONE 4: SISTEMA DI MEMORIA (10 Layer)

### 4.1 Layer di Memoria

```
LAYER 1  project-history.md        ← storia completa ELAB (OBBLIGATORIO ogni ciclo)
LAYER 2  cycles-history.md         ← ultimi 5 cicli (append-only)
LAYER 3  research-log.md           ← tutte le ricerche (789+ righe)
LAYER 4  learned_rules.md          ← regole apprese dal self-exam
LAYER 5  state/context.db          ← SQLite: knowledge, scores, experiments, attempts
LAYER 6  ai-feedback.log           ← feedback DeepSeek/Gemini/Kimi
LAYER 7  parallel-research.json    ← findings ricerca parallela
LAYER 8  self_exam_log.json        ← proposte auto-miglioramento
LAYER 9  state/last-eval.json      ← score corrente
LAYER 10 state/state.json          ← stato macchina completo
```

### 4.2 project-history.md (DEVE ESSERE CREATO)

Struttura:
```markdown
# Storia ELAB Tutor

## Origini
- ELAB nasce come kit hardware + software per bambini 8-12 anni (elettronica/Arduino)
- Obiettivo: bambini che capiscono come funziona l'elettronica facendo

## Galileo
- AI tutor pedagogico (n8n + Anthropic)
- Specialisti: circuit, code, tutor, vision, teacher
- UNLIM era il nome precedente → fixato in C55-56 (galileo_identity: 1.0)

## Sprint History
- Sprint 1 (12/02/2026): cleanup 2566 LOC, estrazione 9 file
- Sprint 2 (13/02/2026): KCL/MNA solver, Servo/LCD, Worker AVR
- Sprint 3 (13/02/2026): BOM, Annotations, Export PNG, deploy
- Automa avviato: 2026-03-23 (loop continuo)

## Principio Zero
Chiunque può insegnare alla LIM senza esperienza. Questo è il nord.

## Metriche storiche
[da popolare con dati context.db]
```

### 4.3 cycles-history.md (regole append)

Ogni ciclo DEVE appendere:
```markdown
## Ciclo N — YYYY-MM-DD HH:MM
- Score: {before} → {after} (delta: {delta:+.4f})
- Task: {task_name}
- Status: {done|failed|reverted}
- Nota: {una riga sintetica su cosa è cambiato}
```

**Regola**: Solo gli ultimi 5 cicli entrano nel prompt (per non saturare il contesto).
**File**: non viene troncato automaticamente — cresce indefinitamente (è memoria storica).

### 4.4 context_db (SQLite) — Path Corretto

**PATH CORRETTO**: `automa/state/context.db`
**PATH SBAGLIATO (da non usare)**: `automa/context/context.db` (vuoto, da ignorare)

Tabelle richieste:
```sql
CREATE TABLE knowledge (id, topic, content, source, created_at, confidence);
CREATE TABLE scores (cycle_id, metric, value, timestamp);
CREATE TABLE experiments (id, description, result, hypothesis, date);
CREATE TABLE attempts (task_id, approach, result, timestamp, tokens_used);
```

### 4.5 Regola Obbligatoria

```python
# Prima di OGNI ciclo:
def build_context():
    layers = [
        read_file("memory/project-history.md"),      # OBBLIGATORIO
        read_last_n_lines("memory/cycles-history.md", n=50),
        read_last_n_lines("memory/learned_rules.md", n=30),
        read_db("state/context.db", table="knowledge", limit=10),
        read_file("state/last-eval.json"),
    ]
    return "\n\n---\n\n".join(filter(None, layers))
```

---

## SEZIONE 5: AUTORESEARCH

### 5.1 Principio: Query Dinamiche (NON Agenda Statica)

`RESEARCH_AGENDA` in `parallel_research.py` è **abolita**.
Ogni sessione di ricerca genera topic basati su stato reale del sistema.

```python
def _get_dynamic_research_topics(scores: dict, blockers: list) -> list[str]:
    """
    Genera topic di ricerca basati su metriche basse e problemi attuali.
    NON usare lista hardcoded.
    """
    topics = []

    # Metriche basse → ricerca specifica
    if scores.get("lighthouse_perf", 1.0) < 0.80:
        topics.append("React lazy loading code splitting Vite 2026 best practices")
        topics.append("Lighthouse performance 100 score React SPA")

    if scores.get("ipad_compliance", 1.0) < 0.95:
        topics.append("touch target size 44px WCAG iOS LIM classroom")
        topics.append("CSS min-height touch accessibility school tablet")

    if scores.get("gulpease", 100) < 85:
        topics.append("leggibilità testi bambini 8-12 anni italiano semplice")
        topics.append("readability score Italian children educational content")

    # Ricerca permanente su difetti ELAB e innovazione
    topics.extend([
        "ELAB tutor difetti feedback utenti scuola italiana",
        "EdTech innovazione LIM Arduino bambini 2026",
        "simulatore circuiti elettrici online accuracy KCL 2026",
        "pedagogia insegnamento elettronica inesperto teacher LIM",
        f"site:github.com React circuit simulator educational {date.today().year}",
    ])

    return topics[:8]  # Max 8 topic per sessione (costo)
```

### 5.2 Preparazione Kimi

Kimi deve ricevere sempre il contesto del progetto PRIMA delle query di ricerca:

```python
KIMI_CONTEXT_PREP = """
Stai ricercando per ELAB Tutor — un tutor di Arduino per bambini 8-12 anni
nelle scuole italiane. Il prodotto è accessibile via LIM (lavagna interattiva).

PROBLEMA ATTUALE: {worst_metric} = {worst_value} (target: {target})
STACK: React 19, Vite, avr8js, n8n, SQLite, Netlify/Vercel/Render
URL PRODOTTO: elabtutor.school

Per ogni risultato che trovi, valuta:
1. È applicabile concretamente al nostro stack?
2. Risolve il problema attuale o un problema correlato?
3. Ha adottabilità < 1 giorno di sviluppo?

Fornisci: source_url, finding_text, severity (high/medium/low), estimated_impact (0-1)
"""
```

### 5.3 Pipeline Research → Task

```python
# Soglia: ogni finding con score > 0.7 diventa task YAML automaticamente
def research_to_task(finding: dict) -> dict | None:
    if finding.get("estimated_impact", 0) < 0.7:
        return None
    if finding.get("actioned"):
        return None

    return {
        "id": f"research-{finding['id']}",
        "priority": "P1" if finding["severity"] == "high" else "P2",
        "title": finding["finding_text"][:60],
        "description": finding["finding_text"],
        "source": finding["source_url"],
        "impact_score": finding["estimated_impact"],
        "tags": ["autoresearch"],
    }
```

### 5.4 Aree di Ricerca Permanenti

1. **Difetti ELAB Tutor** — cosa non funziona, feedback utenti, problemi UX
2. **Innovazione EdTech** — nuovi approcci pedagogici, prodotti competitivi
3. **Pedagogia insegnante inesperto** — come si comporta chi non sa nulla di elettronica
4. **UX bambini 8-12** — pattern di interazione, attenzione, frustrazione
5. **Tecnologia scuole italiane** — LIM modelli diffusi, iPad, Chromebook, connettività
6. **Performance web** — tecniche specifiche per lo stack React/Vite
7. **GitHub** — repository simili, soluzioni open source riusabili
8. **Paper accademici** — Semantic Scholar su pedagogia + EdTech + accessibilità

---

## SEZIONE 6: DEPLOY PIPELINE

### 6.1 Configurazione Richiesta (.env)

```bash
# automa/.env — TUTTE queste variabili sono obbligatorie
NETLIFY_AUTH_TOKEN=<da generare su app.netlify.com → User → Applications>
NETLIFY_VETRINA_SITE_ID=864de867-e428-4eed-bd86-c2aef8d9cb13
NETLIFY_VETRINA_DIR=/Users/andreamarro/VOLUME 3/PRODOTTO/newcartella

VERCEL_TOKEN=<opzionale — se non presente, usa git push>
RENDER_API_KEY=<opzionale — se non presente, usa git push>
```

### 6.2 Flusso Deploy Automatico

```python
def deploy_after_cycle(task_result: dict, score_delta: float) -> dict:
    results = {}

    # Condizioni di sicurezza
    if not task_result.get("build_pass"):
        return {"skipped": "build non passa"}
    if score_delta < -0.001:
        return {"skipped": "score peggiorato — no deploy"}

    # Deploy Netlify vetrina
    if os.environ.get("NETLIFY_AUTH_TOKEN"):
        results["netlify"] = _deploy_netlify()
    else:
        results["netlify"] = {"skipped": "NETLIFY_AUTH_TOKEN mancante"}

    # Deploy Vercel (solo se modificato src/)
    if _has_src_changes():
        results["vercel"] = _deploy_vercel()

    # Deploy Render (solo se modificato nanobot/)
    if _has_nanobot_changes():
        results["render"] = _deploy_render()

    return results

def _deploy_netlify() -> dict:
    """Deploy vetrina su Netlify."""
    cmd = [
        "netlify", "deploy", "--prod",
        "--site", os.environ["NETLIFY_VETRINA_SITE_ID"],
        "--dir", os.environ["NETLIFY_VETRINA_DIR"],
        "--auth", os.environ["NETLIFY_AUTH_TOKEN"],
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    return {"status": "ok" if result.returncode == 0 else "failed",
            "output": result.stdout[-500:]}
```

### 6.3 Health Check Post-Deploy

Dopo ogni deploy:
1. Controlla URL live (HTTP 200)
2. Screenshot Playwright → state/screenshots/post-deploy-*.png
3. Se URL non risponde entro 60s → log error (non bloccare ciclo)

---

## SEZIONE 7: SIMULAZIONE UX

### 7.1 Scenario Principale: Insegnante Inesperto alla LIM

```python
SCENARIO_LIM = """
Simula questo scenario con Playwright:

1. Insegnante apre https://www.elabtutor.school su Chrome (LIM 1920×1080)
2. Clicca su un esperimento Volume 1 (es. LED Base)
3. Il simulatore si apre — insegnante NON sa usare un simulatore
4. Insegnante clicca su "Galileo" per chiedere aiuto
5. Galileo risponde — l'insegnante capisce?

Verifica ad ogni step:
- Bottoni touch ≥ 44px (misura reale con getComputedStyle)
- Testo leggibile (font-size ≥ 16px nel flusso principale)
- Latenza < 3s per ogni interazione
- Nessun testo in inglese nel flusso principale
- Feedback visivo chiaro su ogni azione
"""
```

### 7.2 Metriche UX da Verificare

| Metrica | Target | Tool |
|---------|--------|------|
| Bottoni touch | ≥ 44px (WCAG) | Playwright getComputedStyle |
| Latenza homepage | < 2s | Lighthouse + timing |
| Latenza simulatore | < 3s | Performance.now() |
| Gulpease testi LIM | ≥ 85 | gulpease_index() |
| Testi in italiano | 100% | grep + Playwright |
| Screenshot funzionante | nessun blank | Playwright screenshot |

### 7.3 Confronto con Tecnologia Scuole Italiane

**Dispositivi target primari:**
- LIM 1920×1080 (Smartboard, Promethean) — mouse o tocco diretto
- iPad Air/Pro — Safari, tocco, no keyboard
- Chromebook — Chrome, trackpad piccolo
- PC aula — Chrome/Firefox, mouse

**Test matrix minima per ogni ciclo AUDIT:**
```python
VIEWPORT_TESTS = [
    {"name": "LIM_fullscreen", "width": 1920, "height": 1080, "touch": False},
    {"name": "iPad_landscape",  "width": 1180, "height": 820,  "touch": True},
    {"name": "iPad_portrait",   "width": 820,  "height": 1180, "touch": True},
    {"name": "Chromebook",      "width": 1366, "height": 768,  "touch": False},
]
```

---

## SEZIONE 8: SELF-EXAM E AUTO-MIGLIORAMENTO

### 8.1 Frequenza e Profondità

```
Ogni 10 cicli (non 5):
  → self_exam.py esegue analisi completa
  → Legge ultimi 10 report cicli
  → Identifica pattern: task_type vs. success_rate, metric_trend, token_waste
  → Propone miglioramenti categorizzati
  → Applica automaticamente i low-risk
  → Presenta medium/high a Andrea (in state.json come pending_review)

Ogni 50 cicli:
  → Analisi profonda con DeepSeek R1 + Gemini Pro
  → Revisione del PDR stesso (propone aggiornamenti)
  → Aggiorna project-history.md con sintesi del periodo
```

### 8.2 Categorie di Rischio per Auto-Applicazione

```python
RISK_CATEGORIES = {
    "low":    ["prompt improvement", "log verbosity", "timeout adjustment",
               "research topic update", "learned_rules append"],
    "medium": ["new function implementation", "metric weight change",
               "scheduling change", "deploy condition change"],
    "high":   ["evaluate.py change (LOCKED)", "core cycle logic change",
                "model routing change", "budget limit change"],
}

# Solo low-risk vengono auto-applicati
# medium/high → pending_review in state.json → Andrea decide
```

### 8.3 Onestà Radicale

Il self-exam deve essere brutalmente onesto. Template:

```
SELF-EXAM CICLO {N}:
- Cicli completati (done): {done}/{total} = {pct}%  [TARGET: ≥70%]
- Cicli sprecati (max_turns): {wasted}/{total} = {pct}%  [TARGET: ≤15%]
- Score delta medio: {avg_delta:+.4f}  [TARGET: ≥+0.001 per ciclo]
- Deploy eseguiti: {deploys}/{total_eligible}  [TARGET: ≥80%]
- Research→Task pipeline: {actioned}/{findings} findings azionati  [TARGET: ≥60%]

PROBLEMI IDENTIFICATI:
{elenco problemi reali, nessuna scusa}

PROPOSTE (con risk level):
{proposte concrete}
```

---

## SEZIONE 9: METRICHE E TARGET

### 9.1 Metriche Ground Truth (evaluate.py — LOCKED)

| Metrica | Target V3 | Attuale (2026-03-24) | Delta Necessario |
|---------|-----------|----------------------|-----------------|
| composite_score | ≥ 0.95 | 0.8934 | +0.057 |
| galileo_identity | 1.0 | 1.0 | ✅ |
| content_integrity | 1.0 | 1.0 | ✅ |
| ipad_compliance | 1.0 (0 bottoni < 44px) | 0.675 (13 bottoni) | NETLIFY TOKEN |
| lighthouse_perf | ≥ 0.90 | 0.620 | lazy loading |
| gulpease | ≥ 85 | ~74 | testi |
| identity_leak | 0 | 0 | ✅ |
| build_pass | true sempre | true | ✅ |

### 9.2 Metriche Operative (non in evaluate.py)

| Metrica | Target | Monitoring |
|---------|--------|-----------|
| cicli_done_pct | ≥ 70% | reports/ |
| cicli_max_turns_pct | ≤ 15% | reports/ |
| costo_per_ciclo | ≤ €0.08 | state.json |
| deploy_success_rate | ≥ 80% | ai-feedback.log |
| research_actioned_pct | ≥ 60% | parallel-research.json |
| self_exam_proposals | ≥ 5 ogni 10 cicli | self_exam_log.json |

### 9.3 Piano di Salita Score

```
OGGI:     0.8934
TARGET 1: 0.924   → Fix NETLIFY_AUTH_TOKEN + deploy iPad fix
TARGET 2: 0.944   → Fix lighthouse (lazy loading router.tsx)
TARGET 3: 0.965   → Fix gulpease (testi principali)
TARGET 4: 0.980   → Fix ipad_compliance residuo
TARGET 5: 0.950+  → Score stabile, varianza < 0.005
TARGET F: ≥0.950  → PRODOTTO IN PRODUZIONE STABILE
```

---

## SEZIONE 10: BUDGET E COSTI

### 10.1 Budget Mensile

```
Budget totale:  €50/mese
Budget giornaliero target: €50 / 30 = €1.67/giorno
Costo per ciclo target:    ≤ €0.08
Cicli/ora target:          2 (non 4)
Ore/giorno:                16 (ferma la notte 00:00-08:00)
Cicli/giorno:              2 × 16 = 32 cicli/giorno
Costo/giorno (target):     32 × €0.08 = €2.56/giorno
```

⚠️ **Proiezione attuale**: €5.72/giorno (SOPRA TARGET). Ridurre con:
1. Prompt più corti (< 1000 token di system prompt)
2. Cache risultati Kimi (non ri-cercare stesso topic)
3. DeepSeek solo quando metrica è sotto soglia (non ogni ciclo)
4. Gemini Flash invece di Pro per summary quotidiani

### 10.2 Cost Router Aggiornato

```python
# Regola costi (aggiornato)
COST_RULES = {
    "deepseek_r1": {
        "use_when": "metric_below_threshold AND cycle_num % 3 == 0",
        "avoid_when": "all_metrics_ok OR budget_low",
    },
    "gemini_flash": {
        "use_when": "summary OR strategic_analysis OR budget_low",
        "cost": "gratis (free tier)",
    },
    "kimi_k2.5": {
        "use_when": "parallel_research (thread separato)",
        "cache_ttl": "24h per stesso topic",
        "cost": "gratis (free tier)",
    },
    "claude_opus": {
        "use_when": "sempre (task principale)",
        "optimize": "max_turns=30, prompt conciso, no verbose output",
    },
}
```

### 10.3 Token Optimization

```
1. System prompt: max 800 token (comprimere)
2. Context window: inject solo layer rilevanti (non tutti i 10 layer sempre)
3. Cache: non ripetere ricerche identiche < 24h
4. Output: force_summary su task lunghi (evita max_turns sprecati)
5. Deduplication: non inviare lo stesso finding a Kimi due volte
```

---

## SEZIONE 11: INNOVAZIONE

### 11.1 Roadmap Innovazione

```
BREVE TERMINE (< 30 cicli):
  □ Modelli proprietari: fine-tune Qwen3.5-2B su risposte Galileo validate
  □ Screenshot massivi: ogni AUDIT salva 4 screenshot (LIM, iPad, Chrome, mobile)
  □ Simulazione lezioni: Playwright simula classe reale (30 min di utilizzo)
  □ A/B test: varianti UI testabili con cicli paralleli

MEDIO TERMINE (30-100 cicli):
  □ Video generation: record sessione Playwright → analisi
  □ Analisi video: Kimi vision su screenshot → suggerimenti UX
  □ Dataset labeled: coppie (domanda_bambino, risposta_galileo) per fine-tuning
  □ Brain V14: retraining su dati cicli automa

LUNGO TERMINE (100+ cicli):
  □ Cluster scuola: ELAB su reti scolastiche locali
  □ Multilingua: EN + ES (react-i18next)
  □ ELAB hardware V2: nuovo kit basato su feedback Galileo
```

### 11.2 Esperimenti A/B

Ogni innovazione testata con ciclo A/B:
1. Commit A (baseline) → misura score
2. Commit B (variante) → misura score
3. Keep il migliore, revert l'altro

### 11.3 Claude Agentico per R&D

Per ricerche complesse, usare agenti Claude in parallelo:
```python
# Esempio: 3 agenti in parallelo su problemi diversi
agents = [
    claude_agent("lighthouse_fix", task="analizza bundle e proponi lazy loading"),
    claude_agent("ipad_fix", task="trova tutti i bottoni < 44px e proponi CSS"),
    claude_agent("content_quality", task="analizza gulpease testi principali"),
]
# Non usato per il ciclo main — è R&D separato
```

---

## SEZIONE 12: IMPLEMENTAZIONE — PRIORITÀ IMMEDIATE

### 12.1 FIX P0 (fanno saltare blocchi critici)

**P0-A: NETLIFY_AUTH_TOKEN**
- Andrea deve generare il token su app.netlify.com → User → Applications
- Aggiungere in `automa/.env`
- Nessun codice da modificare — solo configurazione

**P0-B: evaluate.py timeout**
- In `orchestrator.py`, funzione `_keep_or_discard()`:
  - Cambiare timeout da `300` a `600` secondi
  - Aggiungere retry (1 tentativo) prima di fallire
- evaluate.py è LOCKED — non si tocca, si cambia solo il subprocess.run timeout

**P0-C: deploy_to_netlify dead code**
- Dopo fix P0-A, testare manualmente `deploy_to_netlify()`
- Verificare che il path NETLIFY_VETRINA_DIR sia corretto

### 12.2 FIX P1 (implementazioni mancanti critiche)

```
1. _galileo_keepalive() — ping periodico al nanobot per tenerlo sveglio (Render spin-down)
2. _get_dynamic_research_topics() — abolire RESEARCH_AGENDA statica
3. _maybe_chunk_output() — spezzare task grandi in sub-task per evitare max_turns
4. force_summary() — quando max_turns → richiedi summary del lavoro fatto
5. add_attempt() — traccia ogni tentativo in context_db.attempts
6. get_failed_approaches() — legge attempts per evitare pattern falliti
7. "come fossi Andrea" — in ogni prompt IMPROVE e AUDIT
8. project-history.md — creare il file con storia ELAB
9. parallel-research.json fix — salvare id e text correttamente
10. context/context.db — eliminare o ignorare il path sbagliato
11. cycles-history.md — aggiungere append completo ad ogni ciclo (non solo ultimi 3)
```

### 12.3 Fix Sequenza

```
GIORNO 1:
  1. Fix evaluate.py timeout (300→600) in orchestrator.py
  2. Fix "come fossi Andrea" nel prompt template
  3. Implementare _get_dynamic_research_topics()
  4. Creare project-history.md

GIORNO 2:
  5. Implementare force_summary() e _maybe_chunk_output()
  6. Implementare add_attempt() e get_failed_approaches()
  7. Fix parallel-research.json (salvare id e text)

GIORNO 3:
  8. Implementare _galileo_keepalive()
  9. Fix cycles-history.md append completo
  10. Deploy test dopo NETLIFY_AUTH_TOKEN configurato

SETTIMANA 1:
  11. Lazy loading in src/router.tsx (lighthouse fix)
  12. iPad fix deploy su Netlify
  13. Self-exam ogni 10 cicli (non 5)
```

---

## SEZIONE 13: VINCOLI IMMUTABILI

1. **evaluate.py è LOCKED** — non si modifica mai. Si può solo cambiare il subprocess timeout.
2. **Zero regressioni**: `npm run build` deve passare prima di ogni commit
3. **Principio Zero**: ogni task viene filtrato attraverso la domanda LIM
4. **Budget**: mai superare €50/mese
5. **Andrea Marro è l'autore**: watermark su articoli, commit, deploy
6. **Onestà radicale**: numeri reali, mai compiacenza, mai "quasi funziona"
7. **git checkout sul revert**: se score scende > 0.002 → git checkout -- .
8. **context.db path**: sempre `automa/state/context.db`, mai `automa/context/context.db`

---

## SEZIONE 14: KPI DI SUCCESSO DEL PDR

Il PDR V3 è raggiunto quando:

```
□ composite_score ≥ 0.95 per 5 cicli consecutivi
□ ipad_compliance = 1.0 (0 bottoni piccoli, deployato su Netlify)
□ lighthouse_perf ≥ 0.90
□ cicli_done_pct ≥ 70% per 10 cicli consecutivi
□ deploy automatico funzionante (Netlify + Vercel)
□ self_exam produce ≥ 5 proposte ogni 10 cicli
□ _keep_or_discard() funziona (nessun timeout)
□ project-history.md esiste e è aggiornato
□ cycles-history.md ha tutti i cicli (non solo gli ultimi 3)
□ RESEARCH_AGENDA abolita, _get_dynamic_research_topics() attiva
□ "come fossi Andrea" in ogni prompt IMPROVE/AUDIT
□ costo ≤ €0.08/ciclo per 7 giorni consecutivi
```

---

*PDR V3 — Autore: Andrea Marro — 2026-03-24*
*Questo documento è la DESTINAZIONE. L'AUDIT è la realtà attuale. La distanza tra i due è il lavoro.*
