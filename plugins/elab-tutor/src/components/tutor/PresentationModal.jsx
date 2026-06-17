// ============================================
// ELAB Tutor - Presentation Mode Modal
// Extracted from ElabTutorV4.jsx
// © Andrea Marro — 13/02/2026
// ============================================

import React from 'react';

export default function PresentationModal({
    slides,
    currentSlideIndex,
    onGoToSlide,
    onClose,
}) {
    if (!slides.length) return null;

    return (
        <div className="v4-presentation-overlay">
            <div className="v4-presentation-header">
                <span>Slide {currentSlideIndex + 1} / {slides.length}</span>
                <button className="v4-presentation-exit" onClick={onClose}>✕ Esci</button>
            </div>

            <div className="v4-presentation-content">
                {slides[currentSlideIndex]?.type === 'image' ? (
                    <img src={slides[currentSlideIndex].content} alt={`Slide ${currentSlideIndex + 1}`} />
                ) : (
                    <iframe
                        width="80%"
                        height="80%"
                        src={`https://www.youtube.com/embed/${slides[currentSlideIndex]?.content}?autoplay=1&rel=0`}
                        title="Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                )}
            </div>

            <div className="v4-presentation-nav">
                <button className="v4-toolbar-btn" onClick={() => onGoToSlide(currentSlideIndex - 1)} disabled={currentSlideIndex === 0}>← Precedente</button>
                <div className="v4-presentation-dots">
                    {slides.map((_, i) => (
                        <button key={i} className={`v4-presentation-dot ${i === currentSlideIndex ? 'active' : ''}`} onClick={() => onGoToSlide(i)} />
                    ))}
                </div>
                <button className="v4-toolbar-btn primary" onClick={() => onGoToSlide(currentSlideIndex + 1)} disabled={currentSlideIndex === slides.length - 1}>Successiva →</button>
            </div>
        </div>
    );
}
