"""L2: Specialist prompt builder — loads YAML prompts and classifies intent."""
import re
from pathlib import Path
from typing import Optional

import yaml

from config import YAML_DIR

# === YAML LOADING ===
_specialists: dict = {}
_shared: dict = {}


def load_specialists() -> dict:
    """Load all specialist YAML files. Returns dict of specialist name → prompt dict."""
    global _specialists, _shared

    yaml_dir = YAML_DIR
    if not yaml_dir.exists():
        print(f"[Specialists] YAML dir not found: {yaml_dir}")
        return {}

    # Load shared context
    shared_path = yaml_dir / "shared.yml"
    if shared_path.exists():
        with open(shared_path, "r", encoding="utf-8") as f:
            _shared = yaml.safe_load(f) or {}

    # Load nanobot root config
    nanobot_path = yaml_dir / "nanobot.yml"
    nanobot_config = {}
    if nanobot_path.exists():
        with open(nanobot_path, "r", encoding="utf-8") as f:
            nanobot_config = yaml.safe_load(f) or {}

    # Load each specialist
    for name in ["circuit", "code", "tutor", "vision"]:
        path = yaml_dir / f"{name}.yml"
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                _specialists[name] = yaml.safe_load(f) or {}
        else:
            print(f"[Specialists] Missing: {path}")

    # Load scratch knowledge
    scratch_path = yaml_dir / "scratch.yml"
    if scratch_path.exists():
        with open(scratch_path, "r", encoding="utf-8") as f:
            _specialists["scratch"] = yaml.safe_load(f) or {}

    # Load site prompt
    site_path = yaml_dir / "site-prompt.yml"
    if site_path.exists():
        with open(site_path, "r", encoding="utf-8") as f:
            _specialists["site"] = yaml.safe_load(f) or {}

    print(f"[Specialists] Loaded: {list(_specialists.keys())} + shared")
    return _specialists


def _yaml_to_text(data, indent: int = 0) -> str:
    """Recursively convert YAML dict/list to readable text for system prompt."""
    if isinstance(data, str):
        return data
    if isinstance(data, list):
        return "\n".join(f"- {_yaml_to_text(item, indent)}" for item in data)
    if isinstance(data, dict):
        parts = []
        for key, value in data.items():
            if isinstance(value, str):
                parts.append(f"{key}: {value}")
            else:
                parts.append(f"\n### {key}\n{_yaml_to_text(value, indent + 1)}")
        return "\n".join(parts)
    return str(data)


def get_specialist_prompt(intent: str) -> str:
    """Build full system prompt for a specialist (identity + specialist + scratch + shared)."""
    if not _specialists:
        load_specialists()

    parts = []

    # 1. Identity from nanobot.yml or shared
    nanobot = _specialists.get("nanobot") or {}
    if "system_prompt" in nanobot:
        parts.append(_yaml_to_text(nanobot["system_prompt"]))
    elif "identity" in _shared:
        parts.append(_yaml_to_text(_shared["identity"]))

    # 2. Specialist-specific prompt
    specialist = _specialists.get(intent, {})
    if specialist:
        parts.append(f"\n--- SPECIALISTA: {intent.upper()} ---\n")
        parts.append(_yaml_to_text(specialist))

    # 3. Scratch knowledge (injected into all specialists)
    scratch = _specialists.get("scratch", {})
    if scratch:
        parts.append("\n--- SCRATCH/BLOCKLY ---\n")
        parts.append(_yaml_to_text(scratch))

    # 4. Shared reference data (action tags, experiments, components, breadboard)
    for key in ["action_tags", "experiments_catalog", "components_reference", "breadboard_rules"]:
        if key in _shared:
            parts.append(f"\n--- {key.upper()} ---\n")
            parts.append(_yaml_to_text(_shared[key]))

    return "\n\n".join(parts)


def get_site_prompt() -> str:
    """Get site chatbot system prompt."""
    if not _specialists:
        load_specialists()
    site = _specialists.get("site", {})
    if "system_prompt" in site:
        return _yaml_to_text(site["system_prompt"])
    return _yaml_to_text(site)


# === INTENT CLASSIFICATION ===
INTENT_KEYWORDS = {
    "circuit": [
        "circuito", "led", "resistore", "filo", "collegamento", "non si accende",
        "bruciato", "cortocircuito", "polarit", "breadboard", "bus", "corrente",
        "tensione", "ohm", "manca", "sbagliato", "errore nel circuito", "diagnosi",
        "pin", "anodo", "catodo", "condensatore", "diodo", "mosfet", "motore",
        "cablaggio", "schema", "connessione", "componente", "fototransi", "reed",
        "capacitor", "potenz", "fotoresis", "buzzer", "batteria", "alimentazione",
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
        "blocchi", "scratch", "blockly", "blocco", "programma a blocchi",
        "editor visuale", "trascina", "puzzle", "editor blocchi",
        "apri i blocchi", "voglio i blocchi", "programmare a blocchi",
        "spiega il codice", "cosa fa questo codice", "spiega riga",
        "non capisco il codice", "spiega il programma", "cosa significa",
    ],
    "vision": [
        "cosa vedi", "guarda", "screen", "mostrami", "analizza l'immagine",
        "foto", "screenshot", "vedo", "lavagna", "canvas", "disegno",
    ],
}

