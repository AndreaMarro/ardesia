/**
 * ELAB — Firma automatica nel codice sorgente
 * Iter 71-DRIFT-FIX (2026-05-16): prepend single signature at file TOP only.
 *
 * Prior behavior (every 200 lines) inserted comments mid-array literal +
 * mid-JSDoc blocks → broke readability + risked tooling errors. Iter 71-C TEAM C
 * files src/services/elab-agent/{error-translator.js,vol3-experiments-pipeline.js}
 * suffered drift bug: signatures injected mid-PATTERNS_BY_CATEGORY array (line 198)
 * + mid-JSDoc block (line 398). Revert applied iter 70 close (b2cf6981) + iter 71
 * entrance (this commit) 2x same root cause.
 *
 * NEW behavior: idempotent TOP-prepend on first run, skip on repeat (marker check).
 * Files only get 1 signature, at top of file, preserved across builds.
 *
 * Uso: node scripts/add-signatures.js
 * Aggiunto come prebuild in package.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '..', 'src');
const DATE = new Date().toLocaleDateString('it-IT');

const JS_SIGNATURE = `// © Andrea Marro — ${DATE} — ELAB Tutor — Tutti i diritti riservati`;
const CSS_SIGNATURE = `/* © Andrea Marro — ${DATE} — ELAB Tutor — Tutti i diritti riservati */`;

// Marker to avoid duplicate signatures on repeated runs
const MARKER = '© Andrea Marro';

// .jsx excluded: // comments inside JSX return() render as visible text in the UI
const EXTENSIONS = ['.js', '.css'];

function walkDir(dir) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip node_modules, dist, .git
            if (['node_modules', 'dist', '.git', 'nanobot'].includes(entry.name)) continue;
            results.push(...walkDir(fullPath));
        } else if (EXTENSIONS.includes(path.extname(entry.name))) {
            results.push(fullPath);
        }
    }
    return results;
}

function addSignatures(filePath) {
    const ext = path.extname(filePath);
    const signature = ext === '.css' ? CSS_SIGNATURE : JS_SIGNATURE;

    const content = fs.readFileSync(filePath, 'utf-8');

    // Idempotent: if file already contains any signature marker, skip entirely.
    // Preserves existing dates → zero re-stamp churn on repeated builds.
    // Files only get stamped once, with the date they were first stamped.
    if (content.includes(MARKER)) {
        return false;
    }

    // Iter 71-DRIFT-FIX: prepend single signature at file TOP only.
    // Safe insertion point (no mid-array, no mid-JSDoc breakage).
    const newContent = `${signature}\n${content}`;
    fs.writeFileSync(filePath, newContent, 'utf-8');
    return true;
}

// Main
const files = walkDir(SRC_DIR);
let modified = 0;

for (const file of files) {
    if (addSignatures(file)) {
        modified++;
    }
}

const rel = (f) => path.relative(path.resolve(__dirname, '..'), f);
if (modified > 0) {
    process.stdout.write(`[add-signatures] ${modified}/${files.length} files signed (${DATE})\n`);
} else {
    process.stdout.write(`[add-signatures] All ${files.length} files already signed\n`);
}
