"""
UNLIM Nanobot Server v5 — ELAB AI Backend
Multi-UNLIM: Orchestrator + 4 Specialists (Circuit/Code/Tutor/Vision)
4-Layer Intelligence: Cache → Smart Router → Parallel Racing → Quality Boost
Two AI entities: UNLIM (tutor, multi-specialist) + ELAB Assistant (public site)
Persistent JSON sessions, profanity filter, 2-level learning (individual + collective).
Supports DeepSeek, Google Gemini, Groq, Mistral, and OpenAI-compatible providers.
GDPR EU-Only mode (GDPR_EU_ONLY=true): routes ALL traffic through EU providers only (Mistral).
(c) Andrea Marro — 28/02/2026
"""

import os
import re
import json
import unicodedata
import time
import asyncio
import threading
import pathlib
import yaml
import memory as galileo_memory
from brain import get_brain
from vocab_checker import check_vocabulary
import httpx
import io
import tempfile
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field
from typing import Optional, List
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# ─── Config ───────────────────────────────────────────────────
with open("nanobot.yml", "r") as f:
    config = yaml.safe_load(f)

SYSTEM_PROMPT = config.get("system_prompt", "")

# Site assistant prompt (for public website chatbot)
try:
    with open("site-prompt.yml", "r") as f:
        site_config = yaml.safe_load(f)
    SITE_PROMPT = site_config.get("system_prompt", "")
except FileNotFoundError:
    SITE_PROMPT = ""


# ─── Multi-UNLIM: Specialist Prompts ────────────────────────
SPECIALIST_PROMPTS = {}  # {intent: compiled_prompt_string}
SHARED_CONTEXT = {}      # Shared context sections from shared.yml

def _load_specialist_prompts():
    """Load shared context + 4 specialist prompts from prompts/ directory.
    Each specialist prompt = shared context + specialist-specific sections."""
    global SHARED_CONTEXT, SPECIALIST_PROMPTS

    prompts_dir = pathlib.Path(__file__).parent / "prompts"
    if not prompts_dir.exists():
        print("[UNLIM] WARNING: prompts/ directory not found, using monolithic prompt")
        return

    # Load shared context
    shared_path = prompts_dir / "shared.yml"
    if shared_path.exists():
        try:
            with open(shared_path, "r", encoding="utf-8") as f:
                SHARED_CONTEXT = yaml.safe_load(f) or {}
            print(f"[UNLIM] Loaded shared context: {list(SHARED_CONTEXT.keys())}")
        except Exception as e:
            print(f"[UNLIM] Failed to load shared.yml: {e}")

    # Load each specialist
    for intent, filename in [("circuit", "circuit.yml"), ("code", "code.yml"),
                             ("tutor", "tutor.yml"), ("vision", "vision.yml"),
                             ("teacher", "teacher.yml")]:
        filepath = prompts_dir / filename
        if not filepath.exists():
            print(f"[UNLIM] WARNING: {filename} not found")
            continue
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                specialist = yaml.safe_load(f) or {}

            # Compile: shared identity + shared sections + specialist sections
            parts = []
            # Shared DNA
            if SHARED_CONTEXT.get("identity"):
                parts.append(SHARED_CONTEXT["identity"].strip())
            if SHARED_CONTEXT.get("reasoning"):
                parts.append(SHARED_CONTEXT["reasoning"].strip())
            if SHARED_CONTEXT.get("honesty"):
                parts.append(SHARED_CONTEXT["honesty"].strip())

            # Specialist-specific sections (all string values from the yml)
            for key, value in specialist.items():
                if isinstance(value, str) and value.strip():
                    parts.append(value.strip())

            # S76: Inject Scratch/Blockly knowledge into all specialists
            scratch_path = prompts_dir / "scratch.yml"
            if scratch_path.exists():
                try:
                    with open(scratch_path, "r", encoding="utf-8") as sf:
                        scratch_data = yaml.safe_load(sf) or {}
                    scratch_parts = []
                    for skey, sval in scratch_data.get("scratch_editor", {}).items():
                        if isinstance(sval, str) and sval.strip():
                            scratch_parts.append(sval.strip())
                    if scratch_parts:
                        parts.append("[SCRATCH/BLOCKLY EDITOR]\n" + "\n".join(scratch_parts))
                except Exception as se:
                    print(f"[UNLIM] Failed to load scratch.yml: {se}")

            # Shared reference data (experiments, components, breadboard)
            if SHARED_CONTEXT.get("experiments_catalog"):
                parts.append(SHARED_CONTEXT["experiments_catalog"].strip())
            if SHARED_CONTEXT.get("components_reference"):
                parts.append(SHARED_CONTEXT["components_reference"].strip())
            if SHARED_CONTEXT.get("breadboard_rules"):
                parts.append(SHARED_CONTEXT["breadboard_rules"].strip())

            # Action tags (shared)
            if SHARED_CONTEXT.get("action_tags"):
                parts.append(SHARED_CONTEXT["action_tags"].strip())

            # Memory instructions (shared)
            if SHARED_CONTEXT.get("memory_instructions"):
                parts.append(SHARED_CONTEXT["memory_instructions"].strip())

            compiled = "\n\n".join(parts)
            SPECIALIST_PROMPTS[intent] = compiled
            print(f"[UNLIM] Loaded specialist '{intent}': {len(compiled)} chars")

        except Exception as e:
            print(f"[UNLIM] Failed to load {filename}: {e}")

    if SPECIALIST_PROMPTS:
        print(f"[UNLIM] Multi-UNLIM ready: {list(SPECIALIST_PROMPTS.keys())} specialists")
    else:
        print("[UNLIM] WARNING: No specialist prompts loaded, falling back to monolithic")


# ─── Intent Classification (Hybrid Router) ────────────────────
INTENT_KEYWORDS = {
    "circuit": [
        "circuito", "led", "resistore", "filo", "collegamento", "non si accende",
        "bruciato", "cortocircuito", "polarit", "breadboard", "bus", "corrente",
        "tensione", "ohm", "manca", "sbagliato", "errore nel circuito", "diagnosi",
        "pin", "anodo", "catodo", "condensatore", "diodo", "mosfet", "motore",
        "cablaggio", "schema", "connessione", "componente", "fototransi", "reed",
        "capacitor", "potenz", "fotoresis", "buzzer", "batteria", "alimentazione",
        # S105: debug/wiring keywords → circuit specialist with debug_mode/wiring_guide
        "non funziona", "non va", "non parte", "aiutami a collegare",
        "dove collego", "come collego", "collegami", "dove metto i fili",
        "aiuto con il circuito", "il circuito non", "problema circuito",
    ],
    "code": [
        "codice", "errore di compilazione", "setup()", "loop()", "digital",
        "analog", "serial", "arduino", "variabile", "funzione", "void", "int ",
        "delay", "tone", "servo", "pwm", "blink", "compila", "programmazione",
        "programma", "sketch", "debug", "riga", "sintassi", "istruzione",
        "if ", "for ", "while", "millis", "map(", "include", "#include",
        "pinmode", "digitalwrite", "digitalread", "analogread", "analogwrite",
        # S76: Scratch/Blockly keywords
        "blocchi", "scratch", "blockly", "blocco", "programma a blocchi",
        "editor visuale", "trascina", "puzzle", "editor blocchi",
        "apri i blocchi", "voglio i blocchi", "programmare a blocchi",
        # S105: code explanation keywords
        "spiega il codice", "cosa fa questo codice", "spiega riga",
        "non capisco il codice", "spiega il programma", "cosa significa",
    ],
    "vision": [
        "cosa vedi", "guarda", "screen", "mostrami", "analizza l'immagine",
        "foto", "screenshot", "vedo", "lavagna", "canvas", "disegno",
    ],
    "teacher": [
        "come spiego", "lezione", "classe", "studenti", "prepara la lezione",
        "briefing", "come faccio a insegnare", "suggerisci una lezione",
        "presentare alla classe", "introdurre", "materiale per la lezione",
        "attività didattica", "valutazione", "obiettivo didattico",
        "come insegno", "preparazione lezione", "piano lezione",
    ],
}

# Keywords that are ALWAYS tutor (override other matches)
# S73 FIX-1: Use compiled regex with word boundaries to prevent false positives.
# "cos" was matching "costruisci", "spiega" was matching "spiega come collegare".
# Now: action verbs in the message CANCEL tutor override (action prevails).
TUTOR_OVERRIDE_PATTERNS = [
    re.compile(r"\bquiz\b", re.IGNORECASE),
    re.compile(r"\bgioco\b", re.IGNORECASE),
    re.compile(r"\bdetective\b", re.IGNORECASE),
    re.compile(r"\bpoe\b", re.IGNORECASE),
    re.compile(r"\breverse\b", re.IGNORECASE),
    re.compile(r"\breview\b", re.IGNORECASE),
    re.compile(r"\bapri\b", re.IGNORECASE),
    re.compile(r"\bvai a\b", re.IGNORECASE),
    re.compile(r"\bvolume\b", re.IGNORECASE),
    re.compile(r"\bpagina\b", re.IGNORECASE),
    re.compile(r"\bmanuale\b", re.IGNORECASE),
    re.compile(r"\bcapitolo\b", re.IGNORECASE),
    re.compile(r"\besperimento\b", re.IGNORECASE),
    re.compile(r"\bcarica\b", re.IGNORECASE),
    re.compile(r"cos[''`]e[''`]?\b", re.IGNORECASE),   # cos'e' / cos'è — NOT "costruisci"
    re.compile(r"\bcosa sono\b", re.IGNORECASE),
    re.compile(r"\bspiega\b", re.IGNORECASE),
    re.compile(r"\bcome funziona\b", re.IGNORECASE),
    re.compile(r"\bteoria\b", re.IGNORECASE),
    re.compile(r"\bperch[eé]\b", re.IGNORECASE),
    re.compile(r"\ba cosa serve\b", re.IGNORECASE),
    re.compile(r"\blezione\b", re.IGNORECASE),
    re.compile(r"\bclasse\b", re.IGNORECASE),
    re.compile(r"\binsegna\b", re.IGNORECASE),
    re.compile(r"\bnavigazione\b", re.IGNORECASE),
    re.compile(r"\bhome\b", re.IGNORECASE),
    re.compile(r"\bprofilo\b", re.IGNORECASE),
    re.compile(r"\byoutube\b", re.IGNORECASE),
    re.compile(r"\bvideo\b", re.IGNORECASE),
    # S105: hint/suggerimento keywords → tutor with hint_progressive
    re.compile(r"\bsuggerim\w*\b", re.IGNORECASE),
    re.compile(r"\baiut\w*\b", re.IGNORECASE),
    re.compile(r"\bbloccat\w*\b", re.IGNORECASE),
    re.compile(r"\bnon so cosa fare\b", re.IGNORECASE),
    re.compile(r"\bdammi un hint\b", re.IGNORECASE),
]
# S73: Action verbs that CANCEL tutor override — if present, message goes to circuit/code specialist
_ACTION_VERB_RE = re.compile(
    r'\b(metti|aggiungi|costruisci|collega|piazza|posiziona|inserisci|monta|'
    r'rimuovi|togli|elimina|sostituisci|scollega|cambia|modifica|ripara|correggi|'
    r'sistema|ricollega|smonta|fammi)\b',
    re.IGNORECASE
)

# Keywords that force CODE intent (override circuit when programming is requested)
CODE_OVERRIDE_KEYWORDS = [
    "scrivi un programma", "scrivi il codice", "fammi il codice",
    "scrivi il programma", "programma arduino", "programma che",
    "codice per", "codice arduino", "sketch per", "codice che",
]


def classify_intent(message: str, page_context: str = "", has_images: bool = False) -> str:
    """Hybrid intent classifier: keywords first (~1ms), Groq flash fallback for ambiguous.
    Returns: 'circuit' | 'code' | 'tutor' | 'vision' | 'teacher'"""

    # Vision trigger: images present OR visual keywords
    if has_images:
        return "vision"

    msg = message.lower()

    # S73 FIX-1: Check tutor override with word-boundary patterns,
    # BUT if the message also contains action verbs, action WINS (skip tutor override).
    has_action_verb = bool(_ACTION_VERB_RE.search(msg))
    if not has_action_verb:
        for pattern in TUTOR_OVERRIDE_PATTERNS:
            if pattern.search(msg):
                return "tutor"

    # S74 FIX-A1: Passive requests implying component addition → circuit
    if _PASSIVE_REQUEST_RE.search(msg):
        return "circuit"

    # Check code override keywords (programming requests beat circuit keywords)
    for kw in CODE_OVERRIDE_KEYWORDS:
        if kw in msg:
            return "code"

    # Score each intent by keyword matches
    scores = {}
    for intent, keywords in INTENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in msg)
        if score > 0:
            scores[intent] = score

    if not scores:
        return "tutor"  # Default to tutor for general questions

    # Vision keywords but no images → still tutor (can't analyze without image)
    if max(scores, key=scores.get) == "vision" and not has_images:
        return "tutor"

    # Clear winner (2+ points ahead)
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    if len(sorted_scores) == 1 or sorted_scores[0][1] >= sorted_scores[1][1] + 2:
        return sorted_scores[0][0]

    # Ambiguous — for now use highest score (Groq flash classify TBD in future)
    # TODO: Add Groq flash classify for ambiguous cases (Phase 2b)
    winner = sorted_scores[0][0]
    print(f"[UNLIM] Ambiguous intent, scores={dict(sorted_scores)}, chose={winner}")
    return winner


def detect_all_intents(message: str) -> list:
    """Detect ALL matching intents for multi-domain chaining.
    Returns sorted list of intents by score (highest first)."""
    msg = message.lower()
    scores = {}
    for intent, keywords in INTENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in msg)
        if score > 0:
            scores[intent] = score
    if not scores:
        return ["tutor"]
    return [k for k, _ in sorted(scores.items(), key=lambda x: x[1], reverse=True)]


# ─── Complexity Classifier (Multi-UNLIM v5) ────────────────
COMPLEX_PATTERNS = [
    r"(costruisci|monta|crea|fai).+(circuito|schema|montaggio).+(con|usando).+e\s",
    r"(togli tutto|pulisci|clearall|svuota).+(metti|aggiungi|costruisci|fai)",
    r"(collega|fili).+(tutto|tutti|completo|intero)",
    r"(perch[eé]).+(non).+(funzion|accend|parte|suona|gira)",
    r"(fai|esegui).+(\d+|più|tante|diverse|tutte).+(cose|azioni|passi|operazioni)",
    r"(metti|aggiungi).+e\s+(collega|metti).+e\s+(avvia|fai partire)",
]
_COMPLEX_RE = re.compile('|'.join(COMPLEX_PATTERNS), re.IGNORECASE)

# Reasoner provider (DeepSeek R1) — detected at startup
REASONER_PROVIDER = None


def _detect_reasoner():
    """Find DeepSeek Reasoner in AI_PROVIDERS (model contains 'reasoner')."""
    global REASONER_PROVIDER
    for p in AI_PROVIDERS:
        if "reasoner" in p.get("model", "").lower():
            REASONER_PROVIDER = p
            print(f"[UNLIM] Reasoner detected: {p['provider']}/{p['model']}")
            return
    print("[UNLIM] No Reasoner provider found — complex requests use standard path")


# NOTE: _detect_reasoner() is called AFTER AI_PROVIDERS is populated (see below)


def classify_complexity(message: str, circuit_context: str = "") -> str:
    """Classify request complexity. Returns 'simple', 'complex', or 'multi_domain'.
    - simple: single intent, single action → standard specialist
    - complex: multi-step or diagnostic → Reasoner (DeepSeek R1)
    - multi_domain: overlapping intents → chain specialists"""
    msg = message.lower()

    # Check explicit complexity patterns
    if _COMPLEX_RE.search(msg):
        return "complex"

    # Multi-domain: 2+ intents with significant scores
    intents = detect_all_intents(msg)
    if len(intents) >= 2:
        # Only true multi-domain if top 2 both have real keyword matches
        scores = {}
        for intent, keywords in INTENT_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in msg)
            if score >= 2:
                scores[intent] = score
        if len(scores) >= 2:
            return "multi_domain"

    return "simple"


def get_specialist_prompt(intent: str) -> str:
    """Get compiled specialist prompt, fallback to monolithic SYSTEM_PROMPT."""
    return SPECIALIST_PROMPTS.get(intent, SYSTEM_PROMPT)


def build_specialist_context(intent: str, session_id: str = "",
                             experiment_id: str = "", circuit_context: str = "") -> str:
    """Build enriched context for a specialist. Combines:
    - Circuit state (from frontend)
    - Experiment info
    - Individual memory (per-student)
    - Collective patterns (per-experiment)
    """
    parts = []

    if circuit_context:
        parts.append(circuit_context)

    if experiment_id:
        parts.append(f"[Esperimento attivo: {experiment_id}]")

    # Memory injection: individual + collective
    try:
        memory_context = galileo_memory.build_memory_context(session_id, experiment_id)
        if memory_context:
            parts.append(memory_context)
    except Exception as e:
        print(f"[UNLIM] Memory context failed: {e}")

    return "\n".join(parts)


# Load specialist prompts at startup
_load_specialist_prompts()


# ─── AI Providers (multi-provider with automatic detection) ───
AI_PROVIDERS = []
for i in ["1", "2", "3", "4", "5", ""]:
    suffix = i
    provider = os.getenv(f"AI_PROVIDER{suffix}", "").strip()
    api_key = os.getenv(f"AI_API_KEY{suffix}", "").strip()
    model = os.getenv(f"AI_MODEL{suffix}", "").strip()
    if provider and api_key:
        AI_PROVIDERS.append({"provider": provider, "api_key": api_key, "model": model})

# Fallback: legacy single vars
if not AI_PROVIDERS:
    legacy_provider = os.getenv("AI_PROVIDER", "deepseek")
    legacy_key = os.getenv("AI_API_KEY", "")
    legacy_model = os.getenv("AI_MODEL", "deepseek-chat")
    if legacy_key:
        AI_PROVIDERS.append({"provider": legacy_provider, "api_key": legacy_key, "model": legacy_model})

AI_BASE_URL = os.getenv("AI_BASE_URL", "")

# ─── Vision Providers (separate from text providers, tiered: primary → fallback) ───
# VISION_PROVIDER1/2 = primary tier (raced in parallel, e.g. 2x Kimi)
# Gemini from AI_PROVIDERS = automatic fallback if all primary vision providers fail
VISION_PROVIDERS = []
for i in ["1", "2", "3"]:
    v_provider = os.getenv(f"VISION_PROVIDER{i}", "").strip()
    v_key = os.getenv(f"VISION_API_KEY{i}", "").strip()
    v_model = os.getenv(f"VISION_MODEL{i}", "").strip()
    if v_provider and v_key:
        VISION_PROVIDERS.append({"provider": v_provider, "api_key": v_key, "model": v_model})

if VISION_PROVIDERS:
    print(f"[UNLIM] Vision providers (primary tier): {[p['provider']+'/'+p['model'] for p in VISION_PROVIDERS]}")
else:
    print("[UNLIM] No dedicated vision providers — using Gemini from AI_PROVIDERS for vision")

# CORS: merge env var with hardcoded essential origins
_ESSENTIAL_ORIGINS = [
    "https://elab-builder.vercel.app",
    "https://www.elabtutor.school",
    "https://elabtutor.school",
    "https://elab.school",
    "https://funny-pika-3d1029.netlify.app",
    "http://localhost:5173",
]
_env_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
CORS_ORIGINS = list(dict.fromkeys(_env_origins + _ESSENTIAL_ORIGINS))  # dedup, preserve order

# ─── GDPR EU-Only Mode ────────────────────────────────────────
# When GDPR_EU_ONLY=true, ONLY EU-resident providers are used.
# Required for Italian school sales (PNRR Scuola 4.0, Art. 44-49 GDPR).
# EU providers: Mistral (France). Non-EU: DeepSeek (China), Groq (US),
# Google/Gemini (US), OpenAI (US), Kimi/Moonshot (China).
EU_PROVIDERS = {"mistral"}
GDPR_EU_ONLY = os.getenv("GDPR_EU_ONLY", "false").lower() in ("true", "1", "yes")

