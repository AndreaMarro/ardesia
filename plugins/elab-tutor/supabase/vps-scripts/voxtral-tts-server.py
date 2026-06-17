"""
Voxtral TTS Server — ELAB UNLIM Voice
Runs on VPS (72.60.129.50:8880) alongside Ollama.
Converts text to natural Italian speech using Voxtral 4B.

Setup:
  pip install fastapi uvicorn transformers torch torchaudio
  # Download Voxtral model (first run only):
  # python -c "from transformers import AutoModel; AutoModel.from_pretrained('mistralai/Voxtral-Mini-3B-2507')"

Run:
  uvicorn voxtral-tts-server:app --host 0.0.0.0 --port 8880

(c) Andrea Marro — 02/04/2026
"""

import io
import os
import logging
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voxtral-tts")

app = FastAPI(title="ELAB UNLIM TTS", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Model loading (lazy) ──
_model = None
_processor = None


def get_model():
    """Lazy-load Voxtral model on first request."""
    global _model, _processor
    if _model is not None:
        return _model, _processor

    try:
        import torch
        from transformers import AutoProcessor, AutoModel

        model_name = os.getenv("VOXTRAL_MODEL", "mistralai/Voxtral-Mini-3B-2507")
        logger.info(f"Loading Voxtral model: {model_name}")

        _processor = AutoProcessor.from_pretrained(model_name)
        _model = AutoModel.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto" if torch.cuda.is_available() else "cpu",
        )
        logger.info(f"Voxtral loaded on {'GPU' if torch.cuda.is_available() else 'CPU'}")
        return _model, _processor
    except Exception as e:
        logger.error(f"Failed to load Voxtral: {e}")
        raise


# ── Fallback: espeak TTS (always available on Linux) ──
def fallback_tts(text: str, speed: float = 0.95) -> bytes:
    """Use espeak as fallback when Voxtral is not available."""
    import subprocess
    import tempfile

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp_path = f.name

    # espeak with Italian voice, adjust speed
    wpm = int(150 * speed)
    try:
        subprocess.run(
            ["espeak", "-v", "it", "-s", str(wpm), "-w", tmp_path, text],
            check=True, capture_output=True, timeout=10,
        )
        with open(tmp_path, "rb") as f:
            audio_data = f.read()
        return audio_data
    except (subprocess.CalledProcessError, FileNotFoundError):
        raise HTTPException(status_code=503, detail="TTS not available")
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


# ── Request model ──
class TTSRequest(BaseModel):
    text: str
    voice: str = "unlim-tutor"
    language: str = "it"
    speed: float = 0.95


# ── Endpoints ──
@app.get("/health")
async def health():
    """Health check for monitoring."""
    return {"status": "ok", "service": "voxtral-tts", "version": "2.0"}


@app.post("/tts")
async def text_to_speech(req: TTSRequest):
    """Convert text to speech using Voxtral (or espeak fallback)."""
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Empty text")

    # Limit text length (prevent abuse)
    text = req.text[:500]

    try:
        model, processor = get_model()

        import torch
        import torchaudio

        # Prepare input
        inputs = processor(text=text, return_tensors="pt")
        if torch.cuda.is_available():
            inputs = {k: v.cuda() for k, v in inputs.items()}

        # Generate audio
        with torch.no_grad():
            output = model.generate(**inputs, max_new_tokens=2048)

        # Convert to audio bytes
        audio_tensor = output.squeeze().cpu()
        sample_rate = 24000  # Voxtral default

        # Apply speed adjustment
        if req.speed != 1.0:
            effects = [["tempo", str(req.speed)]]
            audio_tensor, sample_rate = torchaudio.sox_effects.apply_effects_tensor(
                audio_tensor.unsqueeze(0), sample_rate, effects
            )
            audio_tensor = audio_tensor.squeeze()

        # Encode to MP3
        buffer = io.BytesIO()
        torchaudio.save(buffer, audio_tensor.unsqueeze(0), sample_rate, format="mp3")
        buffer.seek(0)

        logger.info(f"TTS generated: {len(text)} chars → {buffer.getbuffer().nbytes} bytes")

        return StreamingResponse(
            buffer,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline",
                "Cache-Control": "public, max-age=3600",
            },
        )

    except Exception as e:
        logger.warning(f"Voxtral failed, using espeak fallback: {e}")
        # Fallback to espeak
        audio_data = fallback_tts(text, req.speed)
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/wav",
            headers={"Content-Disposition": "inline"},
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8880)
