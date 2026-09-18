"""Browser PDF export: single-lesson SummaryPack markdown -> local PDF.

Provisional Founder Beta renderer (D2-J3C). Offline pipeline, no new
document model, no LLM, no network:

    SummaryPack.files{<lesson>.md}
      -> Pandoc standalone HTML5 + MathML (stdin, argv, no shell)
      -> minimal print CSS + offline CSP injected into <head>
      -> headless Chromium --print-to-pdf (local file input)
      -> <lesson>.pdf validated (exists, non-empty, %PDF- magic)

The summarizer knows nothing about this module (dependency direction:
SummaryPack -> adapter -> external executables). The caller owns the
decision to invoke it: nothing here wires PDF generation into ingest,
summary, scripts, or Studio flows. Human review stays before export.

Error semantics (fail-closed, never None):
    ValueError         bad SummaryPack input / remote fetch vectors
    FileNotFoundError  pandoc or chromium executable unavailable
    RuntimeError       pandoc/chromium failure or invalid PDF output
"""

from __future__ import annotations

import os
import re
import shutil
import subprocess
from pathlib import Path, PurePosixPath

from lessonos.summarizer import SummaryPack

PANDOC_TIMEOUT = 60
CHROMIUM_TIMEOUT = 120
_STDERR_LIMIT = 2000

_PRINT_CSS = """@page { size: A4; margin: 20mm 16mm; }
body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.5; color: #111; }
h1, h2, h3 { page-break-after: avoid; }
pre, tr, img, svg, table { page-break-inside: avoid; }
pre { background: #f6f6f6; padding: 8px; overflow-x: auto; }
code { font-size: 0.92em; }
table { border-collapse: collapse; max-width: 100%; }
th, td { border: 1px solid #999; padding: 4px 8px; text-align: left; }
"""

_CSP = (
    "default-src 'none'; script-src 'none'; connect-src 'none'; "
    "style-src 'unsafe-inline'; img-src data: file:; font-src data: file:;"
)

