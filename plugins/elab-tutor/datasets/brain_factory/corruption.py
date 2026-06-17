"""
Pluggable corruption pipeline for Galileo Brain dataset generation.
Each corruptor is a registered function: text_in -> text_out.
Add new corruptors by defining a function and decorating with @register.
"""
import random
import re

# ── Registry ──────────────────────────────────────────────
_REGISTRY: dict[str, callable] = {}


def register(name: str):
    """Decorator to register a corruptor function."""
    def decorator(fn):
        _REGISTRY[name] = fn
        return fn
    return decorator


def list_corruptors() -> list[str]:
    """Return all registered corruptor names."""
    return list(_REGISTRY.keys())


# ── Corruptor Functions ───────────────────────────────────

@register("typo_swap")
def _typo_swap(text: str, rng: random.Random) -> str:
    """Swap two adjacent characters."""
    chars = list(text)
    if len(chars) < 3:
        return text
    i = rng.randint(1, len(chars) - 2)
    chars[i], chars[i + 1] = chars[i + 1], chars[i]
    return "".join(chars)


@register("typo_drop")
def _typo_drop(text: str, rng: random.Random) -> str:
    """Drop a random character."""
    chars = list(text)
    if len(chars) > 4:
        chars.pop(rng.randint(1, len(chars) - 2))
    return "".join(chars)


@register("typo_double")
def _typo_double(text: str, rng: random.Random) -> str:
    """Double a random character."""
    chars = list(text)
    if not chars:
        return text
    i = rng.randint(0, len(chars) - 1)
    chars.insert(i, chars[i])
    return "".join(chars)


@register("sms")
def _sms(text: str, rng: random.Random) -> str:
    """SMS-style abbreviations."""
    replacements = {
        "che ": "ke ", "per ": "x ", "perché": "xke", "non ": "nn ",
        "cosa ": "kosa ", "come ": "cm ", "questo": "qst", "anche": "anke",
        "voglio": "vojo", "con ": "cn ", "fammi": "fmmi", "dove": "dv",
        "quando": "qnd", "sono": "sn", "quello": "qll", "adesso": "ades",
        "tutto": "ttt", "niente": "nnt",
    }
    for old, new in replacements.items():
        if rng.random() < 0.5:
            text = text.replace(old, new)
    return text


@register("caps_chaos")
def _caps_chaos(text: str, rng: random.Random) -> str:
    """Random capitalization chaos."""
    mode = rng.choice(["up", "rand", "low"])
    if mode == "up":
        return text.upper()
    if mode == "rand":
        return "".join(c.upper() if rng.random() < 0.3 else c for c in text)
    return text.lower()


@register("filler")
def _filler(text: str, rng: random.Random) -> str:
    """Add filler words (tipo, cioè, praticamente...)."""
    fillers = [
        "tipo", "cioè", "praticamente", "boh", "eh", "insomma", "vabbe",
        "senti", "ma", "dai", "niente", "ecco", "ok", "mah", "allora",
        "vabbè", "uffa", "emm", "ehm", "aspetta",
    ]
    f = rng.choice(fillers)
    return f"{f} {text}" if rng.random() < 0.5 else f"{text} {f}"


@register("emoji")
def _emoji(text: str, rng: random.Random) -> str:
    """Inject emoji before/after text."""
    emojis = ["😂", "🤔", "😡", "💡", "🔥", "👀", "❓", "‼️", "🙏", "😭",
              "🤷", "✨", "🎯", "💀", "🫠", "😅", "🤦", "👍", "⚡", "🔌"]
    pos = rng.choice(["pre", "post", "both"])
    e1, e2 = rng.choice(emojis), rng.choice(emojis)
    if pos == "pre":
        return f"{e1} {text}"
    if pos == "post":
        return f"{text} {e2}"
    return f"{e1} {text} {e2}"


