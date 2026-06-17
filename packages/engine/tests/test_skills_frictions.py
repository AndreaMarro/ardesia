"""Guard del loop di auto-miglioramento: skills/ auto-caricate + check-frictions.

Non tautologico: oltre a verificare la presenza dei file, esegue realmente
`bin/check-frictions.sh` sul PROCESS-LOG.md vero e asserisce che NON resti alcun
attrito ricorrente scoperto (warning=0), e che `bin/review.sh` carichi davvero le skill.
"""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "skills"
REVIEW = ROOT / "bin" / "review.sh"
CHECK = ROOT / "bin" / "check-frictions.sh"

REQUIRED_SKILLS = [
    "lessonos-grounding-check.md",
    "test-determinism.md",
    "review-autoload.md",
]


def test_skills_dir_and_readme_convention():
    assert SKILLS.is_dir(), "manca la dir skills/"
    readme = (SKILLS / "README.md").read_text(encoding="utf-8")
    # la convenzione vincolante deve essere esplicita
    assert ">=2 RETRO" in readme
    assert "skill" in readme.lower() and "guard" in readme.lower()
    assert "solo loggat" in readme.lower()


def test_required_skills_exist_with_four_sections():
    for name in REQUIRED_SKILLS:
        f = SKILLS / name
        assert f.exists(), f"manca skill {name}"
        text = f.read_text(encoding="utf-8")
        assert "When-to-apply" in text, f"{name}: manca sezione When-to-apply"
        assert "Checklist/Procedura" in text, f"{name}: manca Checklist/Procedura"
        assert "Origine-RETRO" in text, f"{name}: manca Origine-RETRO"
        # almeno un item di checklist verificabile
        assert "- [ ]" in text, f"{name}: nessun item di checklist"


def test_grounding_skill_migrated_with_core_invariants():
    text = (SKILLS / "lessonos-grounding-check.md").read_text(encoding="utf-8")
    low = text.lower()
    assert "seg_id" in low and "risolve" in low
    assert "excerpt" in low and "substring" in low
    assert "tautologic" in low


def test_review_sh_autoloads_skills():
    text = REVIEW.read_text(encoding="utf-8")
    # il fix del cuore: review.sh DEVE leggere skills/*.md e iniettarle nel prompt
    assert "skills/*.md" in text, "review.sh non carica skills/*.md"
    assert "SKILL CHECKLIST" in text or "SKILL:" in text
    assert "$skills" in text, "review.sh non inietta le skill nel prompt"


def test_check_frictions_script_runs_with_no_uncovered_friction():
    assert CHECK.exists(), "manca bin/check-frictions.sh"
    res = subprocess.run(
        ["bash", str(CHECK), "--strict"],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    # --strict esce non-zero SOLO se c'è un attrito ricorrente senza skill/guard
    assert res.returncode == 0, (
        "check-frictions ha trovato attriti ricorrenti scoperti:\n" + res.stdout + res.stderr
    )
    assert "warning=0" in res.stdout, res.stdout


def test_check_frictions_detects_recurrence_and_maps_to_existing_targets():
    """Il guard deve mappare ogni attrito ricorrente a un file realmente esistente."""
    res = subprocess.run(
        ["bash", str(CHECK)],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    out = res.stdout
    # deve aver rilevato almeno un attrito ricorrente reale (i RETRO ne contengono)
    assert "attriti ricorrenti rilevati" in out
    # ogni target [OK] coperto da <path> deve esistere su disco (non un riferimento fantasma)
    for path in re.findall(r"coperto da (\S+)", out):
        assert (ROOT / path).exists(), f"check-frictions cita {path} che non esiste"
