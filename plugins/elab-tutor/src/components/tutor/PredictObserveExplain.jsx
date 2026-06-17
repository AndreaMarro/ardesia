// ============================================
// Predict-Observe-Explain (POE)
// Zacharia & Anderson constructivist framework
// CSS classes, persistenza, no trophy, riflessione
// © Andrea Marro — 2026
// ============================================

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { POE_CHALLENGES } from '../../data/poe-challenges';
import studentTracker from '../../services/studentTracker';
import { LayerBadge, VolumeBadge, LAYER_COLORS } from './shared/LayerBadge';
import { StarDisplay, StarResult, BadgeDisplay, calculateBadge } from './shared/StarRating';
import ReflectionPrompt from './shared/ReflectionPrompt';
import CrossNavigation from './shared/CrossNavigation';
import useGameScore from '../../hooks/useGameScore';
import './TutorTools.css';
import css from './PredictObserveExplain.module.css';

const STORAGE_KEY = 'elab_poe_completed';

function calcPOEStars(isCorrect, explanationLength) {
  if (isCorrect && explanationLength >= 30) return 3;
  if (isCorrect || explanationLength >= 30) return 2;
  return 1;
}

const POE_STAR_MESSAGES = {
  3: 'Previsione corretta e spiegazione eccellente!',
  2: 'Buon lavoro! Prova a migliorare previsione o spiegazione.',
  1: 'Sfida completata! Riprova per migliorare.',
};

