/**
 * useMergedExperiment — Combines base experiment with user customisations
 * Handles: mergedExperiment, breadboardActiveHoles, enrichedComponentStates
 *
 * Extracted from NewElabSimulator.jsx — Andrea Marro
 */
import { useMemo } from 'react';

/**
 * @param {object} params
 * @param {object|null} params.currentExperiment
 * @param {Array} params.customComponents
 * @param {Array} params.customConnections
 * @param {object} params.customLayout
 * @param {object} params.customPinAssignments
 * @param {object} params.connectionOverrides
 * @param {number} params.buildStepIndex
 * @param {object} params.componentStates
 * @returns {{ mergedExperiment, breadboardActiveHoles, enrichedComponentStates }}
 */
export default function useMergedExperiment({
  currentExperiment,
  customComponents,
  customConnections,
  customLayout,
  customPinAssignments,
  connectionOverrides,
  buildStepIndex,
  componentStates,
}) {
  /* ─────────────────────────────────────────────────
     Merged experiment (useMemo)
     Combines base experiment with user customisations
     ───────────────────────────────────────────────── */
  const mergedExperiment = useMemo(() => {
    if (!currentExperiment) return null;

    // Merge components (filtra quelli nascosti via hidden flag)
    const baseComponents = currentExperiment.components || [];
    const hiddenIds = new Set(
      Object.entries(customLayout).filter(([_, v]) => v?.hidden).map(([k]) => k)
    );
    // Dedup by id: customComponents win over baseComponents (so PropertiesPanel
    // edits to default-experiment components — LED color, R value, C µF,
    // Battery V — actually override at render time instead of being shadowed
    // by the original baseComponents entry).
    const componentsById = new Map();
    for (const c of baseComponents) componentsById.set(c.id, c);
    for (const c of customComponents) componentsById.set(c.id, { ...componentsById.get(c.id), ...c });
    const mergedComponents = [...componentsById.values()]
      .filter(c => !hiddenIds.has(c.id));

    // Merge connections (rimuovi connessioni a componenti nascosti)
    // CoVe Fix: Assign stable IDs and apply overrides
    const baseConnections = (currentExperiment.connections || []).map((c, i) => ({ ...c, id: c.id || `base-${i}` }));
    // Custom connections should already have IDs from creation, but ensure fallback
    const customConnsWithIds = customConnections.map((c, i) => ({ ...c, id: c.id || `custom-${i}-${Date.now()}` }));

    const rawMergedConnections = [...baseConnections, ...customConnsWithIds]
      .filter(conn => {
        const fromId = conn.from.split(':')[0];
        const toId = conn.to.split(':')[0];
        return !hiddenIds.has(fromId) && !hiddenIds.has(toId);
      });

    // Apply overrides
    const mergedConnections = rawMergedConnections.map(conn => {
      const override = connectionOverrides[conn.id];
      return override ? { ...conn, ...override } : conn;
    }).filter(conn => !conn.hidden);

    // Merge layout: base overridden by customLayout (escludi hidden entries)
    const baseLayout = currentExperiment.layout || {};
    const cleanLayout = {};
    for (const [k, v] of Object.entries({ ...baseLayout, ...customLayout })) {
      if (!v?.hidden) cleanLayout[k] = v;
    }
    const mergedLayout = cleanLayout;

    // Merge pinAssignments: base + custom, remove entries for hidden components
    // NOTE: customPinAssignments may contain null values as "disconnected" markers
    const basePinAssignments = currentExperiment.pinAssignments || {};
    const rawMerged = { ...basePinAssignments, ...customPinAssignments };
    const mergedPinAssignments = {};
    for (const [key, value] of Object.entries(rawMerged)) {
      const compId = key.split(':')[0];
      if (hiddenIds.has(compId) || value === null || value === undefined) continue;
      mergedPinAssignments[key] = value;
    }

    // ═══════════════════════════════════════════════════════════════
    // BUILD MODE: progressive assembly filtering
    // ═══════════════════════════════════════════════════════════════
    const buildSteps = currentExperiment.buildSteps || [];
    const BASE_TYPES = new Set(['breadboard-half', 'breadboard-full', 'battery9v', 'arduino-nano', 'nano-r4']);

    // SANDBOX (Libero): base components + user-added custom components only
    if (currentExperiment.buildMode === 'sandbox') {
      const customIds = new Set(customComponents.map(c => c.id));
      const visibleComponentIds = new Set();
      for (const comp of mergedComponents) {
        if (BASE_TYPES.has(comp.type) || customIds.has(comp.id)) visibleComponentIds.add(comp.id);
      }
      const filteredComponents = mergedComponents.filter(c => visibleComponentIds.has(c.id));
      const filteredLayout = {};
      for (const [k, v] of Object.entries(mergedLayout)) {
        if (visibleComponentIds.has(k)) filteredLayout[k] = v;
      }
      const filteredPins = {};
      for (const [key, value] of Object.entries(mergedPinAssignments)) {
        const compId = key.split(':')[0];
        if (visibleComponentIds.has(compId)) filteredPins[key] = value;
      }
      const customConnIds = new Set(customConnections.map(c => c.id));
      const filteredConnections = mergedConnections.filter(conn => customConnIds.has(conn.id));
      return {
        ...currentExperiment,
        components: filteredComponents,
        connections: filteredConnections,
        layout: filteredLayout,
        pinAssignments: filteredPins,
      };
    }

    // GUIDED (Passo Passo): progressive filtering by buildStepIndex
    const isBuildActive = currentExperiment.buildMode === 'guided' && buildSteps.length > 0 && buildStepIndex < buildSteps.length;

    if (isBuildActive) {
      const visibleComponentIds = new Set();
      const visibleWires = [];

      for (const comp of mergedComponents) {
        if (BASE_TYPES.has(comp.type)) visibleComponentIds.add(comp.id);
      }

      for (let i = 0; i <= buildStepIndex; i++) {
        const s = buildSteps[i];
        if (s.componentId) visibleComponentIds.add(s.componentId);
        if (s.wireFrom && s.wireTo) visibleWires.push({ from: s.wireFrom, to: s.wireTo });
      }

      const filteredComponents = mergedComponents.filter(c => visibleComponentIds.has(c.id));
      const filteredLayout = {};
      for (const [k, v] of Object.entries(mergedLayout)) {
        if (visibleComponentIds.has(k)) filteredLayout[k] = v;
      }
      const filteredPins = {};
      for (const [key, value] of Object.entries(mergedPinAssignments)) {
        const compId = key.split(':')[0];
        if (visibleComponentIds.has(compId)) filteredPins[key] = value;
      }
      const filteredConnections = mergedConnections.filter(conn => {
        return visibleWires.some(w =>
          (conn.from === w.from && conn.to === w.to) ||
          (conn.from === w.to && conn.to === w.from)
        );
      });

      return {
        ...currentExperiment,
        components: filteredComponents,
        connections: filteredConnections,
        layout: filteredLayout,
        pinAssignments: filteredPins,
      };
    }

    return {
      ...currentExperiment,
      components: mergedComponents,
      connections: mergedConnections,
      layout: mergedLayout,
      pinAssignments: mergedPinAssignments,
    };
  }, [currentExperiment, customComponents, customConnections, customLayout, customPinAssignments, connectionOverrides, buildStepIndex]);

  /* ─────────────────────────────────────────────────
     Compute active holes for breadboard highlighting
     ───────────────────────────────────────────────── */
  const breadboardActiveHoles = useMemo(() => {
    if (!mergedExperiment) return {};
    const result = {};

    const pinAssignments = mergedExperiment.pinAssignments || {};
    for (const [, bbRef] of Object.entries(pinAssignments)) {
      const [bbId, holeId] = bbRef.split(':');
      if (!bbId || !holeId) continue;
      if (!result[bbId]) result[bbId] = {};
      result[bbId][holeId] = 'var(--color-accent)';
    }

    const connections = mergedExperiment.connections || [];
    const bbIds = new Set(
      (mergedExperiment.components || [])
        .filter(c => c.type === 'breadboard-half' || c.type === 'breadboard-full')
        .map(c => c.id)
    );

    for (const conn of connections) {
      const wireColor = conn.color || 'gray';
      const colorMap = {
        red: 'var(--elab-hex-e53935)', black: '#333', blue: 'var(--elab-hex-1e88e5)', green: 'var(--elab-hex-43a047)',
        yellow: 'var(--elab-hex-fdd835)', orange: 'var(--elab-hex-fb8c00)', white: '#CCC', gray: 'var(--elab-hex-737373)',
        purple: 'var(--elab-hex-8e24aa)', brown: 'var(--elab-hex-6d4c41)',
      };
      const holeColor = colorMap[wireColor] || wireColor;

// © Andrea Marro — 17/04/2026 — ELAB Tutor — Tutti i diritti riservati
      for (const pinRef of [conn.from, conn.to]) {
        const [compId, pinId] = pinRef.split(':');
        if (bbIds.has(compId) && pinId) {
          if (!result[compId]) result[compId] = {};
          if (!result[compId][pinId]) {
            result[compId][pinId] = holeColor;
          }
        }
      }
    }

    return result;
  }, [mergedExperiment]);

  /* ─────────────────────────────────────────────────
     Enriched component states: merge activeHoles into breadboard state
     ───────────────────────────────────────────────── */
  const enrichedComponentStates = useMemo(() => {
    if (!mergedExperiment) return componentStates;

    const bbIds = (mergedExperiment.components || [])
      .filter(c => c.type === 'breadboard-half' || c.type === 'breadboard-full')
      .map(c => c.id);

    if (bbIds.length === 0) return componentStates;

    const enriched = { ...componentStates };
    for (const bbId of bbIds) {
      const holes = breadboardActiveHoles[bbId] || {};
      enriched[bbId] = {
        ...(componentStates[bbId] || {}),
        activeHoles: holes,
      };
    }
    return enriched;
  }, [componentStates, mergedExperiment, breadboardActiveHoles]);

  return { mergedExperiment, breadboardActiveHoles, enrichedComponentStates };
}
