// ============================================
// Circuit Detective — Trova il guasto!
// Productive Failure (Kafai SIGCSE 2019)
// CSS classes, persistenza, cross-nav, riflessione
// © Andrea Marro — 2026
// ============================================

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BROKEN_CIRCUITS } from '../../data/broken-circuits';
import studentTracker from '../../services/studentTracker';
import { LayerBadge, DifficultyBadge, ConceptBadge, LAYER_COLORS } from './shared/LayerBadge';
import ReflectionPrompt from './shared/ReflectionPrompt';
import CrossNavigation from './shared/CrossNavigation';
import { StarDisplay, StarResult, BadgeDisplay, calculateBadge } from './shared/StarRating';
import useGameScore from '../../hooks/useGameScore';
import './TutorTools.css';
import css from './CircuitDetective.module.css';

const STORAGE_KEY = 'elab_detective_solved';

function calcDetectiveStars(hintsUsed, guessedBlind) {
  if (guessedBlind) return 1;
  if (hintsUsed === 0) return 3;
  if (hintsUsed <= 2) return 2;
  return 1;
}

const STAR_MESSAGES = {
  3: 'Detective perfetto! Zero indizi!',
  2: 'Buon lavoro, pochi indizi usati.',
  1: 'Caso risolto! Usa meno indizi la prossima volta.',
};

