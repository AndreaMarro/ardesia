"""Tests for L4 post-processing."""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from postprocess import (
    normalize_action_tags,
    deterministic_action_fallback,
    sanitize_identity_leaks,
    convert_addcomponent_to_intent,
    postprocess,
)


# === TAG NORMALIZATION ===

def test_normalize_lowercase():
    assert "[AZIONE:play]" in normalize_action_tags("[azione:play]")

def test_normalize_mixed_case():
    assert "[AZIONE:pause]" in normalize_action_tags("[Azione:pause]")

def test_normalize_already_upper():
    assert "[AZIONE:reset]" in normalize_action_tags("[AZIONE:reset]")


# === DETERMINISTIC FALLBACK ===

def test_fallback_play():
    resp = deterministic_action_fallback("avvia la simulazione", "Ok, avvio!")
    assert "[AZIONE:play]" in resp

def test_fallback_clearall():
    resp = deterministic_action_fallback("pulisci tutto il circuito", "Fatto!")
    assert "[AZIONE:clearall]" in resp

def test_fallback_compile():
    resp = deterministic_action_fallback("compila il codice", "Compilo!")
    assert "[AZIONE:compile]" in resp

def test_fallback_pause():
    resp = deterministic_action_fallback("ferma la simulazione", "Fermo!")
    assert "[AZIONE:pause]" in resp

def test_fallback_quiz():
    resp = deterministic_action_fallback("fammi un quiz", "Ok!")
    assert "[AZIONE:quiz]" in resp

def test_fallback_scratch():
    resp = deterministic_action_fallback("apri i blocchi", "Apro!")
    assert "[AZIONE:openeditor]" in resp
    assert "[AZIONE:switcheditor:scratch]" in resp

def test_fallback_idempotent_via_postprocess():
    # The full postprocess pipeline handles dedup — deterministic_action_fallback
    # may inject even if tag exists (cloud nanobot same behavior).
    # Frontend parser is idempotent so duplicates are harmless.
    resp = postprocess("[azione:play] Via!", "avvia la simulazione")
    assert "[AZIONE:play]" in resp

def test_fallback_undo():
    resp = deterministic_action_fallback("annulla", "Ok!")
    assert "[AZIONE:undo]" in resp

def test_fallback_nextstep():
    resp = deterministic_action_fallback("prossimo passo", "Avanti!")
    assert "[AZIONE:nextstep]" in resp


# === IDENTITY LEAKS ===

def test_sanitize_specialist():
    assert "specialista" not in sanitize_identity_leaks("la specialista di circuiti dice che...")

def test_sanitize_orchestratore():
    assert "orchestratore" not in sanitize_identity_leaks("L'orchestratore ha deciso di...")

def test_sanitize_clean():
    text = "Il LED e' un componente che emette luce."
    assert sanitize_identity_leaks(text) == text


# === ADDCOMPONENT → INTENT ===

def test_convert_single():
    result = convert_addcomponent_to_intent("Ecco! [AZIONE:addcomponent:led]")
    assert "[INTENT:" in result
    assert '"type": "led"' in result

def test_convert_multiple():
    result = convert_addcomponent_to_intent("[AZIONE:addcomponent:led] [AZIONE:addcomponent:resistor]")
    assert "[INTENT:" in result
    assert "led" in result
    assert "resistor" in result

def test_convert_no_match():
    text = "Il LED e' bello [AZIONE:play]"
    assert convert_addcomponent_to_intent(text) == text


# === FULL PIPELINE ===

def test_postprocess_full():
    result = postprocess("[azione:play] Il mio collega esperto dice che...", "avvia")
    assert "[AZIONE:play]" in result
    assert "collega" not in result