if GDPR_EU_ONLY:
    _pre_filter = len(AI_PROVIDERS)
    AI_PROVIDERS = [p for p in AI_PROVIDERS if p["provider"] in EU_PROVIDERS]
    print(f"[UNLIM] GDPR EU-ONLY mode: filtered {_pre_filter} → {len(AI_PROVIDERS)} providers (EU only)")
    if not AI_PROVIDERS:
        print("[UNLIM] CRITICAL: GDPR_EU_ONLY=true but no EU providers configured! Add MISTRAL_API_KEY.")

# Tuning
MAX_TOKENS = 1500
TEMPERATURE = 0.7
PROVIDER_TIMEOUT = httpx.Timeout(45.0, connect=5.0)
IS_DEV = os.getenv("GALILEO_ENV", "production") != "production"

if IS_DEV:
    print(f"[UNLIM] CORS origins ({len(CORS_ORIGINS)}): {CORS_ORIGINS}")
if AI_PROVIDERS:
    PRIMARY = AI_PROVIDERS[0]
else:
    PRIMARY = {"provider": "none", "model": "none", "api_key": ""}
    print("[UNLIM] WARNING: No AI providers configured! Set AI_PROVIDER1 + AI_API_KEY1 env vars.")

# Detect Reasoner AFTER AI_PROVIDERS is populated
_detect_reasoner()


# ─── Voice: STT + TTS Configuration ──────────────────────────
# STT: Groq Whisper (fastest, ~200ms) — uses existing Groq provider if available
# TTS: OpenAI tts-1 (high quality) — uses existing OpenAI provider if available
# Fallback: Google Cloud TTS/STT via Gemini key

def _find_provider_key(provider_name: str) -> str:
    """Find API key for a specific provider from AI_PROVIDERS."""
    for p in AI_PROVIDERS:
        if p["provider"] == provider_name:
            return p["api_key"]
    return ""

# STT config (Groq Whisper — fastest available)
STT_API_KEY = os.getenv("STT_API_KEY", "").strip() or _find_provider_key("groq")
STT_MODEL = os.getenv("STT_MODEL", "whisper-large-v3-turbo").strip()
STT_PROVIDER = os.getenv("STT_PROVIDER", "groq").strip()

# TTS config (OpenAI tts-1)
TTS_API_KEY = os.getenv("TTS_API_KEY", "").strip() or _find_provider_key("openai")
TTS_MODEL = os.getenv("TTS_MODEL", "tts-1").strip()
TTS_VOICE = os.getenv("TTS_VOICE", "nova").strip()  # nova = friendly female, good for kids
TTS_PROVIDER = os.getenv("TTS_PROVIDER", "openai").strip()

# Fallback: if no OpenAI key for TTS, try Google
if not TTS_API_KEY:
    _google_key = _find_provider_key("google")
    if _google_key:
        TTS_API_KEY = _google_key
        TTS_PROVIDER = "google"
        print("[UNLIM Voice] TTS fallback: using Google TTS")

if STT_API_KEY:
    print(f"[UNLIM Voice] STT ready: {STT_PROVIDER}/{STT_MODEL}")
else:
    print("[UNLIM Voice] WARNING: No STT API key. Set STT_API_KEY or add Groq provider.")

if TTS_API_KEY:
    print(f"[UNLIM Voice] TTS ready: {TTS_PROVIDER}/{TTS_MODEL} voice={TTS_VOICE}")
else:
    print("[UNLIM Voice] WARNING: No TTS API key. Set TTS_API_KEY or add OpenAI provider.")


# ─── Session Storage (file-persistent + in-memory cache) ─────
SESSION_DIR = pathlib.Path(__file__).parent / "sessions"
SESSION_DIR.mkdir(exist_ok=True)
(SESSION_DIR / "tutor").mkdir(exist_ok=True)
(SESSION_DIR / "site").mkdir(exist_ok=True)

SESSION_CACHE = {}  # In-memory cache for fast access
SESSION_TTL = 86400  # 24 hours (persistent sessions)
SESSION_MAX_MESSAGES = 20  # keep last 20 messages (10 turns)
_session_lock = threading.Lock()


def _session_file(session_id: str) -> pathlib.Path:
    """Get file path for a session. Tutor sessions in tutor/, site in site/."""
    safe_id = re.sub(r'[^a-zA-Z0-9_\-]', '_', session_id)[:80]
    if session_id.startswith("tutor-"):
        return SESSION_DIR / "tutor" / f"{safe_id}.json"
    return SESSION_DIR / "site" / f"{safe_id}.json"


def get_session_history(session_id: str) -> list:
    """Get conversation history for a session (memory → file fallback)."""
    if not session_id:
        return []
    with _session_lock:
        # Check in-memory cache first
        cached = SESSION_CACHE.get(session_id)
        if cached:
            if time.time() - cached["last_access"] > SESSION_TTL:
                SESSION_CACHE.pop(session_id, None)
                _session_file(session_id).unlink(missing_ok=True)
                return []
            cached["last_access"] = time.time()
            return cached["messages"][-SESSION_MAX_MESSAGES:]

        # Load from file
        fpath = _session_file(session_id)
        if fpath.exists():
            try:
                data = json.loads(fpath.read_text(encoding="utf-8"))
                if time.time() - data.get("last_access", 0) > SESSION_TTL:
                    fpath.unlink(missing_ok=True)
                    return []
                data["last_access"] = time.time()
                SESSION_CACHE[session_id] = data
                return data["messages"][-SESSION_MAX_MESSAGES:]
            except (json.JSONDecodeError, KeyError):
                fpath.unlink(missing_ok=True)
                return []
        return []


def save_to_session(session_id: str, role: str, content: str):
    """Save a message to session history (memory + file)."""
    if not session_id:
        return
    with _session_lock:
        if session_id not in SESSION_CACHE:
            # Try loading from file first
            fpath = _session_file(session_id)
            if fpath.exists():
                try:
                    SESSION_CACHE[session_id] = json.loads(fpath.read_text(encoding="utf-8"))
                except (json.JSONDecodeError, KeyError):
                    pass
            if session_id not in SESSION_CACHE:
                SESSION_CACHE[session_id] = {"messages": [], "last_access": time.time()}

        session = SESSION_CACHE[session_id]
        session["messages"].append({"role": role, "content": content})
        session["last_access"] = time.time()
        # Trim to max
        if len(session["messages"]) > SESSION_MAX_MESSAGES * 2:
            session["messages"] = session["messages"][-SESSION_MAX_MESSAGES:]

        # Persist to file
        try:
            _session_file(session_id).write_text(
                json.dumps(session, ensure_ascii=False), encoding="utf-8"
            )
        except OSError:
            pass  # Graceful — memory still works


def cleanup_sessions():
    """Remove expired sessions (memory + files)."""
    now = time.time()
    with _session_lock:
        # Clean memory cache
        expired = [k for k, v in SESSION_CACHE.items() if now - v.get("last_access", 0) > SESSION_TTL]
        for k in expired:
            SESSION_CACHE.pop(k, None)
    # Clean files
    for subdir in ("tutor", "site"):
        folder = SESSION_DIR / subdir
        for fpath in folder.glob("*.json"):
            try:
                data = json.loads(fpath.read_text(encoding="utf-8"))
                if now - data.get("last_access", 0) > SESSION_TTL:
                    fpath.unlink(missing_ok=True)
            except (json.JSONDecodeError, OSError):
                fpath.unlink(missing_ok=True)


# ─── Profanity Filter (Italian + English) ────────────────────
PROFANITY_PATTERNS_IT = [
    r'\bcazz[oa]?\b', r'\bminchi[ao]?\b', r'\bfanculo\b', r'\bvaff?anculo\b',
    r'\bstronz[oae]?\b', r'\bmerda\b', r'\bputtana\b', r'\btroia\b',
    r'\bcoglion[eiao]?\b', r'\bcul[oa]\b', r'\bfiga\b', r'\bfottiti?\b',
    r'\bbastard[oaie]?\b', r'\bporco\s*dio\b', r'\bporca\s*madonna\b',
    r'\bdiocane\b', r'\bmadonn[aie]?\b.*\bputt', r'\bcrist[oa]?\b.*\bporco',
    r'\binca[zs]{2}[ao]?\b', r'\bschifo\s*di\s*merd', r'\bfiglio\s*di\s*putt',
    r'\bfiga\s*di\b', r'\bpezzo\s*di\s*merd', r'\bdio\s*can',
]
PROFANITY_PATTERNS_EN = [
    r'\bfuck(?:ing|ed|er|s)?\b', r'\bshit(?:ty|s)?\b', r'\bass(?:hole)?\b',
    r'\bbitch(?:es)?\b', r'\bdick(?:head|s)?\b', r'\bbastard\b',
    r'\bdamn(?:it)?\b', r'\bcunt\b', r'\bcock\b', r'\bpiss(?:ed)?\b',
    r'\bwhor[eE]\b', r'\bnigg', r'\bretard',
]
PROFANITY_EVASION = [
    r'c[a4@]zz[o0]', r'f[u\*]ck', r'm[i1]nch[i1][a@]', r'str[o0]nz',
    r'\$h[i1]t', r'f[a@]ncul', r'c0gl[i1]on', r'm[e3]rd[a@]',
]
_ALL_PROFANITY = PROFANITY_PATTERNS_IT + PROFANITY_PATTERNS_EN + PROFANITY_EVASION
_PROFANITY_RE = re.compile('|'.join(_ALL_PROFANITY), re.IGNORECASE)

PROFANITY_RESPONSE_IT = "Per favore, riformula la domanda in modo appropriato. Sono qui per aiutarti!"
PROFANITY_RESPONSE_EN = "Please rephrase your question appropriately. I'm here to help!"


def check_profanity(message: str) -> Optional[str]:
    """Check message for profanity. Returns warning message if found, None if clean."""
    if _PROFANITY_RE.search(message):
        # Detect language hint
        if re.search(r'[àèìòùé]|il |la |un |per |che |di |del ', message, re.IGNORECASE):
            return PROFANITY_RESPONSE_IT
        return PROFANITY_RESPONSE_EN
    return None


# ─── Layer 0: Experiment Cache ────────────────────────────────
EXPERIMENT_CACHE = {}  # {experimentId: {hints: str, timestamp: float}}
CACHE_TTL = 3600  # 1 hour


# ─── Layer 1: Smart Router ────────────────────────────────────
QUESTION_PATTERNS = {
    "navigation": r"(come si usa|dove trovo|apri|vai a|barra|menu|sidebar|schermata|area docente|profilo|vetrina|home|impostazioni|come funziona elab|come accedo|dove clicco)",
    "circuit": r"(circuito|led|resistore|resistenza|filo|collegamento|non si accende|non funziona|bruciato|cortocircuito|polarit|breadboard|bus|corrente|tensione|ohm|manca|sbagliato|errore nel circuito|batteria|condensatore|diodo|mosfet|pulsante|buzzer|potenziometro|fotoresist|motore|servo)",
    "code": r"(codice|errore di compilazione|compilazione|setup\(\)|loop\(\)|digital|analog|serial|pin\s*[daDa]\d|arduino|variabile|funzione|void |int |delay|tone|servo\.|pwm|blink|blocchi|scratch|millis|if\s*\(|for\s*\()",
    "teacher": r"(come spiego|lezione|classe|studenti|attivit[aà]|didattic|valutazione|introdurre|presentare alla classe|suggerisci.*lezione|come faccio a insegnare)",
    "game": r"(gioco|sfida|detective|poe|reverse|review|stelle|badge|punteggio|classifica)",
    "creative": r"(progetto|idea|costruire|inventare|cosa posso|voglio fare|creare)",
    "factual": r"(cos.è|cosa sono|cosa significa|come funziona|spiega|definizione|differenza tra|a cosa serve|perch[eé])",
}

NAVIGATION_RESPONSES = {
    "come si usa": "Per usare ELAB: dalla Home, clicca su **Tutor** per aprire il simulatore. Scegli un volume (Vol1/2/3), poi un capitolo e un esperimento. Puoi lavorare in 3 modalità: *Già Montato* (osserva), *Passo Passo* (guidato), *Esplora Libero* (crea da zero). 💡 Prova con Vol1 Cap6 Esp1 — il tuo primo LED!",
    "area docente": "L'**Area Docente** si trova nel menu in alto (icona persona con cappello). Da lì puoi: vedere i progressi degli studenti, gestire le classi, abilitare/disabilitare i giochi, e monitorare i quiz completati. 📊",
    "profilo": "Il **Profilo** si trova cliccando sull'icona utente in alto a destra. Mostra: i tuoi dati, i kit attivati, i punti guadagnati, e il tuo livello. 👤",
    "vetrina": "La **Vetrina** mostra una galleria di progetti creati con ELAB — screenshots del simulatore e circuiti reali. Puoi arrivarci dal menu principale. 🖼️",
    "come accedo": "Per accedere a ELAB: vai sulla pagina di login, inserisci email e password. Se non hai un account, clicca su *Registrati*. Per attivare un volume, vai nel Profilo e inserisci il codice del kit. 🔑",
}


def classify_question(message: str) -> str:
    """Layer 1: Classify question type for optimal provider routing.
    Collects ALL matching types and prefers domain-specific (circuit/code)
    over generic (factual) when both match. This prevents 'perché il LED
    non si accende?' from being classified as factual instead of circuit."""
    msg = message.lower()
    matches = []
    for qtype, pattern in QUESTION_PATTERNS.items():
        if re.search(pattern, msg):
            matches.append(qtype)
    if not matches:
        return "general"
    # Domain-specific types always win over generic ones
    PRIORITY = ["navigation", "circuit", "code", "teacher", "game", "creative", "factual"]
    for ptype in PRIORITY:
        if ptype in matches:
            return ptype
    return matches[0]


def get_navigation_response(message: str) -> Optional[str]:
    """Layer 1: Check if question can be answered with a static navigation response.
    Skips static response when the message mentions specific components/experiments,
    because the user is asking about a component, not platform navigation."""
    msg = message.lower()
    # Component keywords that indicate a circuit/hardware question, NOT navigation
    component_bypass = re.compile(
        r"(motor|led|buzzer|resistor|condensator|capacitor|potenziometro|potentiometer|"
        r"fototransis|phototrans|diodo|mosfet|servo|pulsante|push.?button|reed|multimetro|"
        r"batteria|arduino|nano|breadboard|filo|circuito|pin\s*d\d|sensore|"
        r"esperimento|simulatore|simulazione|blink|dimmer|semaforo|"
        r"motorino|motorone|lucina|lucetta|cicalino|manopola|interruttore)"
    )
    if component_bypass.search(msg):
        return None
    for key, response in NAVIGATION_RESPONSES.items():
        if key in msg:
            return response
    return None


def get_racing_providers(qtype: str) -> list:
    """Layer 1: Select providers for parallel racing based on question type.
    CRITICAL (S62): Gemini is RESERVED for vision only — NOT in text racing pools.
    Free-tier Gemini has 20 req/min limit; text racing exhausts quota leaving
    nothing for vision. DeepSeek + Groq handle all text routing.
    Kimi participates if configured in AI_PROVIDERS (currently on standby).
    Vision routing in race_providers() handles tiered vision selection separately."""
    routing = {
        "navigation": [],                                                # Static response, no AI
        "factual":    ["deepseek", "groq", "mistral", "kimi", "moonshot"],  # DeepSeek + Groq + Mistral + Kimi
        "circuit":    ["deepseek", "groq", "mistral", "kimi", "moonshot"],  # DeepSeek reasoning + Groq speed + Mistral EU
        "code":       ["deepseek", "groq", "mistral", "kimi", "moonshot"],  # DeepSeek code + Groq speed + Mistral EU
        "teacher":    ["deepseek", "groq", "mistral", "kimi", "moonshot"],  # DeepSeek pedagogia + Groq + Mistral EU
        "game":       ["deepseek", "groq", "mistral", "kimi", "moonshot"],  # Multi-way racing
        "creative":   ["deepseek", "groq", "mistral", "kimi", "moonshot"],  # DeepSeek creatività + Groq + Mistral EU
        "general":    ["deepseek", "groq", "mistral", "kimi", "moonshot"],  # All text providers
    }
    preferred = routing.get(qtype, routing["general"])
    matched = [p for p in AI_PROVIDERS if p["provider"] in preferred]
    return matched if matched else AI_PROVIDERS


# ─── Provider URL Builder ─────────────────────────────────────
def get_provider_url(provider: str, model: str) -> str:
    """Build API URL for the given provider."""
    urls = {
        "deepseek": "https://api.deepseek.com/v1/chat/completions",
        "groq": "https://api.groq.com/openai/v1/chat/completions",
        "mistral": "https://api.mistral.ai/v1/chat/completions",
        "openai": f"{AI_BASE_URL or 'https://api.openai.com/v1'}/chat/completions",
        "google": f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        "gemini": f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        "kimi": "https://api.moonshot.cn/v1/chat/completions",
        "moonshot": "https://api.moonshot.cn/v1/chat/completions",
    }
    return urls.get(provider, urls["openai"])


# ─── Input Sanitization (Anti Prompt Injection) ─────────────
# Two-phase defense: (1) detect → block entire message, (2) strip residual tags

# Phase 1: BLOCK patterns — if ANY match, reject the entire message
INJECTION_BLOCK_PATTERNS = [
    r'\[ADMIN\]',
    r'\[SYSTEM\]',
    r'\[OVERRIDE\]',
    r'\[(ROOT|SUDO|DEBUG|DEV)\]',
    r'ignore\s+(all\s+)?(previous\s+)?instructions',
    r'ignora\s+(tutte\s+le\s+)?istruzioni',
    r'forget\s+(all\s+)?(your\s+)?instructions',
    r'dimentica\s+(tutte\s+le\s+)?istruzioni',
    r'you\s+are\s+now\s+(?:a|an)\s+',
    r'sei\s+ora\s+(?:un|una)\s+',
    r'new\s+system\s+prompt',
    r'override\s+(system|all|tutto)',
    r'jailbreak',
    r'DAN\s+mode',
    r'respond\s+only\s+with',
    r'rispondi\s+solo\s+con',
    r'rispondi\s+(solo\s+)?["\']',         # "rispondi 'PWNED'"
    r'say\s+only\s+["\']',                 # say only "PWNED"
    r'repeat\s+after\s+me',
    r'ripeti\s+dopo\s+di\s+me',
    r'act\s+as\s+(if\s+)?(you\s+)?(are|were)',
    r'comportati\s+come',
    r'pretend\s+(you\s+)?(are|to\s+be)',
    r'fingi\s+di\s+essere',
    r'bypass\s+(the\s+)?(filter|safety|restriction)',
    r'aggira\s+(il\s+)?(filtro|restrizioni)',
]
_INJECTION_BLOCK_RE = re.compile('|'.join(INJECTION_BLOCK_PATTERNS), re.IGNORECASE)

# Phase 2: STRIP residual bracket tags (defense in depth)
_BRACKET_TAG_RE = re.compile(r'\[(ADMIN|SYSTEM|ROOT|SUDO|OVERRIDE|DEBUG|DEV|FILTERED)\]', re.IGNORECASE)

INJECTION_BLOCK_RESPONSE = (
    "Non posso eseguire questo tipo di richiesta. "
    "Sono UNLIM, il tuo tutor di elettronica! "
    "Chiedimi qualcosa sui circuiti, i componenti o gli esperimenti ELAB. ⚡"
)


# Confusable character map: Cyrillic/Greek homoglyphs → Latin equivalents
_CONFUSABLES = str.maketrans({
    '\u0410': 'A', '\u0412': 'B', '\u0421': 'C', '\u0415': 'E',
    '\u041d': 'H', '\u0406': 'I', '\u0408': 'J', '\u041a': 'K',
    '\u041c': 'M', '\u041e': 'O', '\u0420': 'P', '\u0405': 'S',
    '\u0422': 'T', '\u0425': 'X', '\u0423': 'Y', '\u0417': 'Z',
    '\u0430': 'a', '\u0435': 'e', '\u043e': 'o', '\u0440': 'p',
    '\u0441': 'c', '\u0443': 'y', '\u0445': 'x', '\u0456': 'i',
    '\u0455': 's', '\u0458': 'j',
    # Greek homoglyphs
    '\u0391': 'A', '\u0392': 'B', '\u0395': 'E', '\u0397': 'H',
    '\u0399': 'I', '\u039a': 'K', '\u039c': 'M', '\u039d': 'N',
    '\u039f': 'O', '\u03a1': 'P', '\u03a4': 'T', '\u03a5': 'Y',
    '\u03a7': 'X', '\u0396': 'Z',
    '\u03b1': 'a', '\u03bf': 'o',
})