export default function CircuitDetective({ onSendToUNLIM, onOpenSimulator, logSession }) {
  const { t } = useTranslation();
  const { saveScore, getScore, getAllScores } = useGameScore('detective');
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [showSolution, setShowSolution] = useState(false);
  const [studentGuess, setStudentGuess] = useState('');
  const [guessSubmitted, setGuessSubmitted] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showReflection, setShowReflection] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const gameStartTime = useRef(null);
  const [solvedIds, setSolvedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solvedIds));
  }, [solvedIds]);

  const filteredCircuits = filter === 'all'
    ? BROKEN_CIRCUITS
    : BROKEN_CIRCUITS.filter(c => c.layer === filter);

  const selectCircuit = useCallback((circuit) => {
    setSelectedCircuit(circuit);
    setCurrentHintIndex(-1);
    setShowSolution(false);
    setStudentGuess('');
    setGuessSubmitted(false);
    setShowReflection(false);
    setEarnedStars(0);
    gameStartTime.current = Date.now();
    logSession?.('detective-start', { circuitId: circuit.id, difficulty: circuit.difficulty });
  }, [logSession]);

  const revealHint = () => {
    if (selectedCircuit && currentHintIndex < selectedCircuit.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
      logSession?.('detective-hint', { circuitId: selectedCircuit.id, hintIndex: currentHintIndex + 1 });
    }
  };

  const submitGuess = () => {
    if (!studentGuess.trim()) return;
    setGuessSubmitted(true);
    logSession?.('detective-guess', {
      circuitId: selectedCircuit.id,
      guess: studentGuess,
      hintsUsed: currentHintIndex + 1
    });
  };

  const revealSolution = () => {
    const hintsUsed = currentHintIndex + 1;
    const guessedBlind = studentGuess === 'Non lo so';
    const stars = calcDetectiveStars(hintsUsed, guessedBlind);
    setEarnedStars(stars);
    saveScore(selectedCircuit.id, stars);
    setShowSolution(true);
    setShowReflection(true);
    const newSolved = [...new Set([...solvedIds, selectedCircuit.id])];
    setSolvedIds(newSolved);
    const timeSpent = gameStartTime.current ? Math.round((Date.now() - gameStartTime.current) / 1000) : 0;
    studentTracker.logGameResult('circuit-detective', stars, 3, timeSpent);
    logSession?.('detective-solved', {
      circuitId: selectedCircuit.id,
      hintsUsed,
      hadGuess: guessSubmitted,
      stars
    });
  };

  const askUNLIM = () => {
    if (selectedCircuit) {
      const msg = `Sono nel Circuit Detective e sto cercando di risolvere "${selectedCircuit.title}". ${selectedCircuit.description} Puoi aiutarmi con una domanda socratica senza darmi la risposta?`;
      onSendToUNLIM?.(msg);
    }
  };

  const handleConfusedGuess = () => {
    setStudentGuess('Non lo so');
    setGuessSubmitted(true);
    logSession?.('detective-confused', { circuitId: selectedCircuit.id });
  };

  const goBack = () => {
    setSelectedCircuit(null);
    setCurrentHintIndex(-1);
    setShowSolution(false);
    setStudentGuess('');
    setGuessSubmitted(false);
    setShowReflection(false);
  };

  // === LISTA CIRCUITI ===
  if (!selectedCircuit) {
    const solvedCount = solvedIds.length;
    return (
      <div className="elab-tool">
        <div className="elab-tool__hero">
          <span className="elab-tool__hero-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <path d="M11 8v6" />
              <path d="M8 11h6" />
            </svg>
          </span>
          <h2>{t('circuit_detective.title')}</h2>
          <p>
            Ogni circuito ha un guasto nascosto. Il tuo compito: trovarlo!
            <br />Usa i suggerimenti solo se sei davvero bloccato.
          </p>
          {solvedCount > 0 && (
            <div className="elab-tool__progress-counter">
              Circuiti risolti: {solvedCount}/{BROKEN_CIRCUITS.length}
              {(() => {
                const badge = calculateBadge(getAllScores());
                return badge ? <span className={css.badgeInline}><BadgeDisplay badge={badge} /></span> : null;
              })()}
            </div>
          )}
        </div>

        <div className="elab-tool__filters">
          {['all', 'terra', 'schema', 'cielo'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`elab-tool__filter-btn ${filter === f ? 'active' : ''}`}
            >
              {f === 'all' ? 'Tutti' : LAYER_COLORS[f].label}
            </button>
          ))}
        </div>

        <div className="elab-tool__list">
          {filteredCircuits.map(circuit => {
            const isSolved = solvedIds.includes(circuit.id);
            return (
              <div
                key={circuit.id}
                onClick={() => selectCircuit(circuit)}
                className={`elab-tool__list-item elab-tool__list-item--${circuit.layer} ${isSolved ? 'completed' : ''}`}
              >
                <span className="elab-tool__list-item-icon">
                  {isSolved ? '\u2713' : circuit.icon}
                  {getScore(circuit.id) > 0 && (
                    <span className={css.starBlock}><StarDisplay stars={getScore(circuit.id)} size={12} /></span>
                  )}
                </span>
                <div className="elab-tool__list-item-body">
                  <div className={css.listBadgeRow}>
                    <h3 className={`elab-tool__list-item-title ${css.titleRow}`}>{circuit.title}</h3>
                    <LayerBadge layer={circuit.layer} />
                  </div>
                  <p className="elab-tool__list-item-desc">{circuit.description}</p>
                  <div className="elab-tool__list-item-meta">
                    <DifficultyBadge level={circuit.difficulty} />
                    <ConceptBadge concept={circuit.concept} />
                  </div>
                </div>
                <span className="elab-tool__list-item-arrow">→</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // === DETTAGLIO CIRCUITO ===
  const allHintsShown = currentHintIndex >= selectedCircuit.hints.length - 1;

  return (
    <div className="elab-tool">
      {/* © Andrea Marro — 20/02/2026 */}
      <button onClick={goBack} className="elab-tool__back">← Torna alla lista</button>

      <div className={`elab-tool__card ${css.cardBorder}`} style={{ '--card-accent-color': LAYER_COLORS[selectedCircuit.layer].text }}>
        <div className={css.headerRow}>
          <span className={css.headerIcon}>{selectedCircuit.icon}</span>
          <div>
            <h3 className={css.headerTitle}>{selectedCircuit.title}</h3>
            <div className={css.headerMeta}>
              <LayerBadge layer={selectedCircuit.layer} />
              <DifficultyBadge level={selectedCircuit.difficulty} />
            </div>
          </div>
        </div>
        <p>{selectedCircuit.description}</p>
      </div>

      {selectedCircuit.schematicText && (
        <div className="elab-tool__card">
          <h3>Schema del circuito</h3>
          <div className="elab-tool__schematic">{selectedCircuit.schematicText}</div>
        </div>
      )}

      <div className="elab-tool__card">
        <h3>La tua indagine</h3>

        {currentHintIndex >= 0 && (
          <div className={css.hintsWrap}>
            {selectedCircuit.hints.slice(0, currentHintIndex + 1).map((hint, i) => (
              <div key={i} className="elab-tool__hint">
                <strong>Suggerimento {i + 1}:</strong> {hint}
              </div>
            ))}
          </div>
        )}

        <div className="elab-tool__actions">
          {!allHintsShown && (
            <button onClick={revealHint} className="elab-tool__btn elab-tool__btn--secondary">
              Suggerimento ({currentHintIndex + 1}/{selectedCircuit.hints.length})
            </button>
          )}
          <button onClick={askUNLIM} className="elab-tool__btn elab-tool__btn--navy">
            Chiedi a UNLIM
          </button>
        </div>

        {!showSolution && (
          <div className={css.guessSection}>
            <label className={css.guessLabel}>
              Qual è la tua ipotesi?
            </label>
            <div className="elab-tool__input-row">
              <input
                type="text"
                value={studentGuess}
                onChange={e => setStudentGuess(e.target.value)}
                placeholder={t('circuit_detective.answer_placeholder')}
                className="elab-tool__input"
                onKeyDown={e => e.key === 'Enter' && submitGuess()}
                disabled={guessSubmitted}
              />
              {!guessSubmitted ? (
                <button onClick={submitGuess} disabled={!studentGuess.trim()} className="elab-tool__btn elab-tool__btn--primary">
                  Invia
                </button>
              ) : (
                <span className={css.guessCheck}>✓</span>
              )}
            </div>
            {!guessSubmitted && (
              <button onClick={handleConfusedGuess} className={css.confusedBtn}>
                Non lo so — e va bene!
              </button>
            )}
          </div>
        )}

        {guessSubmitted && studentGuess === 'Non lo so' && !showSolution && (
          <div className={`elab-tool__result elab-tool__result--correct ${css.resultMargin}`}>
            <span className="elab-tool__result-icon">?</span>
            <p className="elab-tool__result-text">{t('circuit_detective.perfect')}</p>
            <p className="elab-tool__result-sub">{t('circuit_detective.encourage')}</p>
          </div>
        )}

        {!showSolution && (guessSubmitted || allHintsShown) && (
          <button onClick={revealSolution} className="elab-tool__btn elab-tool__btn--danger elab-tool__btn--full">
            Rivela la soluzione
          </button>
        )}

        {showSolution && (
          <div className={`elab-tool__card elab-tool__card--success ${css.successCard}`}>
            <h3 className={css.successTitle}>Soluzione</h3>
            <p className={css.solutionText}>{selectedCircuit.solution}</p>
            <div className={css.starWrap}>
              <StarResult stars={earnedStars} message={STAR_MESSAGES[earnedStars]} />
            </div>
            <div className="elab-tool__learn">
              <strong>Hai imparato:</strong> {selectedCircuit.whatYouLearn}
            </div>
            <div className={`elab-tool__learn ${css.learnConcept}`}>
              <strong>Concetto:</strong> {selectedCircuit.concept}
            </div>
          </div>
        )}
      </div>

      {showReflection && showSolution && (
        <ReflectionPrompt
          toolName="detective"
          activityId={selectedCircuit.id}
          onSave={(entry) => { logSession?.('detective-reflection', entry); setShowReflection(false); }}
          onDismiss={() => setShowReflection(false)}
        />
      )}

      {showSolution && (
        <CrossNavigation links={[
          { icon: '', label: 'Prova nel Simulatore', action: () => onOpenSimulator?.(selectedCircuit.experimentId || selectedCircuit.wokwiId) },
          { icon: '←', label: 'Prossimo circuito', action: goBack }
        ]} />
      )}
    </div>
  );
}
