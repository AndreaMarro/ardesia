"""
ELAB Automa — Resource Orchestrator
=====================================
Decides WHICH resources to use per cycle and EXECUTES them BEFORE the AI agent.
Results are injected into the agent prompt to maximize information density.

Architecture principle:
  The Python orchestrator runs in the full environment (subprocess, CLI, HTTP API).
  The AI agent (claude -p or SDK) has a restricted toolset. This module bridges
  the gap by gathering external data (screenshots, Lighthouse, LLM analyses) in
  Python and injecting them as text context into the agent's prompt.

Usage in orchestrator.py:
  from resource_orchestrator import gather_and_inject
  prompt, resource_usage = gather_and_inject(prompt, cycle_num, mode, check_results, score, worst_metric)
"""

import ast
import base64
import json
import logging
import os
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# ── Module paths (safe when imported from any location) ─────────────────────
AUTOMA_ROOT = Path(__file__).parent
PROJECT_ROOT = AUTOMA_ROOT.parent
SCREENSHOTS_DIR = AUTOMA_ROOT / "screenshots"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

# ── Logger (structured, no raw print) ───────────────────────────────────────
logger = logging.getLogger("resource_orchestrator")
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("  [ResOrch] %(levelname)s — %(message)s"))
    logger.addHandler(_handler)
    logger.setLevel(logging.INFO)

# ── Optional tool imports (graceful degradation if tools.py unavailable) ────
try:
    from tools import (
        call_deepseek_reasoner,
        call_gemini,
        call_gemini_cli,
        call_kimi,
        call_kimi_vision,
        search_papers,
    )
    _TOOLS_AVAILABLE = True
except ImportError:
    _TOOLS_AVAILABLE = False
    call_deepseek_reasoner = None
    call_gemini = None
    call_gemini_cli = None
    call_kimi = None
    call_kimi_vision = None
    search_papers = None


# ═══════════════════════════════════════════════════════════════════════════════
# RESOURCE MAP — canonical registry of every available resource
# ═══════════════════════════════════════════════════════════════════════════════

RESOURCE_MAP: Dict[str, Dict[str, Any]] = {
    # ── LLM (called via API from Python, NOT from claude -p) ──────────────
    "claude_agent": {
        "type": "llm",
        "method": "agent.py SDK or 'claude -p' subprocess",
        "capabilities": ["code_write", "code_read", "bash", "web_search", "file_edit"],
        "cost": "high",
        "when": "IMPROVE — always (primary executor)",
    },
    "deepseek_r1": {
        "type": "llm",
        "method": "api_call tools.py:call_deepseek_reasoner",
        "capabilities": ["reasoning", "root_cause", "scoring"],
        "cost": "medium",
        "when": "every cycle — worst metric root-cause analysis",
    },
    "gemini_pro": {
        "type": "llm",
        "method": "api_call tools.py:call_gemini",
        "capabilities": ["long_context", "strategic_summary", "vision"],
        "cost": "low",
        "when": "every 3 cycles — strategic trend analysis",
    },
    "kimi_k25": {
        "type": "llm",
        "method": "api_call tools.py:call_kimi or call_kimi_vision",
        "capabilities": ["research", "code_review", "vision"],
        "cost": "low",
        "when": "every cycle — parallel research and screenshot analysis",
    },
    "gemini_cli": {
        "type": "llm",
        "method": "subprocess: npx @google/gemini-cli -p prompt -y --model gemini-3-pro-preview",
        "capabilities": ["deep_research", "vision", "code_generation", "simulation", "web_search"],
        "cost": "medium",
        "when": "RESEARCH, INNOVATE, TEST — parallel second agent alongside Claude",
        "note": "Full agent like claude -p: has native file/bash/web_search/vision tools. Auth: GCA OAuth (ermagician@gmail.com AI Pro)",
    },

    # ── Tools (callable via subprocess from Python) ────────────────────────
    "playwright": {
        "type": "tool",
        "method": "subprocess: npx playwright screenshot",
        "capabilities": ["screenshot", "visual_verification", "ux_check"],
        "cost": "free",
        "when": "TEST mode, every 5 cycles, worst_metric < 0.3",
    },
    "lighthouse": {
        "type": "tool",
        "method": "subprocess: npx lighthouse --output=json",
        "capabilities": ["performance_audit", "accessibility", "seo", "best_practices"],
        "cost": "free",
        "when": "TEST mode, every 5 cycles, after deploy",
    },
    "npm_build": {
        "type": "tool",
        "method": "subprocess: npm run build",
        "capabilities": ["build_verification", "syntax_check", "bundle_analysis"],
        "cost": "free",
        "when": "IMPROVE mode — after code changes",
    },
    "git": {
        "type": "tool",
        "method": "subprocess: git diff/log/status",
        "capabilities": ["change_detection", "diff_analysis", "rollback_capability"],
        "cost": "free",
        "when": "every cycle — change detection for deploy routing",
    },

    # ── Deploy (callable from Python) ──────────────────────────────────────
    "netlify": {
        "type": "deploy",
        "method": "subprocess: npx netlify-cli deploy --prod",
        "targets": ["newcartella/"],
        "when": "after vetrina (newcartella/) changes",
    },
    "vercel": {
        "type": "deploy",
        "method": "subprocess: vercel --prod OR git push (autoDeploy)",
        "targets": ["src/", "elab-builder/"],
        "when": "after React app changes",
    },
    "render": {
        "type": "deploy",
        "method": "git push (autoDeploy:true) OR webhook",
        "targets": ["nanobot/"],
        "when": "after nanobot changes",
    },

    # ── Data (direct DB / API access) ─────────────────────────────────────
    "context_db": {
        "type": "data",
        "method": "sqlite3 via context_db.py",
        "capabilities": ["knowledge", "scores", "attempts", "experiments"],
        "when": "every cycle — historical context for AI",
    },

    # ── Research ──────────────────────────────────────────────────────────
    "web_search": {
        "type": "research",
        "method": "DuckDuckGo or Claude web_search tool",
        "capabilities": ["search"],
        "when": "RESEARCH, INNOVATE mode",
    },
    "semantic_scholar": {
        "type": "research",
        "method": "API via tools.py:search_papers",
        "capabilities": ["academic_papers", "citation_analysis"],
        "when": "INNOVATE mode",
    },

    # ── Memory (persistent cross-cycle files) ─────────────────────────────
    "cycles_history": {
        "type": "memory",
        "file": "memory/cycles-history.md",
        "when": "every cycle",
    },
    "research_results": {
        "type": "memory",
        "file": "memory/research-results.md",
        "when": "RESEARCH, INNOVATE mode",
    },
    "learned_rules": {
        "type": "memory",
        "file": "state/learned-rules.json",
        "when": "every cycle",
    },
    "andrea_directives": {
        "type": "memory",
        "file": "state/andrea-directives.md",
        "when": "every cycle — absolute priority overrides everything",
    },
}


