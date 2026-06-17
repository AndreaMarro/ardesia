import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from brain_factory.corruption import CorruptionPipeline, list_corruptors


def test_registry_has_all_corruptors():
    names = list_corruptors()
    expected = [
        "typo_swap", "typo_drop", "typo_double", "sms", "caps_chaos",
        "filler", "emoji", "truncated", "voice", "autocorrect",
        "space_chaos", "profanity_wrap",
    ]
    for name in expected:
        assert name in names, f"Missing corruptor: {name}"


def test_typo_swap_changes_text():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("resistenza", ["typo_swap"])
    assert isinstance(result, str)
    assert len(result) == len("resistenza")  # swap doesn't change length


def test_typo_drop_shortens():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("resistenza", ["typo_drop"])
    assert len(result) < len("resistenza")


def test_typo_double_lengthens():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("resistenza", ["typo_double"])
    assert len(result) > len("resistenza")


def test_truncated_shortens():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("metti un led sulla breadboard", ["truncated"])
    assert len(result) < len("metti un led sulla breadboard")


def test_emoji_inject_adds_emoji():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("avvia la simulazione", ["emoji"])
    assert any(ord(c) > 127 for c in result)


def test_sms_abbreviates():
    cp = CorruptionPipeline(seed=1)
    result = cp.apply("che cosa vuoi fare con questo circuito", ["sms"])
    assert isinstance(result, str)


def test_voice_corrupts():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("accendi il LED", ["voice"])
    assert isinstance(result, str) and len(result) > 0


def test_autocorrect_corrupts():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("metti il mosfet sulla breadboard", ["autocorrect"])
    assert isinstance(result, str) and len(result) > 0


def test_space_chaos():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("metti un led sulla breadboard", ["space_chaos"])
    assert isinstance(result, str)


def test_caps_chaos():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("metti un led", ["caps_chaos"])
    assert isinstance(result, str)


def test_filler_adds_words():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("avvia", ["filler"])
    assert len(result) > len("avvia")


def test_profanity_wrap():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("non funziona", ["profanity_wrap"])
    assert len(result) > len("non funziona")


def test_pipeline_probabilistic():
    cp = CorruptionPipeline(seed=42)
    config = {"typo_swap": 1.0, "emoji": 0.0}
    results = [cp.apply_config("avvia la simulazione", config) for _ in range(10)]
    assert all(isinstance(r, str) for r in results)


def test_no_corruption_returns_original():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply("ciao", [])
    assert result == "ciao"


def test_apply_random_level_0():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply_random("ciao", level=0)
    assert result == "ciao"


def test_apply_random_level_3():
    cp = CorruptionPipeline(seed=42)
    result = cp.apply_random("metti un led sulla breadboard", level=3)
    assert isinstance(result, str)


def test_deterministic_with_same_seed():
    results = []
    for _ in range(3):
        cp = CorruptionPipeline(seed=42)
        r = cp.apply("metti un led sulla breadboard", ["typo_swap", "emoji"])
        results.append(r)
    assert results[0] == results[1] == results[2]
