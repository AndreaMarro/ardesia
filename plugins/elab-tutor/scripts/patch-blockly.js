#!/usr/bin/env node
/**
 * patch-blockly.js — Safe disposal patch for Blockly 12.4.1
 *
 * Blockly 12.4.1 has an InsertionMarkerPreviewer bug: during block
 * drag/drop, disposal, or React DOM removal, Blockly throws in 3 places:
 *   1. removeTypedBlock() — undefined type map entry
 *   2. removeTopBlock()   — "Block not present in workspace's top blocks"
 *   3. removeConnection() — "Unable to find connection in connectionDB"
 *
 * All three are the same pattern: InsertionMarker blocks are partially
 * cleaned up before the disposal chain reaches these methods.
 *
 * This script patches all three methods to be safe (guard + no-throw).
 * Run automatically via postinstall, or manually: node scripts/patch-blockly.js
 *
 * v3: INLINES removeElem logic (avoids Vite $$ → $ corruption)
 * v4: Adds Patch 3 for ConnectionDB.removeConnection() — the root cause
 *     of "Errore nell'editor blocchi" when clicking/dragging Scratch blocks
 *
 * © Andrea Marro — ELAB Tutor — S114-S115
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOCKLY_PATH = resolve(__dirname, '../node_modules/blockly/blockly_compressed.js');

// Sentinel to detect if patch was already applied
const PATCH_SENTINEL = '/* ELAB-PATCHED:safe-disposal-v4 */';
// Also detect old sentinels to force re-patch
const OLD_SENTINELS = [
    '/* ELAB-PATCHED:safe-disposal */',
    '/* ELAB-PATCHED:safe-disposal-v2 */',
    '/* ELAB-PATCHED:safe-disposal-v3 */',
];

