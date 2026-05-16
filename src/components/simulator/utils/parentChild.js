// © Andrea Marro — 16/05/2026 — ELAB Tutor — Tutti i diritti riservati
/**
 * Antigravity: Parent-Child component grouping utilities.
 * Components can be "parented" to a breadboard via layout[compId].parentId.
 * When the parent is dragged, all children move by the same delta.
 */

/**
 * Find all components whose parentId matches the given parent.
 * @param {string} parentId - The parent component ID (typically a breadboard)
 * @param {Object} layout - The experiment layout { compId: { x, y, rotation, parentId? } }
 * @returns {string[]} Array of child component IDs
 */
export function getChildComponents(parentId, layout) {
    if (!layout || !parentId) return [];
    return Object.keys(layout).filter(
        compId => compId !== parentId && layout[compId]?.parentId === parentId
    );
}

/**
 * Given pinAssignments, infer parentId for each component.
 * Used when loading "Gia Montato" experiments that don't have parentId set.
 * @param {Object} pinAssignments - e.g. { "led1:anode": "bb1:a5", "r1:pin1": "bb1:c3" }
 * @returns {Object} Map of compId -> parentBbId (e.g. { "led1": "bb1", "r1": "bb1" })
 */
export function inferParentFromPinAssignments(pinAssignments) {
    if (!pinAssignments) return {};
    const parentMap = {};
    for (const [compPin, bbHole] of Object.entries(pinAssignments)) {
        const compId = compPin.split(':')[0];
        const bbId = bbHole.split(':')[0];
        if (compId !== bbId) {
            parentMap[compId] = bbId;
        }
    }
    return parentMap;
}
