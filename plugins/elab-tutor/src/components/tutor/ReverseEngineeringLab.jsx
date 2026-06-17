// ============================================
// Reverse Engineering Lab
// Zhong 2021: Reverse engineering + creative self-efficacy
// CSS classes, SVG test points, anti-brute-force, riflessione
// © Andrea Marro — 2026
// ============================================

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MYSTERY_CIRCUITS } from '../../data/mystery-circuits';
import studentTracker from '../../services/studentTracker';
import { LayerBadge, VolumeBadge, LAYER_COLORS } from './shared/LayerBadge';
import { StarDisplay, StarResult, BadgeDisplay, calculateBadge } from './shared/StarRating';
import ReflectionPrompt from './shared/ReflectionPrompt';
import CrossNavigation from './shared/CrossNavigation';
import useGameScore from '../../hooks/useGameScore';
import './TutorTools.css';
import css from './ReverseEngineeringLab.module.css';

const STORAGE_KEY = 'elab_reverse_solved';
const LOCKOUT_SECONDS = 15;

function calcReverseStars(probesUsed, totalProbes) {
  const ratio = probesUsed / totalProbes;
  if (ratio <= 0.5) return 3;
  if (ratio <= 0.75) return 2;
  return 1;
}

const REVERSE_STAR_MESSAGES = {
  3: 'Brillante! Poche sonde, massimo risultato!',
  2: 'Buon lavoro, hai usato le sonde con criterio.',
  1: 'Mistero risolto! Usa meno sonde la prossima volta.',
};