_REMOTE_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(\s*https?://", re.IGNORECASE)
_RAW_FETCH_TAG_RE = re.compile(
    r"<\s*(script|link|iframe|embed|object|img|form|video|audio|source)\b",
    re.IGNORECASE,
)


# ── Public API ────────────────────────────────────────────────────────


def export_summary_pdf(
    pack: SummaryPack,
    output_dir: str | Path,
    *,
    pandoc_executable: str | None = None,
    chromium_executable: str | None = None,
) -> Path:
    """Render one single-lesson SummaryPack markdown to a local PDF file.

    Args:
        pack: Existing SummaryPack. Must contain exactly one ``.md`` file
            with a safe relative path (no absolute paths, no ``..``).
        output_dir: Caller-provided directory; ``<lesson>.pdf`` (and the
            intermediate ``<lesson>.html``) are written here.
        pandoc_executable: Explicit pandoc path (tests). When None,
            resolved via ``shutil.which("pandoc")``.
        chromium_executable: Explicit Chromium path (tests). When None,
            resolved via :func:`_discover_chromium`.

    Returns:
        Path to the written, validated PDF (exists, non-empty, ``%PDF-``).

    Raises:
        ValueError: Input contract violated (zero/multiple markdown
            files, unsafe path) or the markdown carries remote fetch
            vectors (remote images, script/link/iframe/... tags).
        FileNotFoundError: Pandoc or Chromium executable unavailable.
        RuntimeError: Pandoc/Chromium timeout or non-zero exit, missing
            or invalid PDF output.
    """
    name, markdown = _select_lesson_markdown(pack)
    _reject_remote_resources(markdown)

    pandoc = pandoc_executable or shutil.which("pandoc")
    if not pandoc:
        raise FileNotFoundError(
            "Pandoc executable unavailable: install pandoc or pass "
            "pandoc_executable=... (no download is attempted)"
        )
    chromium = chromium_executable or _discover_chromium()
    if not chromium:
        raise FileNotFoundError(
            "Chromium executable unavailable: set ARDESIA_CHROMIUM=... or "
            "pass chromium_executable=... (no download is attempted)"
        )

    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = PurePosixPath(name).stem
    html_path = out_dir / f"{stem}.html"
    pdf_path = out_dir / f"{stem}.pdf"

    html = _run_pandoc(pandoc, markdown)
    html_path.write_text(_build_print_html(html, title=stem), encoding="utf-8")
    _run_chromium(chromium, html_path, pdf_path)
    return _validate_pdf(pdf_path)


# ── Input contract ────────────────────────────────────────────────────


def _select_lesson_markdown(pack: SummaryPack) -> tuple[str, str]:
    """Pick the single lesson markdown from a SummaryPack (fail-closed)."""
    candidates = sorted(p for p in pack.files if p.endswith(".md"))
    if len(candidates) != 1:
        raise ValueError(
            f"browser PDF needs exactly one lesson .md, found {len(candidates)}: "
            f"{candidates} — refusing to guess"
        )
    name = candidates[0]
    parts = PurePosixPath(name).parts
    if PurePosixPath(name).is_absolute() or ".." in parts:
        raise ValueError(f"unsafe lesson path refused: {name!r}")
    return name, pack.files[name]


def _reject_remote_resources(markdown: str) -> None:
    """Refuse markdown that could fetch remote content while rendering.

    Plain textual links (``[text](https://...)``) are allowed: they do not
    trigger fetches during print. Remote images and raw fetch tags are not.
    """
    if _REMOTE_IMAGE_RE.search(markdown):
        raise ValueError("remote image URL refused: rendering must stay offline")
    match = _RAW_FETCH_TAG_RE.search(markdown)
    if match:
        raise ValueError(
            f"raw <{match.group(1).lower()}> tag refused: rendering must stay offline"
        )


# ── Runtime discovery ─────────────────────────────────────────────────


def _discover_chromium() -> str | None:
    """Bounded local Chromium discovery (provisional, Founder Beta).

    Order: explicit ``ARDESIA_CHROMIUM`` env override, then preinstalled
    ms-playwright ``chromium_headless_shell-*`` builds (newest first),
    then the Google Chrome app bundle. Never downloads, never manages
    browsers. Returns None when nothing on disk can be proven.
    """
    override = os.environ.get("ARDESIA_CHROMIUM", "").strip()
    if override and Path(override).is_file():
        return override
    base = Path.home() / "Library" / "Caches" / "ms-playwright"
    try:
        entries = sorted(
            (p for p in base.iterdir()
             if p.is_dir() and p.name.startswith("chromium_headless_shell")),
            key=lambda p: p.name,
            reverse=True,
        )
    except OSError:
        entries = []
    for entry in entries:
        candidate = entry / "chrome-headless-shell-mac-arm64" / "chrome-headless-shell"
        if candidate.is_file():
            return str(candidate)
    app = Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
    if app.is_file():
        return str(app)
    return None


# ── Stages ────────────────────────────────────────────────────────────


def _as_text(data: bytes | str) -> str:
    """Decode subprocess output whether bytes (real run) or str (doubles)."""
    if isinstance(data, bytes):
        return data.decode("utf-8", errors="replace")
    return data


def _run_pandoc(pandoc: str, markdown: str) -> str:
    """Markdown -> standalone HTML5+MathML via Pandoc stdin (argv, no shell)."""
    argv = [pandoc, "-s", "--mathml", "-f", "markdown", "-t", "html5"]
    try:
        result = subprocess.run(
            argv,
            input=markdown.encode("utf-8"),
            capture_output=True,
            timeout=PANDOC_TIMEOUT,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(f"Pandoc timed out after {PANDOC_TIMEOUT}s") from exc
    except (FileNotFoundError, OSError) as exc:
        raise FileNotFoundError(f"Pandoc executable unavailable: {pandoc}") from exc
    if result.returncode != 0:
        raise RuntimeError(
            f"Pandoc exited {result.returncode}: "
            f"{_as_text(result.stderr)[:_STDERR_LIMIT]}"
        )
    return _as_text(result.stdout)


def _build_print_html(pandoc_html: str, *, title: str) -> str:
    """Inject minimal print CSS + offline CSP into Pandoc standalone HTML."""
    injection = (
        '<meta http-equiv="Content-Security-Policy" '
        f'content="{_CSP}" />\n<style>\n{_PRINT_CSS}</style>'
    )
    if "</head>" not in pandoc_html:
        raise RuntimeError("Pandoc output has no <head>: refusing to ship unstyled HTML")
    return pandoc_html.replace("</head>", injection + "\n</head>", 1)


def _run_chromium(chromium: str, html_path: Path, pdf_path: Path) -> None:
    """Print a local HTML file to PDF (argv, no shell, local input only)."""
    argv = [
        chromium,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        str(html_path),
    ]
    try:
        result = subprocess.run(
            argv,
            capture_output=True,
            text=True,
            timeout=CHROMIUM_TIMEOUT,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(f"Chromium timed out after {CHROMIUM_TIMEOUT}s") from exc
    except (FileNotFoundError, OSError) as exc:
        raise FileNotFoundError(f"Chromium executable unavailable: {chromium}") from exc
    if result.returncode != 0:
        raise RuntimeError(
            f"Chromium exited {result.returncode}: {_as_text(result.stderr)[:_STDERR_LIMIT]}"
        )


def _validate_pdf(pdf_path: Path) -> Path:
    """Postcondition: a 0 exit is not enough — prove the artifact is a PDF."""
    if not pdf_path.is_file():
        raise RuntimeError(f"PDF output missing: {pdf_path}")
    data = pdf_path.read_bytes()
    if not data or not data.startswith(b"%PDF-"):
        raise RuntimeError(
            f"PDF output invalid (missing %PDF- magic): {pdf_path} "
            f"({len(data)} bytes)"
        )
    return pdf_path
