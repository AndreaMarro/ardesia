"""Arduino compiler — wraps arduino-cli for local code compilation.

Flow: write sketch to temp dir -> arduino-cli compile -> parse output -> return hex/errors.
Uses asyncio.create_subprocess_exec (NOT shell) to prevent command injection.
"""
import asyncio
import base64
import re
import shutil
import tempfile
from pathlib import Path
from typing import Optional

from config import COMPILE_TIMEOUT

# Default board FQBN
DEFAULT_BOARD = "arduino:avr:nano:cpu=atmega328"

# Check arduino-cli availability
_ARDUINO_CLI: Optional[str] = shutil.which("arduino-cli")


def is_available() -> bool:
    """Check if arduino-cli is installed and in PATH."""
    return _ARDUINO_CLI is not None


async def compile_code(
    code: str,
    board: str = DEFAULT_BOARD,
) -> dict:
    """Compile Arduino code and return results.

    Args:
        code: Arduino C++ source code
        board: FQBN string (e.g. "arduino:avr:nano:cpu=atmega328")

    Returns:
        {
            "success": bool,
            "hex": str|None,       # base64-encoded .hex file
            "output": str,         # compiler stdout
            "errors": list[str],   # parsed error messages
            "warnings": list[str], # parsed warnings
        }
    """
    if not is_available():
        return {
            "success": False,
            "hex": None,
            "output": "",
            "errors": ["arduino-cli non trovato. Installa con: brew install arduino-cli"],
            "warnings": [],
        }

    # Validate board FQBN format (alphanumeric + colons + equals)
    if not re.match(r'^[a-zA-Z0-9:=._-]+$', board):
        return {
            "success": False,
            "hex": None,
            "output": "",
            "errors": ["FQBN non valido"],
            "warnings": [],
        }

    # Create temp directory with sketch
    tmp_dir = Path(tempfile.mkdtemp(prefix="elab-compile-"))
    sketch_dir = tmp_dir / "sketch"
    sketch_dir.mkdir()
    sketch_file = sketch_dir / "sketch.ino"
    sketch_file.write_text(code, encoding="utf-8")

    try:
        # Run arduino-cli compile via create_subprocess_exec (no shell injection)
        proc = await asyncio.create_subprocess_exec(
            _ARDUINO_CLI, "compile",
            "--fqbn", board,
            "--output-dir", str(tmp_dir / "build"),
            str(sketch_dir),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout, stderr = await asyncio.wait_for(
                proc.communicate(), timeout=COMPILE_TIMEOUT
            )
        except asyncio.TimeoutError:
            proc.kill()
            return {
                "success": False,
                "hex": None,
                "output": "",
                "errors": [f"Compilazione timeout dopo {COMPILE_TIMEOUT}s"],
                "warnings": [],
            }

        stdout_text = stdout.decode("utf-8", errors="replace")
        stderr_text = stderr.decode("utf-8", errors="replace")
        combined = stdout_text + "\n" + stderr_text

        # Parse errors and warnings
        errors = _parse_errors(combined)
        warnings = _parse_warnings(combined)

        if proc.returncode == 0:
            # Find .hex file
            hex_data = None
            build_dir = tmp_dir / "build"
            for hex_file in build_dir.glob("*.hex"):
                hex_bytes = hex_file.read_bytes()
                hex_data = base64.b64encode(hex_bytes).decode("ascii")
                break

            return {
                "success": True,
                "hex": hex_data,
                "output": combined.strip(),
                "errors": [],
                "warnings": warnings,
            }
        else:
            return {
                "success": False,
                "hex": None,
                "output": combined.strip(),
                "errors": errors or [combined.strip()[:500]],
                "warnings": warnings,
            }

    finally:
        # Cleanup temp dir
        shutil.rmtree(tmp_dir, ignore_errors=True)


def _parse_errors(output: str) -> list:
    """Extract error messages from compiler output."""
    errors = []
    for line in output.split("\n"):
        if ": error:" in line.lower() or "error:" in line.lower():
            cleaned = re.sub(r'/tmp/elab-compile-[^/]+/sketch/', '', line)
            errors.append(cleaned.strip())
    return errors


def _parse_warnings(output: str) -> list:
    """Extract warning messages from compiler output."""
    warnings = []
    for line in output.split("\n"):
        if ": warning:" in line.lower() or "warning:" in line.lower():
            cleaned = re.sub(r'/tmp/elab-compile-[^/]+/sketch/', '', line)
            warnings.append(cleaned.strip())
    return warnings