export default function ReverseEngineeringLab({ onOpenSimulator, logSession, onSendToUNLIM }) {
  const { saveScore, getScore, getAllScores } = useGameScore('reverse');
  const [selected, setSelected] = useState(null);
  const [revealedPoints, setRevealedPoints] = useState([]);
  const [guess, setGuess] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [lockoutEnd, setLockoutEnd] = useState(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [filter, setFilter] = useState('all');
  const [earnedStars, setEarnedStars] = useState(0);
  const gameStartTime = useRef(null);
  const [solvedIds, setSolvedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solvedIds));
  }, [solvedIds]);

  // Lockout timer
  useEffect(() => {
    if (!lockoutEnd) { setLockoutRemaining(0); return; }
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockoutEnd - Date.now()) / 1000));
      setLockoutRemaining(remaining);
      if (remaining <= 0) { setLockoutEnd(null); setGuess(null); }
    }, 500);
    return () => clearInterval(interval);
  }, [lockoutEnd]);

  const filteredCircuits = filter === 'all'
    ? MYSTERY_CIRCUITS
    : MYSTERY_CIRCUITS.filter(c => c.layer === filter);

  const selectCircuit = useCallback((circuit) => {
    setSelected(circuit);
    setRevealedPoints([]);
    setGuess(null);
    setShowSolution(false);
    setShowReflection(false);
    setLockoutEnd(null);
    setEarnedStars(0);
    gameStartTime.current = Date.now();
    logSession?.('reverse-start', { circuitId: circuit.id });
  }, [logSession]);

  const revealPoint = (pointId) => {
    if (!revealedPoints.includes(pointId)) {
      setRevealedPoints(prev => [...prev, pointId]);
      logSession?.('reverse-probe', { circuitId: selected.id, pointId });
    }
  };

  const submitGuess = (answerIndex) => {
    setGuess(answerIndex);
    const isCorrect = answerIndex === selected.correctGuess;
    logSession?.('reverse-guess', {
      circuitId: selected.id,
      guess: selected.guessOptions[answerIndex],
      correct: isCorrect,
      probesUsed: revealedPoints.length
    });
    if (isCorrect) {
      const stars = calcReverseStars(revealedPoints.length, selected.testPoints.length);
      setEarnedStars(stars);
      saveScore(selected.id, stars);
      const timeSpent = gameStartTime.current ? Math.round((Date.now() - gameStartTime.current) / 1000) : 0;
      studentTracker.logGameResult('reverse-engineering', stars, 3, timeSpent);
      setShowSolution(true);
      setShowReflection(true);
      const newSolved = [...new Set([...solvedIds, selected.id])];
      setSolvedIds(newSolved);
    } else {
      // Anti brute-force lockout
      setLockoutEnd(Date.now() + LOCKOUT_SECONDS * 1000);
    }
  };

  const goBack = () => {
    setSelected(null);
    setRevealedPoints([]);
    setGuess(null);
    setShowSolution(false);
    setShowReflection(false);
    setLockoutEnd(null);
  };

  // === LISTA ===
  if (!selected) {
    return (
      <div className="elab-tool">
        <div className="elab-tool__hero">
          <span className="elab-tool__hero-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
              <path d="M14 7h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" />
              <path d="M4 16h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z" />
              <path d="M14 16h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z" />
              <path d="M8 9h5" />
              <path d="M8 18h5" />
              <path d="M6 12v4" />
              <path d="M16 12v4" />
            </svg>
          </span>
          <h2>Reverse Engineering Lab</h2>
          <p>
            Un circuito funziona ma c'è un componente misterioso.
            <br />Usa le sonde virtuali per scoprire cosa fa!
          </p>
          {solvedIds.length > 0 && (
            <div className="elab-tool__progress-counter">
              Misteri risolti: {solvedIds.length}/{MYSTERY_CIRCUITS.length}
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
                  <div className={css.badgeRow}>
                    <h3 className={`elab-tool__list-item-title ${css.titleRow}`}>{circuit.title}</h3>
                    <LayerBadge layer={circuit.layer} />
                    <VolumeBadge volume={circuit.volume} chapter={circuit.chapter} />
                  </div>
                  <p className="elab-tool__list-item-desc">{circuit.description}</p>
                </div>
                <span className="elab-tool__list-item-arrow">→</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // === DETTAGLIO ===
  const isCorrectGuess = guess === selected.correctGuess;
  const isLocked = lockoutEnd && Date.now() < lockoutEnd;

  return (
    <div className="elab-tool">
      <button onClick={goBack} className="elab-tool__back">← Torna alla lista</button>

      {/* Header */}
      <div className={`elab-tool__card ${css.cardBorder}`} style={{ '--card-accent-color': LAYER_COLORS[selected.layer].text }}>
        <div className={css.headerRow}>
          <span className={css.headerIcon}>{selected.icon}</span>
          <div>
            <h3 className={css.headerTitle}>{selected.title}</h3>
            {/* © Andrea Marro — 20/02/2026 */}
            <div className={css.headerMeta}>
              <LayerBadge layer={selected.layer} />
              <VolumeBadge volume={selected.volume} chapter={selected.chapter} />
            </div>
          </div>
        </div>
        <p>{selected.description}</p>
      </div>

      {/* Comportamento osservato */}
      <div className="elab-tool__card">
        <h3>Cosa osservi</h3>
        <p className={css.behaviorText}>"{selected.behavior}"</p>
      </div>

      {/* Componenti visibili */}
      <div className="elab-tool__card">
        <h3>Componenti visibili</h3>
        <div className={css.partsRow}>
          {selected.visibleParts.map((part, i) => (
            <span key={i} className="elab-tool__tag">{part}</span>
          ))}
          <span className={showSolution ? 'elab-tool__tag elab-tool__tag--revealed' : 'elab-tool__tag elab-tool__tag--mystery'}>
            {showSolution ? `\u2713 ${selected.hiddenPart.name}` : `${selected.hiddenPart.icon} ???`}
          </span>
        </div>
      </div>

      {/* SVG Circuit Board con test points */}
      <div className="elab-tool__card">
        <h3>Sonde virtuali</h3>
        <p className={css.probeHint}>
          Clicca su un punto di test per misurare. Usa meno sonde possibile!
        </p>

        {/* Mini SVG circuit board */}
        <svg viewBox="0 0 100 100" className={`elab-tool__circuit-svg ${css.circuitSvg}`}>
          {/* Board trace lines */}
          <line x1="10" y1="50" x2="90" y2="50" stroke="var(--elab-hex-334155)" strokeWidth="1" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="var(--elab-hex-334155)" strokeWidth="1" />
          {/* Test points */}
          {selected.testPoints.map((point) => {
            const isRevealed = revealedPoints.includes(point.id);
            return (
              <g key={point.id} onClick={() => !isRevealed && revealPoint(point.id)} style={{ cursor: isRevealed ? 'default' : 'pointer' }}>
                <circle cx={point.x} cy={point.y} r={isRevealed ? 6 : 4}
                  fill={isRevealed ? 'var(--elab-lime)' : '#64748B'}
                  stroke={isRevealed ? 'var(--elab-lime)' : '#64748B'}
                  strokeWidth="1.5"
                />
                {isRevealed && (
                  <circle cx={point.x} cy={point.y} r="8" fill="none" stroke="var(--elab-lime)" strokeWidth="0.5" opacity="0.5" />
                )}
                <text x={point.x} y={point.y - 8} textAnchor="middle"
                  fill={isRevealed ? 'var(--elab-lime)' : '#64748B'} fontSize="4" fontFamily="monospace"
                >
                  {point.label.split(' ')[0]}
                </text>
              </g>
            );
          })}
          {/* Mystery component */}
          <rect x="38" y="38" width="24" height="24" rx="3"
            fill="none" stroke={showSolution ? 'var(--elab-lime)' : '#ea580c'}
            strokeWidth="1.5" strokeDasharray={showSolution ? 'none' : '3,2'}
          />
          <text x="50" y="53" textAnchor="middle"
            fill={showSolution ? 'var(--elab-lime)' : '#ea580c'} fontSize="6" fontWeight="bold"
          >
            {showSolution ? '✓' : '?'}
          </text>
        </svg>

        {/* Probe details */}
        <div className={css.probeGrid}>
          {selected.testPoints.map((point) => {
            const isRevealed = revealedPoints.includes(point.id);
            return (
              <div
                key={point.id}
                onClick={() => !isRevealed && revealPoint(point.id)}
                className={`elab-tool__probe ${isRevealed ? 'revealed' : ''}`}
              >
                <div className="elab-tool__probe-label">{point.label}</div>
                {isRevealed ? (
                  <>
                    <div className="elab-tool__probe-value">{point.value}</div>
                    <div className="elab-tool__probe-hint">{point.hint}</div>
                  </>
                ) : (
                  <div className="elab-tool__probe-placeholder">Clicca per misurare...</div>
                )}
              </div>
            );
          })}
        </div>
        <div className={css.probeCounter}>
          Sonde usate: {revealedPoints.length}/{selected.testPoints.length}
        </div>
      </div>

      {/* Lockout */}
      {isLocked && (
        <div className="elab-tool__lockout">
          <p className="elab-tool__lockout-text">Raccogli più indizi prima di ritentare!</p>
          <p className="elab-tool__lockout-timer">Puoi riprovare tra {lockoutRemaining} secondi</p>
        </div>
      )}

      {/* Indovina */}
      {!showSolution && revealedPoints.length > 0 && !isLocked && (
        <div className="elab-tool__card">
          <h3>Cos'è il componente misterioso?</h3>
          <div className={css.guessGrid}>
            {selected.guessOptions.map((option, i) => {
              const isSelected = guess === i;
              const isWrong = isSelected && !isCorrectGuess;
              return (
                <button
                  key={i}
                  onClick={() => submitGuess(i)}
                  disabled={guess !== null}
                  className={`elab-tool__option ${isSelected && isCorrectGuess ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                >
                  {isSelected && isCorrectGuess && '\u2713 '}
                  {isWrong && '\u2717 '}
                  {option}
                </button>
              );
            })}
          </div>
          {guess !== null && !isCorrectGuess && (
            <p className={css.wrongHint}>
              Non è quello! Usa più sonde per raccogliere indizi.
            </p>
          )}
        </div>
      )}

      {/* Soluzione */}
      {showSolution && (
        <div className={`elab-tool__card elab-tool__card--success ${css.successCard}`}>
          <div className={css.successCenter}>
            <h3 className={css.successTitle}>Bravo! Hai scoperto il mistero!</h3>
          </div>
          <p className={css.solutionText}>{selected.solution}</p>
          <div className={css.starWrap}>
            <StarResult stars={earnedStars} message={REVERSE_STAR_MESSAGES[earnedStars]} />
          </div>
          <div className="elab-tool__learn">
            {selected.connectionToVolume}
          </div>
          <div className={css.usedProbes}>
            Hai usato {revealedPoints.length} sond{revealedPoints.length === 1 ? 'a' : 'e'} su {selected.testPoints.length} disponibili
          </div>
          {onSendToUNLIM && (
            <button
              onClick={() => onSendToUNLIM(`Nel Reverse Engineering "${selected.title}", il componente misterioso era "${selected.hiddenPart.name}". Spiegami come funziona questo componente nel circuito.`)}
              className={`elab-tool__btn elab-tool__btn--secondary elab-tool__btn--full ${css.unlimBtn}`}
            >
              UNLIM, spiegami come funziona
            </button>
          )}
        </div>
      )}

      {/* Reflection */}
      {showReflection && showSolution && (
        <ReflectionPrompt
          toolName="reverse"
          activityId={selected.id}
          onSave={(entry) => { logSession?.('reverse-reflection', entry); setShowReflection(false); }}
          onDismiss={() => setShowReflection(false)}
        />
      )}

      {/* Cross Navigation */}
      {showSolution && (
        <CrossNavigation links={[
          { icon: '←', label: 'Prossimo mistero', action: goBack }
        ]} />
      )}
    </div>
  );
}
