// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * ELAB Simulator — Export PNG utility
 * Serializes the SVG canvas to a PNG image and triggers download.
 * Andrea Marro — 13/02/2026
 */

import logger from '../../../utils/logger';

/**
 * Export the SVG canvas as a PNG file.
 * @param {HTMLElement} canvasContainer - The container div that holds the SVG
 * @param {string} experimentId - Used for filename
 * @returns {Promise<boolean>} true if export succeeded
 */
export async function exportCanvasPng(canvasContainer, experimentId) {
  if (!canvasContainer) return false;

  const svgEl = canvasContainer.querySelector('svg');
  if (!svgEl) return false;

  try {
    // Clone the SVG to avoid modifying the live one
    const clone = svgEl.cloneNode(true);

    // Get the viewBox dimensions for proper rendering
    const vb = svgEl.viewBox?.baseVal;
    const width = vb?.width || 800;
    const height = vb?.height || 600;

    // Set explicit dimensions on clone for rasterization
    clone.setAttribute('width', width * 2); // 2x for retina quality
    clone.setAttribute('height', height * 2);

    // Serialize SVG to string
    const serializer = new XMLSerializer();
    let svgData = serializer.serializeToString(clone);

    // Ensure proper XML namespace
    if (!svgData.includes('xmlns=')) {
      svgData = svgData.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    // Create blob and image
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();

    const loaded = await new Promise((resolve, reject) => {
      img.onload = () => resolve(true);
      img.onerror = () => reject(new Error('Errore caricamento immagine'));
      img.src = url;
    });

    if (!loaded) {
      URL.revokeObjectURL(url);
      return false;
    }

    // Draw to canvas
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#fafaf7'; // palette
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw SVG image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Add watermark
    ctx.fillStyle = 'rgba(30, 77, 140, 0.15)';
    ctx.font = `${Math.max(12, width * 0.02)}px 'Open Sans', sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText('ELAB Simulator', canvas.width - 10, canvas.height - 10);

    URL.revokeObjectURL(url);

    // Trigger download
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `elab-${experimentId || 'circuito'}-${timestamp}.png`;

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return false;

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (err) {
    logger.error('[ELAB] Export PNG error:', err);
    return false;
  }
}

/**
 * Captures the circuit canvas as a base64 PNG data URL.
 * Used by SessionReportPDF to embed circuit screenshot.
 * @param {HTMLElement} canvasContainer - The container with the SVG canvas
 * @returns {Promise<string|null>} base64 data URL or null on error
 */
export async function captureCanvasBase64(canvasContainer) {
  try {
    if (!canvasContainer) return null;
    const svgEl = canvasContainer.querySelector('svg');
    if (!svgEl) return null;

    const clone = svgEl.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgStr = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; // palette
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    return canvas.toDataURL('image/png');
  } catch (err) {
    logger.error('captureCanvasBase64 failed:', err);
    return null;
  }
}
