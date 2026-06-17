// ============================================
// ELAB Tutor - useSTT Hook
// Speech-to-Text hook for voice input
// © Andrea Marro — 28/03/2026
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import logger from '../utils/logger';

/**
 * Custom hook per gestire Speech-to-Text (riconoscimento vocale).
 * Usa Web Speech API SpeechRecognition con fallback webkit.
 *
 * @param {Object} options
 * @param {string} options.lang - Lingua (default: 'it-IT')
 * @param {function} options.onResult - Callback con il testo finale riconosciuto
 * @param {function} options.onInterim - Callback con il testo parziale (mentre si parla)
 */
export function useSTT({ lang = 'it-IT', onResult, onInterim } = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onInterimRef = useRef(onInterim);

  // Tieni i callback aggiornati senza ricreare il recognizer
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onInterimRef.current = onInterim; }, [onInterim]);

  // Inizializza SpeechRecognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;       // Non interrompere — il docente parla alla classe
    recognition.interimResults = true;   // Mostra testo parziale
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        setInterimText(interim);
        onInterimRef.current?.(interim);
      }

      if (final) {
        setInterimText('');
        setIsListening(false);
        onResultRef.current?.(final.trim());
      }
    };

    recognition.onerror = (event) => {
      // 'no-speech' e 'aborted' non sono errori reali — l'utente non ha parlato
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        logger.warn('STT Error:', event.error);
      }
      setIsListening(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch {}
      recognitionRef.current = null;
    };
  }, [lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return false;
    try {
      setInterimText('');
      recognitionRef.current.start();
      setIsListening(true);
      return true;
    } catch (err) {
      logger.warn('STT start error:', err);
      return false;
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return false;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimText('');
      return true;
    } catch (err) {
      logger.warn('STT stop error:', err);
      return false;
    }
  }, [isListening]);

  const toggle = useCallback(() => {
    return isListening ? stopListening() : startListening();
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    interimText,
    startListening,
    stopListening,
    toggle,
  };
}

export default useSTT;