try {
    let code = readFileSync(BLOCKLY_PATH, 'utf8');

    // Already patched with v4?
    if (code.includes(PATCH_SENTINEL)) {
        console.log('[patch-blockly] Already patched (v4) — skipping.');
        process.exit(0);
    }

    // Strip old sentinels so we can cleanly re-patch
    for (const sentinel of OLD_SENTINELS) {
        if (code.includes(sentinel)) {
            console.log(`[patch-blockly] Stripping old sentinel: ${sentinel}`);
            code = code.split(sentinel + '\n').join('');
        }
    }

    // ── Detect and revert any previously patched bodies back to originals ──
    // v1 corrupted bodies (single $ due to String.replace)
    const BROKEN_V1_RTB =
        'removeTypedBlock(a){const _a=this.typedBlocksDB.get(a.type);if(!_a)return;removeElem$module$build$src$core$utils$array(_a,a);this.typedBlocksDB.get(a.type)?.length||this.typedBlocksDB.delete(a.type)}';
    const BROKEN_V1_RTOB =
        'removeTopBlock(a){removeElem$module$build$src$core$utils$array(this.topBlocks,a);}';

    // v2 patched bodies (double $$ but still references Closure symbol)
    const V2_RTB =
        'removeTypedBlock(a){const _a=this.typedBlocksDB.get(a.type);if(!_a)return;removeElem$$module$build$src$core$utils$array(_a,a);this.typedBlocksDB.get(a.type)?.length||this.typedBlocksDB.delete(a.type)}';
    const V2_RTOB =
        'removeTopBlock(a){removeElem$$module$build$src$core$utils$array(this.topBlocks,a);}';

    // Original Blockly 12.4.1 bodies
    const ORIG_RTB =
        'removeTypedBlock(a){removeElem$$module$build$src$core$utils$array(this.typedBlocksDB.get(a.type),a);this.typedBlocksDB.get(a.type).length||this.typedBlocksDB.delete(a.type)}';
    const ORIG_RTOB =
        `removeTopBlock(a){if(!removeElem$$module$build$src$core$utils$array(this.topBlocks,a))throw Error("Block not present in workspace's list of top-most blocks.")}`;

    // Revert v1/v2 bodies to originals before applying v3
    const revertPairs = [
        [BROKEN_V1_RTB, ORIG_RTB, 'v1 removeTypedBlock'],
        [BROKEN_V1_RTOB, ORIG_RTOB, 'v1 removeTopBlock'],
        [V2_RTB, ORIG_RTB, 'v2 removeTypedBlock'],
        [V2_RTOB, ORIG_RTOB, 'v2 removeTopBlock'],
    ];
    for (const [broken, original, label] of revertPairs) {
        if (code.includes(broken)) {
            code = code.split(broken).join(original);
            console.log(`[patch-blockly] ↩️  Reverted ${label} → original`);
        }
    }

    let patchCount = 0;

    // ── Patch 1: removeTypedBlock — guard against undefined type map ──
    // v3: INLINE the removeElem logic (indexOf + splice) instead of calling
    //     removeElem$$module$... which gets corrupted by Vite's $$ → $ transform
    if (code.includes(ORIG_RTB)) {
        const NEW_RTB =
            'removeTypedBlock(a){var _a=this.typedBlocksDB.get(a.type);if(!_a)return;var _i=_a.indexOf(a);if(_i!==-1)_a.splice(_i,1);_a.length||this.typedBlocksDB.delete(a.type)}';
        code = code.split(ORIG_RTB).join(NEW_RTB);
        patchCount++;
        console.log('[patch-blockly] ✅ Patched removeTypedBlock (inlined, guard undefined type map)');
    } else {
        console.warn('[patch-blockly] ⚠️  removeTypedBlock pattern not found — may already be patched or Blockly version changed');
    }

    // ── Patch 2: removeTopBlock — remove throw, silent no-op ──
    if (code.includes(ORIG_RTOB)) {
        const NEW_RTOB =
            'removeTopBlock(a){var _i=this.topBlocks.indexOf(a);if(_i!==-1)this.topBlocks.splice(_i,1)}';
        code = code.split(ORIG_RTOB).join(NEW_RTOB);
        patchCount++;
        console.log('[patch-blockly] ✅ Patched removeTopBlock (inlined, silent no-op instead of throw)');
    } else {
        console.warn('[patch-blockly] ⚠️  removeTopBlock pattern not found — may already be patched or Blockly version changed');
    }

    // ── Patch 3: ConnectionDB.removeConnection — silent return instead of throw ──
    // Bug: "Unable to find connection in connectionDB." when dragging/clicking blocks
    // InsertionMarkerPreviewer.hideInsertionMarker → block.dispose() → connection.dispose()
    //   → ConnectionDB.removeConnection() throws because marker connections already removed
    const ORIG_RC =
        'removeConnection(a,b){a=this.findIndexOfConnection(a,b);if(a===-1)throw Error("Unable to find connection in connectionDB.");this.connections.splice(a,1)}';
    if (code.includes(ORIG_RC)) {
        const NEW_RC =
            'removeConnection(a,b){a=this.findIndexOfConnection(a,b);if(a===-1)return;this.connections.splice(a,1)}';
        code = code.split(ORIG_RC).join(NEW_RC);
        patchCount++;
        console.log('[patch-blockly] ✅ Patched removeConnection (silent return instead of throw)');
    } else {
        console.warn('[patch-blockly] ⚠️  removeConnection pattern not found — may already be patched or Blockly version changed');
    }

    if (patchCount > 0) {
        // Add sentinel at top
        code = PATCH_SENTINEL + '\n' + code;
        writeFileSync(BLOCKLY_PATH, code, 'utf8');
        console.log(`[patch-blockly] ✅ ${patchCount}/3 patches applied to blockly_compressed.js`);
    } else {
        console.log('[patch-blockly] No patches applied.');
    }
} catch (err) {
    // Don't fail npm install if blockly isn't installed yet
    if (err.code === 'ENOENT') {
        console.log('[patch-blockly] blockly_compressed.js not found — skipping (pre-install?)');
    } else {
        console.error('[patch-blockly] Error:', err.message);
        process.exit(1);
    }
}
