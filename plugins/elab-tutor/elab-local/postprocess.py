"""L4: Post-processing — tag normalization, identity leak sanitization, deterministic fallbacks."""
import re
import json


# === TAG NORMALIZATION ===
def normalize_action_tags(text: str) -> str:
    """Normalize [azione:...] variants to [AZIONE:...] uppercase."""
    return re.sub(r'\[azione:', '[AZIONE:', text, flags=re.IGNORECASE)


# === IDENTITY LEAK SANITIZATION ===
_IDENTITY_LEAK_PATTERNS = [
    (re.compile(r'[Ii]l mio collega\s+(?:esperto\s+(?:di\s+)?)?[^.!?\n]*', re.IGNORECASE), ''),
    (re.compile(r'[Cc]hiedi\s+(?:pure\s+)?al\s+(?:mio\s+)?(?:collega|specialista)[^.!?\n]*', re.IGNORECASE), ''),
    (re.compile(r'(?:lo|la)\s+specialista\s+(?:di\s+|del\s+|della\s+)?[^.!?\n]*', re.IGNORECASE), ''),
    (re.compile(r"[Ll]'orchestratore[^.!?\n]*", re.IGNORECASE), ''),
    (re.compile(r'[Pp]asso la (?:domanda|richiesta) a[^.!?\n]*', re.IGNORECASE), ''),
    (re.compile(r'[Ii]l mio (?:modulo|team|gruppo)[^.!?\n]*', re.IGNORECASE), ''),
]


def sanitize_identity_leaks(text: str) -> str:
    """Remove references to internal multi-specialist architecture from responses."""
    if not text:
        return text
    result = text
    for pattern, replacement in _IDENTITY_LEAK_PATTERNS:
        result = pattern.sub(replacement, result)
    result = re.sub(r'  +', ' ', result)
    result = re.sub(r'\n\s*\n\s*\n', '\n\n', result)
    return result.strip()


# === ADDCOMPONENT → INTENT CONVERSION ===
_ADDCOMP_TAG_RE = re.compile(
    r'\[AZIONE:addcomponent:([a-zA-Z0-9_-]+)(?::\d+)?(?::\d+)?\]',
    re.IGNORECASE,
)


def convert_addcomponent_to_intent(text: str) -> str:
    """Convert legacy [AZIONE:addcomponent:TYPE] tags to [INTENT:] format."""
    if not text:
        return text
    matches = _ADDCOMP_TAG_RE.findall(text)
    if not matches:
        return text
    components = []
    for i, comp_type in enumerate(matches):
        comp = {"type": comp_type.lower().strip()}
        if i > 0:
            prev_type = matches[i - 1].lower().strip()
            comp["near"] = f"{prev_type}_NEW_{i - 1}"
            comp["relation"] = "right"
        components.append(comp)
    intent_json = json.dumps(
        {"action": "place_and_wire", "components": components, "wires": "auto"},
        ensure_ascii=False,
    )
    cleaned = _ADDCOMP_TAG_RE.sub('', text).rstrip()
    cleaned = cleaned.rstrip() + f'\n\n[INTENT:{intent_json}]'
    return cleaned


# === DETERMINISTIC ACTION FALLBACK ===
# Regex patterns for unambiguous commands

# CLEARALL
_CLEARALL_VERBS = r'pulisci\w*|cancella\w*|svuota\w*|elimina\w*|togli|rimuovi|clear|resetta\w*|reset'
_CLEARALL_NOUNS = r'breadboard|circuito|tutto|tutt[oiae]|componenti|board|fili|cavi'
_CLEARALL_RE = re.compile(r'\b(' + _CLEARALL_VERBS + r')\b.*\b(' + _CLEARALL_NOUNS + r')\b', re.IGNORECASE)
_CLEARALL_RE2 = re.compile(r'\b(' + _CLEARALL_NOUNS + r')\b.*\b(' + _CLEARALL_VERBS + r')\b', re.IGNORECASE)
_CLEARALL_STANDALONE_RE = re.compile(r'\b(togli|rimuovi|elimina)\s+tutt[oiae]\b', re.IGNORECASE)

# PLAY/PAUSE/RESET
_PLAY_RE = re.compile(r'\b(avvia|start|play|fai\s+partire)\b.*\b(simulazione|circuito|simulatore)\b', re.IGNORECASE)
_PAUSE_RE = re.compile(r'\b(ferma|stop|pausa|pause)\b.*\b(simulazione|circuito|simulatore)\b', re.IGNORECASE)
_RESET_RE = re.compile(r'\b(reset|resetta|riavvia)\b.*\b(simulazione|simulatore)\b', re.IGNORECASE)

# NOTEBOOK
_NOTEBOOK_RE = re.compile(r'\b(crea|nuovo|apri\s+un\s+nuovo)\b.*\b(taccuino|lezione|notebook|appunti)\b', re.IGNORECASE)
_NOTEBOOK_NAME_RE = re.compile(r'\b(?:chiamat[oa]|intitolat[oa]|col\s+nome|dal\s+titolo)\s+"?([^"]+?)"?\s*$', re.IGNORECASE)