def normalize_action_tags(text: str) -> str:
    """Normalize [azione:...] / [Azione:...] variants to [AZIONE:...] (uppercase).
    The frontend parser is case-insensitive, but we enforce uppercase for consistency."""
    return re.sub(r'\[azione:', '[AZIONE:', text, flags=re.IGNORECASE)


# S73: Convert legacy [AZIONE:addcomponent:TYPE:X:Y] to [INTENT:] format.
# The LLM sometimes ignores the circuit.yml instruction to use [INTENT:] and falls
# back to the nanobot.yml pattern. This post-processor catches those cases.
_ADDCOMP_TAG_RE = re.compile(
    r'\[AZIONE:addcomponent:([a-zA-Z0-9_-]+)(?::\d+)?(?::\d+)?\]',
    re.IGNORECASE
)

def convert_addcomponent_to_intent(text: str) -> str:
    """Convert [AZIONE:addcomponent:TYPE:X:Y] tags to [INTENT:] format.
    Multiple addcomponent tags are merged into a single multi-component INTENT."""
    if not text:
        return text
    matches = _ADDCOMP_TAG_RE.findall(text)
    if not matches:
        return text
    # Build components array from all matched types
    components = []
    for i, comp_type in enumerate(matches):
        comp_type = comp_type.lower().strip()
        comp = {"type": comp_type}
        if i > 0:
            prev_type = matches[i - 1].lower().strip()
            comp["near"] = f"{prev_type}_NEW_{i - 1}"
            comp["relation"] = "right"
        components.append(comp)
    import json
    intent_json = json.dumps({
        "action": "place_and_wire",
        "components": components,
        "wires": "auto"
    }, ensure_ascii=False)
    # Remove all [AZIONE:addcomponent:...] tags from text
    cleaned = _ADDCOMP_TAG_RE.sub('', text).rstrip()
    # Append single INTENT tag
    cleaned = cleaned.rstrip() + f'\n\n[INTENT:{intent_json}]'
    print(f"[Tutor] Converted {len(matches)} [AZIONE:addcomponent] -> [INTENT:] with {len(components)} components")
    return cleaned


# ── Identity leak sanitizer (post-processing safety net) ─────────────
_IDENTITY_LEAK_PATTERNS = [
    # Multi-specialist architecture leaks
    (re.compile(r'[Ii]l mio collega\s+(?:esperto\s+(?:di\s+)?)?[^.!?\n]*', re.IGNORECASE), ''),
    (re.compile(r'[Cc]hiedi\s+(?:pure\s+)?al\s+(?:mio\s+)?(?:collega|specialista)[^.!?\n]*', re.IGNORECASE), ''),
    (re.compile(r'(?:lo|la)\s+specialista\s+(?:di\s+|del\s+|della\s+)?[^.!?\n]*', re.IGNORECASE), ''),
    (re.compile(r"[Ll]'orchestratore[^.!?\n]*", re.IGNORECASE), ''),
    (re.compile(r'[Pp]asso la (?:domanda|richiesta) a[^.!?\n]*', re.IGNORECASE), ''),
    (re.compile(r'[Ii]l mio (?:modulo|team|gruppo)[^.!?\n]*', re.IGNORECASE), ''),
    # AI identity leaks — replace with UNLIM identity
    (re.compile(r"[Ss][iì],?\s+sono\s+un['\u2019]?\s*(?:intelligenza artificiale|AI|IA)\b[.!]*", re.IGNORECASE),
     "Sono UNLIM, il tuo compagno di avventure nell'elettronica!"),
    (re.compile(r"\bsono\s+un\s+(?:modello\s+(?:linguistico|di\s+linguaggio)|LLM|large\s+language\s+model)\b[^.!?\n]*", re.IGNORECASE),
     "Sono UNLIM, creato dal team ELAB per aiutarti a scoprire i circuiti"),
    (re.compile(r"\b(?:ChatGPT|GPT-[34]\w*|Claude|Gemini|DeepSeek|Groq|Mistral|OpenAI|Anthropic|Google\s+AI)\b", re.IGNORECASE),
     "UNLIM"),
    (re.compile(r"\b(?:un\s+tipo\s+(?:speciale\s+)?di\s+AI|un\s+assistente\s+AI)\b", re.IGNORECASE),
     "il tuo assistente ELAB"),
]

def sanitize_identity_leaks(text: str) -> str:
    """Remove any references to internal multi-specialist architecture from responses.
    This is a post-processing safety net — the prompts should prevent these,
    but LLMs sometimes ignore instructions."""
    if not text:
        return text
    result = text
    for pattern, replacement in _IDENTITY_LEAK_PATTERNS:
        result = pattern.sub(replacement, result)
    # Clean up double spaces and empty lines from removals
    result = re.sub(r'  +', ' ', result)
    result = re.sub(r'\n\s*\n\s*\n', '\n\n', result)
    return result.strip()


_ACTION_TAG_RE = re.compile(r'\[AZIONE:[^\]]+\]', re.IGNORECASE)
_ACTION_REQUEST_RE = re.compile(
    r'\b('
    r'carica|apri|vai|metti|aggiungi|costruisci|collega|rimuovi|togli|'
    r'evidenzia|mostra|mostrami|sposta|premi|gira|avvia|ferma|stop|reset|'
    r'compila|imposta|setta|porta|cancella|pulisci|interagisci|'
    r'play|pause|highlight|load|'
    # S66: missing Italian action verbs that caused repair/fallback to skip
    r'facciamo|fai|fammi|elimina|cambia|modifica|sostituisci|ricollega|'
    r'rifai|monta|smonta|scollega|inserisci|posiziona|piazza|sistema|'
    r'ripara|correggi'
    r')\b',
    re.IGNORECASE
)


def has_action_tags(text: str) -> bool:
    """True when response already contains at least one [AZIONE:...] tag."""
    return bool(text and _ACTION_TAG_RE.search(text))


def is_action_request(message: str) -> bool:
    """Heuristic: detect if user is explicitly asking the simulator to do something."""
    if not message:
        return False
    return bool(_ACTION_REQUEST_RE.search(message))


# ── Deterministic action-tag fallback (categorical imperatives) ──────────
# When LLM + repair both fail to emit tags, inject them deterministically.
# S66: expanded with "elimina", Italian clitics (-la/-li/-lo), and standalone "togli tutto"
# S66: clearall patterns — verb + noun in any order, with optional words between
_CLEARALL_VERBS = r'pulisci\w*|cancella\w*|svuota\w*|elimina\w*|togli|rimuovi|clear|resetta\w*|reset'
_CLEARALL_NOUNS = r'breadboard|circuito|tutto|tutt[oiae]|componenti|board|fili|cavi'
_CLEARALL_RE = re.compile(
    r'\b(' + _CLEARALL_VERBS + r')\b.*\b(' + _CLEARALL_NOUNS + r')\b',
    re.IGNORECASE
)
_CLEARALL_RE2 = re.compile(
    r'\b(' + _CLEARALL_NOUNS + r')\b.*\b(' + _CLEARALL_VERBS + r')\b',
    re.IGNORECASE
)
# S66: standalone "togli/rimuovi/elimina tutto" doesn't need second keyword
_CLEARALL_STANDALONE_RE = re.compile(
    r'\b(togli|rimuovi|elimina)\s+tutt[oiae]\b',
    re.IGNORECASE
)
_PLAY_RE = re.compile(r'\b(avvia|start|play|fai\s+partire)\b.*\b(simulazione|circuito|simulatore)\b', re.IGNORECASE)
_PAUSE_RE = re.compile(r'\b(ferma|stop|pausa|pause)\b.*\b(simulazione|circuito|simulatore)\b', re.IGNORECASE)
_RESET_RE = re.compile(r'\b(reset|resetta|riavvia)\b.*\b(simulazione|simulatore)\b', re.IGNORECASE)
# S66: notebook creation
_NOTEBOOK_RE = re.compile(
    r'\b(crea|nuovo|apri\s+un\s+nuovo)\b.*\b(taccuino|lezione|notebook|appunti)\b',
    re.IGNORECASE
)
_NOTEBOOK_NAME_RE = re.compile(
    r'\b(?:chiamat[oa]|intitolat[oa]|col\s+nome|dal\s+titolo)\s+"?([^"]+?)"?\s*$',
    re.IGNORECASE
)
# S73: highlight/compile/loadexp/opentab fallbacks
_HIGHLIGHT_RE = re.compile(
    r'\b(evidenzia|mostrami\s+dove|dov\W?\s*[eè]\s+il|trova\w*|indicami)\b',
    re.IGNORECASE
)
_HIGHLIGHT_TARGET_RE = re.compile(
    r'\b(led\w*|resistor\w*|buzzer\w*|pulsante|button|capacitor\w*|condensator\w*|'
    r'potenziomet\w*|fotoresist\w*|diod\w*|mosfet\w*|motor\w*|servo\w*|reed\w*|'
    r'batteria|battery|fototransistor\w*|rgb)\b',
    re.IGNORECASE
)
_COMPILE_RE = re.compile(
    r'\b(compila|verifica\s+il\s+codice|prova\s+il\s+codice|compile|build)\b',
    re.IGNORECASE
)
_LOADEXP_RE = re.compile(
    r'\b(carica|apri|vai\s+a)\b.*\b(esperimento|experiment)\s*(\d+[\.\d]*|\w+)',
    re.IGNORECASE
)
_OPENTAB_RE = re.compile(
    r'\b(apri|mostra|vai\s+a)\b.*\b(simulatore|simulator|manuale|manual|video|canvas|editor|codice)\b',
    re.IGNORECASE
)
_TAB_NAME_MAP = {
    'simulatore': 'simulator', 'simulator': 'simulator',
    'manuale': 'manual', 'manual': 'manual',
    'video': 'video',
    'canvas': 'canvas',
    'editor': 'code', 'codice': 'code',
}

# S76: Scratch/Editor deterministic fallback patterns
_OPEN_SCRATCH_RE = re.compile(
    r'\b(apri\s+i\s+blocchi|voglio\s+i\s+blocchi|programma(?:re)?\s+a\s+blocchi|'
    r'mostra(?:mi)?\s+i\s+blocchi|usa\s+scratch|apri\s+scratch|apri\s+blockly)\b',
    re.IGNORECASE
)
_OPEN_ARDUINO_RE = re.compile(
    r'\b(mostra(?:mi)?\s+il\s+codice(?:\s+arduino)?|vedi\s+il\s+codice|'
    r'passa\s+al\s+codice|torna\s+al\s+codice|apri\s+l.editor)\b',
    re.IGNORECASE
)
_CLOSE_EDITOR_RE = re.compile(
    r'\b(chiudi\s+l.editor|nascondi\s+(?:il\s+)?codice|chiudi\s+i\s+blocchi|nascondi\s+i\s+blocchi)\b',
    re.IGNORECASE
)

# S115: Undo/Redo/BuildStep/Serial/BOM/ResetCode fallback patterns
_UNDO_RE = re.compile(
    r'\b(annulla|undo|annulla\s+l.azione)\b',
    re.IGNORECASE
)
_REDO_RE = re.compile(
    r'\b(rifai|redo|ripeti\s+l.azione|ripristina\s+l.azione)\b',
    re.IGNORECASE
)
_NEXTSTEP_RE = re.compile(
    r'\b(prossimo\s+passo|avanti\s+(?:un\s+)?passo|next\s+step|passo\s+successivo|prossimo\s+step)\b',
    re.IGNORECASE
)
_PREVSTEP_RE = re.compile(
    r'\b(passo\s+precedente|torna\s+(?:al\s+)?(?:passo|step)\s+(?:precedente|prima)|prev(?:ious)?\s+step|step\s+precedente|indietro\s+(?:di\s+)?(?:un\s+)?passo)\b',
    re.IGNORECASE
)
_SHOWBOM_RE = re.compile(
    r'\b(mostra(?:mi)?\s+(?:i\s+)?(?:materiali|componenti\s+necessari)|'
    r'apri\s+(?:la\s+)?(?:lista\s+(?:dei\s+)?componenti|bom|distinta(?:\s+materiali)?)|'
    r'(?:cosa|quali)\s+componenti?\s+(?:mi\s+)?serv(?:e|ono))\b',
    re.IGNORECASE
)
_SHOWSERIAL_RE = re.compile(
    r'\b(mostra(?:mi)?\s+(?:il\s+)?(?:serial(?:e)?(?:\s+monitor)?|monitor\s+seriale)|'
    r'apri\s+(?:il\s+)?(?:serial(?:e)?(?:\s+monitor)?|monitor\s+seriale))\b',
    re.IGNORECASE
)
_RESETCODE_RE = re.compile(
    r'\b(ripristina\s+(?:il\s+)?codice|reset(?:ta)?\s+(?:il\s+)?codice|codice\s+originale)\b',
    re.IGNORECASE
)

# S105: Code explanation fallback
_EXPLAIN_CODE_RE = re.compile(
    r'\b(spiega(?:mi)?\s+(?:il\s+)?(?:codice|programma|codice\s+arduino)|'
    r'cosa\s+fa\s+(?:questo\s+)?(?:codice|programma)|'
    r'non\s+capisco\s+il\s+(?:codice|programma)|'
    r'spiega\s+riga\s+per\s+riga)\b',
    re.IGNORECASE
)

# S105: Quiz request patterns (enhanced from S58)
_QUIZ_RE = re.compile(
    r'\b(quiz|verificami|testami|fammi\s+(?:un|il)\s+quiz|mettimi\s+alla\s+prova|'
    r'domande|verifica\s+le\s+(?:mie\s+)?conoscenze)\b',
    re.IGNORECASE
)


def fast_action_dispatch(user_message: str) -> str | None:
    """Pre-LLM fast path: return canned response+tag for simple deterministic commands.
    Returns None if the message is NOT a simple command (should go to LLM).
    This prevents the LLM from hallucinating [INTENT:place_and_wire] for simple play/pause/reset.
    """
    msg_lower = user_message.lower().strip()
    # Guard: if the message also mentions components, it's NOT a simple command
    _HAS_COMPONENT_RE = re.compile(
        r'\b(led|resistor[ei]?|resistenz[ae]|buzzer|pulsante|condensator[ei]?|'
        r'potenziometr[oi]|servo|motor[ei]|diod[oi]|mosfet|reed|rgb)\b',
        re.IGNORECASE
    )
    if _HAS_COMPONENT_RE.search(msg_lower):
        return None  # Mixed request — needs LLM

    # --- Simple action commands ---
    if _PLAY_RE.search(msg_lower):
        return "▶️ Avvio la simulazione!\n\n[AZIONE:play]"
    if _PAUSE_RE.search(msg_lower):
        return "⏸ Metto in pausa la simulazione.\n\n[AZIONE:pause]"
    if _RESET_RE.search(msg_lower):
        return "🔄 Riavvio la simulazione!\n\n[AZIONE:reset]"
    if _CLEARALL_RE.search(msg_lower) or _CLEARALL_RE2.search(msg_lower) or _CLEARALL_STANDALONE_RE.search(msg_lower):
        return "🧹 Rimuovo tutti i componenti dal circuito.\n\n[AZIONE:clearall]"
    if _COMPILE_RE.search(msg_lower):
        return "⚙️ Compilo il codice!\n\n[AZIONE:compile]"
    # Undo/Redo (S115)
    if _REDO_RE.search(msg_lower):
        return "↪️ Rifaccio l'ultima azione.\n\n[AZIONE:redo]"
    if _UNDO_RE.search(msg_lower):
        return "↩️ Annullo l'ultima azione.\n\n[AZIONE:undo]"
    # Build steps
    if _NEXTSTEP_RE.search(msg_lower):
        return "➡️ Prossimo passo!\n\n[AZIONE:nextstep]"
    if _PREVSTEP_RE.search(msg_lower):
        return "⬅️ Torno al passo precedente.\n\n[AZIONE:prevstep]"
    # BOM/Serial/ResetCode
    if _SHOWBOM_RE.search(msg_lower):
        return "📋 Ecco la lista dei componenti!\n\n[AZIONE:showbom]"
    if _SHOWSERIAL_RE.search(msg_lower):
        return "📟 Apro il monitor seriale.\n\n[AZIONE:showserial]"
    if _RESETCODE_RE.search(msg_lower):
        return "🔄 Ripristino il codice originale.\n\n[AZIONE:resetcode]"
    # Scratch/Arduino editor
    if _OPEN_SCRATCH_RE.search(msg_lower):
        return "🧩 Apro l'editor a blocchi!\n\n[AZIONE:openeditor] [AZIONE:switcheditor:scratch]"
    if _OPEN_ARDUINO_RE.search(msg_lower):
        return "💻 Apro l'editor del codice!\n\n[AZIONE:openeditor] [AZIONE:switcheditor:arduino]"
    if _CLOSE_EDITOR_RE.search(msg_lower):
        return "👋 Chiudo l'editor.\n\n[AZIONE:closeeditor]"
    # Quiz
    if _QUIZ_RE.search(msg_lower):
        return "🧠 Preparati per il quiz!\n\n[AZIONE:quiz]"
    # Notebook creation
    if _NOTEBOOK_RE.search(msg_lower):
        name_match = _NOTEBOOK_NAME_RE.search(user_message.strip())
        nb_name = name_match.group(1).strip() if name_match else ''
        return f"📓 Creo un nuovo taccuino{' «' + nb_name + '»' if nb_name else ''}!\n\n[AZIONE:createnotebook:{nb_name}]"
    # Tab navigation
    opentab_match = _OPENTAB_RE.search(msg_lower)
    if opentab_match:
        raw_tab = opentab_match.group(2).lower().strip()
        tab_name = _TAB_NAME_MAP.get(raw_tab, raw_tab)
        return f"📑 Apro la scheda {raw_tab}!\n\n[AZIONE:opentab:{tab_name}]"
    # Loadexp
    loadexp_match = _LOADEXP_RE.search(msg_lower)
    if loadexp_match:
        exp_id = loadexp_match.group(3).strip()
        return f"📦 Carico l'esperimento {exp_id}!\n\n[AZIONE:loadexp:{exp_id}]"
    # Highlight
    if _HIGHLIGHT_RE.search(msg_lower):
        target_match = _HIGHLIGHT_TARGET_RE.search(msg_lower)
        if target_match:
            target_name = target_match.group(1).lower().strip()
            return f"🔍 Evidenzio {target_name}!\n\n[AZIONE:highlight:{target_name}]"

    return None  # Not a simple command — proceed to LLM


