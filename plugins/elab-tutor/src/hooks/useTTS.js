// ============================================
// ELAB Tutor - useTTS Hook
// Text-to-Speech hook for UNLIM AI responses
// © Andrea Marro — 01/04/2026
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import logger from '../utils/logger';

// Lazy-load server TTS (Edge TTS VPS / Kokoro) to avoid blocking initial render
let _synthesizeSpeech = null;
async function getServerTTS() {
  if (!_synthesizeSpeech) {
    try {
      const mod = await import('../services/voiceService');
      _synthesizeSpeech = mod.synthesizeSpeech;
    } catch { _synthesizeSpeech = null; }
  }
  return _synthesizeSpeech;
}

// Voice quality ranking — higher score = better voice for kids
const PREFERRED_VOICES = [
  { pattern: /google.*italiano/i, score: 100 },
  { pattern: /alice/i, score: 90 },
  { pattern: /federica/i, score: 85 },
  { pattern: /luca/i, score: 80 },
  { pattern: /giulia/i, score: 80 },
  { pattern: /cosimo/i, score: 75 },
  { pattern: /microsoft.*elsa/i, score: 70 },
  { pattern: /microsoft.*italian/i, score: 65 },
];

function scoreVoice(voice) {
  for (const pref of PREFERRED_VOICES) {
    if (pref.pattern.test(voice.name)) return pref.score;
  }
  // Italian voices get base score, local ones get bonus
  const isItalian = voice.lang.startsWith('it') || voice.name.toLowerCase().includes('italian');
  if (!isItalian) return 0;
  return voice.localService ? 40 : 20;
}