# ═══════════════════════════════════════════════════════════════════════════════
# HELPERS — internal utilities
# ═══════════════════════════════════════════════════════════════════════════════

def _check_playwright_available() -> bool:
    """Return True if Playwright CLI is callable (npx playwright --version)."""
    try:
        result = subprocess.run(
            ["npx", "playwright", "--version"],
            capture_output=True, text=True, timeout=15,
        )
        return result.returncode == 0
    except Exception:
        return False


def _get_recently_modified_dirs() -> set:
    """Detect which deploy targets have recent git changes (last commit vs HEAD~1).

    Returns a set of strings: subset of {'netlify', 'vercel', 'render'}.
    """
    dirs: set = set()
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD~1", "HEAD"],
            capture_output=True, text=True, timeout=10,
            cwd=str(PROJECT_ROOT),
        )
        for filepath in result.stdout.splitlines():
            if "newcartella/" in filepath:
                dirs.add("netlify")
            elif any(p in filepath for p in ("src/", "index.html", "vite.config", "package.json")):
                if "nanobot" not in filepath and "automa" not in filepath:
                    dirs.add("vercel")
            elif "nanobot/" in filepath or "render.yaml" in filepath:
                dirs.add("render")
    except Exception:
        pass
    return dirs


# ═══════════════════════════════════════════════════════════════════════════════
# HEURISTIC PLANNER — decide what to activate each cycle
# ═══════════════════════════════════════════════════════════════════════════════

def plan_cycle_resources(
    cycle_num: int,
    mode: str,
    check_results: List[dict],
    score: float = 0.0,
    worst_metric: Tuple[str, float] = ("unknown", 1.0),
) -> List[str]:
    """Heuristic: return an ordered list of resource names to activate this cycle.

    Decision rules (in priority order):
    1. Core resources always active: claude_agent, context_db, cycles_history, git
    2. DeepSeek R1 always (if API configured): root-cause on worst metric
    3. Kimi: parallel every cycle (if API configured)
    4. Gemini: every 3 cycles for strategic summary
    5. Mode-specific: TEST→playwright+lighthouse, IMPROVE→npm_build, RESEARCH→web_search
    6. Critical override: worst_metric < 0.3 → force visual tools
    7. Periodic: every 5 cycles → Playwright regardless of mode (visual drift detection)
    """
    resources: List[str] = []

    # ── Always: core execution + memory + change detection ──────────────────
    resources += ["claude_agent", "context_db", "cycles_history", "git"]

    # ── Always: DeepSeek root-cause (if configured) ─────────────────────────
    if _TOOLS_AVAILABLE and call_deepseek_reasoner is not None:
        resources.append("deepseek_r1")

    # ── Every cycle: Kimi parallel research (if configured) ─────────────────
    if _TOOLS_AVAILABLE and call_kimi is not None:
        resources.append("kimi_k25")

    # ── Every 3 cycles: Gemini strategic summary ─────────────────────────────
    if cycle_num % 3 == 0 and _TOOLS_AVAILABLE and call_gemini is not None:
        resources.append("gemini_pro")

    # ── Mode-specific resources ───────────────────────────────────────────────
    if mode == "TEST":
        resources += ["playwright", "lighthouse", "gemini_cli"]  # Gemini analyzes screenshots

    elif mode == "IMPROVE":
        resources.append("npm_build")
        recently_changed = _get_recently_modified_dirs()
        if "netlify" in recently_changed:
            resources.append("netlify")
        if "vercel" in recently_changed:
            resources.append("vercel")
        if "render" in recently_changed:
            resources.append("render")

    elif mode == "RESEARCH":
        resources += ["web_search", "research_results", "gemini_cli"]  # Gemini as parallel researcher

    elif mode == "INNOVATE":
        resources += ["web_search", "semantic_scholar", "research_results", "gemini_cli"]
        # Gemini is especially useful for strategic innovation analysis
        if _TOOLS_AVAILABLE and call_gemini is not None and "gemini_pro" not in resources:
            resources.append("gemini_pro")

    # ── Critical override: worst metric < 0.3 → force visual tools ──────────
    if worst_metric[1] < 0.3:
        for forced in ["playwright", "lighthouse", "npm_build"]:
            if forced not in resources:
                resources.append(forced)

    # ── Periodic: visual drift detection every 5 cycles ──────────────────────
    if cycle_num % 5 == 0 and "playwright" not in resources:
        resources.append("playwright")

    # ── Deduplicate preserving insertion order ────────────────────────────────
    seen: set = set()
    unique: List[str] = []
    for r in resources:
        if r not in seen:
            seen.add(r)
            unique.append(r)

    return unique


