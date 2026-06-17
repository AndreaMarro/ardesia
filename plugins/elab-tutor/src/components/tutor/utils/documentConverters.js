// ============================================
// ELAB Tutor - Document Conversion Utilities
// PDF, DOCX, PPTX, Text → Canvas pages
// Extracted from ElabTutorV4.jsx
// © Andrea Marro — 13/02/2026
// ============================================

import logger from '../../../utils/logger';

// Carica pdf.js da CDN
export const loadPdfJs = () => {
    return new Promise((resolve, reject) => {
        if (window.pdfjsLib) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Helper: crea pagina placeholder
export const createPlaceholderPage = (fileName, format) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f5f5f5'; // palette
    ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = 'var(--elab-navy)';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(fileName, 400, 280);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(`Formato: ${format}`, 400, 320);
    return canvas.toDataURL('image/png');
};

// ==== HTML → PAGES (per DOCX) ====
// Renderizza HTML in un canvas offscreen, dividendo in pagine A4
export const htmlToPages = async (html, fileName) => {
    return new Promise((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;height:auto;border:none;';
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument;
        doc.open();
        doc.write(`<!DOCTYPE html><html><head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; margin: 0;
                       line-height: 1.6; color: #333; max-width: 800px; font-size: 14px; }
                h1 { color: var(--elab-navy); border-bottom: 2px solid var(--elab-lime); padding-bottom: 8px; }
                h2 { color: var(--elab-navy); }
                h3 { color: #2d5aa0; } // palette
                table { border-collapse: collapse; width: 100%; margin: 12px 0; }
                td, th { border: 1px solid #ddd; padding: 8px; }
                th { background: #f0f4f8; } // palette
                img { max-width: 100%; height: auto; }
                code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 13px; } // palette
                pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; } // palette
                blockquote { border-left: 3px solid var(--elab-lime); margin: 12px 0; padding: 8px 16px; background: #f9fdf5; }
                .page-header { font-size: 11px; color: #737373; margin-bottom: 16px; } // palette
            </style>
        </head><body>
            <div class="page-header">${fileName}</div>
            ${html}
        </body></html>`);
        doc.close();

        // Aspetta rendering
        setTimeout(async () => {
            const contentHeight = doc.body.scrollHeight;
            const pageHeight = 1100; // ~A4 proportion for 800px width
            const numPages = Math.ceil(contentHeight / pageHeight);
            const pages = [];

            for (let p = 0; p < numPages; p++) {
                const canvas = document.createElement('canvas');
                canvas.width = 800 * 2; // 2x per retina
                canvas.height = pageHeight * 2;
                const ctx = canvas.getContext('2d');
                ctx.scale(2, 2);
                ctx.fillStyle = '#ffffff'; // palette
                ctx.fillRect(0, 0, 800, pageHeight);

                // Usa html2canvas-like approach: SVG foreignObject
                const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${pageHeight}">
                    <foreignObject width="800" height="${contentHeight}" y="${-p * pageHeight}">
                        ${new XMLSerializer().serializeToString(doc.documentElement)}
                    </foreignObject>
                </svg>`;

                const img = new Image();
                try {
                    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    await new Promise((res, rej) => {
                        img.onload = () => { ctx.drawImage(img, 0, 0); URL.revokeObjectURL(url); res(); };
                        img.onerror = () => { URL.revokeObjectURL(url); rej(); };
                        img.src = url;
                    });
                    pages.push(canvas.toDataURL('image/png'));
                } catch {
                    // Fallback: solo prima "pagina" come screenshot semplice
                    ctx.font = '14px sans-serif';
                    ctx.fillStyle = '#333';
                    const text = doc.body.innerText;
                    const lines = text.split('\n');
                    let y = 40;
                    for (const line of lines.slice(p * 50, (p + 1) * 50)) {
                        ctx.fillText(line.substring(0, 100), 40, y);
                        y += 20;
                        if (y > pageHeight - 20) break;
                    }
                    pages.push(canvas.toDataURL('image/png'));
                }
            }

            document.body.removeChild(iframe);
            resolve(pages.length > 0 ? pages : [createPlaceholderPage(fileName, 'DOCX')]);
        }, 500);
    });
};

// ==== PPTX → PAGES ====
// Estrae immagini e testo dalle slide PPTX via JSZip
export const pptxToPages = async (arrayBuffer) => {
    // Carica JSZip da CDN se non presente
    if (!window.JSZip) {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    const zip = await window.JSZip.loadAsync(arrayBuffer);
    const pages = [];

    // Trova tutte le slide ordinate
    const slideFiles = Object.keys(zip.files)
        .filter(f => f.match(/ppt\/slides\/slide\d+\.xml$/))
        .sort((a, b) => {
            const na = parseInt(a.match(/slide(\d+)/)[1]);
            const nb = parseInt(b.match(/slide(\d+)/)[1]);
            return na - nb;
        });

    for (let si = 0; si < slideFiles.length; si++) {
        const slideXml = await zip.file(slideFiles[si]).async('text');

        // Estrai testi dalla slide
        const texts = [];
        const textMatches = slideXml.matchAll(/<a:t>([^<]+)<\/a:t>/g);
        for (const m of textMatches) {
            texts.push(m[1]);
        }

        // Cerca immagini riferite nella slide
        let slideImage = null;
        const relFile = slideFiles[si].replace('ppt/slides/', 'ppt/slides/_rels/') + '.rels';
        if (zip.files[relFile]) {
            const relsXml = await zip.file(relFile).async('text');
            const imgMatch = relsXml.match(/Target="\.\.\/media\/(image[^"]+)"/);
            if (imgMatch) {
                const imgPath = 'ppt/media/' + imgMatch[1];
                if (zip.files[imgPath]) {
                    const imgData = await zip.file(imgPath).async('base64');
                    const ext = imgMatch[1].split('.').pop().toLowerCase();
                    const mimeType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
                    slideImage = `data:${mimeType};base64,${imgData}`;
                }
            }
        }

        // Renderizza la slide come immagine canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');

        // Sfondo bianco
        ctx.fillStyle = '#ffffff'; // palette
        ctx.fillRect(0, 0, 1280, 720);

        // Numero slide
        ctx.fillStyle = 'var(--elab-lime)';
        ctx.fillRect(0, 0, 1280, 4);
        ctx.fillStyle = '#737373'; // palette
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
        ctx.font = '14px sans-serif';
        ctx.fillText(`Slide ${si + 1} / ${slideFiles.length}`, 1140, 700);

        // Immagine di sfondo/principale se presente
        if (slideImage) {
            try {
                const img = new Image();
                await new Promise((res) => {
                    img.onload = () => {
                        const scale = Math.min(1200 / img.width, 500 / img.height, 1);
                        const w = img.width * scale;
                        const h = img.height * scale;
                        ctx.drawImage(img, (1280 - w) / 2, texts.length > 3 ? 50 : (720 - h) / 2, w, h);
                        res();
                    };
                    img.onerror = res;
                    img.src = slideImage;
                });
            } catch {}
        }

        // Testi
        if (texts.length > 0) {
            let y = slideImage ? 560 : 80;
            const isTitle = si === 0 || texts.some(t => t.length > 0 && texts.indexOf(t) === 0);

            for (let ti = 0; ti < texts.length; ti++) {
                const t = texts[ti];
                if (!t.trim()) continue;

                if (ti === 0 && isTitle) {
                    ctx.font = 'bold 36px sans-serif';
                    ctx.fillStyle = 'var(--elab-navy)';
                    y = slideImage ? 560 : 180;
                } else if (ti === 1) {
                    ctx.font = '24px sans-serif';
                    ctx.fillStyle = '#333';
                    y += 50;
                } else {
                    ctx.font = '20px sans-serif';
                    ctx.fillStyle = '#555';
                    y += 36;
                }

                // Word-wrap
                const maxWidth = 1100;
                const words = t.split(' ');
                let line = '';
                for (const word of words) {
                    const test = line + word + ' ';
                    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
                        ctx.fillText(line, 90, y);
                        line = word + ' ';
                        y += 30;
                    } else {
                        line = test;
                    }
                }
                if (line) ctx.fillText(line, 90, y);

                if (y > 680) break;
            }
        }

        // Se slide vuota (nessun testo, nessuna immagine)
        if (texts.length === 0 && !slideImage) {
            ctx.font = 'italic 20px sans-serif';
            ctx.fillStyle = '#737373'; // palette
            ctx.textAlign = 'center';
            ctx.fillText(`Slide ${si + 1} (vuota)`, 640, 360);
            ctx.textAlign = 'left';
        }

        pages.push(canvas.toDataURL('image/jpeg', 0.85));
    }

    return pages;
};

// ==== TEXT → PAGES ====
export const textToPages = async (text, fileName) => {
    const linesPerPage = 50;
    const lines = text.split('\n');
    const pages = [];
    const ext = fileName.split('.').pop().toLowerCase();
    const isCode = ['js', 'py', 'ino', 'c', 'cpp', 'h', 'css', 'html', 'json', 'xml'].includes(ext);

    for (let p = 0; p < Math.ceil(lines.length / linesPerPage); p++) {
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1100 * 2;
        const ctx = canvas.getContext('2d');
        ctx.scale(2, 2);

        // Sfondo
        ctx.fillStyle = isCode ? '#1e1e1e' : '#ffffff'; // palette
        ctx.fillRect(0, 0, 800, 1100);

        // Header
        ctx.fillStyle = isCode ? '#333' : '#f0f4f8'; // palette
        ctx.fillRect(0, 0, 800, 32);
        ctx.font = '11px monospace';
        ctx.fillStyle = isCode ? '#737373' : '#666'; // palette
        ctx.fillText(`${fileName} — Pagina ${p + 1}/${Math.ceil(lines.length / linesPerPage)}`, 12, 21);

        // Contenuto
        ctx.font = isCode ? '12px "Fira Code", "Consolas", monospace' : '13px "Segoe UI", sans-serif';
        const pageLines = lines.slice(p * linesPerPage, (p + 1) * linesPerPage);

        let y = 52;
        for (let i = 0; i < pageLines.length; i++) {
            const lineNum = p * linesPerPage + i + 1;

            if (isCode) {
                // Numero riga
                ctx.fillStyle = '#555';
                ctx.fillText(String(lineNum).padStart(4), 12, y);
                // Separatore
                ctx.fillStyle = '#333';
                ctx.fillRect(48, y - 12, 1, 16);
                // Codice (colorazione basica)
                ctx.fillStyle = '#d4d4d4'; // palette
                ctx.fillText(pageLines[i].substring(0, 100), 56, y);
            } else {
                ctx.fillStyle = '#333';
                ctx.fillText(pageLines[i].substring(0, 110), 24, y);
            }
            y += 20;
        }

        pages.push(canvas.toDataURL('image/png'));
    }

    return pages.length > 0 ? pages : [createPlaceholderPage(fileName, ext.toUpperCase())];
};

// ==== DOCUMENT UPLOAD HANDLER ====
// Processes uploaded files and returns document objects
export const processDocumentUpload = async (files) => {
    const results = [];

    for (const file of files) {
        const fileType = file.type;
        const fileName = file.name;

        // Immagini singole (JPG, PNG, GIF, WebP, etc.)
        if (fileType.startsWith('image/')) {
            const dataUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.readAsDataURL(file);
            });
            results.push({
                doc: {
                    id: Date.now() + Math.random(),
                    name: fileName,
                    type: 'image',
                    pages: [dataUrl]
                }
            });
        }
        // PDF
        else if (fileType === 'application/pdf') {
            const arrayBuffer = await file.arrayBuffer();
            try {
                if (!window.pdfjsLib) {
                    await loadPdfJs();
                }
                const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const pages = [];

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const scale = 2;
                    const viewport = page.getViewport({ scale });

                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const ctx = canvas.getContext('2d');

                    await page.render({ canvasContext: ctx, viewport }).promise;
                    pages.push(canvas.toDataURL('image/png'));
                }

                results.push({
                    doc: {
                        id: Date.now() + Math.random(),
                        name: fileName,
                        type: 'pdf',
                        pages
                    }
                });
            } catch (err) {
                logger.error('Errore caricamento PDF:', err);
                results.push({ error: 'Errore nel caricamento del PDF' });
            }
        }
        // DOCX
        else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
            try {
                const mammoth = (await import('mammoth')).default;
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                const html = result.value;
                const pages = await htmlToPages(html, fileName);
                results.push({
                    doc: {
                        id: Date.now() + Math.random(),
                        name: fileName,
                        type: 'docx',
                        pages,
                        rawHtml: html
                    }
                });
            } catch (err) {
                logger.error('Errore caricamento DOCX:', err);
                results.push({ error: 'Errore nel caricamento del documento Word.' });
            }
        }
        // PPTX
        else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileName.endsWith('.pptx')) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pages = await pptxToPages(arrayBuffer);
                if (pages.length === 0) {
                    results.push({ error: 'Non sono riuscito a estrarre le slide. Prova a esportare come PDF da PowerPoint.' });
                    continue;
                }
                results.push({
                    doc: {
                        id: Date.now() + Math.random(),
                        name: fileName,
                        type: 'pptx',
                        pages
                    }
                });
            } catch (err) {
                logger.error('Errore caricamento PPTX:', err);
                results.push({ error: 'Errore nel caricamento della presentazione. Prova a esportare come PDF.' });
            }
        }
        // TXT, MD, CSV, codice sorgente
        else if (fileType.startsWith('text/') || fileName.match(/\.(txt|md|csv|json|xml|html|css|js|py|ino|c|cpp|h)$/i)) {
            try {
                const text = await file.text();
                const pages = await textToPages(text, fileName);
                results.push({
                    doc: {
                        id: Date.now() + Math.random(),
                        name: fileName,
                        type: 'text',
                        pages,
                        rawText: text
                    }
                });
            } catch (err) {
                logger.error('Errore caricamento file testo:', err);
                results.push({ error: `Errore nel caricamento di ${fileName}` });
            }
        }
        // DOC vecchio, PPT vecchio, ODP, KEY
        else if (fileName.match(/\.(doc|ppt|odp|key|odt|rtf)$/i)) {
            results.push({ error: `Il formato ${fileName.split('.').pop().toUpperCase()} non è supportato direttamente.\n\nConverti il file in uno di questi formati:\n- DOCX (Word moderno)\n- PPTX (PowerPoint moderno)\n- PDF (universale)\n\nIn Word/PowerPoint: File > Salva con nome > DOCX/PPTX\nIn LibreOffice: File > Esporta come PDF` });
        }
        // Formato sconosciuto
        else {
            results.push({ error: `Formato non supportato: ${fileType || fileName.split('.').pop()}\n\nFormati supportati:\n- PDF\n- DOCX (Word)\n- PPTX (PowerPoint)\n- Immagini (JPG, PNG, GIF, WebP)\n- Testo (TXT, MD, CSV, JSON)\n- Codice (JS, PY, INO, C, CPP)` });
        }
    }

    return results;
};