_ACTION_VERB_RE = re.compile(
    r'\b(metti|aggiungi|costruisci|collega|piazza|posiziona|inserisci|monta|'
    r'rimuovi|togli|elimina|sostituisci|scollega|cambia|modifica|ripara|correggi|'
    r'sistema|ricollega|smonta|fammi)\b',
    re.IGNORECASE,
)

CODE_OVERRIDE_KEYWORDS = [
    "scrivi un programma", "scrivi il codice", "fammi il codice",
    "scrivi il programma", "programma arduino", "programma che",
    "codice per", "codice arduino", "sketch per", "codice che",
]

TUTOR_OVERRIDE_PATTERNS = [
    re.compile(p, re.IGNORECASE) for p in [
        r"\bquiz\b", r"\bgioco\b", r"\bdetective\b", r"\bpoe\b", r"\breverse\b",
        r"\breview\b", r"\bapri\b", r"\bvai a\b", r"\bvolume\b", r"\bpagina\b",
        r"\bmanuale\b", r"\bcapitolo\b", r"\besperimento\b", r"\bcarica\b",
        r"cos[''`]e[''`]?\b", r"\bcosa sono\b", r"\bspiega\b", r"\bcome funziona\b",
        r"\bteoria\b", r"\bperch[eé]\b", r"\ba cosa serve\b", r"\blezione\b",
        r"\bclasse\b", r"\binsegna\b", r"\bnavigazione\b", r"\bhome\b",
        r"\bprofilo\b", r"\byoutube\b", r"\bvideo\b", r"\bsuggerim\w*\b",
        r"\baiut\w*\b", r"\bbloccat\w*\b", r"\bnon so cosa fare\b", r"\bdammi un hint\b",
    ]
]

# Component names for passive request detection
_COMPONENT_NAMES_RE = (
    r'led(?:\s+(?:rosso|verde|blu|giallo|bianco))?|led\s*rgb|rgb|'
    r'resistore|resistenza|pulsante|bottone|tasto|buzzer|cicalino|'
    r'condensatore|potenziometro|fotoresistore|fotoresistenza|'
    r'diodo|mosfet|transistor|motore|motorino|servo|servomotore|'
    r'reed|sensore\s+magnetico|fototransistor'
)
_PASSIVE_REQUEST_RE = re.compile(
    r'\b(ho bisogno|mi serve|mi servirebbe|vorrei|voglio|ci vuole|manca)\b'
    r'(?:\s+di)?\s+(?:un|una|il|lo|la|un\'|uno|dei|delle|degli)?\s*'
    r'(' + _COMPONENT_NAMES_RE + r')',
    re.IGNORECASE,
)


def classify_intent(message: str, has_images: bool = False) -> str:
    """Hybrid keyword classifier. Returns: 'circuit' | 'code' | 'tutor' | 'vision'."""
    if has_images:
        return "vision"

    msg = message.lower()

    # Tutor override (unless action verbs present)
    has_action_verb = bool(_ACTION_VERB_RE.search(msg))
    if not has_action_verb:
        for pattern in TUTOR_OVERRIDE_PATTERNS:
            if pattern.search(msg):
                return "tutor"

    # Passive requests → circuit
    if _PASSIVE_REQUEST_RE.search(msg):
        return "circuit"

    # Code override
    for kw in CODE_OVERRIDE_KEYWORDS:
        if kw in msg:
            return "code"

    # Score by keyword matches
    scores = {}
    for intent, keywords in INTENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in msg)
        if score > 0:
            scores[intent] = score

    if not scores:
        return "tutor"

    # Vision keywords without images → tutor
    if max(scores, key=scores.get) == "vision" and not has_images:
        return "tutor"

    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return sorted_scores[0][0]


def format_circuit_context(circuit_state: Optional[dict]) -> str:
    """Format circuit state dict into human-readable context string."""
    if not circuit_state:
        return ""

    parts = []
    components = circuit_state.get("components", [])
    if components:
        comp_list = []
        for c in components[:20]:  # cap at 20
            name = c.get("name") or c.get("type", "unknown")
            cid = c.get("id", "?")
            comp_list.append(f"{name} (id={cid})")
        parts.append(f"Componenti: {', '.join(comp_list)}")

    wires = circuit_state.get("wires", [])
    if wires:
        parts.append(f"Fili: {len(wires)} connessioni")

    return "\n".join(parts)


def format_simulator_context(ctx: Optional[dict]) -> str:
    """Format simulator context dict into [CONTESTO] block for Brain/LLM."""
    if not ctx:
        return ""

    parts = []
    if ctx.get("tab"):
        parts.append(f"tab: {ctx['tab']}")
    if ctx.get("experimentId"):
        parts.append(f"esperimento: {ctx['experimentId']}")
    if ctx.get("editorMode"):
        parts.append(f"editor: {ctx['editorMode']}")
    if ctx.get("buildStep") and ctx.get("totalSteps"):
        parts.append(f"step_corrente: {ctx['buildStep']}/{ctx['totalSteps']}")
    if ctx.get("volume"):
        parts.append(f"volume_attivo: {ctx['volume']}")

    if parts:
        return "[CONTESTO]\n" + "\n".join(parts)
    return ""