# ═══════════════════════════════════════════════════════════════════════════════
# EXECUTORS — one function per resource type
# ═══════════════════════════════════════════════════════════════════════════════

def take_screenshots(urls: Optional[List[str]] = None) -> List[str]:
    """Take screenshots of ELAB Tutor pages using the Playwright CLI.

    If Playwright is not installed, attempts chromium installation first.
    Returns a list of absolute paths to saved PNG files (empty on failure).
    """
    if urls is None:
        urls = [
            "https://www.elabtutor.school",
            "http://localhost:5179",
        ]

    # Ensure Playwright is available
    if not _check_playwright_available():
        logger.warning("Playwright CLI unavailable — attempting chromium install")
        try:
            subprocess.run(
                ["npx", "playwright", "install", "chromium", "--with-deps"],
                capture_output=True, timeout=180,
            )
        except Exception as install_err:
            logger.warning(f"Playwright install failed: {install_err}")
            return []

    screenshots: List[str] = []
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")

    for url in urls:
        slug = (
            url.split("//")[-1]
            .replace("/", "-")
            .replace(":", "-")
            .strip("-")
        )
        out_path = SCREENSHOTS_DIR / f"{ts}-{slug}.png"
        try:
            result = subprocess.run(
                [
                    "npx", "playwright", "screenshot",
                    "--browser", "chromium",
                    url, str(out_path),
                    "--viewport-size=1024,768",
                    "--timeout=20000",
                ],
                capture_output=True, text=True, timeout=45,
            )
            if result.returncode == 0 and out_path.exists():
                size_kb = out_path.stat().st_size // 1024
                screenshots.append(str(out_path))
                logger.info(f"Screenshot OK: {out_path.name} ({size_kb} KB)")
            else:
                err_preview = (result.stderr or result.stdout)[:200]
                logger.warning(f"Screenshot FAILED for {url}: {err_preview}")
        except subprocess.TimeoutExpired:
            logger.warning(f"Screenshot timeout (45s) for {url}")
        except Exception as exc:
            logger.warning(f"Screenshot error for {url}: {exc}")

    return screenshots


def run_lighthouse(url: str = "https://www.elabtutor.school") -> Dict[str, Any]:
    """Run a Lighthouse audit via CLI and return a parsed summary dict.

    Returns:
        {"status": "ok", "scores": {"performance": 0.72, ...}, "url": url}
        {"status": "error", "reason": "...", "url": url}
        {"status": "unavailable", "reason": "lighthouse not found", "url": url}
    """
    out_path = AUTOMA_ROOT / "state" / "lighthouse-latest.json"
    try:
        result = subprocess.run(
            [
                "npx", "--yes", "lighthouse", url,
                "--output=json",
                f"--output-path={out_path}",
                "--chrome-flags=--headless --no-sandbox --disable-gpu",
                "--only-categories=performance,accessibility,best-practices,seo",
                "--quiet",
            ],
            capture_output=True, text=True, timeout=180,
        )
        if result.returncode == 0 and out_path.exists():
            try:
                data = json.loads(out_path.read_text(encoding="utf-8"))
                cats = data.get("categories", {})
                scores = {
                    k: round(v.get("score") or 0.0, 3)
                    for k, v in cats.items()
                }
                logger.info(f"Lighthouse OK: {scores}")
                return {"status": "ok", "scores": scores, "url": url}
            except (json.JSONDecodeError, KeyError) as parse_err:
                logger.warning(f"Lighthouse JSON parse error: {parse_err}")
                return {"status": "error", "reason": f"JSON parse: {parse_err}", "url": url}
        else:
            err_preview = (result.stderr or result.stdout)[:300]
            logger.warning(f"Lighthouse FAILED (rc={result.returncode}): {err_preview}")
            return {"status": "error", "reason": err_preview, "url": url}
    except subprocess.TimeoutExpired:
        logger.warning("Lighthouse timeout after 180s")
        return {"status": "error", "reason": "timeout after 180s", "url": url}
    except FileNotFoundError:
        return {"status": "unavailable", "reason": "npx not found", "url": url}
    except Exception as exc:
        logger.warning(f"Lighthouse unexpected error: {exc}")
        return {"status": "error", "reason": str(exc)[:200], "url": url}