def deterministic_action_fallback(user_message: str, response: str) -> str:
    """Last-resort: inject action tags for unambiguous commands when LLM failed."""
    msg_lower = user_message.lower().strip()
    # S66: three clearall patterns — two-part (verb...noun), reverse, and standalone "togli tutto"
    if _CLEARALL_RE.search(msg_lower) or _CLEARALL_RE2.search(msg_lower) or _CLEARALL_STANDALONE_RE.search(msg_lower):
        if '[AZIONE:clearall]' not in response.upper():
            response = response.rstrip() + '\n\n[AZIONE:clearall]'
            print("[Tutor] Deterministic fallback: injected [AZIONE:clearall]")
    if _PLAY_RE.search(msg_lower) and '[AZIONE:play]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:play]'
        print("[Tutor] Deterministic fallback: injected [AZIONE:play]")
    if _PAUSE_RE.search(msg_lower) and '[AZIONE:pause]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:pause]'
        print("[Tutor] Deterministic fallback: injected [AZIONE:pause]")
    if _RESET_RE.search(msg_lower) and '[AZIONE:reset]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:reset]'
        print("[Tutor] Deterministic fallback: injected [AZIONE:reset]")
    # S66: notebook creation fallback
    if _NOTEBOOK_RE.search(msg_lower) and '[AZIONE:createnotebook' not in response.upper():
        name_match = _NOTEBOOK_NAME_RE.search(user_message.strip())
        nb_name = name_match.group(1).strip() if name_match else ''
        response = response.rstrip() + f'\n\n[AZIONE:createnotebook:{nb_name}]'
        print(f"[Tutor] Deterministic fallback: injected [AZIONE:createnotebook:{nb_name}]")
    # S73: highlight fallback — "evidenzia il LED" / "mostrami dove è il resistore"
    if _HIGHLIGHT_RE.search(msg_lower) and '[AZIONE:highlight' not in response.upper():
        target_match = _HIGHLIGHT_TARGET_RE.search(msg_lower)
        if target_match:
            # Best-effort target ID (frontend resolves fuzzy names)
            target_name = target_match.group(1).lower().strip()
            response = response.rstrip() + f'\n\n[AZIONE:highlight:{target_name}]'
            print(f"[Tutor] Deterministic fallback: injected [AZIONE:highlight:{target_name}]")
    # S73: compile fallback — "compila" / "verifica il codice"
    if _COMPILE_RE.search(msg_lower) and '[AZIONE:compile]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:compile]'
        print("[Tutor] Deterministic fallback: injected [AZIONE:compile]")
    # S73: loadexp fallback — "carica esperimento 3.2"
    loadexp_match = _LOADEXP_RE.search(msg_lower)
    if loadexp_match and '[AZIONE:loadexp' not in response.upper():
        exp_id = loadexp_match.group(3).strip()
        response = response.rstrip() + f'\n\n[AZIONE:loadexp:{exp_id}]'
        print(f"[Tutor] Deterministic fallback: injected [AZIONE:loadexp:{exp_id}]")
    # S73: opentab fallback — "apri il simulatore" / "mostra il manuale"
    opentab_match = _OPENTAB_RE.search(msg_lower)
    if opentab_match and '[AZIONE:opentab' not in response.upper():
        raw_tab = opentab_match.group(2).lower().strip()
        tab_name = _TAB_NAME_MAP.get(raw_tab, raw_tab)
        response = response.rstrip() + f'\n\n[AZIONE:opentab:{tab_name}]'
        print(f"[Tutor] Deterministic fallback: injected [AZIONE:opentab:{tab_name}]")
    # S76: Scratch/Editor fallbacks
    if _OPEN_SCRATCH_RE.search(msg_lower) and '[AZIONE:openeditor]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:openeditor] [AZIONE:switcheditor:scratch]'
        print("[Tutor] Deterministic fallback: injected openeditor + switcheditor:scratch")
    elif _OPEN_ARDUINO_RE.search(msg_lower) and '[AZIONE:openeditor]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:openeditor] [AZIONE:switcheditor:arduino]'
        print("[Tutor] Deterministic fallback: injected openeditor + switcheditor:arduino")
    elif _CLOSE_EDITOR_RE.search(msg_lower) and '[AZIONE:closeeditor]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:closeeditor]'
        print("[Tutor] Deterministic fallback: injected closeeditor")
    # S105: "spiega il codice" / "spiega il programma" → open editor so student sees code
    if _EXPLAIN_CODE_RE.search(msg_lower) and '[AZIONE:openeditor]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:openeditor]'
        print("[Tutor] Deterministic fallback: injected openeditor for code explanation")
    # S105: "quiz"/"verificami"/"testami" → ensure quiz tag (S58 kept, S105 enhanced)
    if _QUIZ_RE.search(msg_lower) and '[AZIONE:quiz]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:quiz]'
        print("[Tutor] Deterministic fallback: injected [AZIONE:quiz]")
    # S115: undo/redo/nextstep/prevstep/showbom/showserial/resetcode
    # S115-FIX: undo and redo are mutually exclusive — redo takes precedence if both match
    _wants_undo = _UNDO_RE.search(msg_lower) and '[AZIONE:undo]' not in response.upper()
    _wants_redo = _REDO_RE.search(msg_lower) and '[AZIONE:redo]' not in response.upper()
    if _wants_redo:
        response = response.rstrip() + '\n\n[AZIONE:redo]'
        print("[Tutor] Deterministic fallback: injected [AZIONE:redo]")
    elif _wants_undo:
        response = response.rstrip() + '\n\n[AZIONE:undo]'
        print("[Tutor] Deterministic fallback: injected [AZIONE:undo]")
    if _NEXTSTEP_RE.search(msg_lower) and '[AZIONE:nextstep]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:nextstep]'
        print("[Tutor] Deterministic fallback: injected [AZIONE:nextstep]")
    if _PREVSTEP_RE.search(msg_lower) and '[AZIONE:prevstep]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:prevstep]'
        print("[Tutor] Deterministic fallback: injected [AZIONE:prevstep]")
    if _SHOWBOM_RE.search(msg_lower) and '[AZIONE:showbom]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:showbom]'
        print("[Tutor] Deterministic fallback: injected [AZIONE:showbom]")
    if _SHOWSERIAL_RE.search(msg_lower) and '[AZIONE:showserial]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:showserial]'
        print("[Tutor] Deterministic fallback: injected [AZIONE:showserial]")
    if _RESETCODE_RE.search(msg_lower) and '[AZIONE:resetcode]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:resetcode]'
        print("[Tutor] Deterministic fallback: injected [AZIONE:resetcode]")
    return response


# ── Deterministic INTENT injection for component placement ─────────
# When LLM fails to emit [INTENT:], inject it for unambiguous placement requests.
_COMPONENT_NAME_MAP = {
    'led': 'led', 'led rosso': 'led', 'led verde': 'led', 'led blu': 'led',
    'led giallo': 'led', 'led bianco': 'led',
    'resistore': 'resistor', 'resistenza': 'resistor',
    'pulsante': 'push-button', 'bottone': 'push-button', 'tasto': 'push-button',
    'buzzer': 'buzzer-piezo', 'cicalino': 'buzzer-piezo',
    'condensatore': 'capacitor',
    'potenziometro': 'potentiometer',
    'fotoresistore': 'photo-resistor', 'fotoresistenza': 'photo-resistor',
    'diodo': 'diode',
    'mosfet': 'mosfet-n', 'transistor': 'mosfet-n',
    'led rgb': 'rgb-led', 'rgb': 'rgb-led',
    'motore': 'motor-dc', 'motorino': 'motor-dc',
    'servo': 'servo', 'servomotore': 'servo',
    'reed': 'reed-switch', 'sensore magnetico': 'reed-switch',
    'fototransistor': 'phototransistor',
}

# S66: expanded verb list + component names for placement detection
_COMPONENT_NAMES_RE = (
    r'led(?:\s+(?:rosso|verde|blu|giallo|bianco))?|led\s*rgb|rgb|'
    r'resistore|resistenza|pulsante|bottone|tasto|buzzer|cicalino|'
    r'condensatore|potenziometro|fotoresistore|fotoresistenza|'
    r'diodo|mosfet|transistor|motore|motorino|servo|servomotore|'
    r'reed|sensore\s+magnetico|fototransistor'
)
_PLACE_REQUEST_RE = re.compile(
    r'\b(metti|aggiungi|piazza|posiziona|inserisci|mettimi|aggiungimi|monta|collega)\b'
    r'\s+(?:un|una|il|lo|la|un\')?\s*'
    r'(' + _COMPONENT_NAMES_RE + r')',
    re.IGNORECASE
)
# S66: substitution pattern — "al posto del led metti cicalino" / "sostituisci il led con un cicalino"
_SUBSTITUTE_RE = re.compile(
    r'(?:'
    r'(?:al\s+posto\s+(?:del|della|dello|di)\w*)\s+(?:' + _COMPONENT_NAMES_RE + r')'
    r'\s+(?:metti|piazza|inserisci|mettimi|usa)\s+(?:un|una|il|lo|la|un\')?\s*'
    r'(' + _COMPONENT_NAMES_RE + r')'
    r'|'
    r'\b(?:sostituisci|cambia|rimpiazza)\b\s+(?:il|lo|la|un|una|l\')?\s*'
    r'(?:' + _COMPONENT_NAMES_RE + r')'
    r'\s+(?:con)\s+(?:un|una|il|lo|la|un\')?\s*'
    r'(' + _COMPONENT_NAMES_RE + r')'
    r')',
    re.IGNORECASE
)

_RELATION_KEYWORD_RE = re.compile(
    r'\b(vicino|sotto|sopra|accanto|destra|sinistra)\b',
    re.IGNORECASE
)

# S74 FIX-A1: Passive request patterns — "ho bisogno di un LED", "mi serve un pulsante"
_PASSIVE_REQUEST_RE = re.compile(
    r'\b(ho bisogno|mi serve|mi servirebbe|vorrei|voglio|ci vuole|manca)\b'
    r'(?:\s+di)?\s+(?:un|una|il|lo|la|un\'|uno|dei|delle|degli)?\s*'
    r'(' + _COMPONENT_NAMES_RE + r')',
    re.IGNORECASE
)
_RELATION_MAP = {
    'vicino': 'right', 'sotto': 'below', 'sopra': 'above',
    'accanto': 'next-to', 'destra': 'right', 'sinistra': 'left',
}
_ITALIAN_ARTICLES = frozenset([
    'al', 'alla', 'allo', 'ai', 'alle', 'del', 'della', 'dello',
    'dei', 'delle', 'il', 'la', 'lo', 'un', 'una', 'a', 'di',
])


def _extract_component_ids(circuit_context: str) -> list:
    """Extract (id, type) pairs from circuit context string."""
    if not circuit_context:
        return []
    return re.findall(r'-\s+(\w+)\s+\((\w[\w-]*)\)', circuit_context)


def deterministic_intent_injection(user_message: str, response: str, circuit_context: str) -> str:
    """Inject [INTENT:] tag for component placement requests when LLM failed to emit one.
    Also handles substitution: 'al posto del led metti cicalino' → remove old + add new."""
    if '[INTENT:' in response:
        return response

    msg_lower = user_message.lower().strip()
    components_in_circuit = _extract_component_ids(circuit_context)

    # S66: check for substitution first ("al posto del led metti cicalino")
    sub_match = _SUBSTITUTE_RE.search(msg_lower)
    if sub_match:
        new_name = (sub_match.group(1) or sub_match.group(2) or '').strip().lower()
        new_type = _COMPONENT_NAME_MAP.get(new_name)
        if new_type:
            # Find OLD component to remove from circuit context
            # Scan entire message for any component name that's in the circuit
            old_id = None
            for cname, ctype in _COMPONENT_NAME_MAP.items():
                if cname in msg_lower and cname != new_name:
                    for cid, ct in components_in_circuit:
                        if ct == ctype:
                            old_id = cid
                            break
                if old_id:
                    break
            tags = ''
            if old_id:
                tags += f'\n\n[AZIONE:removecomponent:{old_id}]'
            intent_data = {"action": "place_and_wire", "components": [{"type": new_type}], "wires": "auto"}
            if old_id:
                # Place near where old one was
                intent_data["components"][0]["replaces"] = old_id
            tags += f'\n[INTENT:{json.dumps(intent_data)}]'
            injected = response.rstrip() + tags
            print(f"[Tutor] Deterministic substitution: remove {old_id} + place {new_type}")
            return injected

    # S73 FIX-2: findall() to capture ALL component mentions, not just the first
    all_matches = _PLACE_REQUEST_RE.findall(msg_lower)

    # S73: Also scan for component names after conjunctions ("e", ",", "con")
    # Pattern: "LED, un resistore e una batteria" — components after "e"/"," without verb
    _EXTRA_COMP_RE = re.compile(
        r'(?:,\s*|\be\s+)(?:un|una|il|lo|la|un\')?\s*(' + _COMPONENT_NAMES_RE + r')',
        re.IGNORECASE
    )
    if all_matches:
        extra_matches = _EXTRA_COMP_RE.findall(msg_lower)
        # Combine: all_matches gives (verb, component) tuples, extra gives component strings
        found_components = [m[1].strip().lower() for m in all_matches]
        for extra in extra_matches:
            extra_lower = extra.strip().lower()
            if extra_lower not in found_components:
                found_components.append(extra_lower)
    else:
        # S73: Try "costruisci/fai un circuito con LED e resistore" pattern
        # No direct verb+component, but "con" + components
        _BUILD_RE = re.compile(
            r'\b(costruisci|fai|crea|monta|fammi)\b.*\b(circuito|schema|montaggio)\b.*\bcon\b',
            re.IGNORECASE
        )
        if _BUILD_RE.search(msg_lower):
            comp_after_con = re.findall(
                r'(?:con|,\s*|\be\s+)(?:un|una|il|lo|la|un\'|uno)?\s*(' + _COMPONENT_NAMES_RE + r')',
                msg_lower, re.IGNORECASE
            )
            found_components = [c.strip().lower() for c in comp_after_con]
        else:
            # S74 FIX-A1: Try passive request patterns ("ho bisogno di un pulsante")
            passive_matches = _PASSIVE_REQUEST_RE.findall(msg_lower)
            if passive_matches:
                found_components = [m[1].strip().lower() for m in passive_matches]
            else:
                return response

    if not found_components:
        return response

    # S73: Handle duplicate names (e.g., "3 LED" or "LED e LED e LED")
    # Check for quantity patterns
    _QTY_RE = re.compile(
        r'(\d+)\s+(' + _COMPONENT_NAMES_RE + r')',
        re.IGNORECASE
    )
    expanded_components = []
    qty_matches = _QTY_RE.findall(msg_lower)
    qty_map = {}
    for qty_str, comp_name in qty_matches:
        qty = min(int(qty_str), 10)  # cap at 10
        comp_lower = comp_name.strip().lower()
        qty_map[comp_lower] = qty

    for comp_name in found_components:
        qty = qty_map.get(comp_name, 1)
        for _ in range(qty):
            expanded_components.append(comp_name)

    # Deduplicate was already handled by qty expansion
    # Build component list
    intent_components = []
    components_in_circuit = _extract_component_ids(circuit_context)
    for i, comp_name in enumerate(expanded_components):
        component_type = _COMPONENT_NAME_MAP.get(comp_name)
        if not component_type:
            continue
        intent_comp = {"type": component_type}

        # For the first component, use spatial relation from message or default
        if i == 0:
            rel_match = _RELATION_KEYWORD_RE.search(msg_lower)
            if rel_match:
                rel_word = rel_match.group(1).lower()
                relation = _RELATION_MAP.get(rel_word, 'right')
                after = msg_lower[rel_match.end():]
                words = re.findall(r'\b\w+\b', after)
                near_id = None
                for word in words[:6]:
                    if word in _ITALIAN_ARTICLES:
                        continue
                    target_type = _COMPONENT_NAME_MAP.get(word)
                    if target_type:
                        for cid, ctype in components_in_circuit:
                            if ctype == target_type:
                                near_id = cid
                                break
                    if not near_id:
                        for cid, ctype in components_in_circuit:
                            if cid.lower() == word:
                                near_id = cid
                                break
                    if near_id:
                        break
                if near_id:
                    intent_comp["near"] = near_id
                    intent_comp["relation"] = relation
                else:
                    intent_comp["relation"] = relation
            elif components_in_circuit:
                intent_comp["near"] = components_in_circuit[0][0]
                intent_comp["relation"] = "right"
        else:
            # Subsequent components: place relative to previous NEW component
            prev_type = expanded_components[i - 1].strip().lower()
            prev_mapped = _COMPONENT_NAME_MAP.get(prev_type, 'led')
            intent_comp["near"] = f"{prev_mapped}_NEW_{i - 1}"
            intent_comp["relation"] = "right"

        intent_components.append(intent_comp)

    if not intent_components:
        return response

    intent_data = {"action": "place_and_wire", "components": intent_components, "wires": "auto"}
    intent_tag = f'[INTENT:{json.dumps(intent_data)}]'

    # S74 FIX-A2: Strip conflicting [AZIONE:movecomponent] when injecting INTENT
    # LLM may generate movecomponent for "piazza/posiziona" verbs when it should be add-new
    cleaned_response = re.sub(r'\[AZIONE:movecomponent:[^\]]*\]', '', response).rstrip()
    injected = cleaned_response + '\n\n' + intent_tag
    print(f"[Tutor] Deterministic INTENT injection ({len(intent_components)} components): {intent_tag}")
    return injected


async def repair_missing_action_tags(user_message: str, current_response: str,
                                     session_id: str = "", experiment_id: str = "",
                                     circuit_context: str = "", conversation_history: list = None) -> str:
    """Second-pass repair: if an action request got a response without tags,
    ask the specialist router to rewrite with explicit [AZIONE:...] tags."""
    repair_prompt = (
        "La risposta seguente NON include tag [AZIONE:...] ma l'utente ha chiesto azioni pratiche.\n"
        "RISCRIVI la risposta mantenendo il tono didattico, e aggiungi TUTTI i tag [AZIONE:...] necessari "
        "alla FINE (uno per riga). Non promettere azioni senza tag.\n\n"
        f"[MESSAGGIO UTENTE]\n{user_message}\n\n"
        f"[RISPOSTA ATTUALE]\n{current_response}\n"
    )
    result = await route_to_specialist_v5(
        message=repair_prompt,
        session_id=session_id,
        experiment_id=experiment_id,
        circuit_context=circuit_context,
        conversation_history=conversation_history,
        images=None,
    )
    return sanitize_identity_leaks(normalize_action_tags(result.get("response", "") or ""))


def _normalize_for_security(message: str) -> str:
    """Normalize message for security checks: homoglyphs → ASCII, collapse spaces in tags."""
    # Step 1: Transliterate Cyrillic/Greek homoglyphs → Latin
    normalized = message.translate(_CONFUSABLES)
    # Step 2: NFKD Unicode normalization (accented chars → base + combining)
    normalized = unicodedata.normalize('NFKD', normalized)
    # Step 3: Remove zero-width characters (ZWJ, ZWNJ, ZWSP, etc.)
    normalized = re.sub(r'[\u200b-\u200f\u2028-\u202f\u2060\ufeff]', '', normalized)
    # Step 4: Collapse spaces inside bracket tags: [A D M I N] → [ADMIN]
    normalized = re.sub(r'\[\s*([A-Za-z])\s+([A-Za-z])\s*([A-Za-z]?)\s*([A-Za-z]?)\s*([A-Za-z]?)\s*([A-Za-z]?)\s*\]',
                        lambda m: '[' + ''.join(c for c in m.group(0) if c.isalpha()) + ']', normalized)
    return normalized


# Base64 decode/execute detection
_BASE64_EXEC_RE = re.compile(
    r'(decodifica|decode|esegui|execute|interpreta|interpret|base64|b64)',
    re.IGNORECASE,
)
_BASE64_CONTENT_RE = re.compile(r'[A-Za-z0-9+/]{20,}={0,2}')


def check_injection(message: str) -> str | None:
    """Check for prompt injection. Returns block response if detected, None if clean."""
    # Normalize Unicode homoglyphs and space tricks
    normalized = _normalize_for_security(message)

    # Phase 1a: Block known injection patterns
    if _INJECTION_BLOCK_RE.search(normalized):
        print(f"[Security] Injection BLOCKED (pattern): {message[:80]}...")
        return INJECTION_BLOCK_RESPONSE

    # Phase 1b: Block base64-encoded injection attempts
    if _BASE64_EXEC_RE.search(normalized) and _BASE64_CONTENT_RE.search(normalized):
        print(f"[Security] Injection BLOCKED (base64): {message[:80]}...")
        return INJECTION_BLOCK_RESPONSE

    return None


def sanitize_message(message: str) -> str:
    """Strip residual bracket tags from user input (defense in depth)."""
    cleaned = _BRACKET_TAG_RE.sub('', message)
    return cleaned.strip()



# ─── FastAPI App ──────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="UNLIM Nanobot", version="5.5.0")


# Session cleanup: every 10 minutes
def _session_cleanup_loop():
    """Background thread that cleans expired sessions every 10 minutes."""
    while True:
        time.sleep(600)
        try:
            cleanup_sessions()
            print(f"[UNLIM] Session cleanup — cache: {len(SESSION_CACHE)} entries")
        except Exception as e:
            print(f"[UNLIM] Cleanup error: {e}")