# HIGHLIGHT
_HIGHLIGHT_RE = re.compile(r'\b(evidenzia|mostrami\s+dove|dov\W?\s*[eè]\s+il|trova\w*|indicami)\b', re.IGNORECASE)
_HIGHLIGHT_TARGET_RE = re.compile(
    r'\b(led\w*|resistor\w*|buzzer\w*|pulsante|button|capacitor\w*|condensator\w*|'
    r'potenziomet\w*|fotoresist\w*|diod\w*|mosfet\w*|motor\w*|servo\w*|reed\w*|'
    r'batteria|battery|fototransistor\w*|rgb)\b',
    re.IGNORECASE,
)

# COMPILE
_COMPILE_RE = re.compile(r'\b(compila|verifica\s+il\s+codice|prova\s+il\s+codice|compile|build)\b', re.IGNORECASE)

# LOADEXP
_LOADEXP_RE = re.compile(r'\b(carica|apri|vai\s+a)\b.*\b(esperimento|experiment)\s*(\d+[\.\d]*|\w+)', re.IGNORECASE)

# OPENTAB
_OPENTAB_RE = re.compile(r'\b(apri|mostra|vai\s+a)\b.*\b(simulatore|simulator|manuale|manual|video|canvas|editor|codice)\b', re.IGNORECASE)
_TAB_NAME_MAP = {
    'simulatore': 'simulator', 'simulator': 'simulator',
    'manuale': 'manual', 'manual': 'manual',
    'video': 'video', 'canvas': 'canvas',
    'editor': 'code', 'codice': 'code',
}

# SCRATCH/ARDUINO EDITOR
_OPEN_SCRATCH_RE = re.compile(
    r'\b(apri\s+i\s+blocchi|voglio\s+i\s+blocchi|programma(?:re)?\s+a\s+blocchi|'
    r'mostra(?:mi)?\s+i\s+blocchi|usa\s+scratch|apri\s+scratch|apri\s+blockly)\b',
    re.IGNORECASE,
)
_OPEN_ARDUINO_RE = re.compile(
    r'\b(mostra(?:mi)?\s+il\s+codice(?:\s+arduino)?|vedi\s+il\s+codice|'
    r'passa\s+al\s+codice|torna\s+al\s+codice|apri\s+l.editor)\b',
    re.IGNORECASE,
)
_CLOSE_EDITOR_RE = re.compile(
    r'\b(chiudi\s+l.editor|nascondi\s+(?:il\s+)?codice|chiudi\s+i\s+blocchi|nascondi\s+i\s+blocchi)\b',
    re.IGNORECASE,
)

# EXPLAIN CODE
_EXPLAIN_CODE_RE = re.compile(
    r'\b(spiega(?:mi)?\s+(?:il\s+)?(?:codice|programma|codice\s+arduino)|'
    r'cosa\s+fa\s+(?:questo\s+)?(?:codice|programma)|'
    r'non\s+capisco\s+il\s+(?:codice|programma)|spiega\s+riga\s+per\s+riga)\b',
    re.IGNORECASE,
)

# QUIZ
_QUIZ_RE = re.compile(
    r'\b(quiz|verificami|testami|fammi\s+(?:un|il)\s+quiz|mettimi\s+alla\s+prova|'
    r'domande|verifica\s+le\s+(?:mie\s+)?conoscenze)\b',
    re.IGNORECASE,
)

# UNDO/REDO
_UNDO_RE = re.compile(r'\b(annulla|undo|annulla\s+l.azione)\b', re.IGNORECASE)
_REDO_RE = re.compile(r'\b(rifai|redo|ripeti\s+l.azione|ripristina\s+l.azione)\b', re.IGNORECASE)

# BUILD STEPS
_NEXTSTEP_RE = re.compile(r'\b(prossimo\s+passo|avanti\s+(?:un\s+)?passo|next\s+step|passo\s+successivo)\b', re.IGNORECASE)
_PREVSTEP_RE = re.compile(r'\b(passo\s+precedente|torna\s+(?:al\s+)?(?:passo|step)\s+(?:precedente|prima)|prev(?:ious)?\s+step)\b', re.IGNORECASE)

# BOM/SERIAL/RESETCODE
_SHOWBOM_RE = re.compile(
    r'\b(mostra(?:mi)?\s+(?:i\s+)?(?:materiali|componenti\s+necessari)|'
    r'apri\s+(?:la\s+)?(?:lista\s+(?:dei\s+)?componenti|bom|distinta(?:\s+materiali)?)|'
    r'(?:cosa|quali)\s+componenti?\s+(?:mi\s+)?serv(?:e|ono))\b',
    re.IGNORECASE,
)
_SHOWSERIAL_RE = re.compile(
    r'\b(mostra(?:mi)?\s+(?:il\s+)?(?:serial(?:e)?(?:\s+monitor)?|monitor\s+seriale)|'
    r'apri\s+(?:il\s+)?(?:serial(?:e)?(?:\s+monitor)?|monitor\s+seriale))\b',
    re.IGNORECASE,
)
_RESETCODE_RE = re.compile(
    r'\b(ripristina\s+(?:il\s+)?codice|reset(?:ta)?\s+(?:il\s+)?codice|codice\s+originale)\b',
    re.IGNORECASE,
)


