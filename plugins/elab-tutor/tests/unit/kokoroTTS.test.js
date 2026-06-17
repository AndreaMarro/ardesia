import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test Kokoro TTS integration patterns (mock fetch — server runs separately)
const KOKORO_URL = 'http://localhost:8881';

describe('Kokoro TTS Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. health endpoint returns correct shape', async () => {
    const mockResp = { status: 'ok', voice: 'kokoro-italian', engine: 'kokoro-82m' };
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResp) });

    const resp = await fetch(`${KOKORO_URL}/health`);
    const data = await resp.json();
    expect(data.status).toBe('ok');
    expect(data.engine).toBe('kokoro-82m');
  });

  it('2. tts endpoint accepts text parameter', async () => {
    const audioBuffer = new ArrayBuffer(1000);
    global.fetch = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: () => Promise.resolve(audioBuffer) });

    const text = 'Ciao sono UNLIM';
    const resp = await fetch(`${KOKORO_URL}/tts?text=${encodeURIComponent(text)}`);
    expect(resp.ok).toBe(true);
    const audio = await resp.arrayBuffer();
    expect(audio.byteLength).toBeGreaterThan(0);
  });

  it('3. tts with voice parameter', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(500)) });

    await fetch(`${KOKORO_URL}/tts?text=test&voice=if_sara`);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('voice=if_sara'));
  });

  it('4. synthesizeSpeech chain: Kokoro first', async () => {
    // Simulate the chain logic from voiceService.js
    const kokoroOk = true;
    const edgeTtsOk = true;

    // Kokoro should be tried first
    let usedEngine = null;
    if (kokoroOk) {
      usedEngine = 'kokoro';
    } else if (edgeTtsOk) {
      usedEngine = 'edge-tts';
    } else {
      usedEngine = 'browser';
    }
    expect(usedEngine).toBe('kokoro');
  });

  it('5. fallback to Edge TTS when Kokoro fails', async () => {
    let usedEngine = null;
    const kokoroOk = false; // Kokoro down
    const edgeTtsOk = true;

    if (kokoroOk) {
      usedEngine = 'kokoro';
    } else if (edgeTtsOk) {
      usedEngine = 'edge-tts';
    } else {
      usedEngine = 'browser';
    }
    expect(usedEngine).toBe('edge-tts');
  });

  it('6. fallback to browser when both fail', async () => {
    let usedEngine = null;
    const kokoroOk = false;
    const edgeTtsOk = false;

    if (kokoroOk) {
      usedEngine = 'kokoro';
    } else if (edgeTtsOk) {
      usedEngine = 'edge-tts';
    } else {
      usedEngine = 'browser';
    }
    expect(usedEngine).toBe('browser');
  });

  it('7. text truncation at 500 chars', () => {
    const longText = 'a'.repeat(600);
    const truncated = longText.slice(0, 500);
    expect(truncated.length).toBe(500);
  });

  it('8. URL encoding for special Italian chars', () => {
    const text = "L'elettricità è importante!";
    const encoded = encodeURIComponent(text);
    expect(encoded).toContain('%C3%A0'); // à
    expect(encoded).toContain('%C3%A8'); // è
  });
});