_cleanup_thread = threading.Thread(target=_session_cleanup_loop, daemon=True)
_cleanup_thread.start()

# Run cleanup once at startup
try:
    cleanup_sessions()
except Exception:
    pass
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Troppi messaggi. Riprova tra un minuto."},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.on_event("shutdown")
async def shutdown_event():
    """Close persistent HTTP client on shutdown."""
    global _http_client
    if _http_client and not _http_client.is_closed:
        await _http_client.aclose()


# ─── Request/Response Models ─────────────────────────────────
class ImageData(BaseModel):
    base64: str = Field(..., max_length=2_000_000)  # ~1.5MB image
    mimeType: str = "image/png"


class ChatRequest(BaseModel):
    message: str = Field(..., max_length=15000)  # S59: increased from 2000 — frontend sends context+message concatenated
    context: Optional[str] = Field(None, max_length=10000)  # S59: separate context field (tutor state, memory, etc.)
    sessionId: Optional[str] = None
    circuitState: Optional[dict] = None
    experimentId: Optional[str] = None  # S59: was missing from model but frontend sends it
    conversationHistory: Optional[List[dict]] = None
    images: Optional[List[ImageData]] = None
    simulatorContext: Optional[dict] = None  # S104: UNLIM Context Engine — unified simulator snapshot


class DiagnoseRequest(BaseModel):
    circuitState: dict
    experimentId: Optional[str] = None


class HintsRequest(BaseModel):
    experimentId: str
    currentStep: Optional[int] = 0
    difficulty: Optional[str] = "base"


class PreloadRequest(BaseModel):
    experimentId: str


class SiteChatRequest(BaseModel):
    message: str = Field(..., max_length=2000)
    page: Optional[str] = "home"
    sessionId: Optional[str] = None


class ChatResponse(BaseModel):
    success: bool
    response: str
    source: str = "nanobot"
    layer: Optional[str] = None


# ─── MCP Tool: readCircuitState ──────────────────────────────
def format_circuit_context(state: dict) -> str:
    """Parse circuit state from frontend into human-readable context for the AI.
    
    Supports 3 formats:
    1. Phase 7+ dual format: { structured: {...}, text: "..." }
    2. Legacy text format: { raw: "..." }
    3. Legacy structured: { components: [...], connections: [...] }
    """
    if not state:
        return ""

    # Phase 7+ dual format: prefer the text field (human-readable for prompts)
    # but also append structured measurements if available
    structured = state.get("structured")
    text = state.get("text")
    
    if text and isinstance(text, str) and text.strip():
        context = text.strip()
        
        # Enrich with structured data if available
        if structured and isinstance(structured, dict):
            enrichments = []
            
            # Add measurements (not in text bridge)
            measurements = structured.get("measurements", {})
            if measurements:
                meas_lines = []
                for comp_id, data in measurements.items():
                    parts_m = [comp_id]
                    if "voltage" in data:
                        parts_m.append(f"V={data['voltage']:.3f}V")
                    if "current" in data:
                        parts_m.append(f"I={data['current']*1000:.1f}mA")
                    meas_lines.append(" — ".join(parts_m))
                if meas_lines:
                    enrichments.append(f"\nMisure elettriche ({len(meas_lines)}):")
                    enrichments.extend(f"  {line}" for line in meas_lines)
            
            # Add simulation status
            status = structured.get("status", "idle")
            is_sim = structured.get("isSimulating", False)
            if status != "idle" or is_sim:
                enrichments.append(f"\nStato: {status}" + (" — simulazione IN CORSO" if is_sim else ""))
            
            # Add warnings/errors
            warnings = structured.get("warnings", [])
            errors = structured.get("errors", [])
            if warnings:
                enrichments.append(f"⚠️ Warning: {', '.join(warnings)}")
            if errors:
                enrichments.append(f"❌ Errori: {', '.join(errors)}")
            
            # Add Arduino code presence
            if structured.get("arduinoCode"):
                code_preview = structured["arduinoCode"][:100]
                enrichments.append(f"\nCodice Arduino presente ({len(structured['arduinoCode'])} caratteri)")
            
            if enrichments:
                context += "\n" + "\n".join(enrichments)
        
        return context
    
    # Legacy: raw string format
    raw_context = state.get("raw") or state.get("rawText") or state.get("context")
    if isinstance(raw_context, str) and raw_context.strip():
        return raw_context.strip()

    # Legacy: minimal structured format
    parts = ["[STATO CIRCUITO]"]
    components = state.get("components", [])
    if components:
        parts.append(f"Componenti ({len(components)}):")
        for c in components:
            cid = c.get("id", "?")
            ctype = c.get("type", "?")
            cstate = c.get("state", {})
            status = cstate.get("status", "ok") if isinstance(cstate, dict) else "ok"
            parts.append(f"  - {cid} ({ctype}) — stato: {status}")

    connections = state.get("connections", [])
    if connections:
        parts.append(f"\nConnessioni ({len(connections)}):")
        for conn in connections:
            fr = conn.get("from", "?")
            to = conn.get("to", "?")
            color = conn.get("color", "")
            parts.append(f"  - {fr} → {to}" + (f" ({color})" if color else ""))

    return "\n".join(parts)


# ─── S104: UNLIM Context Engine — Simulator Context ─────────────
def format_simulator_context(ctx: dict) -> str:
    """Parse unified simulator context (S104) into compact text for UNLIM.
    Provides editor mode, build step, compilation results, and simulation state.
    Complements circuit_context which focuses on component/wire physics."""
    if not ctx:
        return ""

    parts = ["[CONTESTO SIMULATORE — DATI IN TEMPO REALE, USALI PER RISPONDERE]"]

    # Experiment info
    exp = ctx.get("experiment") or {}
    if exp.get("id"):
        mode_label = "AVR" if exp.get("simulationMode") == "avr" else "Circuito"
        parts.append(f"Esperimento: {exp['id']} \"{exp.get('name', '')}\" (Vol.{exp.get('volume', '?')}, {exp.get('chapter', '')}, {mode_label})")

    # Build mode + step
    build_mode = ctx.get("buildMode", "mounted")
    mode_map = {"mounted": "Già Montato", "guided": "Passo Passo", "explore": "Esplora Libero"}
    mode_label = mode_map.get(build_mode, build_mode)
    step_info = ctx.get("buildStep")
    if step_info:
        phase = step_info.get("phase", "hardware")
        phase_label = "🔧 hardware" if phase == "hardware" else "💻 codice"
        parts.append(f"Costruzione: {mode_label} — passo {step_info['current']}/{step_info['total']} ({phase_label})")
    else:
        parts.append(f"Costruzione: {mode_label}")

    # Editor mode (CRITICAL for S104 — Scratch vs Arduino awareness)
    editor_mode = ctx.get("editorMode", "arduino")
    editor_visible = ctx.get("editorVisible", False)
    if editor_mode == "scratch":
        parts.append(f"Editor: Blocchi/Scratch {'(aperto)' if editor_visible else '(chiuso)'}")
    else:
        parts.append(f"Editor: Arduino C++ {'(aperto)' if editor_visible else '(chiuso)'}")

    # Simulation state
    sim = ctx.get("simulation") or {}
    sim_state = sim.get("state", "stopped")
    sim_map = {"running": "▶ In esecuzione", "paused": "⏸ In pausa", "stopped": "⏹ Fermata"}
    parts.append(f"Simulazione: {sim_map.get(sim_state, sim_state)}")

    # Last compilation result
    compilation = ctx.get("lastCompilation")
    if compilation:
        if compilation.get("success"):
            size_str = compilation.get("size", "")
            parts.append(f"Compilazione: ✅ Successo" + (f" ({size_str})" if size_str else ""))
        else:
            errors = compilation.get("errors", [])
            err_preview = errors[0][:120] if errors and errors[0] else "errore sconosciuto"
            parts.append(f"Compilazione: ❌ Errore — {err_preview}")
        warnings = compilation.get("warnings", [])
        if warnings and warnings[0]:
            parts.append(f"Avvisi: {warnings[0][:120]}")

    # Component summary (compact)
    components = ctx.get("components", [])
    if components:
        comp_strs = []
        for c in components[:12]:  # limit to 12 for token budget
            label = f"{c['type']}[{c['id']}"
            if c.get("on"):
                label += " ON"
            if c.get("value") is not None:
                label += f" val={c['value']}"
            label += "]"
            comp_strs.append(label)
        parts.append(f"Componenti ({len(components)}): {', '.join(comp_strs)}")

    # Wire summary (compact)
    wires = ctx.get("wires", [])
    if wires:
        wire_strs = [f"{w['from']}→{w['to']}" for w in wires[:8]]
        parts.append(f"Fili ({len(wires)}): {', '.join(wire_strs)}")

    return "\n".join(parts)


# ─── AI Provider Calls ───────────────────────────────────────
# Persistent HTTP client pool — reuses TCP connections (saves ~200-500ms per call)
_http_client: httpx.AsyncClient | None = None


