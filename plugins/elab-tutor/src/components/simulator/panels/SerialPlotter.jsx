/**
 * ELAB Simulator — Serial Plotter
 * Grafico real-time dei valori seriali (come Arduino IDE Serial Plotter)
 * Supporta multiple channels (CSV), auto-scaling Y, scrolling X
 * Design: matching VS Code terminal dark theme
 * (c) Andrea Marro — 12/02/2026, UI-7 polish 13/02/2026
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';

const CHANNEL_COLORS = ['var(--elab-lime)', '#3498DB', 'var(--elab-red)', 'var(--elab-orange)', '#9B59B6', '#1ABC9C'];
const MAX_POINTS = 200;
const PLOT_PADDING = { top: 12, right: 10, bottom: 20, left: 40 };

const SerialPlotter = ({ serialOutput = '', isRunning = false, onClear }) => {
  const canvasRef = useRef(null);
  const dataRef = useRef([]);
  const prevLinesRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [channelNames, setChannelNames] = useState([]);
  const animFrameRef = useRef(null);

  // Parse new lines from serialOutput
  useEffect(() => {
    if (paused) return;
    const lines = serialOutput.split('\n');
    const prevCount = prevLinesRef.current;

    if (lines.length > prevCount) {
      const newLines = lines.slice(prevCount);
      for (const line of newLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const parts = trimmed.split(/[,\t\s]+/).map(s => parseFloat(s)).filter(n => !isNaN(n));
        if (parts.length > 0) {
          dataRef.current.push({ values: parts, timestamp: Date.now() });
          if (parts.length > channelNames.length) {
            setChannelNames(prev => {
              const next = [...prev];
              while (next.length < parts.length) {
                next.push(`Ch${next.length + 1}`);
              }
              return next;
            });
          }
          if (dataRef.current.length > MAX_POINTS) {
            dataRef.current = dataRef.current.slice(-MAX_POINTS);
          }
        }
      }
    }
    prevLinesRef.current = lines.length;
  }, [serialOutput, paused, channelNames.length]);

  useEffect(() => {
    if (!serialOutput) {
      dataRef.current = [];
      prevLinesRef.current = 0;
      setChannelNames([]);
    }
  }, [serialOutput]);

  // Animation loop: redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const data = dataRef.current;

      // Clear with dark bg
      ctx.fillStyle = '#1e1e2e'; // palette
      ctx.fillRect(0, 0, w, h);

      const plotX = PLOT_PADDING.left;
      const plotY = PLOT_PADDING.top;
      const plotW = w - PLOT_PADDING.left - PLOT_PADDING.right;
      const plotH = h - PLOT_PADDING.top - PLOT_PADDING.bottom;

      if (data.length < 2) {
        ctx.fillStyle = '#6b7280'; // palette
        ctx.font = '11px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('In attesa di dati numerici...', w / 2, h / 2);
        animFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      let yMin = Infinity, yMax = -Infinity;
      for (const point of data) {
        for (const v of point.values) {
          if (v < yMin) yMin = v;
          if (v > yMax) yMax = v;
        }
      }
      const yRange = yMax - yMin || 1;
      yMin -= yRange * 0.1;
      yMax += yRange * 0.1;

      // Grid lines
      ctx.strokeStyle = '#313244'; // palette
      ctx.lineWidth = 0.5;
      const ySteps = 5;
      for (let i = 0; i <= ySteps; i++) {
        const gy = plotY + (plotH * i) / ySteps;
        ctx.beginPath();
        ctx.moveTo(plotX, gy);
        ctx.lineTo(plotX + plotW, gy);
        ctx.stroke();

        const yVal = yMax - ((yMax - yMin) * i) / ySteps;
        ctx.fillStyle = '#6b7280'; // palette
        ctx.font = '9px "Fira Code", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(yVal.toFixed(yVal % 1 === 0 ? 0 : 1), plotX - 4, gy + 3);
      }

      const numChannels = Math.max(...data.map(d => d.values.length));

      for (let ch = 0; ch < numChannels; ch++) {
        ctx.strokeStyle = CHANNEL_COLORS[ch % CHANNEL_COLORS.length];
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        let first = true;
        for (let i = 0; i < data.length; i++) {
          const val = data[i].values[ch];
          if (val === undefined) continue;
          const x = plotX + (plotW * i) / (data.length - 1);
          const y = plotY + plotH - ((val - yMin) / (yMax - yMin)) * plotH;
          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Plot border
      ctx.strokeStyle = '#45475a'; // palette
      ctx.lineWidth = 1;
      ctx.strokeRect(plotX, plotY, plotW, plotH);

      // Legend
      if (numChannels > 0) {
        let legendX = plotX + 4;
        const legendY = h - 4;
        ctx.font = '9px "Fira Code", monospace';
        ctx.textAlign = 'left';
        for (let ch = 0; ch < numChannels; ch++) {
          const color = CHANNEL_COLORS[ch % CHANNEL_COLORS.length];
          const name = channelNames[ch] || `Ch${ch + 1}`;
          const lastVal = data[data.length - 1]?.values[ch];
          const label = lastVal !== undefined ? `${name}: ${lastVal}` : name;

          ctx.fillStyle = color;
          ctx.fillRect(legendX, legendY - 7, 8, 8);
          ctx.fillStyle = '#cdd6f4'; // palette
          ctx.fillText(label, legendX + 11, legendY);
          legendX += ctx.measureText(label).width + 20;
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [channelNames]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, []);

  const handleClear = useCallback(() => {
    dataRef.current = [];
    prevLinesRef.current = 0;
    setChannelNames([]);
    if (onClear) onClear();
  }, [onClear]);

  return (
    <div style={S.panel}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={{
            ...S.statusDot,
            background: isRunning ? 'var(--color-accent)' : 'var(--color-code-comment)',
            boxShadow: isRunning ? '0 0 6px rgba(124,179,66,0.5)' : 'none',
          }} />
          <span style={S.headerTitle}>Serial Plotter</span>
        </div>
        <div style={S.controls}>
          {/* Pause/Resume */}
          <button
            onClick={() => setPaused(prev => !prev)}
            style={{
              ...S.iconBtn,
              background: paused ? 'rgba(229, 75, 61, 0.15)' : 'transparent',
              color: paused ? 'var(--color-vol3)' : 'var(--color-code-comment)',
              borderColor: paused ? 'rgba(229,75,61,0.3)' : 'var(--color-editor-border)',
            }}
            title={paused ? 'Riprendi' : 'Pausa'}
          >
            {paused ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 2L12 7L4 12V2Z" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="3" y="2" width="3" height="10" rx="1" fill="currentColor"/>
                <rect x="8" y="2" width="3" height="10" rx="1" fill="currentColor"/>
              </svg>
            )}
          </button>

          {/* Clear */}
          <button onClick={handleClear} style={S.iconBtn} title="Cancella dati">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Point count */}
          <span style={S.pointCount}>
            {dataRef.current.length} pt
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div style={S.canvasWrap}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

