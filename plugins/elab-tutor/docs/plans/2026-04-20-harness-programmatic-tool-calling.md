# Harness + Programmatic Tool Calling — Anthropic Engineering Notes

**Source articles**: anthropic.com/engineering recent posts (Nov 2025 - Mar 2026)

## Articles ranked relevance per ELAB

| Article | Date | Relevance | Action |
|---------|------|-----------|--------|
| **Harness design long-running apps** | Mar 2026 | ⭐⭐⭐⭐⭐ | Implement subito |
| **Effective harnesses long-running agents** | Nov 2025 | ⭐⭐⭐⭐⭐ | Read full + apply |
| **Advanced tool use (programmatic)** | Nov 2025 | ⭐⭐⭐⭐ | -37% token con code-execution pattern |
| **Multi-agent research system** | Jun 2025 | ⭐⭐⭐⭐ | Già citato masterplan v2, +90.2% perf |
| **Effective context engineering** | Sep 2025 | ⭐⭐⭐⭐ | Per claude-mem optimization |
| **Equipping agents with Skills** | Oct 2025 | ⭐⭐⭐ | Skill tool framework |
| **Building effective agents** | Dec 2024 | ⭐⭐⭐ | Foundational |
| **The "think" tool** | Mar 2025 | ⭐⭐ | Reasoning enhancement |
| **Managed Agents scaling** | (no date) | ⭐⭐ | Brain/hands decoupling pattern |

## Programmatic Tool Calling — pattern chiave

**Concept**: Claude scrive codice Python che orchestra tool calls invece di chiamarli singolarmente. Risultati intermedi NON entrano in context.

```python
# Claude generates code like:
results = await asyncio.gather(
    search_tool("query 1"),
    search_tool("query 2"),
    search_tool("query 3"),
)
filtered = [r for r in results if r.score > 0.8]
return filtered  # only filtered enters Claude's context
```

**Performance**: 43,588 → **27,297 tokens** (-37%) su research complesso. Eliminates dozens inference passes.

**Quando usare**:
- Multi-step workflows con dependent operations
- Parallel tool execution su many items
- Tasks dove intermediate results NON devono influenzare reasoning
- Large datasets aggregation

**Setup**:
- Mark tools `allowed_callers: ["code_execution"]`
- Clear return format docs
- Idempotent operations only

**Use case ELAB**:
- Batch UNLIM narrations generate per 92 esperimenti (parallel Gemini calls)
- TRES JOLIE photo batch convert (parallel sips)
- Test multiplication 3604 generate (parallel test-writer subagents)
- 549 RAG chunk re-embed batch

## Harness Design — 3 pattern

### Pattern 1: Multi-Agent Specialization (Planner/Generator/Evaluator)

GAN-like architecture:
- **Planner** expands prompt → detailed spec
- **Generator** implements
- **Evaluator** tests against criteria

ELAB già ha `.claude/agents/planner.md` + generator-app/test + evaluator. **Da attivare orchestrato.**

### Pattern 2: Context Management

"Context resets—clearing context window entirely". Structured file-based handoffs prevent "context anxiety" (model conclude prematurely as token limit nears).

**ELAB application**:
- Handoff doc obbligatorio fine sessione (già pattern in atto)
- File-based state: `automa/state/`, `docs/handoff/`, `docs/tasks/TASK-XXX-start.md`
- claude-mem plugin auto-capture decisioni

### Pattern 3: Objective Grading Criteria

Subjective → measurable. Per design work: "design quality", "originality", "craft", "functionality".

**ELAB application**:
- `scripts/benchmark.cjs` 10 metriche pesate score 0-10 (già esiste)
- Score honest pubblicato in audit (no inflation)
- Auditor agent uses fixed checklist

## Trade-off

"Retro game maker harness cost **20x più** ma deliver measurably superior". Per ELAB: investire upfront in harness costo + complessità per quality gains finale.

## Action items per ELAB

1. **Attivare planner/generator/evaluator triade** (già definita `.claude/agents/`, mai dispatched orchestrated)
2. **Implementare programmatic tool calling** per batch ops (TRES JOLIE photo convert + UNLIM narration generation)
3. **Adottare claude-mem** per context persistence cross-session
4. **Adottare claude-context** (zilliztech) per semantic codebase search -40% token
5. **Misurare con benchmark.cjs** OGNI delivery (no claim senza score)
