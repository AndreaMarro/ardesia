// ============================================
// ELAB Tutor - Notebooks Tab
// Extracted from ElabTutorV4.jsx
// © Andrea Marro — 13/02/2026
// ============================================

import React from 'react';

export default function NotebooksTab({
    notebooks,
    activeNotebookId,
    activePageIndex,
    notebookTitle,
    onSetNotebookTitle,
    onCreateNotebook,
    onOpenNotebook,
    onDeleteNotebook,
    onCloseNotebook,
    onChangePage,
    onAddPage,
    onSendToUNLIM,
}) {
    return (
        <div className="v4-notebooks">
            {activeNotebookId ? (
                <div className="v4-notebook-edit">
                    <div className="v4-edit-header">
                        <button className="v4-toolbar-btn" onClick={onCloseNotebook}>← Indietro</button>
                        <h3>{notebooks.find(n => n.id === activeNotebookId)?.title}</h3>
                        {onSendToUNLIM && (
                            <button
                                className="v4-toolbar-btn"
                                onClick={() => onSendToUNLIM(`Ho un taccuino aperto intitolato "${notebooks.find(n => n.id === activeNotebookId)?.title || 'senza titolo'}". Puoi aiutarmi a riassumere o approfondire gli argomenti?`)}
                                title="Chiedi a UNLIM"
                            >
                                Chiedi a UNLIM
                            </button>
                        )}
                    </div>
                    <div className="v4-pages-grid">
                        {(notebooks.find(n => n.id === activeNotebookId)?.pages || []).map((p, i) => (
                            <div key={i} className={`v4-page-thumb ${i === activePageIndex ? 'active' : ''}`} role="button" tabIndex={0} onClick={() => onChangePage(i)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChangePage(i); } }}>
                                {p ? <img src={p} alt={`Pag ${i + 1}`} /> : <div className="v4-page-empty" />}
                                <span>Pag {i + 1}</span>
                            </div>
                        ))}
                        <button className="v4-add-page-btn" onClick={onAddPage}>+</button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="v4-new-note">
                        <h3>Crea Nuova Lezione</h3>
                        <div className="note-input-row">
                            <input placeholder="Titolo lezione..." value={notebookTitle} onChange={e => onSetNotebookTitle(e.target.value)} />
                            <button onClick={() => onCreateNotebook()} className="save-btn">Crea</button>
                        </div>
                        <p className="note-hint">Usa "Crea" per iniziare un taccuino vuoto o con il disegno corrente.</p>
                    </div>

                    <div className="v4-notes-list">
                        <h3>Lezioni Salvate</h3>
                        {notebooks.length === 0 && <p className="notes-empty">Nessuna lezione salvata.</p>}
                        {notebooks.map(note => (
                            <div key={note.id} className="v4-note-card">
                                <div className="note-thumb-wrapper" role="button" tabIndex={0} onClick={() => onOpenNotebook(note)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenNotebook(note); } }}>
                                    <img src={(note.pages && note.pages[0]) || note.data} alt={note.title} className="note-thumb" />
                                </div>
                                <div className="note-info">
                                    <strong>{note.title}</strong>
                                    <small>{note.date}</small>
                                    <div className="note-actions">
                                        <button onClick={() => onOpenNotebook(note)}>Apri</button>
                                        <button className="del" onClick={() => onDeleteNotebook(note.id)}>Elimina</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
