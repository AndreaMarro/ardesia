/**
 * ELAB Simulator — ExperimentPicker
 * Selezione volume -> capitolo -> esperimento
 * Pattern UI a 3 schermate (come WokwiSimulator)
 * Design: Apple card-style, Tinkercad-inspired
 * (c) Andrea Marro — 10/02/2026, UI-7 polish 13/02/2026
 */

import React, { useState, useMemo } from 'react';
import { VOLUMES, getExperimentsByVolume, getChaptersForVolume } from '../../../data/experiments-index';

const VOL_COLORS = {
  1: 'var(--color-vol1, var(--elab-lime))',
  2: 'var(--color-vol2, var(--elab-orange))',
  3: 'var(--color-vol3, var(--elab-red))',
};

const VOL_BG = {
  1: 'var(--color-vol1-gradient, linear-gradient(135deg, #f1f8e9, #e8f5e9))',
  2: 'var(--color-vol2-gradient, linear-gradient(135deg, #fff8e1, #fff3e0))',
  3: 'var(--color-vol3-gradient, linear-gradient(135deg, #fce4ec, #ffebee))',
};

const VOL_PATTERN = {
  1: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5v10M30 45v10M5 30h10M45 30h10' stroke='%237CB34220' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%237CB34215'/%3E%3C/svg%3E")`,
  2: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5v10M30 45v10M5 30h10M45 30h10' stroke='%23E8941C20' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%23E8941C15'/%3E%3C/svg%3E")`,
  3: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5v10M30 45v10M5 30h10M45 30h10' stroke='%23E54B3D20' stroke-width='1.5' fill='none'/%3E%3Ccircle cx='30' cy='30' r='3' fill='%23E54B3D15'/%3E%3C/svg%3E")`,
};

/* Map volume index (1,2,3) to kit name expected by backend */
const volumeToKitName = (volNum) => `Volume ${volNum}`;

