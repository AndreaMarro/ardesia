/**
 * ELAB Simulator — BuzzerPiezo Component (Tinkercad-Identical Style)
 * Piezo buzzer: simple black body with grill rings. Web Audio preserved.
 * No labels/overlay indicators (matches Tinkercad diagrams).
 * Pin positions UNCHANGED — solver-safe.
 * © Andrea Marro — 10/02/2026, Tinkercad-identical redesign 23/02/2026
 */

import React, { useEffect, useRef } from 'react';
import { registerComponent } from './registry';

const BuzzerPiezo = ({ x = 0, y = 0, state = {}, highlighted = false, onInteract, id }) => {
  const isOn = state.on || false;
  const frequency = state.frequency || 2000;
  const audioRef = useRef(null);
  const oscRef = useRef(null);

  /* Web Audio API — create/destroy oscillator based on state */
  useEffect(() => {
    if (isOn && frequency > 0) {
      if (!audioRef.current) {
        audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioRef.current;
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch (e) { /* already stopped */ }
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = frequency;
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
    } else {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch (e) { /* already stopped */ }
        oscRef.current = null;
      }
    }
    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch (e) { /* already stopped */ }
        oscRef.current = null;
      }
    };
  }, [isOn, frequency]);

  /* Cleanup audio context on full unmount */
  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch (e) { /* already stopped */ }
        oscRef.current = null;
      }
      if (audioRef.current) {
        try { audioRef.current.close(); } catch (e) { /* already closed */ }
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <g transform={`translate(${x}, ${y})`} data-component-id={id} data-type="buzzer-piezo" role="img"
       aria-label={`Buzzer Piezoelettrico ${id}${isOn ? `: attivo, ${frequency}Hz` : ''}`}>
      <rect x="-25" y="-25" width="50" height="50" fill="transparent" pointerEvents="all" onClick={onInteract} />

      {/* Main body circle — flat black, no 3D arc highlights */}
      <circle cx="0" cy="0" r="11.5" fill="var(--elab-hex-1a1a1a)"
        stroke="var(--elab-hex-0a0a0a)" strokeWidth="0.8" />

      {/* Outer metallic rim */}
      <circle cx="0" cy="0" r="11" fill="none"
        stroke="#888" strokeWidth="1.4" />
      {/* Inner metallic rim */}
      <circle cx="0" cy="0" r="9.5" fill="none"
        stroke="#666" strokeWidth="0.6" />

      {/* Sound grille — concentric rings, flat */}
      <circle cx="0" cy="0" r="7"   fill="none" stroke="var(--elab-hex-2d2d2d)" strokeWidth="0.6" />
      <circle cx="0" cy="0" r="5.5" fill="none" stroke="var(--elab-hex-282828)" strokeWidth="0.5" />
      <circle cx="0" cy="0" r="4.2" fill="none" stroke="var(--elab-hex-232323)" strokeWidth="0.4" />

      {/* Central sound hole */}
      <circle cx="0" cy="0" r="3" fill="var(--elab-hex-050505)" stroke="var(--elab-hex-0a0a0a)" strokeWidth="0.5" />

       {/* Leads */}
       <line x1="-3.75" y1="11.5" x2="-3.75" y2="22.5"
         stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />

       <line x1="3.75" y1="11.5" x2="3.75" y2="22.5"
         stroke="var(--elab-hex-9e9e9e)" strokeWidth="1.25" strokeLinecap="round" />

      {/* Visual ON indicator — sound wave rings */}
      {isOn && (
        <>
          <circle cx="0" cy="0" r="14" fill="none" stroke="var(--elab-hex-ff9800)" strokeWidth="1.2" opacity="0.5">
            <animate attributeName="r" values="14;18;14" dur="0.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.15;0.5" dur="0.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="18" fill="none" stroke="var(--elab-hex-ff9800)" strokeWidth="0.8" opacity="0.3">
            <animate attributeName="r" values="18;22;18" dur="0.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.05;0.3" dur="0.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="3" fill="var(--elab-hex-ff9800)" opacity="0.45">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="0.4s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* AI tutoring highlight */}
      {highlighted && (
        <rect x="-16" y="-20" width="32" height="50" rx="4"
          fill="none" stroke="var(--color-accent, var(--elab-lime))" strokeWidth="2" strokeDasharray="4 2">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
    </g>
  );
};

BuzzerPiezo.pins = [
  { id: 'positive', label: '+',       x: -3.75, y: 22.5, type: 'digital' },
  { id: 'negative', label: '\u2212',  x:  3.75, y: 22.5, type: 'digital' },
];

BuzzerPiezo.defaultState = { on: false, frequency: 2000 };

registerComponent('buzzer-piezo', {
  component: BuzzerPiezo,
  pins: BuzzerPiezo.pins,
  defaultState: BuzzerPiezo.defaultState,
  category: 'output',
  label: 'Cicalino Piezo',
  icon: '\u{1F50A}',
  volumeAvailableFrom: 1,
});

export default BuzzerPiezo;
