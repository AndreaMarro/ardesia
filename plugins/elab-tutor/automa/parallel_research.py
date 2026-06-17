#!/usr/bin/env python3
"""
ELAB Automa — Parallel Research Loop (Kimi K2.5)
Runs alongside each cycle, using Kimi K2.5 for research/review/analysis.
Communicates findings back to the main cycle via shared state files.

Architecture:
  main cycle (Claude) ──→ parallel_research (Kimi K2.5)
       │                        │
       │  writes context   reads context + writes findings
       │                        │
       └── shared state ←───────┘
           (automa/state/parallel-research.json)
"""

import json
import time
import threading
from datetime import datetime
from pathlib import Path

AUTOMA_ROOT = Path(__file__).parent
FINDINGS_FILE = AUTOMA_ROOT / "state" / "parallel-research.json"
KNOWLEDGE_DIR = AUTOMA_ROOT / "knowledge"

# Research topics rotate each cycle for diverse coverage
RESEARCH_AGENDA = [
    {
        "id": "pedagogy",
        "topic": "pedagogia docenti inesperti elettronica scuola media Italia",
        "prompt_template": (
            "SEI ELAB-RESEARCH-LOOP. Ricerca: {topic}\n"
            "Contesto ELAB: tutor elettronica per bambini 8-12, simulatore circuiti browser, AI Galileo.\n"
            "Trova 3 insight utili e 1 proposta concreta di miglioramento.\n"
            "Rispondi in italiano. Max 300 parole. Formato:\n"
            "INSIGHT-1: ...\nINSIGHT-2: ...\nINSIGHT-3: ...\nPROPOSTA: ...\nSEVERITY: low/medium/high"
        ),
    },
    {
        "id": "competitor",
        "topic": "competitor EdTech simulatori elettronica 2026 Tinkercad Wokwi Arduino",
        "prompt_template": (
            "Analizza brevemente i competitor di ELAB Tutor nel mercato EdTech simulatori elettronica 2026.\n"
            "Focus: Tinkercad Circuits, Wokwi, Falstad, PhET.\n"
            "Cosa fanno meglio? Cosa manca a tutti? Dove ELAB puo' differenziarsi?\n"
            "Max 300 parole. Formato:\n"
            "COMPETITOR-1: [nome] — forza/debolezza\n...\nGAP-MERCATO: ...\nOPPORTUNITA-ELAB: ...\nSEVERITY: low/medium/high"
        ),
    },
    {
        "id": "ux_children",
        "topic": "UX design bambini 8-12 anni interfaccia educativa touch tablet",
        "prompt_template": (
            "Quali sono le best practice UX per interfacce educative per bambini 8-12 anni?\n"
            "Focus: touch target, font, colori, feedback, gamification, attenzione, carico cognitivo.\n"
            "Contestualizza per un simulatore di circuiti elettronici su tablet scolastico.\n"
            "Max 300 parole. Formato:\n"
            "BEST-PRACTICE-1: ...\n...\nAPPLICAZIONE-ELAB: ...\nSEVERITY: low/medium/high"
        ),
    },
    {
        "id": "ai_tutoring",
        "topic": "AI tutoring adattivo per STEM education scaffolding ZPD",
        "prompt_template": (
            "Come dovrebbe comportarsi un AI tutor per bambini che imparano elettronica?\n"
            "Concetti: scaffolding, ZPD (Vygotsky), metodo socratico, feedback formativo.\n"
            "Galileo (il tutor AI di ELAB) deve essere un libro intelligente, NON un professore.\n"
            "Max 300 parole. Formato:\n"
            "PRINCIPIO-1: ...\n...\nERRORE-COMUNE: ...\nRACCOMANDAZIONE-GALILEO: ...\nSEVERITY: low/medium/high"
        ),
    },
    {
        "id": "lim_classroom",
        "topic": "LIM lavagna interattiva aula tecnologia scuola media lezione tipo",
        "prompt_template": (
            "Come si svolge una lezione tipo di tecnologia in una scuola media italiana con LIM?\n"
            "Focus: flusso lezione, uso della LIM, interazione docente-studenti, tempi.\n"
            "ELAB Tutor deve funzionare in questo contesto. Cosa serve per essere usabile su LIM?\n"
            "Max 300 parole. Formato:\n"
            "FLUSSO-LEZIONE: ...\nVINCOLI-LIM: ...\nREQUISITI-ELAB: ...\nSEVERITY: low/medium/high"
        ),
    },
    {
        "id": "circuit_accuracy",
        "topic": "accuratezza simulatore circuiti educativo KCL KVL MNA errori comuni",
        "prompt_template": (
            "Quali sono gli errori piu' comuni nei simulatori di circuiti educativi?\n"
            "Focus: accuratezza solver (KCL/KVL/MNA), LED modeling, paralleli, cortocircuiti.\n"
            "ELAB usa un MNA solver proprio (~1700 LOC). Quali edge case testare?\n"
            "Max 300 parole. Formato:\n"
            "EDGE-CASE-1: ...\n...\nTEST-SUGGERITO: ...\nSEVERITY: low/medium/high"
        ),
    },
    {
        "id": "pnrr_bandi",
        "topic": "PNRR Scuola 4.0 bandi attivi simulatore didattico requisiti",
        "prompt_template": (
            "Cerca bandi PNRR Scuola 4.0 attivi nel 2026 per software didattico STEM.\n"
            "Focus: requisiti tecnici, importi, scadenze, come candidarsi con ELAB UNLIM.\n"
            "ELAB: simulatore circuiti + AI tutor + kit fisico. Prezzo target €500-1000/anno.\n"
            "Max 300 parole. Formato:\n"
            "BANDO-1: ...\nREQUISITI: ...\nAZIONE-ELAB: ...\nSEVERITY: high"
        ),
    },
    {
        "id": "gdpr_mistral",
        "topic": "GDPR scuola italiana AI minori Mistral API EU modelli locali",
        "prompt_template": (
            "Come usare AI nelle scuole italiane rispettando il GDPR per minori 10-14?\n"
            "Opzioni: Mistral (Francia, EU), modelli locali (Ollama), ibrido.\n"
            "Focus: consenso genitori, DPA, data residency EU, modelli open-weight.\n"
            "Max 300 parole. Formato:\n"
            "OPZIONE-1: ...\nPRO/CONTRO: ...\nRACCOMANDAZIONE: ...\nSEVERITY: high"
        ),
    },
    {
        "id": "progetti_scuola",
        "topic": "progetti innovativi scuola media elettronica Arduino Italia casi successo",
        "prompt_template": (
            "Cerca progetti scolastici italiani (scuole medie) che usano Arduino/elettronica.\n"
            "Focus: cosa ha funzionato, come hanno convinto i dirigenti, budget, risultati.\n"
            "ELAB vuole entrare in TUTTE le scuole medie italiane con kit €75 + licenza €500-1000.\n"
            "Max 300 parole. Formato:\n"
            "PROGETTO-1: ...\nCOSA-HA-FUNZIONATO: ...\nLEZIONE-PER-ELAB: ...\nSEVERITY: medium"
        ),
    },
    {
        "id": "innovazione_radicale",
        "topic": "innovazione EdTech radicale non convenzionale gamification maker education",
        "prompt_template": (
            "Trova 2 idee RADICALI per un simulatore di circuiti educativo. Non banali.\n"
            "Pensa a: maker education, Reggio Emilia, Montessori + tech, gamification profonda.\n"
            "ELAB ha simulatore + AI tutor + kit fisico. Cosa nessun competitor ha MAI fatto?\n"
            "Max 300 parole. Formato:\n"
            "IDEA-1: ...\nPERCHE-NESSUNO-LO-FA: ...\nCOME-IMPLEMENTARE: ...\nSEVERITY: medium"
        ),
    },
]