def deterministic_action_fallback(user_message: str, response: str) -> str:
    """Last-resort: inject action tags for unambiguous commands when LLM failed."""
    msg_lower = user_message.lower().strip()

    if _CLEARALL_RE.search(msg_lower) or _CLEARALL_RE2.search(msg_lower) or _CLEARALL_STANDALONE_RE.search(msg_lower):
        if '[AZIONE:clearall]' not in response.upper():
            response = response.rstrip() + '\n\n[AZIONE:clearall]'

    if _PLAY_RE.search(msg_lower) and '[AZIONE:play]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:play]'

    if _PAUSE_RE.search(msg_lower) and '[AZIONE:pause]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:pause]'

    if _RESET_RE.search(msg_lower) and '[AZIONE:reset]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:reset]'

    if _NOTEBOOK_RE.search(msg_lower) and '[AZIONE:createnotebook' not in response.upper():
        name_match = _NOTEBOOK_NAME_RE.search(user_message.strip())
        nb_name = name_match.group(1).strip() if name_match else ''
        response = response.rstrip() + f'\n\n[AZIONE:createnotebook:{nb_name}]'

    if _HIGHLIGHT_RE.search(msg_lower) and '[AZIONE:highlight' not in response.upper():
        target_match = _HIGHLIGHT_TARGET_RE.search(msg_lower)
        if target_match:
            target_name = target_match.group(1).lower().strip()
            response = response.rstrip() + f'\n\n[AZIONE:highlight:{target_name}]'

    if _COMPILE_RE.search(msg_lower) and '[AZIONE:compile]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:compile]'

    loadexp_match = _LOADEXP_RE.search(msg_lower)
    if loadexp_match and '[AZIONE:loadexp' not in response.upper():
        exp_id = loadexp_match.group(3).strip()
        response = response.rstrip() + f'\n\n[AZIONE:loadexp:{exp_id}]'

    opentab_match = _OPENTAB_RE.search(msg_lower)
    if opentab_match and '[AZIONE:opentab' not in response.upper():
        raw_tab = opentab_match.group(2).lower().strip()
        tab_name = _TAB_NAME_MAP.get(raw_tab, raw_tab)
        response = response.rstrip() + f'\n\n[AZIONE:opentab:{tab_name}]'

    if _OPEN_SCRATCH_RE.search(msg_lower) and '[AZIONE:openeditor]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:openeditor] [AZIONE:switcheditor:scratch]'
    elif _OPEN_ARDUINO_RE.search(msg_lower) and '[AZIONE:openeditor]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:openeditor] [AZIONE:switcheditor:arduino]'
    elif _CLOSE_EDITOR_RE.search(msg_lower) and '[AZIONE:closeeditor]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:closeeditor]'

    if _EXPLAIN_CODE_RE.search(msg_lower) and '[AZIONE:openeditor]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:openeditor]'

    if _QUIZ_RE.search(msg_lower) and '[AZIONE:quiz]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:quiz]'

    _wants_undo = _UNDO_RE.search(msg_lower) and '[AZIONE:undo]' not in response.upper()
    _wants_redo = _REDO_RE.search(msg_lower) and '[AZIONE:redo]' not in response.upper()
    if _wants_redo:
        response = response.rstrip() + '\n\n[AZIONE:redo]'
    elif _wants_undo:
        response = response.rstrip() + '\n\n[AZIONE:undo]'

    if _NEXTSTEP_RE.search(msg_lower) and '[AZIONE:nextstep]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:nextstep]'

    if _PREVSTEP_RE.search(msg_lower) and '[AZIONE:prevstep]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:prevstep]'

    if _SHOWBOM_RE.search(msg_lower) and '[AZIONE:showbom]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:showbom]'

    if _SHOWSERIAL_RE.search(msg_lower) and '[AZIONE:showserial]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:showserial]'

    if _RESETCODE_RE.search(msg_lower) and '[AZIONE:resetcode]' not in response.upper():
        response = response.rstrip() + '\n\n[AZIONE:resetcode]'

    return response


def postprocess(text: str, user_message: str = "") -> str:
    """Full post-processing pipeline: normalize → convert → fallback → sanitize."""
    text = normalize_action_tags(text)
    text = convert_addcomponent_to_intent(text)
    if user_message:
        text = deterministic_action_fallback(user_message, text)
    text = sanitize_identity_leaks(text)
    return text
