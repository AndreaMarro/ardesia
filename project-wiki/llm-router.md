# LLM Router — Sistema di Routing Multi-Provider

Router astratto che dispatcha completions a provider nominati. Mai un solo modello (PLAN §12).

## Componenti

### LLMProvider Protocol

Contratto astratto per provider LLM. Ogni provider ha `name: str` e implementa `complete(prompt, model) -> LLMResponse`.

**Citazione**: lessonos/llm/router.py:22-26 — `LLMProvider(Protocol)` con `runtime_checkable`.

### LLMResponse

Risposta da un provider: `text`, `provider`, `model`.

**Citazione**: lessonos/llm/router.py:14-18 — `LLMResponse` frozen dataclass.

### Router

Classe di dispatch. Mantiene registry di provider. Metodo `complete(prompt, provider, model)` dispatcha al provider nominato.

**Citazioni**:
- lessonos/llm/router.py:51-53 — `Router.__init__()` con `_providers` dict
- lessonos/llm/router.py:55-56 — `register(provider)` aggiunge al registry
- lessonos/llm/router.py:58-63 — `complete()` dispatcha, solleva `KeyError` se provider non registrato

## Provider Implementati

### MockProvider (deterministico)

Provider per test: restituisce fixture registrate per prompt esatto. Prompt ignoto → `KeyError` (no fabricazione).

**Citazioni**:
- lessonos/llm/router.py:28-48 — `MockProvider` completo
- lessonos/llm/router.py:35 — `name = "mock"`
- lessonos/llm/router.py:37-39 — `__init__(fixtures: dict[str, str], model="mock-1")`
- lessonos/llm/router.py:41-48 — `complete()`: `KeyError` se prompt non in fixtures (linea 42-43)

**Uso**: TUTTI i test unitari usano `MockProvider` (veloce, gratis, riproducibile).

### KimiProvider (Moonshot, eval-gated)

Provider per Moonshot Kimi (OpenAI-compatible). Key SOLO da env `KIMI_API_KEY`, mai hardcoded. Solleva `KimiAuthError` se key assente.

**Citazioni**:
- lessonos/llm/kimi.py:29-71 — `KimiProvider` completo
- lessonos/llm/kimi.py:30 — `name = "kimi"`
- lessonos/llm/kimi.py:33-37 — `__init__()` richiede `api_key` esplicita (linea 34) o env (linea 36-37), `KimiAuthError` se assente
- lessonos/llm/kimi.py:39-71 — `complete()` usa stdlib `urllib` (OpenAI-compatible chat/completions endpoint)

**Uso**: solo eval/integration gated, NON testato live in unit test (MILESTONES.md M0).

## Pattern di Chiamata

```python
router = Router()
router.register(MockProvider(fixtures={...}))
response = router.complete(prompt, provider="mock")
```

**Esempio reale**: lessonos/capsule/segmentation.py:72 — `router.complete(prompt, provider=provider, model=model)`.

## Design Rationale

1. **Abstraction** — chiamanti non dipendono da provider specifico
2. **Cost control** — mock=gratis per test, real calls espliciti e tracciabili
3. **Determinismo test** — mock elimina nondeterminismo LLM dai test
4. **Fail-fast** — `KeyError` su provider/fixture ignoto, no fallback silente

**Citazione**: ARCH.md:27-35 documenta rationale router mock/kimi.
