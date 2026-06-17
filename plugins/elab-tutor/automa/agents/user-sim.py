#!/usr/bin/env python3
"""
ELAB Automa — User Simulation (5 Profili Reali)
Simula 5 tipologie di utente su https://www.elabtutor.school

Profili:
  1. Marco 8y — bambino alle prime armi, touch su tablet
  2. Sofia 11y — studentessa curiosa, usa mouse
  3. Prof. Rossi — docente inesperto, usa LIM (1366x768)
  4. Tecnico — utente avanzato, verifica funzionalità avanzate
  5. Mobile — visita da smartphone (iPhone SE, 375x667)

Output:
  automa/reports/user-sim-YYYY-MM-DD.json
  automa/screenshots/user-sim-PROFILE-timestamp.png
"""

import json
import subprocess
import sys
import time
from datetime import date, datetime
from pathlib import Path

AUTOMA_ROOT = Path(__file__).parent.parent
PROJECT_ROOT = AUTOMA_ROOT.parent
REPORTS_DIR = AUTOMA_ROOT / "reports"
SCREENSHOTS_DIR = AUTOMA_ROOT / "screenshots"
SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)

TARGET_URL = "https://www.elabtutor.school"

PROFILES = [
    {
        "id": "marco_8y",
        "name": "Marco 8y",
        "viewport": {"width": 1024, "height": 768},
        "device": "tablet",
        "description": "Bambino 8 anni, tablet scolastico, touch, prima volta con ELAB",
        "interactions": [
            {"action": "navigate", "target": TARGET_URL},
            {"action": "wait_load"},
            {"action": "screenshot", "label": "homepage"},
            {"action": "wait", "ms": 2000},
            {"action": "screenshot", "label": "after_2s"},
        ],
    },
    {
        "id": "sofia_11y",
        "name": "Sofia 11y",
        "viewport": {"width": 1280, "height": 800},
        "device": "laptop",
        "description": "Studentessa 11 anni, laptop scuola, ha già fatto lezione Vol1",
        "interactions": [
            {"action": "navigate", "target": TARGET_URL},
            {"action": "wait_load"},
            {"action": "screenshot", "label": "homepage"},
            {"action": "wait", "ms": 1500},
        ],
    },
    {
        "id": "prof_rossi",
        "name": "Prof. Rossi",
        "viewport": {"width": 1366, "height": 768},
        "device": "lim",
        "description": "Docente 45y, inesperto di elettronica, usa LIM Promethean in classe",
        "interactions": [
            {"action": "navigate", "target": TARGET_URL},
            {"action": "wait_load"},
            {"action": "screenshot", "label": "lim_view"},
            {"action": "wait", "ms": 2000},
            {"action": "screenshot", "label": "lim_after_2s"},
        ],
    },
    {
        "id": "tecnico",
        "name": "Tecnico ELAB",
        "viewport": {"width": 1920, "height": 1080},
        "device": "desktop",
        "description": "Tecnico avanzato, verifica funzionalità avanzate, QA",
        "interactions": [
            {"action": "navigate", "target": TARGET_URL},
            {"action": "wait_load"},
            {"action": "screenshot", "label": "desktop_full"},
            {"action": "check_console_errors"},
        ],
    },
    {
        "id": "mobile_se",
        "name": "Mobile iPhone SE",
        "viewport": {"width": 375, "height": 667},
        "device": "mobile",
        "description": "Visita da smartphone, verifica responsive e overflow",
        "interactions": [
            {"action": "navigate", "target": TARGET_URL},
            {"action": "wait_load"},
            {"action": "screenshot", "label": "mobile_home"},
            {"action": "check_overflow"},
        ],
    },
]

# Playwright script template
PLAYWRIGHT_SCRIPT = """
const {{ chromium }} = require('playwright');
(async () => {{
    const browser = await chromium.launch({{ headless: true }});
    const page = await browser.newPage({{ viewport: {{ width: {width}, height: {height} }} }});

    const results = {{
        profile: '{profile_id}',
        viewport: {{ width: {width}, height: {height} }},
        errors: [],
        screenshots: [],
        overflow: null,
        load_time_ms: null,
        timestamp: new Date().toISOString(),
    }};

    page.on('pageerror', e => results.errors.push(e.message.slice(0, 200)));
    page.on('console', msg => {{ if (msg.type() === 'error') results.errors.push(msg.text().slice(0, 200)); }});

    try {{
        const t0 = Date.now();
        await page.goto('{url}', {{ timeout: 30000 }});
        await page.waitForLoadState('networkidle', {{ timeout: 15000 }}).catch(() => {{}});
        results.load_time_ms = Date.now() - t0;

        // Screenshot homepage
        await page.screenshot({{ path: '{screenshot_path}', fullPage: false }});
        results.screenshots.push('{screenshot_label}');

        // Check overflow (mobile/tablet)
        results.overflow = await page.evaluate(() =>
            document.documentElement.scrollWidth > document.documentElement.clientWidth
        );

        // Check touch targets (per tablet/mobile)
        results.small_touch_targets = await page.evaluate(() => {{
            let small = 0;
            document.querySelectorAll('button, a, [role="button"]').forEach(b => {{
                const r = b.getBoundingClientRect();
                if (r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44)) small++;
            }});
            return small;
        }});

        // Page title
        results.title = await page.title();
        results.status = 'ok';

    }} catch(e) {{
        results.error = e.message.slice(0, 300);
        results.status = 'fail';
    }}

    await browser.close();
    console.log(JSON.stringify(results));
}})();
"""