def _get_http_client() -> httpx.AsyncClient:
    """Lazy-init persistent async HTTP client with connection pooling."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(
            timeout=PROVIDER_TIMEOUT,
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
        )
    return _http_client


# Providers that support vision via OpenAI-compatible API (image_url in content)
OPENAI_VISION_PROVIDERS = {"openai", "kimi", "moonshot"}


async def call_openai_compatible(messages: list, api_key: str, model: str, provider: str,
                                  max_tokens: int = MAX_TOKENS, images: list = None) -> str:
    """Call OpenAI/DeepSeek/Groq/Kimi API (same format). Supports vision for capable providers."""
    url = get_provider_url(provider, model)

    # For vision-capable providers, inject images into last user message using OpenAI format
    if images and provider in OPENAI_VISION_PROVIDERS:
        formatted_messages = []
        for msg in messages:
            if msg["role"] == "user" and msg is messages[-1]:
                # Convert to multimodal content format
                content_parts = [{"type": "text", "text": msg["content"]}]
                for img in images[:3]:
                    b64 = img.get("base64", "")
                    mime = img.get("mimeType", "image/png")
                    content_parts.append({
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime};base64,{b64}"}
                    })
                formatted_messages.append({"role": msg["role"], "content": content_parts})
                print(f"[UNLIM-Vision] {provider}: injected {len(images)} images into last message")
            else:
                formatted_messages.append(msg)
    else:
        formatted_messages = messages

    client = _get_http_client()
    resp = await client.post(
        url,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": formatted_messages,
            "max_tokens": max_tokens,
            "temperature": TEMPERATURE,
        },
        timeout=30.0,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"]


async def call_google(messages: list, api_key: str, model: str, max_tokens: int = MAX_TOKENS, images: list = None) -> str:
    """Call Google Gemini API. Supports vision when images are provided.
    Includes retry with backoff for 429 rate limit errors (critical for free tier)."""
    url = get_provider_url("google", model)
    # Extract system prompt from messages (first system role), fallback to global SYSTEM_PROMPT
    sys_prompt = SYSTEM_PROMPT
    for msg in messages:
        if msg["role"] == "system":
            sys_prompt = msg["content"]
            break
    # Filter out system messages — Gemini uses systemInstruction, not "system" role in contents
    contents = []
    for msg in messages:
        if msg["role"] == "system":
            continue  # Handled via systemInstruction
        role = "user" if msg["role"] == "user" else "model"
        parts = [{"text": msg["content"]}]
        # Attach images to the last user message
        if role == "user" and images and msg is messages[-1]:
            for img in images[:3]:  # Max 3 images
                parts.append({
                    "inlineData": {
                        "mimeType": img.get("mimeType", "image/png"),
                        "data": img["base64"],
                    }
                })
        contents.append({"role": role, "parts": parts})

    if images:
        img_count = sum(1 for c in contents for p in c.get("parts", []) if "inlineData" in p)
        print(f"[UNLIM-Vision] call_google: {len(images)} images, {img_count} attached, model={model}")

    gen_config = {"maxOutputTokens": max_tokens, "temperature": TEMPERATURE}
    # Gemini 2.5 uses "thinking tokens" that count against maxOutputTokens.
    # For vision (complex image analysis), set a thinking budget so output isn't starved.
    if images and "2.5" in model:
        gen_config["thinkingConfig"] = {"thinkingBudget": 2048}
        print(f"[UNLIM-Vision] Gemini 2.5 thinking budget: 2048, maxOutputTokens: {max_tokens}")
    payload = {
        "contents": contents,
        "systemInstruction": {"parts": [{"text": sys_prompt}]},
        "generationConfig": gen_config,
    }
    headers = {"Content-Type": "application/json", "x-goog-api-key": api_key}
    client = _get_http_client()

    # Retry with backoff for 429 rate limits (up to 3 attempts for vision, 1 for text)
    max_retries = 3 if images else 1
    last_err = None
    for attempt in range(max_retries):
        try:
            timeout = 60.0 if images else 30.0
            resp = await client.post(url, headers=headers, json=payload, timeout=timeout)
            if resp.status_code == 429 and images and attempt < max_retries - 1:
                # Rate limited on vision: wait and retry
                wait_time = min(10 * (attempt + 1), 30)  # 10s, 20s, 30s
                print(f"[UNLIM-Vision] 429 rate limit on attempt {attempt+1}, retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)
                continue
            if resp.status_code != 200:
                print(f"[UNLIM-Vision] Gemini error: status={resp.status_code}, body={resp.text[:300]}")
            resp.raise_for_status()
            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                print(f"[UNLIM-Vision] WARNING: no candidates! Keys={list(data.keys())}")
                raise ValueError("No candidates in Gemini response")
            finish = candidates[0].get("finishReason", "STOP")
            text_out = data["candidates"][0]["content"]["parts"][0]["text"]
            if finish not in ("STOP", None):
                print(f"[UNLIM-Vision] WARNING: finishReason={finish}, output_len={len(text_out)} chars")
            if images:
                print(f"[UNLIM-Vision] Response: {len(text_out)} chars, finishReason={finish}")
            return text_out
        except httpx.HTTPStatusError as e:
            last_err = e
            if e.response.status_code == 429 and images and attempt < max_retries - 1:
                wait_time = min(10 * (attempt + 1), 30)
                print(f"[UNLIM-Vision] 429 HTTPStatusError attempt {attempt+1}, retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)
                continue
            print(f"[UNLIM-Vision] HTTPStatusError: {e.response.status_code} — {e.response.text[:300]}")
            raise
        except (KeyError, IndexError) as e:
            print(f"[UNLIM-Vision] Response parsing error: {e}")
            raise
    raise last_err or RuntimeError("Gemini call failed after retries")


# All providers that support vision (Gemini via inlineData, OpenAI-compatible via image_url)
ALL_VISION_PROVIDERS = {"google", "gemini", "kimi", "moonshot", "openai"}


async def call_single_provider(messages: list, prov: dict, max_tokens: int = MAX_TOKENS, images: list = None) -> str:
    """Call a single AI provider by config dict. Routes to appropriate API format."""
    provider = prov["provider"]
    if provider in ("google", "gemini"):
        return await call_google(messages, prov["api_key"], prov["model"], max_tokens, images=images)
    elif provider in OPENAI_VISION_PROVIDERS and images:
        # Vision-capable OpenAI-compatible provider (Kimi, OpenAI, etc.)
        return await call_openai_compatible(messages, prov["api_key"], prov["model"], provider, max_tokens, images=images)
    else:
        if images:
            raise ValueError(f"{provider} does not support vision/images")
        return await call_openai_compatible(messages, prov["api_key"], prov["model"], provider, max_tokens)


# Dynamic token limits by question type (faster responses for simple questions)
TOKENS_BY_QTYPE = {
    "navigation": 500,   # Short, structured
    "factual": 1200,     # Definitions, explanations (raised: diagnostic "perché?" needs room)
    "game": 800,         # Game info
    "circuit": 1500,     # Detailed circuit analysis
    "code": 1500,        # Code explanations/fixes
    "teacher": 1200,     # Pedagogical advice
    "creative": 1200,    # Project ideas
    "general": 1200,     # Default (context-aware answers need room)
}


# ─── Vision Tier Racing Helper ────────────────────────────────
async def _race_vision_tier(messages: list, tier_providers: list, max_tokens: int, images: list) -> tuple:
    """Race a tier of vision providers. Returns (text, winner, elapsed_ms) or raises on all-fail."""
    t0 = time.monotonic()

    if len(tier_providers) == 1:
        result = await call_single_provider(messages, tier_providers[0], max_tokens, images=images)
        elapsed = int((time.monotonic() - t0) * 1000)
        name = f"{tier_providers[0]['provider']}/{tier_providers[0]['model']}"
        print(f"[UNLIM-Vision] Tier winner: {name} in {elapsed}ms")
        return result, name, elapsed

    async def _call(prov):
        r = await call_single_provider(messages, prov, max_tokens, images=images)
        return r, f"{prov['provider']}/{prov['model']}"

    tasks = [asyncio.create_task(_call(p)) for p in tier_providers]
    pending = set(tasks)
    last_error = None

    while pending:
        done, pending = await asyncio.wait(pending, return_when=asyncio.FIRST_COMPLETED)
        for task in done:
            try:
                result, name = task.result()
                elapsed = int((time.monotonic() - t0) * 1000)
                for t in pending:
                    t.cancel()
                print(f"[UNLIM-Vision] Tier winner: {name} in {elapsed}ms (cancelled {len(pending)} others)")
                return result, name, elapsed
            except Exception as e:
                last_error = e
                print(f"[UNLIM-Vision] Tier provider failed: {e}")

    raise last_error or RuntimeError("All tier providers failed")


# ─── Layer 2: Parallel Racing ────────────────────────────────
async def race_providers(messages: list, providers: list = None, max_tokens: int = MAX_TOKENS, images: list = None) -> tuple:
    """Race providers in parallel. First to respond wins, others cancelled.
    When images are provided, only vision-capable providers are used.
    Returns (response_text, winner_name, elapsed_ms)."""
    targets = providers or AI_PROVIDERS

    # Vision mode: tiered provider selection
    # Tier 1: Dedicated VISION_PROVIDERS (e.g. Kimi × 2) — raced in parallel
    # Tier 2: Gemini from AI_PROVIDERS — fallback if Tier 1 fails or is not configured
    if images:
        if VISION_PROVIDERS:
            # Tier 1: race dedicated vision providers first
            print(f"[UNLIM-Vision] Tier 1: racing {len(VISION_PROVIDERS)} dedicated vision provider(s)")
            try:
                tier1_result = await _race_vision_tier(messages, VISION_PROVIDERS, max_tokens, images)
                return tier1_result
            except Exception as tier1_err:
                print(f"[UNLIM-Vision] Tier 1 FAILED ({tier1_err}), falling back to Tier 2 (Gemini)")
                # Fall through to Tier 2

            # Tier 2: Gemini fallback from AI_PROVIDERS
            gemini_targets = [p for p in AI_PROVIDERS if p["provider"] in ("google", "gemini")]
            if gemini_targets:
                print(f"[UNLIM-Vision] Tier 2: trying Gemini fallback")
                targets = gemini_targets
            else:
                raise RuntimeError("All vision providers failed (Tier 1 + no Gemini fallback)")
        else:
            # No dedicated vision providers — use any vision-capable from AI_PROVIDERS
            targets = [p for p in targets if p["provider"] in ALL_VISION_PROVIDERS]
            if not targets:
                targets = [p for p in AI_PROVIDERS if p["provider"] in ALL_VISION_PROVIDERS]
            if not targets:
                raise RuntimeError("No vision-capable provider configured for image analysis")

    if not targets:
        raise RuntimeError("No AI providers configured")

    # Single provider = no racing overhead
    if len(targets) == 1:
        t0 = time.monotonic()
        result = await call_single_provider(messages, targets[0], max_tokens, images=images)
        elapsed = int((time.monotonic() - t0) * 1000)
        name = f"{targets[0]['provider']}/{targets[0]['model']}"
        return result, name, elapsed

    # Multi-provider racing
    t0 = time.monotonic()

    async def _call(prov):
        r = await call_single_provider(messages, prov, max_tokens, images=images)
        return r, f"{prov['provider']}/{prov['model']}"

    # Minimum response length for quality gate — if a fast provider returns
    # a suspiciously short response, wait for the next one instead.
    # This prevents Groq's ultra-fast but sometimes truncated responses from
    # winning over DeepSeek's slower but more complete ones.
    MIN_RESPONSE_CHARS = 120  # ~20 words — below this, response is likely truncated

    tasks = [asyncio.create_task(_call(p)) for p in targets]
    pending = set(tasks)
    last_error = None
    short_fallback = None  # Keep first short response as fallback

    while pending:
        done, pending = await asyncio.wait(pending, return_when=asyncio.FIRST_COMPLETED)
        for task in done:
            try:
                result, name = task.result()
                elapsed = int((time.monotonic() - t0) * 1000)
                # Quality gate: reject suspiciously short responses if other providers are still running
                if len(result.strip()) < MIN_RESPONSE_CHARS and pending and not images:
                    print(f"[UNLIM] Short response from {name} ({len(result)} chars), waiting for next provider...")
                    if not short_fallback:
                        short_fallback = (result, name, elapsed)
                    continue
                # Cancel remaining
                for t in pending:
                    t.cancel()
                print(f"[UNLIM] Winner: {name} in {elapsed}ms (cancelled {len(pending)} others)")
                return result, name, elapsed
            except Exception as e:
                last_error = e
                print(f"[UNLIM] Provider failed in race: {e}")

    # If all providers failed or returned short responses, use the short fallback
    if short_fallback:
        result, name, elapsed = short_fallback
        print(f"[UNLIM] All providers short/failed — using fallback from {name} ({len(result)} chars)")
        return result, name, elapsed

    raise last_error or RuntimeError("All providers failed in race")


# ─── Layer 3: Quality Boost (async, non-blocking) ────────────
async def maybe_enhance(response: str, qtype: str, messages: list, winner: str):
    """If fast provider won on complex question, verify with DeepSeek in background.
    Returns enhanced response or None if original is sufficient."""
    if qtype not in ("circuit", "code"):
        return None
    # Only enhance if DeepSeek wasn't the winner
    if "deepseek" in winner:
        return None
    deepseek = next((p for p in AI_PROVIDERS if p["provider"] == "deepseek"), None)
    if not deepseek:
        return None
    try:
        enhanced = await call_single_provider(messages, deepseek)
        # Only use if significantly more detailed (30%+ longer)
        if len(enhanced) > len(response) * 1.3:
            return enhanced
    except Exception as e:
        print(f"[UNLIM] L3 enhancement failed: {e}")
    return None


# ─── Main AI Orchestrator ────────────────────────────────────
async def orchestrate(user_message: str, circuit_context: str = "", conversation_history: list = None,
                      images: list = None, system_prompt: str = None) -> dict:
    """4-Layer Intelligence Stack orchestrator.
    system_prompt: optional override for the system prompt (used by specialist routing).
    Returns {response, source, layer, winner, elapsed_ms}"""

    prompt = system_prompt or SYSTEM_PROMPT

    # Vision mode: skip static routing, force Gemini
    if images:
        qtype = "circuit"
        print(f"[UNLIM] Vision mode: {len(images)} image(s), routing to Gemini")
    else:
        # Layer 1: Static navigation responses
        nav_response = get_navigation_response(user_message)
        if nav_response:
            return {
                "response": nav_response,
                "source": "nanobot",
                "layer": "L1-static",
                "winner": "local",
                "elapsed_ms": 0,
            }

        # Classify question for smart routing
        qtype = classify_question(user_message)
        print(f"[UNLIM] Question classified as: {qtype}")

    # Build messages: inject circuit context INTO system prompt for stronger enforcement.
    # LLMs weight system prompt instructions much higher than user-message preambles.
    effective_prompt = prompt
    if circuit_context and not images:
        context_injection = (
            "\n\n=== STATO ATTUALE DEL SIMULATORE (DATI REALI — LEGGI PRIMA DI RISPONDERE) ===\n"
            f"{circuit_context}\n"
            "=== FINE STATO ATTUALE ===\n\n"
            "REGOLA IMPERATIVA: La tua risposta DEVE essere coerente con lo stato attuale qui sopra.\n"
            "- Se ci sono componenti piazzati, RIFERISCITI a quelli per nome/ID. NON parlare di componenti che non esistono.\n"
            "- Se c'è un passo di costruzione attivo (es. passo 2/5), guida verso il passo SUCCESSIVO.\n"
            "- Se la simulazione è in esecuzione, commenta il comportamento osservato.\n"
            "- Se c'è un errore di compilazione, aiuta a risolverlo.\n"
            "- NON ripetere istruzioni generiche se il contesto fornisce dati specifici.\n"
        )
        effective_prompt = effective_prompt + context_injection

    messages = [{"role": "system", "content": effective_prompt}]

    if conversation_history:
        for msg in conversation_history[-6:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "assistant") and content:
                messages.append({"role": role, "content": content})

    full_message = user_message
    if images:
        # Vision mode: prioritize image analysis instruction + context in user message
        vision_prefix = (
            "IMPORTANTE: Lo studente ha inviato un'immagine. "
            "Analizza PRIMA l'immagine allegata, descrivi cosa vedi nel dettaglio, "
            "poi rispondi alla domanda dello studente basandoti su ciò che osservi nell'immagine."
        )
        if circuit_context:
            full_message = f"{vision_prefix}\n\n{circuit_context}\n\nMessaggio studente:\n{user_message}"
        else:
            full_message = f"{vision_prefix}\n\nMessaggio studente:\n{user_message}"
    # For non-vision: context is already in system prompt, keep user message clean
    # This makes the user's actual question stand out more clearly

    messages.append({"role": "user", "content": full_message})

    # Layer 2: Parallel Racing with smart routing
    racing_providers = get_racing_providers(qtype)
    max_tokens = TOKENS_BY_QTYPE.get(qtype, MAX_TOKENS)
    # Vision needs much higher token budget: Gemini 2.5 thinking tokens consume part of maxOutputTokens
    if images:
        max_tokens = max(max_tokens, 8192)
    provider_names = [f"{p['provider']}/{p['model']}" for p in racing_providers]
    print(f"[UNLIM] Racing: {provider_names} (max_tokens={max_tokens})")

    response_text, winner, elapsed = await race_providers(messages, racing_providers, max_tokens, images=images)

    layer_name = f"L2-vision({qtype})" if images else f"L2-racing({qtype})"
    return {
        "response": response_text,
        "source": "nanobot",
        "layer": layer_name,
        "winner": winner,
        "elapsed_ms": elapsed,
    }


async def route_to_specialist(message: str, session_id: str = "", experiment_id: str = "",
                               circuit_context: str = "", conversation_history: list = None,
                               images: list = None) -> dict:
    """Multi-UNLIM routing: classify intent → select specialist → call orchestrate.
    Handles vision chaining (Vision → domain specialist).
    Fallback: if no specialist prompts loaded, uses monolithic SYSTEM_PROMPT."""

    has_images = bool(images)

    # FASE 1: CAPIRE — classify intent
    intent = classify_intent(message, has_images=has_images)
    print(f"[UNLIM] Intent: {intent} (images={has_images})")

    # NOTE: Brain integration moved to /chat endpoint (S112)
    # Shadow + Active modes both handled there for ALL messages (text + vision)

    # FASE 2: ARRICCHIRE — build specialist context
    enriched_context = build_specialist_context(intent, session_id, experiment_id, circuit_context)

    # FASE 3: ROUTING — select specialist prompt and route
    if not SPECIALIST_PROMPTS:
        # Fallback: no specialist prompts loaded → monolithic
        print("[UNLIM] No specialists, falling back to monolithic prompt")
        return await orchestrate(message, enriched_context, conversation_history, images=images)

    if has_images and intent == "vision":
        # S73 FIX-5: If user sent images AND has action verbs ("correggi", "sistema", "ripara"),
        # chain Vision → Circuit specialist so we get [AZIONE:] tags.
        if is_action_request(message):
            print(f"[UNLIM] Vision + action request: chaining Vision → Circuit")
            intent = "circuit"
            # Fall through to vision+domain chain below
        else:
            # Pure vision request: Vision specialist with Gemini
            vision_prompt = get_specialist_prompt("vision")
            result = await orchestrate(message, enriched_context, conversation_history,
                                       images=images, system_prompt=vision_prompt)
            result["specialist"] = "vision"
            return result

    if has_images and intent in ("circuit", "code"):
        # Vision + domain: Chain Vision → domain specialist
        # Step 1: Vision describes the image
        vision_prompt = get_specialist_prompt("vision")
        try:
            vision_result = await orchestrate(message, enriched_context, conversation_history,
                                              images=images, system_prompt=vision_prompt)
            vision_description = vision_result.get("response", "")
            print(f"[UNLIM] Vision chain: got {len(vision_description)} chars description")

            # Step 2: Domain specialist uses Vision's description
            domain_prompt = get_specialist_prompt(intent)
            enhanced_message = f"[ANALISI VISIVA]\n{vision_description}\n\n[DOMANDA STUDENTE]\n{message}"
            result = await orchestrate(enhanced_message, enriched_context, conversation_history,
                                       system_prompt=domain_prompt)
            result["specialist"] = f"vision+{intent}"
            return result
        except Exception as e:
            print(f"[UNLIM] Vision chain failed: {e}, falling back to {intent} only")
            domain_prompt = get_specialist_prompt(intent)
            result = await orchestrate(message, enriched_context, conversation_history,
                                       system_prompt=domain_prompt)
            result["specialist"] = intent
            return result
    else:
        # Standard specialist routing (no vision)
        specialist_prompt = get_specialist_prompt(intent)
        result = await orchestrate(message, enriched_context, conversation_history,
                                   system_prompt=specialist_prompt)
        result["specialist"] = intent
        return result


# ─── Multi-UNLIM v5: Inter-Agent Communication ─────────────
async def chain_specialists(message: str, intents: list, context: str,
                            conversation_history: list = None) -> dict:
    """Chain multiple specialists: each receives the output of the previous one.
    Example: Circuit analyzes → Code writes → Tutor explains to child.
    Fallback: if chain fails mid-way, return the last successful result."""
    results = []
    accumulated_context = context

    for intent in intents[:3]:  # Max 3 specialists in chain
        prompt = get_specialist_prompt(intent)

        enriched_msg = message
        if results:
            prev = results[-1]
            enriched_msg = (
                f"[ANALISI DAL COLLEGA {prev['specialist'].upper()}]\n"
                f"{prev['response'][:1500]}\n\n"
                f"[DOMANDA ORIGINALE]\n{message}\n\n"
                f"Integra l'analisi del collega nella tua risposta. "
                f"Genera TUTTI i tag [AZIONE:...] necessari."
            )

        try:
            result = await orchestrate(enriched_msg, accumulated_context,
                                       conversation_history, system_prompt=prompt)
            result["specialist"] = intent
            results.append(result)
        except Exception as e:
            print(f"[UNLIM] Chain failed at {intent}: {e}")
            break

    if not results:
        # All failed — fall through to monolithic
        return await orchestrate(message, context, conversation_history)

    final = results[-1]
    final["chain"] = [r["specialist"] for r in results]
    final["layer"] = f"L5-chain({'+'.join(final['chain'])})"
    return final


async def reasoner_then_specialist(message: str, intent: str, context: str,
                                    conversation_history: list = None) -> dict:
    """Reasoner (DeepSeek R1) plans the multi-step response, then
    the domain specialist generates the final human-friendly answer.
    Fallback: if Reasoner fails, standard specialist handles alone."""

    specialist_prompt = get_specialist_prompt(intent)

    # Step 1: Reasoner plans (system prompt = specialist's, so it knows action tags)
    reasoner_msg = (
        f"[ISTRUZIONI RAGIONAMENTO]\n"
        f"Sei il motore di ragionamento di UNLIM. Analizza questa richiesta complessa "
        f"e genera un PIANO d'azione dettagliato:\n"
        f"- Quali componenti servono e dove piazzarli (coordinate x,y)\n"
        f"- Quali connessioni (fili) creare e tra quali pin\n"
        f"- Quali tag [AZIONE:...] generare, in quale ordine esatto\n"
        f"- Come spiegare il risultato a un bambino di 10 anni\n\n"
        f"{context}\n\n"
        f"[RICHIESTA STUDENTE]\n{message}"
    )

    try:
        plan = await call_single_provider(
            [{"role": "system", "content": specialist_prompt},
             {"role": "user", "content": reasoner_msg}],
            REASONER_PROVIDER, max_tokens=2000
        )
        print(f"[UNLIM] Reasoner plan: {len(plan)} chars")

        # Step 2: Domain specialist executes the plan with proper formatting
        final_msg = (
            f"[PIANO DAL REASONER]\n{plan[:2000]}\n\n"
            f"[RICHIESTA ORIGINALE]\n{message}\n\n"
            f"Genera la risposta finale per lo studente seguendo il piano. "
            f"Ricorda: metti TUTTI i tag [AZIONE:...] alla FINE, ognuno su riga separata. "
            f"Max 200 parole di spiegazione."
        )
        result = await orchestrate(final_msg, context, conversation_history,
                                   system_prompt=specialist_prompt)
        result["specialist"] = f"reasoner+{intent}"
        result["layer"] = f"L5-reasoner({intent})"
        return result
    except Exception as e:
        print(f"[UNLIM] Reasoner failed: {e}, falling back to standard {intent}")
        # Fallback: standard specialist
        result = await orchestrate(message, context, conversation_history,
                                   system_prompt=specialist_prompt)
        result["specialist"] = intent
        return result


async def route_to_specialist_v5(message: str, session_id: str = "", experiment_id: str = "",
                                  circuit_context: str = "", conversation_history: list = None,
                                  images: list = None) -> dict:
    """Multi-UNLIM v5 routing: intent + complexity → best path.
    Paths:
      - Vision: images → Gemini (unchanged from v4)
      - Simple: single specialist (unchanged from v4)
      - Complex: Reasoner (R1) plans → specialist executes
      - Multi-domain: Chain specialists (output of A → input of B)
    Fallback: if no specialist prompts loaded, uses monolithic SYSTEM_PROMPT."""

    has_images = bool(images)
    intent = classify_intent(message, has_images=has_images)

    # Enrich context with memory + experiment
    enriched_context = build_specialist_context(intent, session_id, experiment_id, circuit_context)

    # No specialist prompts → monolithic (unchanged)
    if not SPECIALIST_PROMPTS:
        print("[UNLIM] No specialists, falling back to monolithic prompt")
        return await orchestrate(message, enriched_context, conversation_history, images=images)

    # PATH 1: Vision (unchanged from v4)
    if has_images:
        # Delegate to existing v4 vision handling
        return await route_to_specialist(
            message, session_id, experiment_id,
            circuit_context, conversation_history, images
        )

    # PATH 2: Classify complexity for non-vision requests
    complexity = classify_complexity(message, circuit_context)
    print(f"[UNLIM] v5 routing: intent={intent}, complexity={complexity}")

    # PATH 2a: COMPLEX → Reasoner (if available)
    if complexity == "complex" and REASONER_PROVIDER:
        return await reasoner_then_specialist(
            message, intent, enriched_context, conversation_history
        )

    # PATH 2b: MULTI-DOMAIN → Chain specialists
    if complexity == "multi_domain":
        all_intents = detect_all_intents(message)
        if len(all_intents) >= 2:
            print(f"[UNLIM] Multi-domain chain: {all_intents[:3]}")
            return await chain_specialists(
                message, all_intents[:3], enriched_context, conversation_history
            )

    # PATH 2c: SIMPLE → Standard single specialist (same as v4)
    specialist_prompt = get_specialist_prompt(intent)
    result = await orchestrate(message, enriched_context, conversation_history,
                               system_prompt=specialist_prompt)
    result["specialist"] = intent
    result["complexity"] = complexity
    return result


# ─── Endpoints ────────────────────────────────────────────────
@app.get("/health")
async def health():
    providers_info = [{"provider": p["provider"], "model": p["model"]} for p in AI_PROVIDERS]
    return {
        "status": "ok",
        "version": app.version,
        "layers": ["L0-cache", "L1-router", "L2-racing", "L3-enhance", "L5-reasoner", "L5-chain"],
        "providers": providers_info,
        "primary": PRIMARY["provider"],
        "model": PRIMARY["model"],
        "count": len(AI_PROVIDERS),
        "cache_entries": len(EXPERIMENT_CACHE),
        "vision": bool(VISION_PROVIDERS) or any(p["provider"] in ALL_VISION_PROVIDERS for p in AI_PROVIDERS),
        "vision_tier1": [{"provider": p["provider"], "model": p["model"]} for p in VISION_PROVIDERS] if VISION_PROVIDERS else None,
        "vision_fallback": next((f"{p['provider']}/{p['model']}" for p in AI_PROVIDERS if p["provider"] in ("google", "gemini")), None),
        "specialists": list(SPECIALIST_PROMPTS.keys()),
        "multi_galileo": len(SPECIALIST_PROMPTS) > 0,
        "reasoner": REASONER_PROVIDER["model"] if REASONER_PROVIDER else None,
        "v5_routing": True,
    }


@app.get("/gdpr-status")
async def gdpr_status():
    """GDPR data residency status. Schools can verify EU-only compliance."""
    provider_residency = {
        "mistral": "EU", "deepseek": "CN", "groq": "US",
        "google": "US", "gemini": "US", "openai": "US",
        "kimi": "CN", "moonshot": "CN",
    }
    active = [
        {"provider": p["provider"], "model": p["model"],
         "residency": provider_residency.get(p["provider"], "unknown")}
        for p in AI_PROVIDERS
    ]
    all_eu = all(pr["residency"] == "EU" for pr in active)
    return {
        "gdpr_eu_only": GDPR_EU_ONLY,
        "compliant": all_eu,
        "providers": active,
        "eu_providers": [p for p in active if p["residency"] == "EU"],
        "non_eu_providers": [p for p in active if p["residency"] != "EU"],
        "recommendation": None if all_eu else "Set GDPR_EU_ONLY=true and configure Mistral API key for full EU compliance",
    }


@app.get("/brain-stats")
async def brain_stats():
    """Get Brain statistics (shadow or active mode)."""
    brain = get_brain()
    available = await brain.is_available()

    if brain.mode == "active":
        stats = brain.get_active_stats()
    else:
        stats = brain.get_shadow_stats()

    stats["available"] = available
    stats["model"] = brain.model
    return stats


@app.get("/vocab-check")
async def vocab_check_endpoint(text: str = "Il LED ha bisogno della resistenza", experiment_id: str = "v1-cap6-esp1"):
    """Check if text uses only allowed vocabulary for the given experiment."""
    result = check_vocabulary(text, experiment_id)
    return result


@app.get("/brain-test")
async def brain_test(message: str = "avvia la simulazione"):
    """Test Brain classification with a sample message. Pass ?message=... to test."""
    brain = get_brain()
    available = await brain.is_available()
    if not available:
        return {"success": False, "error": "Brain not available (Ollama not running or model not loaded)"}

    # Temporarily allow classify even if mode is "off"
    old_mode = brain.mode
    brain.mode = "active"
    try:
        result = await brain.classify(message)
    finally:
        brain.mode = old_mode

    if result is None:
        return {"success": False, "error": "Brain returned None (JSON parse failure or timeout)"}

    return {
        "success": True,
        "message": message,
        "brain_result": result,
        "formatted_response": brain.format_brain_response(result),
        "model": brain.model,
        "mode": old_mode,
    }


@app.get("/debug-vision")
async def debug_vision():
    """Test vision pipeline with a tiny test image. Uses tiered system (Kimi → Gemini fallback)."""
    import base64, struct, zlib
    # Create minimal 2x2 red PNG
    width, height = 2, 2
    raw = b'\x00' + b'\xff\x00\x00' * width + b'\x00' + b'\xff\x00\x00' * width
    compressed = zlib.compress(raw)
    def chunk(ct, d):
        c = ct + d
        return struct.pack('>I', len(d)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')
    b64 = base64.b64encode(png).decode()

    images = [{"base64": b64, "mimeType": "image/png"}]
    messages = [{"role": "user", "content": "Describe this image in 1 sentence."}]

    try:
        response_text, winner, elapsed = await race_providers(messages, images=images)
        return {
            "success": True,
            "winner": winner,
            "elapsed_ms": elapsed,
            "response": response_text[:500],
            "tier1_providers": [f"{p['provider']}/{p['model']}" for p in VISION_PROVIDERS] if VISION_PROVIDERS else None,
            "fallback": next((f"{p['provider']}/{p['model']}" for p in AI_PROVIDERS if p["provider"] in ("google", "gemini")), None),
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__,
            "tier1_providers": [f"{p['provider']}/{p['model']}" for p in VISION_PROVIDERS] if VISION_PROVIDERS else None,
            "fallback": next((f"{p['provider']}/{p['model']}" for p in AI_PROVIDERS if p["provider"] in ("google", "gemini")), None),
        }


@app.post("/chat", response_model=ChatResponse)
@limiter.limit("30/hour")
@limiter.limit("10/minute")
@limiter.limit("3/10seconds")
async def chat(request: Request, req: ChatRequest):
    if not AI_PROVIDERS:
        raise HTTPException(status_code=503, detail="No AI providers configured")

    # Profanity check
    profanity_msg = check_profanity(req.message)
    if profanity_msg:
        return ChatResponse(success=True, response=profanity_msg, source="filter", layer="L0-filter")

    # Injection check (BLOCK entire message)
    injection_msg = check_injection(req.message)
    if injection_msg:
        return ChatResponse(success=True, response=injection_msg, source="security", layer="L0-injection-block")

    sanitized = sanitize_message(req.message)
    circuit_context = format_circuit_context(req.circuitState) if req.circuitState else ""

    # S104: UNLIM Context Engine — append simulator context (editor mode, compilation, build step)
    simulator_context = format_simulator_context(req.simulatorContext) if req.simulatorContext else ""
    if simulator_context:
        circuit_context = f"{simulator_context}\n\n{circuit_context}" if circuit_context else simulator_context

    # Use session-persisted history if sessionId provided, else use conversationHistory
    session_id = req.sessionId or ""
    if session_id.startswith("tutor-"):
        history = get_session_history(session_id) or req.conversationHistory
    else:
        history = req.conversationHistory

    # Prepare images for vision (convert Pydantic models to dicts)
    images_data = None
    if req.images:
        images_data = [{"base64": img.base64, "mimeType": img.mimeType} for img in req.images]

    # ── BRAIN ACTIVE MODE ────────────────────────────────────
    # If Brain is active and available, try local classification first.
    # needs_llm=false → respond directly (~100ms), fire LLM double-check in background
    # needs_llm=true  → pass brain intent + llm_hint to specialist routing
    # failure/timeout → silent fallback to normal regex+LLM flow
    brain = get_brain()
    brain_result = None

    if brain.mode == "active" and not images_data:
        # Format context like training dataset: [CONTESTO]\ntab: ...\n[MESSAGGIO]\n...
        brain_context = ""
        if req.simulatorContext:
            ctx = req.simulatorContext
            parts = []
            if ctx.get("tab"):
                parts.append(f"tab: {ctx['tab']}")
            if req.experimentId:
                parts.append(f"esperimento: {req.experimentId}")
            if ctx.get("editorMode"):
                parts.append(f"editor: {ctx['editorMode']}")
            if ctx.get("buildStep") and ctx.get("totalSteps"):
                parts.append(f"step_corrente: {ctx['buildStep']}/{ctx['totalSteps']}")
            if ctx.get("volume"):
                parts.append(f"volume_attivo: {ctx['volume']}")
            # Add component summary from circuit context
            if circuit_context:
                # Take first 300 chars of circuit context for Brain (it only needs a summary)
                parts.append(f"circuito: {circuit_context[:300]}")
            if parts:
                brain_context = "[CONTESTO]\n" + "\n".join(parts)

        brain_result = await brain.classify(sanitized, brain_context)

        if brain_result and brain_result.get("needs_llm") is False:
            # Brain says it can handle this directly — respond immediately
            brain_response = brain.format_brain_response(brain_result)

            if brain_response:
                # Post-process same as LLM path
                brain_response = sanitize_identity_leaks(normalize_action_tags(brain_response))
                brain_response = convert_addcomponent_to_intent(brain_response)

                print(f"[BRAIN] ✅ ACTIVE direct response | intent={brain_result.get('intent')} "
                      f"| actions={brain_result.get('actions')} | {brain_result.get('_brain_latency_ms', 0):.0f}ms")

                # Persist to session
                if session_id:
                    save_to_session(session_id, "user", req.message)
                    save_to_session(session_id, "assistant", brain_response)

                # DOUBLE-CHECK: fire LLM in background to compare
                async def _brain_double_check():
                    try:
                        llm_result = await orchestrate(sanitized, circuit_context, history)
                        llm_resp = sanitize_identity_leaks(normalize_action_tags(llm_result.get("response", "")))
                        brain.log_active_decision(sanitized, brain_result, brain_responded=True, llm_response=llm_resp)
                    except Exception as e:
                        print(f"[BRAIN] Double-check LLM failed: {e}")
                        brain.log_active_decision(sanitized, brain_result, brain_responded=True, llm_response=None)

                asyncio.create_task(_brain_double_check())

                return ChatResponse(
                    success=True,
                    response=brain_response,
                    source="brain",
                    layer="L0-brain",
                )

    # If Brain is shadow mode (text only), fire-and-forget for logging
    if brain.mode == "shadow" and not images_data:
        intent_for_shadow = classify_intent(sanitized, has_images=False)
        asyncio.create_task(brain.shadow_classify(sanitized, intent_for_shadow))

    # ── STANDARD LLM FLOW ─────────────────────────────────
    try:
        # Vision routing: when images present, use specialist routing for proper vision prompt
        if images_data:
            result = await route_to_specialist(
                sanitized,
                session_id=session_id,
                experiment_id=req.experimentId or "",
                circuit_context=circuit_context,
                conversation_history=history,
                images=images_data,
            )
        else:
            # If Brain is active and gave us needs_llm=true, pass hint as extra context
            if brain_result and brain.mode == "active" and brain_result.get("needs_llm"):
                llm_hint = brain_result.get("llm_hint") or ""
                brain_intent = brain_result.get("intent", "")
                if llm_hint:
                    hint_context = f"\n[BRAIN HINT: {llm_hint}]"
                    enhanced_circuit = f"{circuit_context}{hint_context}" if circuit_context else hint_context
                    result = await route_to_specialist(
                        sanitized,
                        session_id=session_id,
                        experiment_id=req.experimentId or "",
                        circuit_context=enhanced_circuit,
                        conversation_history=history,
                    )
                else:
                    result = await orchestrate(sanitized, circuit_context, history)
                # Log active decision (Brain routed to LLM)
                brain.log_active_decision(sanitized, brain_result, brain_responded=False,
                                          llm_response=result.get("response", ""))
            else:
                result = await orchestrate(sanitized, circuit_context, history)

        result["response"] = sanitize_identity_leaks(normalize_action_tags(result["response"]))
        # S73: Convert legacy [AZIONE:addcomponent:...] to [INTENT:] on /chat path
        result["response"] = convert_addcomponent_to_intent(result["response"])
        # S73: Deterministic fallback on /chat path for simple actions
        if is_action_request(sanitized) and not has_action_tags(result["response"]) and '[INTENT:' not in result["response"]:
            result["response"] = deterministic_action_fallback(sanitized, result["response"])
        # Persist to session
        if session_id:
            save_to_session(session_id, "user", req.message)
            save_to_session(session_id, "assistant", result["response"])
        return ChatResponse(
            success=True,
            response=result["response"],
            source=result["source"],
            layer=result["layer"],
        )
    except (httpx.HTTPStatusError, httpx.TimeoutException, Exception) as first_err:
        # Fallback: retry with ALL providers (NOTE: images are NOT passed in fallback!)
        print(f"[Chat] Primary FAILED (images={'yes' if images_data else 'no'}): {type(first_err).__name__}: {first_err}")
        try:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            if history:
                for msg in history[-6:]:
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    if role in ("user", "assistant") and content:
                        messages.append({"role": role, "content": content})
            full_msg = f"{circuit_context}\n\n{sanitized}" if circuit_context else sanitized
            messages.append({"role": "user", "content": full_msg})
            response_text, winner, _ = await race_providers(messages, AI_PROVIDERS)
            response_text = sanitize_identity_leaks(normalize_action_tags(response_text))
            # S73: Convert legacy [AZIONE:addcomponent:...] to [INTENT:] on fallback
            response_text = convert_addcomponent_to_intent(response_text)
            print(f"[Chat] Fallback succeeded: {winner}")
            if session_id:
                save_to_session(session_id, "user", req.message)
                save_to_session(session_id, "assistant", response_text)
            return ChatResponse(
                success=True,
                response=response_text,
                source="nanobot",
                layer="L2-fallback",
            )
        except Exception:
            return ChatResponse(
                success=False,
                response="Mi dispiace, i server AI sono momentaneamente sovraccarichi. Riprova tra qualche secondo! 🔄",
                source="error",
                layer="fallback-exhausted",
            )


# ─── MCP Tool: diagnoseCircuit ───────────────────────────────
DIAGNOSE_PROMPT = """Analizza questo circuito e rispondi in italiano.
Controlla:
1. Tutti i componenti sono collegati correttamente?
2. C'è alimentazione (batteria → bus + e −)?
3. I LED hanno un resistore in serie?
4. La polarità dei LED è corretta (anodo al +)?
5. Ci sono cortocircuiti o circuiti aperti?
6. I fili attraversano il gap centrale a-e/f-j con un ponte esplicito?

