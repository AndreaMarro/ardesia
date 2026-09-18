"""Tests for lessonos/export/browser_pdf — D2-J3C provisional browser PDF.

Provisional local-first adapter: existing single-lesson SummaryPack
markdown -> Pandoc standalone HTML/MathML -> headless Chromium -> PDF.

No real Pandoc/Chromium in CI: subprocess is faked. The fake Chromium
writes real b"%PDF-..." bytes so the artifact-validation branch is
genuinely exercised, never assumed.
"""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Any

import pytest

from lessonos.export import browser_pdf
from lessonos.export.browser_pdf import export_summary_pdf
from lessonos.summarizer import SummaryPack

MD = (
    "# Riepilogo: lezione \u00e8\n\n"
    "La derivata \u00e8 il tasso di variazione.\n"
)


def _pack(files: dict[str, str]) -> SummaryPack:
    return SummaryPack(files=dict(files))


class _FakeCompleted:
    def __init__(self, returncode: int = 0, stdout: str | bytes = "", stderr: str = "") -> None:
        self.returncode = returncode
        self.stdout = stdout
        self.stderr = stderr


def _install_fakes(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    *,
    pandoc_rc: int = 0,
    pandoc_stdout: str = "<html><head></head><body></body></html>",
    pandoc_stderr: str = "",
    pandoc_raise: BaseException | None = None,
    chromium_rc: int = 0,
    chromium_stderr: str = "",
    chromium_raise: BaseException | None = None,
    chromium_writes: bytes | None = b"%PDF-1.4\n%EOF\n",
    pandoc: str = "/usr/bin/pandoc",
    chromium: str = "/usr/bin/chromium",
) -> dict[str, Any]:
    """Fake subprocess.run: pandoc echoes canned HTML, chromium writes bytes.

    Records every call (argv, kwargs, input) for exact-argv assertions.
    """
    calls: list[dict[str, Any]] = []

    def fake_run(argv: Any, **kwargs: Any) -> _FakeCompleted:
        assert "shell" not in kwargs or kwargs["shell"] is False
        calls.append({"argv": list(argv), "kwargs": kwargs, "input": kwargs.get("input")})
        exe = str(argv[0])
        if exe == pandoc:
            if pandoc_raise is not None:
                raise pandoc_raise
            return _FakeCompleted(pandoc_rc, pandoc_stdout, pandoc_stderr)
        if exe == chromium:
            if chromium_raise is not None:
                raise chromium_raise
            if chromium_rc == 0 and chromium_writes is not None:
                out = next(a.split("=", 1)[1] for a in argv if str(a).startswith("--print-to-pdf="))
                Path(out).write_bytes(chromium_writes)
            return _FakeCompleted(chromium_rc, "", chromium_stderr)
        raise AssertionError(f"unexpected executable: {exe}")

    monkeypatch.setattr(browser_pdf.subprocess, "run", fake_run)
    monkeypatch.setattr(browser_pdf.shutil, "which", lambda name: pandoc if name == "pandoc" else None)
    monkeypatch.delenv("ARDESIA_CHROMIUM", raising=False)
    return {"calls": calls, "pandoc": pandoc, "chromium": chromium}


def _chromium_only(monkeypatch: pytest.MonkeyPatch, chromium: str) -> None:
    monkeypatch.setattr(
        browser_pdf, "_discover_chromium", lambda: chromium
    )


# ── Input contract ────────────────────────────────────────────────────