def run_profile_simulation(profile: dict) -> dict:
    """Run Playwright simulation for a single user profile."""
    width = profile["viewport"]["width"]
    height = profile["viewport"]["height"]
    profile_id = profile["id"]
    ts = datetime.now().strftime("%H%M%S")
    screenshot_path = str(SCREENSHOTS_DIR / f"user-sim-{profile_id}-{ts}.png")
    screenshot_label = f"{profile_id}-home"

    script = PLAYWRIGHT_SCRIPT.format(
        width=width,
        height=height,
        profile_id=profile_id,
        url=TARGET_URL,
        screenshot_path=screenshot_path.replace("\\", "/"),
        screenshot_label=screenshot_label,
    )

    start = time.time()
    try:
        result = subprocess.run(
            ["node", "-e", script],
            capture_output=True,
            text=True,
            timeout=60,
            cwd=str(PROJECT_ROOT),
        )
        elapsed = time.time() - start
        output = result.stdout.strip()
        lines = [l for l in output.splitlines() if l.strip().startswith("{")]
        data = json.loads(lines[-1]) if lines else {}
        data["profile_name"] = profile["name"]
        data["profile_description"] = profile["description"]
        data["device"] = profile["device"]
        data["simulation_time_s"] = round(elapsed, 1)
        return data
    except subprocess.TimeoutExpired:
        return {
            "profile": profile_id,
            "profile_name": profile["name"],
            "status": "timeout",
            "error": "Playwright timeout >60s",
        }
    except Exception as e:
        return {
            "profile": profile_id,
            "profile_name": profile["name"],
            "status": "error",
            "error": str(e)[:300],
        }


def analyze_results(results: list[dict]) -> dict:
    """Analyze simulation results across all profiles."""
    analysis = {
        "total_profiles": len(results),
        "passed": sum(1 for r in results if r.get("status") == "ok"),
        "failed": sum(1 for r in results if r.get("status") in ("fail", "timeout", "error")),
        "overflow_issues": [r["profile"] for r in results if r.get("overflow")],
        "avg_load_time_ms": None,
        "js_errors_by_profile": {},
        "small_touch_targets": {},
    }

    load_times = [r["load_time_ms"] for r in results if r.get("load_time_ms")]
    if load_times:
        analysis["avg_load_time_ms"] = int(sum(load_times) / len(load_times))

    for r in results:
        pid = r.get("profile", "?")
        if r.get("errors"):
            analysis["js_errors_by_profile"][pid] = len(r["errors"])
        if r.get("small_touch_targets", 0) > 0:
            analysis["small_touch_targets"][pid] = r["small_touch_targets"]

    # Score 0-1
    score = analysis["passed"] / analysis["total_profiles"] if analysis["total_profiles"] > 0 else 0
    overflow_penalty = len(analysis["overflow_issues"]) * 0.1
    analysis["score"] = max(0.0, round(score - overflow_penalty, 2))

    return analysis


def run_user_simulation(profiles: list[dict] | None = None) -> dict:
    """Run simulation for all profiles and save report."""
    if profiles is None:
        profiles = PROFILES

    print(f"\n{'='*60}")
    print(f" ELAB User Simulation — {len(profiles)} profili")
    print(f"{'='*60}")

    results = []
    for profile in profiles:
        print(f"\n  [{profile['id']}] {profile['name']} ({profile['device']}, {profile['viewport']['width']}x{profile['viewport']['height']})...")
        r = run_profile_simulation(profile)
        status_icon = "✅" if r.get("status") == "ok" else "❌"
        load_ms = r.get("load_time_ms", "?")
        overflow = r.get("overflow", "?")
        errors = len(r.get("errors", []))
        print(f"   {status_icon} load={load_ms}ms overflow={overflow} js_errors={errors}")
        if r.get("errors"):
            for err in r["errors"][:2]:
                print(f"      ⚠️ {err[:100]}")
        results.append(r)

    analysis = analyze_results(results)

    report = {
        "date": date.today().isoformat(),
        "timestamp": datetime.now().isoformat(),
        "url": TARGET_URL,
        "profiles_tested": len(results),
        "analysis": analysis,
        "results": results,
    }

    # Save report
    report_path = REPORTS_DIR / f"user-sim-{date.today().isoformat()}.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False))

    print(f"\n{'='*60}")
    print(f"  Score: {analysis['score']:.2f} | Passed: {analysis['passed']}/{len(results)}")
    if analysis["overflow_issues"]:
        print(f"  ⚠️ Overflow su: {', '.join(analysis['overflow_issues'])}")
    if analysis["js_errors_by_profile"]:
        print(f"  ⚠️ JS Errors: {analysis['js_errors_by_profile']}")
    if analysis.get("avg_load_time_ms"):
        print(f"  Load medio: {analysis['avg_load_time_ms']}ms")
    print(f"  Report: {report_path}")
    print(f"{'='*60}")

    return report


if __name__ == "__main__":
    # Check playwright available
    check = subprocess.run(
        ["npx", "playwright", "--version"],
        capture_output=True, text=True, timeout=10
    )
    if check.returncode != 0:
        print("⚠️ Playwright non disponibile. Installa con: npx playwright install chromium")
        sys.exit(1)

    report = run_user_simulation()
    sys.exit(0 if report["analysis"]["score"] >= 0.8 else 1)
