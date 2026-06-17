/**
 * QuizPanel — Floating quiz panel for experiment questions
 * Renders quiz data from experiment definitions (2 questions per experiment)
 * Design: Apple card-style, consistent with ExperimentGuide
 * (c) Andrea Marro — 21/02/2026
 *
 * Props:
 *   experiment: { quiz: [{ question, options, correct, explanation }] }
 *   onClose: () => void
 */

import React, { useState } from 'react';

const QuizPanel = React.memo(function QuizPanel({ experiment, onClose, onSendToUNLIM, onQuizComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [results, setResults] = useState([]); // array of booleans
  const [selectedAnswers, setSelectedAnswers] = useState([]); // array of answer indices for PDF report
  const [finished, setFinished] = useState(false);

  if (!experiment?.quiz?.length) return null;

  const quiz = experiment.quiz;
  const q = quiz[currentQ];
  const isCorrect = selectedAnswer === q.correct;
  const totalCorrect = results.filter(Boolean).length;

  const handleSelect = (idx) => {
    if (selectedAnswer !== null) return; // already answered
    setSelectedAnswer(idx);
    setShowExplanation(true);
    setResults(prev => [...prev, idx === q.correct]);
    setSelectedAnswers(prev => [...prev, idx]);
  };

  const handleNext = () => {
    if (currentQ + 1 >= quiz.length) {
      setFinished(true);
      // Notify parent about quiz results for PDF report
      if (onQuizComplete) {
        const finalResults = [...results, selectedAnswer === q.correct];
        onQuizComplete({
          answers: [...selectedAnswers, selectedAnswer],
          score: finalResults.filter(Boolean).length,
          total: quiz.length,
          questions: quiz,
        });
      }
    } else {
      setCurrentQ(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleRetry = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setResults([]);
    setSelectedAnswers([]);
    setFinished(false);
  };

  // ─── Finished state ───
  if (finished) {
    const score = totalCorrect;
    const total = quiz.length;
    const perfect = score === total;

    return (
      <div style={S.root}>
        <div style={S.header}>
          <span style={S.headerIcon}>{'+'}</span>
          <span style={S.headerTitle}>Quiz Completato!</span>
          <button onClick={onClose} style={S.headerBtn} title="Chiudi">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={S.resultBody}>
          <div style={S.scoreCircle}>
            <span style={S.scoreNumber}>{score}/{total}</span>
          </div>
          <p style={S.resultText}>
            {perfect
              ? 'Perfetto! Hai risposto correttamente a tutte le domande!'
              : score >= total / 2
                ? 'Bene! Puoi migliorare rivedendo l\'esperimento.'
                : 'Riprova dopo aver osservato meglio l\'esperimento.'
            }
          </p>
          <div style={S.resultActions}>
            {!perfect && (
              <button onClick={handleRetry} style={S.retryBtn}>Riprova</button>
            )}
            <button onClick={onClose} style={S.closeBtn}>Chiudi</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Question state ───
  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <span style={S.headerIcon}>{'Q'}</span>
        <span style={S.headerTitle}>Quiz — {currentQ + 1}/{quiz.length}</span>
        <button onClick={onClose} style={S.headerBtn} title="Chiudi">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div style={S.progressBar}>
        <div style={{ ...S.progressFill, width: `${((currentQ + (selectedAnswer !== null ? 1 : 0)) / quiz.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div style={S.questionBody}>
        <p style={S.questionText}>{q.question}</p>

        {/* Options */}
        <div style={S.optionsList}>
          {q.options.map((opt, i) => {
            let optStyle = { ...S.option };
            if (selectedAnswer !== null) {
              if (i === q.correct) {
                optStyle = { ...optStyle, ...S.optionCorrect };
              } else if (i === selectedAnswer && !isCorrect) {
                optStyle = { ...optStyle, ...S.optionWrong };
              } else {
                optStyle = { ...optStyle, opacity: 0.5 };
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                style={optStyle}
                disabled={selectedAnswer !== null}
              >
                <span style={S.optionLabel}>{String.fromCharCode(65 + i)}</span>
                <span style={S.optionText}>{opt}</span>
                {selectedAnswer !== null && i === q.correct && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M3 8.5L6.5 12L13 4" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {selectedAnswer === i && i !== q.correct && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M4 4L12 12M4 12L12 4" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div style={isCorrect ? S.explanationCorrect : S.explanationWrong}>
            <span style={S.explanationIcon}>{isCorrect ? '\u2713' : '\u2192'}</span>
            <span>{q.explanation}</span>
          </div>
        )}

        {/* UNLIM help after wrong answer */}
        {showExplanation && !isCorrect && onSendToUNLIM && (
          <button
            onClick={() => onSendToUNLIM(`Nel quiz dell'esperimento "${experiment.title || experiment.id}", la domanda era: "${q.question}". Ho risposto "${q.options[selectedAnswer]}" ma la risposta corretta è "${q.options[q.correct]}". Spiegami perché.`)}
            style={S.unlimBtn}
          >
            UNLIM, spiegami perché
          </button>
        )}

        {/* Next button */}
        {selectedAnswer !== null && (
          <button onClick={handleNext} style={S.nextBtn}>
            {currentQ + 1 >= quiz.length ? 'Vedi Risultati' : 'Avanti'}
          </button>
        )}
      </div>
    </div>
  );
});

// ─── Styles (Apple floating card — same design language as ExperimentGuide) ───
const S = {
  root: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 300,
    maxHeight: 'calc(100% - 16px)',
    background: 'rgba(255, 255, 255, 0.97)',
    border: '1px solid var(--color-border, #E5E5E5)',
    borderRadius: 14,
    boxShadow: 'var(--shadow-lg, 0 4px 24px rgba(0, 0, 0, 0.1))',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    fontSize: 14,
    color: 'var(--color-text-gray-700, #333)',
    overflow: 'auto',
    zIndex: 25,
    backdropFilter: 'blur(8px)',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 14px',
    background: 'var(--color-bg-secondary, #FAFAFA)',
    borderBottom: '1px solid var(--color-border, #F0F0F0)',
    borderRadius: '14px 14px 0 0',
  },

  headerIcon: {
    fontSize: 18,
    lineHeight: 1,
  },

  headerTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-text, #1A1A2E)',
    fontFamily: 'var(--font-display, "Oswald", sans-serif)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    lineHeight: 1.25,
  },

  headerBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-secondary, #6B7280)',
    padding: 6,
    borderRadius: 6,
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 150ms',
  },

  progressBar: {
    height: 3,
    background: 'var(--color-bg-tertiary, #ECECF1)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    background: 'var(--color-accent, var(--elab-lime))',
    transition: 'width 300ms ease',
    borderRadius: '0 2px 2px 0',
  },

  questionBody: {
    padding: '14px',
  },

  questionText: {
    margin: '0 0 14px 0',
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-text, #1A1A2E)',
    lineHeight: 1.5,
  },

  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },

  option: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    border: '1.5px solid var(--color-border, #E5E5E5)',
    borderRadius: 10,
    background: 'var(--color-bg, #FFF)',
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1.4,
    color: 'var(--color-text-gray-600, #444)',
    transition: 'all 150ms ease',
    textAlign: 'left',
    width: '100%',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
  },

  optionCorrect: {
    borderColor: 'var(--color-accent, var(--elab-lime))',
    background: 'var(--color-accent-light, #E8F5E9)',
    color: 'var(--color-success, #16A34A)',
    cursor: 'default',
  },

  optionWrong: {
    borderColor: 'var(--color-vol3, var(--elab-red))',
    background: 'var(--color-danger-light, #FEE2E2)',
    color: 'var(--color-danger, #DC2626)',
    cursor: 'default',
  },

  optionLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: 'var(--color-primary-light, #E8EEF6)',
    color: 'var(--color-primary, var(--elab-navy))',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },

  optionText: {
    flex: 1,
  },

  explanationCorrect: {
    marginTop: 12,
    padding: '10px 12px',
    background: 'var(--color-accent-light, #E8F5E9)',
    borderRadius: 10,
    fontSize: 14,
    lineHeight: 1.5,
    color: 'var(--color-success, #16A34A)',
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },

  explanationWrong: {
    marginTop: 12,
    padding: '10px 12px',
    background: 'var(--color-warning-light, #FFEDD5)',
    borderRadius: 10,
    fontSize: 14,
    lineHeight: 1.5,
    color: 'var(--color-warning, #EA580C)',
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },

  explanationIcon: {
    fontSize: 16,
    flexShrink: 0,
    marginTop: 1,
  },

  nextBtn: {
    marginTop: 14,
    width: '100%',
    padding: '10px 16px',
    border: 'none',
    borderRadius: 10,
    background: 'var(--color-primary, var(--elab-navy))',
    color: 'var(--color-text-inverse, #FFF)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    transition: 'background 150ms',
  },

  // ─── Result screen ───
  resultBody: {
    padding: '24px 14px',
    textAlign: 'center',
  },

  scoreCircle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--color-accent-light), var(--color-success-light))',
    border: '3px solid var(--color-accent, var(--elab-lime))',
    marginBottom: 14,
  },

  scoreNumber: {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--color-success, #16A34A)',
    fontFamily: 'var(--font-display, "Oswald", sans-serif)',
  },

  resultText: {
    margin: '0 0 18px 0',
    fontSize: 14,
    lineHeight: 1.5,
    color: 'var(--color-text-gray-500, #555)',
  },

  resultActions: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
  },

  retryBtn: {
    padding: '8px 20px',
    border: '1.5px solid var(--color-primary, var(--elab-navy))',
    borderRadius: 10,
    background: 'var(--color-bg, #FFF)',
    color: 'var(--color-primary, var(--elab-navy))',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
  },

  closeBtn: {
    padding: '8px 20px',
    border: 'none',
    borderRadius: 10,
    background: 'var(--color-primary, var(--elab-navy))',
    color: 'var(--color-text-inverse, #FFF)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
  },

  unlimBtn: {
    marginTop: 8,
    width: '100%',
    padding: '8px 14px',
    border: '1.5px solid var(--color-primary, var(--elab-navy))',
    borderRadius: 10,
    background: 'var(--color-bg, #FFF)',
    color: 'var(--color-primary, var(--elab-navy))',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    transition: 'background 150ms',
    minHeight: 56,
  },
};

export default QuizPanel;
