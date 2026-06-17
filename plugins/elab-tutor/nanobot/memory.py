"""
UNLIM Memory System — Individual + Collective Learning
2-Layer learning: per-student memory (session) + collective patterns (experiment).
Integrates with server.py orchestrator (build_specialist_context → build_memory_context).
(c) Andrea Marro — 28/02/2026 — Multi-UNLIM v4.0
"""

import json
import re
import time
import pathlib
import threading
from typing import Optional

# ─── File Paths ──────────────────────────────────────────────
_BASE = pathlib.Path(__file__).parent
PATTERNS_FILE = _BASE / "patterns.json"
MEMORY_DIR = _BASE / "sessions" / "memory"
MEMORY_DIR.mkdir(parents=True, exist_ok=True)

_patterns_lock = threading.Lock()
_memory_lock = threading.Lock()


# ─── Collective Patterns ────────────────────────────────────
def _load_patterns() -> dict:
    """Load collective patterns from patterns.json."""
    if PATTERNS_FILE.exists():
        try:
            return json.loads(PATTERNS_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return {"experiments": {}, "global_errors": {}, "updated": 0}


def _save_patterns(patterns: dict):
    """Save collective patterns to patterns.json (thread-safe)."""
    patterns["updated"] = int(time.time())
    try:
        PATTERNS_FILE.write_text(
            json.dumps(patterns, ensure_ascii=False, indent=2),
            encoding="utf-8"
        )
    except OSError as e:
        print(f"[Memory] Failed to save patterns: {e}")


def get_collective_patterns(experiment_id: str) -> dict:
    """Get collective patterns for an experiment.
    Returns: {common_errors: [{category, detail, count}], success_rate: float, total_attempts: int}
    """
    with _patterns_lock:
        patterns = _load_patterns()
        exp = patterns.get("experiments", {}).get(experiment_id, {})
        return {
            "common_errors": exp.get("errors", []),
            "success_rate": exp.get("success_rate", 0.0),
            "total_attempts": exp.get("total_attempts", 0),
            "tips": exp.get("tips", []),
        }


def update_collective_patterns(experiment_id: str, signals: dict):
    """Update collective patterns for an experiment based on learning signals.
    signals: {error_category, error_detail, success, duration_s}
    """
    with _patterns_lock:
        patterns = _load_patterns()
        exps = patterns.setdefault("experiments", {})
        exp = exps.setdefault(experiment_id, {
            "errors": [],
            "total_attempts": 0,
            "successes": 0,
            "success_rate": 0.0,
            "tips": [],
        })

        # Update attempt count
        exp["total_attempts"] += 1

        # Update success rate
        if signals.get("success"):
            exp["successes"] = exp.get("successes", 0) + 1
        if exp["total_attempts"] > 0:
            exp["success_rate"] = round(exp["successes"] / exp["total_attempts"], 2)

        # Update error patterns
        err_cat = signals.get("error_category")
        err_detail = signals.get("error_detail")
        if err_cat:
            # Find existing error pattern or create new
            found = False
            for err in exp["errors"]:
                if err["category"] == err_cat and err.get("detail") == err_detail:
                    err["count"] = err.get("count", 0) + 1
                    err["last_seen"] = int(time.time())
                    found = True
                    break
            if not found:
                exp["errors"].append({
                    "category": err_cat,
                    "detail": err_detail or "",
                    "count": 1,
                    "last_seen": int(time.time()),
                })
            # Sort by frequency (most common first), keep top 10
            exp["errors"] = sorted(exp["errors"], key=lambda e: e.get("count", 0), reverse=True)[:10]

        # Update global error stats
        if err_cat:
            global_errs = patterns.setdefault("global_errors", {})
            global_errs[err_cat] = global_errs.get(err_cat, 0) + 1

        _save_patterns(patterns)


# ─── Individual Memory ───────────────────────────────────────
def _memory_file(session_id: str) -> pathlib.Path:
    """Get file path for individual memory."""
    safe_id = re.sub(r'[^a-zA-Z0-9_\-]', '_', session_id)[:80]
    return MEMORY_DIR / f"{safe_id}.json"


def get_individual_memory(session_id: str) -> dict:
    """Get individual student memory for a session.
    Returns: {level, errors: [{category, count}], experiments_completed: [],
              quiz_results: {correct, total}, message_count, session_start}
    """
    if not session_id:
        return _empty_profile()

    fpath = _memory_file(session_id)
    if fpath.exists():
        try:
            data = json.loads(fpath.read_text(encoding="utf-8"))
            return data
        except (json.JSONDecodeError, OSError):
            pass
    return _empty_profile()


def _empty_profile() -> dict:
    """Create empty student profile."""
    return {
        "level": "principiante",
        "errors": [],
        "experiments_completed": [],
        "quiz_results": {"correct": 0, "total": 0},
        "message_count": 0,
        "session_start": int(time.time()),
        "last_activity": int(time.time()),
        "strengths": [],
        "weaknesses": [],
    }


def update_individual_memory(session_id: str, signals: dict):
    """Update individual student memory based on learning signals.
    signals: {
        error_category, error_detail,
        experiment_completed, experiment_id,
        quiz_correct, quiz_total,
        message_sent (bool),
    }
    """
    if not session_id:
        return

    with _memory_lock:
        profile = get_individual_memory(session_id)

        # Track message count
        if signals.get("message_sent"):
            profile["message_count"] = profile.get("message_count", 0) + 1

        # Track errors
        err_cat = signals.get("error_category")
        if err_cat:
            found = False
            for err in profile.get("errors", []):
                if err["category"] == err_cat:
                    err["count"] = err.get("count", 0) + 1
                    found = True
                    break
            if not found:
                profile.setdefault("errors", []).append({
                    "category": err_cat,
                    "count": 1,
                })

        # Track experiment completion
        exp_id = signals.get("experiment_id")
        if signals.get("experiment_completed") and exp_id:
            completed = profile.setdefault("experiments_completed", [])
            if exp_id not in completed:
                completed.append(exp_id)

        # Track quiz results
        if signals.get("quiz_correct") is not None:
            qr = profile.setdefault("quiz_results", {"correct": 0, "total": 0})
            qr["correct"] += signals.get("quiz_correct", 0)
            qr["total"] += signals.get("quiz_total", 0)

        # Update timestamp
        profile["last_activity"] = int(time.time())

        # Re-estimate level
        profile["level"] = estimate_level(profile)

        # Compute strengths/weaknesses
        profile["strengths"], profile["weaknesses"] = _analyze_profile(profile)

        # Save
        try:
            _memory_file(session_id).write_text(
                json.dumps(profile, ensure_ascii=False, indent=2),
                encoding="utf-8"
            )
        except OSError as e:
            print(f"[Memory] Failed to save individual memory for {session_id}: {e}")


def estimate_level(profile: dict) -> str:
    """Estimate student level based on profile data.
    Returns: 'principiante' | 'intermedio' | 'avanzato'
    """
    score = 0

    # Factor 1: experiments completed (max 30 pts)
    completed = len(profile.get("experiments_completed", []))
    if completed >= 20:
        score += 30
    elif completed >= 10:
        score += 20
    elif completed >= 5:
        score += 10
    elif completed >= 1:
        score += 5

    # Factor 2: quiz performance (max 30 pts)
    qr = profile.get("quiz_results", {})
    total_quiz = qr.get("total", 0)
    if total_quiz >= 5:
        accuracy = qr.get("correct", 0) / total_quiz
        if accuracy >= 0.8:
            score += 30
        elif accuracy >= 0.6:
            score += 20
        elif accuracy >= 0.4:
            score += 10

    # Factor 3: message count indicates engagement (max 20 pts)
    msg_count = profile.get("message_count", 0)
    if msg_count >= 50:
        score += 20
    elif msg_count >= 20:
        score += 10
    elif msg_count >= 5:
        score += 5

    # Factor 4: error frequency (subtract if many recent errors)
    total_errors = sum(e.get("count", 0) for e in profile.get("errors", []))
    if total_errors > 10:
        score -= 10
    elif total_errors > 5:
        score -= 5

    # Classify
    if score >= 50:
        return "avanzato"
    elif score >= 25:
        return "intermedio"
    return "principiante"


def _analyze_profile(profile: dict) -> tuple:
    """Analyze profile for strengths and weaknesses.
    Returns: (strengths: list[str], weaknesses: list[str])
    """
    strengths = []
    weaknesses = []

    # Analyze error patterns
    errors = profile.get("errors", [])
    for err in errors:
        cat = err.get("category", "")
        count = err.get("count", 0)
        if count >= 3:
            weaknesses.append(cat)

    # Analyze quiz performance
    qr = profile.get("quiz_results", {})
    total_quiz = qr.get("total", 0)
    if total_quiz >= 3:
        accuracy = qr.get("correct", 0) / total_quiz
        if accuracy >= 0.8:
            strengths.append("quiz")
        elif accuracy < 0.5:
            weaknesses.append("quiz")

    # Analyze experiment breadth
    completed = profile.get("experiments_completed", [])
    if len(completed) >= 10:
        strengths.append("esperienza")

    return strengths[:5], weaknesses[:5]


# ─── Learning Signal Extraction ──────────────────────────────

# Error category detection patterns
_ERROR_PATTERNS = {
    "polarita": [
        r"polarit[aà]", r"invertit[oa]", r"anodo.*catodo", r"catodo.*anodo",
        r"al contrario", r"girato", r"verso sbagliato",
    ],
    "resistore_mancante": [
        r"resistore.*mancante", r"senza resistore", r"manca.*resistore",
        r"bruciato.*led", r"led.*bruciato",
    ],
    "cortocircuito": [
        r"cortocircuito", r"short", r"corto circuito",
    ],
    "circuito_aperto": [
        r"circuito aperto", r"non collegat", r"scollegat", r"interrott",
        r"non si accende", r"non funziona",
    ],
    "gap_breadboard": [
        r"gap", r"attraversa.*breadboard", r"ponte.*mancante",
    ],
    "sintassi_codice": [
        r"punto e virgola", r"parentesi", r"errore.*compilazione",
        r"syntax", r"sintassi",
    ],
    "logica_codice": [
        r"non fa.*quello", r"comportamento.*diverso", r"risultato.*sbagliato",
        r"variabile.*sbagliata", r"delay.*blocca",
    ],
    "pin_sbagliato": [
        r"pin.*sbagliato", r"pin.*errato", r"collegato.*pin.*diverso",
        r"pwm", r"analogwrite.*pin",
    ],
}

# Compile patterns once
_COMPILED_ERROR_PATTERNS = {
    cat: re.compile('|'.join(patterns), re.IGNORECASE)
    for cat, patterns in _ERROR_PATTERNS.items()
}


def extract_learning_signals(message: str, response: str, circuit_context: str = "",
                              experiment_id: str = "") -> dict:
    """Extract learning signals from a message-response pair.
    Returns signals dict for update_individual_memory and update_collective_patterns.
    """
    signals = {
        "message_sent": True,
        "experiment_id": experiment_id,
    }

    combined = f"{message} {response} {circuit_context}".lower()

    # Detect error categories
    for cat, pattern in _COMPILED_ERROR_PATTERNS.items():
        if pattern.search(combined):
            signals["error_category"] = cat
            # Try to extract a detail from the response
            detail_match = re.search(r'(?:problema|errore|issue)[:\s]+(.{10,60})', response, re.IGNORECASE)
            if detail_match:
                signals["error_detail"] = detail_match.group(1).strip()
            break

    # Detect success indicators
    success_patterns = [
        r"corrett[oa]", r"funziona", r"perfett[oa]", r"bravo",
        r"ottimo", r"ben fatto", r"complimenti", r"riuscit[oa]",
    ]
    if any(re.search(p, response, re.IGNORECASE) for p in success_patterns):
        signals["success"] = True

    # Detect quiz results in response
    quiz_match = re.search(r'(\d+)\s*/\s*(\d+)\s*(?:corrett[eio]|giusti|right)', response, re.IGNORECASE)
    if quiz_match:
        signals["quiz_correct"] = int(quiz_match.group(1))
        signals["quiz_total"] = int(quiz_match.group(2))

    return signals


# ─── Memory Context Builder ──────────────────────────────────
def build_memory_context(session_id: str, experiment_id: str = "") -> str:
    """Build memory context string for injection into AI prompt.
    Returns: formatted string with [MEMORIA STUDENTE] and [PATTERN COLLETTIVI] sections.
    """
    parts = []

    # Individual memory
    if session_id:
        profile = get_individual_memory(session_id)
        if profile.get("message_count", 0) > 0:
            mem_parts = ["[MEMORIA STUDENTE]"]
            mem_parts.append(f"Livello: {profile.get('level', 'principiante')}")

            # Experiments completed
            completed = profile.get("experiments_completed", [])
            if completed:
                mem_parts.append(f"Esperimenti completati: {len(completed)}/69")

            # Quiz performance
            qr = profile.get("quiz_results", {})
            if qr.get("total", 0) > 0:
                accuracy = round(qr["correct"] / qr["total"] * 100)
                mem_parts.append(f"Quiz: {accuracy}% ({qr['correct']}/{qr['total']})")

            # Common errors (weaknesses)
            errors = profile.get("errors", [])
            if errors:
                top_errors = sorted(errors, key=lambda e: e.get("count", 0), reverse=True)[:3]
                err_str = ", ".join(f"{e['category']}(x{e['count']})" for e in top_errors)
                mem_parts.append(f"Errori frequenti: {err_str}")

            # Strengths
            strengths = profile.get("strengths", [])
            if strengths:
                mem_parts.append(f"Punti forti: {', '.join(strengths)}")

            # Messages
            mem_parts.append(f"Messaggi in sessione: {profile.get('message_count', 0)}")

            parts.append("\n".join(mem_parts))

    # Collective patterns for current experiment
    if experiment_id:
        cp = get_collective_patterns(experiment_id)
        if cp.get("total_attempts", 0) > 0:
            coll_parts = ["[PATTERN COLLETTIVI]"]
            coll_parts.append(f"Esperimento: {experiment_id}")
            coll_parts.append(f"Tentativi totali: {cp['total_attempts']}, Successo: {int(cp['success_rate']*100)}%")

            common_errs = cp.get("common_errors", [])
            if common_errs:
                top3 = common_errs[:3]
                err_str = ", ".join(f"{e['category']}({e['count']}x)" for e in top3)
                coll_parts.append(f"Errori piu' comuni: {err_str}")

            tips = cp.get("tips", [])
            if tips:
                coll_parts.append(f"Suggerimento: {tips[0]}")

            parts.append("\n".join(coll_parts))

    return "\n\n".join(parts) if parts else ""


# ─── Async Learning (fire-and-forget) ────────────────────────
async def async_learn(session_id: str, message: str, response: str,
                       circuit_context: str = "", experiment_id: str = ""):
    """Fire-and-forget async learning: extract signals → update individual + collective memory.
    Called as a background task after each AI response."""
    try:
        signals = extract_learning_signals(message, response, circuit_context, experiment_id)

        # Update individual memory
        update_individual_memory(session_id, signals)

        # Update collective patterns (only if we have an experiment)
        if experiment_id:
            update_collective_patterns(experiment_id, signals)

        if signals.get("error_category"):
            print(f"[Memory] Learned: {signals['error_category']} for {session_id}/{experiment_id}")
    except Exception as e:
        print(f"[Memory] async_learn error: {e}")
