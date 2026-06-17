"""
ELAB Automa — Vocabulary Checker
Ensures Galileo doesn't use terms from future chapters.
Based on the volume-path.md progressive vocabulary model.
"""

import re

# Vocabulary allowed per volume/chapter
# Terms are cumulative: Vol2 includes all Vol1 terms, Vol3 includes all
VOLUME_VOCABULARY = {
    "v1-cap6": {
        "allowed": ["LED", "batteria", "filo", "circuito", "acceso", "spento", "corrente", "polo", "positivo", "negativo", "anodo", "catodo", "breadboard"],
        "forbidden": ["resistenza", "ohm", "tensione", "volt", "parallelo", "serie", "condensatore", "potenziometro", "MOSFET", "Arduino", "codice", "programma"],
    },
    "v1-cap7": {
        "allowed": ["LED", "batteria", "filo", "circuito", "corrente", "polo", "positivo", "negativo", "anodo", "catodo", "breadboard", "resistenza", "ohm", "protezione"],
        "forbidden": ["tensione", "volt", "parallelo", "condensatore", "potenziometro", "MOSFET", "Arduino", "codice", "programma"],
    },
    "v1-cap8": {
        "allowed": ["LED", "batteria", "filo", "circuito", "corrente", "resistenza", "ohm", "potenziometro", "variare", "ruotare"],
        "forbidden": ["parallelo", "condensatore", "MOSFET", "Arduino", "codice", "programma", "digitale"],
    },
    "v1-cap9": {
        "allowed": ["LED", "batteria", "filo", "circuito", "corrente", "resistenza", "ohm", "potenziometro", "serie", "parallelo"],
        "forbidden": ["condensatore", "MOSFET", "Arduino", "codice", "programma", "digitale"],
    },
    "v1-cap10": {
        "allowed": ["LED", "batteria", "filo", "circuito", "corrente", "resistenza", "ohm", "potenziometro", "serie", "parallelo", "condensatore", "carica", "scarica"],
        "forbidden": ["MOSFET", "Arduino", "codice", "programma", "digitale"],
    },
    # Vol2 — all Vol1 terms allowed, plus sensors
    "v2": {
        "allowed": ["LED", "batteria", "filo", "circuito", "corrente", "resistenza", "ohm", "potenziometro", "serie", "parallelo", "condensatore", "fotoresistenza", "sensore", "diodo", "MOSFET", "transistor", "tensione", "volt"],
        "forbidden": ["Arduino", "codice", "programma", "digitale", "compilare", "variabile", "funzione", "loop", "setup"],
    },
    # Vol3 — everything allowed (Arduino/coding chapter)
    "v3": {
        "allowed": [],  # Everything allowed
        "forbidden": [],  # Nothing forbidden
    },
}


def check_vocabulary(text: str, experiment_id: str) -> dict:
    """
    Check if text uses only allowed vocabulary for the given experiment.
    Returns: {"pass": bool, "violations": [{"term": str, "context": str}]}
    """
    # Determine volume/chapter from experiment_id
    # Format: v1-cap6-esp1, v2-cap7-esp3, v3-cap6-esp1
    match = re.match(r'(v\d+)-cap(\d+)', experiment_id)
    if not match:
        return {"pass": True, "violations": [], "note": "Unknown experiment format"}

    vol = match.group(1)
    cap = int(match.group(2))
    key = f"{vol}-cap{cap}"

    # Find the right vocabulary level
    vocab = None
    if key in VOLUME_VOCABULARY:
        vocab = VOLUME_VOCABULARY[key]
    elif vol in VOLUME_VOCABULARY:
        vocab = VOLUME_VOCABULARY[vol]
    else:
        return {"pass": True, "violations": [], "note": f"No vocabulary rules for {key}"}

    # Vol3 has no restrictions
    if not vocab["forbidden"]:
        return {"pass": True, "violations": []}

    # Check for forbidden terms (case-insensitive, word boundaries)
    violations = []
    text_lower = text.lower()
    for term in vocab["forbidden"]:
        pattern = r'\b' + re.escape(term.lower()) + r'\b'
        matches = list(re.finditer(pattern, text_lower))
        for m in matches:
            # Get surrounding context (20 chars each side)
            start = max(0, m.start() - 20)
            end = min(len(text), m.end() + 20)
            context = text[start:end].replace("\n", " ")
            violations.append({"term": term, "context": f"...{context}..."})

    return {
        "pass": len(violations) == 0,
        "violations": violations,
        "experiment": experiment_id,
        "vocab_level": key,
    }


if __name__ == "__main__":
    # Self-test
    print("=== Vocab Checker Self-Test ===\n")

    # Test 1: Cap6 should NOT mention "resistenza"
    r = check_vocabulary("Il LED si accende grazie alla resistenza che lo protegge", "v1-cap6-esp1")
    print(f"Test 1 (cap6 + 'resistenza'): {'FAIL' if r['pass'] else 'PASS'} — violations: {len(r['violations'])}")

    # Test 2: Cap7 CAN mention "resistenza"
    r = check_vocabulary("La resistenza protegge il LED dalla corrente", "v1-cap7-esp1")
    print(f"Test 2 (cap7 + 'resistenza'): {'PASS' if r['pass'] else 'FAIL'} — violations: {len(r['violations'])}")

    # Test 3: Vol2 should NOT mention "Arduino"
    r = check_vocabulary("Con Arduino puoi programmare il circuito", "v2-cap7-esp1")
    print(f"Test 3 (vol2 + 'Arduino'):    {'FAIL' if r['pass'] else 'PASS'} — violations: {len(r['violations'])}")

    # Test 4: Vol3 — everything allowed
    r = check_vocabulary("Arduino usa variabili e funzioni nel loop e setup", "v3-cap6-esp1")
    print(f"Test 4 (vol3 + everything):    {'PASS' if r['pass'] else 'FAIL'} — violations: {len(r['violations'])}")