// Split text into natural chunks at sentence boundaries, max ~100 chars
function chunkText(text) {
  if (!text || text.length <= 100) return text ? [text] : [];

  const chunks = [];
  // Split on sentence-ending punctuation followed by space
  const sentences = text.split(/(?<=[.!?;:])\s+/);
  let current = '';

  for (const sentence of sentences) {
    if (current && (current.length + sentence.length + 1) > 100) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // If any chunk is still >150 chars, split at comma/dash
  const result = [];
  for (const chunk of chunks) {
    if (chunk.length <= 150) {
      result.push(chunk);
    } else {
      const subParts = chunk.split(/(?<=[,\u2014\u2013\u2026])\s+/);
      let sub = '';
      for (const part of subParts) {
        if (sub && (sub.length + part.length + 1) > 100) {
          result.push(sub.trim());
          sub = part;
        } else {
          sub = sub ? sub + ' ' + part : part;
        }
      }
      if (sub.trim()) result.push(sub.trim());
    }
  }

  return result;
}

/**
 * Custom hook per gestire Text-to-Speech
 * Usa Web Speech API con chunking naturale e voice ranking
 */
export function useTTS() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const utteranceRef = useRef(null);
  const synthRef = useRef(null);
  const pendingTextRef = useRef(null);
  const safetyTimerRef = useRef(null);
  const chunkQueueRef = useRef([]);    // queued chunks for sequential playback
  const preWarmedRef = useRef(false);  // track if engine has been pre-warmed

  // Inizializza il TTS e carica le voci
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported = 'speechSynthesis' in window;
    setIsSupported(supported);

    if (supported) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const voices = synthRef.current.getVoices();
        setAvailableVoices(voices);

        // Rank all voices and pick the best Italian one
        const ranked = voices
          .map(v => ({ voice: v, score: scoreVoice(v) }))
          .filter(v => v.score > 0)
          .sort((a, b) => b.score - a.score);

        const bestVoice = ranked[0]?.voice || voices[0];
        setSelectedVoice(bestVoice);

        if (ranked[0]) {
          logger.info(`TTS: voce selezionata "${ranked[0].voice.name}" (score ${ranked[0].score})`);
        }
      };

      loadVoices();
      synthRef.current.addEventListener('voiceschanged', loadVoices);

      return () => {
        if (synthRef.current) {
          synthRef.current.removeEventListener('voiceschanged', loadVoices);
        }
      };
    }
  }, []);

  // BUG-03 fix: quando le voci vengono caricate, parla il testo in coda
  useEffect(() => {
    if (selectedVoice && pendingTextRef.current) {
      const { text, options } = pendingTextRef.current;
      pendingTextRef.current = null;
      // speak sarà chiamato al prossimo render con selectedVoice disponibile
      // Usiamo un micro-delay per assicurarci che lo stato sia committato
      const t = setTimeout(() => speak(text, options), 50);
      return () => clearTimeout(t);
    }
  }, [selectedVoice]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pulisce l'utterance corrente e svuota la coda chunk
  const cleanup = useCallback(() => {
    // Cancel browser speechSynthesis
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    // Stop server TTS audio if playing
    if (utteranceRef.current && typeof utteranceRef.current.pause === 'function') {
      utteranceRef.current.pause();
      utteranceRef.current.currentTime = 0;
    }
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    chunkQueueRef.current = [];
    utteranceRef.current = null;
    setIsSpeaking(false);
    setIsPaused(false);
    setIsLoading(false);
  }, []);

  // Pre-warm the TTS engine with a silent utterance to eliminate first-use delay
  const preWarm = useCallback(() => {
    if (!isSupported || !synthRef.current || preWarmedRef.current) return;
    try {
      const silent = new SpeechSynthesisUtterance('');
      silent.volume = 0;
      silent.rate = 10;
      synthRef.current.speak(silent);
      preWarmedRef.current = true;
    } catch (_) { /* ignore pre-warm failure */ }
  }, [isSupported]);

  // Clean text from ELAB tags and markdown
  const cleanForSpeech = useCallback((text) => {
    return text
      .replace(/\[AZIONE:[^\]]+\]/gi, '')
      .replace(/\[INTENT:\{[^}]*\}]/gi, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/#+\s*/g, '')
      .trim();
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
  }, []);

  // Speak a single chunk (internal)
  const speakChunk = useCallback((text, options, onEnd) => {
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.voice = selectedVoice;
    utterance.rate = options.rate || 0.95;
    utterance.pitch = options.pitch || 1.05;
    utterance.volume = options.volume || 0.85;
    utterance.lang = 'it-IT';

    utterance.onstart = () => {
      setIsLoading(false);
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        logger.error('TTS Error:', event.error);
      }
      chunkQueueRef.current = [];
      cleanup();
    };

    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);

    // Safety timeout per chunk
    const safetyMs = Math.min(text.length * 80 + 3000, 30000);
    safetyTimerRef.current = setTimeout(() => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        onEnd();
      }
      safetyTimerRef.current = null;
    }, safetyMs);

    utterance.onend = () => {
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }
      utteranceRef.current = null;
      onEnd();
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [selectedVoice, cleanup]);

  // Play queued chunks sequentially with natural pauses
  const playNextChunk = useCallback((options) => {
    const queue = chunkQueueRef.current;
    if (queue.length === 0) {
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }

    const next = queue.shift();
    speakChunk(next, options, () => {
      if (chunkQueueRef.current.length > 0) {
        // 150ms natural pause between chunks for breathing room
        setTimeout(() => playNextChunk(options), 150);
      } else {
        setIsSpeaking(false);
        setIsPaused(false);
      }
    });
  }, [speakChunk]);

  // Play audio from ArrayBuffer (server TTS — Edge TTS VPS / Kokoro)
  const playAudioBuffer = useCallback((buffer) => {
    try {
      const blob = new Blob([buffer], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = 0.85;
      audio.onended = () => { URL.revokeObjectURL(url); setIsSpeaking(false); setIsPaused(false); };
      audio.onerror = () => { URL.revokeObjectURL(url); setIsSpeaking(false); };
      setIsSpeaking(true);
      setIsLoading(false);
      audio.play().catch(() => { URL.revokeObjectURL(url); setIsSpeaking(false); });
      // Store ref so stop() can cancel it
      utteranceRef.current = audio;
    } catch { /* fallthrough to browser TTS */ }
  }, []);

  // Browser speechSynthesis fallback (internal)
  const speakWithBrowser = useCallback((cleanText, options) => {
    if (!isSupported || !selectedVoice) { setIsLoading(false); return; }
    if (!preWarmedRef.current) preWarm();
    const chunks = chunkText(cleanText);
    if (chunks.length === 0) { setIsLoading(false); return; }
    chunkQueueRef.current = chunks;
    playNextChunk(options);
  }, [isSupported, selectedVoice, preWarm, playNextChunk]);

  // Funzione principale per far parlare il testo
  const speak = useCallback((text, options = {}) => {
    if (!text) return false;

    cleanup();
    chunkQueueRef.current = [];
    setIsLoading(true);

    const cleanText = cleanForSpeech(text);
    if (!cleanText) { setIsLoading(false); return false; }

    // Try server TTS first (Edge TTS VPS / Kokoro — voce naturale)
    getServerTTS().then(async (synth) => {
      if (synth) {
        try {
          const audioBuffer = await synth(cleanText);
          if (audioBuffer && audioBuffer.byteLength > 0) {
            logger.info('[TTS] Voce naturale (server)');
            playAudioBuffer(audioBuffer);
            return;
          }
        } catch (e) {
          logger.debug('[TTS] Server TTS non disponibile:', e.message);
        }
      }
      // Fallback: browser speechSynthesis
      logger.info('[TTS] Fallback: browser speechSynthesis');
      speakWithBrowser(cleanText, options);
    }).catch(() => {
      speakWithBrowser(cleanText, options);
    });

    return true;
  }, [cleanup, cleanForSpeech, playAudioBuffer, speakWithBrowser]);

  // Pausa/riprendi
  const togglePause = useCallback(() => {
    if (!isSupported || !isSpeaking) return false;

    try {
      if (isPaused) {
        synthRef.current.resume();
      } else {
        synthRef.current.pause();
      }
      return true;
    } catch (error) {
      logger.error('Errore toggle pause TTS:', error);
      return false;
    }
  }, [isSupported, isSpeaking, isPaused]);

  // Stop (also clears chunk queue)
  const stop = useCallback(() => {
    cleanup();
    return true;
  }, [cleanup]);

  // Cambia voce
  const changeVoice = useCallback((voice) => {
    setSelectedVoice(voice);
  }, []);

  // Test della voce corrente
  const testVoice = useCallback(() => {
    const testText = "Ciao! Sono UNLIM, il tuo compagno di avventure nell'elettronica!";
    return speak(testText);
  }, [speak]);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    isLoading,
    availableVoices,
    selectedVoice,
    speak,
    stop,
    togglePause,
    changeVoice,
    testVoice,
    preWarm,
    cleanup,
  };
}

export default useTTS;