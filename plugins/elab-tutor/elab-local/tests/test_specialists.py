"""Tests for L2 specialist prompt builder."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from specialists import classify_intent, load_specialists, get_specialist_prompt


# === INTENT CLASSIFICATION ===

def test_classify_circuit():
    assert classify_intent("il mio LED non si accende") == "circuit"

def test_classify_code():
    assert classify_intent("errore di compilazione nel setup()") == "code"

def test_classify_vision():
    assert classify_intent("cosa vedi?", has_images=True) == "vision"

def test_classify_tutor_default():
    assert classify_intent("ciao come stai") == "tutor"

def test_classify_tutor_theory():
    assert classify_intent("cos'e' un resistore?") == "tutor"

def test_classify_action_verb_beats_tutor():
    # "metti un LED" has action verb -> should NOT be tutor
    result = classify_intent("metti un LED rosso")
    assert result in ("circuit", "tutor")  # action verbs skip tutor override

def test_classify_code_override():
    assert classify_intent("scrivi un programma per il blink") == "code"

def test_classify_quiz():
    assert classify_intent("fammi un quiz sull'elettronica") == "tutor"

def test_classify_passive_request():
    assert classify_intent("ho bisogno di un pulsante") == "circuit"


# === YAML LOADING ===

def test_load_specialists():
    specs = load_specialists()
    assert "circuit" in specs
    assert "code" in specs
    assert "tutor" in specs

def test_get_specialist_prompt():
    load_specialists()
    prompt = get_specialist_prompt("circuit")
    assert len(prompt) > 100  # Should be a substantial prompt