def load_findings() -> dict:
    """Load existing parallel research findings."""
    if FINDINGS_FILE.exists():
        return json.loads(FINDINGS_FILE.read_text())
    return {"findings": [], "last_cycle": 0, "total_insights": 0}


def save_findings(data: dict):
    """Save findings to shared state."""
    data["updated"] = datetime.now().isoformat()
    FINDINGS_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def run_parallel_research(cycle_num: int, state: dict, blocking: bool = False):
    """Run Kimi K2.5 research in parallel with the main cycle.

    Args:
        cycle_num: current cycle number
        state: current orchestrator state
        blocking: if True, wait for result; if False, run in thread

    Returns:
        Finding dict if blocking, None if async
    """
    from tools import call_kimi, KIMI_API_KEY

    if not KIMI_API_KEY or "placeholder" in KIMI_API_KEY:
        return {"status": "skip", "reason": "Kimi API key not configured"}

    # Select topic by rotation
    topic_idx = cycle_num % len(RESEARCH_AGENDA)
    agenda_item = RESEARCH_AGENDA[topic_idx]

    def _do_research():
        start = time.time()

        # Build prompt with FULL context
        # Inject project identity so Kimi knows what ELAB UNLIM is
        elab_context = (
            "CONTESTO OBBLIGATORIO — ELAB UNLIM:\n"
            "Simulatore circuiti educativo + AI tutor per scuole medie italiane (10-14 anni).\n"
            "67 esperimenti in 3 volumi. Kit fisico €75 + licenza €500-1000/anno.\n"
            "PRINCIPIO ZERO: l'insegnante inesperto deve poter arrivare alla LIM e spiegare subito.\n"
            "Galileo/UNLIM e' un libro intelligente, NON un professore sostitutivo.\n"
            "Committenti: Omaric (Riccardo Franzoso, grande produttore Arduino), Giovanni Fagherazzi (Raas Impact).\n"
            "Competitor: Tinkercad (gratis, no AI), Wokwi (gratis, no pedagogia), Arduino Education (€€€).\n"
            "Stack: React 19 + Vite, Vercel, Nanobot su Render, Brain V13 locale.\n"
            "GDPR: modelli locali + Mistral (EU) per produzione. Mai dati minori su server USA.\n"
        )

        prompt = elab_context + "\n" + agenda_item["prompt_template"].format(topic=agenda_item["topic"])

        # Add cycle context: last lesson + score + recent work
        last_eval = state.get("scores", {})
        if last_eval:
            prompt += f"\n\nScore attuale: composite={last_eval.get('composite', '?')}"

        # Inject last 3 lessons so Kimi knows what the automa just did
        lessons_path = Path(__file__).parent / "state" / "lessons.jsonl"
        if lessons_path.exists():
            lines = lessons_path.read_text().strip().splitlines()[-3:]
            recent = []
            for l in lines:
                try:
                    d = json.loads(l)
                    recent.append(f"  C{d.get('cycle','?')}: {d.get('status','?')} — {d.get('task','?')[:60]}")
                except:
                    pass
            if recent:
                prompt += "\n\nULTIMI CICLI AUTOMA (rispondi a QUESTI, non in astratto):\n" + "\n".join(recent)
                prompt += "\n\nRispondi con AZIONI CONCRETE relative a quello che l'automa sta facendo ORA. Non generico."

        # Call Kimi
        result = call_kimi(prompt, max_tokens=1500)
        elapsed = time.time() - start

        # Parse and structure finding
        finding = {
            "cycle": cycle_num,
            "topic_id": agenda_item["id"],
            "topic": agenda_item["topic"],
            "timestamp": datetime.now().isoformat(),
            "elapsed_s": round(elapsed, 1),
            "raw_response": result[:2000],
            "text": result[:500],  # Short version for prompt injection
            "status": "error" if result.startswith("[") else "ok",
        }

        # Extract severity if present
        for line in result.splitlines():
            if line.strip().startswith("SEVERITY:"):
                finding["severity"] = line.split(":", 1)[1].strip().lower()
                break

        # Save to shared state
        data = load_findings()
        data["findings"].append(finding)
        data["last_cycle"] = cycle_num
        data["total_insights"] = len(data["findings"])
        # Keep last 50 findings
        if len(data["findings"]) > 50:
            data["findings"] = data["findings"][-50:]
        save_findings(data)

        # Also save to knowledge dir for inter-cycle context
        if finding["status"] == "ok":
            knowledge_file = KNOWLEDGE_DIR / f"kimi-research-cycle-{cycle_num}.md"
            knowledge_file.write_text(
                f"# Kimi Research — Cycle {cycle_num}\n"
                f"Topic: {agenda_item['topic']}\n"
                f"Date: {finding['timestamp']}\n\n"
                f"{result}\n"
            )

        return finding

    if blocking:
        return _do_research()
    else:
        thread = threading.Thread(target=_do_research, daemon=True)
        thread.start()
        return None


def get_latest_findings(n: int = 5) -> str:
    """Get latest N findings as formatted string for prompt injection."""
    data = load_findings()
    findings = data.get("findings", [])[-n:]
    if not findings:
        return ""

    lines = []
    for f in findings:
        status = "OK" if f.get("status") == "ok" else "ERR"
        severity = f.get("severity", "?")
        lines.append(
            f"  [{status}] Cycle {f['cycle']} — {f['topic_id']} "
            f"(severity={severity}): {f.get('raw_response', '')[:150]}"
        )
    return "\n".join(lines)


def get_actionable_findings() -> list[dict]:
    """Get findings with severity medium or high that haven't been actioned."""
    data = load_findings()
    return [
        f for f in data.get("findings", [])
        if f.get("severity") in ("medium", "high") and not f.get("actioned")
    ]