Rispondi con:
- DIAGNOSI: breve riassunto (1 riga)
- PROBLEMI: lista puntata dei problemi trovati (o "Nessun problema!")
- SUGGERIMENTI: come correggere ogni problema
- VOTO: da 1 a 5 stelle (⭐) sulla correttezza del circuito

Usa parole semplici adatte a un bambino di 10 anni."""


@app.post("/diagnose")
@limiter.limit("10/minute")
async def diagnose_circuit(request: Request, req: DiagnoseRequest):
    """MCP Tool: diagnoseCircuit — proactive circuit analysis."""
    if not AI_PROVIDERS:
        raise HTTPException(status_code=503, detail="No AI providers configured")

    circuit_context = format_circuit_context(req.circuitState)
    if not circuit_context:
        return {"success": False, "diagnosis": "Nessun circuito da analizzare."}

    # Injection check on experimentId (interpolated into AI prompt)
    if req.experimentId:
        injection_msg = check_injection(req.experimentId)
        if injection_msg:
            return {"success": False, "diagnosis": injection_msg, "source": "security"}

    experiment_note = ""
    if req.experimentId:
        experiment_note = f"\n[Esperimento: {req.experimentId}]"

    diag_prompt = f"{DIAGNOSE_PROMPT}\n\n{circuit_context}{experiment_note}"
    try:
        result = await orchestrate(diag_prompt)
        return {
            "success": True,
            "diagnosis": result["response"],
            "source": "nanobot",
            "layer": result["layer"],
        }
    except (httpx.HTTPStatusError, httpx.TimeoutException, Exception) as first_err:
        print(f"[Diagnose] Primary failed: {first_err}, trying fallback")
        try:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            messages.append({"role": "user", "content": diag_prompt})
            response_text, winner, _ = await race_providers(messages, AI_PROVIDERS)
            print(f"[Diagnose] Fallback succeeded: {winner}")
            return {
                "success": True,
                "diagnosis": response_text,
                "source": "nanobot",
                "layer": "L2-fallback",
            }
        except Exception:
            return {
                "success": False,
                "diagnosis": "Mi dispiace, non riesco ad analizzare il circuito in questo momento. Riprova tra qualche secondo! 🔄",
                "source": "error",
                "layer": "fallback-exhausted",
            }


# ─── MCP Tool: getExperimentHints ────────────────────────────
HINTS_PROMPT = """Sei UNLIM, tutor di elettronica per bambini.
Lo studente sta lavorando sull'esperimento "{experiment_id}" (step {step}).
Dai 3 suggerimenti progressivi:
1. SUGGERIMENTO LEGGERO: una domanda guida che fa riflettere senza dare la risposta
2. SUGGERIMENTO MEDIO: un indizio più concreto (es: "prova a guardare il pin..." )
3. SUGGERIMENTO DIRETTO: la soluzione spiegata passo per passo

