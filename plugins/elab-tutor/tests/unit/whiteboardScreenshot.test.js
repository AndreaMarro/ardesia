import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    captureWhiteboardScreenshot,
    getActiveSimulatorWhiteboardCanvas,
    safeCanvasToDataUrl,
} from '../../src/utils/whiteboardScreenshot';

function createMockCanvas(dataUrl = 'data:image/png;base64,AAA') {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;
    canvas.toDataURL = vi.fn(() => dataUrl);
    return canvas;
}

describe('whiteboardScreenshot utils', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    it('prefers tutor canvas when available', () => {
        const tutorCanvas = createMockCanvas('data:image/png;base64,TUTOR');

        const result = captureWhiteboardScreenshot({ tutorCanvas });

        expect(result).toEqual({
            dataUrl: 'data:image/png;base64,TUTOR',
            source: 'tutor-canvas',
        });
    });

    it('falls back to simulator whiteboard canvas', () => {
        const overlayCanvas = createMockCanvas('data:image/png;base64,OVERLAY');
        overlayCanvas.setAttribute('data-elab-whiteboard-canvas', 'true');
        document.body.appendChild(overlayCanvas);

        const result = captureWhiteboardScreenshot();

        expect(result).toEqual({
            dataUrl: 'data:image/png;base64,OVERLAY',
            source: 'simulator-whiteboard',
        });
    });

    it('returns null when canvas export throws', () => {
        const brokenCanvas = createMockCanvas();
        brokenCanvas.toDataURL = vi.fn(() => {
            throw new Error('SecurityError');
        });
        brokenCanvas.setAttribute('data-elab-whiteboard-canvas', 'true');
        document.body.appendChild(brokenCanvas);

        expect(safeCanvasToDataUrl(brokenCanvas)).toBeNull();
        expect(captureWhiteboardScreenshot()).toEqual({ dataUrl: null, source: null });
    });

    it('finds only tagged simulator whiteboard canvases', () => {
        const regularCanvas = createMockCanvas();
        document.body.appendChild(regularCanvas);
        expect(getActiveSimulatorWhiteboardCanvas()).toBeNull();

        regularCanvas.setAttribute('data-elab-whiteboard-canvas', 'true');
        expect(getActiveSimulatorWhiteboardCanvas()).toBe(regularCanvas);
    });
});