// ─── Styles (VS Code terminal dark) ───
const S = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flex: 1,
    background: 'var(--color-code-bg, #1E1E2E)',
    borderRadius: '0 0 10px 10px',
    overflow: 'hidden',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 14px',
    borderBottom: '1px solid var(--color-code-border, #313244)',
    background: 'var(--color-code-header, #181825)',
    flexWrap: 'wrap',
    gap: 6,
    minHeight: 44,
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    transition: 'all 300ms',
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-code-text, #CDD6F4)',
    fontFamily: 'var(--font-sans, "Open Sans", sans-serif)',
    whiteSpace: 'nowrap',
  },

  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },

  iconBtn: {
    background: 'transparent',
    border: '1px solid var(--color-editor-border, #374151)',
    borderRadius: 6,
    color: 'var(--color-code-comment, #6B7280)',
    fontSize: 14,
    padding: 0,
    cursor: 'pointer',
    lineHeight: 1,
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-fast, all 150ms)',
  },

  pointCount: {
    fontSize: 14,
    fontFamily: 'var(--font-mono, "Fira Code", monospace)',
    color: 'var(--color-code-comment, #6B7280)',
  },

  canvasWrap: {
    flex: 1,
    minHeight: 60,
    position: 'relative',
  },
};

export default SerialPlotter;
