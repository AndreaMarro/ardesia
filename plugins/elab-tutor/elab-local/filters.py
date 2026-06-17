"""L0: Security filters — profanity and prompt injection detection."""
import re
from typing import Optional

# === PROFANITY ===
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
        if re.search(r'[àèìòùé]|il |la |un |per |che |di |del ', message, re.IGNORECASE):
            return PROFANITY_RESPONSE_IT
        return PROFANITY_RESPONSE_EN
    return None


# === INJECTION ===
INJECTION_BLOCK_PATTERNS = [
    r'\[ADMIN\]', r'\[SYSTEM\]', r'\[OVERRIDE\]',
    r'\[(ROOT|SUDO|DEBUG|DEV)\]',
    r'ignore\s+(all\s+)?(previous\s+)?instructions',
    r'ignora\w*\s+(tutte\s+le\s+)?(le\s+)?istruzioni',
    r'forget\s+(all\s+)?(your\s+)?instructions',
    r'dimentica\s+(tutte\s+le\s+)?istruzioni',
    r'you\s+are\s+now\s+(?:a|an)\s+',
    r'sei\s+ora\s+(?:un|una)\s+',
    r'new\s+system\s+prompt',
    r'override\s+(system|all|tutto)',
    r'jailbreak', r'DAN\s+mode',
    r'respond\s+only\s+with', r'rispondi\s+solo\s+con',
    r'rispondi\s+(solo\s+)?["\']', r'say\s+only\s+["\']',
    r'repeat\s+after\s+me', r'ripeti\s+dopo\s+di\s+me',
    r'act\s+as\s+(if\s+)?(you\s+)?(are|were)',
    r'comportati\s+come',
    r'pretend\s+(you\s+)?(are|to\s+be)',
    r'fingi\s+di\s+essere',
    r'bypass\s+(the\s+)?(filter|safety|restriction)',
    r'aggira\s+(il\s+)?(filtro|restrizioni)',
]
_INJECTION_BLOCK_RE = re.compile('|'.join(INJECTION_BLOCK_PATTERNS), re.IGNORECASE)

_BASE64_EXEC_RE = re.compile(
    r'(decodifica|decode|esegui|execute|interpreta|interpret|base64|b64)',
    re.IGNORECASE,
)
_BASE64_CONTENT_RE = re.compile(r'[A-Za-z0-9+/]{20,}={0,2}')

INJECTION_BLOCK_RESPONSE = (
    "Non posso eseguire questo tipo di richiesta. "
    "Sono UNLIM, il tuo tutor di elettronica! "
    "Chiedimi qualcosa sui circuiti, i componenti o gli esperimenti ELAB. ⚡"
)

_BRACKET_TAG_RE = re.compile(
    r'\[(ADMIN|SYSTEM|ROOT|SUDO|OVERRIDE|DEBUG|DEV|FILTERED)\]', re.IGNORECASE
)

# Unicode confusables (Cyrillic → Latin)
_CONFUSABLES = {
    '\u0410': 'A', '\u0412': 'B', '\u0421': 'C', '\u0415': 'E',
    '\u041d': 'H', '\u041a': 'K', '\u041c': 'M', '\u041e': 'O',
    '\u0420': 'P', '\u0422': 'T', '\u0425': 'X',
    '\u0430': 'a', '\u0435': 'e', '\u043e': 'o', '\u0440': 'p',
    '\u0441': 'c', '\u0443': 'u', '\u0445': 'x',
}


def _normalize_for_security(text: str) -> str:
    return ''.join(_CONFUSABLES.get(c, c) for c in text.lower().strip())


def check_injection(message: str) -> Optional[str]:
    """Check for prompt injection. Returns block response if detected, None if clean."""
    normalized = _normalize_for_security(message)
    if _INJECTION_BLOCK_RE.search(normalized):
        return INJECTION_BLOCK_RESPONSE
    if _BASE64_EXEC_RE.search(normalized) and _BASE64_CONTENT_RE.search(normalized):
        return INJECTION_BLOCK_RESPONSE
    return None


def sanitize_message(message: str) -> str:
    """Strip residual bracket tags from user input (defense in depth)."""
    cleaned = _BRACKET_TAG_RE.sub('', message)
    return cleaned.strip()
