"""
ELAB UNLIM TTS Server v2 — Coqui XTTS-v2 with selected default speaker
Sprint S iter 1 close — 2026-04-26

Voice profile UNLIM (chosen 2026-04-26):
- Default: "Tammy Grit" (XTTS-v2 built-in studio speaker)
  - Female, mid-range tone, gentle, calm-warm without over-enthusiasm
  - Matches PRINCIPIO ZERO: warmth + clarity + Italian classroom appropriate
- Fallback: speaker_wav voice clone (when Andrea WhatsApp video provided → /workspace/speaker_default.wav)

Two modes:
1. Built-in (DEFAULT): pass speaker name e.g. "Tammy Grit"
2. Voice clone: pass speaker_wav path

Per request, mode auto-detected:
- If req.speaker_wav points to existing file with size > 10KB → clone mode
- Else → built-in speaker

Usage from Edge Function (production):
  POST /tts {"text": "Ragazzi, cominciamo con il LED", "language": "it"}
  → Tammy Grit voice (default)

  POST /tts {"text": "...", "language": "it", "use_clone": true}
  → speaker_default.wav voice clone (when available)
"""
import os
os.environ["COQUI_TOS_AGREED"] = "1"
os.environ["XDG_DATA_HOME"] = "/workspace/.local-share"

from fastapi import FastAPI
from fastapi.responses import Response
from pydantic import BaseModel
from TTS.api import TTS
import uvicorn, io, soundfile as sf
from pathlib import Path

# UNLIM voice profile chosen
DEFAULT_SPEAKER = "Tammy Grit"  # gentle female, mid-tone, calm-warm IT acceptable
SPEAKER_CLONE_PATH = "/workspace/speaker_default.wav"

app = FastAPI(title="ELAB UNLIM TTS Server", version="0.2-tammy-grit")
tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=True)

# Available built-in speakers (subset)
BUILTIN_SPEAKERS = [
    "Tammy Grit",           # ← UNLIM default (gentle female)
    "Sofia Hellen",         # versatile female
    "Camilla Holmström",    # calm professional female
    "Daisy Studious",       # bright female
    "Andrew Chipper",       # warm male
    "Damien Black",         # deep male (NOT UNLIM)
    "Rosemary Okafor",      # mature female
    "Asya Anara",           # young female
]

class TTSReq(BaseModel):
    text: str
    language: str = "it"
    speaker: str = DEFAULT_SPEAKER  # built-in speaker name
    speaker_wav: str | None = None  # path to clone reference
    use_clone: bool = False         # force clone mode

@app.get("/health")
def health():
    clone_available = Path(SPEAKER_CLONE_PATH).exists() and Path(SPEAKER_CLONE_PATH).stat().st_size > 10000
    return {
        "status": "ok",
        "model": "xtts_v2",
        "default_speaker": DEFAULT_SPEAKER,
        "voice_profile": "gentle-female-mid-tone-calm-warm",
        "clone_available": clone_available,
        "clone_path": SPEAKER_CLONE_PATH if clone_available else None,
        "builtin_speakers": BUILTIN_SPEAKERS,
        "supported_languages": ["it","en","es","fr","de","pt","pl","tr","ru","nl","cs","ar","zh-cn","ja","hu","ko"],
    }

@app.get("/speakers")
def list_speakers():
    """List all built-in studio speakers + clone availability."""
    return {
        "default": DEFAULT_SPEAKER,
        "builtin": BUILTIN_SPEAKERS,
        "clone": {
            "path": SPEAKER_CLONE_PATH,
            "available": Path(SPEAKER_CLONE_PATH).exists(),
            "size_bytes": Path(SPEAKER_CLONE_PATH).stat().st_size if Path(SPEAKER_CLONE_PATH).exists() else 0,
        },
    }

@app.post("/tts")
def synth(req: TTSReq):
    """Synthesize speech.

    Auto-detects mode:
    - If req.use_clone OR (req.speaker_wav set + file exists) → voice clone
    - Else → built-in speaker (default Tammy Grit)
    """
    clone_path = req.speaker_wav or SPEAKER_CLONE_PATH
    clone_exists = Path(clone_path).exists() and Path(clone_path).stat().st_size > 10000

    if req.use_clone and clone_exists:
        # Voice clone mode
        wav = tts.tts(
            text=req.text,
            speaker_wav=clone_path,
            language=req.language,
        )
        mode = f"clone:{Path(clone_path).name}"
    else:
        # Built-in studio speaker mode (DEFAULT)
        speaker = req.speaker if req.speaker in BUILTIN_SPEAKERS else DEFAULT_SPEAKER
        wav = tts.tts(
            text=req.text,
            speaker=speaker,
            language=req.language,
        )
        mode = f"builtin:{speaker}"

    buf = io.BytesIO()
    sf.write(buf, wav, 24000, format="WAV")
    return Response(
        content=buf.getvalue(),
        media_type="audio/wav",
        headers={"X-TTS-Mode": mode},
    )

@app.post("/tts/sample")
def sample_voice(req: TTSReq):
    """Generate sample voice audio for A/B testing UNLIM voice profile.

    Useful for Andrea to compare Tammy Grit vs voice clone (when available).
    """
    return synth(req)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8881)