def _analyze_screenshots_with_kimi(
    screenshots: List[str],
    context: str = "",
) -> str:
    """Send screenshots to Kimi Vision for UX analysis (max 2 per call).

    Returns a combined Italian-language analysis string, or empty string on failure.
    """
    if not screenshots or call_kimi_vision is None:
        return ""

    analyses: List[str] = []
    for path in screenshots[:2]:
        try:
            prompt = (
                "Sei un esperto UX per app educative per bambini 8-12 anni.\n"
                f"Contesto del ciclo: {context}\n\n"
                "Analizza questo screenshot di ELAB Tutor (simulatore Arduino/elettronica).\n"
                "Rispondi in italiano, massimo 150 parole. Identifica:\n"
                "1. Problemi visivi evidenti (layout, contrasto, leggibilità per bambini)\n"
                "2. Cosa funziona bene (non toccare)\n"
                "3. Un miglioramento concreto e prioritario da fare subito\n"
            )
            result = call_kimi_vision(prompt, path)
            if result and "[ERROR]" not in result and "[SKIP]" not in result:
                analyses.append(f"[{Path(path).name}]: {result[:400]}")
        except Exception as exc:
            logger.warning(f"Kimi Vision error for {path}: {exc}")

    return "\n".join(analyses)


def _run_deepseek_root_cause(
    worst_metric: Tuple[str, float],
    score: float,
    cycle_num: int,
) -> str:
    """Ask DeepSeek R1 to identify root cause for the worst metric.

    Returns a concise Italian-language analysis string, or empty string on failure.
    """
    if call_deepseek_reasoner is None:
        return ""

    metric_name, metric_val = worst_metric
    prompt = (
        "Sistema: ELAB Tutor — piattaforma educativa Arduino/elettronica per bambini 8-12 anni.\n"
        f"Ciclo di miglioramento #{cycle_num}. Score composito: {score:.3f}/1.00.\n"
        f"Metrica peggiore ora: {metric_name} = {metric_val:.3f} (target: massimo possibile).\n\n"
        f"Identifica la ROOT CAUSE più probabile del basso valore di '{metric_name}'.\n"
        "Proponi 1 azione concreta e verificabile da eseguire in questo ciclo.\n"
        "Risposta in italiano, massimo 120 parole. Sii specifico e diretto."
    )
    try:
        result = call_deepseek_reasoner(prompt, max_tokens=512)
        if result and "[ERROR]" not in result and "[SKIP]" not in result:
            return result[:600]
        return ""
    except Exception as exc:
        logger.warning(f"DeepSeek root-cause error: {exc}")
        return ""


def _run_gemini_strategic_summary(
    cycle_num: int,
    score: float,
    mode: str,
) -> str:
    """Ask Gemini 3 Pro for a strategic summary based on recent cycle history.

    Uses call_gemini_cli() (OAuth GCA, no API key) with fallback to call_gemini() (REST API).
    Returns a concise Italian-language summary, or empty string on failure.
    """
    _caller = call_gemini_cli if call_gemini_cli is not None else call_gemini
    if _caller is None:
        return ""

    # Load recent cycle history for context
    history_path = AUTOMA_ROOT / "memory" / "cycles-history.md"
    recent_history = ""
    if history_path.exists():
        try:
            text = history_path.read_text(encoding="utf-8")
            sections = text.split("\n## Ciclo ")
            # Take last 6 cycle summaries (≈ last full pattern of 6)
            recent_history = "\n## Ciclo ".join(sections[-6:])[-3000:]
        except Exception:
            pass

    prompt = (
        f"Sei il coordinatore strategico di ELAB Tutor (ciclo #{cycle_num}).\n"
        f"Score composito attuale: {score:.3f}/1.00. Mode: {mode}.\n\n"
        f"STORIA ULTIMI CICLI:\n{recent_history}\n\n"
        "Analisi strategica in 3 punti (italiano, massimo 200 parole totali):\n"
        "1. Pattern emergente (cosa migliora o peggiora stabilmente?)\n"
        "2. Rischio principale se si continua nella direzione attuale\n"
        "3. Direzione strategica consigliata per i prossimi 5 cicli\n"
    )
    try:
        result = _caller(prompt)
        if result and "[ERROR]" not in result and "[SKIP]" not in result:
            return result[:800]
        return ""
    except Exception as exc:
        logger.warning(f"Gemini strategic summary error: {exc}")
        return ""


# ═══════════════════════════════════════════════════════════════════════════════
# EXECUTE — run planned resources and collect results
# ═══════════════════════════════════════════════════════════════════════════════

