// ============================================
// ELAB Tutor - Manual & Document Viewer Tab
// Extracted from ElabTutorV4.jsx
// © Andrea Marro — 13/02/2026
// ============================================

import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { processDocumentUpload } from './utils/documentConverters';
import { showToast } from '../common/Toast';

export default function ManualTab({
    // Volume state
    selectedVolume,
    volumePages,
    loadingVolume,
    volumeProgress,
    onLoadVolume,
    // Document state
    uploadedDocs,
    currentDoc,
    currentDocPage,
    viewMode,
    fitMode,
    pdfZoom,
    // Callbacks
    onSetUploadedDocs,
    onSetCurrentDoc,
    onSetCurrentDocPage,
    onSetViewMode,
    onSetFitMode,
    onSetPdfZoom,
    onSendDocScreenshot,
    onToggleFullscreen,
    // UI flags
    isFullscreen,
    docViewerRef,
}) {
    const { t } = useTranslation();
    const docInputRef = useRef(null);

    const handleDocumentUpload = async (e) => {
        const files = Array.from(e.target.files || e.dataTransfer?.files || []);
        if (!files.length) return;

        const results = await processDocumentUpload(files);
        for (const result of results) {
            if (result.error) {
                showToast(result.error, 'error');
            } else if (result.doc) {
                onSetUploadedDocs(prev => [...prev, result.doc]);
                onSetCurrentDoc(result.doc);
                onSetCurrentDocPage(0);
                onSetViewMode('document');
            }
        }

        // Reset input
        if (docInputRef.current) docInputRef.current.value = '';
    };

    return (
        <div className="v4-manual">
            {/* Sub-toolbar */}
            {!isFullscreen && (
                <div className="v4-sub-toolbar">
                    <div className="v4-toggle-group" role="group" aria-label="Modalità visualizzazione">
                        <button className={`v4-toggle-btn ${viewMode === 'manual' ? 'active' : ''}`} onClick={() => onSetViewMode('manual')} aria-pressed={viewMode === 'manual'}>Manuali</button>
                        <button className={`v4-toggle-btn ${viewMode === 'document' ? 'active' : ''}`} onClick={() => onSetViewMode('document')} aria-pressed={viewMode === 'document'}>Documenti</button>
                    </div>

                    <input type="file" ref={docInputRef} onChange={handleDocumentUpload} accept="image/*,.pdf,.docx,.pptx,.txt,.md,.csv,.json,.xml,.ino,.c,.cpp,.py,.js,.css,.html" multiple style={{ display: 'none' }} aria-label={t('manual_tab.upload_file_aria')} />
                    <button className="v4-toolbar-btn" onClick={() => docInputRef.current?.click()} aria-label="Carica file">Carica</button>
                    <button className="v4-toolbar-btn primary" onClick={onSendDocScreenshot} aria-label="Invia questa pagina a UNLIM per fartela spiegare">Spiega questa pagina</button>

                    <div className="v4-toolbar-spacer" />

                    <button className="v4-toolbar-btn icon-only" onClick={onToggleFullscreen} aria-label={isFullscreen ? 'Esci da fullscreen' : 'Fullscreen'} aria-pressed={isFullscreen}><span aria-hidden="true">⛶</span></button>
                </div>
            )}

            {/* VISUALIZZAZIONE MANUALI ELAB */}
            {viewMode === 'manual' && (
                <>
                    <div className="v4-volume-selector">
                        {[1, 2, 3].map(v => {
                            // S112: count only actually rendered pages (non-null entries)
                            const totalPages = volumePages[v]?.length || 0;
                            return (
                                <button key={v} className={`v4-volume-btn ${selectedVolume === v ? 'active' : ''}`} onClick={() => onLoadVolume(v)} disabled={loadingVolume !== null}>
                                    {loadingVolume === v ? '...' : ''} Volume {v}
                                    {totalPages > 0 && <span className="vol-count">({totalPages} pag)</span>}
                                </button>
                            );
                        })}
                    </div>

                    {loadingVolume !== null && (
                        <div className="v4-loading">
                            <div className="v4-spinner"></div>
                            <h3>{t('manual_tab.loading_volume', { vol: loadingVolume })}</h3>
                            {/* S112: Download progress bar */}
                            {volumeProgress !== null && volumeProgress !== undefined && (
                                <div style={{ width: '60%', maxWidth: 300, margin: '12px auto', background: 'var(--elab-hex-e0e0e0)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                                    <div style={{ width: `${volumeProgress}%`, height: '100%', background: volumeProgress < 90 ? 'var(--elab-navy)' : 'var(--elab-lime)', borderRadius: 6, transition: 'width 0.3s ease, background 0.3s ease' }} />
                                </div>
                            )}
                            <p>{volumeProgress !== null && volumeProgress < 90
                                ? `Scaricamento PDF... ${volumeProgress}%`
                                : volumeProgress !== null && volumeProgress < 100
                                    ? 'Preparazione pagine...'
                                    : 'Quasi pronto...'
                            }</p>
                        </div>
                    )}

                    {!loadingVolume && selectedVolume && volumePages[selectedVolume]?.length > 0 && (
                        <>
                            <div className="v4-page-nav">
                                <button onClick={() => onSetCurrentDocPage(p => Math.max(0, p - 1))} disabled={currentDocPage === 0} aria-label={t('manual_tab.prev_page_aria')}><span aria-hidden="true">←</span></button>
                                <input type="number" className="v4-page-input" value={currentDocPage + 1} onChange={(e) => { const p = parseInt(e.target.value) - 1; if (p >= 0 && p < volumePages[selectedVolume].length) onSetCurrentDocPage(p); }} min="1" max={volumePages[selectedVolume].length} aria-label="Numero pagina" />
                                <span className="v4-page-count">/ {volumePages[selectedVolume].length}</span>
                                <button onClick={() => onSetCurrentDocPage(p => Math.min(volumePages[selectedVolume].length - 1, p + 1))} disabled={currentDocPage >= volumePages[selectedVolume].length - 1} aria-label={t('manual_tab.next_page_aria')}><span aria-hidden="true">→</span></button>
                                <ZoomControls fitMode={fitMode} onSetFitMode={onSetFitMode} pdfZoom={pdfZoom} onSetPdfZoom={onSetPdfZoom} />
                            </div>

                            <div ref={docViewerRef} className="v4-page-container" style={{ alignItems: fitMode === 'page' ? 'center' : 'flex-start' }}>
                                {volumePages[selectedVolume][currentDocPage] ? (
                                    <img
                                        src={volumePages[selectedVolume][currentDocPage]}
                                        alt={`Volume ${selectedVolume} - Pagina ${currentDocPage + 1}`}
                                        style={{
                                            maxWidth: fitMode === 'width' || fitMode === 'page' ? '100%' : 'none',
                                            maxHeight: fitMode === 'height' || fitMode === 'page' ? '100%' : 'none',
                                            width: fitMode === 'free' ? `${pdfZoom * 100}%` : 'auto',
                                        }}
                                    />
                                ) : (
                                    /* S112: Lazy page placeholder — page renders on navigation */
                                    <div className="v4-loading" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                        <div className="v4-spinner"></div>
                                        <p style={{ marginTop: 12, color: 'var(--elab-hex-737373)' }}>{t('manual_tab.rendering_page', { page: currentDocPage + 1 })}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {!loadingVolume && !selectedVolume && (
                        <div className="v4-placeholder">
                            <div className="v4-icon"></div>
                            <h3>{t('manual_tab.welcome_title')}</h3>
                            <p>{t('manual_tab.welcome_subtitle')}</p>
                        </div>
                    )}
                </>
            )}

            {/* VISUALIZZAZIONE DOCUMENTI CARICATI */}
            {viewMode === 'document' && (
                <>
                    {uploadedDocs.length > 0 && (
                        <div className="v4-doc-tabs">
                            {uploadedDocs.map((doc) => (
                                <button
                                    key={doc.id}
                                    className={`v4-doc-tab ${currentDoc?.id === doc.id ? 'active' : ''}`}
                                    onClick={() => { onSetCurrentDoc(doc); onSetCurrentDocPage(0); }}
                                    title={doc.name}
                                >
                                    {doc.name}
                                </button>
                            ))}
                            {currentDoc && (
                                <button
                                    className="v4-doc-remove"
                                    onClick={() => {
                                        onSetUploadedDocs(prev => prev.filter(d => d.id !== currentDoc.id));
                                        onSetCurrentDoc(null);
                                    }}
                                    aria-label={t('manual_tab.remove_doc_aria')}
                                ><span aria-hidden="true">✕</span></button>
                            )}
                        </div>
                    )}

                    {currentDoc ? (
                        <>
                            {currentDoc.pages.length > 1 && (
                                <div className="v4-page-nav">
                                    <button onClick={() => onSetCurrentDocPage(p => Math.max(0, p - 1))} disabled={currentDocPage === 0} aria-label={t('manual_tab.prev_page_aria')}><span aria-hidden="true">←</span></button>
                                    <span className="v4-page-count">Pagina {currentDocPage + 1} / {currentDoc.pages.length}</span>
                                    <button onClick={() => onSetCurrentDocPage(p => Math.min(currentDoc.pages.length - 1, p + 1))} disabled={currentDocPage >= currentDoc.pages.length - 1} aria-label={t('manual_tab.next_page_aria')}><span aria-hidden="true">→</span></button>
                                    <ZoomControls fitMode={fitMode} onSetFitMode={onSetFitMode} pdfZoom={pdfZoom} onSetPdfZoom={onSetPdfZoom} />
                                </div>
                            )}

                            <div ref={docViewerRef} className="v4-page-container" style={{ alignItems: fitMode === 'page' ? 'center' : 'flex-start' }}>
                                <img
                                    src={currentDoc.pages[currentDocPage]}
                                    alt={`${currentDoc.name} - Pagina ${currentDocPage + 1}`}
                                    style={{
                                        maxWidth: fitMode === 'width' || fitMode === 'page' ? '100%' : 'none',
                                        maxHeight: fitMode === 'height' || fitMode === 'page' ? '100%' : 'none',
                                        width: fitMode === 'free' ? `${pdfZoom * 100}%` : 'auto',
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        <div
                            className="v4-upload-area"
                            onClick={() => docInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                            onDragLeave={(e) => { e.currentTarget.classList.remove('dragover'); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('dragover');
                                if (e.dataTransfer.files.length) {
                                    handleDocumentUpload({ target: { files: e.dataTransfer.files } });
                                }
                            }}
                        >
                            <div className="v4-icon"></div>
                            <h3>{t('manual_tab.upload_docs_title')}</h3>
                            <p>{t('manual_tab.upload_docs_hint')}</p>
                            <div className="v4-upload-formats">
                                <span>PDF</span><span>DOCX</span><span>PPTX</span><span>JPG/PNG</span><span>TXT/CSV</span><span>INO/PY/JS</span>
                            </div>
                            <div className="v4-upload-hint">
                                Dopo aver caricato, usa <strong>"Spiega questa pagina"</strong> per far analizzare il contenuto
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Shared zoom controls component
function ZoomControls({ fitMode, onSetFitMode, pdfZoom, onSetPdfZoom }) {
    return (
        <div className="v4-zoom-controls">
            <select value={fitMode} onChange={(e) => onSetFitMode(e.target.value)} aria-label={t('manual_tab.fit_mode_aria')}>
                <option value="width">{t('manual_tab.fit_width')}</option>
                <option value="height">{t('manual_tab.fit_height')}</option>
                <option value="page">{t('manual_tab.fit_page')}</option>
                <option value="free">{t('manual_tab.fit_free')}</option>
            </select>
            {fitMode === 'free' && (
                <>
                    <button className="v4-zoom-btn" onClick={() => onSetPdfZoom(z => Math.max(0.25, z - 0.25))} aria-label="Riduci zoom"><span aria-hidden="true">−</span></button>
                    <span className="v4-zoom-label" aria-live="polite" aria-atomic="true">{Math.round(pdfZoom * 100)}%</span>
                    <button className="v4-zoom-btn" onClick={() => onSetPdfZoom(z => Math.min(4, z + 0.25))} aria-label="Aumenta zoom"><span aria-hidden="true">+</span></button>
                </>
            )}
        </div>
    );
}