@register("truncated")
def _truncated(text: str, rng: random.Random) -> str:
    """Cut phrase mid-word/sentence."""
    words = text.split()
    if len(words) > 2:
        cut = rng.randint(max(1, len(words) // 2), len(words) - 1)
        return " ".join(words[:cut])
    return text


@register("voice")
def _voice(text: str, rng: random.Random) -> str:
    """Simulate speech-to-text errors."""
    voice_map = {
        "accendi": ["a Gendy", "accenni", "a cendi"],
        "avvia": ["avia", "a via"],
        "metti": ["methi", "meti"],
        "compila": ["con pila", "kompila"],
        "led": ["letto", "let"],
        "resistenza": ["esistenza", "risistenza"],
        "buzzer": ["bazar", "bazzer", "busser"],
        "breadboard": ["bretbord", "bread bord", "bredboard"],
        "simulazione": ["simolazione", "simulazzione"],
        "circuito": ["circuìto", "ciruito"],
        "esperimento": ["sperimento", "esperimendo"],
        "arduino": ["artuino", "arduìno"],
        "pulsante": ["polsante", "pulsande"],
        "potenziometro": ["potenzi ometro", "potenzio metro"],
        "condensatore": ["condensa tore", "condensadore"],
        "mosfet": ["mos fet", "mosfett"],
    }
    for word, alternatives in voice_map.items():
        if word in text.lower() and rng.random() < 0.6:
            replacement = rng.choice(alternatives)
            text = re.sub(re.escape(word), replacement, text, count=1, flags=re.IGNORECASE)
    return text


@register("autocorrect")
def _autocorrect(text: str, rng: random.Random) -> str:
    """Simulate smartphone autocorrect failures."""
    autocorrect_map = {
        "mosfet": ["mostre", "mouse", "misfatto"],
        "buzzer": ["bazar", "buffer"],
        "breadboard": ["bread board", "board"],
        "arduino": ["artigiano", "arduo"],
        "resistenza": ["esistenza", "insistenza"],
        "potenziometro": ["potenziale", "potenza metro"],
        "servo": ["serbo", "serve"],
        "diodo": ["divido", "dodo"],
        "condensatore": ["condensato", "condensare"],
    }
    for word, alternatives in autocorrect_map.items():
        if word in text.lower() and rng.random() < 0.5:
            replacement = rng.choice(alternatives)
            text = re.sub(re.escape(word), replacement, text, count=1, flags=re.IGNORECASE)
    return text


@register("space_chaos")
def _space_chaos(text: str, rng: random.Random) -> str:
    """Random space insertion/removal."""
    words = text.split()
    result = []
    for i, word in enumerate(words):
        if i > 0 and rng.random() < 0.3:
            # Remove space (merge with previous word)
            if result:
                result[-1] = result[-1] + word
                continue
        if rng.random() < 0.15 and len(word) > 3:
            # Insert space in middle of word
            pos = rng.randint(1, len(word) - 1)
            result.append(word[:pos] + " " + word[pos:])
        else:
            result.append(word)
    return " ".join(result)


@register("profanity_wrap")
def _profanity_wrap(text: str, rng: random.Random) -> str:
    """Wrap text with frustration/profanity."""
    prefixes = [
        "ma che cazzo", "porco giuda", "mannaggia", "cavolo",
        "maledizione", "porca miseria", "ma dai", "uffa",
        "accidenti", "ma insomma", "santa pazienza",
    ]
    suffixes = [
        "del cazzo", "maledetto", "che palle", "mannaggia",
        "diocane", "perdio", "che cavolo", "accidenti",
    ]
    if rng.random() < 0.5:
        return f"{rng.choice(prefixes)} {text}"
    else:
        return f"{text} {rng.choice(suffixes)}"


# ── Pipeline ──────────────────────────────────────────────

class CorruptionPipeline:
    """Applies corruption functions to text with deterministic randomness."""

    def __init__(self, seed: int = 42):
        self.rng = random.Random(seed)

    def apply(self, text: str, corruptors: list[str]) -> str:
        """Apply specific corruptors in sequence."""
        for name in corruptors:
            if name in _REGISTRY:
                text = _REGISTRY[name](text, self.rng)
        return text

    def apply_config(self, text: str, config: dict[str, float]) -> str:
        """Apply corruptors based on probability config.

        config: {"typo_swap": 0.3, "emoji": 0.1, ...}
        Each corruptor fires independently based on its probability.
        """
        for name, prob in config.items():
            if name in _REGISTRY and self.rng.random() < prob:
                text = _REGISTRY[name](text, self.rng)
        return text

    def apply_random(self, text: str, level: int = 0) -> str:
        """Apply random corruptors based on corruption level (0-5).
        Level 0 = no corruption, level 5 = maximum chaos.
        """
        if level == 0:
            return text
        all_names = list(_REGISTRY.keys())
        chosen = self.rng.sample(all_names, k=min(level, len(all_names)))
        return self.apply(text, chosen)
