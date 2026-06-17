"""
ELAB Automa — Frozen Metric Detector
Implementato: 2026-03-24 (miglioramento #1 dai 54 cicli)

Una metrica è FROZEN se non migliora per N cicli consecutivi.
Metriche FROZEN: bloccano task research/audit su quella metrica
e generano task di fix P1 automatici.

Integrazione:
    from frozen_metrics import update_frozen_metrics, get_frozen_metrics, generate_fix_tasks_for_frozen
"""

import hashlib
import json
from datetime import datetime
from pathlib import Path

AUTOMA_ROOT = Path(__file__).parent
EVAL_FILE = AUTOMA_ROOT / "state" / "last-eval.json"
METRIC_HISTORY_FILE = AUTOMA_ROOT / "state" / "metric-history.json"

# Soglie configurabili
FREEZE_THRESHOLD = 5        # Cicli senza miglioramento per congelare
FREEZE_MIN_DELTA = 0.005    # Delta minimo per contare come "miglioramento"


def load_metric_history() -> dict:
    """Carica la storia delle metriche dal file JSON persistente."""
    if METRIC_HISTORY_FILE.exists():
        try:
            return json.loads(METRIC_HISTORY_FILE.read_text())
        except json.JSONDecodeError:
            return {}
    return {}


def save_metric_history(history: dict):
    """Salva la storia delle metriche."""
    METRIC_HISTORY_FILE.write_text(json.dumps(history, indent=2))


def update_frozen_metrics(state: dict) -> dict:
    """
    Legge last-eval.json, confronta con la storia, aggiorna i contatori.
    Marca come FROZEN le metriche stagnanti per >= FREEZE_THRESHOLD cicli.

    Aggiorna anche state["frozen_metrics"] con la lista dei nomi frozen.
    Ritorna: {metric_name: {"frozen": True, "cycles_stalled": N, "current_value": V}}
    """
    if not EVAL_FILE.exists():
        return {}

    try:
        eval_data = json.loads(EVAL_FILE.read_text())
    except json.JSONDecodeError:
        return {}

    metrics = eval_data.get("metrics", {})
    if not metrics:
        return {}

    history = load_metric_history()
    newly_frozen = {}

    for metric_name, current_value in metrics.items():
        if metric_name not in history:
            # Prima volta che vediamo questa metrica
            history[metric_name] = {
                "values": [current_value],
                "no_improve_count": 0,
                "frozen": False,
                "last_updated": datetime.now().isoformat(),
            }
            continue

        entry = history[metric_name]
        last_value = entry["values"][-1] if entry["values"] else 0.0

        # Controlla se c'è stato miglioramento significativo
        if current_value - last_value >= FREEZE_MIN_DELTA:
            # Miglioramento rilevato — reset del contatore stallo
            entry["no_improve_count"] = 0
            entry["frozen"] = False
        else:
            # Nessun miglioramento
            entry["no_improve_count"] = entry.get("no_improve_count", 0) + 1

        # Tieni gli ultimi 20 valori per analisi trend
        entry["values"].append(current_value)
        entry["values"] = entry["values"][-20:]
        entry["last_updated"] = datetime.now().isoformat()

        # Marca come FROZEN se stagnante troppo a lungo
        if entry["no_improve_count"] >= FREEZE_THRESHOLD:
            entry["frozen"] = True
            newly_frozen[metric_name] = {
                "frozen": True,
                "cycles_stalled": entry["no_improve_count"],
                "current_value": current_value,
                "peak_value": max(entry["values"]),
            }
        else:
            entry["frozen"] = False

    save_metric_history(history)

    # Aggiorna state.json con la lista delle metriche frozen
    state["frozen_metrics"] = list(newly_frozen.keys())

    if newly_frozen:
        print(f"  🧊 FROZEN metrics: {list(newly_frozen.keys())}")

    return newly_frozen


def get_frozen_metrics() -> list:
    """Ritorna la lista dei nomi di metriche attualmente frozen."""
    history = load_metric_history()
    return [name for name, entry in history.items() if entry.get("frozen", False)]


def is_metric_frozen(metric_name: str) -> bool:
    """Controlla se una metrica specifica è frozen."""
    history = load_metric_history()
    return history.get(metric_name, {}).get("frozen", False)


def should_block_task_for_frozen(task: dict, frozen_metrics: list) -> bool:
    """
    Blocca task di tipo research/audit se la loro metrica focus è FROZEN.
    Una metrica frozen richiede un task di FIX, non ulteriore ricerca.
    """
    if not frozen_metrics:
        return False

    tags = str(task.get("tags", "")).lower()
    title = str(task.get("title", "")).lower()
    research_indicators = ["research", "audit", "analyze", "study", "ricerca", "analisi"]

    is_research_type = any(ind in tags or ind in title for ind in research_indicators)
    if not is_research_type:
        return False

    # Blocca se la metrica frozen appare nei tag del task
    for metric in frozen_metrics:
        metric_keyword = metric.replace("_", " ").replace("_", "-")
        if metric.lower() in tags or metric_keyword in tags:
            return True

    return False


def generate_fix_tasks_for_frozen(frozen_metrics_dict: dict) -> list:
    """
    Genera specifiche di task P1 per le metriche frozen.
    Ritorna lista di dict da passare a create_task().
    """
    tasks = []
    for metric_name, info in frozen_metrics_dict.items():
        # ID univoco basato sul nome metrica
        task_id = f"fix-frozen-{metric_name.replace('_', '-')}"
        cycles = info.get("cycles_stalled", FREEZE_THRESHOLD)
        current = info.get("current_value", 0.0)

        tasks.append({
            "id": task_id,
            "priority": "P1",
            "title": f"Fix frozen metric: {metric_name}",
            "description": (
                f"La metrica '{metric_name}' è FROZEN dopo {cycles} cicli senza miglioramento. "
                f"Valore attuale: {current:.3f}. "
                f"Azioni richieste: "
                f"1) Analizza perché questa metrica è stagnante (leggi gli ultimi 5 report). "
                f"2) Identifica il bottleneck specifico. "
                f"3) Implementa un fix concreto e misurabile. "
                f"4) Esegui evaluate.py e verifica che la metrica migliori di almeno 0.02. "
                f"Non fare research generica — serve azione diretta."
            ),
            "tags": f"frozen,fix,{metric_name}",
        })
    return tasks
