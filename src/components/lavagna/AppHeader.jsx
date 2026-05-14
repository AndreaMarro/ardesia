import React from 'react';
import css from './AppHeader.module.css';

export default function AppHeader({
  experimentName = 'Scegli un esperimento...',
  totalSteps = 0,
  currentStep = 0,
  onPickerOpen,
  onGalileoToggle,
  galileoOpen = false,
  onVideoToggle,
  videoOpen = false,
  onVolumeToggle,
  volumeOpen = false,
  onPercorsoToggle,
  percorsoOpen = false,
  onFumettoOpen,
  // iter 45 fix Andrea video2 06/05/2026 B3 "manca il pulsante per il salvataggio
  // della sessione": esponiamo un pulsante esplicito Salva Sessione che il docente
  // può usare per finalizzare la sessione corrente (chiama finaliseSession +
  // saveSession Supabase via useSessionTracker hook). Auto-save su visibility/
  // beforeunload rimane invariato.
  onSaveSession,
  activeTab = 'lavagna',
  onTabChange,
  showClasseTab = false,
  showProgressiTab = false,
  showLezioneTab = false,
}) {
  return (
    <header className={css.header} role="banner">
      {/* Left: brand + tabs */}
      <div className={css.left}>
        <div className={css.brand}>
          <img
            src="/assets/mascot/logo-senza-sfondo.png"
            alt="ELAB"
            className={css.brandLogo}
            width="28"
            height="28"
          />
          <span className={css.brandText}>ELAB</span>
        </div>
        {(showClasseTab || showProgressiTab || showLezioneTab) && (
          <div className={css.tabs}>
            <button
              className={`${css.tabBtn} ${activeTab === 'lavagna' ? css.tabBtnActive : ''}`}
              onClick={() => onTabChange?.('lavagna')}
              aria-label="Lavagna"
            >Lavagna</button>
            {showLezioneTab && (
              <button
                className={`${css.tabBtn} ${activeTab === 'lezione' ? css.tabBtnActive : ''}`}
                onClick={() => onTabChange?.('lezione')}
                aria-label="Lezione Guidata"
              >Lezione Guidata</button>
            )}
            {showClasseTab && (
              <button
                className={`${css.tabBtn} ${activeTab === 'classe' ? css.tabBtnActive : ''}`}
                onClick={() => onTabChange?.('classe')}
                aria-label="Dashboard classe"
              >Classe</button>
            )}
            {showProgressiTab && (
              <button
                className={`${css.tabBtn} ${activeTab === 'progressi' ? css.tabBtnActive : ''}`}
                onClick={() => onTabChange?.('progressi')}
                aria-label="I miei progressi"
              >Progressi</button>
            )}
          </div>
        )}
      </div>

      {/* Center: experiment name + progress */}
      <div className={css.center}>
        <span
          className={css.experimentName}
          onClick={onPickerOpen}
          role={onPickerOpen ? 'button' : undefined}
          tabIndex={onPickerOpen ? 0 : undefined}
          aria-label={onPickerOpen ? `Esperimento: ${experimentName}. Clicca per cambiare.` : `Esperimento: ${experimentName}.`}
          onKeyDown={onPickerOpen ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPickerOpen?.(); } } : undefined}
        >
          {experimentName.replace(/^Cap\.\s*\d+\s*Esp\.\s*\d+\s*-\s*/i, '')}
        </span>
        {totalSteps > 0 && (
          <div className={css.progressDots} aria-label={`Passo ${currentStep} di ${totalSteps}`}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`${css.dot} ${i < currentStep ? css.dotCompleted : ''} ${i === currentStep ? css.dotCurrent : ''}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: Manuale + Video */}
      <div className={css.right}>
        {/* Percorso button removed — now accessed via build mode selector (Percorso = ex Libero) */}
        {onGalileoToggle && (
          <button
            className={`${css.btn} ${css.btnLabeled} ${galileoOpen ? css.btnActive : ''}`}
            onClick={onGalileoToggle}
            aria-label={galileoOpen ? 'Nascondi chat UNLIM' : 'Mostra chat UNLIM'}
            aria-pressed={galileoOpen}
            title="Apri la chat UNLIM"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 4h12a2 2 0 012 2v7a2 2 0 01-2 2H8l-4 3v-3a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M6 8h8M6 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className={css.btnText}>UNLIM</span>
          </button>
        )}
        {onVolumeToggle && (
          <button
            className={`${css.btn} ${css.btnLabeled} ${volumeOpen ? css.btnActive : ''}`}
            onClick={onVolumeToggle}
            aria-label={volumeOpen ? 'Chiudi manuale' : 'Apri manuale'}
            aria-pressed={volumeOpen}
            title="Apri il manuale del volume"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 3c0-1 1-2 2-2h8c1 0 2 1 2 2v14c0 1-1 2-2 2H6c-1 0-2-1-2-2V3z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 7h4M8 10h4M8 13h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span className={css.btnText}>Manuale</span>
          </button>
        )}
        {onVideoToggle && (
          <button
            className={`${css.btn} ${videoOpen ? css.btnActive : ''}`}
            onClick={onVideoToggle}
            aria-label={videoOpen ? 'Chiudi video' : 'Apri video'}
            aria-pressed={videoOpen}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M14 8l4-2v8l-4-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span>Video</span>
          </button>
        )}
        {/* iter 45 fix Andrea video2 06/05/2026 B3: Salva Sessione esplicito */}
        {onSaveSession && (
          <button
            type="button"
            className={`${css.btn} ${css.btnLabeled}`}
            onClick={onSaveSession}
            aria-label="Salva la sessione corrente"
            title="Salva sessione (la salviamo anche automaticamente all'uscita)"
            data-testid="btn-salva-sessione"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 3h11l3 3v11H3V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M6 3v5h7V3M6 17v-6h8v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span className={css.btnText}>Salva</span>
          </button>
        )}
        {onFumettoOpen && (
          <button
            className={`${css.btn} ${css.btnLabeled}`}
            onClick={onFumettoOpen}
            aria-label="Apri Fumetto Report della sessione"
            title="Genera Fumetto Report"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect x="2" y="3" width="7" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11" y="3" width="7" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="2" y="11" width="16" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className={css.btnText}>Fumetto</span>
          </button>
        )}
      </div>
    </header>
  );
}
