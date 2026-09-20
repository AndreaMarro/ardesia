"""Tests for lessonos/export/browser_pdf — D2-J3C hardening (H0).

Provisional local-first adapter: existing single-lesson SummaryPack
markdown -> Pandoc AST validation -> Pandoc standalone HTML/MathML ->
headless Chromium (private profile) -> staged candidate -> validated
publish (os.replace, previous PDF untouched on failure).

No real Pandoc/Chromium/pdfinfo in CI: subprocess is faked. The fake
Chromium writes real b"%PDF-..." bytes so the artifact-validation
branch is genuinely exercised, never assumed.
"""

from __future__ import annotations

import json
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

CLEAN_AST = {
    "pandoc-api-version": [1, 23],
    "meta": {},
    "blocks": [{"t": "Para", "c": [{"t": "Str", "c": "hi"}]}],
}

FULL_PDF = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n%%EOF\n"


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
    stage1_ast: str = "",
    stage2_html: str = "<html><head></head><body></body></html>",
    pandoc_stderr: str = "",
    pandoc_raise: BaseException | None = None,
    chromium_rc: int = 0,
    chromium_stderr: str = "",
    chromium_raise: BaseException | None = None,
    chromium_writes: bytes | None = FULL_PDF,
    pdfinfo_pages: int | None = 1,
    pdfinfo_rc: int = 0,
    pandoc: str = "/usr/bin/pandoc",
    chromium: str = "/usr/bin/chromium",
    pdfinfo: str | None = "/usr/bin/pdfinfo",
) -> dict[str, Any]:
    """Fake subprocess.run: two-stage pandoc, chromium bytes, pdfinfo pages.

    Records every call (argv, kwargs, input) for exact-argv assertions.
    """
    calls: list[dict[str, Any]] = []
    ast_text = stage1_ast or json.dumps(CLEAN_AST)

    def fake_run(argv: Any, **kwargs: Any) -> _FakeCompleted:
        assert "shell" not in kwargs or kwargs["shell"] is False
        calls.append({"argv": list(argv), "kwargs": kwargs, "input": kwargs.get("input")})
        exe = str(argv[0])
        if exe == pandoc:
            if pandoc_raise is not None:
                raise pandoc_raise
            if pandoc_rc != 0:
                return _FakeCompleted(pandoc_rc, "", pandoc_stderr)
            if "-t" in argv and argv[argv.index("-t") + 1] == "json":
                return _FakeCompleted(0, ast_text, "")
            return _FakeCompleted(0, stage2_html, "")
        if exe == chromium:
            if chromium_raise is not None:
                raise chromium_raise
            if chromium_rc == 0 and chromium_writes is not None:
                out = next(a.split("=", 1)[1] for a in argv if str(a).startswith("--print-to-pdf="))
                Path(out).write_bytes(chromium_writes)
            return _FakeCompleted(chromium_rc, "", chromium_stderr)
        if pdfinfo is not None and exe == pdfinfo:
            if pdfinfo_rc != 0:
                return _FakeCompleted(pdfinfo_rc, "", "pdfinfo boom")
            return _FakeCompleted(0, f"Title: x\nPages: {pdfinfo_pages}\n", "")
        raise AssertionError(f"unexpected executable: {exe}")

    def fake_which(name: str) -> str | None:
        if name == "pandoc":
            return pandoc
        if name == "pdfinfo":
            return pdfinfo
        return None

    monkeypatch.setattr(browser_pdf.subprocess, "run", fake_run)
    monkeypatch.setattr(browser_pdf.shutil, "which", fake_which)
    monkeypatch.delenv("ARDESIA_CHROMIUM", raising=False)
    return {"calls": calls, "pandoc": pandoc, "chromium": chromium, "pdfinfo": pdfinfo}


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
        rec = _install_fakes(
            monkeypatch, tmp_path, stage1_ast=_ast_doc(_image_block("https://example.com/a.png")))
        with pytest.raises(ValueError):
            export_summary_pdf(_pack({"l.md": "# T\n\n![x](https://example.com/a.png)\n"}), str(tmp_path),
                               pandoc_executable=rec["pandoc"],
                               chromium_executable=rec["chromium"])

    def test_script_tag_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        raw = [{"t": "RawBlock", "c": ["html", "<script>alert(1)</script>"]}]
        rec = _install_fakes(monkeypatch, tmp_path, stage1_ast=_ast_doc(raw))
        with pytest.raises(ValueError):
            export_summary_pdf(_pack({"l.md": "# T\n\n<script>alert(1)</script>\n"}), str(tmp_path),
                               pandoc_executable=rec["pandoc"],
                               chromium_executable=rec["chromium"])

    def test_iframe_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        raw = [{"t": "RawBlock", "c": ["html", '<iframe src="https://example.com"></iframe>']}]
        rec = _install_fakes(monkeypatch, tmp_path, stage1_ast=_ast_doc(raw))
        with pytest.raises(ValueError):
            export_summary_pdf(_pack({"l.md": '# T\n\n<iframe src="https://example.com"></iframe>\n'}),
                               str(tmp_path),
                               pandoc_executable=rec["pandoc"],
                               chromium_executable=rec["chromium"])

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

    def test_chrome_app_fallback(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        monkeypatch.setattr(Path, "home", lambda: tmp_path)
        monkeypatch.delenv("ARDESIA_CHROMIUM", raising=False)
        monkeypatch.setattr(
            browser_pdf.Path, "is_file",
            lambda self: str(self).endswith("Google Chrome"))
        assert browser_pdf._discover_chromium() == \
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

    def test_malformed_ast_json_rejected(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        rec = _install_fakes(monkeypatch, tmp_path, stage1_ast="not json{")
        with pytest.raises(RuntimeError, match="not JSON"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )


# ── Pandoc two-stage (validate AST, then render it) ───────────────────


def _pandoc_calls(rec: dict) -> list[dict]:
    return [c for c in rec["calls"] if c["argv"][0] == rec["pandoc"]]


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

    def test_pandoc_argv_exact_two_stages(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        rec = _install_fakes(monkeypatch, tmp_path)
        _chromium_only(monkeypatch, rec["chromium"])
        export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        calls = _pandoc_calls(rec)
        assert len(calls) == 2
        assert calls[0]["argv"] == [rec["pandoc"], "-f", "markdown", "-t", "json"]
        assert calls[1]["argv"] == [
            rec["pandoc"], "-f", "json", "-t", "html5", "-s", "--mathml",
        ]

    def test_markdown_reaches_stage1_byte_for_byte(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        rec = _install_fakes(monkeypatch, tmp_path)
        _chromium_only(monkeypatch, rec["chromium"])
        export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        assert _pandoc_calls(rec)[0]["input"] == MD.encode("utf-8")

    def test_stage2_consumes_validated_ast_not_raw_markdown(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        rec = _install_fakes(monkeypatch, tmp_path)
        _chromium_only(monkeypatch, rec["chromium"])
        export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        stage2_input = _pandoc_calls(rec)[1]["input"]
        assert json.loads(stage2_input.decode("utf-8")) == CLEAN_AST

    def test_mathml_mode_in_render_command(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        rec = _install_fakes(monkeypatch, tmp_path)
        _chromium_only(monkeypatch, rec["chromium"])
        export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        assert "--mathml" in _pandoc_calls(rec)[1]["argv"]


# ── AST resource policy ───────────────────────────────────────────────
# The fakes stand in for pandoc: each hostile AST below is what pandoc
# really produces from the quoted markdown (re-verified in real smoke).


def _ast_doc(blocks: list, meta: dict | None = None) -> str:
    return json.dumps({"pandoc-api-version": [1, 23], "meta": meta or {}, "blocks": blocks})


def _image_block(target: str) -> list:
    return [{"t": "Para", "c": [{"t": "Image",
                                 "c": [["", [], []], [{"t": "Str", "c": "x"}],
                                       [target, ""]]}]}]


class TestAstResourcePolicy:
    def test_reference_image_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        md = "# T\n\n![x][id]\n\n[id]: https://example.com/a.png\n"
        rec = _install_fakes(
            monkeypatch, tmp_path, stage1_ast=_ast_doc(_image_block("https://example.com/a.png")))
        with pytest.raises(ValueError, match="[Rr]emote|image"):
            export_summary_pdf(
                _pack({"l.md": md}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )
        assert len(_pandoc_calls(rec)) == 1

    def test_protocol_relative_image_rejected(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        rec = _install_fakes(
            monkeypatch, tmp_path, stage1_ast=_ast_doc(_image_block("//example.com/a.png")))
        with pytest.raises(ValueError, match="[Rr]emote|image"):
            export_summary_pdf(
                _pack({"l.md": "# T\n\n![](//example.com/a.png)\n"}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )

    def test_file_uri_image_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(
            monkeypatch, tmp_path, stage1_ast=_ast_doc(_image_block("file:///etc/passwd")))
        with pytest.raises(ValueError, match="image|file"):
            export_summary_pdf(
                _pack({"l.md": "# T\n\n![](file:///etc/passwd)\n"}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )

    def test_relative_image_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(
            monkeypatch, tmp_path, stage1_ast=_ast_doc(_image_block("fig/a.png")))
        with pytest.raises(ValueError, match="[Ii]mage"):
            export_summary_pdf(
                _pack({"l.md": "# T\n\n![](fig/a.png)\n"}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )

    def test_data_image_allowed(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(
            monkeypatch, tmp_path, stage1_ast=_ast_doc(_image_block("data:image/png;base64,iVBOR")))
        out = export_summary_pdf(
            _pack({"l.md": "# T\n\n![](data:image/png;base64,iVBOR)\n"}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        assert out.is_file()

    def test_raw_script_block_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        raw = [{"t": "RawBlock", "c": ["html", "<script>alert(1)</script>"]}]
        rec = _install_fakes(monkeypatch, tmp_path, stage1_ast=_ast_doc(raw))
        with pytest.raises(ValueError, match="[Rr]aw|active"):
            export_summary_pdf(
                _pack({"l.md": "# T\n\n<script>alert(1)</script>\n"}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )
        assert len(_pandoc_calls(rec)) == 1

    def test_raw_iframe_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        raw = [{"t": "RawBlock", "c": ["html", '<iframe src="https://example.com"></iframe>']}]
        rec = _install_fakes(monkeypatch, tmp_path, stage1_ast=_ast_doc(raw))
        with pytest.raises(ValueError, match="[Rr]aw|active"):
            export_summary_pdf(
                _pack({"l.md": '# T\n\n<iframe src="https://example.com"></iframe>\n'}),
                str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )

    def test_header_includes_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        meta = {"header-includes": {"t": "MetaInlines", "c": [{"t": "Str", "c": "x"}]}}
        rec = _install_fakes(monkeypatch, tmp_path, stage1_ast=_ast_doc([], meta=meta))
        with pytest.raises(ValueError, match="[Mm]etadata|header-includes"):
            export_summary_pdf(
                _pack({"l.md": "---\nheader-includes: <script>x</script>\n---\n# T\n"}),
                str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )

    def test_css_metadata_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        # Real pandoc AST for "---\ncss: https://example.invalid/ardesia.css\n---\n# Test":
        # standalone HTML would emit <link rel="stylesheet" href="..."> BEFORE
        # the CSP meta. No network is fetched in this test; the acceptance
        # itself is the defect.
        hostile = {
            "pandoc-api-version": [1, 23, 1, 1],
            "meta": {"css": {"t": "MetaInlines",
                             "c": [{"t": "Str", "c": "https://example.invalid/ardesia.css"}]}},
            "blocks": [
                {"t": "Header", "c": [1, ["test", [], []],
                                      [{"t": "Str", "c": "Test"}]]},
                {"t": "Para", "c": [{"t": "Str", "c": "Text."}]},
            ],
        }
        rec = _install_fakes(monkeypatch, tmp_path, stage1_ast=json.dumps(hostile))
        with pytest.raises(ValueError, match="[Mm]etadata|css"):
            export_summary_pdf(
                _pack({"l.md": "---\ncss: https://example.invalid/ardesia.css\n---\n# Test\n"}),
                str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )
        assert len(_pandoc_calls(rec)) == 1

    def test_empty_metadata_accepted(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        # Positive control: an ordinary SummaryPack-shaped AST (no YAML front
        # matter, hence empty meta) keeps converting.
        blocks = [
            {"t": "Header", "c": [1, ["riepilogo", [], []], [{"t": "Str", "c": "Riepilogo"}]]},
            {"t": "Para", "c": [
                {"t": "Str", "c": "testo"},
                {"t": "Space"},
                {"t": "Math", "c": [{"t": "InlineMath", "c": "x^2"}]},
                {"t": "Space"},
                {"t": "Link", "c": [["", [], []], [{"t": "Str", "c": "m"}],
                                    ["https://example.com/p", ""]]},
            ]},
        ]
        rec = _install_fakes(monkeypatch, tmp_path, stage1_ast=_ast_doc(blocks))
        out = export_summary_pdf(
            _pack({"l.md": "# Riepilogo\n\ntesto $x^2$ [m](https://example.com/p)\n"}),
            str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        assert out.is_file()
        assert len(_pandoc_calls(rec)) == 2

    def test_fenced_code_stays_inert_text(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        code = [{"t": "CodeBlock",
                 "c": [["", ["html"], []], "<script>alert(1)</script>"]}]
        rec = _install_fakes(monkeypatch, tmp_path, stage1_ast=_ast_doc(code))
        out = export_summary_pdf(
            _pack({"l.md": "# T\n\n```html\n<script>alert(1)</script>\n```\n"}),
            str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        assert out.is_file()
        assert len(_pandoc_calls(rec)) == 2

    def test_allowed_material_converts(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        blocks = [
            {"t": "Header", "c": [1, ["", [], []], [{"t": "Str", "c": "T"}]]},
            {"t": "BulletList", "c": [[{"t": "Plain", "c": [{"t": "Str", "c": "a"}]}]]},
            {"t": "Para", "c": [
                {"t": "Link", "c": [["", [], []], [{"t": "Str", "c": "m"}],
                                    ["https://example.com/p", ""]]},
                {"t": "Math", "c": [{"t": "InlineMath", "c": "x^2"}]},
            ]},
        ]
        rec = _install_fakes(monkeypatch, tmp_path, stage1_ast=_ast_doc(blocks))
        out = export_summary_pdf(
            _pack({"l.md": "# T\n\n- a\n\n[m](https://example.com/p) $x^2$\n"}),
            str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        assert out.is_file()


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
        out = export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        chrom_calls = [c for c in rec["calls"] if c["argv"][0] == rec["chromium"]]
        assert len(chrom_calls) == 1
        argv = chrom_calls[0]["argv"]
        assert argv[:4] == [rec["chromium"], "--headless", "--disable-gpu", "--no-pdf-header-footer"]
        pdf_arg = next(a for a in argv if a.startswith("--print-to-pdf="))
        staged_pdf = Path(pdf_arg.split("=", 1)[1])
        assert staged_pdf.parent.parent == tmp_path
        assert staged_pdf.name == "candidate.pdf"
        assert out == tmp_path / "l.pdf"
        profile_arg = next(a for a in argv if a.startswith("--user-data-dir="))
        assert Path(profile_arg.split("=", 1)[1]).parent.parent == tmp_path
        assert "shell" not in chrom_calls[0]["kwargs"]
        assert argv[-1].endswith(".html")


# ── Publish policy: only the validated candidate is published ─────────


class TestPublishPolicy:
    def test_stale_pdf_not_returned_as_new_export(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        old = tmp_path / "l.pdf"
        old.write_bytes(FULL_PDF)
        before = old.read_bytes()
        rec = _install_fakes(monkeypatch, tmp_path, chromium_writes=None)
        with pytest.raises(RuntimeError, match="PDF output missing"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )
        assert old.read_bytes() == before

    def test_partial_write_failure_keeps_previous_bytes(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        old = tmp_path / "l.pdf"
        old.write_bytes(FULL_PDF)
        rec = _install_fakes(
            monkeypatch, tmp_path, chromium_rc=1,
            chromium_writes=b"%PDF-truncated", chromium_stderr="crash")
        with pytest.raises(RuntimeError, match="Chromium exited 1"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )
        assert old.read_bytes() == FULL_PDF

    def test_magic_only_output_rejected(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        rec = _install_fakes(monkeypatch, tmp_path, chromium_writes=b"%PDF-1.4\n")
        with pytest.raises(RuntimeError, match="PDF output invalid"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )
        assert not (tmp_path / "l.pdf").exists()

    def test_symlink_output_dir_rejected(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        real = tmp_path / "real"
        real.mkdir()
        link = tmp_path / "link"
        link.symlink_to(real, target_is_directory=True)
        rec = _install_fakes(monkeypatch, tmp_path)
        with pytest.raises(ValueError, match="[Ss]ymlink"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(link),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )

    def test_nested_name_rejected_not_flattened(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        rec = _install_fakes(monkeypatch, tmp_path)
        with pytest.raises(ValueError, match="[Nn]ested|simple"):
            export_summary_pdf(
                _pack({"sub/l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )
        assert not (tmp_path / "l.pdf").exists()

    def test_two_attempts_do_not_collide(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        rec = _install_fakes(monkeypatch, tmp_path)
        first = export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        second = export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        assert first == second == tmp_path / "l.pdf"
        assert second.read_bytes() == FULL_PDF


# ── pdfinfo parse gate ────────────────────────────────────────────────


class TestPdfInfoGate:
    def test_zero_pages_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(monkeypatch, tmp_path, pdfinfo_pages=0)
        with pytest.raises(RuntimeError, match="[Pp]ages|page"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )
        assert not (tmp_path / "l.pdf").exists()

    def test_pdfinfo_failure_rejected(self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
        rec = _install_fakes(monkeypatch, tmp_path, pdfinfo_rc=1)
        with pytest.raises(RuntimeError, match="pdfinfo"):
            export_summary_pdf(
                _pack({"l.md": MD}), str(tmp_path),
                pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
            )

    def test_missing_pdfinfo_leaves_gate_open_but_documented(
        self, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        rec = _install_fakes(monkeypatch, tmp_path, pdfinfo=None)
        out = export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable=rec["pandoc"], chromium_executable=rec["chromium"],
        )
        assert out.is_file()
        assert not [c for c in rec["calls"] if "pdfinfo" in str(c["argv"][0])]


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
        assert b"%%EOF" in out.read_bytes()


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
        assert "img-src data:;" in html
        assert "file:" not in html.split("Content-Security-Policy")[1].split("/>")[0]
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
                if argv[argv.index("-t") + 1] == "json":
                    return _FakeCompleted(0, json.dumps(CLEAN_AST), "")
                return _FakeCompleted(0, "<html><head></head><body><p>x</p></body></html>", "")
            if exe == "/usr/bin/pdfinfo":
                return _FakeCompleted(0, "Pages: 1\n", "")
            html_path = str(argv[-1])
            seen.append(Path(html_path).read_text(encoding="utf-8"))
            Path(str([a for a in argv if str(a).startswith("--print-to-pdf=")][0]).split("=", 1)[1]).write_bytes(
                FULL_PDF
            )
            return _FakeCompleted(0, "", "")

        monkeypatch.setattr(browser_pdf.subprocess, "run", fake_run)
        monkeypatch.setattr(browser_pdf.shutil, "which",
                            lambda name: {"pandoc": "/usr/bin/pandoc",
                                          "pdfinfo": "/usr/bin/pdfinfo"}.get(name))
        export_summary_pdf(
            _pack({"l.md": MD}), str(tmp_path),
            pandoc_executable="/usr/bin/pandoc", chromium_executable="/usr/bin/chromium",
        )
        assert len(seen) == 1
        assert "Content-Security-Policy" in seen[0]
        assert "@page" in seen[0]
