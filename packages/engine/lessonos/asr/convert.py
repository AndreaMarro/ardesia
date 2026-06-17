"""ffmpeg-based audio conversion — m4a/mp3/ogg → 16kHz mono WAV.

Runs ffmpeg as a subprocess. Expects ffmpeg in PATH or at
/opt/homebrew/bin/ffmpeg (Mac Mini default).
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path
from typing import Optional


def _find_ffmpeg() -> str:
    """Locate the ffmpeg binary. Tries common paths first, then PATH."""
    candidates = [
        "/opt/homebrew/bin/ffmpeg",
        "/usr/local/bin/ffmpeg",
        "/usr/bin/ffmpeg",
    ]
    for c in candidates:
        if os.path.isfile(c):
            return c
    # fallback to PATH
    return "ffmpeg"


def convert_to_wav(
    input_path: str,
    output_dir: str,
    *,
    sample_rate: int = 16000,
    channels: int = 1,
    ffmpeg_path: Optional[str] = None,
) -> str:
    """Convert an audio file to 16kHz mono WAV using ffmpeg.

    Args:
        input_path: Path to input audio (m4a, mp3, ogg, wav, etc.).
        output_dir: Directory to write the output WAV file.
        sample_rate: Target sample rate in Hz (default 16000).
        channels: Number of output channels (default 1 for mono).
        ffmpeg_path: Explicit path to ffmpeg (auto-detect if None).

    Returns:
        Absolute path to the output WAV file.

    Raises:
        FileNotFoundError: If input_path does not exist.
        RuntimeError: If ffmpeg subprocess fails.
    """
    inp = Path(input_path)
    if not inp.exists():
        raise FileNotFoundError(f"Input audio not found: {input_path}")

    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    stem = inp.stem
    # Replace spaces with underscores for filesystem safety
    safe_stem = stem.replace(" ", "_").replace("(", "").replace(")", "")
    out_path = out_dir / f"{safe_stem}_16k_mono.wav"

    if out_path.exists():
        # Already converted — skip
        return str(out_path.resolve())

    ffmpeg = ffmpeg_path or _find_ffmpeg()

    cmd = [
        ffmpeg,
        "-y",  # overwrite output
        "-i", str(inp.resolve()),
        "-ar", str(sample_rate),
        "-ac", str(channels),
        "-sample_fmt", "s16",
        str(out_path.resolve()),
    ]

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=300,
    )
    if result.returncode != 0:
        # Clean up any partial output file created by ffmpeg
        if out_path.exists():
            out_path.unlink(missing_ok=True)
        raise RuntimeError(
            f"ffmpeg failed (exit={result.returncode}): {result.stderr.strip()}"
        )

    return str(out_path.resolve())
