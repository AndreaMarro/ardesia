"""Tests for CLI compile-course command (P1, COORDINATION.md §18).

Tests the wiring: CLI parser → course loader → exporter.
ZERO-LLM, ZERO deps nuove, pura composizione di moduli già testati.
"""

from __future__ import annotations

import tempfile
from pathlib import Path

from lessonos.cli import _parse_args, main


def _fixture_path() -> str:
    """Return the absolute path to the sample_course fixture."""
    here = Path(__file__).resolve().parent
    return str(here.parent / "fixtures" / "sample_course")


# ── CLI argument parsing ────────────────────────────────────────────────────


def test_compile_course_parser_has_minimal_args():
    """Parser accetta folder posizionale + default target=markdown."""
    args = _parse_args(["compile-course", "/tmp/test"])
    assert args.command == "compile-course"
    assert args.folder == "/tmp/test"
    assert args.target == "markdown"
    assert args.output == ""
    assert args.include_ai_atoms is False


def test_compile_course_parser_all_targets():
    """Parser accetta tutti i target validi."""
    for target in ("markdown", "liascript", "quarto"):
        args = _parse_args(["compile-course", "/tmp/test", "--target", target])
        assert args.target == target


def test_compile_course_parser_include_ai_atoms():
    """Flag --include-ai-atoms settato correttamente."""
    args = _parse_args(
        ["compile-course", "/tmp/test", "--include-ai-atoms"]
    )
    assert args.include_ai_atoms is True


def test_compile_course_parser_custom_output():
    """Flag --output settato correttamente."""
    args = _parse_args(
        ["compile-course", "/tmp/test", "--output", "/tmp/out"]
    )
    assert args.output == "/tmp/out"


def test_compile_course_parser_review():
    """Flag --review settato correttamente."""
    args = _parse_args(
        ["compile-course", "/tmp/test", "--review"]
    )
    assert args.review is True
    assert args.approve is False


def test_compile_course_parser_approve():
    """Flag --approve settato correttamente."""
    args = _parse_args(
        ["compile-course", "/tmp/test", "--approve"]
    )
    assert args.approve is True
    assert args.review is False


def test_compile_course_parser_review_and_approve():
    """Flag --review + --approve insieme."""
    args = _parse_args(
        ["compile-course", "/tmp/test", "--review", "--approve"]
    )
    assert args.review is True
    assert args.approve is True


# ── Error paths ─────────────────────────────────────────────────────────────


def test_compile_course_folder_not_found():
    """Cartella inesistente → exit code 1 + messaggio errore."""
    rc = main(
        ["compile-course", "/tmp/nonexistent_course_path_xyz789"]
    )
    assert rc == 1


def test_compile_course_no_course_json():
    """Cartella senza course.json → exit code 1."""
    with tempfile.TemporaryDirectory() as tmpdir:
        rc = main(["compile-course", tmpdir])
    assert rc == 1


def test_compile_course_invalid_blueprint():
    """Blueprint vuoto/invalido → exit code 1 (ValueError da load_course_folder)."""
    with tempfile.TemporaryDirectory() as tmpdir:
        # Crea course.json con titolo vuoto (invalid per CourseFolder.__post_init__)
        p = Path(tmpdir)
        (p / "course.json").write_text(
            '{"course_id":"x","title":"","lessons":[],"sources":[]}'
        )
        (p / "lessons").mkdir()
        (p / "sources").mkdir()
        rc = main(["compile-course", str(tmpdir)])
    assert rc == 1


# ── Happy paths ─────────────────────────────────────────────────────────────


def test_compile_course_markdown_default():
    """Markdown: default build in _build/markdown/."""
    rc = main(["compile-course", _fixture_path()])
    assert rc == 0


def test_compile_course_markdown_explicit_target():
    """Markdown via --target markdown esplicito."""
    rc = main(
        [
            "compile-course",
            _fixture_path(),
            "--target",
            "markdown",
        ]
    )
    assert rc == 0


def test_compile_course_markdown_custom_output():
    """Markdown con --output personalizzato: file scritti nella directory."""
    with tempfile.TemporaryDirectory() as tmpdir:
        rc = main(
            [
                "compile-course",
                _fixture_path(),
                "--target",
                "markdown",
                "--output",
                tmpdir,
            ]
        )
        assert rc == 0
        out = Path(tmpdir)
        assert (out / "course.md").exists()
        assert (out / "modules").exists()
        # Fixture ha 3 moduli → course.md + 3 modN_*.md = 4 file .md
        assert len(list(out.rglob("*.md"))) == 4


