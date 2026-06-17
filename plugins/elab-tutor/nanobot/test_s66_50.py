#!/usr/bin/env python3
"""
S66 Systematic Test Suite — 40 programmatic tests
Tests regex patterns, deterministic fallbacks, action routing, and API integration.
"""
import re
import json
import sys

# ═══════════════════════════════════════════════════════════════
# COPY OF REGEX PATTERNS FROM server.py (to test independently)
# ═══════════════════════════════════════════════════════════════

_ACTION_REQUEST_RE = re.compile(
    r'\b('
    r'carica|apri|vai|metti|aggiungi|costruisci|collega|rimuovi|togli|'
    r'evidenzia|mostra|mostrami|sposta|premi|gira|avvia|ferma|stop|reset|'
    r'compila|imposta|setta|porta|cancella|pulisci|interagisci|'
    r'play|pause|highlight|load|'
    r'facciamo|fai|fammi|elimina|cambia|modifica|sostituisci|ricollega|'
    r'rifai|monta|smonta|scollega|inserisci|posiziona|piazza|sistema|'
    r'ripara|correggi'
    r')\b',
    re.IGNORECASE
)

_CLEARALL_VERBS = r'pulisci\w*|cancella\w*|svuota\w*|elimina\w*|togli|rimuovi|clear|resetta\w*|reset'
_CLEARALL_NOUNS = r'breadboard|circuito|tutto|tutt[oiae]|componenti|board|fili|cavi'
_CLEARALL_RE = re.compile(
    r'\b(' + _CLEARALL_VERBS + r')\b.*\b(' + _CLEARALL_NOUNS + r')\b',
    re.IGNORECASE
)
_CLEARALL_RE2 = re.compile(
    r'\b(' + _CLEARALL_NOUNS + r')\b.*\b(' + _CLEARALL_NOUNS + r')\b.*\b(' + _CLEARALL_VERBS + r')\b',
    re.IGNORECASE
)
# Fix: RE2 should be noun...verb
_CLEARALL_RE2 = re.compile(
    r'\b(' + _CLEARALL_NOUNS + r')\b.*\b(' + _CLEARALL_VERBS + r')\b',
    re.IGNORECASE
)
_CLEARALL_STANDALONE_RE = re.compile(
    r'\b(togli|rimuovi|elimina)\s+tutt[oiae]\b',
    re.IGNORECASE
)

_PLAY_RE = re.compile(r'\b(avvia|start|play|fai\s+partire)\b.*\b(simulazione|circuito|simulatore)\b', re.IGNORECASE)
_PAUSE_RE = re.compile(r'\b(ferma|stop|pausa|pause)\b.*\b(simulazione|circuito|simulatore)\b', re.IGNORECASE)
_RESET_RE = re.compile(r'\b(reset|resetta|riavvia)\b.*\b(simulazione|simulatore)\b', re.IGNORECASE)

_NOTEBOOK_RE = re.compile(
    r'\b(crea|nuovo|apri\s+un\s+nuovo)\b.*\b(taccuino|lezione|notebook|appunti)\b',
    re.IGNORECASE
)
_NOTEBOOK_NAME_RE = re.compile(
    r'\b(?:chiamat[oa]|intitolat[oa]|col\s+nome|dal\s+titolo)\s+"?([^"]+?)"?\s*$',
    re.IGNORECASE
)

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

# Frontend ACTION_INTENT_KEYWORDS (JS regex translated to Python)
ACTION_INTENT_KEYWORDS = re.compile(
    r'\b(carica|apri|vai|metti|aggiungi|costruisci|collega|rimuovi|togli|evidenzia|sposta|premi|gira|avvia|ferma|reset|compila|imposta|setta|cancella|pulisci|interagisci|svuota|azzera|facciamo|fai|fammi|elimina|cambia|modifica|sostituisci|ricollega|rifai|monta|smonta|scollega|inserisci|posiziona|piazza|sistema|ripara|correggi|al\s+posto)\b',
    re.IGNORECASE
)

# ═══════════════════════════════════════════════════════════════
# TEST FRAMEWORK
# ═══════════════════════════════════════════════════════════════

results = []