const ExperimentPicker = ({ onSelectExperiment, currentExperimentId = null, userKits = null }) => {
  const [view, setView] = useState('volumes');
  const [selectedVolume, setSelectedVolume] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  // Build mode selector REMOVED from here — only the main one in NewElabSimulator remains.
  // Experiments always start as 'complete' (Già Montato), user switches via the main bar.

  /* userKits = null means bypass (admin/teacher), [] = no kits, ['Volume 1', ...] = specific access */
  const hasVolumeAccess = (volNum) => {
    if (userKits === null) return true; // admin/teacher bypass
    return userKits.includes(volumeToKitName(volNum));
  };

  // G22: Auto-skip volume selection when only 1 volume is accessible
  const accessibleVolumes = useMemo(() =>
    [1, 2, 3].filter(v => hasVolumeAccess(v)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userKits]
  );
  React.useEffect(() => {
    if (view === 'volumes' && accessibleVolumes.length === 1 && !selectedVolume) {
      setSelectedVolume(accessibleVolumes[0]);
      setView('chapters');
    }
  }, [view, accessibleVolumes, selectedVolume]);

  const volumeExperiments = useMemo(() => {
    if (!selectedVolume) return [];
    return getExperimentsByVolume(selectedVolume);
  }, [selectedVolume]);

  const chapters = useMemo(() => {
    if (!selectedVolume) return [];
    return getChaptersForVolume(selectedVolume);
  }, [selectedVolume]);

  const chapterExperiments = useMemo(() => {
    if (!selectedChapter) return [];
    return volumeExperiments.filter(e => e.chapter === selectedChapter);
  }, [selectedChapter, volumeExperiments]);

  // --- Schermata 1: Selezione Volume ---
  if (view === 'volumes') {
    return (
      <div style={S.panel}>
        <div style={S.panelHeader}>
          <span style={S.panelHeaderTitle}>Scegli un Volume</span>
        </div>
        <div style={S.panelBody}>
          <div style={S.volGrid}>
            {VOLUMES.map((vol, i) => {
              const volNum = i + 1;
              const volColor = VOL_COLORS[volNum];
              const count = vol.experiments.length;

              if (!hasVolumeAccess(volNum)) return null;

              return (
                <button
                  key={volNum}
                  onClick={() => {
                    setSelectedVolume(volNum);
                    setView('chapters');
                  }}
                  style={{
                    ...S.volCard,
                    background: VOL_BG[volNum],
                    borderColor: volColor,
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 6px 20px ${volColor}30`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                  }}
                >
                  <span style={{ fontSize: 32, lineHeight: 1 }}>{vol.icon}</span>
                  <span style={{ ...S.volTitle, color: volColor }}>{vol.title}</span>
                  <span style={S.volSubtitle}>{vol.subtitle}</span>
                  <span style={{ ...S.volBadge, background: volColor }}>
                    {`${count} esperimenti`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- Schermata 2: Selezione Capitolo ---
  if (view === 'chapters') {
    const volColor = VOL_COLORS[selectedVolume];
    const volInfo = VOLUMES[selectedVolume - 1];

    return (
      <div style={{ ...S.panel, backgroundImage: VOL_PATTERN[selectedVolume] }}>
        <div style={S.panelHeader}>
          <button onClick={() => setView('volumes')} style={S.backBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 4 }}>
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volumi
          </button>
          <span style={{ ...S.panelHeaderTitle, color: volColor, fontSize: 14 }}>
            {volInfo?.icon} {volInfo?.title}
          </span>
        </div>
        <div style={S.panelBody}>
          <div style={S.chapterList}>
            {chapters.map(chapter => {
              const expCount = volumeExperiments.filter(e => e.chapter === chapter).length;
              return (
                <button
                  key={chapter}
                  onClick={() => {
                    setSelectedChapter(chapter);
                    setView('experiments');
                  }}
                  className="ep-chapter-card"
                  style={{ ...S.chapterCard, borderTop: '4px solid ' + volColor }}
                >
                  <div style={{ ...S.chapterAccent, background: volColor }} />
                  <span style={S.chapterTitle}>{chapter}</span>
                  <span style={S.chapterCount}>{expCount} esp.</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--color-sim-text-muted)', flexShrink: 0 }}>
                    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- Schermata 3: Lista Esperimenti ---
  if (view === 'experiments') {
    const volColor = VOL_COLORS[selectedVolume];
    return (
      <div style={{ ...S.panel, backgroundImage: VOL_PATTERN[selectedVolume] }}>
        <div style={S.panelHeader}>
          <button onClick={() => setView('chapters')} style={S.backBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: 4 }}>
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Capitoli
          </button>
          <span style={{ ...S.panelHeaderTitle, color: volColor, fontSize: 14 }}>
            {selectedChapter}
          </span>
        </div>

        {/* Build mode selector removed — only the main one in NewElabSimulator.jsx */}

        <div style={S.panelBody}>
          <div style={S.expList}>
            {chapterExperiments.map(exp => {
              const isCurrent = currentExperimentId === exp.id;
              const hasBuildSteps = exp.buildSteps && exp.buildSteps.length > 0;
              return (
                <button
                  key={exp.id}
                  aria-label={`Carica esperimento: ${exp.title}`}
                  onClick={() => onSelectExperiment({ ...exp, buildMode: hasBuildSteps ? 'guided' : false })}
                  className={isCurrent ? '' : 'ep-exp-card'}
                  style={{
                    ...S.expCard,
                    background: isCurrent ? `${volColor}12` : 'var(--color-bg)',
                    borderColor: isCurrent ? volColor : 'var(--color-border)',
                  }}
                >
                  <div style={S.expTop}>
                    <span style={{ fontSize: 20, lineHeight: 1 }}>{exp.icon}</span>
                    <span style={S.expTitle}>{exp.title}</span>
                  </div>
                  <p style={S.expDesc}>{exp.desc}</p>
                  <div style={S.expMeta}>
                    <span style={{
                      ...S.diffBadge,
                      background: exp.difficulty <= 1 ? 'var(--color-accent-light, #E8F5E9)'
                        : exp.difficulty <= 2 ? 'var(--color-vol2-light, #FFF3E0)' : 'var(--color-vol3-light, #FFEBEE)',
                      color: exp.difficulty <= 1 ? 'var(--color-success, #2E7D32)'
                        : exp.difficulty <= 2 ? 'var(--color-vol2-dark, #E65100)' : 'var(--color-danger, #C62828)',
                    }}>
                      {'★'.repeat(exp.difficulty)}{'☆'.repeat(3 - exp.difficulty)}
                    </span>
                    <span style={S.modeTag}>
                      {exp.simulationMode === 'avr' ? 'Arduino' : 'Circuito'}
                    </span>
                    {hasBuildSteps && (
                      <span style={S.buildBadge}>Passo-Passo</span>
                    )}
                    {exp.advancedProject && (
                      <span style={S.advancedBadge}>Progetto avanzato</span>
                    )}
                    {exp.estimatedMinutes && (
                      <span style={S.timeBadge}>~{exp.estimatedMinutes} min</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ─── Styles (Apple card pattern) ───
const S = {
  panel: {
    backgroundColor: 'var(--color-bg, #FFFFFF)',
    borderRadius: 12,
    border: '1px solid var(--color-border, #E5E5E5)',
    boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06))',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-sans)',
    height: '100%',
    maxHeight: 'calc(100dvh - 120px)',
  },

  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    borderBottom: '1px solid var(--color-border, #E5E5E5)',
    background: 'var(--color-bg-secondary, #FAFAFA)',
    minHeight: 48,
  },

  panelHeaderTitle: {
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    color: 'var(--color-text, #1A1A2E)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  panelBody: {
    padding: 16,
    overflowY: 'auto',
    flex: 1,
  },

  backBtn: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: 14,
    color: 'var(--color-primary, var(--elab-navy))',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    padding: '8px 12px',
    borderRadius: 8,
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    transition: 'background 150ms',
  },

  // Volume cards
  volGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },

  volCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '20px 16px',
    border: '2px solid',
    borderRadius: 14,
    cursor: 'pointer',
    transition: 'all 200ms ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    outline: 'none',
    fontSize: 14,
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-text, #1A1A2E)',
  },

  volTitle: {
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  volSubtitle: {
    fontSize: 14,
    color: 'var(--color-text-gray-400, #666)',
    textAlign: 'center',
    lineHeight: 1.4,
  },

  volBadge: {
    fontSize: 14,
    color: 'var(--color-text-inverse, #fff)',
    padding: '5px 14px',
    borderRadius: 20,
    fontWeight: 600,
    marginTop: 4,
  },

  // Chapter list
  chapterList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },

  chapterCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px',
    background: 'var(--color-bg, #FFFFFF)',
    border: '1px solid var(--color-border, #E5E5E5)',
    borderRadius: 10,
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: 'var(--shadow-xs, 0 1px 3px rgba(0,0,0,0.04))',
    transition: 'all 150ms ease',
    minHeight: 48,
    outline: 'none',
    fontSize: 14,
    fontFamily: 'var(--font-sans)',
    color: 'var(--color-text-gray-700, #333)',
  },

  chapterAccent: {
    width: 4,
    height: 24,
    borderRadius: 2,
    flexShrink: 0,
  },

  chapterTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-gray-700, #333)',
    fontFamily: 'var(--font-display)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },

  chapterCount: {
    fontSize: 14,
    color: 'var(--color-text-gray-200, #737373)',
    fontFamily: 'var(--font-sans)',
    flexShrink: 0,
  },

  // Segmented control
  segmentedWrap: {
    padding: '0 16px 0',
    borderBottom: '1px solid var(--color-border, #E5E5E5)',
    background: 'var(--color-bg-secondary, #FAFAFA)',
    paddingBottom: 12,
  },

  segmentedControl: {
    display: 'flex',
    gap: 0,
    background: 'var(--color-bg-tertiary, #ECECF1)',
    borderRadius: 10,
    padding: 3,
  },

  segmentBtn: {
    flex: 1,
    border: 'none',
    borderRadius: 8,
    padding: '8px 4px',
    fontSize: 14,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    transition: 'all 200ms',
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  },

  // Experiment cards
  expList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },

  expCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '14px 16px',
    border: '1px solid var(--color-border, #E5E5E5)',
    borderRadius: 12,
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: 'var(--shadow-xs, 0 1px 3px rgba(0,0,0,0.04))',
    transition: 'all 150ms ease',
    outline: 'none',
  },

  expTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  expTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text, #1A1A2E)',
    fontFamily: 'var(--font-display)',
  },

  expDesc: {
    fontSize: 14,
    color: 'var(--color-text-gray-400, #666)',
    margin: 0,
    lineHeight: 1.5,
    fontFamily: 'var(--font-sans)',
  },

  expMeta: {
    display: 'flex',
    gap: 6,
    marginTop: 2,
    flexWrap: 'wrap',
  },

  diffBadge: {
    fontSize: 14,
    padding: '3px 10px',
    borderRadius: 12,
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
  },

  modeTag: {
    fontSize: 14,
    padding: '3px 10px',
    borderRadius: 12,
    background: 'var(--color-primary-light, #EEF2FF)',
    color: 'var(--color-primary-dark, #4338CA)',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
  },

  buildBadge: {
    fontSize: 14,
    padding: '3px 10px',
    borderRadius: 12,
    background: 'var(--color-accent-light, #E8F5E9)',
    color: 'var(--color-success, #2E7D32)',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
  },

  advancedBadge: {
    fontSize: 14,
    padding: '3px 10px',
    borderRadius: 12,
    background: '#fff3e0', // palette
    color: '#e65100', // palette
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
  },

  timeBadge: {
    fontSize: 14,
    padding: '3px 10px',
    borderRadius: 12,
    background: 'var(--color-bg-tertiary, #F5F5F5)',
    color: 'var(--color-text-gray-400, #666)',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
  },
};

export default ExperimentPicker;