def execute_resources(
    planned: List[str],
    context: Dict[str, Any],
) -> Dict[str, Any]:
    """Execute all planned resources in sequence and return their results.

    Args:
        planned: list of resource names from plan_cycle_resources()
        context: dict with keys: cycle_num, mode, score, worst_metric, [urls], [lighthouse_url]

    Returns:
        {"results": {resource_name: result_dict}, "executed": [names], "planned": [names]}
    """
    cycle_num: int = context.get("cycle_num", 0)
    mode: str = context.get("mode", "IMPROVE")
    score: float = context.get("score", 0.0)
    worst_metric: Tuple[str, float] = context.get("worst_metric", ("unknown", 1.0))

    results: Dict[str, Any] = {}
    executed: List[str] = []

    # ── Git: change detection (fast, always) ────────────────────────────────
    if "git" in planned:
        modified_dirs = _get_recently_modified_dirs()
        results["git"] = {"modified_dirs": sorted(modified_dirs)}
        executed.append("git")

    # ── Playwright: visual screenshots ──────────────────────────────────────
    if "playwright" in planned:
        urls: Optional[List[str]] = context.get("urls")
        screenshots = take_screenshots(urls)
        results["playwright"] = {
            "screenshots": screenshots,
            "count": len(screenshots),
        }
        executed.append("playwright")

        # Immediately analyze screenshots with Kimi Vision if both are planned
        if screenshots and "kimi_k25" in planned and call_kimi_vision is not None:
            kimi_ctx = f"mode={mode}, ciclo={cycle_num}, score={score:.3f}"
            kimi_analysis = _analyze_screenshots_with_kimi(screenshots, context=kimi_ctx)
            if kimi_analysis:
                results["kimi_vision"] = {"analysis": kimi_analysis}
                if "kimi_k25" not in executed:
                    executed.append("kimi_k25")

    # ── Lighthouse: performance/accessibility audit ──────────────────────────
    if "lighthouse" in planned:
        lh_url: str = context.get("lighthouse_url", "https://www.elabtutor.school")
        lh_result = run_lighthouse(lh_url)
        results["lighthouse"] = lh_result
        executed.append("lighthouse")

    # ── DeepSeek R1: root-cause analysis ────────────────────────────────────
    if "deepseek_r1" in planned:
        ds_text = _run_deepseek_root_cause(worst_metric, score, cycle_num)
        if ds_text:
            results["deepseek_r1"] = {"analysis": ds_text}
            executed.append("deepseek_r1")

    # ── Gemini Pro: strategic summary ───────────────────────────────────────
    if "gemini_pro" in planned:
        gm_text = _run_gemini_strategic_summary(cycle_num, score, mode)
        if gm_text:
            results["gemini_pro"] = {"summary": gm_text}
            executed.append("gemini_pro")

    # ── Kimi K2.5: fallback text research (if vision not already triggered) ─
    if "kimi_k25" in planned and "kimi_k25" not in executed:
        if call_kimi is not None:
            research_topic = context.get("kimi_topic", f"EdTech Arduino bambini {mode} improvement")
            try:
                kimi_text = call_kimi(
                    f"ELAB Tutor — simulatore Arduino bambini 8-12 anni.\n"
                    f"Ciclo #{cycle_num}, mode={mode}, score={score:.3f}.\n"
                    f"Topic: {research_topic}\n"
                    f"2 idee concrete e applicabili ORA. 100 parole, italiano.",
                    max_tokens=512,
                )
                if kimi_text and "[ERROR]" not in kimi_text and "[SKIP]" not in kimi_text:
                    results["kimi_k25"] = {"research": kimi_text[:500]}
                    executed.append("kimi_k25")
            except Exception as exc:
                logger.warning(f"Kimi text research error: {exc}")

    # ── Gemini CLI: parallel second agent ────────────────────────────────────
    # Gemini runs headless like claude -p and has native file/bash/vision tools.
    # Used for deep research, visual analysis, or as a cross-validator.
    if "gemini_cli" in planned:
        # If screenshots are available, ask Gemini to analyze them visually
        screenshots_for_gemini = results.get("playwright", {}).get("screenshots", [])
        if screenshots_for_gemini:
            gemini_context = f"mode={mode}, ciclo={cycle_num}, score={score:.3f}"
            gemini_vision_result = run_gemini_vision_analysis(
                screenshots_for_gemini[0], context=gemini_context
            )
            if gemini_vision_result:
                results["gemini_cli"] = {"vision_analysis": gemini_vision_result, "type": "vision"}
                executed.append("gemini_cli")
        else:
            # No screenshots — use Gemini for deep text research
            research_query = context.get(
                "research_query",
                f"ELAB Tutor Arduino educativo bambini: best practice {mode} ciclo {cycle_num}. "
                f"Score attuale {score:.2f}. 3 idee concrete. Italiano, max 150 parole.",
            )
            gemini_result = run_gemini_deep_research(
                research_query, timeout=120, cwd=str(PROJECT_ROOT)
            )
            if gemini_result.get("status") == "ok":
                output = gemini_result.get("output", "")
                if output:
                    results["gemini_cli"] = {"research": output[:600], "type": "research"}
                    executed.append("gemini_cli")
            elif gemini_result.get("status") == "unavailable":
                logger.info("Gemini CLI not available — skipping")

    # ── Semantic Scholar: academic papers ────────────────────────────────────
    if "semantic_scholar" in planned and search_papers is not None:
        query: str = context.get(
            "research_query",
            "educational technology children elementary school engagement Arduino",
        )
        try:
            papers = search_papers(query, limit=3)
            if papers and not (len(papers) == 1 and "error" in papers[0]):
                results["semantic_scholar"] = {"papers": papers}
                executed.append("semantic_scholar")
        except Exception as exc:
            logger.warning(f"Semantic Scholar error: {exc}")

    return {
        "results": results,
        "executed": executed,
        "planned": planned,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# INJECTOR — enrich the agent prompt with resource results
# ═══════════════════════════════════════════════════════════════════════════════

def inject_into_prompt(prompt: str, resource_results: Dict[str, Any]) -> str:
    """Append resource results as a structured Markdown section to the agent prompt.

    The injected block is clearly delimited so the agent can easily parse it.
    If no results are available, the original prompt is returned unchanged.
    """
    results: Dict[str, Any] = resource_results.get("results", {})
    executed: List[str] = resource_results.get("executed", [])

    if not results:
        return prompt

    lines = [
        "\n\n---",
        "## 🔧 PRE-CYCLE RESOURCE RESULTS (raccolti dall'orchestratore prima di te)",
        f"Risorse già eseguite: {', '.join(executed) or 'nessuna'}",
        "Usa queste informazioni per decisioni più precise. Non rieseguire le stesse analisi.\n",
    ]

    # ── Lighthouse scores ──────────────────────────────────────────────────
    if "lighthouse" in results:
        lh = results["lighthouse"]
        if lh.get("status") == "ok":
            scores_str = " | ".join(
                f"{k}={v:.2f}" for k, v in lh.get("scores", {}).items()
            )
            lines.append(f"### Lighthouse Live: {scores_str}")
            lines.append(f"URL testata: {lh.get('url', '?')}\n")

    # ── Playwright screenshots ─────────────────────────────────────────────
    if "playwright" in results:
        pw = results["playwright"]
        count = pw.get("count", 0)
        if count > 0:
            paths = pw.get("screenshots", [])
            names = ", ".join(Path(p).name for p in paths)
            lines.append(f"### Screenshot Presi ({count}): {names}\n")

    # ── Kimi Vision analysis ───────────────────────────────────────────────
    if "kimi_vision" in results:
        kv = results["kimi_vision"]
        analysis = kv.get("analysis", "")
        if analysis:
            lines.append("### Analisi Visiva Kimi (UX per bambini 8-12):")
            lines.append(analysis)
            lines.append("")

    # ── DeepSeek root-cause ────────────────────────────────────────────────
    if "deepseek_r1" in results:
        ds = results["deepseek_r1"]
        analysis = ds.get("analysis", "")
        if analysis:
            lines.append("### Root-Cause Analysis DeepSeek R1:")
            lines.append(analysis)
            lines.append("")

    # ── Gemini strategic summary ───────────────────────────────────────────
    if "gemini_pro" in results:
        gm = results["gemini_pro"]
        summary = gm.get("summary", "")
        if summary:
            lines.append("### Analisi Strategica Gemini 2.5 Pro:")
            lines.append(summary)
            lines.append("")

    # ── Kimi K2.5 text research ────────────────────────────────────────────
    if "kimi_k25" in results:
        km = results["kimi_k25"]
        research = km.get("research", "")
        if research:
            lines.append("### Ricerca Kimi K2.5:")
            lines.append(research)
            lines.append("")

    # ── Semantic Scholar papers ────────────────────────────────────────────
    if "semantic_scholar" in results:
        ss = results["semantic_scholar"]
        papers = ss.get("papers", [])
        valid_papers = [p for p in papers if isinstance(p, dict) and "title" in p]
        if valid_papers:
            lines.append("### Paper Accademici (Semantic Scholar):")
            for paper in valid_papers[:3]:
                year = paper.get("year", "?")
                cit = paper.get("citationCount", "?")
                lines.append(f"- {paper['title']} ({year}) — {cit} citazioni")
            lines.append("")

    # ── Gemini CLI (parallel agent) ────────────────────────────────────────
    if "gemini_cli" in results:
        gcli = results["gemini_cli"]
        gcli_type = gcli.get("type", "research")
        if gcli_type == "vision":
            vision_text = gcli.get("vision_analysis", "")
            if vision_text:
                lines.append("### Analisi Visiva Gemini CLI (secondo agente):")
                lines.append(vision_text)
                lines.append("")
        else:
            research_text = gcli.get("research", "")
            if research_text:
                lines.append("### Ricerca Gemini CLI (secondo agente parallelo):")
                lines.append(research_text)
                lines.append("")

    # ── Git change detection ───────────────────────────────────────────────
    if "git" in results:
        git_data = results["git"]
        modified = git_data.get("modified_dirs", [])
        if modified:
            lines.append(f"### Git: Modifiche recenti in: {', '.join(modified)}")
            lines.append("(Considera se deploy automatici sono necessari dopo il tuo lavoro)\n")

    lines.append("---")
    return prompt + "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════════════════
# TRACKER — log resource utilization for self-exam
# ═══════════════════════════════════════════════════════════════════════════════

def track_resource_usage(
    planned: List[str],
    executed: List[str],
    cycle_num: int,
) -> Dict[str, Any]:
    """Log resource utilization metrics and warn if utilization is too low.

    Appends a JSONL record to state/resource-usage.jsonl.
    Returns the usage dict (also included in the cycle report).
    """
    total_available = len(RESOURCE_MAP)
    utilization_pct = round((len(executed) / total_available) * 100, 1)
    skipped = [r for r in planned if r not in executed]

    usage: Dict[str, Any] = {
        "cycle": cycle_num,
        "planned": planned,
        "executed": executed,
        "skipped": skipped,
        "utilization_pct": utilization_pct,
        "timestamp": datetime.now().isoformat(),
    }

    # Persist to JSONL log
    usage_log = AUTOMA_ROOT / "state" / "resource-usage.jsonl"
    try:
        with open(usage_log, "a", encoding="utf-8") as fh:
            fh.write(json.dumps(usage) + "\n")
    except Exception as log_err:
        logger.warning(f"Cannot write resource-usage.jsonl: {log_err}")

    # Warn if utilization is suspiciously low
    if utilization_pct < 30:
        logger.warning(
            f"Ciclo {cycle_num}: SOTTOUTILIZZO RISORSE — "
            f"{utilization_pct:.0f}% ({len(executed)}/{total_available}). "
            f"Eseguite: {executed}. Non eseguite: {skipped}"
        )
    else:
        logger.info(
            f"Ciclo {cycle_num}: {len(executed)}/{total_available} risorse "
            f"({utilization_pct:.0f}%). Saltate: {skipped or 'nessuna'}"
        )

    return usage


# ═══════════════════════════════════════════════════════════════════════════════
# PUBLIC INTERFACE — single entry point for orchestrator.py
# ═══════════════════════════════════════════════════════════════════════════════

def gather_and_inject(
    prompt: str,
    cycle_num: int,
    mode: str,
    check_results: List[dict],
    score: float = 0.0,
    worst_metric: Tuple[str, float] = ("unknown", 1.0),
    extra_context: Optional[Dict[str, Any]] = None,
) -> Tuple[str, Dict[str, Any]]:
    """Plan → Execute → Inject → Track. Main entry point for orchestrator.py.

    Args:
        prompt:        The composed prompt for the AI agent (will be enriched).
        cycle_num:     Current cycle number.
        mode:          Current mode string ('IMPROVE', 'TEST', 'RESEARCH', 'INNOVATE').
        check_results: List of check dicts from run_all_checks().
        score:         Current composite score (0.0 to 1.0).
        worst_metric:  Tuple (metric_name, metric_value) for the worst metric.
        extra_context: Optional additional context to pass to executors.

    Returns:
        (enriched_prompt: str, resource_usage: dict)
    """
    context: Dict[str, Any] = {
        "cycle_num": cycle_num,
        "mode": mode,
        "score": score,
        "worst_metric": worst_metric,
        **(extra_context or {}),
    }

    # ── Plan ─────────────────────────────────────────────────────────────────
    planned = plan_cycle_resources(cycle_num, mode, check_results, score, worst_metric)
    logger.info(f"Ciclo {cycle_num} | mode={mode} | pianificate: {planned}")

    # ── Execute ───────────────────────────────────────────────────────────────
    resource_results = execute_resources(planned, context)
    executed = resource_results.get("executed", [])

    # ── Inject into prompt ────────────────────────────────────────────────────
    enriched_prompt = inject_into_prompt(prompt, resource_results)

    # ── Track utilization ─────────────────────────────────────────────────────
    usage = track_resource_usage(planned, executed, cycle_num)
    # Add a summary of what each resource returned (for the report JSON)
    usage["resource_results_summary"] = {
        k: "ok" for k in resource_results.get("results", {})
    }

    return enriched_prompt, usage


# ═══════════════════════════════════════════════════════════════════════════════
# GEMINI CLI AGENT — parallel second agent (research, vision, simulations)
# ═══════════════════════════════════════════════════════════════════════════════
# Gemini CLI (npx @google/gemini-cli) works like claude -p: it is a full AI
# agent with native tools (file read/write, bash, web search, vision).
# It runs in PARALLEL to Claude during RESEARCH/INNOVATE cycles, covering:
#   - Deep web research and academic paper analysis
#   - Image/video analysis (vision capabilities)
#   - Alternative code generation and simulation
#   - Cross-validation of Claude's findings
#
# Install: npx @google/gemini-cli is available (v0.35.0 confirmed).
# Usage:   npx @google/gemini-cli -p "prompt" -y --model gemini-3-pro-preview
# Auth:    GOOGLE_GENAI_USE_GCA=true (OAuth ermagician@gmail.com, AI Pro plan)
# ──────────────────────────────────────────────────────────────────────────────

_GEMINI_CLI_CMD = ["npx", "@google/gemini-cli"]


def _check_gemini_cli_available() -> bool:
    """Return True if Gemini CLI is callable via npx."""
    try:
        result = subprocess.run(
            _GEMINI_CLI_CMD + ["--version"],
            capture_output=True, text=True, timeout=20,
        )
        return result.returncode == 0
    except Exception:
        return False


def run_gemini_deep_research(
    prompt: str,
    model: str = "gemini-3-pro-preview",
    timeout: int = 600,
    cwd: Optional[str] = None,
) -> Dict[str, Any]:
    """Launch Gemini CLI as a headless second agent for deep research/analysis.

    Mirrors the pattern used by run_claude_headless() in orchestrator.py:
    launches `npx @google/gemini-cli -p prompt -y` as a subprocess and
    captures the output.

    Args:
        prompt:  The full task prompt for Gemini.
        model:   Gemini model to use (default: gemini-2.5-pro).
        timeout: Max seconds to wait for the response.
        cwd:     Working directory for the process (defaults to PROJECT_ROOT).

    Returns:
        {"status": "ok", "output": "...", "output_length": N}
        {"status": "error" | "timeout" | "unavailable", "reason": "..."}
    """
    if not _check_gemini_cli_available():
        logger.warning("Gemini CLI unavailable — install with: npm install -g @google/gemini-cli")
        return {
            "status": "unavailable",
            "reason": "Gemini CLI not found. Install: npm install -g @google/gemini-cli",
        }

    work_dir = cwd or str(PROJECT_ROOT)
    log_file = AUTOMA_ROOT / "logs" / f"gemini-{datetime.now().strftime('%H%M%S')}.log"

    cmd = _GEMINI_CLI_CMD + [
        "-p", prompt,
        "-y",              # YOLO mode: auto-approve all actions (equivalent to --dangerously-skip-permissions)
        "--model", model,
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True, text=True,
            timeout=timeout,
            cwd=work_dir,
        )
        output = result.stdout or ""

        # Persist log for debugging
        try:
            log_file.write_text(
                f"=== GEMINI PROMPT ===\n{prompt[:500]}\n\n"
                f"=== GEMINI OUTPUT ===\n{output}",
                encoding="utf-8",
            )
        except Exception:
            pass

        if result.returncode == 0:
            logger.info(f"Gemini CLI OK: {len(output)} chars, log={log_file.name}")
            return {
                "status": "ok",
                "output": output,
                "output_length": len(output),
                "returncode": result.returncode,
            }
        else:
            err = (result.stderr or output)[:400]
            logger.warning(f"Gemini CLI FAILED (rc={result.returncode}): {err}")
            return {"status": "error", "reason": err}

    except subprocess.TimeoutExpired:
        logger.warning(f"Gemini CLI timeout after {timeout}s")
        return {"status": "timeout", "reason": f"Timeout after {timeout}s"}
    except FileNotFoundError:
        return {"status": "unavailable", "reason": "npx not found in PATH"}
    except Exception as exc:
        logger.warning(f"Gemini CLI unexpected error: {exc}")
        return {"status": "error", "reason": str(exc)[:200]}


def run_gemini_vision_analysis(
    image_path: str,
    context: str = "",
    timeout: int = 120,
) -> str:
    """Ask Gemini CLI to analyze a screenshot or image file.

    Uses Gemini's native vision capability via the CLI agent.
    Returns the analysis text, or empty string on failure.
    """
    if not Path(image_path).exists():
        logger.warning(f"Image not found for Gemini vision: {image_path}")
        return ""

    prompt = (
        f"Analizza visivamente questo screenshot di ELAB Tutor "
        f"(piattaforma educativa Arduino/elettronica per bambini 8-12 anni).\n"
        f"File immagine da analizzare: {image_path}\n"
        f"Contesto: {context}\n\n"
        f"Leggi il file immagine con i tuoi tool nativi e poi rispondi in italiano:\n"
        f"1. Problemi UX/design evidenti per bambini 8-12\n"
        f"2. Cosa funziona bene (da non modificare)\n"
        f"3. Priorità 1 miglioramento urgente\n"
        f"Massimo 150 parole."
    )
    result = run_gemini_deep_research(prompt, timeout=timeout, cwd=str(PROJECT_ROOT))
    if result.get("status") == "ok":
        return result.get("output", "")[:600]
    return ""


# ═══════════════════════════════════════════════════════════════════════════════
# STANDALONE SELF-TEST
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import sys

    print("=== Resource Orchestrator Self-Test ===\n")
    print(f"AUTOMA_ROOT: {AUTOMA_ROOT}")
    print(f"Tools available: {_TOOLS_AVAILABLE}")
    print(f"Playwright available: {_check_playwright_available()}")
    print(f"RESOURCE_MAP entries: {len(RESOURCE_MAP)}")

    print("\n--- Plan test (cycle=3, mode=TEST, worst_metric=('lighthouse_perf', 0.25)) ---")
    plan = plan_cycle_resources(
        cycle_num=3,
        mode="TEST",
        check_results=[],
        score=0.72,
        worst_metric=("lighthouse_perf", 0.25),
    )
    print(f"Planned: {plan}")

    print("\n--- Plan test (cycle=6, mode=IMPROVE) ---")
    plan2 = plan_cycle_resources(
        cycle_num=6,
        mode="IMPROVE",
        check_results=[],
        score=0.85,
        worst_metric=("galileo_latency", 0.80),
    )
    print(f"Planned: {plan2}")

    print("\n--- Screenshots test (dry) ---")
    # Only test if Playwright available to avoid slow install in CI
    if _check_playwright_available():
        shots = take_screenshots(["http://localhost:5179"])
        print(f"Screenshots: {shots}")
    else:
        print("Playwright not available — skip screenshot test")

    print("\n[OK] Self-test complete")
    sys.exit(0)