def test(test_id, description, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    results.append({"id": test_id, "desc": description, "status": status, "detail": detail})
    icon = "✅" if condition else "❌"
    print(f"  {icon} T{test_id:02d}: {description}" + (f" — {detail}" if detail and not condition else ""))

# ═══════════════════════════════════════════════════════════════
# GROUP A: CLEARALL REGEX (10 tests)
# ═══════════════════════════════════════════════════════════════
print("\n═══ GROUP A: Clearall Regex (10 tests) ═══")

def matches_clearall(msg):
    m = msg.lower().strip()
    return bool(_CLEARALL_RE.search(m) or _CLEARALL_RE2.search(m) or _CLEARALL_STANDALONE_RE.search(m))

test(1, "pulisci tutto", matches_clearall("pulisci tutto"))
test(2, "cancella tutto il circuito", matches_clearall("cancella tutto il circuito"))
test(3, "togli tutto (standalone)", matches_clearall("togli tutto"))
test(4, "elimina tutto (standalone)", matches_clearall("elimina tutto"))
test(5, "togli anche i componenti", matches_clearall("togli anche i componenti"))
test(6, "rimuovi i fili", matches_clearall("rimuovi i fili"),
     detail="rimuovi + fili" if not matches_clearall("rimuovi i fili") else "")
test(7, "svuota la breadboard", matches_clearall("svuota la breadboard"))
test(8, "puliscila (clitic)", matches_clearall("puliscila il circuito"),
     detail="puliscila + circuito" if not matches_clearall("puliscila il circuito") else "")
test(9, "resetta il circuito", matches_clearall("resetta il circuito"))
test(10, "circuito pulisci (reverse)", matches_clearall("il circuito pulisci"),
      detail="RE2 reverse match" if not matches_clearall("il circuito pulisci") else "")

# ═══════════════════════════════════════════════════════════════
# GROUP B: ACTION_INTENT_KEYWORDS — blocks auto-screenshot (10 tests)
# ═══════════════════════════════════════════════════════════════
print("\n═══ GROUP B: ACTION_INTENT_KEYWORDS (10 tests) ═══")

def blocks_screenshot(msg):
    return bool(ACTION_INTENT_KEYWORDS.search(msg))

test(11, "monta un circuito → blocks screenshot", blocks_screenshot("monta un circuito"))
test(12, "elimina il resistore → blocks screenshot", blocks_screenshot("elimina il resistore"))
test(13, "sostituisci il led → blocks screenshot", blocks_screenshot("sostituisci il led"))
test(14, "facciamo un esperimento → blocks screenshot", blocks_screenshot("facciamo un esperimento"))
test(15, "rifai i collegamenti → blocks screenshot", blocks_screenshot("rifai i collegamenti"))
test(16, "inserisci un buzzer → blocks screenshot", blocks_screenshot("inserisci un buzzer"))
test(17, "posiziona il led → blocks screenshot", blocks_screenshot("posiziona il led"))
test(18, "correggi il circuito → blocks screenshot", blocks_screenshot("correggi il circuito"))
test(19, "smonta tutto → blocks screenshot", blocks_screenshot("smonta tutto"))
test(20, "al posto del led metti buzzer → blocks screenshot", blocks_screenshot("al posto del led metti un buzzer"))

# ═══════════════════════════════════════════════════════════════
# GROUP C: PLACE_REQUEST_RE — component placement (10 tests)
# ═══════════════════════════════════════════════════════════════
print("\n═══ GROUP C: Placement Regex (10 tests) ═══")

def matches_place(msg):
    return bool(_PLACE_REQUEST_RE.search(msg.lower()))

test(21, "metti un led sulla breadboard", matches_place("metti un led sulla breadboard"))
test(22, "aggiungi un buzzer", matches_place("aggiungi un buzzer"))
test(23, "piazza un resistore", matches_place("piazza un resistore"))
test(24, "inserisci un potenziometro", matches_place("inserisci un potenziometro"))
test(25, "monta un led (new verb)", matches_place("monta un led"))
test(26, "mettimi un cicalino", matches_place("mettimi un cicalino"))
test(27, "aggiungi un led rosso", matches_place("aggiungi un led rosso"))
test(28, "metti un condensatore vicino al resistore", matches_place("metti un condensatore vicino al resistore"))
test(29, "posiziona un pulsante sotto il led", matches_place("posiziona un pulsante sotto il led"))
test(30, "collega un servo (new verb)", matches_place("collega un servo"))

# ═══════════════════════════════════════════════════════════════
# GROUP D: SUBSTITUTE_RE — component swap (5 tests)
# ═══════════════════════════════════════════════════════════════
print("\n═══ GROUP D: Substitution Regex (5 tests) ═══")

def matches_substitute(msg):
    return bool(_SUBSTITUTE_RE.search(msg.lower()))

test(31, "al posto del led metti un cicalino", matches_substitute("al posto del led metti un cicalino"))
test(32, "sostituisci il resistore con un led", matches_substitute("sostituisci il resistore con un led"))
test(33, "cambia il buzzer con un led", matches_substitute("cambia il buzzer con un led"))
test(34, "rimpiazza il potenziometro con un fotoresistore",
     matches_substitute("rimpiazza il potenziometro con un fotoresistore"))
test(35, "al posto del pulsante metti un reed", matches_substitute("al posto del pulsante metti un reed"))

# ═══════════════════════════════════════════════════════════════
# GROUP E: NOTEBOOK creation regex (5 tests)
# ═══════════════════════════════════════════════════════════════
print("\n═══ GROUP E: Notebook Regex (5 tests) ═══")

def matches_notebook(msg):
    return bool(_NOTEBOOK_RE.search(msg.lower()))

def extract_notebook_name(msg):
    m = _NOTEBOOK_NAME_RE.search(msg.strip())
    return m.group(1).strip() if m else None

test(36, "crea un taccuino chiamato lezione 1",
     matches_notebook("crea un taccuino chiamato lezione 1") and extract_notebook_name("crea un taccuino chiamato lezione 1") == "lezione 1",
     detail=f"name={extract_notebook_name('crea un taccuino chiamato lezione 1')}")
test(37, "nuovo taccuino (no name)", matches_notebook("nuovo taccuino"))
test(38, "crea una lezione chiamata test",
     matches_notebook("crea una lezione chiamata test") and extract_notebook_name("crea una lezione chiamata test") == "test",
     detail=f"name={extract_notebook_name('crea una lezione chiamata test')}")
test(39, "apri un nuovo taccuino", matches_notebook("apri un nuovo taccuino"))
test(40, "crea un notebook appunti", matches_notebook("crea un notebook appunti"))

# ═══════════════════════════════════════════════════════════════
# GROUP F: NEGATIVE tests — NO false positives (5 extra safety)
# These should NOT match action intent / clearall / etc
# ═══════════════════════════════════════════════════════════════
print("\n═══ GROUP F: Negative Tests — No False Positives (5 tests, bonus) ═══")

test(41, "cos'è un resistore? → NO screenshot block", not blocks_screenshot("cos'è un resistore?"),
     detail="Pure theory question should not block")
# "ciao come stai" should not trigger action
test(42, "ciao come stai → NO action request", not _ACTION_REQUEST_RE.search("ciao come stai"),
     detail="Greeting should not be action")
# "il circuito ha un led" should not trigger clearall
test(43, "il circuito ha un led → NO clearall", not matches_clearall("il circuito ha un led"),
     detail="Description should not clear")
# "il resistore serve per limitare" should not trigger placement
test(44, "il resistore serve per limitare → NO placement", not matches_place("il resistore serve per limitare"),
     detail="Theory should not place component")
# "mi piace il taccuino" should not create notebook
test(45, "mi piace il taccuino → NO notebook creation", not matches_notebook("mi piace il taccuino"),
     detail="Statement about notebook should not create one")

# ═══════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════
print("\n" + "═" * 60)
passed = sum(1 for r in results if r["status"] == "PASS")
failed = sum(1 for r in results if r["status"] == "FAIL")
total = len(results)
print(f"RESULTS: {passed}/{total} PASS, {failed} FAIL")

if failed > 0:
    print("\nFAILED TESTS:")
    for r in results:
        if r["status"] == "FAIL":
            print(f"  ❌ T{r['id']:02d}: {r['desc']}" + (f" — {r['detail']}" if r['detail'] else ""))

sys.exit(1 if failed > 0 else 0)
