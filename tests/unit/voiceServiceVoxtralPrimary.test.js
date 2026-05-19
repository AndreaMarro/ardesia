import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../src/utils/logger', () => ({
  default: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock('../../src/services/api', () => ({
  sendChat: vi.fn(() => Promise.resolve({ success: true, response: 'Risposta vocale breve.' })),
}));

import { sendChat } from '../../src/services/api';

const mp3Response = (bytes = 2048) => new Response(new Uint8Array(bytes), {
  status: 200,
  headers: {
    'Content-Type': 'audio/mpeg',
    'X-Tts-Provider': 'voxtral',
    'X-Tts-Voice': '9234f1b6-766a-485f-acc4-e2cf6dc42327',
  },
});

describe('voiceService synthesizeSpeech Voxtral primary', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls same-origin Voxtral proxy before Kokoro or Edge TTS', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mp3Response());
    vi.stubGlobal('fetch', fetchMock);

    const { synthesizeSpeech } = await import('../../src/services/voiceService.js');
    const audio = await synthesizeSpeech('Ragazzi, accendiamo il LED.');

    expect(audio.byteLength).toBe(2048);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/voxtral');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.provider).toBe('voxtral');
    expect(body.response_format).toBe('mp3');
  });

  it('falls back to Kokoro when Voxtral proxy is unavailable', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Voxtral down' }), { status: 502 }))
      .mockResolvedValueOnce(mp3Response(4096));
    vi.stubGlobal('fetch', fetchMock);

    const { synthesizeSpeech } = await import('../../src/services/voiceService.js');
    const audio = await synthesizeSpeech('Fallback controllato.');

    expect(audio.byteLength).toBe(4096);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/voxtral');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/kokoro');
  });

  it('uses a valid ELAB anon key for Supabase STT even when env is empty', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, text: 'che cos e il sole?' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(mp3Response(3072));
    vi.stubGlobal('fetch', fetchMock);

    const { sendVoiceChat } = await import('../../src/services/voiceService.js');
    const result = await sendVoiceChat(new Blob([new Uint8Array(256)], { type: 'audio/webm;codecs=opus' }), {
      sessionId: 'test-session',
      experimentId: 'v1-cap6-esp1',
    });

    expect(result.success).toBe(true);
    expect(result.userText).toBe('che cos e il sole?');
    expect(sendChat).toHaveBeenCalledWith('che cos e il sole?', [], expect.objectContaining({
      experimentId: 'v1-cap6-esp1',
    }));
    expect(fetchMock.mock.calls[0][0]).toContain('/unlim-stt');
    const tokenPayload = JSON.parse(atob(fetchMock.mock.calls[0][1].headers.apikey.split('.')[1]));
    expect(tokenPayload.ref).toBe('euqpdueopmlllqjmqnyb');
    expect(tokenPayload.role).toBe('anon');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toContain('Bearer ');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/voxtral');
  });
});