export default function PredictObserveExplain({ onOpenSimulator, logSession, onSendToUNLIM }) {
  const { t } = useTranslation();
  const { saveScore, getScore, getAllScores } = useGameScore('poe');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [phase, setPhase] = useState('predict');
  const [prediction, setPrediction] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [volumeFilter, setVolumeFilter] = useState(0);
  const [showReflection, setShowReflection] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const gameStartTime = useRef(null);
  const [completedIds, setCompletedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
  }, [completedIds]);

  const filtered = volumeFilter === 0
    ? POE_CHALLENGES
    : POE_CHALLENGES.filter(c => c.volume === volumeFilter);

  const selectChallenge = useCallback((challenge) => {
    setSelectedChallenge(challenge);
    setPhase('predict');
    setPrediction(null);
    setExplanation('');
    setShowReflection(false);
    setEarnedStars(0);
    gameStartTime.current = Date.now();
    logSession?.('poe-start', { challengeId: challenge.id, volume: challenge.volume });
  }, [logSession]);

  const submitPrediction = (answerIndex) => {
    setPrediction(answerIndex);
    setPhase('observe');
    logSession?.('poe-predict', {
      challengeId: selectedChallenge.id,
      prediction: answerIndex,
      correct: answerIndex === selectedChallenge.correctAnswer
    });
  };

  const goToExplain = () => setPhase('explain');

  const submitExplanation = () => {
    if (explanation.trim().length < 10) return;
    const isCorrect = prediction === selectedChallenge.correctAnswer;
    const stars = calcPOEStars(isCorrect, explanation.trim().length);
    setEarnedStars(stars);
    saveScore(selectedChallenge.id, stars);
    const newCompleted = [...new Set([...completedIds, selectedChallenge.id])];
    setCompletedIds(newCompleted);
    const timeSpent = gameStartTime.current ? Math.round((Date.now() - gameStartTime.current) / 1000) : 0;
    studentTracker.logGameResult('predict-observe-explain', stars, 3, timeSpent);
    logSession?.('poe-explain', {
      challengeId: selectedChallenge.id,
      correct: isCorrect,
      explanation,
      stars
    });
    setPhase('complete');
    setShowReflection(true);
  };

  const goBack = () => {
    setSelectedChallenge(null);
    setPhase('predict');
    setPrediction(null);
    setExplanation('');
    setShowReflection(false);
  };

  // === LISTA SFIDE ===
  if (!selectedChallenge) {
    return (
      <div className="elab-tool">
        <div className="elab-tool__hero">
          <span className="elab-tool__hero-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 5v-2" />
              <path d="M12 21v2" />
            </svg>
          </span>
          <h2>{t('predict_observe_explain.title')}</h2>
          <p>
            Prima fai la tua previsione, poi scopri cosa succede davvero!
            <br />Sbagliare la previsione è il modo migliore per imparare.
          </p>
          {completedIds.length > 0 && (
            <div className="elab-tool__progress-counter">
              Sfide completate: {completedIds.length}/{POE_CHALLENGES.length}
              {(() => {
                const badge = calculateBadge(getAllScores());
                return badge ? <span className={css.badgeInline}><BadgeDisplay badge={badge} /></span> : null;
              })()}
            </div>
          )}
        </div>

        <div className="elab-tool__filters">
          {[0, 1, 2, 3].map(v => (
            <button
              key={v}
              onClick={() => setVolumeFilter(v)}
              className={`elab-tool__filter-btn ${volumeFilter === v ? 'active' : ''}`}
            >
              {v === 0 ? 'Tutti' : `Volume ${v}`}
            </button>
          ))}
        </div>

        <div className="elab-tool__list">
          {filtered.map(challenge => {
            const isCompleted = completedIds.includes(challenge.id);
            return (
              <div
                key={challenge.id}
                onClick={() => selectChallenge(challenge)}
                className={`elab-tool__list-item elab-tool__list-item--${challenge.layer} ${isCompleted ? 'completed' : ''}`}
              >
                <span className="elab-tool__list-item-icon">
                  {isCompleted ? '\u2713' : '\u25CF'}
                  {getScore(challenge.id) > 0 && (
                    <span className={css.starBlock}><StarDisplay stars={getScore(challenge.id)} size={12} /></span>
                  )}
                </span>
                <div className="elab-tool__list-item-body">
                  <div className={css.badgeRow}>
                    <VolumeBadge volume={challenge.volume} chapter={challenge.chapter} />
                    <LayerBadge layer={challenge.layer} />
                  </div>
                  <p className={css.questionText}>{challenge.question}</p>
                  <span className={`elab-tool__badge elab-tool__badge--concept ${css.conceptBadge}`}>{challenge.concept}</span>
                </div>
                <span className="elab-tool__list-item-arrow">→</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // === FASI POE ===
  const isCorrect = prediction === selectedChallenge.correctAnswer;

  return (
    <div className="elab-tool">
      <button onClick={goBack} className="elab-tool__back">← Torna alla lista</button>

      {/* Progress bar */}
      <div className="elab-tool__progress-bar">
        {['predict', 'observe', 'explain'].map((p, i) => {
          const phases = ['predict', 'observe', 'explain', 'complete'];
          const currentIdx = phases.indexOf(phase);
          return <div key={p} className={`elab-tool__progress-step ${i <= currentIdx ? 'active' : ''}`} />;
        })}
      </div>

      {/* Header */}
      <div className={`elab-tool__card ${css.cardBorder}`} style={{ '--card-accent-color': LAYER_COLORS[selectedChallenge.layer].text }}>
        <div className={css.cardHeaderRow}>
          <VolumeBadge volume={selectedChallenge.volume} chapter={selectedChallenge.chapter} />
          <LayerBadge layer={selectedChallenge.layer} />
        </div>
        <h3 className={css.cardTitle}>{selectedChallenge.question}</h3>
      </div>

      {/* FASE 1: PREDICT */}
      {phase === 'predict' && (
        <div className="elab-tool__card">
          <h3>Fase 1: Prevedi</h3>
          <p className={css.phaseHint}>Cosa pensi che succederà? Scegli la tua risposta:</p>
          <div className={css.optionsGrid}>
            {/* © Andrea Marro — 20/02/2026 */}
            {selectedChallenge.options.map((option, i) => (
              <button key={i} onClick={() => submitPrediction(i)} className="elab-tool__option">
                <span className="elab-tool__option-letter">{String.fromCharCode(65 + i)}</span>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FASE 2: OBSERVE */}
      {phase === 'observe' && (
        <div className="elab-tool__card">
          <h3>Fase 2: Osserva</h3>

          <div className="elab-tool__compare">
            <div className="elab-tool__compare-box">
              <div className="elab-tool__compare-label">La tua previsione</div>
              <div className="elab-tool__compare-value">{selectedChallenge.options[prediction]}</div>
            </div>
            <div className={`elab-tool__compare-box ${css['compareBox--result']}`} style={{
              '--compare-border': isCorrect ? 'var(--elab-lime)' : '#ef4444',
              '--compare-bg': isCorrect ? 'rgba(145,191,69,0.05)' : 'rgba(239,68,68,0.05)'
            }}>
              <div className="elab-tool__compare-label">Cosa succede davvero</div>
              <div className="elab-tool__compare-value">{selectedChallenge.options[selectedChallenge.correctAnswer]}</div>
            </div>
          </div>

          <div className={`elab-tool__result ${isCorrect ? 'elab-tool__result--correct' : 'elab-tool__result--incorrect'} ${css.resultMargin}`}>
            <span className="elab-tool__result-icon">{isCorrect ? '\u2713' : '?'}</span>
            <p className="elab-tool__result-text">
              {isCorrect ? 'Hai previsto correttamente!' : 'La realtà è diversa dalla tua previsione!'}
            </p>
            {!isCorrect && (
              <p className="elab-tool__result-sub">
                Nessun problema — scoprire dove sbagliamo è come impariamo davvero!
              </p>
            )}
          </div>

          <div className={css.buttonRow}>
            {(selectedChallenge.experimentId || selectedChallenge.wokwiId) && (
              <button
                onClick={() => onOpenSimulator?.(selectedChallenge.experimentId || selectedChallenge.wokwiId)}
                className={`elab-tool__btn elab-tool__btn--secondary ${css.flexOne}`}
              >
                Provalo nel simulatore
              </button>
            )}
            {!isCorrect && onSendToUNLIM && (
              <button
                onClick={() => onSendToUNLIM(`Nella sfida POE "${selectedChallenge.question}", ho previsto "${selectedChallenge.options[prediction]}" ma la risposta corretta è "${selectedChallenge.options[selectedChallenge.correctAnswer]}". Puoi spiegarmi perché?`)}
                className={`elab-tool__btn elab-tool__btn--secondary ${css.flexOne}`}
              >
                Chiedi a UNLIM perché
              </button>
            )}
            <button onClick={goToExplain} className={`elab-tool__btn elab-tool__btn--navy ${css.flexOne}`}>
              Continua → Spiega
            </button>
          </div>
        </div>
      )}

      {/* FASE 3: EXPLAIN */}
      {phase === 'explain' && (
        <div className="elab-tool__card">
          <h3>Fase 3: Spiega</h3>
          <p className={css.explainHint}>
            {isCorrect
              ? 'Bravo! Prova a spiegare PERCHÉ hai ragione. Come funziona?'
              : 'Perché pensi che la realtà sia diversa dalla tua previsione?'}
          </p>
          <textarea
            value={explanation}
            onChange={e => setExplanation(e.target.value)}
            placeholder={t('predict_observe_explain.explain_placeholder')}
            className="elab-tool__textarea"
          />
          {explanation.trim().length > 0 && explanation.trim().length < 10 && (
            <p className={css.shortWarning}>
              Scrivi almeno qualche parola per riflettere...
            </p>
          )}
          <div className={css.explainActions}>
            {onSendToUNLIM && (
              <button
                onClick={() => onSendToUNLIM(`Nella sfida POE "${selectedChallenge.question}", aiutami a capire: ${isCorrect ? 'perché la mia previsione era corretta?' : 'perché il risultato è diverso dalla mia previsione?'}`)}
                className={`elab-tool__btn elab-tool__btn--secondary ${css.flexOne}`}
              >
                UNLIM, aiutami
              </button>
            )}
            <button
              onClick={submitExplanation}
              disabled={explanation.trim().length < 10}
              className={`elab-tool__btn elab-tool__btn--primary ${css.flexTwo}`}
            >
              Completa
            </button>
          </div>
        </div>
      )}

      {/* COMPLETO */}
      {phase === 'complete' && (
        <div className="elab-tool__card">
          <div className={css.completeCenter}>
            <h3 className={css.completeTitle}>Ecco la spiegazione</h3>
          </div>

          <div className={css.starResultWrap}>
            <StarResult stars={earnedStars} message={POE_STAR_MESSAGES[earnedStars]} />
          </div>

          <div className={css.explanationBox}>
            <p>{selectedChallenge.explanation}</p>
          </div>

          {selectedChallenge.funFact && (
            <div className="elab-tool__funfact">
              <span className="elab-tool__funfact-label">Lo sapevi? </span>
              <span className="elab-tool__funfact-text">{selectedChallenge.funFact}</span>
            </div>
          )}

          <div className={css.completeActions}>
            <button onClick={goBack} className={`elab-tool__btn elab-tool__btn--secondary ${css.flexOne}`}>
              ← Altra sfida
            </button>
            <button onClick={() => onOpenSimulator?.(selectedChallenge.experimentId || selectedChallenge.wokwiId)} className={`elab-tool__btn elab-tool__btn--navy ${css.flexOne}`}>
              Prova nel Simulatore
            </button>
          </div>
        </div>
      )}

      {/* Reflection */}
      {showReflection && phase === 'complete' && (
        <ReflectionPrompt
          toolName="poe"
          activityId={selectedChallenge.id}
          onSave={(entry) => { logSession?.('poe-reflection', entry); setShowReflection(false); }}
          onDismiss={() => setShowReflection(false)}
        />
      )}
    </div>
  );
}
