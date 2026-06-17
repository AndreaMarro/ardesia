"""
ELAB TTS Server — Edge TTS (Microsoft Neural Voices)
Zero GPU, zero costo, qualita eccellente.
Voce: it-IT-IsabellaNeural (naturale, femminile, pedagogica)

Deploy su VPS (72.60.129.50):
  pip install edge-tts fastapi uvicorn
  nohup uvicorn edge-tts-server:app --host 0.0.0.0 --port 8880 &

(c) Andrea Marro — 03/04/2026
"""

import asyncio
import hashlib
import os
import time
from pathlib import Path

from fastapi import FastAPI, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

app = FastAPI(title="ELAB TTS — Edge", version="1.0")

# CORS — solo domini ELAB
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://elab-builder.vercel.app",
        "https://www.elabtutor.school",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Config
VOICE = "it-IT-IsabellaNeural"
VOICE_MALE = "it-IT-DiegoNeural"
CACHE_DIR = Path("/tmp/elab-tts-cache")
CACHE_DIR.mkdir(exist_ok=True)
MAX_CHARS = 500  # Limite per richiesta (sicurezza)
MAX_CACHE_SIZE_MB = 200  # Pulizia cache oltre 200MB
RATE_LIMIT_PER_MIN = 30  # Max richieste al minuto per IP

# Rate limiting semplice (in-memory)
_rate = {}


def check_rate(ip: str) -> bool:
    now = time.time()
    # Pulisci vecchi
    _rate[ip] = [t for t in _rate.get(ip, []) if now - t < 60]
    if len(_rate.get(ip, [])) >= RATE_LIMIT_PER_MIN:
        return False
    _rate.setdefault(ip, []).append(now)
    return True


def cache_key(text: str, voice: str, rate: str) -> str:
    h = hashlib.sha256(f"{text}|{voice}|{rate}".encode()).hexdigest()[:16]
    return h


def clean_cache():
    """Rimuovi file piu vecchi se cache > MAX_CACHE_SIZE_MB."""
    total = sum(f.stat().st_size for f in CACHE_DIR.glob("*.mp3"))
    if total < MAX_CACHE_SIZE_MB * 1024 * 1024:
        return
    files = sorted(CACHE_DIR.glob("*.mp3"), key=lambda f: f.stat().st_mtime)
    while total > MAX_CACHE_SIZE_MB * 1024 * 1024 * 0.7 and files:
        f = files.pop(0)
        total -= f.stat().st_size
        f.unlink(missing_ok=True)


@app.get("/health")
async def health():
    return {"status": "ok", "voice": VOICE, "engine": "edge-tts"}


@app.get("/voices")
async def list_voices():
    """Lista voci italiane disponibili."""
    import edge_tts
    voices = await edge_tts.list_voices()
    italian = [v for v in voices if v["Locale"].startswith("it-")]
    return {"voices": italian}


@app.get("/tts")
async def text_to_speech(
    text: str = Query(..., max_length=MAX_CHARS),
    voice: str = Query(VOICE),
    rate: str = Query("+0%"),
):
    """
    Genera audio MP3 da testo italiano.

    Params:
        text: Testo da leggere (max 500 char)
        voice: Voce Edge (default: IsabellaNeural)
        rate: Velocita (es. "-10%", "+5%", default "+0%")

    Returns: audio/mpeg
    """
    if not text.strip():
        return JSONResponse({"error": "Testo vuoto"}, status_code=400)

    # Sanitize voice name
    if voice not in (VOICE, VOICE_MALE):
        voice = VOICE

    # Rate limit (semplificato, senza IP reale in dev)
    # In prod: usa X-Forwarded-For

    # Cache check
    key = cache_key(text.strip(), voice, rate)
    cached = CACHE_DIR / f"{key}.mp3"
    if cached.exists():
        return FileResponse(cached, media_type="audio/mpeg", headers={
            "Cache-Control": "public, max-age=86400",
            "X-TTS-Cache": "hit",
        })

    # Generate
    try:
        import edge_tts
        communicate = edge_tts.Communicate(text.strip(), voice, rate=rate)
        await communicate.save(str(cached))
        clean_cache()
        return FileResponse(cached, media_type="audio/mpeg", headers={
            "Cache-Control": "public, max-age=86400",
            "X-TTS-Cache": "miss",
        })
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/tts/batch")
async def batch_tts(texts: list[str]):
    """
    Pre-genera audio per piu testi (es. frasi lezione).
    Utile per pre-caching delle lesson path.
    Max 20 testi per batch.
    """
    if len(texts) > 20:
        return JSONResponse({"error": "Max 20 testi per batch"}, status_code=400)

    results = []
    for text in texts:
        if not text.strip() or len(text) > MAX_CHARS:
            results.append({"text": text[:50], "status": "skipped"})
            continue
        key = cache_key(text.strip(), VOICE, "+0%")
        cached = CACHE_DIR / f"{key}.mp3"
        if cached.exists():
            results.append({"text": text[:50], "status": "cached", "key": key})
        else:
            try:
                import edge_tts
                communicate = edge_tts.Communicate(text.strip(), VOICE)
                await communicate.save(str(cached))
                results.append({"text": text[:50], "status": "generated", "key": key})
            except Exception as e:
                results.append({"text": text[:50], "status": "error", "error": str(e)})

    clean_cache()
    return {"results": results, "total": len(results)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8880)
