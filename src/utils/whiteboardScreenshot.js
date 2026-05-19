// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
// ============================================
// Whiteboard screenshot helpers
// Shared by Tutor + Simulator API
// ============================================

export const WHITEBOARD_CANVAS_SELECTOR = 'canvas[data-elab-whiteboard-canvas="true"]';

function isCanvasElement(node) {
    if (!node) return false;
    if (typeof HTMLCanvasElement !== 'undefined') {
        return node instanceof HTMLCanvasElement;
    }
    return typeof node.toDataURL === 'function';
}

export function safeCanvasToDataUrl(canvas, mimeType = 'image/png') {
    if (!isCanvasElement(canvas)) return null;
    if (canvas.width <= 0 || canvas.height <= 0) return null;
    try {
        const dataUrl = canvas.toDataURL(mimeType);
        return (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) ? dataUrl : null;
    } catch {
        return null;
    }
}

export function getActiveSimulatorWhiteboardCanvas(doc = (typeof document !== 'undefined' ? document : null)) {
    if (!doc) return null;
    const canvas = doc.querySelector(WHITEBOARD_CANVAS_SELECTOR);
    return isCanvasElement(canvas) ? canvas : null;
}

export function captureWhiteboardScreenshot({
    tutorCanvas = null,
    mimeType = 'image/png',
    doc = (typeof document !== 'undefined' ? document : null),
} = {}) {
    const tutorDataUrl = safeCanvasToDataUrl(tutorCanvas, mimeType);
    if (tutorDataUrl) {
        return { dataUrl: tutorDataUrl, source: 'tutor-canvas' };
    }

    const simulatorCanvas = getActiveSimulatorWhiteboardCanvas(doc);
    const simulatorDataUrl = safeCanvasToDataUrl(simulatorCanvas, mimeType);
    if (simulatorDataUrl) {
        return { dataUrl: simulatorDataUrl, source: 'simulator-whiteboard' };
    }

    return { dataUrl: null, source: null };
}