Rispondi SOLO in italiano, con linguaggio adatto a bambini 8-14 anni.
Usa analogie concrete (acqua in tubo, interruttore luce, ecc.).
Formato:
💡 Suggerimento 1: ...
🔍 Suggerimento 2: ...
✅ Suggerimento 3: ..."""


@app.post("/hints")
@limiter.limit("10/minute")
async def get_experiment_hints(request: Request, req: HintsRequest):
    """MCP Tool: getExperimentHints — progressive hints for an experiment."""
    if not AI_PROVIDERS:
        raise HTTPException(status_code=503, detail="No AI providers configured")

    # Injection check on experimentId (interpolated into AI prompt)
    injection_msg = check_injection(req.experimentId)
    if injection_msg:
        return {"success": False, "hints": injection_msg, "source": "security"}

    # Layer 0: Check cache first
    cache_key = f"{req.experimentId}:{req.currentStep}"
    cached = EXPERIMENT_CACHE.get(cache_key)
    if cached and (time.time() - cached["timestamp"]) < CACHE_TTL:
        print(f"[UNLIM] L0 cache hit: {cache_key}")
        return {
            "success": True,
            "hints": cached["hints"],
            "source": "nanobot",
            "layer": "L0-cache",
        }

    prompt = HINTS_PROMPT.format(
        experiment_id=req.experimentId,
        step=req.currentStep,
    )

    try:
        result = await orchestrate(prompt)
        # Cache the result
        EXPERIMENT_CACHE[cache_key] = {
            "hints": result["response"],
            "timestamp": time.time(),
        }
        return {
            "success": True,
            "hints": result["response"],
            "source": "nanobot",
            "layer": result["layer"],
        }
    except (httpx.HTTPStatusError, httpx.TimeoutException, Exception) as first_err:
        # Fallback: retry with ALL providers
        print(f"[Hints] Primary failed: {first_err}, trying fallback with all providers")
        try:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            messages.append({"role": "user", "content": prompt})
            response_text, winner, _ = await race_providers(messages, AI_PROVIDERS)
            print(f"[Hints] Fallback succeeded: {winner}")
            EXPERIMENT_CACHE[cache_key] = {
                "hints": response_text,
                "timestamp": time.time(),
            }
            return {
                "success": True,
                "hints": response_text,
                "source": "nanobot",
                "layer": "L2-fallback",
            }
        except Exception:
            return {
                "success": False,
                "hints": "Mi dispiace, non riesco a generare suggerimenti in questo momento. Riprova tra qualche secondo! 🔄",
                "source": "error",
                "layer": "fallback-exhausted",
            }


# ─── Preload: pre-generate hints when student opens experiment ─
# S112: Allow Vol3 named experiments (v3-cap6-blink, v3-extra-simon, etc.)
EXPERIMENT_ID_RE = re.compile(r"^v[1-3]-(cap\d+|extra)-[a-z0-9-]+$")


@app.post("/preload")
@limiter.limit("30/hour")
@limiter.limit("10/minute")
@limiter.limit("3/10seconds")
async def preload_experiment(request: Request, req: PreloadRequest, background_tasks: BackgroundTasks):
    """Frontend calls this when student opens an experiment.
    Pre-generates hints in background using cheapest/fastest provider."""
    if not EXPERIMENT_ID_RE.match(req.experimentId):
        raise HTTPException(status_code=400, detail="experimentId non valido")
    cache_key = f"{req.experimentId}:0"
    if cache_key in EXPERIMENT_CACHE:
        return {"cached": True, "experimentId": req.experimentId}

    background_tasks.add_task(precompute_experiment, req.experimentId)
    return {"cached": False, "preloading": True, "experimentId": req.experimentId}


async def precompute_experiment(exp_id: str):
    """Pre-generate hints for an experiment using fastest provider (Groq preferred)."""
    # Pick fastest provider (Groq > Google > DeepSeek)
    fast = next(
        (p for p in AI_PROVIDERS if p["provider"] == "groq"),
        next(
            (p for p in AI_PROVIDERS if p["provider"] == "google"),
            AI_PROVIDERS[0] if AI_PROVIDERS else None,
        ),
    )
    if not fast:
        return

    prompt = HINTS_PROMPT.format(experiment_id=exp_id, step=0)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt},
    ]

    try:
        hints = await call_single_provider(messages, fast)
        cache_key = f"{exp_id}:0"
        EXPERIMENT_CACHE[cache_key] = {"hints": hints, "timestamp": time.time()}
        print(f"[UNLIM] Preloaded hints for {exp_id} via {fast['provider']}")
    except Exception as e:
        print(f"[UNLIM] Preload failed for {exp_id}: {e}")


# ─── Site Chat: Public Website Chatbot ──────────────────────
@app.post("/site-chat")
@limiter.limit("30/hour")
@limiter.limit("10/minute")
@limiter.limit("3/10seconds")
async def site_chat(request: Request, req: SiteChatRequest):
    """Public website chatbot — uses site-prompt.yml for sales/info responses."""
    if not AI_PROVIDERS:
        raise HTTPException(status_code=503, detail="No AI providers configured")

    if not SITE_PROMPT:
        raise HTTPException(status_code=503, detail="Site prompt not configured")

    # Profanity check
    profanity_msg = check_profanity(req.message)
    if profanity_msg:
        return {"success": True, "response": profanity_msg, "source": "filter"}

    # Injection check (BLOCK entire message)
    injection_msg = check_injection(req.message)
    if injection_msg:
        return {"success": True, "response": injection_msg, "source": "security"}

    page_context = f" (L'utente sta navigando la pagina: {req.page})" if req.page else ""
    user_message = sanitize_message(req.message) + page_context

    # Get conversation history from session (file-persistent)
    history = get_session_history(req.sessionId)

    messages = [{"role": "system", "content": SITE_PROMPT}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    # Try fast providers first (Groq/Gemini), fallback to all if they fail
    fast_providers = [p for p in AI_PROVIDERS if p["provider"] in ("groq", "google", "gemini")]

    try:
        if fast_providers:
            response, winner, _ = await race_providers(messages, fast_providers)
        else:
            response, winner, _ = await race_providers(messages, AI_PROVIDERS)
        print(f"[Site] Provider: {winner} | Page: {req.page}")
        # Save to session (persistent)
        save_to_session(req.sessionId, "user", req.message)
        save_to_session(req.sessionId, "assistant", response)
        return {
            "success": True,
            "response": response,
            "source": "elab-assistant",
        }
    except Exception:
        # Fast providers failed — fallback to ALL providers (incl. DeepSeek)
        try:
            response, winner, _ = await race_providers(messages, AI_PROVIDERS)
            print(f"[Site] Fallback: {winner} | Page: {req.page}")
            save_to_session(req.sessionId, "user", req.message)
            save_to_session(req.sessionId, "assistant", response)
            return {
                "success": True,
                "reply": response,
                "source": "elab-assistant",
            }
        except Exception as e:
            print(f"[Site] All providers failed: {e}")
            raise HTTPException(status_code=500, detail="Errore interno del server. Riprova più tardi.")


# ─── Tutor Chat: Simulator Chatbot (experiment-aware) ────────
class TutorChatRequest(BaseModel):
    message: str = Field(..., max_length=15000)  # S59: increased — frontend sends context+message concatenated
    experimentId: Optional[str] = None
    circuitState: Optional[dict] = None
    sessionId: Optional[str] = None
    conversationHistory: Optional[List[dict]] = None
    simulatorContext: Optional[dict] = None  # S104: UNLIM Context Engine


@app.post("/tutor-chat", response_model=ChatResponse)
@limiter.limit("30/hour")
@limiter.limit("10/minute")
@limiter.limit("3/10seconds")
async def tutor_chat(request: Request, req: TutorChatRequest, background_tasks: BackgroundTasks):
    """Multi-UNLIM tutor chatbot — routes to specialist (circuit/code/tutor/vision)."""
    if not AI_PROVIDERS:
        raise HTTPException(status_code=503, detail="No AI providers configured")

    # Profanity check
    profanity_msg = check_profanity(req.message)
    if profanity_msg:
        return ChatResponse(success=True, response=profanity_msg, source="filter", layer="L0-filter")

    # Injection check (BLOCK entire message)
    injection_msg = check_injection(req.message)
    if injection_msg:
        return ChatResponse(success=True, response=injection_msg, source="security", layer="L0-injection-block")

    circuit_context = format_circuit_context(req.circuitState) if req.circuitState else ""
    user_msg = sanitize_message(req.message)

    # S104: UNLIM Context Engine — append simulator context
    simulator_context = format_simulator_context(req.simulatorContext) if req.simulatorContext else ""
    if simulator_context:
        circuit_context = f"{simulator_context}\n\n{circuit_context}" if circuit_context else simulator_context

    # Session-persisted history
    session_id = req.sessionId or ""
    history = get_session_history(session_id) if session_id else req.conversationHistory

    try:
        # S116: Pre-LLM fast path for simple deterministic commands (play/pause/reset/etc.)
        # Prevents LLM hallucination of [INTENT:place_and_wire] for simple action requests
        fast_response = fast_action_dispatch(user_msg)
        if fast_response:
            print(f"[Tutor] Fast-action dispatch: bypassed LLM for '{user_msg[:50]}'")
            if session_id:
                save_to_session(session_id, "user", req.message)
                save_to_session(session_id, "assistant", fast_response)
            return ChatResponse(
                success=True,
                response=fast_response,
                source="deterministic",
                layer="L0-fast-action",
            )

        # Multi-UNLIM v5: intent + complexity routing
        result = await route_to_specialist_v5(
            message=user_msg,
            session_id=session_id,
            experiment_id=req.experimentId or "",
            circuit_context=circuit_context,
            conversation_history=history,
            images=None,  # Phase 4 will add auto-screenshot support
        )
        result["response"] = sanitize_identity_leaks(normalize_action_tags(result["response"]))
        # S73: Convert legacy [AZIONE:addcomponent:...] to [INTENT:] before intent check
        result["response"] = convert_addcomponent_to_intent(result["response"])
        specialist = result.get("specialist", "monolithic")

        # Placement Engine: inject [INTENT:] for component placement requests.
        # MUST run BEFORE repair pass to prevent repair from overwriting with wrong tags.
        has_intent = '[INTENT:' in result["response"]
        if not has_intent and is_action_request(user_msg):
            result["response"] = deterministic_intent_injection(
                user_msg, result["response"], circuit_context
            )
            has_intent = '[INTENT:' in result["response"]
            if has_intent:
                result["layer"] = f"{result['layer']}+intent-injection"

        # Ralph Loop hardening: if user asked for an action but specialist forgot tags,
        # do one guided rewrite pass to inject the required [AZIONE:...] commands.
        # SKIP when [INTENT:] is present — PlacementEngine handles it on the frontend.
        if is_action_request(user_msg) and not has_action_tags(result["response"]) and not has_intent:
            try:
                repaired = await repair_missing_action_tags(
                    user_message=user_msg,
                    current_response=result["response"],
                    session_id=session_id,
                    experiment_id=req.experimentId or "",
                    circuit_context=circuit_context,
                    conversation_history=history,
                )
                if has_action_tags(repaired):
                    result["response"] = repaired
                    result["layer"] = f"{result['layer']}+action-repair"
                    print("[Tutor] Action-tag repair applied")
            except Exception as e:
                print(f"[Tutor] Action-tag repair failed: {e}")

        # Last resort: deterministic injection for unambiguous commands
        if is_action_request(user_msg) and not has_action_tags(result["response"]) and not has_intent:
            result["response"] = deterministic_action_fallback(user_msg, result["response"])
            if has_action_tags(result["response"]):
                result["layer"] = f"{result['layer']}+deterministic-fallback"

        print(f"[Tutor] Specialist: {specialist} | Layer: {result['layer']}")

        # Persist to session
        if session_id:
            save_to_session(session_id, "user", req.message)
            save_to_session(session_id, "assistant", result["response"])

        # FASE 4 (IMPARARE): async learning — fire-and-forget background task
        if session_id:
            background_tasks.add_task(
                galileo_memory.async_learn,
                session_id, user_msg, result["response"],
                circuit_context, req.experimentId or ""
            )

        return ChatResponse(
            success=True,
            response=result["response"],
            source=result["source"],
            layer=f"{result['layer']}[{specialist}]",
        )
    except (httpx.HTTPStatusError, httpx.TimeoutException, Exception) as first_err:
        # Graceful degradation: fallback to monolithic Tutor prompt
        print(f"[Tutor] Specialist failed: {first_err}, falling back to monolithic Tutor")
        try:
            full_message = circuit_context
            if req.experimentId:
                full_message += f"\n[Esperimento attivo: {req.experimentId}]"
            full_message += f"\n\nDomanda studente:\n{user_msg}"

            result = await orchestrate(full_message, "", history)
            result["response"] = sanitize_identity_leaks(normalize_action_tags(result["response"]))
            # S73: Convert legacy [AZIONE:addcomponent:...] to [INTENT:] on fallback path too
            result["response"] = convert_addcomponent_to_intent(result["response"])
            # Placement Engine intent injection on monolithic path too
            has_intent_fb = '[INTENT:' in result["response"]
            if not has_intent_fb and is_action_request(user_msg):
                result["response"] = deterministic_intent_injection(
                    user_msg, result["response"], circuit_context
                )
                has_intent_fb = '[INTENT:' in result["response"]
            # Deterministic fallback on monolithic path too (skip if INTENT present)
            if is_action_request(user_msg) and not has_action_tags(result["response"]) and not has_intent_fb:
                result["response"] = deterministic_action_fallback(user_msg, result["response"])
            if session_id:
                save_to_session(session_id, "user", req.message)
                save_to_session(session_id, "assistant", result["response"])
            return ChatResponse(
                success=True,
                response=result["response"],
                source="nanobot",
                layer="L2-fallback[tutor]",
            )
        except Exception:
            # All providers failed — return user-friendly error
            return ChatResponse(
                success=False,
                response="Mi dispiace, i server AI sono momentaneamente sovraccarichi. Riprova tra qualche secondo! 🔄",
                source="error",
                layer="fallback-exhausted",
            )


# ─── Memory Endpoints ────────────────────────────────────────
class MemorySyncRequest(BaseModel):
    sessionId: str = Field(..., max_length=120)
    profile: Optional[dict] = None


@app.get("/memory/{session_id}")
@limiter.limit("30/minute")
async def get_memory(request: Request, session_id: str):
    """Get individual student memory for frontend sync."""
    if not session_id or len(session_id) > 120:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    try:
        profile = galileo_memory.get_individual_memory(session_id)
        return {"success": True, "profile": profile}
    except Exception as e:
        print(f"[Memory] GET error: {e}")
        return {"success": False, "profile": galileo_memory._empty_profile()}


@app.post("/memory/sync")
@limiter.limit("10/minute")
async def sync_memory(request: Request, req: MemorySyncRequest):
    """Sync student memory from frontend (localStorage → backend).
    Frontend calls this every 5 messages or on tab close."""
    if not req.sessionId:
        raise HTTPException(status_code=400, detail="sessionId required")

    try:
        # Merge frontend profile with backend (backend has priority for errors/patterns)
        if req.profile:
            backend_profile = galileo_memory.get_individual_memory(req.sessionId)

            # Frontend can update: experiments_completed, quiz_results, message_count
            if req.profile.get("experiments_completed"):
                existing = set(backend_profile.get("experiments_completed", []))
                for exp in req.profile["experiments_completed"]:
                    existing.add(exp)
                backend_profile["experiments_completed"] = list(existing)

            if req.profile.get("quiz_results"):
                # Take the larger values (frontend might have more recent data)
                fq = req.profile["quiz_results"]
                bq = backend_profile.setdefault("quiz_results", {"correct": 0, "total": 0})
                bq["correct"] = max(bq.get("correct", 0), fq.get("correct", 0))
                bq["total"] = max(bq.get("total", 0), fq.get("total", 0))

            if req.profile.get("message_count", 0) > backend_profile.get("message_count", 0):
                backend_profile["message_count"] = req.profile["message_count"]

            # Re-estimate level
            backend_profile["level"] = galileo_memory.estimate_level(backend_profile)
            backend_profile["last_activity"] = int(time.time())

            # Save merged profile
            fpath = galileo_memory._memory_file(req.sessionId)
            fpath.write_text(
                json.dumps(backend_profile, ensure_ascii=False, indent=2),
                encoding="utf-8"
            )

        return {"success": True, "synced": True}
    except Exception as e:
        print(f"[Memory] Sync error: {e}")
        return {"success": False, "error": str(e)}


# ─── Voice Endpoints: STT + TTS + Voice Chat ─────────────────
# Full voice pipeline routed through nanobot (NOT browser APIs).
# STT: audio → text (Groq Whisper, ~200ms)
# TTS: text → audio (OpenAI tts-1 / Google, ~500ms)
# Voice-chat: audio → text → AI → audio (complete round-trip)

VOICE_TIMEOUT = httpx.Timeout(30.0, connect=5.0)


async def _stt_groq(audio_bytes: bytes, content_type: str = "audio/webm") -> str:
    """Transcribe audio using Groq Whisper API."""
    if not STT_API_KEY:
        raise HTTPException(status_code=503, detail="STT not configured")

    # Determine file extension from content type
    ext_map = {
        "audio/webm": "webm", "audio/wav": "wav", "audio/mp4": "m4a",
        "audio/mpeg": "mp3", "audio/ogg": "ogg", "audio/flac": "flac",
    }
    ext = ext_map.get(content_type, "webm")

    async with httpx.AsyncClient(timeout=VOICE_TIMEOUT) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {STT_API_KEY}"},
            files={"file": (f"audio.{ext}", audio_bytes, content_type)},
            data={
                "model": STT_MODEL,
                "language": "it",  # Italian — target audience is Italian kids
                "response_format": "text",
            },
        )
        if resp.status_code != 200:
            print(f"[STT] Groq error {resp.status_code}: {resp.text[:200]}")
            raise HTTPException(status_code=502, detail="STT transcription failed")
        return resp.text.strip()


async def _tts_openai(text: str) -> bytes:
    """Generate speech from text using OpenAI TTS API."""
    if not TTS_API_KEY:
        raise HTTPException(status_code=503, detail="TTS not configured")

    # Limit text length for safety (kids won't get 4000-char responses)
    text = text[:4000]

    if TTS_PROVIDER == "google":
        return await _tts_google(text)

    async with httpx.AsyncClient(timeout=VOICE_TIMEOUT) as client:
        resp = await client.post(
            "https://api.openai.com/v1/audio/speech",
            headers={
                "Authorization": f"Bearer {TTS_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": TTS_MODEL,
                "input": text,
                "voice": TTS_VOICE,
                "response_format": "mp3",
                "speed": 1.05,  # Slightly faster — keeps kids engaged
            },
        )
        if resp.status_code != 200:
            print(f"[TTS] OpenAI error {resp.status_code}: {resp.text[:200]}")
            raise HTTPException(status_code=502, detail="TTS synthesis failed")
        return resp.content


async def _tts_google(text: str) -> bytes:
    """Fallback TTS via Google Cloud Text-to-Speech (uses Gemini API key)."""
    async with httpx.AsyncClient(timeout=VOICE_TIMEOUT) as client:
        resp = await client.post(
            f"https://texttospeech.googleapis.com/v1/text:synthesize?key={TTS_API_KEY}",
            json={
                "input": {"text": text[:4000]},
                "voice": {
                    "languageCode": "it-IT",
                    "name": "it-IT-Wavenet-A",  # Female wavenet voice
                    "ssmlGender": "FEMALE",
                },
                "audioConfig": {"audioEncoding": "MP3", "speakingRate": 1.05},
            },
        )
        if resp.status_code != 200:
            print(f"[TTS] Google error {resp.status_code}: {resp.text[:200]}")
            raise HTTPException(status_code=502, detail="TTS synthesis failed (Google)")
        import base64 as b64
        audio_b64 = resp.json().get("audioContent", "")
        return b64.b64decode(audio_b64)


def _strip_action_tags_for_voice(text: str) -> str:
    """Remove [AZIONE:...] and [INTENT:{...}] tags — not speakable."""
    text = re.sub(r'\[AZIONE:[^\]]*\]', '', text)
    text = re.sub(r'\[INTENT:\{[^}]*\}\]', '', text)
    # Remove markdown formatting
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    text = re.sub(r'#{1,4}\s*', '', text)
    # Clean up extra whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


@app.post("/stt")
@limiter.limit("30/minute")
@limiter.limit("5/10seconds")
async def speech_to_text(request: Request, audio: UploadFile = File(...)):
    """Convert speech audio to text (Groq Whisper)."""
    if not STT_API_KEY:
        raise HTTPException(status_code=503, detail="STT non configurato. Imposta STT_API_KEY.")

    audio_bytes = await audio.read()
    if len(audio_bytes) > 25 * 1024 * 1024:  # 25MB limit
        raise HTTPException(status_code=413, detail="File audio troppo grande (max 25MB)")
    if len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="File audio troppo piccolo")

    content_type = audio.content_type or "audio/webm"
    print(f"[STT] Received {len(audio_bytes)} bytes ({content_type})")

    try:
        transcript = await _stt_groq(audio_bytes, content_type)
        print(f"[STT] Transcribed: '{transcript[:80]}...'")
        return {"success": True, "text": transcript}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[STT] Error: {e}")
        raise HTTPException(status_code=500, detail="Errore trascrizione vocale")


@app.post("/tts")
@limiter.limit("30/minute")
@limiter.limit("5/10seconds")
async def text_to_speech(request: Request, text: str = Form(...)):
    """Convert text to speech audio (OpenAI TTS / Google fallback)."""
    if not TTS_API_KEY:
        raise HTTPException(status_code=503, detail="TTS non configurato. Imposta TTS_API_KEY.")

    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Testo vuoto")

    # Strip action tags — not speakable
    clean_text = _strip_action_tags_for_voice(text)
    if not clean_text:
        raise HTTPException(status_code=400, detail="Nessun testo da sintetizzare")

    print(f"[TTS] Synthesizing {len(clean_text)} chars with {TTS_PROVIDER}/{TTS_MODEL}")

    try:
        audio_bytes = await _tts_openai(clean_text)
        print(f"[TTS] Generated {len(audio_bytes)} bytes audio")
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=unlim-voice.mp3"},
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[TTS] Error: {e}")
        raise HTTPException(status_code=500, detail="Errore sintesi vocale")


@app.post("/voice-chat")
@limiter.limit("20/minute")
@limiter.limit("3/10seconds")
async def voice_chat(
    request: Request,
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...),
    sessionId: str = Form(""),
    experimentId: str = Form(""),
    circuitState: str = Form(""),  # JSON string
    simulatorContext: str = Form(""),  # JSON string
):
    """Complete voice round-trip: Audio → STT → AI → TTS → Audio.
    Returns JSON with text fields + base64-encoded audio for playback.
    This is the REALTIME endpoint — single round-trip for full voice interaction."""
    if not STT_API_KEY:
        raise HTTPException(status_code=503, detail="Voice non configurato (STT)")

    # Step 1: Read and validate audio
    audio_bytes = await audio.read()
    if len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="Audio troppo corto")
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio troppo grande (max 25MB)")

    content_type = audio.content_type or "audio/webm"
    t0 = time.time()

    # Step 2: STT — transcribe user speech
    try:
        transcript = await _stt_groq(audio_bytes, content_type)
    except Exception as e:
        print(f"[Voice] STT failed: {e}")
        raise HTTPException(status_code=502, detail="Trascrizione vocale fallita")

    t_stt = time.time()
    if not transcript.strip():
        return JSONResponse(content={
            "success": True,
            "userText": "",
            "response": "Non ho sentito nulla. Puoi ripetere?",
            "audio": None,
            "timing": {"stt_ms": int((t_stt - t0) * 1000)},
        })

    print(f"[Voice] STT ({int((t_stt - t0) * 1000)}ms): '{transcript[:80]}'")

    # Step 3: AI processing — route through existing tutor-chat logic
    # Parse optional JSON fields
    circuit_state = None
    if circuitState:
        try:
            circuit_state = json.loads(circuitState)
        except json.JSONDecodeError:
            pass

    simulator_ctx = None
    if simulatorContext:
        try:
            simulator_ctx = json.loads(simulatorContext)
        except json.JSONDecodeError:
            pass

    profanity_msg = check_profanity(transcript)
    if profanity_msg:
        ai_response = profanity_msg
    else:
        injection_msg = check_injection(transcript)
        if injection_msg:
            ai_response = injection_msg
        else:
            circuit_context = format_circuit_context(circuit_state) if circuit_state else ""
            sim_context = format_simulator_context(simulator_ctx) if simulator_ctx else ""
            if sim_context:
                circuit_context = f"{sim_context}\n\n{circuit_context}" if circuit_context else sim_context

            user_msg = sanitize_message(transcript)
            session_id = sessionId or ""
            history = get_session_history(session_id) if session_id else []

            try:
                result = await route_to_specialist_v5(
                    message=user_msg,
                    session_id=session_id,
                    experiment_id=experimentId or "",
                    circuit_context=circuit_context,
                    conversation_history=history,
                    images=None,
                )
                ai_response = sanitize_identity_leaks(normalize_action_tags(result["response"]))
                ai_response = convert_addcomponent_to_intent(ai_response)

                # Action injection (same logic as tutor-chat)
                has_intent = '[INTENT:' in ai_response
                if not has_intent and is_action_request(user_msg):
                    ai_response = deterministic_intent_injection(user_msg, ai_response, circuit_context)

                # Persist to session
                if session_id:
                    save_to_session(session_id, "user", transcript)
                    save_to_session(session_id, "assistant", ai_response)

                # Background learning
                if session_id:
                    background_tasks.add_task(
                        galileo_memory.async_learn,
                        session_id, user_msg, ai_response,
                        circuit_context, experimentId or ""
                    )
            except Exception as e:
                print(f"[Voice] AI processing failed: {e}")
                ai_response = "Scusa, non sono riuscito a elaborare la risposta. Riprova!"

    t_ai = time.time()
    print(f"[Voice] AI ({int((t_ai - t_stt) * 1000)}ms): '{ai_response[:80]}...'")

    # Step 4: TTS — synthesize AI response to speech
    audio_b64 = None
    if TTS_API_KEY:
        try:
            clean_response = _strip_action_tags_for_voice(ai_response)
            if clean_response:
                tts_bytes = await _tts_openai(clean_response)
                import base64 as b64
                audio_b64 = b64.b64encode(tts_bytes).decode("ascii")
        except Exception as e:
            print(f"[Voice] TTS failed (non-blocking): {e}")
            # TTS failure is non-blocking — text still returned

    t_tts = time.time()
    total_ms = int((t_tts - t0) * 1000)
    print(f"[Voice] Complete round-trip: {total_ms}ms (STT:{int((t_stt-t0)*1000)} AI:{int((t_ai-t_stt)*1000)} TTS:{int((t_tts-t_ai)*1000)})")

    return JSONResponse(content={
        "success": True,
        "userText": transcript,
        "response": ai_response,
        "audio": audio_b64,  # base64 MP3 or null
        "audioFormat": "audio/mpeg" if audio_b64 else None,
        "timing": {
            "stt_ms": int((t_stt - t0) * 1000),
            "ai_ms": int((t_ai - t_stt) * 1000),
            "tts_ms": int((t_tts - t_ai) * 1000),
            "total_ms": total_ms,
        },
    })


@app.get("/voice-status")
async def voice_status(request: Request):
    """Check voice capabilities status (for frontend feature detection)."""
    return {
        "stt": bool(STT_API_KEY),
        "tts": bool(TTS_API_KEY),
        "stt_provider": STT_PROVIDER if STT_API_KEY else None,
        "tts_provider": TTS_PROVIDER if TTS_API_KEY else None,
        "tts_voice": TTS_VOICE if TTS_API_KEY else None,
    }
