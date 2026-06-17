// ============================================
// ELAB Tutor - Videos & Google Meet Tab
// Extracted from ElabTutorV4.jsx
// © Andrea Marro — 13/02/2026
// ============================================

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function VideosTab({
    // YouTube state
    youtubeUrl,
    currentVideoId,
    onSetYoutubeUrl,
    onSetCurrentVideoId,
    onAddYoutubeVideo,
    // Google Meet state
    meetLink,
    meetActive,
    meetCopied,
    onSetMeetLink,
    onSetMeetActive,
    onStartMeet,
    onJoinMeet,
    onCopyMeetLink,
    onStopMeet,
    // UNLIM
    onSendToUNLIM,
}) {
    const { t } = useTranslation();
    return (
        <div className="v4-videos-container">
            <div className="v4-sub-toolbar">
                <div className="v4-toggle-group">
                    <button className={`v4-toggle-btn ${!meetActive ? 'active' : ''}`} onClick={() => onSetMeetActive(false)}>Video</button>
                    <button className={`v4-toggle-btn ${meetActive ? 'active' : ''}`} onClick={() => onSetMeetActive(true)}>Videochiamata</button>
                </div>
            </div>

            {!meetActive ? (
                <>
                    <div className="v4-video-input">
                        <input
                            type="text"
                            value={youtubeUrl}
                            onChange={(e) => onSetYoutubeUrl(e.target.value)}
                            placeholder={t('videos_tab.youtube_placeholder')}
                            onKeyDown={(e) => e.key === 'Enter' && onAddYoutubeVideo()}
                        />
                        <button className="v4-toolbar-btn primary" onClick={onAddYoutubeVideo}>Carica</button>
                    </div>

                    <div className="v4-video-player">
                        {currentVideoId ? (
                            <>
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${currentVideoId}?rel=0`}
                                    title={t('videos_tab.video_iframe_title')}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{ flex: 1 }}
                                />
                                {onSendToUNLIM && (
                                    <div style={{ padding: '8px 12px', background: 'var(--color-bg-hover)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => onSendToUNLIM(`Sto guardando un video YouTube (ID: ${currentVideoId}). Puoi aiutarmi a capire l'argomento trattato?`)}
                                            style={{
                                                background: 'none', border: '1px solid var(--color-primary)', borderRadius: 8,
                                                color: 'var(--color-primary)', padding: '6px 16px', fontSize: '0.875rem',
                                                cursor: 'pointer', fontFamily: "'Open Sans', sans-serif", fontWeight: 600,
                                                minHeight: 44,
                                            }}
                                        >
                                            Chiedi a UNLIM
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="v4-placeholder">
                                <div className="v4-icon"></div>
                                <h3>{t('videos_tab.youtube_title')}</h3>
                                <p>{t('videos_tab.youtube_subtitle')}</p>
                                <div className="v4-video-suggestions">
                                    {[
                                        { title: 'Introduzione Arduino', id: 'fCxzA9_kg6s' },
                                        { title: 'LED Blink Tutorial', id: '9kdgl5TBOvI' },
                                        { title: 'Usare i Pulsanti', id: 'CfdaJ4z4u_k' },
                                        { title: 'Buzzer e Suoni', id: 'Qf-KvR4L_xg' },
                                    ].map(v => (
                                        <button key={v.id} className="v4-toolbar-btn" onClick={() => onSetCurrentVideoId(v.id)}>{v.title}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="v4-meet-container">
                    {!meetLink.trim() || !meetActive ? (
                        <div className="v4-meet-setup">
                            <div className="v4-icon"></div>
                            <h3>{t('videos_tab.meet_title')}</h3>
                            <p>{t('videos_tab.meet_subtitle')}</p>
                            <div className="v4-meet-input-row">
                                <input
                                    type="text"
                                    value={meetLink}
                                    onChange={(e) => onSetMeetLink(e.target.value)}
                                    placeholder="https://meet.google.com/abc-defg-hij"
                                    onKeyDown={(e) => e.key === 'Enter' && onStartMeet()}
                                />
                                <button className="v4-meet-join" onClick={onStartMeet}>Avvia</button>
                            </div>
                            <button className="v4-meet-create" onClick={() => window.open('https://meet.google.com/new', '_blank', 'noopener')}>
                                Crea nuova riunione
                            </button>
                            <p className="v4-meet-hint">La videochiamata si apre in una nuova scheda del browser. Richiede un account Google.</p>
                        </div>
                    ) : (
                        <div className="v4-meet-active">
                            <div className="v4-meet-bar">
                                <span>{t('videos_tab.meet_active')}</span>
                                <button className="v4-meet-leave" onClick={onStopMeet}>✕ Termina</button>
                            </div>
                            <div className="v4-meet-card">
                                <div className="v4-meet-card-icon"></div>
                                <h3>{t('videos_tab.meet_brand')}</h3>
                                <p className="v4-meet-link-display">{meetLink}</p>
                                <div className="v4-meet-actions">
                                    <button className="v4-meet-join-btn" onClick={onJoinMeet}>
                                        Partecipa alla riunione
                                    </button>
                                    <button className="v4-meet-copy-btn" onClick={onCopyMeetLink}>
                                        {meetCopied ? '✓ Copiato!' : 'Copia link'}
                                    </button>
                                </div>
                                <p className="v4-meet-hint">La videochiamata si apre in una nuova scheda</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