class TestInputContract:
    def test_empty_pack_rejected(self, tmp_path: Path) -> None:
        with pytest.raises(ValueError):
            export_summary_pdf(_pack({}), str(tmp_path))

    def test_two_markdown_files_rejected(self, tmp_path: Path) -> None:
        with pytest.raises(ValueError):
            export_summary_pdf(_pack({"a.md": MD, "b.md": MD}), str(tmp_path))

    def test_no_markdown_file_rejected(self, tmp_path: Path) -> None:
        with pytest.raises(ValueError):
            export_summary_pdf(_pack({"notes.txt": "hi"}), str(tmp_path))

    def test_path_traversal_rejected(self, tmp_path: Path) -> None:
        with pytest.raises(ValueError):
            export_summary_pdf(_pack({"../evil.md": MD}), str(tmp_path))

    def test_absolute_path_rejected(self, tmp_path: Path) -> None:
        with pytest.raises(ValueError):
            export_summary_pdf(_pack({"/tmp/evil.md": MD}), str(tmp_path))

    def test_remote_image_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        _install_fakes(monkeypatch, tmp_path)
        with pytest.raises(ValueError):
            export_summary_pdf(_pack({"l.md": "# T\n\n![x](https://example.com/a.png)\n"}), str(tmp_path))

    def test_script_tag_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        _install_fakes(monkeypatch, tmp_path)
        with pytest.raises(ValueError):
            export_summary_pdf(_pack({"l.md": "# T\n\n<script>alert(1)</script>\n"}), str(tmp_path))

    def test_iframe_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        _install_fakes(monkeypatch, tmp_path)
        with pytest.raises(ValueError):
            export_summary_pdf(_pack({"l.md": '# T\n\n<iframe src="https://example.com"></iframe>\n'}),
                               str(tmp_path))

    def test_plain_link_allowed(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(monkeypatch, tmp_path)
        _chromium_only(monkeypatch, rec["chromium"])
        out = export_summary_pdf(
            _pack({"l.md": "# T\n\nVedi [manuale](https://example.com/p12).\n"}), str(tmp_path)
        )
        assert out.is_file()


# ── Runtime discovery ─────────────────────────────────────────────────


class TestRuntimeDiscovery:
    def test_no_pandoc_fails_explicitly(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setattr(browser_pdf.shutil, "which", lambda name: None)
        with pytest.raises(FileNotFoundError, match="Pandoc executable unavailable"):
            export_summary_pdf(_pack({"l.md": MD}), str(tmp_path))

    def test_no_chromium_fails_explicitly(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        monkeypatch.setattr(browser_pdf.shutil, "which", lambda name: "/usr/bin/pandoc")
        monkeypatch.delenv("ARDESIA_CHROMIUM", raising=False)
        monkeypatch.setattr(browser_pdf, "_discover_chromium", lambda: None)
        with pytest.raises(FileNotFoundError, match="Chromium executable unavailable"):
            export_summary_pdf(_pack({"l.md": MD}), str(tmp_path))

    def test_env_override_honored(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        chrome_bin = tmp_path / "chrome-bin"
        chrome_bin.write_bytes(b"#!/bin/sh\nexit 0\n")
        rec = _install_fakes(monkeypatch, tmp_path, chromium=str(chrome_bin))
        monkeypatch.setenv("ARDESIA_CHROMIUM", str(chrome_bin))
        out = export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"],
        )
        assert out.is_file()
        chrom_argvs = [c["argv"] for c in rec["calls"] if c["argv"][0] == str(chrome_bin)]
        assert len(chrom_argvs) == 1

    def test_scan_finds_newest_headless_shell(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        cache = tmp_path / "Library" / "Caches" / "ms-playwright"
        old = cache / "chromium_headless_shell-1200" / "chrome-headless-shell-mac-arm64"
        new = cache / "chromium_headless_shell-1228" / "chrome-headless-shell-mac-arm64"
        old.mkdir(parents=True)
        new.mkdir(parents=True)
        (new / "chrome-headless-shell").write_bytes(b"x")
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        monkeypatch.delenv("ARDESIA_CHROMIUM", raising=False)
        found = browser_pdf._discover_chromium()
        assert found == str(new / "chrome-headless-shell")

    def test_scan_empty_returns_none(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        monkeypatch.delenv("ARDESIA_CHROMIUM", raising=False)
        monkeypatch.setattr(browser_pdf.Path, "is_file", lambda self: False)
        assert browser_pdf._discover_chromium() is None


# ── Pandoc stage ──────────────────────────────────────────────────────


class TestPandocStage:
    def test_pandoc_nonzero_fails_without_chromium(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        rec = _install_fakes(monkeypatch, tmp_path, pandoc_rc=1, pandoc_stderr="boom")
        _chromium_only(monkeypatch, rec["chromium"])
        with pytest.raises(RuntimeError, match="Pandoc exited 1"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )
        assert not [c for c in rec["calls"] if c["argv"][0] == rec["chromium"]]

    def test_pandoc_timeout_fails(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(
            monkeypatch, tmp_path,
            pandoc_raise=subprocess.TimeoutExpired(cmd="pandoc", timeout=60),
        )
        _chromium_only(monkeypatch, rec["chromium"])
        with pytest.raises(RuntimeError, match="[Tt]imed out"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )

    def test_pandoc_argv_exact(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(monkeypatch, tmp_path)
        _chromium_only(monkeypatch, rec["chromium"])
        export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        pandoc_calls = [c for c in rec["calls"] if c["argv"][0] == rec["pandoc"]]
        assert len(pandoc_calls) == 1
        assert pandoc_calls[0]["argv"] == [
            rec["pandoc"], "-s", "--mathml", "-f", "markdown", "-t", "html5",
        ]

    def test_markdown_reaches_pandoc_byte_for_byte(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        rec = _install_fakes(monkeypatch, tmp_path)
        _chromium_only(monkeypatch, rec["chromium"])
        export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        pandoc_calls = [c for c in rec["calls"] if c["argv"][0] == rec["pandoc"]]
        assert pandoc_calls[0]["input"] == MD.encode("utf-8")

    def test_mathml_mode_in_pandoc_command(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        rec = _install_fakes(monkeypatch, tmp_path)
        _chromium_only(monkeypatch, rec["chromium"])
        export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        assert "--mathml" in rec["calls"][0]["argv"]


# ── Chromium stage ────────────────────────────────────────────────────


class TestChromiumStage:
    def test_chromium_nonzero_fails(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(monkeypatch, tmp_path, chromium_rc=1, chromium_stderr="crash")
        with pytest.raises(RuntimeError, match="Chromium exited 1"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )

    def test_chromium_timeout_fails(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(
            monkeypatch, tmp_path,
            chromium_raise=subprocess.TimeoutExpired(cmd="chromium", timeout=120),
        )
        with pytest.raises(RuntimeError, match="[Tt]imed out"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )

    def test_chromium_argv_exact(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(monkeypatch, tmp_path)
        export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        chrom_calls = [c for c in rec["calls"] if c["argv"][0] == rec["chromium"]]
        assert len(chrom_calls) == 1
        argv = chrom_calls[0]["argv"]
        assert argv[:4] == [rec["chromium"], "--headless", "--disable-gpu", "--no-pdf-header-footer"]
        pdf_arg = next(a for a in argv if a.startswith("--print-to-pdf="))
        assert pdf_arg == f"--print-to-pdf={tmp_path / 'l.pdf'}"
        assert argv[-1].endswith(".html")


# ── Output truth ──────────────────────────────────────────────────────


class TestOutputTruth:
    def test_missing_output_fails(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(monkeypatch, tmp_path, chromium_writes=None)
        with pytest.raises(RuntimeError, match="PDF output missing"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )

    def test_zero_byte_output_fails(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(monkeypatch, tmp_path, chromium_writes=b"")
        with pytest.raises(RuntimeError, match="PDF output invalid"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )

    def test_non_pdf_output_fails(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(monkeypatch, tmp_path, chromium_writes=b"<html>not a pdf</html>")
        with pytest.raises(RuntimeError, match="PDF output invalid"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )

    def test_output_name_and_return(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(monkeypatch, tmp_path)
        out = export_summary_pdf(
            _pack({"lezione.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        assert out == tmp_path / "lezione.pdf"
        assert out.is_file()
        assert out.read_bytes().startswith(b"%PDF-")


# ── Offline semantics ─────────────────────────────────────────────────


class TestOfflineSemantics:
    def test_html_carries_csp_and_print_css(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        html = browser_pdf._build_print_html(
            "<html><head><title>T</title></head><body><p>hi</p></body></html>", title="T"
        )
        assert "Content-Security-Policy" in html
        assert "default-src 'none'" in html
        assert "<script" not in html
        assert "@page" in html
        assert "A4" in html

    def test_csp_survives_full_pipeline(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        seen: list[str] = []

        def fake_run(argv: Any, **kwargs: Any) -> _FakeCompleted:
            exe = str(argv[0])
            if exe == "/usr/bin/pandoc":
                return _FakeCompleted(0, "<html><head></head><body><p>x</p></body></html>", "")
            html_path = str(argv[-1])
            seen.append(Path(html_path).read_text(encoding="utf-8"))
            Path(str([a for a in argv if str(a).startswith("--print-to-pdf=")][0]).split("=", 1)[1]).write_bytes(
                b"%PDF-1.4\n%EOF\n"
            )
            return _FakeCompleted(0, "", "")

        monkeypatch.setattr(browser_pdf.subprocess, "run", fake_run)
        export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable="/usr/bin/pandoc", chromium_executable="/usr/bin/chromium",
        )
        assert len(seen) == 1
        assert "Content-Security-Policy" in seen[0]
        assert "@page" in seen[0]