def test_compile_course_liascript():
    """LiaScript: file .md prodotto."""
    rc = main(
        [
            "compile-course",
            _fixture_path(),
            "--target",
            "liascript",
        ]
    )
    assert rc == 0


def test_compile_course_quarto():
    """Quarto: _quarto.yml + .qmd files prodotti."""
    rc = main(
        [
            "compile-course",
            _fixture_path(),
            "--target",
            "quarto",
        ]
    )
    assert rc == 0


def test_compile_course_markdown_output_contains_modules():
    """Verifica che l'output markdown contenga i moduli attesi."""
    with tempfile.TemporaryDirectory() as tmpdir:
        rc = main(
            [
                "compile-course",
                _fixture_path(),
                "--target",
                "markdown",
                "--output",
                tmpdir,
            ]
        )
        assert rc == 0
        out = Path(tmpdir)
        course_md = (out / "course.md").read_text()
        assert "Derivate avanzate" in course_md
        assert "Integrazione" in course_md
        assert "Equazioni differenziali" in course_md


def test_compile_course_markdown_no_module_dir():
    """Markdown senza moduli nel course → fallimento visibile."""
    with tempfile.TemporaryDirectory() as tmpdir:
        p = Path(tmpdir)
        # course minimale senza moduli
        (p / "course.json").write_text(
            '{"course_id":"x","title":"Minimal",'
            '"lessons":[],"sources":[],"modules":[{"title":"Solo","lesson_ids":[]}]}'
        )
        (p / "lessons").mkdir()
        (p / "sources").mkdir()
        # Deve riuscire — modulo singolo con 0 lezioni
        rc = main(["compile-course", str(tmpdir)])
        assert rc == 0


def test_compile_course_output_dir_created():
    """Se output dir non esiste, viene creata."""
    with tempfile.TemporaryDirectory() as tmpdir:
        out = Path(tmpdir) / "deep" / "nested" / "build"
        # out non esiste ancora
        rc = main(
            [
                "compile-course",
                _fixture_path(),
                "--target",
                "markdown",
                "--output",
                str(out),
            ]
        )
        assert rc == 0
        assert out.exists()
        assert (out / "course.md").exists()


# ── Teacher review integration ──────────────────────────────────────────────


def test_compile_course_review_flag(capsys):
    """--review mostra status revisione a 0 note."""
    rc = main(
        [
            "compile-course",
            _fixture_path(),
            "--review",
        ]
    )
    assert rc == 0
    out = capsys.readouterr().out
    assert "Review status:" in out
    assert "0 note(s)" in out
    assert "approved=False" in out


def test_compile_course_approve_flag(capsys):
    """--approve auto-approva il corso."""
    rc = main(
        [
            "compile-course",
            _fixture_path(),
            "--approve",
        ]
    )
    assert rc == 0
    out = capsys.readouterr().out
    assert "Course approved:" in out
    assert "Review status:" in out
    assert "1 note(s)" in out
    assert "approved=True" in out


def test_compile_course_review_and_approve(capsys):
    """--review + --approve insieme."""
    rc = main(
        [
            "compile-course",
            _fixture_path(),
            "--review",
            "--approve",
        ]
    )
    assert rc == 0
    out = capsys.readouterr().out
    assert "Review status:" in out
    assert "approved=True" in out


def test_compile_course_review_with_custom_output(capsys):
    """--review con --output personalizzato: review.json scritto."""
    with tempfile.TemporaryDirectory() as tmpdir:
        rc = main(
            [
                "compile-course",
                _fixture_path(),
                "--target",
                "markdown",
                "--output",
                tmpdir,
                "--review",
            ]
        )
        assert rc == 0
        captured = capsys.readouterr().out
        assert "Review status:" in captured
        assert "Review notes saved:" in captured
        out = Path(tmpdir)
        assert (out / "course.md").exists()
        assert (out / "review.json").exists()
        import json
        review_data = json.loads((out / "review.json").read_text())
        assert review_data["course_id"] == "Calcolo 2 — Integrali e ODE"
        assert len(review_data["notes"]) == 0
