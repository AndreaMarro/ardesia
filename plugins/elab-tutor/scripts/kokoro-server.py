#!/usr/bin/env python3
"""
Kokoro TTS Server per ELAB — FastAPI wrapper
Endpoint compatibile con il frontend ELAB (voiceService.js)
Porta: 8881 (non conflittuare con Edge TTS su 8880)

Avvio: /tmp/kokoro312/bin/python3.12 scripts/kokoro-server.py
"""

import io
import time
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import soundfile as sf
from kokoro import KPipeline

app = FastAPI(title="ELAB Kokoro TTS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pipeline once at startup
print("Loading Kokoro Italian pipeline...")
pipeline = KPipeline(lang_code='i')
print("Kokoro ready!")

@app.get("/health")
def health():
    return {"status": "ok", "voice": "kokoro-italian", "engine": "kokoro-82m"}

@app.get("/tts")
def tts(text: str = Query(...), voice: str = Query(default="if_sara")):
    """Generate Italian TTS audio from text"""
    start = time.time()
    chunks = []
    for _, _, audio in pipeline(text, voice=voice):
        chunks.append(audio)

    if not chunks:
        return JSONResponse({"error": "No audio generated"}, status_code=500)

    import numpy as np
    full_audio = np.concatenate(chunks)

    buf = io.BytesIO()
    sf.write(buf, full_audio, 24000, format='WAV')
    buf.seek(0)

    latency = int((time.time() - start) * 1000)
    return StreamingResponse(
        buf,
        media_type="audio/wav",
        headers={
            "X-Latency-Ms": str(latency),
            "X-Audio-Duration": f"{len(full_audio)/24000:.2f}",
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8881)
